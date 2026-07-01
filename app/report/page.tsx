"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  title: { en: string; bn: string };
  description: { en: string; bn: string };
  steps?: { en: string[]; bn: string[] };
  category: string;
}
interface Finding {
  condition: string;
  severity: "Low" | "Mild" | "Moderate" | "High";
  score: number;
  maxScore: number;
  description: string;
  recommendation: string;
  exercises: Exercise[];
  indications: string[];
}
interface AssessmentResult {
  findings: Finding[];
  symptomMap: { [key: string]: number };
  totalQuestions: number;
  answeredQuestions: number;
  completionTime: string;
  timestamp: string;
  riskLevel: "Low" | "Mild" | "Moderate" | "High";
  criticalFindings: string[];
  summary: { en: string; bn: string };
}
type Language = "en" | "bn";

const sevPct = (s: string) => ({ High: 90, Moderate: 62, Mild: 38 }[s] ?? 15);
const sevHex = (s: string) => ({ High: "#8b2e2e", Moderate: "#9a5d1f", Mild: "#8a6d3b" }[s] ?? "#3b6b4f");
const sevLabel = { en: { High: "HIGH", Moderate: "MODERATE", Mild: "MILD", Low: "LOW" }, bn: { High: "উচ্চ", Moderate: "মধ্যম", Mild: "মৃদু", Low: "স্বল্প" } };

const CRISIS = {
  en: [
    { name: "Kaan Pete Roi (Emotional Support)", number: "09612-119911", hours: "Daily, 3 PM – 3 AM" },
    { name: "National Emergency", number: "999", hours: "24/7" },
    { name: "NIMH Psychiatry Helpline", number: "16789", hours: "Mon–Fri, 9 AM – 5 PM" },
  ],
  bn: [
    { name: "কান পেতে রই (আবেগীয় সহায়তা)", number: "০৯৬১২-১১৯৯১১", hours: "প্রতিদিন, বিকেল ৩টা – রাত ৩টা" },
    { name: "জাতীয় জরুরি সেবা", number: "৯৯৯", hours: "সার্বক্ষণিক" },
    { name: "জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন", number: "১৬৭৮৯", hours: "সোম–শুক্র, সকাল ৯টা – বিকেল ৫টা" },
  ]
};

const FontStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    .cf-root { font-family: 'Fraunces', 'Noto Serif Bengali', Georgia, serif; }
    .cf-mono { font-family: 'Inter', 'IBM Plex Mono', monospace; letter-spacing: 0.05em; }
    .cf-paper {
      background-color: #f4ecdb;
      background-image: radial-gradient(rgba(60,46,23,.05) 1px,transparent 1px),linear-gradient(180deg,#f7f0e1 0%,#f0e6d2 100%);
      background-size: 3px 3px,100% 100%;
    }
    .cf-ink {
      background-color: #0e1a2b;
      background-image: radial-gradient(ellipse at top,rgba(196,164,92,.08),transparent 60%),linear-gradient(180deg,#0b1422 0%,#101d30 100%);
    }
    .brass-rule { background: linear-gradient(90deg,transparent,#c4a45c 25%,#c4a45c 75%,transparent); height: 1px; }
    .cf-fade { animation: cfFade .5s ease both; }
    @keyframes cfFade { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
    @media print{body{background:#f4ecdb!important}.no-print{display:none!important}.cf-ink{background:#f4ecdb!important}}
  `}</style>
);

export default function ReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let data = localStorage.getItem("reportData");
    if (!data) data = sessionStorage.getItem("reportData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setResult(parsed);
      } catch (e) {}
    }
  }, []);

  const fmtDate = (ts: string) => {
    try { return new Date(ts).toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }) } catch { return ts }
  };

  const handlePDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const h2c = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await h2c(reportRef.current, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: "#f4ecdb", 
        logging: false,
        width: 1200,
        height: 1600
      });
      const img = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      let y = 0;
      while (y < ih) { if (y > 0) pdf.addPage(); pdf.addImage(img, "JPEG", 0, -y, pw, ih); y += ph; }
      pdf.save(language === "bn" ? "মানসিক_মূল্যায়ন.pdf" : "psychological_assessment_report.pdf");
    } catch (e) { alert("PDF export failed. Use browser print instead.") }
    finally { setIsExporting(false) }
  };

  const l = language;

  if (!result || !result.findings || result.findings.length === 0) {
    return (
      <main className="cf-root min-h-screen flex items-center justify-center cf-ink">
        <FontStyles />
        <div className="text-center p-8">
          <p className="cf-mono text-xs text-[#c4a45c] uppercase tracking-[0.2em] mb-6">{l === "en" ? "No case file found." : "কোনো কেস ফাইল পাওয়া যায়নি।"}</p>
          <button onClick={() => router.push("/")} className="cf-mono text-xs uppercase tracking-wider px-6 py-2.5 rounded-sm border border-[#c4a45c]/60 text-[#e9d9ad] hover:bg-[#c4a45c]/10 transition-all">← {l === "en" ? "Return to Assessment" : "মূল্যায়নে ফিরুন"}</button>
        </div>
      </main>
    );
  }

  const rc = sevHex(result.riskLevel);

  return (
    <main className="cf-root min-h-screen cf-ink py-8 px-4">
      <FontStyles />
      <div className="no-print max-w-4xl mx-auto flex items-center justify-between mb-6 px-1">
        <button onClick={() => router.push("/")} className="cf-mono text-[11px] uppercase tracking-wider text-[#8a93a8] hover:text-[#c4a45c] transition-colors">← {l === "en" ? "Back" : "পেছনে"}</button>
        <div className="flex items-center gap-3">
          <button onClick={() => setLanguage(p => p === "en" ? "bn" : "en")} className="cf-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm border border-[#c4a45c]/40 text-[#c4a45c] hover:bg-[#c4a45c]/10 transition-all">{l === "en" ? "বাংলা" : "English"}</button>
          <button onClick={handlePDF} disabled={isExporting} className="cf-mono text-[10px] uppercase tracking-wider px-5 py-1.5 rounded-sm bg-[#c4a45c] hover:bg-[#d4b46c] text-[#0e1a2b] transition-all disabled:opacity-50">{isExporting ? (l === "en" ? "Exporting…" : "এক্সপোর্ট…") : (l === "en" ? "Export PDF" : "PDF সংরক্ষণ")}</button>
        </div>
      </div>

      <div ref={reportRef} className="cf-paper max-w-4xl mx-auto rounded-sm border border-[#c4a45c]/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] cf-fade overflow-hidden">
        {/* Cover */}
        <div className="bg-[#1c2538] px-8 md:px-14 py-10 md:py-14 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-[0.04] border-[40px] border-[#c4a45c]" />
          <div className="absolute right-8 bottom-4 w-24 h-24 rounded-full opacity-[0.06] border-[12px] border-[#c4a45c]" />
          <div className="flex items-center gap-3 mb-8"><div className="h-px flex-1 bg-[#c4a45c]/30" /><span className="cf-mono text-[10px] uppercase tracking-[0.3em] text-[#c4a45c]/70">{l === "en" ? "Confidential" : "গোপনীয়"}</span><div className="h-px flex-1 bg-[#c4a45c]/30" /></div>
          <p className="cf-mono text-[11px] uppercase tracking-[0.25em] text-[#c4a45c] mb-3">{l === "en" ? "Psychological Assessment Report" : "মনস্তাত্ত্বিক মূল্যায়ন প্রতিবেদন"}</p>
          <h1 className="text-3xl md:text-5xl font-medium text-[#e9d9ad] mb-6 tracking-tight leading-tight">{l === "en" ? "Screening Summary" : "প্রাথমিক মূল্যায়নের সারসংক্ষেপ"}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: l === "en" ? "Date" : "তারিখ", value: fmtDate(result.timestamp) },
              { label: l === "en" ? "Questions" : "প্রশ্ন", value: `${result.answeredQuestions}/${result.totalQuestions}` },
              { label: l === "en" ? "Domains" : "ডোমেন", value: String(result.findings.length) },
              { label: l === "en" ? "Risk Level" : "ঝুঁকি", value: sevLabel[l][result.riskLevel as keyof typeof sevLabel.en] ?? result.riskLevel }
            ].map((item, i) => (
              <div key={i}><p className="cf-mono text-[10px] text-[#c4a45c]/50 uppercase tracking-wider mb-1">{item.label}</p><p className="text-[#e9d9ad] text-sm font-medium">{item.value}</p></div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-8 md:px-14 py-4 bg-[#f9f2e3] border-b border-[#c4a45c]/30">
          <p className="cf-mono text-[10px] text-[#8a6d3b] leading-relaxed">⚠ {l === "en" ? "This document is a self-report screening instrument only. Not a clinical diagnosis. Never make treatment decisions based solely on this report." : "এই নথিটি শুধুমাত্র স্ব-প্রতিবেদন স্ক্রীনিং যন্ত্র। ক্লিনিকাল ডায়াগনোসিস নয়।"}</p>
        </div>

        <div className="px-6 md:px-14 py-8 md:py-12 space-y-10">
          {/* Summary */}
          <section>
            <h2 className="text-2xl md:text-3xl font-medium text-[#1c2538] mb-4 border-b border-[#c4a45c]/30 pb-3">{l === "en" ? "Summary" : "সারাংশ"}</h2>
            <div className="border-l-2 border-[#c4a45c] pl-4 py-1"><p className="text-[#3d3525] leading-relaxed">{result.summary[l]}</p></div>
            <div className="mt-6 inline-flex items-center gap-3 border rounded-sm px-4 py-2.5" style={{ borderColor: `${rc}50` }}>
              <span className="cf-mono text-[10px] uppercase tracking-wider text-[#8a6d3b]">{l === "en" ? "Overall Risk" : "সামগ্রিক ঝুঁকি"}</span>
              <span className="h-4 w-px bg-[#c4a45c]/40" />
              <span className="cf-mono text-xs font-semibold uppercase tracking-wider" style={{ color: rc }}>{sevLabel[l][result.riskLevel as keyof typeof sevLabel.en] ?? result.riskLevel}</span>
            </div>
          </section>

          {/* Critical Alerts */}
          {result.criticalFindings && result.criticalFindings.length > 0 && (
            <section>
              <div className="border-2 border-[#8b2e2e]/60 bg-[#f6e3e0] rounded-sm p-5 md:p-6">
                <h3 className="cf-mono text-[11px] uppercase tracking-[0.2em] text-[#8b2e2e] font-semibold mb-3">⚠ {l === "en" ? "Critical Alerts" : "জরুরি সতর্কতা"}</h3>
                {result.criticalFindings.map((a, i) => <p key={i} className="text-sm text-[#7a2828] mb-1">{a}</p>)}
              </div>
            </section>
          )}

          {/* Findings */}
          {result.findings && result.findings.length > 0 && (
            <section>
              <h2 className="text-2xl md:text-3xl font-medium text-[#1c2538] mb-6 border-b border-[#c4a45c]/30 pb-3">{l === "en" ? "Identified Symptom Domains" : "শনাক্তকৃত লক্ষণ ডোমেন"}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {result.findings.map((f, i) => {
                  const c = sevHex(f.severity), p = sevPct(f.severity);
                  return (
                    <div key={i} className="border border-[#c4a45c]/30 rounded-sm p-3 bg-[#f9f2e3]">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[13px] font-medium text-[#1c2538] leading-tight">{f.condition || "Unknown"}</p>
                        <span className="cf-mono text-[10px] flex-shrink-0 ml-2" style={{ color: c }}>{sevLabel[l][f.severity as keyof typeof sevLabel.en] ?? f.severity}</span>
                      </div>
                      <div className="h-1.5 bg-[#1c2538]/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: c }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6">
                {result.findings.map((f, i) => {
                  const c = sevHex(f.severity), p = sevPct(f.severity);
                  const sl = sevLabel[l][f.severity as keyof typeof sevLabel.en] ?? f.severity;
                  return (
                    <div key={i} className="border border-[#c4a45c]/40 rounded-sm p-5 md:p-7 bg-[#f9f2e3]">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="cf-mono text-[11px] text-[#c4a45c] border border-[#c4a45c]/50 px-2 py-0.5 rounded-sm">{String(i + 1).padStart(2, "0")}</span>
                          <h3 className="text-base md:text-lg font-medium text-[#1c2538]">{f.condition || "Unknown Condition"}</h3>
                        </div>
                        <span className="cf-mono text-[10px] px-2.5 py-1 rounded-sm border flex-shrink-0" style={{ color: c, borderColor: `${c}60`, backgroundColor: `${c}10` }}>{sl}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="h-2 bg-[#1c2538]/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, backgroundColor: c }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="cf-mono text-[10px] text-[#8a6d3b]">{l === "en" ? "Low" : "স্বল্প"}</span>
                            <span className="cf-mono text-[10px] text-[#8a6d3b]">{l === "en" ? "High" : "উচ্চ"}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="cf-mono text-[11px] font-semibold" style={{ color: c }}>{sl}</p>
                          <p className="cf-mono text-[10px] text-[#8a6d3b]">{f.score}/{f.maxScore}</p>
                        </div>
                      </div>
                      
                      <div className="h-px bg-[#c4a45c]/30 mb-4" />
                      
                      <div className="mb-4">
                        <p className="cf-mono text-[10px] uppercase tracking-[0.18em] text-[#8a6d3b] mb-1.5">{l === "en" ? "Clinical Note" : "ক্লিনিকাল নোট"}</p>
                        <p className="text-sm text-[#3d3525] leading-relaxed">{f.description || "No description available."}</p>
                      </div>
                      
                      {f.indications && f.indications.length > 0 && (
                        <div className="mb-4">
                          <p className="cf-mono text-[10px] uppercase tracking-[0.18em] text-[#8a6d3b] mb-1.5">{l === "en" ? "Key Indicators" : "প্রধান সূচক"}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {f.indications.map((ind, ii) => <div key={ii} className="flex gap-2 text-sm text-[#3d3525]"><span className="text-[#c4a45c] flex-shrink-0">—</span><span>{ind}</span></div>)}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-[#1c2538]/5 border-l-2 border-[#c4a45c] p-3 mb-4 rounded-sm">
                        <p className="cf-mono text-[10px] uppercase tracking-[0.18em] text-[#8a6d3b] mb-1">{l === "en" ? "Recommendation" : "সুপারিশ"}</p>
                        <p className="text-sm text-[#1c2538] leading-relaxed">{f.recommendation || "Consult a mental health professional for personalized guidance."}</p>
                      </div>
                      
                      {f.exercises && f.exercises.length > 0 && (
                        <div>
                          <p className="cf-mono text-[10px] uppercase tracking-[0.18em] text-[#8a6d3b] mb-3">{l === "en" ? "Therapeutic Exercises" : "থেরাপিউটিক ব্যায়াম"}</p>
                          <div className="space-y-3">
                            {f.exercises.map((ex, ei) => (
                              <div key={ei} className="border border-[#c4a45c]/30 rounded-sm p-3 bg-[#f4ecdb]">
                                <p className="text-sm font-medium text-[#1c2538] mb-1">{ex.title[l]}</p>
                                <p className="text-xs text-[#5a4a2f] mb-2">{ex.description[l]}</p>
                                {ex.steps && <ol className="space-y-1">{ex.steps[l].map((s, si) => <li key={si} className="text-xs text-[#3d3525] flex gap-2"><span className="cf-mono text-[#c4a45c] flex-shrink-0">{si + 1}.</span><span>{s}</span></li>)}</ol>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Crisis Resources */}
          <section>
            <h2 className="text-2xl md:text-3xl font-medium text-[#1c2538] mb-2 border-b border-[#c4a45c]/30 pb-3">{l === "en" ? "Crisis Resources" : "সংকট সম্পদ"}</h2>
            <p className="text-sm text-[#5a4a2f] mb-5">{l === "en" ? "If you are experiencing a crisis or feel unsafe, please reach out immediately." : "যদি আপনি কোনো সংকটে থাকেন, অনুগ্রহ করে এখনই যোগাযোগ করুন।"}</p>
            <div className="space-y-3">
              {CRISIS[l].map((r, i) => (
                <div key={i} className="border border-[#c4a45c]/40 bg-[#f9f2e3] rounded-sm p-4 flex items-center justify-between gap-4">
                  <div><p className="text-sm font-medium text-[#1c2538]">{r.name}</p><p className="cf-mono text-[10px] text-[#8a6d3b] mt-0.5">{r.hours}</p></div>
                  <p className="cf-mono text-base md:text-lg font-semibold text-[#1c2538] flex-shrink-0 tracking-wider">{r.number}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Wellness Guidelines */}
          <section>
            <h2 className="text-2xl md:text-3xl font-medium text-[#1c2538] mb-5 border-b border-[#c4a45c]/30 pb-3">{l === "en" ? "General Wellness Guidelines" : "সাধারণ সুস্থতার নির্দেশিকা"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(l === "en" ? [
                { t: "Regular Sleep", d: "Aim for 7–9 hours nightly. Poor sleep worsens all mental health symptoms." },
                { t: "Physical Movement", d: "Even a 20-minute daily walk significantly boosts serotonin and reduces anxiety." },
                { t: "Social Connection", d: "Maintain at least one meaningful interaction daily — even brief ones regulate mood." },
                { t: "Limit Screens Before Bed", d: "Reduce blue-light exposure 1 hour before sleep. It interferes with melatonin production." },
                { t: "Structured Routine", d: "Predictable daily schedules reduce anxiety by giving the brain a sense of control." },
                { t: "Professional Support", d: "Therapy is not a last resort — it's a tool for anyone who wants to understand themselves better." },
              ] : [
                { t: "নিয়মিত ঘুম", d: "প্রতি রাতে ৭–৯ ঘণ্টা ঘুমের লক্ষ্য রাখুন।" },
                { t: "শারীরিক নড়াচড়া", d: "প্রতিদিন মাত্র ২০ মিনিট হাঁটলে সেরোটোনিন বাড়ে এবং উদ্বেগ কমে।" },
                { t: "সামাজিক যোগাযোগ", d: "প্রতিদিন অন্তত একটি অর্থবহ সামাজিক কথোপকথন বজায় রাখুন।" },
                { t: "ঘুমের আগে স্ক্রিন কমান", d: "ঘুমের ১ ঘণ্টা আগে নীল আলো থেকে দূরে থাকুন।" },
                { t: "নিয়মিত রুটিন", d: "পূর্বানুমানযোগ্য দৈনন্দিন রুটিন উদ্বেগ কমায়।" },
                { t: "পেশাদার সহায়তা", d: "থেরাপি শেষ অবলম্বন নয় — নিজেকে বুঝতে এটি একটি হাতিয়ার।" },
              ]).map((item, i) => (
                <div key={i} className="border border-[#c4a45c]/30 bg-[#f9f2e3] rounded-sm p-4">
                  <p className="text-sm font-medium text-[#1c2538] mb-1">{item.t}</p>
                  <p className="text-xs text-[#5a4a2f] leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div>
            <div className="brass-rule mb-6" />
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-end">
              <div>
                <p className="cf-mono text-[10px] uppercase tracking-[0.2em] text-[#8a6d3b] mb-1">{l === "en" ? "Generated by" : "তৈরি করা হয়েছে"}</p>
                <p className="text-sm font-medium text-[#1c2538]">{l === "en" ? "Psychological Self-Assessment Tool" : "মনস্তাত্ত্বিক স্ব-মূল্যায়ন যন্ত্র"}</p>
                <p className="cf-mono text-[10px] text-[#8a6d3b] mt-1">{fmtDate(result.timestamp)}</p>
              </div>
              <p className="cf-mono text-[10px] text-[#8a6d3b] max-w-xs text-right leading-relaxed">{l === "en" ? "Not a substitute for professional clinical evaluation." : "পেশাদার ক্লিনিকাল মূল্যায়নের বিকল্প নয়।"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print max-w-4xl mx-auto mt-6 flex flex-col md:flex-row gap-3 px-1">
        <button onClick={() => router.push("/")} className="flex-1 cf-mono text-[11px] uppercase tracking-wider py-3 rounded-sm border border-[#c4a45c]/30 text-[#8a93a8] hover:text-[#e9d9ad] hover:border-[#c4a45c]/60 transition-all">← {l === "en" ? "Back to Assessment" : "মূল্যায়নে ফিরুন"}</button>
        <button onClick={handlePDF} disabled={isExporting} className="flex-1 cf-mono text-[11px] uppercase tracking-wider py-3 rounded-sm bg-[#c4a45c] hover:bg-[#d4b46c] text-[#0e1a2b] font-semibold transition-all disabled:opacity-50">{isExporting ? (l === "en" ? "Exporting…" : "এক্সপোর্ট…") : (l === "en" ? "↓ Export as PDF" : "↓ PDF সংরক্ষণ")}</button>
      </div>
    </main>
  );
}