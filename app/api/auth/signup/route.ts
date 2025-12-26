import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SKIP_EMAIL_VERIFICATION = process.env.SKIP_EMAIL_VERIFICATION === "true";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, name, role } = await request.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If user exists but not verified and we're not skipping verification
      if (!existingUser.emailVerified && !SKIP_EMAIL_VERIFICATION) {
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        existingUser.emailVerificationToken = verificationToken;
        existingUser.emailVerificationExpires = verificationExpires;
        await existingUser.save();

        try {
          await sendVerificationEmail(existingUser.email, verificationToken);
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
        }

        return NextResponse.json(
          {
            success: true,
            message: "Verification email resent. Please check your inbox.",
            requiresVerification: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user - if skipping verification, mark as verified
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role === "recruiter" ? "recruiter" : "candidate",
      emailVerified: SKIP_EMAIL_VERIFICATION,
      emailVerificationToken: SKIP_EMAIL_VERIFICATION
        ? null
        : verificationToken,
      emailVerificationExpires: SKIP_EMAIL_VERIFICATION
        ? null
        : verificationExpires,
    });

    // If skipping email verification (development mode), auto-login
    if (SKIP_EMAIL_VERIFICATION) {
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json(
        {
          success: true,
          message: "Account created successfully!",
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Still return success but with a warning
      return NextResponse.json(
        {
          success: true,
          message:
            "Account created but we couldn't send the verification email. Please contact support.",
          requiresVerification: true,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created! Please check your email to verify your account.",
        requiresVerification: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
