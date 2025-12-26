"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface ResumeData {
  id: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "analyzing" | "completed" | "failed";
  analysisScore: number;
  createdAt: string;
}

interface ResumeContextType {
  resume: ResumeData | null;
  loading: boolean;
  setResume: (resume: ResumeData | null) => void;
  refreshResume: () => Promise<void>;
  analyzeResume: () => Promise<boolean>;
  analyzing: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchResume = useCallback(async () => {
    try {
      const response = await fetch("/api/resumes");
      const data = await response.json();

      if (data.success && data.resumes.length > 0) {
        setResume(data.resumes[0]);
      } else {
        setResume(null);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      setResume(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeResume = useCallback(async (): Promise<boolean> => {
    setAnalyzing(true);

    try {
      const response = await fetch("/api/resumes/analyze", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Refresh resume data to get the analysis results
        await fetchResume();
        return true;
      } else {
        await fetchResume();
        return false;
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      await fetchResume();
      return false;
    } finally {
      setAnalyzing(false);
    }
  }, [fetchResume]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  return (
    <ResumeContext.Provider
      value={{
        resume,
        loading,
        setResume,
        refreshResume: fetchResume,
        analyzeResume,
        analyzing,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
