"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Icon } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-green-500">
          <Brain />
        </div>
        <span className="text-xl font-semibold">ResumeAI</span>
      </Link>
      <Link href="/auth/signin">
        <Button className="bg-green-500 hover:bg-green-600 text-black font-medium">
          Get Started
        </Button>
      </Link>
    </header>
  );
}
