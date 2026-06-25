"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

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

const initialForm: ReportData = {
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
};

const sectionLabels = [
  { key: "reasonForReferral" as keyof ReportData, label: "Reason for Referral" },
  { key: "procedures" as keyof ReportData, label: "Procedures for Evaluation" },
  { key: "backgroundInfo" as keyof ReportData, label: "Relevant Background Information" },
  { key: "testResults" as keyof ReportData, label: "Test Results & Observations" },
  { key: "summary" as keyof ReportData, label: "Summary" },
  { key: "recommendations" as keyof ReportData, label: "Recommendations" },
];

// ==================== WRAPPER ====================
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

export const dynamic = 'force-dynamic';

// ==================== MAIN COMPONENT ====================
function ReportPage() {
  const router = useRouter();
  const [form, setForm] = useState<ReportData>(initialForm);
  const [activeTab, setActiveTab] = useState("info");
  const [generating, setGenerating] = useState<{ [key: string]: boolean }>({});
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Load assessment results from localStorage
  useEffect(() => {
    const data = localStorage.getItem('reportData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setAssessmentData(parsed);
        setForm(prev => ({
          ...prev,
          summary: parsed.summary?.["en"] || "",
        }));
        localStorage.removeItem('reportData');
      } catch (e) {
        console.error("Error parsing assessment data:", e);
      }
    }
  }, []);

  const update = (key: keyof ReportData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const aiGenerate = async (sectionKey: keyof ReportData, label: string) => {
    setGenerating((prev) => ({ ...prev, [sectionKey]: true }));
    
    try {
      const mockResponses: Record<string, string> = {
        reasonForReferral: `The client was referred for a comprehensive psychological evaluation to assess cognitive functioning, emotional well-being, and overall mental health status. Concerns were raised regarding potential psychological symptoms that may be impacting daily functioning. The evaluation aims to provide diagnostic clarity and inform evidence-based treatment recommendations.`,
        
        procedures: `The following standardized procedures were utilized in this evaluation:
• Comprehensive Clinical Interview with the client
• Multi-domain Psychological Screening Questionnaire (79 items)
• Severity Rating Scale Analysis (Likert-scale scoring)
• Clinical Indicator Pattern Recognition
• Cross-domain Symptom Correlation Analysis
• Evidence-based Recommendation Algorithm
• Risk Level Stratification Protocol`,
        
        backgroundInfo: `The client presents with symptoms that may benefit from a comprehensive mental health assessment. Based on the screening results, multiple clinical domains were identified that warrant further investigation. The client's responses suggest patterns consistent with various psychological conditions that may require targeted intervention. Current functioning appears to be impacted across multiple life domains.`,
        
        testResults: `Assessment results indicate elevated symptoms across multiple clinical domains. The pattern of responses suggests significant psychological distress that may be impacting daily functioning. Specific areas of concern include mood regulation, anxiety symptoms, and potential cognitive patterns that warrant further clinical investigation. Standardized measures reveal clinically significant elevations in several symptom clusters. Behavioral observations during the assessment were consistent with reported symptoms.`,
        
        summary: `Based on the comprehensive screening assessment, the client demonstrates symptoms consistent with potential psychological concerns that would benefit from professional clinical evaluation. The pattern of results suggests the presence of significant symptom clusters that may be impacting daily functioning and quality of life. Continued monitoring and professional support are recommended to address identified concerns.`,
        
        recommendations: `Based on the assessment findings, the following evidence-based recommendations are made:
1. Comprehensive clinical evaluation by a licensed mental health professional
2. Consideration of targeted therapeutic interventions based on identified symptom domains
3. Implementation of recommended coping strategies and self-management techniques
4. Regular monitoring of symptom progression and treatment response
5. Follow-up assessment to evaluate treatment effectiveness and adjust interventions as needed`
      };

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = mockResponses[sectionKey] || `[AI Generated Content for ${label} - Please review and edit as needed]`;
      update(sectionKey, response);
      
    } catch (e) {
      console.error("AI Generation Error:", e);
    }
    setGenerating((prev) => ({ ...prev, [sectionKey]: false }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Psychological Report - ${form.clientNumber || "Client"}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'EB Garamond', Georgia, serif; font-size: 11.5pt; color: #1a1a1a; background: white; padding: 0; }
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 20mm 18mm 22mm; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #8b0000; padding-bottom: 14px; margin-bottom: 18px; }
          .logo-block { display: flex; align-items: center; gap: 12px; }
          .logo-icon { width: 44px; height: 44px; background: #8b0000; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
          .logo-icon svg { fill: white; width: 28px; height: 28px; }
          .univ-name { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 4px; color: #1a1a1a; line-height: 1; }
          .univ-sub { font-family: 'Inter', sans-serif; font-size: 7px; letter-spacing: 6px; color: #555; margin-top: 3px; }
          .evaluator-block { text-align: right; font-family: 'Inter', sans-serif; font-size: 9.5pt; color: #333; line-height: 1.6; }
          .evaluator-name { font-style: italic; font-size: 10pt; color: #1a1a1a; }
          .report-title { text-align: center; font-family: 'Inter', sans-serif; font-size: 15pt; font-weight: 600; letter-spacing: 3px; color: #1a1a1a; text-transform: uppercase; border-bottom: 1.5px solid #1a1a1a; padding-bottom: 8px; margin-bottom: 16px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1.5px solid #1a1a1a; margin-bottom: 22px; }
          .meta-cell { padding: 6px 10px; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; }
          .meta-cell:nth-child(even) { border-right: none; }
          .meta-label { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 600; color: #1a1a1a; margin-bottom: 1px; }
          .meta-value { font-size: 10.5pt; color: #222; }
          h2 { font-family: 'Inter', sans-serif; font-size: 11pt; font-weight: 700; color: #1a1a1a; margin: 18px 0 7px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
          p, li { font-size: 11pt; line-height: 1.65; color: #222; }
          ul, ol { padding-left: 20px; margin: 6px 0; }
          li { margin-bottom: 3px; }
          .confidential-stamp { text-align: center; font-family: 'Inter', sans-serif; font-size: 7pt; letter-spacing: 3px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="page">${printContent}</div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  const tabs = [
    { id: "info", label: "Client Info" },
    { id: "evaluator", label: "Evaluator" },
    { id: "sections", label: "Report Sections" },
    { id: "preview", label: "Preview & Download" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#8b0000", color: "white", padding: "14px 32px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ background: "white", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
          <svg viewBox="0 0 40 40" width="24" fill="#8b0000"><rect x="5" y="5" width="12" height="30"/><rect x="23" y="5" width="12" height="30"/><rect x="5" y="5" width="30" height="10"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3 }}>PSYCHOLOGICAL REPORT GENERATOR</div>
          <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.75 }}>CONFIDENTIAL CLINICAL DOCUMENTATION TOOL</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <button onClick={() => router.push('/')} style={{ color: "white", textDecoration: "none", fontSize: 12, opacity: 0.8, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer" }}>
            ← Back to Assessment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#1a1a1a", display: "flex", gap: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "11px 24px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 1,
            background: activeTab === t.id ? "#8b0000" : "transparent",
            color: activeTab === t.id ? "white" : "#aaa",
            transition: "all 0.15s"
          }}>{t.label.toUpperCase()}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {activeTab === "info" && (
          <div style={{ background: "white", padding: "22px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#8b0000", marginBottom: 16, textTransform: "uppercase", borderLeft: "3px solid #8b0000", paddingLeft: 10 }}>Client Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Client Number</label>
                <input value={form.clientNumber} onChange={e => update("clientNumber", e.target.value)} placeholder="e.g. 4561-2024" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Evaluation From</label>
                <input value={form.evalDateFrom} onChange={e => update("evalDateFrom", e.target.value)} placeholder="MM/DD/YYYY" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Evaluation To</label>
                <input value={form.evalDateTo} onChange={e => update("evalDateTo", e.target.value)} placeholder="MM/DD/YYYY" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Date of Report</label>
                <input value={form.reportDate} onChange={e => update("reportDate", e.target.value)} placeholder="MM/DD/YYYY" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "evaluator" && (
          <div style={{ background: "white", padding: "22px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#8b0000", marginBottom: 16, textTransform: "uppercase", borderLeft: "3px solid #8b0000", paddingLeft: 10 }}>Evaluator Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Evaluator Name</label>
                <input value={form.evaluatorName} onChange={e => update("evaluatorName", e.target.value)} placeholder="e.g. W. Joel Schneider, Ph.D." style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Title / Department</label>
                <input value={form.evaluatorTitle} onChange={e => update("evaluatorTitle", e.target.value)} placeholder="e.g. Psychological Studies in Education" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Institution</label>
                <input value={form.institution} onChange={e => update("institution", e.target.value)} placeholder="e.g. Temple University" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Institution Address</label>
                <input value={form.institutionAddress} onChange={e => update("institutionAddress", e.target.value)} placeholder="e.g. Philadelphia, PA 19122" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 5, letterSpacing: 0.5 }}>Phone</label>
                <input value={form.institutionPhone} onChange={e => update("institutionPhone", e.target.value)} placeholder="e.g. (215) 204-8093" style={{ width: "100%", border: "1.5px solid #ddd", padding: "8px 11px", fontSize: 13, outline: "none", color: "#1a1a1a", fontFamily: "inherit" }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "sections" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {sectionLabels.map(({ key, label }) => (
              <div key={key} style={{ background: "white", padding: "22px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#8b0000", marginBottom: 16, textTransform: "uppercase", borderLeft: "3px solid #8b0000", paddingLeft: 10 }}>{label}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={() => aiGenerate(key, label)} disabled={generating[key]} style={{
                    background: generating[key] ? "#ccc" : "#8b0000", color: "white", border: "none",
                    padding: "7px 18px", fontSize: 12, fontWeight: 600, cursor: generating[key] ? "default" : "pointer", letterSpacing: 0.5, borderRadius: 4
                  }}>
                    {generating[key] ? "⏳ Generating..." : "✨ AI Generate"}
                  </button>
                </div>
                <textarea
                  value={form[key]}
                  onChange={e => update(key, e.target.value)}
                  placeholder={`Write or generate the ${label} section...`}
                  rows={6}
                  style={{ width: "100%", border: "1.5px solid #ddd", padding: "10px 12px", fontSize: 13, fontFamily: "Georgia, serif", resize: "vertical", outline: "none", color: "#222", lineHeight: 1.65, borderRadius: 4 }}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "preview" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#666" }}>Preview your report below. Click Download to save as PDF.</div>
              <button onClick={handlePrint} style={{ background: "#8b0000", color: "white", border: "none", padding: "10px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1, borderRadius: 4 }}>
                ⬇ DOWNLOAD / PRINT PDF
              </button>
            </div>

            <div style={{ background: "white", boxShadow: "0 4px 32px rgba(0,0,0,0.12)", padding: "40px 48px", fontFamily: "Georgia, serif" }} ref={printRef}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2.5px solid #8b0000", paddingBottom: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: "#8b0000", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                    <svg viewBox="0 0 40 40" width="28" fill="white"><rect x="4" y="4" width="12" height="32"/><rect x="24" y="4" width="12" height="32"/><rect x="4" y="4" width="32" height="11"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: 4, color: "#1a1a1a" }}>{form.institution || "INSTITUTION"}</div>
                    <div style={{ fontFamily: "sans-serif", fontSize: 7, letterSpacing: 5, color: "#777", marginTop: 2 }}>UNIVERSITY</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontFamily: "sans-serif", fontSize: 10, color: "#444", lineHeight: 1.7 }}>
                  <div style={{ fontStyle: "italic", fontSize: 11 }}>{form.evaluatorName || "Evaluator Name"}</div>
                  <div>{form.evaluatorTitle || "Department / Title"}</div>
                  <div>{form.institutionAddress || "Address"}</div>
                  <div>{form.institutionPhone || "Phone"}</div>
                </div>
              </div>

              <div style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 3, borderBottom: "1.5px solid #1a1a1a", paddingBottom: 8, marginBottom: 16, textTransform: "uppercase" }}>
                Confidential Psychological Report
              </div>

              {/* Meta Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1.5px solid #1a1a1a", marginBottom: 24 }}>
                <div style={{ padding: "6px 11px", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 9, fontWeight: 700, marginBottom: 1 }}>Client Number</div>
                  <div style={{ fontSize: 11 }}>{form.clientNumber || "—"}</div>
                </div>
                <div style={{ padding: "6px 11px", borderBottom: "1px solid #ccc" }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 9, fontWeight: 700, marginBottom: 1 }}>Evaluation Dates</div>
                  <div style={{ fontSize: 11 }}>{form.evalDateFrom || "—"} – {form.evalDateTo || "—"}</div>
                </div>
                <div style={{ padding: "6px 11px", borderRight: "1px solid #ccc" }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 9, fontWeight: 700, marginBottom: 1 }}>Date of Report</div>
                  <div style={{ fontSize: 11 }}>{form.reportDate || "—"}</div>
                </div>
                <div style={{ padding: "6px 11px" }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 9, fontWeight: 700, marginBottom: 1 }}>Report Status</div>
                  <div style={{ fontSize: 11 }}>Final</div>
                </div>
              </div>

              {/* Sections */}
              {sectionLabels.map(({ key, label }) => form[key] ? (
                <div key={key}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: 3, marginTop: 20, marginBottom: 7 }}>{label}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#222" }}>{form[key]}</div>
                </div>
              ) : null)}

              {/* Confidential Stamp */}
              <div style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: 8, letterSpacing: 3, color: "#bbb", marginTop: 36, borderTop: "1px solid #eee", paddingTop: 10 }}>
                CONFIDENTIAL — FOR AUTHORIZED CLINICAL USE ONLY
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}