import React from "react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
  id?: string;
}

const Separator = () => <span className="mx-1">|</span>;

export const ResumePreview = ({ data, id }: ResumePreviewProps) => {
  return (
    <div 
        id={id}
        className="aspect-[1/1.414] bg-white text-black p-[0.5in] mx-auto shadow-2xl box-border"
        style={{ 
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '10.5pt',
            lineHeight: 1.15
        }}
    >
      {/* HEADER */}
      <div className="flex flex-col items-center mb-3">
        <div className="text-[24pt] mb-3 leading-none">{data.personalInfo.fullName}</div>
        
        <div className="flex flex-wrap justify-center items-center gap-x-1.5 text-[10pt]">
            {/* Email */}
            <div className="flex items-center">
                <svg viewBox="0 0 24 24" width="10" height="10" className="mr-[3px]">
                    <path
                        d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="2"
                        stroke="black"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
                <span>{data.personalInfo.email}</span>
            </div>

            {/* Phone */}
            {data.personalInfo.phone && (
                <>
                    <Separator />
                    <div className="flex items-center">
                        <svg viewBox="0 0 24 24" width="10" height="10" className="mr-[3px]">
                            <path
                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                        <span>{data.personalInfo.phone}</span>
                    </div>
                </>
            )}

            {/* LinkedIn */}
            {data.personalInfo.linkedin && (
                <>
                    <Separator />
                    <div className="flex items-center">
                        <svg viewBox="0 0 24 24" width="10" height="10" className="mr-[3px]">
                            <path
                                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <rect
                                x="2"
                                y="9"
                                width="4"
                                height="12"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <circle
                                cx="4"
                                cy="4"
                                r="2"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                        <a 
                            href={`https://www.linkedin.com/in/${data.personalInfo.linkedin}`}
                            className="no-underline text-black"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {data.personalInfo.linkedin.replace(/^https?:\/\//, "")}
                        </a>
                    </div>
                </>
            )}

            {/* Website */}
            {data.personalInfo.website && (
                <>
                    <Separator />
                    <div className="flex items-center">
                        <svg viewBox="0 0 24 24" width="10" height="10" className="mr-[3px]">
                             <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M2 12h20"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                        <a 
                            href={`https://${data.personalInfo.website}`}
                            className="no-underline text-black"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {data.personalInfo.website.replace(/^https?:\/\//, "")}
                        </a>
                    </div>
                </>
            )}
        </div>
      </div>
        {/* SUMMARY */}
       
      <div className="mb-3">
        <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-1.5 pb-0.5">Summary</h2>
        <div className="text-[10pt]">{data.summary}</div>
      </div>
      {/* EDUCATION */}
      <div className="mb-3">
        <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-1.5 pb-0.5">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-1.5">
            <div className="flex justify-between items-end">
              <div className="text-[11pt] font-bold">{edu.school}</div>
              <div className="text-[10pt] italic text-right">{edu.endDate}</div>
            </div>
            <div className="flex justify-between items-end">
                <div className="text-[10pt] italic">{edu.degree} in {edu.field}</div>
                <div className="text-[10pt] italic">GPA: {edu.grade}</div>
            </div>
            {edu.achievements && edu.achievements.length > 0 && (
              <div className="mt-0.5 text-[10pt]">
                <span className="font-bold">Achievements: </span>
                <span>{edu.achievements}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* EXPERIENCE */}
      <div className="mb-3">
        <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-1.5 pb-0.5">Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-1.5">
            <div className="flex justify-between items-end">
              <div className="text-[11pt] font-bold">{exp.company}</div>
              <div className="text-[10pt] italic text-right">{exp.startDate} – {exp.endDate}</div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-[10pt] italic text-right">{exp.position}</div>
              <div className="text-[10pt] italic text-right">{exp.location}</div>
            </div>
            <div className="mt-0.5">
              {exp.highlights.map((highlight, i) => (
                <div key={i} className="flex mb-px pl-2">
                    <span className="w-2.5 text-[10pt] leading-3">•</span>
                    <span className="flex-1 text-[10pt]">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PROJECTS */}
      {data.projects && (
        <div className="mb-3">
          <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-1.5 pb-0.5">Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-1.5">
              <div className="flex justify-start items-center">
                <span className="text-[11pt] font-bold">{proj.name}</span>
                {proj.link && (
                    <>
                        <span className="mx-1">{" "}|{" "}</span>
                        <a href={`https://${proj.link}`} className="underline text-black">Link</a>
                    </>
                )}
              </div>
              <div className="mt-0.5">
                {proj.highlights.map((highlight, i) => (
                  <div key={i} className="flex mb-px pl-2">
                    <span className="w-2.5 text-[10pt] leading-3">•</span>
                    <span className="flex-1 text-[10pt]">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      <div className="mb-3">
        <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-1.5 pb-0.5">Skills</h2>
         {data.skills.map((skill, i) => (
          <div key={i} className="text-[10pt]">
            <span className="font-bold mr-1">{skill.category}: </span>
            <span>{skill.items.join(", ")}</span>
          </div>
         ))}
      </div>
    </div>
  );
};
