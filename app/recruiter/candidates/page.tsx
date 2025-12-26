"use client";

import { Suspense, useState, useEffect } from "react";
import { Download, Mail, Loader2, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from "next/navigation";

interface Job {
  id: string;
  title: string;
}

interface Candidate {
  userId: string;
  userName: string;
  userEmail: string;
  matchScore: number;
  matchType: "High" | "Medium" | "Low";
  matchingSkills: string[];
  missingSkills: string[];
  yearsOfExperience: number;
  atsScore: number;
}

function MatchedCandidatesContent() {
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("job");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    highMatches: 0,
    mediumMatches: 0,
    lowMatches: 0,
  });

  // Fetch recruiter's jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch candidates when a job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchCandidates(selectedJob);
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();

      if (data.success && data.jobs.length > 0) {
        const formattedJobs = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
        }));
        setJobs(formattedJobs);
        // Use job from URL if provided, otherwise select first job
        if (
          jobIdFromUrl &&
          formattedJobs.some((j: Job) => j.id === jobIdFromUrl)
        ) {
          setSelectedJob(jobIdFromUrl);
        } else {
          setSelectedJob(formattedJobs[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (jobId: string) => {
    setLoadingCandidates(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/candidates`);
      const data = await response.json();

      if (data.success) {
        setCandidates(data.candidates || []);
        setStats(
          data.stats || {
            totalCandidates: 0,
            highMatches: 0,
            mediumMatches: 0,
            lowMatches: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Handle contact candidate - opens Gmail directly
  const handleContactCandidate = (candidate: Candidate) => {
    const subject = encodeURIComponent(
      `Regarding your application - ${
        jobs.find((j) => j.id === selectedJob)?.title || "Job Opportunity"
      }`
    );
    const body = encodeURIComponent(
      `Hi ${candidate.userName},\n\nI came across your profile and would like to discuss a potential opportunity with you.\n\nBest regards`
    );
    // Open Gmail compose directly
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.userEmail}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  // Handle view resume - downloads or opens the PDF
  const handleViewResume = async (candidate: Candidate) => {
    try {
      const response = await fetch(
        `/api/candidates/${candidate.userId}/resume`
      );
      const data = await response.json();

      if (data.success && data.resume) {
        // Create a blob from base64 data and download
        const byteCharacters = atob(data.resume.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: data.resume.mimeType || "application/pdf",
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          data.resume.fileName || `${candidate.userName}_resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert(data.message || "Failed to fetch resume");
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      alert("Failed to fetch resume. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  // No jobs state
  if (jobs.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Matched Candidates</h1>
          <p className="text-gray-400">
            AI-matched candidates for your job postings
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Job Postings Yet</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Post a job first to see matched candidates based on their skills and
            experience.
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => (window.location.href = "/recruiter/postings")}
          >
            Post a Job
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Matched Candidates</h1>
        <p className="text-gray-400">
          AI-matched candidates for your job postings
        </p>
      </div>

      {/* Job Selector */}
      <div className="flex flex-wrap gap-3">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => setSelectedJob(job.id)}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              selectedJob === job.id
                ? "bg-green-600 text-white"
                : "border border-gray-700 text-gray-300 hover:text-white"
            }`}
          >
            {job.title}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Total Candidates</p>
          <p className="text-3xl font-bold">{stats.totalCandidates}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">High Match (80%+)</p>
          <p className="text-3xl font-bold text-green-400">
            {stats.highMatches}
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Medium Match (60-79%)</p>
          <p className="text-3xl font-bold text-yellow-400">
            {stats.mediumMatches}
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Low Match (&lt;60%)</p>
          <p className="text-3xl font-bold text-gray-400">{stats.lowMatches}</p>
        </div>
      </div>

      {/* Loading candidates */}
      {loadingCandidates ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Candidates Yet</h2>
          <p className="text-gray-400 max-w-md">
            No candidates have uploaded resumes with completed analysis yet.
            Check back later for matched candidates!
          </p>
        </div>
      ) : (
        /* Candidates List */
        <div className="space-y-6">
          {candidates.map((candidate) => (
            <div
              key={candidate.userId}
              className="rounded-lg border border-gray-800 bg-gray-900/50 p-6"
            >
              {/* Candidate Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {candidate.userName}
                  </h2>
                  <p className="text-gray-400 text-sm mb-2">
                    {candidate.userEmail}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {candidate.yearsOfExperience} years of experience
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${
                      candidate.matchType === "High"
                        ? "text-green-400"
                        : candidate.matchType === "Medium"
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  >
                    {candidate.matchScore}%
                  </div>
                  <div className="text-sm text-gray-400">Match Score</div>
                </div>
              </div>

              {/* Match Progress */}
              <div className="mb-4">
                <Progress value={candidate.matchScore} className="h-2" />
              </div>

              {/* ATS Score */}
              <div className="mb-4">
                <span className="text-sm text-gray-400">
                  ATS Score:{" "}
                  <span className="text-white font-medium">
                    {candidate.atsScore}%
                  </span>
                </span>
              </div>

              {/* Matching Skills */}
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Matching Skills ({candidate.matchingSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-green-600/20 border border-green-600/50 px-3 py-1 text-xs text-green-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {candidate.missingSkills.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">
                    Missing Skills ({candidate.missingSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-yellow-600/20 border border-yellow-600/50 px-3 py-1 text-xs text-yellow-400"
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
                  onClick={() => handleContactCandidate(candidate)}
                  className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Contact Candidate
                </Button>
                <Button
                  onClick={() => handleViewResume(candidate)}
                  variant="outline"
                  className="border-gray-700 bg-transparent flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  View Resume
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
    </div>
  );
}

export default function MatchedCandidatesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MatchedCandidatesContent />
    </Suspense>
  );
}
