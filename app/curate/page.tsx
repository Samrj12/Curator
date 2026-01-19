"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Download, FileUser, Target, Pencil } from "lucide-react";
import { ResumeDataParsed } from "@/lib/resumeSchema";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumePDF } from "@/components/resume/ResumePDF";
import { ResumeEditModal } from "@/components/resume/ResumeEditModal";
import { pdf } from "@react-pdf/renderer";

export default function CuratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curatedResume, setCuratedResume] = useState<ResumeDataParsed | null>(
    null,
  );
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleCurate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCuratedResume(null);
    setMatchScore(null);

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/resume/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to curate resume");
      }

      const data = await response.json();
      setCuratedResume(data.curatedResume);
      setMatchScore(data.matchScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!curatedResume) return;
    const blob = await pdf(<ResumePDF data={curatedResume} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${curatedResume.personalInfo.fullName}-resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-80px)] w-screen">
        {/* Left Pane */}
        <div className="bg-background border-r border-border p-6 overflow-y-auto h-full flex flex-col">
          <div className="max-w-xl mx-auto space-y-8 w-full">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-text-secondary tracking-tight">
                Curate Resume
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Paste a job description and generate a tailored resume draft.
                Keep the preview on the right for review.
              </p>
            </div>

            <form onSubmit={handleCurate} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-muted">
                    Job Description
                  </label>
                  <span className="text-xs text-text-muted">
                    {jobDescription.length.toLocaleString()} chars
                  </span>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here (responsibilities, requirements, tech stack, keywords)…"
                  className="w-full h-64 px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-shadow shadow-sm hover:shadow-md"
                />
                <p className="text-xs text-text-muted">
                  Tip: include must-have and preferred requirements, experience etc. for best results.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="mx-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary text-white font-semibold rounded-lg hover:brightness-110 active:brightness-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-primary/20 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating…</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Tailored Resume</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {curatedResume && (
                <div className="p-6 px-6 flex flex-col items-center bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-700" /> Resume Match
                        Score
                      </h3>
                      <div className="text-emerald-950">
                        <span className="text-2xl font-semibold">
                          {matchScore ?? 0}
                        </span>
                        <span className="text-sm font-medium opacity-70">
                          /10
                        </span>
                      </div>
                    </div>

                    {matchScore !== null && (
                      <div className="h-2 w-full bg-emerald-200/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, (matchScore / 10) * 100))}%`,
                          }}
                        />
                      </div>
                    )}

                    <p className="text-xs text-emerald-900/70">
                      Calculated based on ATS relevance between your curated resume and the job description
                    </p>
                  </div>

                  <div className="h-px bg-emerald-200/60 w-full" />

                  <div className="w-full flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white text-emerald-800 font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Right Pane */}
        <div className="bg-surface h-[calc(100vh-80px)] overflow-y-auto">
          {curatedResume ? (
            <div className="flex justify-center h-full pt-2 overflow-x-hidden">
              <div className="scale-[0.55] origin-top drop-shadow-2xl ">
                <div className="w-204 bg-white">
                  <ResumePreview data={curatedResume} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center mb-4">
                <FileUser className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-secondary font-medium">
                Curate your resume
              </p>
              <p className="text-sm text-text-muted">
                Enter a job description on the left to generate a tailored
                resume
              </p>
            </div>
          )}
        </div>
      </div>

      {curatedResume && (
        <ResumeEditModal
          open={editOpen}
          initialData={curatedResume}
          onClose={() => setEditOpen(false)}
          onSave={(next) => setCuratedResume(next)}
        />
      )}
    </div>
  );
}
