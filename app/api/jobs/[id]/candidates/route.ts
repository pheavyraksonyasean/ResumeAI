import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import JobPosting from "@/models/JobPosting";
import { matchJobWithResumes } from "@/lib/job-matcher";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Get matched candidates for a specific job posting
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

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
    const recruiterId = decoded.userId;

    await connectDB();

    // Get the job posting and verify ownership
    const job = await JobPosting.findById(jobId);

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job posting not found" },
        { status: 404 }
      );
    }

    if (job.recruiterId.toString() !== recruiterId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized to view candidates for this job",
        },
        { status: 403 }
      );
    }

    // Get all resumes with analysis
    const resumes = await Resume.find({
      fullAnalysis: { $exists: true },
      status: "completed",
    }).populate("userId", "name email");

    if (resumes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No candidates with analyzed resumes yet.",
        candidates: [],
        stats: {
          totalCandidates: 0,
          highMatches: 0,
          mediumMatches: 0,
          lowMatches: 0,
        },
      });
    }

    // Format resumes for matching
    const resumesForMatching = resumes
      .filter((r) => r.userId && r.fullAnalysis)
      .map((r) => ({
        userId: r.userId._id.toString(),
        userName: (r.userId as any).name || "Unknown",
        userEmail: (r.userId as any).email || "",
        analysis: r.fullAnalysis!,
      }));

    // Calculate matches
    const candidates = matchJobWithResumes(job, resumesForMatching);

    // Calculate stats
    const highMatches = candidates.filter((c) => c.matchType === "High").length;
    const mediumMatches = candidates.filter(
      (c) => c.matchType === "Medium"
    ).length;
    const lowMatches = candidates.filter((c) => c.matchType === "Low").length;

    return NextResponse.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
      },
      candidates,
      stats: {
        totalCandidates: candidates.length,
        highMatches,
        mediumMatches,
        lowMatches,
      },
    });
  } catch (error) {
    console.error("Error getting matched candidates:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
