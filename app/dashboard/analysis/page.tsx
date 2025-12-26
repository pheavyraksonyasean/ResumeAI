"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Zap,
  Loader2,
  FileText,
  Upload,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  experience: {
    title: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  keywords: {
    keyword: string;
    count: number;
    importance: "high" | "medium" | "low";
  }[];
  improvements: string[];
  strengths: string[];
  yearsOfExperience: number;
}

interface ResumeData {
  id: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "analyzing" | "completed" | "failed";
  analysisScore: number;
  fullAnalysis: ResumeAnalysis | null;
  createdAt: string;
}

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch("/api/resumes/analyze");
      const data = await response.json();

      if (data.success) {
        setResume(data.resume);
      } else if (response.status !== 404) {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch analysis data");
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/resumes/analyze", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Refresh the data
        await fetchAnalysis();
      } else {
        setError(data.message || "Failed to analyze resume");
      }
    } catch (err) {
      setError("An error occurred while analyzing the resume");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  // No resume uploaded
  if (!resume) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Upload size={64} className="mx-auto text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Resume Found</h2>
          <p className="text-gray-400 mb-6">
            Upload your resume first to get an AI-powered analysis
          </p>
          <Link href="/dashboard/upload">
            <Button className="bg-green-600 hover:bg-green-700">
              Upload Resume
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Resume is being analyzed
  if (resume.status === "analyzing" || analyzing) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Loader2
            size={64}
            className="mx-auto text-green-500 animate-spin mb-4"
          />
          <h2 className="text-xl font-semibold mb-2">Analyzing Your Resume</h2>
          <p className="text-gray-400">
            Our AI is reviewing your resume. This may take a moment...
          </p>
        </div>
      </div>
    );
  }

  // Resume uploaded but not analyzed yet
  if (resume.status === "pending" || !resume.fullAnalysis) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FileText className="text-green-500" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">{resume.fileName}</h3>
              <p className="text-sm text-gray-400">
                Uploaded {new Date(resume.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-gray-400 mb-6">
            Your resume is ready to be analyzed. Click the button below to start
            the AI-powered analysis.
          </p>

          <Button
            onClick={startAnalysis}
            className="bg-green-600 hover:bg-green-700"
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Analyze Resume with AI
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Analysis failed
  if (resume.status === "failed") {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
          <p className="text-gray-400 mb-6">
            Something went wrong while analyzing your resume. Please try again.
          </p>
          <Button
            onClick={startAnalysis}
            className="bg-green-600 hover:bg-green-700"
          >
            Retry Analysis
          </Button>
        </div>
      </div>
    );
  }

  const analysis = resume.fullAnalysis;

  // Analysis complete - show results
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">📄 {resume.fileName}</div>
          <Button
            onClick={startAnalysis}
            variant="outline"
            size="sm"
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Re-analyze"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className={`rounded-lg border p-6 ${
            analysis.atsScore >= 80
              ? "border-green-600/30 bg-green-600/10"
              : analysis.atsScore >= 60
              ? "border-yellow-600/30 bg-yellow-600/10"
              : "border-red-600/30 bg-red-600/10"
          }`}
        >
          <p className="text-sm text-gray-400 mb-2">ATS Score</p>
          <p
            className={`text-4xl font-bold ${
              analysis.atsScore >= 80
                ? "text-green-400"
                : analysis.atsScore >= 60
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {analysis.atsScore}%
          </p>
        </div>
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Skills Found</p>
          <p className="text-4xl font-bold text-green-400">
            {analysis.skills.technical.length +
              analysis.skills.tools.length +
              analysis.skills.soft.length}
          </p>
        </div>
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Years Experience</p>
          <p className="text-4xl font-bold text-green-400">
            {analysis.yearsOfExperience}+
          </p>
        </div>
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-6">
          <p className="text-sm text-gray-400 mb-2">Improvement Areas</p>
          <p className="text-4xl font-bold text-yellow-400">
            {analysis.improvements.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
        <p className="text-gray-300">{analysis.summary}</p>
      </div>

      {/* ATS Compatibility Score */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            ATS Compatibility Score
          </h2>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${
                analysis.atsScore >= 80
                  ? "text-green-400"
                  : analysis.atsScore >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {analysis.atsScore}
            </div>
            <div className="text-sm text-gray-400">%</div>
          </div>
        </div>
        <Progress value={analysis.atsScore} className="mb-4" />
        <p className="text-gray-400">
          {analysis.atsScore >= 80
            ? "Excellent! Your resume is well-optimized for ATS systems."
            : analysis.atsScore >= 60
            ? "Good, but there's room for improvement to pass ATS filters."
            : "Your resume needs optimization to pass ATS filters effectively."}
        </p>
      </div>

      {/* Keyword Density Analysis */}
      {analysis.keywords.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-green-400" />
            Keyword Analysis
          </h2>
          <div className="space-y-4">
            {analysis.keywords.slice(0, 10).map((item) => (
              <div key={item.keyword}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">{item.keyword}</span>
                  <span className="text-sm">
                    <span className="text-gray-400">Found {item.count}x</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        item.importance === "high"
                          ? "bg-green-500/20 text-green-400"
                          : item.importance === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {item.importance}
                    </span>
                  </span>
                </div>
                <Progress
                  value={Math.min(100, item.count * 20)}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills by Category */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Zap size={20} className="text-green-400" />
          Skills by Category
        </h2>
        <div className="space-y-6">
          {analysis.skills.technical.length > 0 && (
            <div>
              <h3 className="text-gray-300 mb-3">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.technical.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-green-700 bg-green-800/30 px-3 py-1 text-sm text-green-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.skills.tools.length > 0 && (
            <div>
              <h3 className="text-gray-300 mb-3">Tools & Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.tools.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-700 bg-blue-800/30 px-3 py-1 text-sm text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.skills.soft.length > 0 && (
            <div>
              <h3 className="text-gray-300 mb-3">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.soft.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-purple-700 bg-purple-800/30 px-3 py-1 text-sm text-purple-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Experience and Education */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-400" />
            Experience
          </h2>
          <ul className="space-y-4">
            {analysis.experience.map((exp, idx) => (
              <li key={idx} className="border-l-2 border-green-500/30 pl-4">
                <h4 className="font-medium text-gray-200">{exp.title}</h4>
                <p className="text-sm text-gray-400">
                  {exp.company} • {exp.duration}
                </p>
                {exp.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.highlights.slice(0, 2).map((highlight, hIdx) => (
                      <li
                        key={hIdx}
                        className="text-sm text-gray-400 flex items-start gap-2"
                      >
                        <span className="text-green-400 mt-1">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Zap size={18} className="text-green-400" />
            Education
          </h2>
          <ul className="space-y-4">
            {analysis.education.map((edu, idx) => (
              <li key={idx} className="border-l-2 border-green-500/30 pl-4">
                <h4 className="font-medium text-gray-200">{edu.degree}</h4>
                <p className="text-sm text-gray-400">
                  {edu.institution} • {edu.year}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-green-400" />
            Strengths
          </h2>
          <ul className="space-y-3">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300">
                <CheckCircle
                  size={16}
                  className="text-green-400 mt-1 flex-shrink-0"
                />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {analysis.improvements.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-yellow-400" />
            Improvement Suggestions
          </h2>
          <ul className="space-y-3">
            {analysis.improvements.map((suggestion, idx) => (
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
      )}
    </div>
  );
}
