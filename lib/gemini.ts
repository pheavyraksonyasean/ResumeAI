import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ResumeAnalysis {
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
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Custom error class for quota exceeded
export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export async function analyzeResumeWithGemini(
  base64PdfData: string,
  fileName: string
): Promise<ResumeAnalysis> {
  // Try multiple models - each may have separate quotas
  const modelNames = [
    "gemini-2.0-flash", // Stable version
    "gemini-1.5-pro", // Pro model
    "gemini-1.5-flash-002", // Specific version
    "gemini-2.0-flash-exp", // Experimental
  ];
  const maxRetries = 3;
  const baseDelay = 5000; // Start with 5 seconds

  const prompt = `You are an expert resume analyzer and ATS (Applicant Tracking System) specialist. Analyze the following resume PDF and provide a comprehensive analysis.

Please analyze the resume and return a JSON object with the following structure (respond ONLY with valid JSON, no markdown):

{
  "atsScore": <number 0-100, based on ATS compatibility, keyword optimization, formatting>,
  "summary": "<brief professional summary of the candidate>",
  "skills": {
    "technical": ["<technical skills like programming languages, frameworks>"],
    "tools": ["<tools and platforms like Git, AWS, Docker>"],
    "soft": ["<soft skills like leadership, communication>"]
  },
  "experience": [
    {
      "title": "<job title>",
      "company": "<company name>",
      "duration": "<start - end or duration>",
      "highlights": ["<key achievements or responsibilities>"]
    }
  ],
  "education": [
    {
      "degree": "<degree name>",
      "institution": "<school/university name>",
      "year": "<graduation year or period>"
    }
  ],
  "keywords": [
    {
      "keyword": "<important keyword found>",
      "count": <number of times it appears>,
      "importance": "<high|medium|low>"
    }
  ],
  "improvements": [
    "<specific actionable suggestions to improve the resume>"
  ],
  "strengths": [
    "<what the resume does well>"
  ],
  "yearsOfExperience": <estimated total years of professional experience>
}

Be thorough and accurate. For the ATS score, consider:
- Keyword optimization (30%)
- Format and structure (25%)
- Relevant experience (25%)
- Skills alignment (20%)

File name: ${fileName}`;

  let lastError: Error | null = null;
  let quotaExhaustedModels: string[] = [];

  // Try each model
  for (const modelName of modelNames) {
    // Retry logic for rate limiting
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Trying Gemini model: ${modelName} (attempt ${attempt}/${maxRetries})`
        );
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64PdfData,
            },
          },
          { text: prompt },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up the response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.slice(7);
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith("```")) {
          cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();

        const analysis: ResumeAnalysis = JSON.parse(cleanedText);

        console.log(`Successfully analyzed with model: ${modelName}`);

        // Validate and set defaults
        return {
          atsScore: Math.min(100, Math.max(0, analysis.atsScore || 0)),
          summary: analysis.summary || "No summary available",
          skills: {
            technical: analysis.skills?.technical || [],
            tools: analysis.skills?.tools || [],
            soft: analysis.skills?.soft || [],
          },
          experience: analysis.experience || [],
          education: analysis.education || [],
          keywords: analysis.keywords || [],
          improvements: analysis.improvements || [],
          strengths: analysis.strengths || [],
          yearsOfExperience: analysis.yearsOfExperience || 0,
        };
      } catch (error: unknown) {
        const errorObj = error as { status?: number; message?: string };
        const errorMessage = errorObj?.message || String(error);
        console.error(
          `Model ${modelName} attempt ${attempt} failed:`,
          errorMessage
        );
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if it's a rate limit error (429)
        if (errorObj?.status === 429 || errorMessage.includes("429")) {
          // Check if quota is completely exhausted (limit: 0)
          if (errorMessage.includes("limit: 0")) {
            console.log(
              `Model ${modelName} quota exhausted, trying next model...`
            );
            quotaExhaustedModels.push(modelName);
            break; // Try next model
          }

          // Otherwise, wait and retry same model
          const waitTime = baseDelay * attempt;
          console.log(
            `Rate limited. Waiting ${waitTime / 1000}s before retry...`
          );
          await delay(waitTime);
          continue;
        }

        // For 404 errors (model not found), try next model
        if (errorObj?.status === 404 || errorMessage.includes("404")) {
          console.log(`Model ${modelName} not available, trying next model...`);
          break;
        }

        // For other errors, try next model
        break;
      }
    }
  }

  // All models failed
  if (quotaExhaustedModels.length === modelNames.length) {
    throw new QuotaExceededError(
      "API quota exhausted for all models. Please try again tomorrow or create a new API key from a DIFFERENT Google account at https://aistudio.google.com/apikey"
    );
  }

  throw new Error(
    `Failed to analyze resume. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );
}
