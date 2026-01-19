"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Save, Loader2, AlertCircle } from "lucide-react";
import { ProfileData } from "@/types/resume";

const INITIAL_DATA: ProfileData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    website: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(INITIAL_DATA);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchProfile = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.resume) {
          setProfileData({ ...INITIAL_DATA, ...userData.resume });
        } else {
          setProfileData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: session?.user?.name || "",
              email: session?.user?.email || "",
            },
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const validateConstraints = (data: ProfileData) => {
    const errors: string[] = [];

    // Education: min 1, max 3
    if (data.education.length < 1)
      errors.push("Minimum 1 Education entry is required.");
    if (data.education.length > 3)
      errors.push("Maximum 3 Education entries allowed.");

    // Experience: min 3, max 8
    if (data.experience.length < 3)
      errors.push("Minimum 3 Experience entries are required.");
    if (data.experience.length > 8)
      errors.push("Maximum 8 Experience entries allowed.");

    // Projects: min 0, max 10
    if (data.projects && data.projects.length > 10)
      errors.push("Maximum 10 Project entries allowed.");

    // Skills: max 4 categories, max 10 entries per category
    if (data.skills.length > 4)
      errors.push("Maximum 4 Skill categories allowed.");
    data.skills.forEach((cat, idx) => {
      if (cat.items.length > 10)
        errors.push(
          `Category "${cat.category || "Run-date"}" has too many skills (max 10).`,
        );
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationErrors = validateConstraints(profileData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      window.scrollTo(0, 0);
      return;
    }

    setSaving(true);
    try {
      if (!session?.user?.id) throw new Error("No user ID");
      const userDocRef = doc(db, "users", session.user.id);

      // Save merged with user data or just update the field
      await updateDoc(userDocRef, {
        resume: profileData,
      });

      setSuccess("Profile saved successfully!");
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // Helper to update simple fields
  const updatePersonalInfo = (
    field: keyof typeof profileData.personalInfo,
    value: string,
  ) => {
    setProfileData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex justify-center items-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center text-text-secondary">
          <h1 className="text-3xl">Edit Your Profile</h1>
          <p className="mt-2 ">Keep your resume information up to date.</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <section className="bg-background p-6 rounded-xl shadow-xs border border-border">
            <h2 className="text-xl font-semibold text-text mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.personalInfo.fullName}
                onChange={(v) => updatePersonalInfo("fullName", v.target.value)}
                required
              />
              <Input
                label="Email"
                value={profileData.personalInfo.email}
                onChange={(v) => updatePersonalInfo("email", v.target.value)}
                required
                type="email"
              />
              <Input
                label="Phone"
                value={profileData.personalInfo.phone || ""}
                onChange={(v) => updatePersonalInfo("phone", v.target.value)}
              />
              <Input
                label="LinkedIn"
                value={profileData.personalInfo.linkedin || ""}
                onChange={(v) => updatePersonalInfo("linkedin", v.target.value)}
              />
              <Input
                label="Website"
                value={profileData.personalInfo.website || ""}
                onChange={(v) => updatePersonalInfo("website", v.target.value)}
                className="md:col-span-2"
              />
            </div>
          </section>

          {/* Experience */}
          <SectionList
            title="Experience"
            subtitle="Minimum 3, Maximum 8 entries"
            items={profileData.experience}
            min={3}
            max={8}
            onAdd={() =>
              setProfileData((prev) => ({
                ...prev,
                experience: [
                  ...prev.experience,
                  {
                    id: crypto.randomUUID(),
                    company: "",
                    position: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                    location: "",
                  },
                ],
              }))
            }
            onRemove={(index) =>
              setProfileData((prev) => ({
                ...prev,
                experience: prev.experience.filter((_, i) => i !== index),
              }))
            }
            renderItem={(item, index) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company"
                  value={item.company}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "experience",
                      index,
                      "company",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Position"
                  value={item.position}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "experience",
                      index,
                      "position",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Location"
                  value={item.location}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "experience",
                      index,
                      "location",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Start Date"
                  value={item.startDate}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "experience",
                      index,
                      "startDate",
                      v.target.value,
                    )
                  }
                  required
                  placeholder="e.g. Jan 2020"
                />
                <Input
                  label="End Date"
                  value={item.endDate}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "experience",
                      index,
                      "endDate",
                      v.target.value,
                    )
                  }
                  required
                  placeholder="Present"
                />
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 mt-1 rounded-md border border-border bg-surface text-text focus:ring-2 focus:ring-primary  outline-none min-h-20"
                    value={item.description}
                    onChange={(e) =>
                      updateItemInList(
                        profileData,
                        setProfileData,
                        "experience",
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe your role and key achievements..."
                  />
                </div>
              </div>
            )}
          />

          {/* Education */}
          <SectionList
            title="Education"
            subtitle="Minimum 1, Maximum 3 entries"
            items={profileData.education}
            min={1}
            max={3}
            onAdd={() =>
              setProfileData((prev) => ({
                ...prev,
                education: [
                  ...prev.education,
                  {
                    id: crypto.randomUUID(),
                    school: "",
                    degree: "",
                    field: "",
                    endDate: "",
                    grade: "",
                  },
                ],
              }))
            }
            onRemove={(index) =>
              setProfileData((prev) => ({
                ...prev,
                education: prev.education.filter((_, i) => i !== index),
              }))
            }
            renderItem={(item, index) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="School"
                  value={item.school}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "education",
                      index,
                      "school",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Degree"
                  value={item.degree}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "education",
                      index,
                      "degree",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Field of Study"
                  value={item.field}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "education",
                      index,
                      "field",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="End Date"
                  value={item.endDate}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "education",
                      index,
                      "endDate",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Grade/GPA"
                  value={item.grade}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "education",
                      index,
                      "grade",
                      v.target.value,
                    )
                  }
                />
                <Input
                  label="Achievements"
                  value={item.achievements || ""}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "education",
                      index,
                      "achievements",
                      v.target.value,
                    )
                  }
                />
              </div>
            )}
          />

          {/* Skills */}
          <SectionList
            title="Skills"
            subtitle="Max 4 categories, Max 10 skills per category"
            items={profileData.skills}
            min={0}
            max={4}
            addItemLabel="Add Category"
            onAdd={() =>
              setProfileData((prev) => ({
                ...prev,
                skills: [...prev.skills, { category: "", items: [] }],
              }))
            }
            onRemove={(index) =>
              setProfileData((prev) => ({
                ...prev,
                skills: prev.skills.filter((_, i) => i !== index),
              }))
            }
            renderItem={(item, index) => (
              <div className="space-y-4">
                <Input
                  label="Category Name"
                  value={item.category}
                  onChange={(v) => {
                    const newData = { ...profileData };
                    newData.skills[index].category = v.target.value;
                    setProfileData(newData);
                  }}
                  placeholder="e.g. Frontend, Backend"
                  required
                />

                <TagsInput
                  tags={item.items}
                  onChange={(items) => {
                    const newData = { ...profileData };
                    newData.skills[index].items = items;
                    setProfileData(newData);
                  }}
                  max={10}
                />
              </div>
            )}
          />

          <SectionList
            title="Projects"
            subtitle="Minimum 0, Maximum 10 entries"
            items={profileData.projects || []}
            min={0}
            max={10}
            onAdd={() =>
              setProfileData((prev) => ({
                ...prev,
                projects: [
                  ...(prev.projects || []),
                  {
                    id: crypto.randomUUID(),
                    name: "",
                    description: "",
                    link: "",
                  },
                ],
              }))
            }
            onRemove={(index) =>
              setProfileData((prev) => ({
                ...prev,
                projects: (prev.projects || []).filter((_, i) => i !== index),
              }))
            }
            renderItem={(item, index) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Name"
                  value={item.name}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "projects",
                      index,
                      "name",
                      v.target.value,
                    )
                  }
                  required
                />
                <Input
                  label="Link"
                  value={item.link || ""}
                  onChange={(v) =>
                    updateItemInList(
                      profileData,
                      setProfileData,
                      "projects",
                      index,
                      "link",
                      v.target.value,
                    )
                  }
                  placeholder="https://..."
                />
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 mt-1 rounded-md border border-border bg-surface text-text focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                    value={item.description}
                    onChange={(e) =>
                      updateItemInList(
                        profileData,
                        setProfileData,
                        "projects",
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe the project and your contributions..."
                  />
                </div>
              </div>
            )}
          />

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Components ---

function Input({
  label,
  className = "",
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium text-text-secondary">
        {label}
        {props.required && <span className="text-danger"> *</span>}
      </label>
      <input
        className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
        {...props}
      />
    </div>
  );
}

function SectionList<T>({
  title,
  subtitle,
  items,
  min,
  max,
  onAdd,
  onRemove,
  renderItem,
  addItemLabel = "Add Entry",
}: {
  title: string;
  subtitle?: string;
  items: T[];
  min: number;
  max: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addItemLabel?: string;
}) {
  return (
    <section className="bg-background p-6 rounded-xl shadow-xs border border-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text">{title}</h2>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={items.length >= max}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-surface border border-primary rounded-md hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" /> {addItemLabel}
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative p-4 rounded-lg bg-surface border border-border group"
          >
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={items.length <= min}
                className="p-1.5 text-text-muted hover:text-danger  rounded-full hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2">{renderItem(item, index)}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-text-muted border-2 border-dashed border-border rounded-lg">
            No {title.toLowerCase()} added yet.
          </div>
        )}
      </div>
    </section>
  );
}

function HighlightsInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const addHighlight = () => onChange([...values, ""]);
  const updateHighlight = (idx: number, val: string) => {
    const newVals = [...values];
    newVals[idx] = val;
    onChange(newVals);
  };
  const removeHighlight = (idx: number) =>
    onChange(values.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="space-y-2">
        {values.map((val, idx) => (
          <div key={`highlight-${idx}`} className="flex gap-2">
            <input
              className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-gray-50 focus:ring-1 focus:ring-primary outline-hidden"
              value={val}
              onChange={(e) => updateHighlight(idx, e.target.value)}
              onBlur={(e) => {
                // Ensure state is saved even if component unmounts
                const newVals = [...values];
                newVals[idx] = e.target.value;
                onChange(newVals);
              }}
              placeholder="Add a highlight bullet point..."
            />
            <button
              type="button"
              onClick={() => removeHighlight(idx)}
              className="text-text-muted hover:text-danger"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHighlight}
          className="text-sm text-primary hover:underline flex items-center gap-1"
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
        Skills (Type & Enter){" "}
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
          placeholder={
            tags.length >= max ? "Max skills reached" : "Type skill..."
          }
          className="flex-1 bg-transparent outline-hidden min-w-20 text-sm"
        />
      </div>
    </div>
  );
}

// Generic updater for lists
function updateItemInList(
  data: any,
  setData: any,
  listKey: string,
  index: number,
  field: string,
  value: string,
) {
  const newData = { ...data };
  if (!newData[listKey]) newData[listKey] = [];
  newData[listKey][index] = { ...newData[listKey][index], [field]: value };
  setData(newData);
}
