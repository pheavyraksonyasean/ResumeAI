import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import JobPosting from "@/models/JobPosting";
import User from "@/models/User";

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

// GET - Fetch all jobs for the recruiter
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

    // Get jobs for this recruiter
    const jobs = await JobPosting.find({ recruiterId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => ({
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        status: job.status,
        applicants: job.applicants?.length || 0,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching jobs" },
      { status: 500 }
    );
  }
}

// POST - Create a new job posting
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "recruiter") {
      return NextResponse.json(
        { success: false, message: "Only recruiters can post jobs" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get recruiter's info for company name
    const recruiter = await User.findById(user.userId);

    const body = await request.json();
    const { title, location, salary, description, requiredSkills, type } = body;

    // Parse salary string like "$100k - $140k" into min/max
    let salaryObj = { min: 0, max: 0, currency: "USD" };
    if (salary) {
      const salaryMatch = salary.match(/\$?(\d+)k?\s*-\s*\$?(\d+)k?/i);
      if (salaryMatch) {
        salaryObj.min =
          parseInt(salaryMatch[1]) *
          (salary.toLowerCase().includes("k") ? 1000 : 1);
        salaryObj.max =
          parseInt(salaryMatch[2]) *
          (salary.toLowerCase().includes("k") ? 1000 : 1);
      }
    }

    const job = await JobPosting.create({
      recruiterId: user.userId,
      title,
      company: recruiter?.name || "Company",
      location,
      type: type || "full-time",
      description,
      requirements: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      salary: salaryObj,
      status: "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully",
        job: {
          id: job._id.toString(),
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements,
          salary: job.salary,
          status: job.status,
          createdAt: job.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
