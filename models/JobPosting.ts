import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobPosting extends Document {
  recruiterId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  status: "active" | "closed" | "draft";
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const JobPostingSchema: Schema = new Schema(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "remote"],
      default: "full-time",
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    requirements: [String],
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    applicants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    collection: "job-posting",
  }
);

const JobPosting: Model<IJobPosting> =
  mongoose.models.JobPosting ||
  mongoose.model<IJobPosting>("JobPosting", JobPostingSchema);

export default JobPosting;
