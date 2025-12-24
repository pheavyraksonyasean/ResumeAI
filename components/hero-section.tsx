"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="py-24 px-8 text-center max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white text-balance">
        AI-Powered Resume Analysis & Job Matching
      </h1>
      <p className="text-xl text-gray-400 mb-8 text-balance max-w-2xl mx-auto leading-relaxed">
        Analyze your resume, match with perfect job opportunities, and get
        AI-driven suggestions to improve your chances of landing your dream job.
      </p>
      <Link href="/auth/signin">
        <Button className="bg-green-500 hover:bg-green-600 text-black font-medium text-lg px-8 py-6">
          Start Analyzing
        </Button>
      </Link>
    </section>
  );
}
