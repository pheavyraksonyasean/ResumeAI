"use client";

import { useState, useEffect } from "react";
import { MapPin, DollarSign, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostJobModal, type JobFormData } from "@/components/post-job-modal";

interface Job {
  id: string;
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
  const [jobPostings, setJobPostings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();

      if (data.success) {
        const formattedJobs = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          postedDate: new Date(job.createdAt).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          location: job.location,
          salary:
            job.salary?.min && job.salary?.max
              ? `$${Math.floor(job.salary.min / 1000)}k - $${Math.floor(
                  job.salary.max / 1000
                )}k`
              : "Not specified",
          matchedCandidates: job.applicants || 0,
          description: job.description,
          requiredSkills: job.requirements || [],
        }));
        setJobPostings(formattedJobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (formData: JobFormData) => {
    setSubmitting(true);
    try {
      if (editingJob) {
        // Update existing job
        const response = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            location: formData.location,
            salary: formData.salary,
            description: formData.description,
            requiredSkills: formData.requiredSkills,
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchJobs(); // Refresh the list
        } else {
          alert(data.message || "Failed to update job");
        }
      } else {
        // Create new job
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            location: formData.location,
            salary: formData.salary,
            description: formData.description,
            requiredSkills: formData.requiredSkills,
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchJobs(); // Refresh the list
        } else {
          alert(data.message || "Failed to post job");
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving job:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setJobPostings((prev) => prev.filter((job) => job.id !== id));
      } else {
        alert(data.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An error occurred. Please try again.");
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

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : jobPostings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No job postings yet</p>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleOpenNewJobModal}
          >
            Post Your First Job
          </Button>
        </div>
      ) : (
        /* Job Postings */
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
              <button
                onClick={() =>
                  (window.location.href = `/recruiter/candidates?job=${job.id}`)
                }
                className="w-full rounded-lg bg-gray-800 hover:bg-gray-700 transition py-3 text-center font-medium"
              >
                View Matched Candidates
              </button>
            </div>
          ))}
        </div>
      )}

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
