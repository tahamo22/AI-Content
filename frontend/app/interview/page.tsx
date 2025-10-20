"use client";
import { useEffect, useState } from "react";
import InterviewSession from "@/components/InterviewSession/InterviewSession";

export default function InterviewPage() {
  const [backendUrl, setBackendUrl] = useState<string>("");
  useEffect(() => {
    setBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000");
  }, []);
  if (!backendUrl) return null;
  return <InterviewSession backendUrl={backendUrl} />;
}
