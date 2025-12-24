"use client";

import type React from "react";

import { Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadResumePage() {
  const [isDragging, setIsDragging] = useState(false);

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
    // Handle file drop
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Upload Your Resume</h1>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-12 text-center transition ${
          isDragging
            ? "border-green-500 bg-green-500/10"
            : "border-gray-700 bg-gray-900/50"
        }`}
      >
        <div className="flex justify-center mb-4">
          <Upload size={64} className="text-gray-500" />
        </div>
        <p className="text-xl mb-2">Drop your resume here</p>
        <p className="text-gray-400 mb-6">or click to browse files</p>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Select PDF File
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
