"use client";

import { AlertCircle, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <div className="text-sm text-gray-400">📄 Untitled document.pdf</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">ATS Score</p>
          <p className="text-4xl font-bold text-yellow-400">78%</p>
        </div>
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Skills Found</p>
          <p className="text-4xl font-bold text-green-400">10</p>
        </div>
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Years Experience</p>
          <p className="text-4xl font-bold text-green-400">5+</p>
        </div>
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Improvement Areas</p>
          <p className="text-4xl font-bold text-yellow-400">5</p>
        </div>
      </div>

      {/* ATS Compatibility Score */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            ATS Compatibility Score
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">78</div>
            <div className="text-sm text-gray-400">%</div>
          </div>
        </div>
        <Progress value={78} className="mb-4" />
        <p className="text-gray-400">
          Good, but there's room for improvement to pass ATS filters.
        </p>
      </div>

      {/* Keyword Density Analysis */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-green-400" />
          Keyword Density Analysis
        </h2>
        <div className="space-y-6">
          {[
            { keyword: "JavaScript", density: 12, total: 15 },
            { keyword: "React", density: 18, total: 15, recommended: true },
            { keyword: "Node.js", density: 8, total: 10 },
            { keyword: "TypeScript", density: 6, total: 8 },
            { keyword: "Team Collaboration", density: 3, total: 5 },
          ].map((item) => (
            <div key={item.keyword}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">{item.keyword}</span>
                <span className="text-sm text-gray-400">
                  {item.density} / {item.total}
                  {item.recommended && (
                    <span className="ml-2 text-green-400">(recommended)</span>
                  )}
                </span>
              </div>
              <Progress
                value={(item.density / item.total) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skills by Category */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Zap size={20} className="text-green-400" />
          Skills by Category
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-gray-300 mb-3">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript",
                "React",
                "Node.js",
                "TypeScript",
                "Python",
                "SQL",
                "MongoDB",
              ].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-gray-300 mb-3">Tools & Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {["Git", "REST APIs"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-gray-300 mb-3">Methodologies</h3>
            <div className="flex flex-wrap gap-2">
              {["Agile"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Experience and Education */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-400" />
            Experience
          </h2>
          <ul className="space-y-3">
            {[
              "Software Developer at TechCorp (2022-2024)",
              "Frontend Intern at StartupXYZ (2021-2022)",
              "Freelance Web Developer (2020-2021)",
            ].map((exp) => (
              <li key={exp} className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 mt-1">✓</span>
                {exp}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Zap size={18} className="text-green-400" />
            Education
          </h2>
          <ul className="space-y-3">
            {[
              "B.S. Computer Science, State University (2018-2022)",
              "Certified AWS Solutions Architect (2023)",
            ].map((edu) => (
              <li key={edu} className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 mt-1">✓</span>
                {edu}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-yellow-400" />
          Improvement Suggestions
        </h2>
        <ul className="space-y-3">
          {[
            'Add more quantifiable achievements (e.g., "Increased performance by 40%")',
            "Include keywords from job descriptions you're targeting",
            "Add a professional summary at the top of your resume",
            "Consider adding certifications relevant to your field",
            "Use consistent date formatting throughout",
          ].map((suggestion, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-300">
              <AlertCircle
                size={16}
                className="text-yellow-400 mt-1 flex-shrink-0"
              />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
