"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: JobFormData) => void;
  editingJob?: {
    id: string | number;
    title: string;
    location: string;
    salary: string;
    description: string;
    requiredSkills: string[];
  } | null;
}

export interface JobFormData {
  title: string;
  location: string;
  salary: string;
  description: string;
  requiredSkills: string;
}

export function PostJobModal({
  isOpen,
  onClose,
  onSubmit,
  editingJob,
}: PostJobModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    location: "",
    salary: "",
    description: "",
    requiredSkills: "",
  });

  useEffect(() => {
    if (isOpen && editingJob) {
      setFormData({
        title: editingJob.title,
        location: editingJob.location,
        salary: editingJob.salary,
        description: editingJob.description,
        requiredSkills: editingJob.requiredSkills.join(", "),
      });
    } else if (isOpen && !editingJob) {
      setFormData({
        title: "",
        location: "",
        salary: "",
        description: "",
        requiredSkills: "",
      });
    }
  }, [isOpen, editingJob]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.location ||
      !formData.salary ||
      !formData.description ||
      !formData.requiredSkills
    ) {
      alert("Please fill in all fields");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-gray-900 p-8 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-white transition"
          type="button"
        >
          <X size={24} />
        </button>

        <h2 className="mb-8 text-3xl font-bold">
          {editingJob ? "Edit Job" : "Post New Job"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="mb-2 block text-gray-300">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-green-600 focus:outline-none transition"
              required
            />
          </div>

          {/* Location and Salary - Two columns */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-gray-300">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Remote"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-green-600 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-gray-300">Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $100k - $140k"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-green-600 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="mb-2 block text-gray-300">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={6}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-green-600 focus:outline-none transition resize-none"
              required
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="mb-2 block text-gray-300">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g., React, TypeScript, Node.js"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-green-600 focus:outline-none transition"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 transition py-3 font-medium text-white"
            >
              {editingJob ? "Update Job" : "Post Job"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition py-3 font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
