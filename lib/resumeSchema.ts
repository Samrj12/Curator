import { z } from "zod";

export const ResumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1),
    email: z.string().min(1),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().default(""),
  experience: z
    .array(
      z.object({
        id: z.string().min(1),
        company: z.string().min(1),
        position: z.string().min(1),
        startDate: z.string().min(1),
        endDate: z.string().min(1),
        location: z.string().min(1),
        highlights: z.array(z.string()).max(3).default([]),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        id: z.string().min(1),
        school: z.string().min(1),
        degree: z.string().min(1),
        field: z.string().min(1),
        endDate: z.string().min(1),
        grade: z.string().default(""),
        achievements: z.string().optional(),
      })
    )
    .default([]),
  skills: z
    .array(
      z.object({
        category: z.string().min(1),
        items: z.array(z.string()).max(10).default([]),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        highlights: z.array(z.string()).max(3).default([]),
        link: z.string().optional(),
      })
    )
    .optional(),
});

export type ResumeDataParsed = z.infer<typeof ResumeDataSchema>;
