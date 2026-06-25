"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ==================== TYPES ====================
interface ReportData {
  clientNumber: string;
  evalDateFrom: string;
  evalDateTo: string;
  reportDate: string;
  evaluatorName: string;
  evaluatorTitle: string;
  institution: string;
  institutionAddress: string;
  institutionPhone: string;
  reasonForReferral: string;
  procedures: string;
  backgroundInfo: string;
  testResults: string;
  summary: string;
  recommendations: string;
}

// ==================== WRAPPER WITH SUSPENSE ====================
export default function ReportPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f4f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#8b0000" }}>Loading Report Generator...</div>
          <div style={{ marginTop: 12, color: "#666" }}>Please wait</div>
        </div>
      </div>
    }>
      <ReportPage />
    </Suspense>
  );
}

// ===== DISABLE STATIC GENERATION =====
export const dynamic = 'force-dynamic';

// ==================== MAIN COMPONENT ====================
function ReportPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ReportData>({
    clientNumber: "",
    evalDateFrom: "",
    evalDateTo: "",
    reportDate: "",
    evaluatorName: "",
    evaluatorTitle: "",
    institution: "",
    institutionAddress: "",
    institutionPhone: "",
    reasonForReferral: "",
    procedures: "",
    backgroundInfo: "",
    testResults: "",
    summary: "",
    recommendations: "",
  });
  
  const [activeTab, setActiveTab] = useState("info");
  const [generating, setGenerating] = useState<{ [key: string]: boolean }>({});
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Load assessment results from URL params
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setAssessmentData(parsed);
        setForm(prev => ({
          ...prev,
          summary: parsed.summary?.["en"] || "",
        }));
      } catch (e) {
        console.error("Error parsing assessment data:", e);
      }
    }
  }, [searchParams]);

  // ... PASTE ALL YOUR EXISTING CODE HERE (aiGenerate, handlePrint, tabs, etc.)
  // ... I already gave you the full code earlier in this conversation

  // ... return statement with all the JSX
}