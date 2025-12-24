"use client";

import type React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon } from "@/components/icons";

export default function SignUp() {
  const router = useRouter();
  const [userType, setUserType] = useState<"seeker" | "recruiter">("seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log("Sign up with:", { email, password, userType });

    // Redirect based on user type
    if (userType === "seeker") {
      router.push("/dashboard/upload");
    } else if (userType === "recruiter") {
      router.push("/recruiter/postings");
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Link
        href="/"
        className="flex items-center gap-2 p-6 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back</span>
      </Link>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="bg-zinc-950 border-zinc-800 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-black">
                🧠
              </div>
              <span className="text-2xl font-semibold">ResumeAI</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Create Account
            </h2>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I am a
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("seeker")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    userType === "seeker"
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "bg-zinc-900 text-white border border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("recruiter")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    userType === "recruiter"
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "bg-zinc-900 text-white border border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  Recruiter
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-black font-medium py-6"
            >
              Sign Up
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-green-500 hover:text-green-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
