import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import JobPosting from "@/models/JobPosting";
import { matchResumeWithJobs } from "@/lib/job-matcher";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Get matched jobs for the current user
export async function GET() {
  try {
    // Get auth token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    await connectDB();

    // Get user's resume with analysis
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          message: "No resume found. Please upload your resume first.",
          matches: [],
        },
        { status: 200 }
      );
    }

    if (!resume.fullAnalysis) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resume not analyzed yet. Please wait for analysis to complete.",
          matches: [],
        },
        { status: 200 }
      );
    }

    // Get all active job postings
    const jobs = await JobPosting.find({ status: "active" }).sort({
      createdAt: -1,
    });

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No job postings available yet.",
        matches: [],
        stats: {
          totalMatches: 0,
          highMatches: 0,
          mediumMatches: 0,
          lowMatches: 0,
          avgMatchScore: 0,
        },
      });
    }

    // Calculate matches
    const matches = matchResumeWithJobs(resume.fullAnalysis, jobs);

    // Calculate stats
    const highMatches = matches.filter((m) => m.matchType === "High").length;
    const mediumMatches = matches.filter(
      (m) => m.matchType === "Medium"
    ).length;
    const lowMatches = matches.filter((m) => m.matchType === "Low").length;
    const avgMatchScore =
      matches.length > 0
        ? Math.round(
            matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      matches,
      stats: {
        totalMatches: matches.length,
        highMatches,
        mediumMatches,
        lowMatches,
        avgMatchScore,
      },
    });
  } catch (error) {
    console.error("Error getting job matches:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
