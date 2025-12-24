"use client";

import { Card } from "@/components/ui/card";
import { CheckIcon } from "@/components/icons";

const jobSeekerFeatures = [
  "Upload and analyze your resume instantly",
  "View job matches with compatibility scores",
  "Get personalized improvement suggestions",
  "Track skills and experience gaps",
];

const recruiterFeatures = [
  "Post job openings with detailed descriptions",
  "View AI-matched candidates automatically",
  "Download candidate resumes",
  "Save time with smart candidate filtering",
];

export default function UserSegments() {
  return (
    <section className="py-16 px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-950 border-zinc-800 p-8">
          <h3 className="text-2xl font-semibold mb-6 text-white">
            For Job Seekers
          </h3>
          <ul className="space-y-4">
            {jobSeekerFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-8">
          <h3 className="text-2xl font-semibold mb-6 text-white">
            For Recruiters
          </h3>
          <ul className="space-y-4">
            {recruiterFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
