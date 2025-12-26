import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import JobPosting from "@/models/JobPosting";

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

// GET - Fetch a single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const job = await JobPosting.findById(id).lean();
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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
        applicants: job.applicants?.length || 0,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching job" },
      { status: 500 }
    );
  }
}

// PUT - Update a job posting
export async function PUT(
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

    // Find the job and verify ownership
    const existingJob = await JobPosting.findById(id);
    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    if (existingJob.recruiterId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to edit this job" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      location,
      salary,
      description,
      requiredSkills,
      type,
      status,
    } = body;

    // Parse salary string
    let salaryObj = existingJob.salary;
    if (salary) {
      const salaryMatch = salary.match(/\$?(\d+)k?\s*-\s*\$?(\d+)k?/i);
      if (salaryMatch) {
        salaryObj = {
          min:
            parseInt(salaryMatch[1]) *
            (salary.toLowerCase().includes("k") ? 1000 : 1),
          max:
            parseInt(salaryMatch[2]) *
            (salary.toLowerCase().includes("k") ? 1000 : 1),
          currency: "USD",
        };
      }
    }

    const updatedJob = await JobPosting.findByIdAndUpdate(
      id,
      {
        title: title || existingJob.title,
        location: location || existingJob.location,
        type: type || existingJob.type,
        description: description || existingJob.description,
        requirements: requiredSkills
          ? Array.isArray(requiredSkills)
            ? requiredSkills
            : requiredSkills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
          : existingJob.requirements,
        salary: salaryObj,
        status: status || existingJob.status,
      },
      { new: true }
    );

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, message: "Failed to update job" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: {
        id: updatedJob._id.toString(),
        title: updatedJob.title,
        company: updatedJob.company,
        location: updatedJob.location,
        type: updatedJob.type,
        description: updatedJob.description,
        requirements: updatedJob.requirements,
        salary: updatedJob.salary,
        status: updatedJob.status,
        createdAt: updatedJob.createdAt,
        updatedAt: updatedJob.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, message: "Error updating job" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a job posting
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

    // Find the job and verify ownership
    const existingJob = await JobPosting.findById(id);
    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    if (existingJob.recruiterId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to delete this job" },
        { status: 403 }
      );
    }

    await JobPosting.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting job" },
      { status: 500 }
    );
  }
}
