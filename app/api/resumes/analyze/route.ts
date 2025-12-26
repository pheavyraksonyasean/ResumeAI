import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Resume from "@/models/Resume";
import {
  analyzeResumeWithBackend,
  BackendResumeAnalysis,
} from "@/lib/backend-analyzer";

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

// POST - Analyze the user's resume with backend analysis (no AI required)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the user's resume
    const resume = await Resume.findOne({ userId: user.userId });
    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          message: "No resume found. Please upload a resume first.",
        },
        { status: 404 }
      );
    }

    // Check if already analyzing
    if (resume.status === "analyzing") {
      return NextResponse.json(
        { success: false, message: "Resume is already being analyzed" },
        { status: 400 }
      );
    }

    // Update status to analyzing
    resume.status = "analyzing";
    await resume.save();

    try {
      console.log("Starting backend analysis for:", resume.fileName);

      // Analyze with backend (no AI required)
      const analysis: BackendResumeAnalysis = await analyzeResumeWithBackend(
        resume.fileData,
        resume.fileName
      );

      // Update resume with analysis results
      resume.analysisScore = analysis.atsScore;
      resume.parsedContent = {
        skills: [
          ...analysis.skills.technical,
          ...analysis.skills.tools,
          ...analysis.skills.soft,
        ],
        experience: analysis.experience.map(
          (exp) => `${exp.title} at ${exp.company} (${exp.duration})`
        ),
        education: analysis.education.map(
          (edu) => `${edu.degree}, ${edu.institution} (${edu.year})`
        ),
        summary: analysis.summary,
      };
      resume.status = "completed";

      // Store full analysis
      resume.fullAnalysis = analysis;

      await resume.save();

      console.log("Backend analysis completed. ATS Score:", analysis.atsScore);

      return NextResponse.json({
        success: true,
        message: "Resume analyzed successfully",
        analysis,
        source: "backend",
      });
    } catch (analysisError) {
      // If analysis fails, update status
      resume.status = "failed";
      await resume.save();
      throw analysisError;
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error analyzing resume",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - Get the analysis results for the user's resume
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

    const resume = await Resume.findOne({ userId: user.userId })
      .select("-fileData")
      .lean();

    if (!resume) {
      return NextResponse.json(
        { success: false, message: "No resume found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume._id.toString(),
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        status: resume.status,
        analysisScore: resume.analysisScore,
        parsedContent: resume.parsedContent,
        fullAnalysis: resume.fullAnalysis || null,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching analysis" },
      { status: 500 }
    );
  }
}
