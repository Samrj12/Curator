"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ResumeData } from "@/types/resume";
import { ResumePDF } from "./ResumePDF";

// Import PDFViewer dynamically to prevent server-side rendering issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-500">
        Loading PDF Renderer...
      </div>
    ),
  }
);

interface PDFDisplayProps {
  data: ResumeData;
}

export const PDFDisplay = ({ data }: PDFDisplayProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center bg-gray-100 p-6">
      <PDFViewer className="border-none shadow-lg" showToolbar={false}>
        <ResumePDF data={data} />
      </PDFViewer>
    </div>
  );
};
