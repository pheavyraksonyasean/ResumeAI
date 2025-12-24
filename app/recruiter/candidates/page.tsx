"use client";

import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function MatchedCandidatesPage() {
  const candidates = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      appliedFor: "Senior Frontend Developer",
      matchScore: 92,
      experience: "5 years as Frontend Developer",
      education: "B.S. Computer Science",
      skills: ["React", "TypeScript", "JavaScript", "CSS", "Git", "Node.js"],
      atsScore: 85,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      appliedFor: "Senior Frontend Developer",
      matchScore: 88,
      experience: "4 years as Web Developer",
      education: "M.S. Software Engineering",
      skills: ["React", "JavaScript", "HTML", "CSS", "Redux", "Webpack"],
      atsScore: 78,
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "mchen@email.com",
      appliedFor: "Full Stack Developer",
      matchScore: 85,
      experience: "6 years as Full Stack Developer",
      education: "B.S. Computer Engineering",
      skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "AWS"],
      atsScore: 82,
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      appliedFor: "Backend Engineer",
      matchScore: 90,
      experience: "5 years as Backend Engineer",
      education: "B.S. Computer Science",
      skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis", "AWS"],
      atsScore: 88,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Matched Candidates</h1>
        <p className="text-gray-400">
          AI-matched candidates for your job postings
        </p>
      </div>

      {/* Candidates List */}
      <div className="space-y-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="rounded-lg border border-gray-800 bg-gray-900/50 p-6"
          >
            {/* Candidate Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{candidate.name}</h2>
                <p className="text-gray-400 text-sm mb-2">{candidate.email}</p>
                <p className="text-gray-500 text-sm">
                  Applied for: {candidate.appliedFor}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {candidate.matchScore}
                </div>
                <div className="text-sm text-gray-400">Match Score</div>
              </div>
            </div>

            {/* Match Progress */}
            <div className="mb-4">
              <Progress value={candidate.matchScore} className="h-2" />
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Experience</p>
                <p className="text-white">{candidate.experience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Education</p>
                <p className="text-white">{candidate.education}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-400">Skills</span>
                <span className="text-sm text-gray-500">
                  • ATS Score: {candidate.atsScore}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-green-600/20 border border-green-600/50 px-3 py-1 text-xs text-green-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                <Mail size={18} />
                Contact Candidate
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 bg-transparent flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download Resume
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
