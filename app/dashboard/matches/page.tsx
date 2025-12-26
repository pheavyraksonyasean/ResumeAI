"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Zap,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JobDetailsModal } from "@/components/job-details-modal";
import Link from "next/link";

interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: string;
  description: string;
  requirements: string[];
  postedDate: string;
  matchScore: number;
  matchType: "High" | "Medium" | "Low";
  compatibility: number;
  matchingSkills: string[];
  missingSkills: string[];
  applicantCount: number;
}

interface Stats {
  totalMatches: number;
  highMatches: number;
  mediumMatches: number;
  lowMatches: number;
  avgMatchScore: number;
}

export default function JobMatchesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMatches: 0,
    highMatches: 0,
    mediumMatches: 0,
    lowMatches: 0,
    avgMatchScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noResume, setNoResume] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/matches");
      const data = await response.json();

      if (data.success) {
        setJobs(data.matches || []);
        setStats(
          data.stats || {
            totalMatches: 0,
            highMatches: 0,
            mediumMatches: 0,
            lowMatches: 0,
            avgMatchScore: 0,
          }
        );
        setNoResume(false);
      } else {
        if (
          data.message?.includes("No resume found") ||
          data.message?.includes("not analyzed")
        ) {
          setNoResume(true);
        }
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to fetch job matches");
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId: string) => {
    try {
      setApplyingTo(jobId);
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setAppliedJobs((prev) => new Set([...prev, jobId]));
        // Update applicant count in the UI
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.jobId === jobId
              ? { ...job, applicantCount: job.applicantCount + 1 }
              : job
          )
        );
      } else {
        if (data.message?.includes("already applied")) {
          setAppliedJobs((prev) => new Set([...prev, jobId]));
        } else {
          alert(data.message || "Failed to apply");
        }
      }
    } catch (err) {
      console.error("Error applying to job:", err);
      alert("Failed to apply to job");
    } finally {
      setApplyingTo(null);
    }
  };

  const filters = [
    { id: "all", label: "All Jobs", count: stats.totalMatches },
    { id: "high", label: "High Match", count: stats.highMatches },
    {
      id: "medium",
      label: "Medium Match",
      count: stats.mediumMatches + stats.lowMatches,
    },
  ];

  const filteredJobs =
    activeFilter === "all"
      ? jobs
      : jobs.filter((job) =>
          activeFilter === "high" ? job.matchScore >= 80 : job.matchScore < 80
        );

  const formatSalary = (salary: {
    min: number;
    max: number;
    currency: string;
  }) => {
    if (!salary || !salary.min || !salary.max) return "Not specified";
    return `$${Math.floor(salary.min / 1000)}k - $${Math.floor(
      salary.max / 1000
    )}k`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  // No resume state
  if (noResume) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Matches</h1>
          <p className="text-gray-400">Based on your skills and experience</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Resume Found</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Upload your resume first to see job matches based on your skills and
            experience.
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

  // No jobs state
  if (jobs.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Matches</h1>
          <p className="text-gray-400">Based on your skills and experience</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Job Postings Yet</h2>
          <p className="text-gray-400 max-w-md">
            There are no active job postings at the moment. Check back later for
            new opportunities!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Job Matches</h1>
        <p className="text-gray-400">Based on your skills and experience</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Total Matches</p>
          <p className="text-3xl font-bold">{stats.totalMatches}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">High Match (80%+)</p>
          <p className="text-3xl font-bold">{stats.highMatches}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Medium Match (60-79%)</p>
          <p className="text-3xl font-bold">{stats.mediumMatches}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Avg Match Score</p>
          <p className="text-3xl font-bold text-green-400">
            {stats.avgMatchScore}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              activeFilter === filter.id
                ? "bg-green-600 text-white"
                : "border border-gray-700 text-gray-300 hover:text-white"
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.map((job) => (
          <div
            key={job.jobId}
            className="rounded-lg border border-gray-800 bg-gray-900/50 p-6"
          >
            {/* Job Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
                <p className="text-gray-400">{job.company}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {job.matchScore}%
                </div>
                <div className="text-sm text-gray-400">Match</div>
              </div>
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                {formatSalary(job.salary)}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {job.type}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {formatDate(job.postedDate)}
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                {job.applicantCount} applicants
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-4">{job.description}</p>

            {/* Compatibility */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compatibility</span>
                <span className="text-sm text-gray-400">
                  {job.compatibility}%
                </span>
              </div>
              <Progress value={job.compatibility} className="h-2" />
            </div>

            {/* Matching Skills */}
            <div className="mb-4">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Zap size={16} className="text-green-400" />
                Matching Skills ({job.matchingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.matchingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-600/20 border border-green-600/50 px-3 py-1 text-xs text-green-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills to Learn */}
            {job.missingSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-yellow-400" />
                  Skills to Learn ({job.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-yellow-600/20 border border-yellow-600/50 px-3 py-1 text-xs text-yellow-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                className={`flex-1 ${
                  appliedJobs.has(job.jobId)
                    ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={() => applyToJob(job.jobId)}
                disabled={appliedJobs.has(job.jobId) || applyingTo === job.jobId}
              >
                {applyingTo === job.jobId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : appliedJobs.has(job.jobId) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </>
                ) : (
                  "Apply Now"
                )}
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 bg-transparent"
                onClick={() => setSelectedJob(job.jobId)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedJob &&
        (() => {
          const job = jobs.find((j) => j.jobId === selectedJob);
          if (!job) return null;
          return (
            <JobDetailsModal
              job={{
                id: parseInt(job.jobId) || 1,
                title: job.title,
                company: job.company,
                location: job.location,
                salary: formatSalary(job.salary),
                type: job.type,
                date: formatDate(job.postedDate),
                applicants: `${job.applicantCount} applicants`,
                description: job.description,
                matchScore: job.matchScore,
                compatibility: job.compatibility,
                matchingSkills: job.matchingSkills,
                skillsToLearn: job.missingSkills,
              }}
              isOpen={true}
              onClose={() => setSelectedJob(null)}
            />
          );
        })()}
    </div>
  );
}
