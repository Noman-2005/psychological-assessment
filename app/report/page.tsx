"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ==================== TYPES ====================
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

// ==================== SCIENTIFIC EXPLANATIONS ====================
const scientificExplanations: Record<string, string> = {
  "Depression": "Depression occurs when brain chemicals called neurotransmitters (serotonin, dopamine, and norepinephrine) become imbalanced. This affects mood regulation, sleep patterns, appetite, and motivation. Genetic factors, life events, and brain structure changes can all contribute to this condition.",
  
  "Anxiety": "Anxiety is caused by overactivation of the amygdala, the brain's fear center, and an imbalance in stress hormones (cortisol and adrenaline). This triggers the body's 'fight or flight' response even when no real threat exists, leading to excessive worry, physical tension, and restlessness.",
  
  "OCD": "OCD involves hyperactivity in the brain's orbital frontal cortex and basal ganglia, which are responsible for decision-making and error detection. This creates a 'brain lock' where intrusive thoughts (obsessions) get stuck and compulsions develop as an attempt to neutralize the anxiety.",
  
  "PTSD": "PTSD occurs when the brain's fear response system becomes stuck in an overactive state after a traumatic event. The amygdala remains hypervigilant while the hippocampus struggles to properly process and store the memory, causing flashbacks, nightmares, and avoidance behaviors.",
  
  "Psychosis": "Psychosis involves disruptions in brain dopamine signaling pathways. This affects how the brain processes information, leading to unusual perceptions (hallucinations) and beliefs (delusions). The brain struggles to distinguish between internal thoughts and external reality.",
  
  "Borderline": "BPD involves hypersensitivity in the emotional regulation centers of the brain, particularly the amygdala and prefrontal cortex. This leads to intense emotional reactions, difficulty calming down, and impulsive behaviors in response to perceived abandonment or rejection.",
  
  "Narcissistic": "Narcissistic traits involve a combination of genetic predisposition, childhood experiences, and brain differences in empathy centers. These lead to an inflated self-image as a defense mechanism against deep-seated insecurities and difficulty understanding others' perspectives.",
  
  "Eating": "Eating disorders involve disruptions in brain reward and appetite centers, combined with distorted body image processing. The brain's reward system becomes misaligned, making controlling food intake feel like a way to manage emotions and self-worth.",
  
  "Maladaptive": "Maladaptive daydreaming occurs when the brain's default mode network, responsible for daydreaming and mind-wandering, becomes overactive. This creates a dopamine cycle where fantasy becomes a primary source of reward, making it difficult to focus on real-life activities."
};

// ==================== COMMON SYMPTOMS ====================
const commonSymptoms: Record<string, string[]> = {
  "Depression": [
    "Persistent sadness, emptiness, or low mood",
    "Loss of interest or pleasure in activities once enjoyed",
    "Fatigue, low energy, or feeling slowed down",
    "Changes in sleep or appetite"
  ],
  "Anxiety": [
    "Excessive worry about everyday situations",
    "Restlessness or feeling on edge",
    "Difficulty concentrating or mind going blank",
    "Physical tension or sleep disturbances"
  ],
  "OCD": [
    "Recurring, unwanted thoughts (obsessions)",
    "Repeated actions or rituals (compulsions)",
    "Intense anxiety if rituals are not performed",
    "Significant time spent on rituals"
  ],
  "PTSD": [
    "Flashbacks or nightmares of traumatic events",
    "Avoiding reminders of the trauma",
    "Hypervigilance or being easily startled",
    "Negative changes in mood or thinking"
  ],
  "Psychosis": [
    "Hearing voices or seeing things others don't",
    "Unusual or unrealistic beliefs (delusions)",
    "Disorganized speech or thinking",
    "Difficulty distinguishing reality from imagination"
  ],
  "Borderline": [
    "Intense, unstable relationships",
    "Sudden mood swings and intense anger",
    "Fear of abandonment and feelings of emptiness",
    "Impulsive or self-destructive behaviors"
  ],
  "Narcissistic": [
    "Inflated sense of self-importance",
    "Need for excessive admiration",
    "Lack of empathy for others",
    "Belief in being special or unique"
  ],
  "Eating": [
    "Preoccupation with weight and body shape",
    "Severe restriction of food intake",
    "Binge eating followed by purging behaviors",
    "Distorted body image"
  ],
  "Maladaptive": [
    "Spending hours lost in fantasy worlds",
    "Difficulty stopping daydreams",
    "Interferes with daily activities and responsibilities",
    "Physical movements or expressions while daydreaming"
  ]
};

// ==================== DEFAULT FINDING NAMES ====================
const defaultFindingNames = [
  "Psychological Symptoms Detected",
  "Mental Health Concerns Identified",
  "Cognitive Patterns Observed",
  "Emotional Regulation Difficulties",
  "Behavioral Patterns Identified",
  "Stress-Related Symptoms Detected"
];

// ==================== MAIN COMPONENT ====================
export default function ReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const printRef = useRef<HTMLDivElement>(null);

  // ===== LOAD DATA FROM STORAGE =====
  useEffect(() => {
    console.log("🔍 Loading report data...");
    
    try {
      let data = localStorage.getItem("reportData");
      
      if (!data) {
        data = sessionStorage.getItem("reportData");
      }
      
      if (data) {
        const parsed = JSON.parse(data);
        console.log("✅ Full data structure:", parsed);
        console.log("✅ Findings:", parsed.findings);
        if (parsed.findings && parsed.findings.length > 0) {
          console.log("✅ First finding:", parsed.findings[0]);
          console.log("✅ Condition:", parsed.findings[0].condition);
          console.log("✅ Description:", parsed.findings[0].description);
          console.log("✅ Recommendation:", parsed.findings[0].recommendation);
        }
        setResult(parsed);
      } else {
        console.log("❌ No data found");
      }
    } catch (error) {
      console.error("❌ Error loading report data:", error);
    }
    
    setLoading(false);
  }, []);

  // ===== GET SCIENTIFIC EXPLANATION =====
  const getScientificExplanation = (condition: string): string => {
    // Try exact match first
    for (const [key, value] of Object.entries(scientificExplanations)) {
      if (condition.includes(key) || key.includes(condition)) {
        return value;
      }
    }
    return "This condition involves complex interactions between brain chemistry, neural pathways, and environmental factors. Professional evaluation can provide more detailed insights.";
  };

  // ===== GET COMMON SYMPTOMS =====
  const getCommonSymptoms = (condition: string): string[] => {
    for (const [key, value] of Object.entries(commonSymptoms)) {
      if (condition.includes(key) || key.includes(condition)) {
        return value;
      }
    }
    return [
      "Varies based on individual experience",
      "Professional evaluation recommended",
      "May include emotional, cognitive, or behavioral changes"
    ];
  };

  // ===== GET CONDITION NAME =====
  const getConditionName = (finding: Finding, index: number): string => {
    // Try to get from finding
    let name = finding.condition || finding.name || "";
    
    // If empty, try to extract from description
    if (!name && finding.description) {
      const desc = finding.description;
      const keywords = ["depression", "anxiety", "ocd", "ptsd", "psychosis", "borderline", "narcissistic", "eating", "maladaptive"];
      for (const keyword of keywords) {
        if (desc.toLowerCase().includes(keyword)) {
          name = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
    }
    
    // If still empty, use default
    if (!name) {
      name = defaultFindingNames[index % defaultFindingNames.length];
    }
    
    return name;
  };

  // ===== PDF PRINT HANDLER =====
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
          h3 { font-family: 'Arial', sans-serif; font-size: 10.5pt; font-weight: 600; color: #1a1a1a; margin: 14px 0 5px; }
          h4 { font-family: 'Arial', sans-serif; font-size: 9.5pt; font-weight: 600; color: #1a1a1a; margin: 10px 0 4px; }
          p, li { font-size: 11pt; line-height: 1.65; color: #222; }
          ul, ol { padding-left: 20px; margin: 4px 0; }
          li { margin-bottom: 2px; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 9pt; font-weight: 600; font-family: 'Arial', sans-serif; }
          .badge-high { background: #ffebee; color: #cc0000; }
          .badge-moderate { background: #fff3e0; color: #cc8800; }
          .badge-mild { background: #e8f5e9; color: #2d7d2d; }
          .badge-low { background: #e8f5e9; color: #2d7d2d; }
          .finding-block { background: #fafafa; padding: 14px 16px; margin: 10px 0; border-left: 4px solid #1a1a1a; }
          .finding-block.high { border-left-color: #cc0000; }
          .finding-block.moderate { border-left-color: #cc8800; }
          .finding-block.mild { border-left-color: #2d7d2d; }
          .disclaimer { margin-top: 24px; padding: 12px 16px; background: #f8f8f8; border-left: 3px solid #cc0000; font-size: 9.5pt; color: #555; line-height: 1.6; }
          .footer { text-align: center; font-family: 'Arial', sans-serif; font-size: 8pt; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
          .critical-alert { background: #ffebee; padding: 12px 16px; margin: 10px 0; border-left: 4px solid #cc0000; }
          .critical-alert p { color: #cc0000; font-weight: 600; margin: 0; }
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

  // ===== FORMAT DATE =====
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

  // ===== BADGE CLASS =====
  const getBadgeClass = (severity: string) => {
    switch (severity) {
      case "High": return "badge-high";
      case "Moderate": return "badge-moderate";
      case "Mild": return "badge-mild";
      default: return "badge-low";
    }
  };

  // ===== LOADING STATE =====
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

  // ===== NO DATA STATE =====
  if (!result || !result.findings || result.findings.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f4f0" }}>
        <div style={{ textAlign: "center", background: "white", padding: "40px", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: 500 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontSize: 20, color: "#1a1a1a", marginBottom: 8 }}>No Report Data Found</h2>
          <p style={{ color: "#666", marginBottom: 8 }}>Please complete the assessment first.</p>
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

  // ===== TRANSLATIONS =====
  const t = {
    en: {
      title: "Automated Confidential Psychological Assessment Report",
      assessmentDate: "Assessment Date",
      reportId: "Report ID",
      riskLevel: "Risk Level",
      questionsAnswered: "Questions Answered",
      summary: "Summary",
      scientificExplanation: "Scientific Explanation",
      commonSymptoms: "Common Symptoms",
      recommendations: "Recommendations",
      disclaimer: "Disclaimer",
      disclaimerText: "This is an automated screening report for informational purposes only. It does not constitute a medical diagnosis. Never make any medication decisions based solely on this assessment. If you are experiencing severe distress or suicidal thoughts, please contact emergency services or a mental health professional immediately.",
      downloadPdf: "⬇ Download PDF",
      backToAssessment: "← Back to Assessment",
      identifiedConcerns: "Identified Concerns"
    },
    bn: {
      title: "স্বয়ংক্রিয় গোপনীয় মনস্তাত্ত্বিক মূল্যায়ন প্রতিবেদন",
      assessmentDate: "মূল্যায়নের তারিখ",
      reportId: "প্রতিবেদন আইডি",
      riskLevel: "ঝুঁকির মাত্রা",
      questionsAnswered: "উত্তরপ্রাপ্ত প্রশ্ন",
      summary: "সারাংশ",
      scientificExplanation: "বৈজ্ঞানিক ব্যাখ্যা",
      commonSymptoms: "সাধারণ লক্ষণ",
      recommendations: "সুপারিশ",
      disclaimer: "দাবিত্যাগ",
      disclaimerText: "এটি একটি স্বয়ংক্রিয় স্ক্রীনিং প্রতিবেদন যা শুধুমাত্র তথ্যগত উদ্দেশ্যে। এটি কোনো চিকিৎসা নির্ণয় নয়। কখনোই এই মূল্যায়নের ভিত্তিতে কোনো ওষুধ সেবনের সিদ্ধান্ত নেবেন না। যদি আপনি তীব্র কষ্ট বা আত্মহত্যার চিন্তায় ভোগেন, তাহলে অবিলম্বে জরুরি পরিষেবা বা মানসিক স্বাস্থ্য পেশাদারের সাথে যোগাযোগ করুন।",
      downloadPdf: "⬇ পিডিএফ ডাউনলোড করুন",
      backToAssessment: "← মূল্যায়নে ফিরে যান",
      identifiedConcerns: "শনাক্তকৃত উদ্বেগ"
    }
  };

  const lang = t[language];

  // ===== RENDER REPORT =====
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
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          {lang.backToAssessment}
        </button>

        {/* ===== REPORT CONTENT ===== */}
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

          {/* ===== SUMMARY ===== */}
          <h2>{lang.summary}</h2>
          <p style={{ marginBottom: 16, fontSize: "11pt", lineHeight: 1.65 }}>{result.summary[language]}</p>

          {/* ===== CRITICAL ALERTS ===== */}
          {result.criticalFindings && result.criticalFindings.length > 0 && (
            <div className="critical-alert" style={{ background: "#ffebee", padding: "12px 16px", margin: "10px 0", borderLeft: "4px solid #cc0000" }}>
              <p style={{ fontWeight: 600, color: "#cc0000", margin: 0 }}>⚠️ {language === "en" ? "Critical Alerts" : "জরুরি সতর্কতা"}</p>
              {result.criticalFindings.map((alert, i) => (
                <p key={i} style={{ margin: "4px 0 0 0", fontSize: "10.5pt", color: "#cc0000" }}>{alert}</p>
              ))}
            </div>
          )}

          {/* ===== FINDINGS ===== */}
          {result.findings && result.findings.length > 0 && (
            <>
              <h2 style={{ marginTop: 24 }}>{lang.identifiedConcerns}</h2>
              
              {result.findings.map((finding, index) => {
                // --- GET CONDITION NAME ---
                let conditionName = getConditionName(finding, index);
                
                // --- GET SEVERITY ---
                const severity = finding.severity || "Moderate";
                const severityColor = severity === "High" ? "#cc0000" : severity === "Moderate" ? "#cc8800" : "#2d7d2d";
                
                // --- GET EXPLANATION ---
                let explanation = finding.description || "";
                if (!explanation || explanation.length < 10) {
                  explanation = getScientificExplanation(conditionName);
                }
                
                // --- GET SYMPTOMS ---
                const symptoms = getCommonSymptoms(conditionName);
                
                // --- GET RECOMMENDATION ---
                let recommendation = finding.recommendation || "";
                if (!recommendation || recommendation.length < 10) {
                  recommendation = "Consider consulting a mental health professional for a comprehensive evaluation and personalized treatment plan.";
                }
                
                // --- GET SCORE ---
                const score = finding.score || 0;
                const maxScore = finding.maxScore || 15;
                
                return (
                  <div key={index} className={`finding-block ${severity.toLowerCase()}`} style={{ 
                    background: "#fafafa", 
                    padding: "14px 16px", 
                    margin: "12px 0", 
                    borderLeft: `4px solid ${severityColor}`,
                    borderRadius: "0 4px 4px 0"
                  }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "12pt", fontWeight: 700 }}>
                      {index + 1}. {conditionName}
                      <span className={getBadgeClass(severity)} style={{ marginLeft: 10, padding: "2px 10px", borderRadius: 12, fontSize: 9, fontWeight: 600, display: "inline-block" }}>
                        {severity}
                      </span>
                    </h3>
                    
                    <p style={{ margin: "2px 0 6px 0", fontSize: "10pt", color: "#555" }}>
                      <strong>{language === "en" ? "Score" : "স্কোর"}:</strong> {score}/{maxScore}
                    </p>

                    {/* Scientific Explanation */}
                    <h4 style={{ fontFamily: "'Arial', sans-serif", fontSize: "9.5pt", fontWeight: 600, color: "#1a1a1a", margin: "10px 0 4px 0" }}>
                      {lang.scientificExplanation}
                    </h4>
                    <p style={{ margin: "0 0 6px 0", fontSize: "10.5pt", lineHeight: 1.6 }}>{explanation}</p>

                    {/* Common Symptoms */}
                    <h4 style={{ fontFamily: "'Arial', sans-serif", fontSize: "9.5pt", fontWeight: 600, color: "#1a1a1a", margin: "8px 0 4px 0" }}>
                      {lang.commonSymptoms}
                    </h4>
                    <ul style={{ margin: "0 0 6px 0", paddingLeft: 20, fontSize: "10.5pt", lineHeight: 1.6 }}>
                      {symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>

                    {/* Recommendations */}
                    <h4 style={{ fontFamily: "'Arial', sans-serif", fontSize: "9.5pt", fontWeight: 600, color: "#1a1a1a", margin: "8px 0 4px 0" }}>
                      {lang.recommendations}
                    </h4>
                    <p style={{ margin: "0 0 4px 0", fontSize: "10.5pt", lineHeight: 1.6 }}>{recommendation}</p>

                    {/* Exercises */}
                    {finding.exercises && finding.exercises.length > 0 && (
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: 20, fontSize: "10.5pt", lineHeight: 1.6 }}>
                        {finding.exercises.map((ex, exIdx) => (
                          <li key={exIdx}>
                            <strong>{ex.title[language]}</strong> - {ex.description[language]}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ===== DISCLAIMER ===== */}
          <div className="disclaimer" style={{ marginTop: 24, padding: "12px 16px", background: "#f8f8f8", borderLeft: "3px solid #cc0000", fontSize: 9.5, color: "#555", lineHeight: 1.6 }}>
            <strong>{lang.disclaimer}</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "9.5pt" }}>{lang.disclaimerText}</p>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="footer" style={{ textAlign: "center", fontFamily: "'Arial', sans-serif", fontSize: 8, color: "#999", marginTop: 30, borderTop: "1px solid #eee", paddingTop: 10 }}>
            Generated by Psychological Assessment System
            <br />
            Report ID: PA-{Date.now().toString().slice(-8)} | For Personal Use Only
          </div>
        </div>

        {/* ===== DOWNLOAD BUTTON ===== */}
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