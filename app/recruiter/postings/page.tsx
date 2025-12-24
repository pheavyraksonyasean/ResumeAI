"use client";

import { useState } from "react";
import { MapPin, DollarSign, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostJobModal, type JobFormData } from "@/components/post-job-modal";

interface Job {
  id: number;
  title: string;
  postedDate: string;
  location: string;
  salary: string;
  matchedCandidates: number;
  description: string;
  requiredSkills: string[];
}

export default function JobPostingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobPostings, setJobPostings] = useState<Job[]>([
    {
      id: 1,
      title: "Senior Frontend Developer",
      postedDate: "12/20/2024",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      matchedCandidates: 24,
      description:
        "We are looking for an experienced frontend developer to join our team and build amazing user experiences...",
      requiredSkills: ["React", "TypeScript", "CSS", "Git"],
    },
    {
      id: 2,
      title: "Full Stack Developer",
      postedDate: "12/18/2024",
      location: "Remote",
      salary: "$100k - $140k",
      matchedCandidates: 18,
      description: "Join our team to build scalable applications...",
      requiredSkills: ["React", "Node.js", "MongoDB", "AWS"],
    },
    {
      id: 3,
      title: "Backend Engineer",
      postedDate: "12/15/2024",
      location: "New York, NY",
      salary: "$110k - $150k",
      matchedCandidates: 31,
      description:
        "Looking for a backend engineer to join our infrastructure team...",
      requiredSkills: ["Python", "Django", "PostgreSQL", "Docker"],
    },
  ]);

  const handlePostJob = (formData: JobFormData) => {
    if (editingJob) {
      setJobPostings((prev) =>
        prev.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                title: formData.title,
                location: formData.location,
                salary: formData.salary,
                description: formData.description,
                requiredSkills: formData.requiredSkills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter((skill) => skill.length > 0),
              }
            : job
        )
      );
    } else {
      const newJob: Job = {
        id: Math.max(...jobPostings.map((j) => j.id), 0) + 1,
        title: formData.title,
        postedDate: new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        location: formData.location,
        salary: formData.salary,
        matchedCandidates: 0,
        description: formData.description,
        requiredSkills: formData.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
      };

      setJobPostings((prev) => [newJob, ...prev]);
    }
    handleCloseModal();
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = (id: number) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      setJobPostings((prev) => prev.filter((job) => job.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleOpenNewJobModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Postings</h1>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleOpenNewJobModal}
        >
          + Post New Job
        </Button>
      </div>

      {/* Job Postings */}
      <div className="space-y-6">
        {jobPostings.map((job) => (
          <div
            key={job.id}
            className="rounded-lg border border-gray-800 bg-gray-900/50 p-6"
          >
            {/* Job Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span>Posted on</span>
                  <span>{job.postedDate}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditJob(job)}
                  className="p-2 text-gray-400 hover:text-white transition"
                  title="Edit job"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition"
                  title="Delete job"
                >
                  <Trash2 size={20} />
                </button>
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
                <Users size={16} />
                {job.matchedCandidates} matched candidates
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-4">{job.description}</p>

            {/* Required Skills */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-gray-800 px-3 py-1 text-sm text-gray-300 border border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button className="w-full rounded-lg bg-gray-800 hover:bg-gray-700 transition py-3 text-center font-medium">
              View Matched Candidates ({job.matchedCandidates})
            </button>
          </div>
        ))}
      </div>

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handlePostJob}
        editingJob={editingJob}
      />
    </div>
  );
}
