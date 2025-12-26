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

export default function SignIn() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [userType, setUserType] = useState<"seeker" | "recruiter">("seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Refresh the auth context so dashboard can see the user
      await refreshUser();

      // Redirect based on selected user type (what user chose on form)
      // This allows users to switch between dashboards if they have multiple roles
      if (userType === "seeker") {
        router.push("/dashboard/upload");
      } else if (userType === "recruiter") {
        router.push("/recruiter/postings");
      } else {
        // Fallback: use the role from backend
        if (data.user.role === "candidate") {
          router.push("/dashboard/upload");
        } else {
          router.push("/recruiter/postings");
        }
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
            <h2 className="text-2xl font-semibold text-white">Sign In</h2>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-green-500 hover:text-green-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
