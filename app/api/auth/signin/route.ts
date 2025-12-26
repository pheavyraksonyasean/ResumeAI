import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SKIP_EMAIL_VERIFICATION = process.env.SKIP_EMAIL_VERIFICATION === "true";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("[Signin] Starting...");
    
    const dbStart = Date.now();
    await dbConnect();
    console.log(`[Signin] DB Connect: ${Date.now() - dbStart}ms`);

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide email and password" },
        { status: 400 }
      );
    }

    // Find user by email
    const findStart = Date.now();
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(`[Signin] Find user: ${Date.now() - findStart}ms`);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const bcryptStart = Date.now();
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[Signin] bcrypt compare: ${Date.now() - bcryptStart}ms`);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if email is verified (skip if SKIP_EMAIL_VERIFICATION is true)
    if (!SKIP_EMAIL_VERIFICATION && !user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your email before signing in. Check your inbox for the verification link.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Signed in successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log(`[Signin] Total time: ${Date.now() - startTime}ms`);
    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error signing in",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
