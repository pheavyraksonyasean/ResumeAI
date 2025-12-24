"use client";

import {
  X,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface JobDetailsModalProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    date: string;
    applicants: string;
    description: string;
    matchScore: number;
    compatibility: number;
    matchingSkills: string[];
    skillsToLearn: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailsModal({
  job,
  isOpen,
  onClose,
}: JobDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
          <h2 className="text-2xl font-bold">Job Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{job.title}</h3>
                <p className="text-gray-400">{job.company}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {job.matchScore}
                </div>
                <div className="text-sm text-gray-400">Match Score</div>
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-400" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-400" />
                {job.salary}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-green-400" />
                {job.type}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-green-400" />
                Posted: {job.date}
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Users size={16} className="text-green-400" />
                {job.applicants}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold mb-2">About This Role</h4>
            <p className="text-gray-300 leading-relaxed">{job.description}</p>
          </div>

          {/* Compatibility */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Your Compatibility</span>
              <span className="text-green-400 font-semibold">
                {job.compatibility}%
              </span>
            </div>
            <Progress value={job.compatibility} className="h-2" />
          </div>

          {/* Matching Skills */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Zap size={16} className="text-green-400" />
              Matching Skills ({job.matchingSkills.length})
            </h4>
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
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-yellow-400" />
              Skills to Learn ({job.skillsToLearn.length})
            </h4>
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
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-gray-800 bg-gray-900">
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            Apply Now
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 bg-transparent"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
