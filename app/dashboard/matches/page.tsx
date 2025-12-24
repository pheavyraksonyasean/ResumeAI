"use client";

import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { JobDetailsModal } from "@/components/job-details-modal";

export default function JobMatchesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const filters = [
    { id: "all", label: "All Jobs", count: 5 },
    { id: "high", label: "High Match", count: 3 },
    { id: "medium", label: "Medium Match", count: 2 },
  ];

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      type: "Full-time",
      date: "12/20/2024",
      applicants: "45 applicants",
      description:
        "We are looking for an experienced frontend developer to join our team and build amazing user experiences.",
      matchScore: 92,
      matchType: "High",
      compatibility: 92,
      matchingSkills: ["React", "TypeScript", "JavaScript", "CSS", "Git"],
      skillsToLearn: ["GraphQL", "Next.js"],
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      salary: "$100k - $140k",
      type: "Full-time",
      date: "12/18/2024",
      applicants: "32 applicants",
      description:
        "Join our fast-growing startup and help us build scalable web applications from the ground up.",
      matchScore: 85,
      matchType: "High",
      compatibility: 85,
      matchingSkills: [
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB",
        "REST APIs",
      ],
      skillsToLearn: ["Docker", "Kubernetes", "AWS"],
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Solutions",
      location: "New York, NY",
      salary: "$90k - $130k",
      type: "Full-time",
      date: "12/15/2024",
      applicants: "67 applicants",
      description:
        "Looking for a React developer to build modern web applications for our enterprise clients.",
      matchScore: 78,
      matchType: "Medium",
      compatibility: 78,
      matchingSkills: ["React", "JavaScript", "HTML", "CSS", "Agile"],
      skillsToLearn: ["Redux", "Testing Library", "Webpack"],
    },
  ];

  const filteredJobs =
    activeFilter === "all"
      ? jobs
      : jobs.filter((job) =>
          activeFilter === "high" ? job.matchScore >= 85 : job.matchScore < 85
        );

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
          <p className="text-3xl font-bold">5</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">High Match (85%+)</p>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Medium Match (70-84%)</p>
          <p className="text-3xl font-bold">2</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-sm text-gray-400 mb-2">Avg Match Score</p>
          <p className="text-3xl font-bold text-green-400">83%</p>
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
            key={job.id}
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
                  {job.matchScore}
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
                {job.salary}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {job.type}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {job.date}
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                {job.applicants}
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
            <div className="mb-6">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-yellow-400" />
                Skills to Learn ({job.skillsToLearn.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skillsToLearn.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-yellow-600/20 border border-yellow-600/50 px-3 py-1 text-xs text-yellow-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Apply Now
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 bg-transparent"
                onClick={() => setSelectedJob(job.id)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      <JobDetailsModal
        job={
          filteredJobs.find((job) => job.id === selectedJob) || filteredJobs[0]
        }
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
