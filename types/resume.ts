export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string; // "Present" if current
    location: string;
    highlights: string[];
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    field: string;
    endDate: string;
    grade: string;
    achievements?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects?: {
    id: string;
    name: string;
    highlights: string[];
    link?: string;
  }[];
}

export interface ProfileData {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    linkedin?: string;
    website?: string;
  };
  experience: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string; // "Present" if current
    description: string;
    location: string;
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    field: string;
    endDate: string;
    grade: string;
    achievements?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects?: {
    id: string;
    name: string;
    description: string;
    link?: string;
  }[];
}