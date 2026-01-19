import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ResumeDataSchema, type ResumeDataParsed } from "@/lib/resumeSchema";
import OpenAI from "openai";
import { get } from "http";

export const runtime = "nodejs";

const MAX_JOB_DESCRIPTION_CHARS = 12_000;
const MAX_CURATIONS_PER_DAY = 5;

type RateEntry = { count: number; dayKeyUtc: string };
const rateLimitByUserId = new Map<string, RateEntry>();

function getUtcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function checkDailyRateLimit(userId: string): Promise<boolean> {
  const dayKeyUtc = getUtcDayKey();

  const docRef = doc(db, "users", userId);

  const userDoc = await getDoc(docRef);
  if(!userDoc.exists()) {
    return true;
  }
  const current = userDoc.data().curationRateLimit as RateEntry | undefined;

  if (!userDoc.exists() || current === undefined || current.dayKeyUtc !== dayKeyUtc) {
    updateDoc(docRef, {
      curationRateLimit: { count: 1, dayKeyUtc },
    });
    return true;
  }

  if (current.count >= MAX_CURATIONS_PER_DAY) return false;
  current.count += 1;
  await updateDoc(docRef, {
    curationRateLimit: current,
  });
  return true;
}

async function promptAI(
  userProfile: ResumeDataParsed,
  jobDescription: string,
): Promise<{ curatedResume: ResumeDataParsed; matchScore: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in environment");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  const systemPrompt = `You are an expert resume curator. Given a user's profile and a job description, 
create a tailored resume that highlights the most relevant experience, skills, and achievements.
Return ONLY valid JSON matching the schema below. Do not include any markdown or extra text.

Schema:
{
  "personalInfo": { "fullName": string, "email": string, "phone"?: string, "linkedin"?: string, "website"?: string },
  "summary": string,
  "experience": Array<{ id: string, company: string, position: string, startDate: string, endDate: string, highlights: string[], location: string }>,
  "education": Array<{ id: string, school: string, degree: string, field: string, endDate: string, grade: string, achievements?: string }>,
  "skills": Array<{ category: string, items: string[] }>,
  "projects"?: Array<{ id: string, name: string, highlights: string[], link?: string }>
  "matchScore": number, // An integer from 0 to 10 indicating how well the curated resume matches the job description
}

Rules:
- Keep personalInfo unchanged
- Rewrite summary to be highly relevant to the job and concise (3-4 sentences or less than 70 words)
- Select 3 most relevant experience entries that match the job and CURATE them to focus on relevant highlights and match the job requirements
- Use action distinct words and quantify achievements wherever possible following this goal oriented frame (e.g. Accomplished [X] as measured by [Y], by doing [Z])
- Keep all education entries
- Curate skills: select 2-4 categories with max 10 items each, prioritizing job-relevant ones
- Select at most 3 projects that demonstrate required skills
- Curate project highlights to align with job needs. Make sure any technologies mentioned are relevant to the job description if possible
- Ensure the final resume is concise and fits within a one-page format
- Ensure to order projects based on maximum relevance to the job description
- Ensure to order work experience in reverse chronological order
- Each highlight should be at least 30 words long and provide specific details about accomplishments but not more than 40 words
- Provide a matchScore from 0 to 10 based on relevance to the job description
- Scores should be based on technologies match, role match, skills alignment, and experience relevance
- Make highlights specific to how each role relates to the job requirements with not more than 2 highlights per experience/project`;

  const userPrompt = `
User's Current Profile:
${JSON.stringify(userProfile, null, 2)}

Job Description:
${jobDescription}

Please curate and optimize this resume for the job description above.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  try {
    let parsed = JSON.parse(content);
    const matchScore = parsed["matchScore"];
    if (
      typeof matchScore !== "number" ||
      matchScore < 0 ||
      matchScore > 10 ||
      !Number.isInteger(matchScore)
    ) {
      throw new Error("Invalid or missing matchScore in AI response");
    }
    delete parsed["matchScore"];
    const validated = ResumeDataSchema.safeParse(parsed);
    if (validated.success) {
      return { curatedResume: validated.data, matchScore };
    }

    throw new Error(`Schema validation failed: ${validated.error.message}`);
  } catch (e) {
    throw new Error("OpenAI response was not valid JSON");
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(token.id);
    const isWithinLimit = await checkDailyRateLimit(userId);
    if (!isWithinLimit) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${MAX_CURATIONS_PER_DAY} curations/day). Please try again tomorrow.`,
        },
        { status: 429 },
      );
    }

    const { jobDescription } = await req.json();
    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing jobDescription" },
        { status: 400 },
      );
    }

    const normalizedJobDescription = jobDescription.trim();
    if (!normalizedJobDescription) {
      return NextResponse.json(
        { error: "Job description cannot be empty" },
        { status: 400 },
      );
    }

    if (normalizedJobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json(
        {
          error: `Job description is too long (max ${MAX_JOB_DESCRIPTION_CHARS} characters).`,
        },
        { status: 413 },
      );
    }

    // Fetch user's profile from Firestore
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const userData = userDoc.data();
    const userProfile = userData.resume;

    if (!userProfile) {
      return NextResponse.json(
        {
          error:
            "User resume data not found. Please fill out your profile first.",
        },
        { status: 400 },
      );
    }

    const validatedProfile = ResumeDataSchema.safeParse(userProfile);
    if (!validatedProfile.success) {
      return NextResponse.json(
        {
          error:
            "Your saved profile data is invalid. Please open /profile and re-save your information.",
        },
        { status: 400 },
      );
    }

    // Curate resume using AI
    const { curatedResume, matchScore } = await promptAI(
      validatedProfile.data,
      normalizedJobDescription,
    );


    return NextResponse.json({
      curatedResume,
      matchScore,
    });
  } catch (error) {
    console.error("Error in curate route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to curate resume",
      },
      { status: 500 },
    );
  }
}
