"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Brain, Loader2, Lock } from "lucide-react";
import type React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { ResumeProvider, useResume } from "@/contexts/ResumeContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { resume, loading: resumeLoading } = useResume();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [authLoading, user, router]);

  // Redirect from analysis if no resume
  useEffect(() => {
    if (!resumeLoading && !resume && pathname === "/dashboard/analysis") {
      router.push("/dashboard/upload");
    }
  }, [resumeLoading, resume, pathname, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading || resumeLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { name: "Upload Resume", href: "/dashboard/upload", requiresResume: false },
    { name: "Analysis", href: "/dashboard/analysis", requiresResume: true },
    { name: "Job Matches", href: "/dashboard/matches", requiresResume: false },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl text-green-500">
              <Brain />
            </div>
            <span className="text-xl font-semibold">ResumeAI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Welcome, <span className="text-white">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="mx-auto flex max-w-8xl px-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const isDisabled = tab.requiresResume && !resume;

            if (isDisabled) {
              return (
                <div
                  key={tab.href}
                  className="flex items-center gap-2 border-b-2 border-transparent px-4 py-4 text-gray-600 cursor-not-allowed"
                  title="Upload a resume first to access this feature"
                >
                  <Lock size={14} />
                  {tab.name}
                </div>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 transition ${
                  isActive
                    ? "border-green-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <span></span>
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </main>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResumeProvider>
      <DashboardContent>{children}</DashboardContent>
    </ResumeProvider>
  );
}
