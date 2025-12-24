"use client";

import { Card } from "@/components/ui/card";
import {
  DocumentTextIcon,
  TargetIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  BrainIcon,
} from "@/components/icons";

const features = [
  {
    icon: DocumentTextIcon,
    title: "Resume Analysis",
    description:
      "AI extracts skills, experience, and education from your resume in seconds",
  },
  {
    icon: TargetIcon,
    title: "Job Matching",
    description:
      "Get matched with relevant jobs and see compatibility scores (0-100%)",
  },
  {
    icon: SparklesIcon,
    title: "Smart Suggestions",
    description:
      "Receive personalized tips to improve your resume and fill skill gaps",
  },
  {
    icon: ShieldCheckIcon,
    title: "ATS Compatible",
    description:
      "Check if your resume is compatible with Applicant Tracking Systems",
  },
  {
    icon: TrendingUpIcon,
    title: "Skill Insights",
    description:
      "Identify missing skills and trending competencies in your field",
  },
  {
    icon: BrainIcon,
    title: "AI-Powered",
    description:
      "Leveraging advanced AI to provide accurate analysis and recommendations",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-16 px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card
              key={index}
              className="bg-zinc-950 border-zinc-800 p-6 hover:border-green-500/30 transition-colors"
            >
              <IconComponent className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
