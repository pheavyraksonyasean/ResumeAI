"use client";

import type React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUp() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [userType, setUserType] = useState<"seeker" | "recruiter">("seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: userType === "seeker" ? "candidate" : "recruiter",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      // Show success message for email verification
      if (data.requiresVerification) {
        setSuccess(data.message);
        setIsLoading(false);
        return;
      }

      // Refresh the auth context so dashboard can see the user
      await refreshUser();

      // Redirect based on selected user type
      if (userType === "recruiter") {
        router.push("/recruiter/postings");
      } else {
        router.push("/dashboard/upload");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
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
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">Check your email!</span>
                </div>
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500"
                required
              />
            </div>

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
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-medium py-6 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
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
