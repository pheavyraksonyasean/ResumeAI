import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Get a candidate's resume by their userId (for recruiters)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;

    // Get auth token
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    // Only recruiters can view candidate resumes
    if (decoded.role !== "recruiter") {
      return NextResponse.json(
        {
          success: false,
          message: "Only recruiters can view candidate resumes",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Get the candidate's resume
    const resume = await Resume.findOne({ userId: candidateId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    if (!resume) {
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 }
      );
    }

    // Return resume data including the PDF
    return NextResponse.json({
      success: true,
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileData: resume.fileData, // Base64 encoded PDF
        mimeType: resume.mimeType,
        fileSize: resume.fileSize,
        candidate: {
          id: (resume.userId as any)._id,
          name: (resume.userId as any).name,
          email: (resume.userId as any).email,
        },
        analysis: resume.fullAnalysis,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Error getting candidate resume:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
