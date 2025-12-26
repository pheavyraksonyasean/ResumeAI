"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Brain, Loader2 } from "lucide-react";
import type React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { NotificationDropdown } from "@/components/notification-dropdown";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
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
    { name: "Job Postings", href: "/recruiter/postings" },
    { name: "Matched Candidates", href: "/recruiter/candidates" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl text-green-500">
              <Brain />
            </div>
            <span className="text-xl font-semibold">ResumeAI</span>
            <span className="text-gray-500">| Recruiter Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Welcome, <span className="text-white">{user.name}</span>
            </div>
            <NotificationDropdown />
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
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
