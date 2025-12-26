import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Get all notifications for the current user
export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await connectDB();

    // Get notifications for this user
    const notifications = await Notification.find({
      recipientId: decoded.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Count unread
    const unreadCount = await Notification.countDocuments({
      recipientId: decoded.userId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        senderName: n.senderName,
        senderEmail: n.senderEmail,
        jobTitle: n.jobTitle,
        jobId: n.jobId.toString(),
        senderId: n.senderId.toString(),
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { notificationIds, markAll } = await request.json();

    await connectDB();

    if (markAll) {
      // Mark all notifications as read
      await Notification.updateMany(
        { recipientId: decoded.userId, isRead: false },
        { isRead: true }
      );
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          recipientId: decoded.userId,
        },
        { isRead: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
