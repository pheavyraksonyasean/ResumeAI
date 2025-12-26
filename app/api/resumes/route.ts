import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Resume from "@/models/Resume";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

// GET - Fetch all resumes for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const resumes = await Resume.find({ userId: user.userId })
      .select("-fileData") // Don't send file data in list
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      resumes: resumes.map((resume) => ({
        id: resume._id.toString(),
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        status: resume.status,
        analysisScore: resume.analysisScore,
        parsedContent: resume.parsedContent,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching resumes" },
      { status: 500 }
    );
  }
}

// POST - Upload a new resume
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "candidate") {
      return NextResponse.json(
        { success: false, message: "Only job seekers can upload resumes" },
        { status: 403 }
      );
    }

    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // Check if user already has a resume and delete it (one resume per user)
    await Resume.deleteMany({ userId: user.userId });

    // Create new resume
    const resume = await Resume.create({
      userId: user.userId,
      fileName: file.name,
      fileData: base64Data,
      fileSize: file.size,
      mimeType: file.type,
      status: "pending",
      parsedContent: {
        skills: [],
        experience: [],
        education: [],
        summary: "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Resume uploaded successfully",
        resume: {
          id: resume._id.toString(),
          fileName: resume.fileName,
          fileSize: resume.fileSize,
          status: resume.status,
          createdAt: resume.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading resume",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
