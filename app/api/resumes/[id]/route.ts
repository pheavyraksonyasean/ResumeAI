import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Resume from "@/models/Resume";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

// GET - Fetch a single resume (with file data for download)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const resume = await Resume.findById(id).lean();
    if (!resume) {
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (resume.userId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume._id.toString(),
        fileName: resume.fileName,
        fileData: resume.fileData,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        status: resume.status,
        analysisScore: resume.analysisScore,
        parsedContent: resume.parsedContent,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching resume" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const resume = await Resume.findById(id);
    if (!resume) {
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (resume.userId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    await Resume.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting resume" },
      { status: 500 }
    );
  }
}
