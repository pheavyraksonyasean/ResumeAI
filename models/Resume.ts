import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResumeAnalysis {
  atsScore: number;
  summary: string;
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  experience: {
    title: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  keywords: {
    keyword: string;
    count: number;
    importance: "high" | "medium" | "low";
  }[];
  improvements: string[];
  strengths: string[];
  yearsOfExperience: number;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileData: string; // Base64 encoded PDF
  fileSize: number;
  mimeType: string;
  parsedContent: {
    skills: string[];
    experience: string[];
    education: string[];
    summary: string;
  };
  analysisScore: number;
  fullAnalysis?: IResumeAnalysis;
  status: "pending" | "analyzing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: [true, "Please provide a file name"],
    },
    fileData: {
      type: String,
      required: [true, "Please provide file data"],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    parsedContent: {
      skills: [String],
      experience: [String],
      education: [String],
      summary: String,
    },
    analysisScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },
    fullAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "resumes",
  }
);

const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;
