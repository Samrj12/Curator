"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResumeDataSchema, type ResumeDataParsed } from "@/lib/resumeSchema";
import { AlertCircle, Plus, Save, Trash2, X } from "lucide-react";

type ResumeEditModalProps = {
  open: boolean;
  initialData: ResumeDataParsed;
  onClose: () => void;
  onSave: (data: ResumeDataParsed) => void;
};

function newId(): string {
  // Browser runtime (client component) should have crypto.randomUUID, but keep a fallback.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function HighlightsInput({
  label,
  values,
  max,
  onChange,
}: {
  label: string;
  values: string[];
  max: number;
  onChange: (v: string[]) => void;
}) {
  const addHighlight = () => {
    if (values.length >= max) return;
    onChange([...values, ""]);
  };
  const updateHighlight = (idx: number, val: string) => {
    const newVals = [...values];
    newVals[idx] = val;
    onChange(newVals);
  };
  const removeHighlight = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-secondary">{label}</label>
        <span className="text-xs text-text-muted">Max {max}</span>
      </div>
      <div className="space-y-2">
        {values.map((val, idx) => (
          <div key={`highlight-${idx}`} className="flex gap-2">
            <input
              className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-gray-50 focus:ring-1 focus:ring-primary outline-hidden"
              value={val}
              onChange={(e) => updateHighlight(idx, e.target.value)}
              placeholder="Add a highlight bullet point..."
            />
            <button
              type="button"
              onClick={() => removeHighlight(idx)}
              className="text-text-muted hover:text-danger"
              aria-label="Remove highlight"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHighlight}
          disabled={values.length >= max}
          className="text-sm text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" /> Add Highlight
        </button>
      </div>
    </div>
  );
}

function TagsInput({
  tags,
  onChange,
  max,
}: {
  tags: string[];
  onChange: (v: string[]) => void;
  max: number;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim() && tags.length < max) {
        onChange([...tags, input.trim()]);
        setInput("");
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-secondary">
        Skills <span className="text-text-muted text-xs font-normal">(Type & Enter)</span>{" "}
        <span className="text-xs font-normal opacity-70">Max {max}</span>
      </label>
      <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-surface">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded bg-primary text-white text-xs flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, i) => i !== idx))}
              className="hover:text-danger"
              aria-label="Remove skill"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= max}
          placeholder={tags.length >= max ? "Max skills reached" : "Type skill..."}
          className="flex-1 bg-transparent outline-hidden min-w-20 text-sm"
        />
      </div>
    </div>
  );
}

export function ResumeEditModal({ open, initialData, onClose, onSave }: ResumeEditModalProps) {
  const [draft, setDraft] = useState<ResumeDataParsed>(initialData);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    // Reset to fresh data each time the modal opens.
    setDraft(initialData);
    setErrors([]);
  }, [open, initialData]);

  const title = useMemo(() => {
    const name = draft.personalInfo.fullName?.trim();
    return name ? `Edit Resume · ${name}` : "Edit Resume";
  }, [draft.personalInfo.fullName]);

  const handleSave = () => {
    setErrors([]);

    const normalized: ResumeDataParsed = {
      ...draft,
      personalInfo: {
        ...draft.personalInfo,
        fullName: draft.personalInfo.fullName.trim(),
        email: draft.personalInfo.email.trim(),
        phone: draft.personalInfo.phone?.trim() || undefined,
        linkedin: draft.personalInfo.linkedin?.trim() || undefined,
        website: draft.personalInfo.website?.trim() || undefined,
      },
      summary: draft.summary ?? "",
      experience: (draft.experience ?? []).map((exp) => ({
        ...exp,
        company: exp.company.trim(),
        position: exp.position.trim(),
        startDate: exp.startDate.trim(),
        endDate: exp.endDate.trim(),
        location: exp.location.trim(),
        highlights: (exp.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      })),
      education: (draft.education ?? []).map((edu) => ({
        ...edu,
        school: edu.school.trim(),
        degree: edu.degree.trim(),
        field: edu.field.trim(),
        endDate: edu.endDate.trim(),
        grade: edu.grade?.trim() ?? "",
        achievements: edu.achievements?.trim() || undefined,
      })),
      skills: (draft.skills ?? []).map((s) => ({
        ...s,
        category: s.category.trim(),
        items: (s.items ?? []).map((i) => i.trim()).filter(Boolean),
      })),
      projects: draft.projects?.map((p) => ({
        ...p,
        name: p.name.trim(),
        link: p.link?.trim() || undefined,
        highlights: (p.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      })),
    };

    const parsed = ResumeDataSchema.safeParse(normalized);
    if (!parsed.success) {
      const pretty = parsed.error.issues.map((issue) => {
        const path = issue.path.length ? issue.path.join(".") : "resume";
        return `${path}: ${issue.message}`;
      });
      setErrors(pretty);
      return;
    }

    onSave(parsed.data);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />

          {/* Dialog */}
          <div className="relative h-full w-full flex items-center justify-center p-4 sm:p-6">
            <motion.div
              className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/50">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-text-primary truncate">{title}</div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-surface transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-120px)] space-y-6">
                {errors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">Fix the following</div>
                        <ul className="text-xs list-disc pl-5 space-y-0.5">
                          {errors.slice(0, 8).map((e) => (
                            <li key={e}>{e}</li>
                          ))}
                        </ul>
                        {errors.length > 8 && (
                          <div className="text-xs opacity-80">…and {errors.length - 8} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

            {/* Personal */}
            <section className="space-y-3">
              <div className="text-sm font-semibold text-text-primary">Personal</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-muted">Full name</label>
                  <input
                    value={draft.personalInfo.fullName}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        personalInfo: { ...p.personalInfo, fullName: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-muted">Email</label>
                  <input
                    value={draft.personalInfo.email}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        personalInfo: { ...p.personalInfo, email: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-muted">Phone</label>
                  <input
                    value={draft.personalInfo.phone ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        personalInfo: { ...p.personalInfo, phone: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-muted">LinkedIn</label>
                  <input
                    value={draft.personalInfo.linkedin ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        personalInfo: { ...p.personalInfo, linkedin: e.target.value },
                      }))
                    }
                    placeholder="username or full URL"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-text-muted">Website</label>
                  <input
                    value={draft.personalInfo.website ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        personalInfo: { ...p.personalInfo, website: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="space-y-2">
              <div className="text-sm font-semibold text-text-primary">Summary</div>
              <textarea
                value={draft.summary}
                onChange={(e) => setDraft((p) => ({ ...p, summary: e.target.value }))}
                className="w-full h-28 rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </section>

            {/* Experience */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-text-primary">Experience</div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      experience: [
                        ...(p.experience ?? []),
                        {
                          id: newId(),
                          company: "",
                          position: "",
                          startDate: "",
                          endDate: "",
                          location: "",
                          highlights: [],
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-surface border border-border text-text-secondary hover:bg-background"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="space-y-4">
                {draft.experience.map((exp, expIdx) => (
                  <div key={exp.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-semibold text-text-muted">Experience #{expIdx + 1}</div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            experience: p.experience.filter((_, i) => i !== expIdx),
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-danger hover:bg-surface"
                        aria-label="Remove experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Company</label>
                        <input
                          value={exp.company}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.experience];
                              next[expIdx] = { ...next[expIdx], company: e.target.value };
                              return { ...p, experience: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Role</label>
                        <input
                          value={exp.position}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.experience];
                              next[expIdx] = { ...next[expIdx], position: e.target.value };
                              return { ...p, experience: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Start</label>
                        <input
                          value={exp.startDate}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.experience];
                              next[expIdx] = { ...next[expIdx], startDate: e.target.value };
                              return { ...p, experience: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">End</label>
                        <input
                          value={exp.endDate}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.experience];
                              next[expIdx] = { ...next[expIdx], endDate: e.target.value };
                              return { ...p, experience: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-text-muted">Location</label>
                        <input
                          value={exp.location}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.experience];
                              next[expIdx] = { ...next[expIdx], location: e.target.value };
                              return { ...p, experience: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>

                    <HighlightsInput
                      label="Highlights"
                      values={exp.highlights ?? []}
                      max={3}
                      onChange={(values) =>
                        setDraft((p) => {
                          const next = [...p.experience];
                          next[expIdx] = { ...next[expIdx], highlights: values };
                          return { ...p, experience: next };
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-text-primary">Education</div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      education: [
                        ...(p.education ?? []),
                        {
                          id: newId(),
                          school: "",
                          degree: "",
                          field: "",
                          endDate: "",
                          grade: "",
                          achievements: "",
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-surface border border-border text-text-secondary hover:bg-background"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-4">
                {draft.education.map((edu, eduIdx) => (
                  <div key={edu.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-semibold text-text-muted">Education #{eduIdx + 1}</div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            education: p.education.filter((_, i) => i !== eduIdx),
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-danger hover:bg-surface"
                        aria-label="Remove education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">School</label>
                        <input
                          value={edu.school}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.education];
                              next[eduIdx] = { ...next[eduIdx], school: e.target.value };
                              return { ...p, education: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">End date</label>
                        <input
                          value={edu.endDate}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.education];
                              next[eduIdx] = { ...next[eduIdx], endDate: e.target.value };
                              return { ...p, education: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Degree</label>
                        <input
                          value={edu.degree}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.education];
                              next[eduIdx] = { ...next[eduIdx], degree: e.target.value };
                              return { ...p, education: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Field</label>
                        <input
                          value={edu.field}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.education];
                              next[eduIdx] = { ...next[eduIdx], field: e.target.value };
                              return { ...p, education: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">GPA/Grade</label>
                        <input
                          value={edu.grade}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.education];
                              next[eduIdx] = { ...next[eduIdx], grade: e.target.value };
                              return { ...p, education: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-text-muted">Achievements (optional)</label>
                        <input
                          value={edu.achievements ?? ""}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.education];
                              next[eduIdx] = { ...next[eduIdx], achievements: e.target.value };
                              return { ...p, education: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-text-primary">Skills</div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      skills: [
                        ...(p.skills ?? []),
                        {
                          category: "",
                          items: [],
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-surface border border-border text-text-secondary hover:bg-background"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="space-y-4">
                {draft.skills.map((skill, idx) => (
                  <div key={`${skill.category}-${idx}`} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-semibold text-text-muted">Category #{idx + 1}</div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            skills: p.skills.filter((_, i) => i !== idx),
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-danger hover:bg-surface"
                        aria-label="Remove skill category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Category</label>
                        <input
                          value={skill.category}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...p.skills];
                              next[idx] = { ...next[idx], category: e.target.value };
                              return { ...p, skills: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <TagsInput
                          tags={skill.items ?? []}
                          max={10}
                          onChange={(items) =>
                            setDraft((p) => {
                              const next = [...p.skills];
                              next[idx] = { ...next[idx], items };
                              return { ...p, skills: next };
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-text-primary">Projects</div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      projects: [
                        ...((p.projects ?? []) as NonNullable<ResumeDataParsed["projects"]>),
                        {
                          id: newId(),
                          name: "",
                          highlights: [],
                          link: "",
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-surface border border-border text-text-secondary hover:bg-background"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="space-y-4">
                {(draft.projects ?? []).map((proj, projIdx) => (
                  <div key={proj.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-semibold text-text-muted">Project #{projIdx + 1}</div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            projects: (p.projects ?? []).filter((_, i) => i !== projIdx),
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-danger hover:bg-surface"
                        aria-label="Remove project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Name</label>
                        <input
                          value={proj.name}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...(p.projects ?? [])];
                              next[projIdx] = { ...next[projIdx], name: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted">Link (optional)</label>
                        <input
                          value={proj.link ?? ""}
                          onChange={(e) =>
                            setDraft((p) => {
                              const next = [...(p.projects ?? [])];
                              next[projIdx] = { ...next[projIdx], link: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <HighlightsInput
                          label="Highlights"
                          values={proj.highlights ?? []}
                          max={3}
                          onChange={(values) =>
                            setDraft((p) => {
                              const next = [...(p.projects ?? [])];
                              next[projIdx] = { ...next[projIdx], highlights: values };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end mb-2 gap-2 px-5 py-2 border-t border-border bg-background/50">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface border border-border"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-primary text-white shadow-sm hover:brightness-110"
            >
              <Save className="w-4 h-4" />
              Save changes
            </button>
          </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
