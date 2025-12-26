import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import JobPosting from "@/models/JobPosting";
import User from "@/models/User";
import Notification from "@/models/Notification";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// POST - Apply to a job (job seeker)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      email: string;
      role: string;
    };

    // Only candidates can apply
    if (decoded.role !== "candidate") {
      return NextResponse.json(
        { success: false, message: "Only job seekers can apply to jobs" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get the job posting
    const job = await JobPosting.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(decoded.userId);

    // Check if already applied
    if (
      job.applicants.some((applicantId) => applicantId.equals(userObjectId))
    ) {
      return NextResponse.json(
        { success: false, message: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Get the applicant's info
    const applicant = await User.findById(decoded.userId);
    if (!applicant) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Add applicant to job's applicants array
    job.applicants.push(userObjectId);
    await job.save();

    // Create notification for the recruiter
    const notification = new Notification({
      recipientId: job.recruiterId,
      senderId: decoded.userId,
      jobId: job._id,
      type: "application",
      title: "New Job Application",
      message: `${applicant.name} has applied for the position of ${job.title}`,
      senderName: applicant.name,
      senderEmail: applicant.email,
      jobTitle: job.title,
      isRead: false,
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
