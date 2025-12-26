// Job Matching Algorithm
// Compares resume analysis with job requirements to calculate match scores

import { IResumeAnalysis } from "@/models/Resume";
import { IJobPosting } from "@/models/JobPosting";

export interface JobMatch {
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
  postedDate: Date;
  matchScore: number;
  matchType: "High" | "Medium" | "Low";
  compatibility: number;
  matchingSkills: string[];
  missingSkills: string[];
  applicantCount: number;
}

// Normalize a skill string for comparison
function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[.\-_]/g, "")
    .replace(/\s+/g, " ");
}

// Create variations of a skill for matching
function getSkillVariations(skill: string): string[] {
  const normalized = normalizeSkill(skill);
  const variations = [normalized];

  // Common variations
  const commonVariations: Record<string, string[]> = {
    javascript: ["js", "ecmascript", "es6", "es2015"],
    typescript: ["ts"],
    python: ["py", "python3"],
    react: ["reactjs", "react js", "react.js"],
    node: ["nodejs", "node js", "node.js"],
    vue: ["vuejs", "vue js", "vue.js"],
    angular: ["angularjs", "angular js"],
    next: ["nextjs", "next js", "next.js"],
    express: ["expressjs", "express js", "express.js"],
    mongo: ["mongodb", "mongo db"],
    postgres: ["postgresql", "psql"],
    mysql: ["my sql"],
    aws: ["amazon web services"],
    gcp: ["google cloud", "google cloud platform"],
    azure: ["microsoft azure"],
    docker: ["containerization"],
    kubernetes: ["k8s"],
    "ci/cd": ["cicd", "continuous integration", "continuous deployment"],
    git: ["github", "gitlab", "version control"],
    agile: ["scrum", "kanban"],
    rest: ["restful", "rest api", "restful api"],
    graphql: ["graph ql"],
    html: ["html5"],
    css: ["css3", "stylesheet"],
    sass: ["scss"],
    tailwind: ["tailwindcss", "tailwind css"],
    bootstrap: ["bootstrap css"],
    "machine learning": ["ml", "deep learning", "dl"],
    "artificial intelligence": ["ai"],
    "data science": ["data analysis", "data analytics"],
  };

  // Add variations
  for (const [key, values] of Object.entries(commonVariations)) {
    if (normalized.includes(key)) {
      variations.push(...values);
    }
    if (values.some((v) => normalized.includes(v))) {
      variations.push(key);
    }
  }

  return variations;
}

// Check if two skills match
function skillsMatch(skill1: string, skill2: string): boolean {
  const variations1 = getSkillVariations(skill1);
  const variations2 = getSkillVariations(skill2);

  return variations1.some((v1) =>
    variations2.some(
      (v2) =>
        v1 === v2 ||
        v1.includes(v2) ||
        v2.includes(v1) ||
        levenshteinSimilarity(v1, v2) > 0.85
    )
  );
}

// Calculate Levenshtein similarity (0-1)
function levenshteinSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const costs: number[] = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }

  return (longer.length - costs[longer.length]) / longer.length;
}

// Calculate match score between resume and job
export function calculateMatchScore(
  resumeAnalysis: IResumeAnalysis,
  job: IJobPosting
): {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
} {
  // Combine all resume skills
  const resumeSkills = [
    ...resumeAnalysis.skills.technical,
    ...resumeAnalysis.skills.tools,
    ...resumeAnalysis.skills.soft,
  ];

  // Get job requirements (skills)
  const jobRequirements = job.requirements || [];

  // Find matching and missing skills
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const requirement of jobRequirements) {
    const hasSkill = resumeSkills.some((skill) =>
      skillsMatch(skill, requirement)
    );
    if (hasSkill) {
      matchingSkills.push(requirement);
    } else {
      missingSkills.push(requirement);
    }
  }

  // Calculate base score from skill matching
  let matchScore = 0;
  if (jobRequirements.length > 0) {
    matchScore = (matchingSkills.length / jobRequirements.length) * 100;
  } else {
    // If no requirements specified, give a base score
    matchScore = 50;
  }

  // Bonus for experience level
  const jobTitle = job.title.toLowerCase();
  const yearsExp = resumeAnalysis.yearsOfExperience;

  if (jobTitle.includes("senior") || jobTitle.includes("lead")) {
    if (yearsExp >= 5) matchScore = Math.min(100, matchScore + 10);
    else if (yearsExp < 3) matchScore = Math.max(0, matchScore - 15);
  } else if (jobTitle.includes("junior") || jobTitle.includes("entry")) {
    if (yearsExp <= 2) matchScore = Math.min(100, matchScore + 5);
    else if (yearsExp > 5) matchScore = Math.max(0, matchScore - 5);
  } else if (jobTitle.includes("mid") || jobTitle.includes("intermediate")) {
    if (yearsExp >= 2 && yearsExp <= 5)
      matchScore = Math.min(100, matchScore + 5);
  }

  // Bonus for high ATS score (indicates well-written resume)
  if (resumeAnalysis.atsScore >= 80) {
    matchScore = Math.min(100, matchScore + 5);
  }

  // Check for keyword matches in description
  const descLower = job.description.toLowerCase();
  const highImportanceKeywords = resumeAnalysis.keywords
    .filter((k) => k.importance === "high")
    .map((k) => k.keyword.toLowerCase());

  let keywordMatches = 0;
  for (const keyword of highImportanceKeywords) {
    if (descLower.includes(keyword)) {
      keywordMatches++;
    }
  }
  if (highImportanceKeywords.length > 0) {
    const keywordBonus = (keywordMatches / highImportanceKeywords.length) * 10;
    matchScore = Math.min(100, matchScore + keywordBonus);
  }

  return {
    matchScore: Math.round(matchScore),
    matchingSkills,
    missingSkills,
  };
}

// Get match type based on score
export function getMatchType(score: number): "High" | "Medium" | "Low" {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

// Match a resume against all jobs
export function matchResumeWithJobs(
  resumeAnalysis: IResumeAnalysis,
  jobs: IJobPosting[]
): JobMatch[] {
  const matches: JobMatch[] = [];

  for (const job of jobs) {
    // Only match with active jobs
    if (job.status !== "active") continue;

    const { matchScore, matchingSkills, missingSkills } = calculateMatchScore(
      resumeAnalysis,
      job
    );

    matches.push({
      jobId: (job._id?.toString() || (job as any).id) as string,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      postedDate: job.createdAt,
      matchScore,
      matchType: getMatchType(matchScore),
      compatibility: matchScore,
      matchingSkills,
      missingSkills,
      applicantCount: job.applicants?.length || 0,
    });
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

// Match a job against all resumes (for recruiters)
export function matchJobWithResumes(
  job: IJobPosting,
  resumes: {
    userId: string;
    userName: string;
    userEmail: string;
    analysis: IResumeAnalysis;
  }[]
): {
  userId: string;
  userName: string;
  userEmail: string;
  matchScore: number;
  matchType: "High" | "Medium" | "Low";
  matchingSkills: string[];
  missingSkills: string[];
  yearsOfExperience: number;
  atsScore: number;
}[] {
  const matches = [];

  for (const resume of resumes) {
    const { matchScore, matchingSkills, missingSkills } = calculateMatchScore(
      resume.analysis,
      job
    );

    matches.push({
      userId: resume.userId,
      userName: resume.userName,
      userEmail: resume.userEmail,
      matchScore,
      matchType: getMatchType(matchScore),
      matchingSkills,
      missingSkills,
      yearsOfExperience: resume.analysis.yearsOfExperience,
      atsScore: resume.analysis.atsScore,
    });
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}
