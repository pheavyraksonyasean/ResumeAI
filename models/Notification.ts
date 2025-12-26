import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId; // Recruiter who receives the notification
  senderId: mongoose.Types.ObjectId; // Job seeker who applied
  jobId: mongoose.Types.ObjectId; // Job that was applied to
  type: "application" | "message" | "system";
  title: string;
  message: string;
  senderName: string;
  senderEmail: string;
  jobTitle: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    type: {
      type: String,
      enum: ["application", "message", "system"],
      default: "application",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// Index for efficient queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
