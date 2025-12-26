"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/icons";

export default function ConfirmEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
          setUserRole(data.user?.role);

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            if (data.user?.role === "recruiter") {
              router.push("/recruiter/postings");
            } else {
              router.push("/dashboard/upload");
            }
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, router]);

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
        <Card className="bg-zinc-950 border-zinc-800 w-full max-w-md p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-black">
              🧠
            </div>
            <span className="text-2xl font-semibold">ResumeAI</span>
          </div>

          {status === "loading" && (
            <>
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-400">
                Please wait while we confirm your account.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting you automatically...
              </p>
              <Button
                onClick={() => {
                  if (userRole === "recruiter") {
                    router.push("/recruiter/postings");
                  } else {
                    router.push("/dashboard/upload");
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-black font-medium"
              >
                Continue to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="space-y-3">
                <Link href="/auth/signup">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-medium">
                    Try signing up again
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
