// Use unpdf for serverless-compatible PDF text extraction
import { extractText } from "unpdf";

export interface BackendResumeAnalysis {
  atsScore: number;
  summary: string;
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  experience: {
    title: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  keywords: {
    keyword: string;
    count: number;
    importance: "high" | "medium" | "low";
  }[];
  improvements: string[];
  strengths: string[];
  yearsOfExperience: number;
  extractedText?: string;
}

// Common technical skills database
const TECHNICAL_SKILLS = [
  // Programming Languages
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "php",
  "go",
  "golang",
  "rust",
  "swift",
  "kotlin",
  "scala",
  "r",
  "matlab",
  "perl",
  "shell",
  "bash",
  "powershell",
  "sql",
  "nosql",
  "html",
  "css",
  "sass",
  "scss",
  "less",
  // Frameworks & Libraries
  "react",
  "reactjs",
  "react.js",
  "angular",
  "angularjs",
  "vue",
  "vuejs",
  "vue.js",
  "svelte",
  "next.js",
  "nextjs",
  "nuxt",
  "gatsby",
  "express",
  "expressjs",
  "node.js",
  "nodejs",
  "node",
  "django",
  "flask",
  "fastapi",
  "spring",
  "spring boot",
  "springboot",
  ".net",
  "dotnet",
  "asp.net",
  "rails",
  "ruby on rails",
  "laravel",
  "symfony",
  "flutter",
  "react native",
  "electron",
  "jquery",
  "bootstrap",
  "tailwind",
  "tailwindcss",
  "material ui",
  "chakra",
  // Databases
  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "redis",
  "elasticsearch",
  "cassandra",
  "dynamodb",
  "firebase",
  "firestore",
  "sqlite",
  "oracle",
  "sql server",
  "mariadb",
  "neo4j",
  "couchdb",
  "graphql",
  // AI/ML
  "machine learning",
  "deep learning",
  "neural networks",
  "tensorflow",
  "pytorch",
  "keras",
  "scikit-learn",
  "pandas",
  "numpy",
  "opencv",
  "nlp",
  "natural language processing",
  "computer vision",
  "ai",
  "artificial intelligence",
  "data science",
  "llm",
  "chatgpt",
  "openai",
  "hugging face",
  "transformers",
];

// Common tools and platforms
const TOOLS = [
  // Cloud & DevOps
  "aws",
  "amazon web services",
  "azure",
  "gcp",
  "google cloud",
  "heroku",
  "digitalocean",
  "vercel",
  "netlify",
  "cloudflare",
  "docker",
  "kubernetes",
  "k8s",
  "jenkins",
  "travis ci",
  "circle ci",
  "github actions",
  "gitlab ci",
  "terraform",
  "ansible",
  "puppet",
  "chef",
  // Version Control & Collaboration
  "git",
  "github",
  "gitlab",
  "bitbucket",
  "svn",
  "mercurial",
  "jira",
  "confluence",
  "trello",
  "asana",
  "monday",
  "notion",
  "slack",
  "teams",
  "discord",
  // Design & UI
  "figma",
  "sketch",
  "adobe xd",
  "photoshop",
  "illustrator",
  "invision",
  "zeplin",
  // Testing
  "jest",
  "mocha",
  "chai",
  "cypress",
  "selenium",
  "playwright",
  "puppeteer",
  "junit",
  "pytest",
  "rspec",
  "postman",
  "insomnia",
  // IDEs & Editors
  "vscode",
  "visual studio",
  "intellij",
  "webstorm",
  "pycharm",
  "eclipse",
  "vim",
  "emacs",
  // Other Tools
  "webpack",
  "vite",
  "babel",
  "eslint",
  "prettier",
  "npm",
  "yarn",
  "pnpm",
  "pip",
  "conda",
  "homebrew",
  "linux",
  "unix",
  "windows",
  "macos",
  "nginx",
  "apache",
];

// Soft skills patterns
const SOFT_SKILLS = [
  "leadership",
  "communication",
  "teamwork",
  "team player",
  "collaboration",
  "problem solving",
  "problem-solving",
  "critical thinking",
  "analytical",
  "creative",
  "creativity",
  "adaptable",
  "adaptability",
  "time management",
  "project management",
  "agile",
  "scrum",
  "kanban",
  "mentoring",
  "coaching",
  "presentation",
  "public speaking",
  "negotiation",
  "conflict resolution",
  "decision making",
  "strategic thinking",
  "attention to detail",
  "self-motivated",
  "proactive",
  "interpersonal",
  "customer service",
  "client facing",
  "stakeholder management",
  "cross-functional",
  "multitasking",
  "organizational",
  "initiative",
  "flexible",
  "reliable",
];

// Job title patterns
const JOB_TITLES = [
  "software engineer",
  "software developer",
  "web developer",
  "frontend developer",
  "front-end developer",
  "backend developer",
  "back-end developer",
  "full stack developer",
  "fullstack developer",
  "full-stack developer",
  "senior developer",
  "junior developer",
  "lead developer",
  "principal engineer",
  "staff engineer",
  "architect",
  "solution architect",
  "technical architect",
  "data engineer",
  "data scientist",
  "data analyst",
  "ml engineer",
  "machine learning engineer",
  "ai engineer",
  "devops engineer",
  "sre",
  "site reliability engineer",
  "cloud engineer",
  "platform engineer",
  "qa engineer",
  "quality assurance",
  "test engineer",
  "mobile developer",
  "ios developer",
  "android developer",
  "ui developer",
  "ux designer",
  "ui/ux designer",
  "product designer",
  "technical lead",
  "tech lead",
  "engineering manager",
  "cto",
  "vp engineering",
  "director of engineering",
  "intern",
  "trainee",
  "consultant",
  "freelancer",
  "contractor",
  "project manager",
  "product manager",
  "scrum master",
];

// Education patterns
const DEGREES = [
  "bachelor",
  "bachelors",
  "bachelor's",
  "b.s.",
  "bs",
  "b.a.",
  "ba",
  "b.sc",
  "bsc",
  "b.tech",
  "btech",
  "b.eng",
  "beng",
  "master",
  "masters",
  "master's",
  "m.s.",
  "ms",
  "m.a.",
  "ma",
  "m.sc",
  "msc",
  "m.tech",
  "mtech",
  "m.eng",
  "meng",
  "mba",
  "phd",
  "ph.d.",
  "doctorate",
  "doctoral",
  "associate",
  "associates",
  "associate's",
  "diploma",
  "certificate",
  "certification",
  "bootcamp",
  "degree",
  "computer science",
  "information technology",
  "software engineering",
  "electrical engineering",
  "mathematics",
  "physics",
  "engineering",
];

// Company indicators
const COMPANY_INDICATORS = [
  "inc",
  "inc.",
  "llc",
  "ltd",
  "ltd.",
  "corp",
  "corp.",
  "corporation",
  "company",
  "co.",
  "co",
  "group",
  "technologies",
  "tech",
  "solutions",
  "software",
  "systems",
  "consulting",
  "services",
  "labs",
  "studio",
  "agency",
  "partners",
  "associates",
];

// Function to extract text from PDF using unpdf
export async function extractTextFromPDF(base64Data: string): Promise<string> {
  try {
    // Convert base64 to Uint8Array (required by unpdf)
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract text using unpdf
    const result = await extractText(bytes);

    console.log("PDF extraction result type:", typeof result);

    // Handle different possible return types
    if (typeof result === "string") {
      return result;
    }

    if (result && typeof result === "object") {
      // unpdf returns { totalPages: number, text: string[] }
      // where text is an array of strings (one per page)
      if ("text" in result) {
        const textField = (result as { text: string | string[] }).text;

        // If text is an array, join all pages
        if (Array.isArray(textField)) {
          const fullText = textField.join("\n");
          console.log(
            `Extracted text from ${textField.length} pages, total ${fullText.length} characters`
          );
          return fullText;
        }

        // If text is a string, return it directly
        if (typeof textField === "string") {
          return textField;
        }
      }
    }

    // Fallback: stringify and return
    console.log("Fallback: converting result to string");
    return String(result);
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      "Failed to extract text from PDF: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

// Function to find keywords with counts
function findKeywords(
  text: string,
  keywords: string[]
): { keyword: string; count: number }[] {
  const lowerText = text.toLowerCase();
  const results: { keyword: string; count: number }[] = [];

  for (const keyword of keywords) {
    const regex = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      results.push({ keyword, count: matches.length });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

// Extract sections from resume text
function extractSections(text: string): { [key: string]: string } {
  const sections: { [key: string]: string } = {};
  const sectionPatterns = [
    {
      name: "experience",
      pattern:
        /(?:experience|employment|work history|professional experience)[:\s]*/i,
    },
    {
      name: "education",
      pattern: /(?:education|academic|qualifications|degrees)[:\s]*/i,
    },
    {
      name: "skills",
      pattern: /(?:skills|technical skills|technologies|competencies)[:\s]*/i,
    },
    {
      name: "summary",
      pattern:
        /(?:summary|profile|objective|about me|professional summary)[:\s]*/i,
    },
    {
      name: "projects",
      pattern: /(?:projects|portfolio|personal projects)[:\s]*/i,
    },
    {
      name: "certifications",
      pattern: /(?:certifications|certificates|licenses)[:\s]*/i,
    },
  ];

  // Split text into lines for better processing
  const lines = text.split("\n");
  let currentSection = "header";
  let sectionContent: { [key: string]: string[] } = { header: [] };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    let foundSection = false;
    for (const { name, pattern } of sectionPatterns) {
      if (pattern.test(trimmedLine)) {
        currentSection = name;
        sectionContent[name] = sectionContent[name] || [];
        foundSection = true;
        break;
      }
    }

    if (!foundSection) {
      sectionContent[currentSection] = sectionContent[currentSection] || [];
      sectionContent[currentSection].push(trimmedLine);
    }
  }

  // Join section content
  for (const [name, content] of Object.entries(sectionContent)) {
    sections[name] = content.join("\n");
  }

  return sections;
}

// Extract experience entries
function extractExperience(text: string): BackendResumeAnalysis["experience"] {
  const experience: BackendResumeAnalysis["experience"] = [];
  const lines = text.split("\n").filter((l) => l.trim());

  // Look for job title patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();

    for (const title of JOB_TITLES) {
      if (line.includes(title)) {
        // Found a potential job title line
        const originalLine = lines[i].trim();

        // Try to find company (often on same line or next line)
        let company = "";
        let duration = "";

        // Check for date patterns
        const datePattern =
          /(\d{4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*\d{4})\s*[-–—]\s*(\d{4}|present|current)/i;
        const dateMatch = originalLine.match(datePattern);
        if (dateMatch) {
          duration = dateMatch[0];
        } else {
          // Check next lines for date
          for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
            const nextDateMatch = lines[j].match(datePattern);
            if (nextDateMatch) {
              duration = nextDateMatch[0];
              break;
            }
          }
        }

        // Try to extract company from the line
        for (const indicator of COMPANY_INDICATORS) {
          const companyPattern = new RegExp(
            `([A-Z][\\w\\s&]+)\\s*${indicator}`,
            "i"
          );
          const companyMatch = originalLine.match(companyPattern);
          if (companyMatch) {
            company = companyMatch[0].trim();
            break;
          }
        }

        // If no company found, use a generic placeholder
        if (!company) {
          // Check if there's text after "at" or "@"
          const atMatch = originalLine.match(/(?:at|@)\s+([^,\n]+)/i);
          if (atMatch) {
            company = atMatch[1].trim();
          }
        }

        // Collect highlights (bullet points following the job title)
        const highlights: string[] = [];
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const bulletLine = lines[j].trim();
          if (
            bulletLine.startsWith("•") ||
            bulletLine.startsWith("-") ||
            bulletLine.startsWith("*") ||
            bulletLine.match(/^\d+\./)
          ) {
            highlights.push(bulletLine.replace(/^[•\-*\d.]\s*/, ""));
          } else if (
            JOB_TITLES.some((t) => bulletLine.toLowerCase().includes(t))
          ) {
            break; // Next job title found
          }
        }

        // Avoid duplicates
        if (!experience.some((e) => e.title.toLowerCase() === title)) {
          experience.push({
            title: title
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            company: company || "Company",
            duration: duration || "N/A",
            highlights: highlights.slice(0, 5),
          });
        }
        break;
      }
    }
  }

  return experience;
}

// Extract education entries
function extractEducation(text: string): BackendResumeAnalysis["education"] {
  const education: BackendResumeAnalysis["education"] = [];
  const lines = text.split("\n").filter((l) => l.trim());

  // Look for degree patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();

    for (const degree of DEGREES) {
      if (line.includes(degree)) {
        const originalLine = lines[i].trim();

        // Extract year
        const yearMatch = originalLine.match(/\b(19|20)\d{2}\b/g);
        const year = yearMatch ? yearMatch[yearMatch.length - 1] : "N/A";

        // Try to extract institution
        let institution = "";
        const universityPattern =
          /(?:university|college|institute|school|academy)(?:\s+of)?[^,\n]+/i;
        const uniMatch = originalLine.match(universityPattern);
        if (uniMatch) {
          institution = uniMatch[0].trim();
        } else {
          // Check next line for institution
          if (i + 1 < lines.length) {
            const nextUniMatch = lines[i + 1].match(universityPattern);
            if (nextUniMatch) {
              institution = nextUniMatch[0].trim();
            }
          }
        }

        // Avoid duplicates
        const degreeCapitalized = degree
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        if (!education.some((e) => e.degree.toLowerCase().includes(degree))) {
          education.push({
            degree: degreeCapitalized,
            institution: institution || "Educational Institution",
            year,
          });
        }
        break;
      }
    }
  }

  return education;
}

// Estimate years of experience
function estimateYearsOfExperience(text: string): number {
  const datePattern = /\b(19|20)(\d{2})\b/g;
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  let match;
  while ((match = datePattern.exec(text)) !== null) {
    const year = parseInt(match[0]);
    if (year >= 1990 && year <= currentYear) {
      years.push(year);
    }
  }

  if (years.length >= 2) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    return Math.min(maxYear - minYear, currentYear - minYear);
  }

  // Fallback: count job titles as rough estimate (2 years each)
  const titleCount = JOB_TITLES.filter((title) =>
    text.toLowerCase().includes(title)
  ).length;

  return Math.min(titleCount * 2, 15);
}

// Calculate ATS score
function calculateATSScore(
  text: string,
  technicalSkills: string[],
  tools: string[],
  softSkills: string[],
  experience: BackendResumeAnalysis["experience"],
  education: BackendResumeAnalysis["education"]
): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  // Technical skills (30%)
  const techScore = Math.min(technicalSkills.length * 3, 30);
  score += techScore;

  // Tools (15%)
  const toolsScore = Math.min(tools.length * 2, 15);
  score += toolsScore;

  // Experience (25%)
  const expScore = Math.min(experience.length * 6, 25);
  score += expScore;

  // Education (15%)
  const eduScore = Math.min(education.length * 8, 15);
  score += eduScore;

  // Contact info (5%)
  if (lowerText.includes("@") || lowerText.includes("email")) score += 2;
  if (lowerText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) score += 2; // Phone
  if (lowerText.includes("linkedin") || lowerText.includes("github"))
    score += 1;

  // Structure and formatting (10%)
  const sections = extractSections(text);
  if (sections.experience) score += 3;
  if (sections.education) score += 3;
  if (sections.skills) score += 2;
  if (sections.summary) score += 2;

  return Math.min(Math.round(score), 100);
}

// Generate summary from text
function generateSummary(
  text: string,
  technicalSkills: string[],
  yearsOfExperience: number
): string {
  const skillsStr = technicalSkills.slice(0, 5).join(", ");

  // Try to find actual summary from resume
  const sections = extractSections(text);
  if (sections.summary && sections.summary.length > 50) {
    // Return first 2-3 sentences
    const sentences = sections.summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    return sentences.slice(0, 2).join(". ").trim() + ".";
  }

  // Generate basic summary
  if (yearsOfExperience > 0 && skillsStr) {
    return `Professional with approximately ${yearsOfExperience} years of experience. Key skills include ${skillsStr}.`;
  }

  return "Resume uploaded for analysis. Key information has been extracted.";
}

// Generate improvement suggestions
function generateImprovements(
  text: string,
  technicalSkills: string[],
  experience: BackendResumeAnalysis["experience"],
  education: BackendResumeAnalysis["education"]
): string[] {
  const improvements: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for missing sections
  const sections = extractSections(text);
  if (!sections.summary || sections.summary.length < 50) {
    improvements.push(
      "Add a professional summary at the top of your resume to quickly capture recruiter attention."
    );
  }

  // Check for quantifiable achievements
  if (
    !text.match(
      /\d+%|\$\d+|\d+\s*(users|customers|projects|clients|team members)/i
    )
  ) {
    improvements.push(
      "Include quantifiable achievements (e.g., 'Increased sales by 25%' or 'Managed team of 10')."
    );
  }

  // Check for action verbs
  const actionVerbs = [
    "led",
    "developed",
    "created",
    "implemented",
    "designed",
    "managed",
    "improved",
    "achieved",
    "launched",
    "built",
  ];
  const usedActionVerbs = actionVerbs.filter((v) => lowerText.includes(v));
  if (usedActionVerbs.length < 3) {
    improvements.push(
      "Use more action verbs to describe your achievements (e.g., 'Led', 'Developed', 'Implemented')."
    );
  }

  // Check for contact info
  if (!lowerText.includes("linkedin")) {
    improvements.push("Add your LinkedIn profile URL to increase credibility.");
  }
  if (!lowerText.includes("github") && technicalSkills.length > 3) {
    improvements.push(
      "Consider adding your GitHub profile to showcase your code and projects."
    );
  }

  // Check skills section
  if (technicalSkills.length < 5) {
    improvements.push(
      "Expand your skills section with more specific technical skills relevant to your target role."
    );
  }

  // Check experience bullets
  if (
    experience.length > 0 &&
    experience.every((e) => e.highlights.length < 3)
  ) {
    improvements.push(
      "Add 3-5 bullet points for each work experience highlighting your key achievements."
    );
  }

  // Check for keywords
  if (text.length < 1500) {
    improvements.push(
      "Your resume appears short. Consider adding more details about your experience and projects."
    );
  }

  return improvements.slice(0, 6);
}

// Identify strengths
function identifyStrengths(
  technicalSkills: string[],
  tools: string[],
  softSkills: string[],
  experience: BackendResumeAnalysis["experience"],
  education: BackendResumeAnalysis["education"],
  text: string
): string[] {
  const strengths: string[] = [];

  if (technicalSkills.length >= 5) {
    strengths.push(
      `Strong technical foundation with ${technicalSkills.length} key technical skills identified.`
    );
  }

  if (tools.length >= 5) {
    strengths.push(
      `Proficient in multiple industry-standard tools and platforms.`
    );
  }

  if (softSkills.length >= 3) {
    strengths.push(
      `Well-rounded professional with strong soft skills including ${softSkills
        .slice(0, 3)
        .join(", ")}.`
    );
  }

  if (experience.length >= 2) {
    strengths.push(
      `Solid professional experience with ${experience.length} relevant positions.`
    );
  }

  if (education.length >= 1) {
    const hasAdvanced = education.some(
      (e) =>
        e.degree.toLowerCase().includes("master") ||
        e.degree.toLowerCase().includes("phd")
    );
    if (hasAdvanced) {
      strengths.push(
        "Advanced educational background demonstrates commitment to learning."
      );
    } else {
      strengths.push(
        "Educational foundation supports professional qualifications."
      );
    }
  }

  // Check for quantifiable results
  if (text.match(/\d+%|\$[\d,]+|\d+\s*(users|customers|projects)/i)) {
    strengths.push(
      "Resume includes quantifiable achievements which strengthen impact."
    );
  }

  return strengths.slice(0, 5);
}

// Main analysis function
export async function analyzeResumeWithBackend(
  base64PdfData: string,
  fileName: string
): Promise<BackendResumeAnalysis> {
  console.log(`Backend analyzer: Processing ${fileName}`);

  // Extract text from PDF
  let extractedText = await extractTextFromPDF(base64PdfData);

  // Ensure extractedText is a string
  if (typeof extractedText !== "string") {
    console.log(
      "Extracted text is not a string, converting...",
      typeof extractedText
    );
    extractedText = String(extractedText || "");
  }

  const trimmedText = extractedText.trim();

  if (!trimmedText || trimmedText.length < 50) {
    throw new Error(
      "Unable to extract sufficient text from the PDF. The file may be image-based or encrypted."
    );
  }

  console.log(`Extracted ${trimmedText.length} characters from PDF`);

  // Find skills
  const technicalSkillsFound = findKeywords(trimmedText, TECHNICAL_SKILLS);
  const toolsFound = findKeywords(trimmedText, TOOLS);
  const softSkillsFound = findKeywords(trimmedText, SOFT_SKILLS);

  // Extract structured data
  const experience = extractExperience(trimmedText);
  const education = extractEducation(trimmedText);
  const yearsOfExperience = estimateYearsOfExperience(trimmedText);

  // Prepare skills arrays
  const technicalSkills = technicalSkillsFound.map((s) => s.keyword);
  const tools = toolsFound.map((s) => s.keyword);
  const softSkills = softSkillsFound.map((s) => s.keyword);

  // Calculate ATS score
  const atsScore = calculateATSScore(
    trimmedText,
    technicalSkills,
    tools,
    softSkills,
    experience,
    education
  );

  // Generate summary
  const summary = generateSummary(
    trimmedText,
    technicalSkills,
    yearsOfExperience
  );

  // Combine keywords with importance
  const allKeywords = [
    ...technicalSkillsFound
      .slice(0, 8)
      .map((k) => ({ ...k, importance: "high" as const })),
    ...toolsFound
      .slice(0, 6)
      .map((k) => ({ ...k, importance: "medium" as const })),
    ...softSkillsFound
      .slice(0, 4)
      .map((k) => ({ ...k, importance: "low" as const })),
  ];

  // Generate improvements and strengths
  const improvements = generateImprovements(
    trimmedText,
    technicalSkills,
    experience,
    education
  );
  const strengths = identifyStrengths(
    technicalSkills,
    tools,
    softSkills,
    experience,
    education,
    trimmedText
  );

  const analysis: BackendResumeAnalysis = {
    atsScore,
    summary,
    skills: {
      technical: technicalSkills.slice(0, 15),
      tools: tools.slice(0, 15),
      soft: softSkills.slice(0, 10),
    },
    experience,
    education,
    keywords: allKeywords,
    improvements,
    strengths,
    yearsOfExperience,
    extractedText: trimmedText.substring(0, 5000), // Store first 5000 chars for reference
  };

  console.log(`Backend analysis complete. ATS Score: ${atsScore}`);

  return analysis;
}

// Hybrid analysis function - combines Gemini and backend analysis
export async function hybridAnalysis(
  base64PdfData: string,
  fileName: string,
  geminiAnalysis?: BackendResumeAnalysis
): Promise<BackendResumeAnalysis> {
  // First, always run backend analysis to extract text and basic info
  const backendAnalysis = await analyzeResumeWithBackend(
    base64PdfData,
    fileName
  );

  // If we don't have Gemini analysis, return backend analysis
  if (!geminiAnalysis) {
    return backendAnalysis;
  }

  // Merge both analyses, preferring Gemini where available but enhancing with backend
  const mergedAnalysis: BackendResumeAnalysis = {
    // Use Gemini's score if it seems reasonable, otherwise average both
    atsScore:
      geminiAnalysis.atsScore > 0
        ? Math.round((geminiAnalysis.atsScore + backendAnalysis.atsScore) / 2)
        : backendAnalysis.atsScore,

    // Prefer Gemini's summary if available
    summary:
      geminiAnalysis.summary && geminiAnalysis.summary.length > 20
        ? geminiAnalysis.summary
        : backendAnalysis.summary,

    // Merge skills (union of both)
    skills: {
      technical: [
        ...new Set([
          ...geminiAnalysis.skills.technical,
          ...backendAnalysis.skills.technical,
        ]),
      ].slice(0, 20),
      tools: [
        ...new Set([
          ...geminiAnalysis.skills.tools,
          ...backendAnalysis.skills.tools,
        ]),
      ].slice(0, 15),
      soft: [
        ...new Set([
          ...geminiAnalysis.skills.soft,
          ...backendAnalysis.skills.soft,
        ]),
      ].slice(0, 10),
    },

    // Prefer Gemini's experience if it has more detail
    experience:
      geminiAnalysis.experience.length > backendAnalysis.experience.length
        ? geminiAnalysis.experience
        : backendAnalysis.experience.length > 0
        ? backendAnalysis.experience
        : geminiAnalysis.experience,

    // Prefer Gemini's education if available
    education:
      geminiAnalysis.education.length > 0
        ? geminiAnalysis.education
        : backendAnalysis.education,

    // Merge keywords
    keywords: [
      ...new Map(
        [...backendAnalysis.keywords, ...geminiAnalysis.keywords].map((k) => [
          k.keyword,
          k,
        ])
      ).values(),
    ].slice(0, 20),

    // Combine improvements
    improvements: [
      ...new Set([
        ...geminiAnalysis.improvements,
        ...backendAnalysis.improvements,
      ]),
    ].slice(0, 8),

    // Combine strengths
    strengths: [
      ...new Set([...geminiAnalysis.strengths, ...backendAnalysis.strengths]),
    ].slice(0, 6),

    // Average years of experience
    yearsOfExperience:
      geminiAnalysis.yearsOfExperience > 0
        ? Math.round(
            (geminiAnalysis.yearsOfExperience +
              backendAnalysis.yearsOfExperience) /
              2
          )
        : backendAnalysis.yearsOfExperience,

    extractedText: backendAnalysis.extractedText,
  };

  return mergedAnalysis;
}
