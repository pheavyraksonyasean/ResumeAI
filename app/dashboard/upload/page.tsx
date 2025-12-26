"use client";

import type React from "react";

import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useResume } from "@/contexts/ResumeContext";

export default function UploadResumePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    resume,
    setResume,
    refreshResume,
    analyzeResume,
    analyzing,
    loading,
  } = useResume();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError("");
    setSuccess("");

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to upload resume");
        return;
      }

      setResume(data.resume);
      setSuccess("Resume uploaded successfully! Starting AI analysis...");

      // Auto-analyze after upload
      setTimeout(async () => {
        const analysisSuccess = await analyzeResume();
        if (analysisSuccess) {
          setSuccess(
            "Resume analyzed successfully! Redirecting to analysis..."
          );
          setTimeout(() => {
            router.push("/dashboard/analysis");
          }, 1500);
        } else {
          setError("Analysis failed. You can retry from the Analysis page.");
        }
      }, 500);
    } catch (err) {
      setError("An error occurred while uploading. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!resume || !confirm("Are you sure you want to delete your resume?")) {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setResume(null);
        setSuccess("Resume deleted successfully");
        await refreshResume();
      } else {
        setError(data.message || "Failed to delete resume");
      }
    } catch (err) {
      setError("An error occurred while deleting. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Upload Your Resume</h1>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* Current Resume */}
      {resume && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  analyzing ? "bg-yellow-500/20" : "bg-green-500/20"
                }`}
              >
                {analyzing ? (
                  <Loader2 className="text-yellow-500 animate-spin" size={24} />
                ) : (
                  <FileText className="text-green-500" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{resume.fileName}</h3>
                <p className="text-sm text-gray-400">
                  {formatFileSize(resume.fileSize)} • Uploaded{" "}
                  {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {analyzing ? (
                <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-500 flex items-center gap-2">
                  <Zap size={14} className="animate-pulse" />
                  Analyzing with AI...
                </span>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    resume.status === "completed"
                      ? "bg-green-500/20 text-green-500"
                      : resume.status === "analyzing"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : resume.status === "failed"
                      ? "bg-red-500/20 text-red-500"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {resume.status === "completed"
                    ? "Analyzed"
                    : resume.status === "analyzing"
                    ? "Analyzing..."
                    : resume.status === "failed"
                    ? "Failed"
                    : "Pending"}
                </span>
              )}
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-400 transition"
                title="Delete resume"
                disabled={analyzing}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !analyzing && fileInputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-12 text-center transition cursor-pointer ${
          isDragging
            ? "border-green-500 bg-green-500/10"
            : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
        } ${uploading || analyzing ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={analyzing}
        />
        <div className="flex justify-center mb-4">
          {uploading || analyzing ? (
            <Loader2 size={64} className="text-green-500 animate-spin" />
          ) : (
            <Upload size={64} className="text-gray-500" />
          )}
        </div>
        <p className="text-xl mb-2">
          {uploading
            ? "Uploading..."
            : analyzing
            ? "Analyzing your resume..."
            : resume
            ? "Upload a new resume"
            : "Drop your resume here"}
        </p>
        <p className="text-gray-400 mb-6">or click to browse files</p>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={uploading || analyzing}
        >
          {uploading ? "Uploading..." : "Select PDF File"}
        </Button>
        <p className="text-sm text-gray-500 mt-4">PDF files only, max 5MB</p>
      </div>

      {/* Tips Section */}
      <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-8">
        <h2 className="text-lg font-semibold mb-4">Tips for best results:</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="text-green-500">•</span>
            <span>Ensure your resume is in PDF format</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500">•</span>
            <span>Use a clean, readable font (avoid images of text)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500">•</span>
            <span>
              Include clear sections for skills, experience, and education
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500">•</span>
            <span>
              Avoid tables, columns, or complex layouts for better parsing
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
