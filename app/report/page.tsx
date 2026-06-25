"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ==================== TYPES ====================
interface Finding {
  condition: string;
  severity: "Low" | "Mild" | "Moderate" | "High";
  score: number;
  maxScore: number;
  description: string;
  recommendation: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  title: { en: string; bn: string };
  description: { en: string; bn: string };
  steps?: { en: string[]; bn: string[] };
  category: string;
}

interface AssessmentResult {
  findings: Finding[];
  totalQuestions: number;
  answeredQuestions: number;
  riskLevel: "Low" | "Mild" | "Moderate" | "High";
  criticalFindings: string[];
  summary: { en: string; bn: string };
  timestamp: string;
}

// ==================== MAIN COMPONENT ====================
export default function ReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to get data from localStorage
    const data = localStorage.getItem("reportData");
    console.log("Raw data from localStorage:", data); // Debug log
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log("Parsed data:", parsed); // Debug log
        setResult(parsed);
        // Don't remove immediately - keep it for the report
        // localStorage.removeItem("reportData");
      } catch (e) {
        console.error("Error parsing report data:", e);
      }
    } else {
      console.log("No data found in localStorage");
    }
    setLoading(false);
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Psychological Assessment Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 11.5pt; color: #1a1a1a; background: white; padding: 0; }
          .page { max-width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 20mm 18mm 22mm; }
          .report-title { text-align: center; font-family: 'Arial', sans-serif; font-size: 16pt; font-weight: 700; letter-spacing: 3px; color: #1a1a1a; text-transform: uppercase; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 18px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border: 1.5px solid #1a1a1a; margin-bottom: 22px; }
          .meta-cell { padding: 6px 10px; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; }
          .meta-cell:nth-child(3n) { border-right: none; }
          .meta-label { font-family: 'Arial', sans-serif; font-size: 8.5pt; font-weight: 600; color: #1a1a1a; margin-bottom: 1px; }
          .meta-value { font-size: 10.5pt; color: #222; }
          h2 { font-family: 'Arial', sans-serif; font-size: 12pt; font-weight: 700; color: #1a1a1a; margin: 18px 0 7px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
          h3 { font-family: 'Arial', sans-serif; font-size: 10.5pt; font-weight: 600; color: #1a1a1a; margin: 12px 0 5px; }
          p, li { font-size: 11pt; line-height: 1.65; color: #222; }
          ul, ol { padding-left: 20px; margin: 6px 0; }
          li { margin-bottom: 3px; }
          .severity-high { color: #cc0000; font-weight: 600; }
          .severity-moderate { color: #cc8800; font-weight: 600; }
          .severity-mild { color: #2d7d2d; font-weight: 600; }
          .severity-low { color: #2d7d2d; font-weight: 600; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .table th { background: #f0f0f0; font-family: 'Arial', sans-serif; font-size: 9pt; font-weight: 600; padding: 6px 10px; border: 1px solid #ccc; text-align: left; }
          .table td { padding: 6px 10px; border: 1px solid #ccc; font-size: 10.5pt; }
          .disclaimer { margin-top: 24px; padding: 12px 16px; background: #f8f8f8; border-left: 3px solid #cc0000; font-size: 9.5pt; color: #555; line-height: 1.6; }
          .footer { text-align: center; font-family: 'Arial', sans-serif; font-size: 8pt; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 9pt; font-weight: 600; font-family: 'Arial', sans-serif; }
          .badge-high { background: #ffebee; color: #cc0000; }
          .badge-moderate { background: #fff3e0; color: #cc8800; }
          .badge-mild { background: #e8f5e9; color: #2d7d2d; }
          .badge-low { background: #e8f5e9; color: #2d7d2d; }
          .finding-block { background: #fafafa; padding: 12px 16px; margin: 8px 0; border-left: 3px solid #1a1a1a; }
          .finding-block.high { border-left-color: #cc0000; }
          .finding-block.moderate { border-left-color: #cc8800; }
          .finding-block.mild { border-left-color: #2d7d2d; }
        </style>
      </head>
      <body>
        <div class="page">${printContent}</div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 600);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f4f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#8b0000" }}>Loading Report...</div>
          <div style={{ marginTop: 8, color: "#666" }}>Please wait</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f4f0" }}>
        <div style={{ textAlign: "center", background: "white", padding: "40px", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: 500 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontSize: 20, color: "#1a1a1a", marginBottom: 8 }}>No Report Data Found</h2>
          <p style={{ color: "#666", marginBottom: 16 }}>Please complete the assessment first.</p>
          <button
            onClick={() => router.push("/")}
            style={{ background: "#8b0000", color: "white", border: "none", padding: "10px 24px", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
          >
            Go to Assessment
          </button>
        </div>
      </div>
    );
  }

  const t = {
    en: {
      title: "Automated Confidential Psychological Assessment Report",
      assessmentDate: "Assessment Date",
      reportId: "Report ID",
      riskLevel: "Risk Level",
      questionsAnswered: "Questions Answered",
      summary: "Assessment Summary",
      symptomDomains: "Symptom Domains",
      domain: "Domain",
      severity: "Severity",
      score: "Score",
      status: "Status",
      detailedFindings: "Detailed Findings",
      scientificExplanation: "Scientific Explanation",
      recommendations: "Recommendations",
      recommendedInterventions: "Recommended Interventions",
      disclaimer: "Disclaimer",
      disclaimerText: "This is an automated screening report for informational purposes only. It does not constitute a medical diagnosis. Never make any medication decisions based solely on this assessment. If you are experiencing severe distress or suicidal thoughts, please contact emergency services or a mental health professional immediately.",
      downloadPdf: "⬇ Download PDF",
      backToAssessment: "← Back to Assessment"
    },
    bn: {
      title: "স্বয়ংক্রিয় গোপনীয় মনস্তাত্ত্বিক মূল্যায়ন প্রতিবেদন",
      assessmentDate: "মূল্যায়নের তারিখ",
      reportId: "প্রতিবেদন আইডি",
      riskLevel: "ঝুঁকির মাত্রা",
      questionsAnswered: "উত্তরপ্রাপ্ত প্রশ্ন",
      summary: "মূল্যায়নের সারাংশ",
      symptomDomains: "লক্ষণ এলাকা",
      domain: "এলাকা",
      severity: "তীব্রতা",
      score: "স্কোর",
      status: "অবস্থা",
      detailedFindings: "বিস্তারিত ফলাফল",
      scientificExplanation: "বৈজ্ঞানিক ব্যাখ্যা",
      recommendations: "সুপারিশ",
      recommendedInterventions: "প্রস্তাবিত হস্তক্ষেপ",
      disclaimer: "দাবিত্যাগ",
      disclaimerText: "এটি একটি স্বয়ংক্রিয় স্ক্রীনিং প্রতিবেদন যা শুধুমাত্র তথ্যগত উদ্দেশ্যে। এটি কোনো চিকিৎসা নির্ণয় নয়। কখনোই এই মূল্যায়নের ভিত্তিতে কোনো ওষুধ সেবনের সিদ্ধান্ত নেবেন না। যদি আপনি তীব্র কষ্ট বা আত্মহত্যার চিন্তায় ভোগেন, তাহলে অবিলম্বে জরুরি পরিষেবা বা মানসিক স্বাস্থ্য পেশাদারের সাথে যোগাযোগ করুন।",
      downloadPdf: "⬇ পিডিএফ ডাউনলোড করুন",
      backToAssessment: "← মূল্যায়নে ফিরে যান"
    }
  };

  const lang = t[language];

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "High": return "severity-high";
      case "Moderate": return "severity-moderate";
      case "Mild": return "severity-mild";
      default: return "severity-low";
    }
  };

  const getBadgeClass = (severity: string) => {
    switch (severity) {
      case "High": return "badge-high";
      case "Moderate": return "badge-moderate";
      case "Mild": return "badge-mild";
      default: return "badge-low";
    }
  };

  const getStatusText = (severity: string) => {
    switch (severity) {
      case "High": return "Requires Immediate Attention";
      case "Moderate": return "Monitor Closely";
      case "Mild": return "Mild Concern";
      default: return "Low Concern";
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Debug log to see what data we have
  console.log("Result data in render:", result);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Georgia', serif", padding: "20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Language Toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setLanguage("en")}
            style={{
              padding: "6px 16px",
              border: language === "en" ? "2px solid #8b0000" : "1px solid #ccc",
              borderRadius: 4,
              background: language === "en" ? "#8b0000" : "white",
              color: language === "en" ? "white" : "#333",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600
            }}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("bn")}
            style={{
              padding: "6px 16px",
              border: language === "bn" ? "2px solid #8b0000" : "1px solid #ccc",
              borderRadius: 4,
              background: language === "bn" ? "#8b0000" : "white",
              color: language === "bn" ? "white" : "#333",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600
            }}
          >
            বাংলা
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          style={{
            background: "transparent",
            border: "none",
            color: "#8b0000",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 16,
            padding: "8px 0"
          }}
        >
          {lang.backToAssessment}
        </button>

        {/* Report Content */}
        <div style={{ background: "white", boxShadow: "0 4px 32px rgba(0,0,0,0.12)", padding: "40px 48px", borderRadius: 4 }} ref={printRef}>
          {/* Title */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #1a1a1a", paddingBottom: 12, marginBottom: 18 }}>
            <h1 style={{ fontFamily: "'Arial', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
              {lang.title}
            </h1>
          </div>

          {/* Meta Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", border: "1.5px solid #1a1a1a", marginBottom: 22 }}>
            <div style={{ padding: "6px 10px", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
              <div style={{ fontFamily: "'Arial', sans-serif", fontSize: 8.5, fontWeight: 600, marginBottom: 1 }}>{lang.assessmentDate}</div>
              <div style={{ fontSize: 10.5 }}>{formatDate(result.timestamp)}</div>
            </div>
            <div style={{ padding: "6px 10px", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
              <div style={{ fontFamily: "'Arial', sans-serif", fontSize: 8.5, fontWeight: 600, marginBottom: 1 }}>{lang.reportId}</div>
              <div style={{ fontSize: 10.5 }}>PA-{Date.now().toString().slice(-8)}</div>
            </div>
            <div style={{ padding: "6px 10px", borderBottom: "1px solid #ccc" }}>
              <div style={{ fontFamily: "'Arial', sans-serif", fontSize: 8.5, fontWeight: 600, marginBottom: 1 }}>{lang.riskLevel}</div>
              <div style={{ fontSize: 10.5 }}>
                <span className={getBadgeClass(result.riskLevel)} style={{ padding: "2px 10px", borderRadius: 12, fontSize: 9, fontWeight: 600, display: "inline-block" }}>
                  {result.riskLevel}
                </span>
              </div>
            </div>
            <div style={{ padding: "6px 10px", borderRight: "1px solid #ccc" }}>
              <div style={{ fontFamily: "'Arial', sans-serif", fontSize: 8.5, fontWeight: 600, marginBottom: 1 }}>{lang.questionsAnswered}</div>
              <div style={{ fontSize: 10.5 }}>{result.answeredQuestions} / {result.totalQuestions}</div>
            </div>
          </div>

          {/* Summary */}
          <h2>{lang.summary}</h2>
          <p style={{ marginBottom: 16 }}>{result.summary[language]}</p>

          {/* Critical Alerts */}
          {result.criticalFindings && result.criticalFindings.length > 0 && (
            <div style={{ background: "#ffebee", padding: "12px 16px", marginBottom: 16, borderLeft: "4px solid #cc0000" }}>
              <p style={{ fontWeight: 600, color: "#cc0000", margin: 0 }}>⚠️ {language === "en" ? "Critical Alerts" : "জরুরি সতর্কতা"}</p>
              {result.criticalFindings.map((alert, i) => (
                <p key={i} style={{ margin: "4px 0 0 0", fontSize: "10.5pt", color: "#cc0000" }}>{alert}</p>
              ))}
            </div>
          )}

          {/* Symptom Domains Table */}
          {result.findings && result.findings.length > 0 && (
            <>
              <h2>{lang.symptomDomains}</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>{lang.domain}</th>
                    <th>{lang.severity}</th>
                    <th>{lang.score}</th>
                    <th>{lang.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.findings.map((finding, idx) => (
                    <tr key={idx}>
                      <td>{finding.condition}</td>
                      <td><span className={getBadgeClass(finding.severity)} style={{ padding: "2px 10px", borderRadius: 12, fontSize: 9, fontWeight: 600 }}>{finding.severity}</span></td>
                      <td>{finding.score}/{finding.maxScore}</td>
                      <td>{getStatusText(finding.severity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Detailed Findings */}
          {result.findings && result.findings.length > 0 && (
            <>
              <h2 style={{ marginTop: 24 }}>{lang.detailedFindings}</h2>
              {result.findings.map((finding, idx) => (
                <div key={idx} className={`finding-block ${finding.severity.toLowerCase()}`} style={{ background: "#fafafa", padding: "12px 16px", margin: "8px 0", borderLeft: `3px solid ${finding.severity === "High" ? "#cc0000" : finding.severity === "Moderate" ? "#cc8800" : "#2d7d2d"}` }}>
                  <h3 style={{ margin: "0 0 4px 0" }}>
                    {finding.condition}
                    <span className={getBadgeClass(finding.severity)} style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 12, fontSize: 9, fontWeight: 600 }}>{finding.severity}</span>
                  </h3>
                  <p style={{ margin: "4px 0", fontSize: "10.5pt" }}><strong>{lang.score}:</strong> {finding.score}/{finding.maxScore}</p>
                  
                  <p style={{ margin: "8px 0 4px 0", fontSize: "10.5pt" }}><strong>{lang.scientificExplanation}:</strong> {finding.description}</p>
                  
                  <p style={{ margin: "8px 0 4px 0", fontSize: "10.5pt" }}><strong>{lang.recommendations}:</strong> {finding.recommendation}</p>
                  
                  {finding.exercises && finding.exercises.length > 0 && (
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: 20, fontSize: "10.5pt" }}>
                      {finding.exercises.map((ex, exIdx) => (
                        <li key={exIdx}>
                          <strong>{ex.title[language]}</strong> - {ex.description[language]}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Recommended Interventions */}
          {result.findings && result.findings.some(f => f.exercises && f.exercises.length > 0) && (
            <>
              <h2 style={{ marginTop: 24 }}>{lang.recommendedInterventions}</h2>
              {result.findings.flatMap(f => f.exercises || []).map((exercise, idx) => (
                <div key={idx} style={{ background: "#fafafa", padding: "12px 16px", margin: "8px 0", borderLeft: "3px solid #2d7d2d" }}>
                  <h3 style={{ margin: "0 0 4px 0" }}>🧘 {exercise.title[language]}</h3>
                  <p style={{ margin: "4px 0", fontSize: "10.5pt" }}>{exercise.description[language]}</p>
                  {exercise.steps && (
                    <ol style={{ margin: "4px 0 0 0", paddingLeft: 20, fontSize: "10.5pt" }}>
                      {exercise.steps[language].map((step, stepIdx) => (
                        <li key={stepIdx}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Disclaimer */}
          <div className="disclaimer" style={{ marginTop: 24, padding: "12px 16px", background: "#f8f8f8", borderLeft: "3px solid #cc0000", fontSize: 9.5, color: "#555", lineHeight: 1.6 }}>
            <strong>{lang.disclaimer}</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "9.5pt" }}>{lang.disclaimerText}</p>
          </div>

          {/* Footer */}
          <div className="footer" style={{ textAlign: "center", fontFamily: "'Arial', sans-serif", fontSize: 8, color: "#999", marginTop: 30, borderTop: "1px solid #eee", paddingTop: 10 }}>
            Generated by Psychological Assessment System
            <br />
            Report ID: PA-{Date.now().toString().slice(-8)} | For Personal Use Only
          </div>
        </div>

        {/* Download Button */}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <button
            onClick={handlePrint}
            style={{
              background: "#8b0000",
              color: "white",
              border: "none",
              padding: "12px 40px",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#6b0000"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#8b0000"}
          >
            {lang.downloadPdf}
          </button>
        </div>
      </div>
    </div>
  );
}