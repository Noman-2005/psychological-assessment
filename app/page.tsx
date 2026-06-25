"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ==================== TYPES ====================
type Language = "en" | "bn";

interface Option {
  text: { en: string; bn: string };
  score: number;
  tags: string[];
}

interface Question {
  id: string;
  segmentId: string;
  text: { en: string; bn: string };
  options: Option[];
}

interface SymptomMap {
  depression: number;
  anxiety: number;
  ocd: number;
  ptsd: number;
  psychosis: number;
  borderline: number;
  narcissistic: number;
  eating: number;
  maladaptive: number;
  dissociation: number;
  panic: number;
  social_anxiety: number;
  bipolar: number;
  insomnia: number;
  suicidal: number;
  self_harm: number;
  anhedonia: number;
  melancholic: number;
}

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
  symptomMap: SymptomMap;
  totalQuestions: number;
  answeredQuestions: number;
  completionTime: string;
  timestamp: string;
  riskLevel: "Low" | "Mild" | "Moderate" | "High";
  criticalFindings: string[];
  summary: { en: string; bn: string };
}

// ==================== ALL QUESTIONS (79 Questions) ====================
const ALL_QUESTIONS: Question[] = [
  // ===== SEGMENT 1: MOOD DISORDERS (15 Questions) =====
  {
    id: "mood_1",
    segmentId: "mood",
    text: {
      en: "How has your mood been over the past two weeks?",
      bn: "গত দুই সপ্তাহে আপনার মন মেজাজ কেমন থাকছে?"
    },
    options: [
      { text: { en: "Almost always sad, empty, or irritable", bn: "প্রায় প্রতিদিন, সারাদিনই মন খুব খারাপ ও খালি খালি লাগে" }, score: 3, tags: ["depression_severe"] },
      { text: { en: "Sometimes sad, but can be cheered up", bn: "মাঝে মাঝে মন খারাপ থাকে, তবে কিছুতে ভালো হয়ে যায়" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Occasionally feel down", bn: "মাঝে মাঝে একটু মন খারাপ হয়" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "Generally stable and positive", bn: "সাধারণত মন ভালো থাকে, স্থিতিশীল" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_2",
    segmentId: "mood",
    text: {
      en: "Do you enjoy activities you used to love?",
      bn: "যে কাজগুলো করতে আপনি আগে খুব পছন্দ করতেন, সেগুলো থেকে এখন কেমন আনন্দ পান?"
    },
    options: [
      { text: { en: "No pleasure at all, mind feels dead", bn: "একদমই কোনো আনন্দ বা ফিলিং পাই না, মন পুরো মরে গেছে" }, score: 3, tags: ["depression_severe", "anhedonia"] },
      { text: { en: "Much less pleasure than before", bn: "আগের চেয়ে আনন্দ অনেক কম পাই" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Slightly less interest", bn: "আগের চেয়ে একটু কম আগ্রহ লাগে" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "Enjoy them as much as before", bn: "আগের মতোই আনন্দ পাই, কোনো পরিবর্তন হয়নি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_3",
    segmentId: "mood",
    text: {
      en: "How is your daily energy level?",
      bn: "আপনার দৈনন্দিন কাজের এনার্জি বা শক্তির লেভেল কেমন?"
    },
    options: [
      { text: { en: "Extremely tired, can't get out of bed", bn: "এতটাই ক্লান্ত ও নিস্তেজ যে বিছানা থেকে উঠতে পারি না" }, score: 3, tags: ["depression_severe"] },
      { text: { en: "Very tired, small tasks feel difficult", bn: "শরীর সারাক্ষণ ক্লান্ত লাগে, ছোট কাজ করতেও কষ্ট হয়" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Sometimes tired, but manageable", bn: "মাঝে মাঝে ক্লান্ত লাগে, তবে সামলাতে পারি" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "Normal energy levels", bn: "স্বাভাবিক এনার্জি থাকে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_4",
    segmentId: "mood",
    text: {
      en: "At what time of day is your mood the worst?",
      bn: "সারাদিনের মধ্যে কোন সময়টায় আপনার মন সবচেয়ে বেশি খারাপ বা ব্যাকুল থাকে?"
    },
    options: [
      { text: { en: "Early morning, right after waking up", bn: "একদম ভোরে বা সকালে ঘুম থেকে ওঠার পর মন সবচেয়ে বেশি বিষণ্ণ ও ভারী লাগে" }, score: 3, tags: ["depression_severe", "melancholic"] },
      { text: { en: "Evening or night when alone", bn: "সন্ধ্যার দিকে বা রাতে একা থাকলে মন বেশি খারাপ হয়" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "No specific pattern", bn: "নির্দিষ্ট কোনো সময় নেই, যেকোনো সময়ই মন খারাপ হতে পারে" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "No significant mood changes", bn: "সারাদিন মেজাজে তেমন কোনো পরিবর্তন হয় না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_5",
    segmentId: "mood",
    text: {
      en: "What is your current sleep pattern like?",
      bn: "আপনার বর্তমান ঘুমের প্যাটার্ন কেমন?"
    },
    options: [
      { text: { en: "Wake up very early and can't sleep again", bn: "খুব ভোরে ঘুম ভেঙে যায় এবং আর কোনোভাবেই ঘুম আসে না" }, score: 3, tags: ["depression_severe", "terminal_insomnia"] },
      { text: { en: "Can't fall asleep or wake up frequently", bn: "রাতে সহজে ঘুম আসে না বা মাঝরাতে ঘুম ভেঙে যায়" }, score: 2, tags: ["depression_moderate", "insomnia"] },
      { text: { en: "Sometimes have trouble sleeping", bn: "মাঝে মাঝে ঘুমাতে সমস্যা হয়" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "Normal sleep pattern", bn: "ঘুম স্বাভাবিক আছে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_6",
    segmentId: "mood",
    text: {
      en: "Has your appetite changed?",
      bn: "আপনার ক্ষুধা এবং ওজনের ক্ষেত্রে কোনো পরিবর্তন এসেছে কি?"
    },
    options: [
      { text: { en: "Appetite completely gone, losing weight", bn: "খিদে একদম মরে গেছে, জোর করে খেতে হয় এবং ওজন অনেক কমে গেছে" }, score: 3, tags: ["depression_severe", "melancholic"] },
      { text: { en: "Eating more than usual, gaining weight", bn: "মন খারাপের কারণে উল্টো বেশি বেশি খাচ্ছি এবং ওজন বাড়ছে" }, score: 2, tags: ["depression_moderate", "atypical"] },
      { text: { en: "Slight change in appetite", bn: "ক্ষুধায় সামান্য পরিবর্তন এসেছে" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "No significant change", bn: "ক্ষুধা ও ওজনে কোনো উল্লেখযোগ্য পরিবর্তন আসেনি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_7",
    segmentId: "mood",
    text: {
      en: "How do you evaluate yourself currently?",
      bn: "নিজের সম্পর্কে আপনার বর্তমান মূল্যায়ন বা ভাবনা কেমন?"
    },
    options: [
      { text: { en: "Worthless, hopeless, a burden", bn: "নিজেকে সম্পূর্ণ মূল্যহীন, আশাহীন এবং পরিবারের ওপর বোঝা মনে হয়" }, score: 3, tags: ["depression_severe", "self_blame"] },
      { text: { en: "Often blame myself for failures", bn: "আমি প্রায়ই নিজেকেই দোষী মনে করি, ব্যর্থ মনে হয়" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Sometimes feel inadequate", bn: "মাঝে মাঝে নিজেকে অপর্যাপ্ত মনে হয়" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "Realistic view of strengths and weaknesses", bn: "নিজের ভুলত্রুটি ও সাফল্য দুটোই বাস্তবসম্মতভাবে দেখতে পাই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_8",
    segmentId: "mood",
    text: {
      en: "Do you have difficulty making decisions or concentrating?",
      bn: "কোনো বিষয়ে সিদ্ধান্ত নিতে বা মনোযোগ দিতে আপনার কেমন সমস্যা হচ্ছে?"
    },
    options: [
      { text: { en: "Can't make even small decisions, mind frozen", bn: "খুব ছোটখাটো বিষয়েও সিদ্ধান্ত নিতে পারি না, মাথা জ্যাম হয়ে থাকে" }, score: 3, tags: ["depression_severe", "cognitive_slowing"] },
      { text: { en: "Struggle to focus, decisions take longer", bn: "মনোযোগ দিতে কষ্ট হয়, সিদ্ধান্ত নিতে অনেক সময় লাগে" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Sometimes have trouble concentrating", bn: "মাঝে মাঝে মনোযোগ দিতে সমস্যা হয়" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "No difficulty concentrating", bn: "মনোযোগ দিতে বা সিদ্ধান্ত নিতে কোনো সমস্যা হয় না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_9",
    segmentId: "mood",
    text: {
      en: "Have you had thoughts of ending your life recently?",
      bn: "গত কয়েকদিনে আপনার মনে জীবন শেষ করে দেওয়ার মতো কোনো চিন্তা এসেছে?"
    },
    options: [
      { text: { en: "Yes, I actively plan or seek ways", bn: "নিজেকে শেষ করার তীব্র চিন্তা আসে এবং আমি পরিকল্পনাও খুঁজি" }, score: 3, tags: ["active_suicidal", "emergency"] },
      { text: { en: "Sometimes wish I wouldn't wake up", bn: "মাঝে মাঝে মনে হয় এই জীবন রেখে লাভ কী, রাতে ঘুমালে যদি আর সকাল না হতো" }, score: 2, tags: ["passive_suicidal", "depression_severe"] },
      { text: { en: "Rarely think about death", bn: "মাঝে মাঝে মৃত্যুর কথা ভাবি, কিন্তু তেমন গুরুত্ব দিই না" }, score: 1, tags: ["depression_moderate"] },
      { text: { en: "No thoughts of death", bn: "মরে যাওয়ার মতো কোনো চিন্তা আসে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_10",
    segmentId: "mood",
    text: {
      en: "How is your speech and physical movement?",
      bn: "আপনার কথা বলা বা শারীরিক নড়াচড়ার গতিতে কোনো পরিবর্তন এসেছে?"
    },
    options: [
      { text: { en: "Speak slowly and move sluggishly", bn: "আমি খুব ধীরে ধীরে কথা বলি, হাত-পা নাড়াতে বা হাঁটতেও অনেক সময় লাগে" }, score: 3, tags: ["depression_severe", "psychomotor_retardation"] },
      { text: { en: "Feel slower than usual", bn: "স্বাভাবিকের চেয়ে কিছুটা ধীর লাগে" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Occasionally feel sluggish", bn: "মাঝে মাঝে একটু অলস লাগে" }, score: 1, tags: ["depression_mild"] },
      { text: { en: "Normal movement and speech", bn: "স্বাভাবিক গতি এবং কথাবার্তা" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_11",
    segmentId: "mood",
    text: {
      en: "Have you experienced intense irritability or aggression for days?",
      bn: "আপনি কি কখনো এমন কোনো সময়ের মধ্য দিয়ে গেছেন যখন ৪-৫ দিন ধরে আপনার মেজাজ অতিরিক্ত খিটখিটে বা আক্রমণাত্মক ছিল?"
    },
    options: [
      { text: { en: "Yes, got angry over small things, broke things", bn: "হ্যাঁ, সামান্য কারণে রেগে গিয়ে চিৎকার করেছি, জিনিসপত্র ভেঙেছি" }, score: 3, tags: ["bipolar_mania", "mood_swings"] },
      { text: { en: "Sometimes irritable when sad", bn: "মন খারাপের কারণে মাঝে মাঝে একটু খিটখিটে লাগে" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Mild irritability occasionally", bn: "মাঝে মাঝে সামান্য খিটখিটে লাগে" }, score: 1, tags: ["mood_mild"] },
      { text: { en: "Can control my anger", bn: "রাগ হলেও আমি সাধারণত নিজেকে শান্ত রাখতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_12",
    segmentId: "mood",
    text: {
      en: "Have you made impulsive decisions without thinking of consequences?",
      bn: "আপনি কি কখনো কোনো কারণ ছাড়াই হুট করে অনেক বেশি টাকা খরচ করা, ঝুঁকিপূর্ণ ড্রাইভিং বা বড় কোনো হঠকারী সিদ্ধান্ত নিয়েছেন?"
    },
    options: [
      { text: { en: "Yes, spent a lot or took big risks", bn: "হ্যাঁ, পরিণতির কথা না ভেবে অনেক টাকা উড়িয়েছি বা বড় রিস্ক নিয়েছি" }, score: 3, tags: ["bipolar_mania", "impulsivity"] },
      { text: { en: "Sometimes make impulsive choices", bn: "মাঝে মাঝে হঠকারী সিদ্ধান্ত নিই" }, score: 2, tags: ["impulsivity_mild"] },
      { text: { en: "Occasionally impulsive", bn: "মাঝে মাঝে একটু হঠকারী হই" }, score: 1, tags: [] },
      { text: { en: "Generally careful with decisions", bn: "আমি সিদ্ধান্তের ব্যাপারে সবসময় বেশ সতর্ক থাকি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_13",
    segmentId: "mood",
    text: {
      en: "What is your social life like currently?",
      bn: "আপনার বর্তমান সামাজিক জীবন বা মানুষের সাথে মেলামেশার অবস্থা কেমন?"
    },
    options: [
      { text: { en: "Completely withdrawn, don't leave the house", bn: "নিজেকে গুটিয়ে বন্ধ ঘরে একা পড়ে থাকি, ঘর থেকে বের হই না" }, score: 3, tags: ["depression_severe", "social_withdrawal"] },
      { text: { en: "Socializing much less than before", bn: "আগের চেয়ে অনেক কম সামাজিক হয়েছি" }, score: 2, tags: ["depression_moderate"] },
      { text: { en: "Sometimes avoid social situations", bn: "মাঝে মাঝে সামাজিক অনুষ্ঠান এড়িয়ে চলি" }, score: 1, tags: ["social_anxiety_mild"] },
      { text: { en: "Normal social life", bn: "স্বাভাবিক সামাজিক জীবন আছে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_14",
    segmentId: "mood",
    text: {
      en: "Is this condition affecting your work, studies, or relationships?",
      bn: "আপনার কি মনে হয় আপনার এই মানসিক অবস্থা আপনার ক্যারিয়ার, পড়াশোনা বা সম্পর্কে বড় ক্ষতি করছে?"
    },
    options: [
      { text: { en: "Severely affected, can't function properly", bn: "হ্যাঁ, আমি কর্মক্ষমতা হারিয়ে ফেলছি, অফিস বা ক্লাসে যাওয়া প্রায় বন্ধ" }, score: 3, tags: ["functional_impairment", "depression_severe"] },
      { text: { en: "Significantly affected", bn: "কাজে মনোযোগ দিতে পারছি না, পারফরম্যান্স আগের চেয়ে অনেক খারাপ হয়ে গেছে" }, score: 2, tags: ["functional_impairment_moderate"] },
      { text: { en: "Somewhat affected", bn: "কিছুটা সমস্যা হচ্ছে, তবে সামলাচ্ছি" }, score: 1, tags: ["functional_impairment_mild"] },
      { text: { en: "Not significantly affected", bn: "তেমন কোনো সমস্যা হচ্ছে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "mood_15",
    segmentId: "mood",
    text: {
      en: "Do these symptoms come in cycles (extreme highs and lows)?",
      bn: "এই লক্ষণগুলো কি আপনার জীবনে চক্রাকারে (কখনো চরম ভালো, কখনো চরম খারাপ) বারবার ফিরে আসে?"
    },
    options: [
      { text: { en: "Yes, clear cycles of highs and lows", bn: "হ্যাঁ, কয়েক মাস পর পর বা বছরের নির্দিষ্ট সময়ে এই ভালো-খারাপের সাইকেলটি ঘটে" }, score: 3, tags: ["bipolar_cyclic"] },
      { text: { en: "Somewhat cyclical pattern", bn: "কিছুটা চক্রাকারে আসে" }, score: 2, tags: ["bipolar_mild"] },
      { text: { en: "Occasional ups and downs", bn: "মাঝে মাঝে ভালো-মন্দ হয়" }, score: 1, tags: ["mood_swings_mild"] },
      { text: { en: "No, it's continuously low", bn: "না, আমার এই মন খারাপের অনুভূতিটি একটানা দীর্ঘদিন ধরে চলছে" }, score: 0, tags: ["unipolar_depression"] }
    ]
  },

  // ===== SEGMENT 2: ANXIETY DISORDERS (15 Questions) =====
  {
    id: "anx_1",
    segmentId: "anxiety",
    text: {
      en: "What is the nature of your worry?",
      bn: "আপনার দুশ্চিন্তার ধরনটি কেমন?"
    },
    options: [
      { text: { en: "Constant worry about everything, no specific reason", bn: "নির্দিষ্ট কোনো কারণ ছাড়াই সারাক্ষণ, প্রতিদিন ছোটখাটো সব বিষয় নিয়ে মন অস্থির থাকে" }, score: 3, tags: ["anxiety_severe", "gad"] },
      { text: { en: "Sudden intense fear attacks", bn: "হুট করে কোনো কারণ ছাড়াই তীব্র ভয়ের একটা ঝাপটা আসে" }, score: 3, tags: ["panic_disorder"] },
      { text: { en: "Worried about social situations", bn: "মানুষের সামনে কথা বলতে বা অচেনা পরিবেশে গেলে বুক কেঁপে ওঠে" }, score: 2, tags: ["social_anxiety"] },
      { text: { en: "Occasional worry about real problems", bn: "মাঝে মাঝে বাস্তব সমস্যা নিয়ে চিন্তা করি" }, score: 1, tags: ["anxiety_mild"] }
    ]
  },
  {
    id: "anx_2",
    segmentId: "anxiety",
    text: {
      en: "Can you control your anxiety or fears?",
      bn: "আপনার এই দুশ্চিন্তা বা ভয়গুলো আপনি কতটা নিয়ন্ত্রণ করতে পারেন?"
    },
    options: [
      { text: { en: "Cannot control at all, mind races constantly", bn: "আমি চাইলেও এই চিন্তার স্রোত থামাতে পারি না, মাথা সারাক্ষণ খা খা করে" }, score: 3, tags: ["anxiety_severe", "gad"] },
      { text: { en: "Fear comes so fast I can't control it", bn: "ভয়টা এত দ্রুত আসে যে নিয়ন্ত্রণ করার কোনো সুযোগই পাই না" }, score: 3, tags: ["panic_disorder"] },
      { text: { en: "Can control with some effort", bn: "একটু সময় নিয়ে নিজেকে বোঝালে বা ওখান থেকে সরে আসলে শান্ত হতে পারি" }, score: 2, tags: ["anxiety_moderate"] },
      { text: { en: "Can manage easily", bn: "সহজেই নিয়ন্ত্রণ করতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_3",
    segmentId: "anxiety",
    text: {
      en: "Which physical symptoms do you experience most during anxiety?",
      bn: "দুশ্চিন্তার সময় আপনার শরীরে নিচের কোন লক্ষণটি সবচেয়ে বেশি দেখা যায়?"
    },
    options: [
      { text: { en: "Muscle tension, headache, can't relax", bn: "পেশি শক্ত হয়ে থাকা, ঘাড় ও মাথায় প্রচণ্ড ব্যথা, সহজে রিল্যাক্স হতে না পারা" }, score: 2, tags: ["anxiety_moderate", "somatic_tension"] },
      { text: { en: "Heart palpitations, breathlessness, trembling, sweating", bn: "বুক ধড়ফড় করা, দম আটকে আসা, হাত-পা অবশ হয়ে যাওয়া বা কাঁপা, প্রচণ্ড ঘাম হওয়া" }, score: 3, tags: ["panic_disorder"] },
      { text: { en: "Stomach discomfort or dry mouth", bn: "শুধু পেটের ভেতর কেমন যেন মোচড় দিয়ে ওঠে বা মুখ শুকিয়ে যায়" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "No physical symptoms", bn: "কোনো শারীরিক লক্ষণ নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_4",
    segmentId: "anxiety",
    text: {
      en: "Do you constantly fear that something bad will happen?",
      bn: "আপনার কি সারাক্ষণ কোনো অজানা খারাপ কিছু ঘটার ভয় বা আশঙ্কা কাজ করে?"
    },
    options: [
      { text: { en: "Yes, constant fear of catastrophe", bn: "হ্যাঁ, মনে হয় এই বুঝি আমার বা পরিবারের কারও বড় কোনো বিপদ বা দুর্ঘটনা ঘটবে" }, score: 3, tags: ["anxiety_severe", "gad"] },
      { text: { en: "Fear of heart attack or going crazy", bn: "না, তবে আমার ভয় হয় যে আমার হুট করে হার্ট অ্যাটাক হবে বা আমি পাগল হয়ে যাবো" }, score: 2, tags: ["panic_disorder", "hypochondriasis"] },
      { text: { en: "Occasional unrealistic fears", bn: "মাঝে মাঝে অলীক ভয় কাজ করে" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "No such fears", bn: "এমন কোনো অলীক ভয় আমার কাজ করে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_5",
    segmentId: "anxiety",
    text: {
      en: "How do you feel about social events (weddings, presentations, gatherings)?",
      bn: "কোনো সামাজিক অনুষ্ঠান (যেমন: বিয়ে বাড়ি, প্রেজেন্টেশন, অপরিচিত মানুষের আড্ডা) নিয়ে আপনার অনুভূতি কী?"
    },
    options: [
      { text: { en: "Intense fear of being judged or embarrassed", bn: "আমি তীব্র ভয় পাই যে সবাই আমার দিকে তাকিয়ে আছে, আমি কোনো ভুল করলে সবাই হাসাহাসি করবে" }, score: 3, tags: ["social_anxiety_severe"] },
      { text: { en: "Fear of having a panic attack in public", bn: "সামাজিক অনুষ্ঠান ভালোই লাগে, কিন্তু সেখানে প্যানিক অ্যাটাক হলে মানুষ দেখে ফেলবে—এই ভয়ে যেতে পারি না" }, score: 2, tags: ["agoraphobia", "panic_disorder"] },
      { text: { en: "Some nervousness but manageable", bn: "একটু নার্ভাস লাগলেও সামাজিক অনুষ্ঠানে আমি স্বাভাবিকভাবেই অংশ নিতে পারি" }, score: 1, tags: ["social_anxiety_mild"] },
      { text: { en: "No issue with social events", bn: "সামাজিক অনুষ্ঠানে কোনো সমস্যা নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_6",
    segmentId: "anxiety",
    text: {
      en: "How is your restlessness?",
      bn: "আপনার অস্থিরতা বা ছটফটে ভাব কেমন থাকে?"
    },
    options: [
      { text: { en: "Constant restlessness, can't sit still", bn: "সারাক্ষণ মনের ভেতর একটা খুতখুতানি বা অস্থিরতা থাকে, এক জায়গায় শান্ত হয়ে বসতে পারি না" }, score: 3, tags: ["anxiety_severe", "gad"] },
      { text: { en: "Restless during anxiety attacks", bn: "আমি সাধারণত শান্তই থাকি, কিন্তু ভয়ের অ্যাটাকটা আসলে ছটফট করতে থাকি" }, score: 2, tags: ["panic_disorder"] },
      { text: { en: "Occasionally restless", bn: "মাঝে মাঝে একটু অস্থির লাগে" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "No restlessness", bn: "এমন কোনো অস্থিরতা আমার নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_7",
    segmentId: "anxiety",
    text: {
      en: "Has your sleep been affected by anxiety?",
      bn: "দুশ্চিন্তার কারণে আপনার ঘুমের কী পরিবর্তন হয়েছে?"
    },
    options: [
      { text: { en: "Can't sleep for hours, mind racing", bn: "মাথায় সারাক্ষণ চিন্তার চাকা ঘোরে বলে বিছানায় শুয়েও ঘণ্টার পর ঘণ্টা ঘুম আসে না" }, score: 3, tags: ["anxiety_severe", "insomnia"] },
      { text: { en: "Wake up with palpitations or nightmares", bn: "ভয়ের বা দুঃস্বপ্নের ধাক্কায় হুট করে বুক ধড়ফড়ানি নিয়ে মাঝরাতে ঘুম ভেঙে যায়" }, score: 2, tags: ["panic_disorder", "insomnia"] },
      { text: { en: "Occasional sleep disturbance", bn: "মাঝে মাঝে ঘুমে ব্যাঘাত ঘটে" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "Normal sleep", bn: "ঘুম স্বাভাবিক আছে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_8",
    segmentId: "anxiety",
    text: {
      en: "Do you have extreme fears of specific objects or situations?",
      bn: "আপনি কি কোনো নির্দিষ্ট বস্তু বা পরিস্থিতিকে (যেমন: তেলাপোকা, ইনজেকশন, লিফট, উচু জায়গা) চরম অযৌক্তিক ভয় পান?"
    },
    options: [
      { text: { en: "Yes, extreme irrational fear", bn: "হ্যাঁ, সাধারণ মানুষের চেয়ে ওই জিনিসগুলোর প্রতি আমার ভয় মারাত্মক বেশি এবং আমি ওগুলো এড়িয়ে চলি" }, score: 3, tags: ["specific_phobia"] },
      { text: { en: "Fear of closed spaces or heights", bn: "বদ্ধ জায়গা বা লিফটে আমার ভয় লাগে কারণ মনে হয় দম আটকে যাবে" }, score: 2, tags: ["claustrophobia", "panic_disorder"] },
      { text: { en: "Some fear but manageable", bn: "সামান্য ভয় বা অস্বস্তি লাগলেও ওটা কোনো বড় সমস্যা নয়" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "No specific fears", bn: "এমন কোনো ভয় নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_9",
    segmentId: "anxiety",
    text: {
      en: "Do you become irritable suddenly?",
      bn: "আপনার কি হুট করে মেজাজ খিটখিটে হয়ে যায়?"
    },
    options: [
      { text: { en: "Yes, irritated by small things", bn: "হ্যাঁ, সারাক্ষণ দুশ্চিন্তার চাপে থাকার কারণে মানুষের সাধারণ কথায় বা ছোটখাটো বিষয়েও মেজাজ গরম হয়ে যায়" }, score: 3, tags: ["anxiety_severe", "irritability"] },
      { text: { en: "Sometimes irritable", bn: "মাঝে মাঝে খিটখিটে লাগে" }, score: 2, tags: ["anxiety_moderate"] },
      { text: { en: "Occasionally", bn: "মাঝে মাঝে একটু" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "Generally calm", bn: "মেজাজ সাধারণত শান্তই থাকে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_10",
    segmentId: "anxiety",
    text: {
      en: "How is your concentration during anxiety?",
      bn: "দুশ্চিন্তার সময় আপনার মনোযোগের অবস্থা কেমন হয়?"
    },
    options: [
      { text: { en: "Can't focus, mind goes blank", bn: "মন এক জায়গায় বসে না, মন খালি এদিক-ওদিক ছুটে যায় বা মাথা পুরো ফাঁকা হয়ে যায়" }, score: 3, tags: ["anxiety_severe", "concentration_difficulty"] },
      { text: { en: "Hyper-focused on physical symptoms", bn: "ভয়ের সময় শুধু নিজের শরীরের লক্ষণের (যেমন হার্টবিট) ওপর মনোযোগ আটকে থাকে" }, score: 2, tags: ["panic_disorder", "hypervigilance"] },
      { text: { en: "Some concentration difficulty", bn: "কিছুটা মনোযোগ দিতে সমস্যা হয়" }, score: 1, tags: ["anxiety_moderate"] },
      { text: { en: "Normal concentration", bn: "স্বাভাবিক মনোযোগ ধরে রাখতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_11",
    segmentId: "anxiety",
    text: {
      en: "Have you completely stopped doing things to avoid fear?",
      bn: "আপনি কি ভয় বা দুশ্চিন্তা এড়াতে নির্দিষ্ট কোনো জায়গা বা কাজ করা পুরোপুরি বন্ধ করে দিয়েছেন?"
    },
    options: [
      { text: { en: "Yes, stopped going out alone or to public places", bn: "হ্যাঁ, একা বাইরে যাওয়া, শপিং মলে যাওয়া বা গণপরিবহনে ওঠা বন্ধ করে দিয়েছি" }, score: 3, tags: ["agoraphobia", "panic_disorder"] },
      { text: { en: "Avoid social situations where I might be judged", bn: "হ্যাঁ, মানুষের সামনে কথা বলতে হবে এমন চাকরি, ক্লাস বা ইন্টারভিউ আমি এড়িয়ে চলি" }, score: 2, tags: ["social_anxiety_severe"] },
      { text: { en: "Sometimes avoid certain situations", bn: "মাঝে মাঝে কিছু পরিস্থিতি এড়িয়ে চলি" }, score: 1, tags: ["anxiety_moderate"] },
      { text: { en: "Don't avoid anything", bn: "আমি কোনো কাজ বা জায়গা পুরোপুরি এড়িয়ে চলি না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_12",
    segmentId: "anxiety",
    text: {
      en: "How long have these anxiety symptoms been present?",
      bn: "আপনার এই দুশ্চিন্তার লক্ষণগুলো টানা কতদিন ধরে চলছে?"
    },
    options: [
      { text: { en: "More than 6 months, almost daily", bn: "গত ৬ মাসেরও বেশি সময় ধরে প্রায় প্রতিদিন অধিকাংশ সময় দুশ্চিন্তা থাকে" }, score: 3, tags: ["gad", "chronic_anxiety"] },
      { text: { en: "About 1 month, panic attacks", bn: "১ মাসের মতো বা তার কম সময় ধরে এই তীব্র প্যানিক অ্যাটাকগুলো হচ্ছে" }, score: 2, tags: ["panic_disorder"] },
      { text: { en: "A few weeks due to specific stress", bn: "মাত্র কয়েক সপ্তাহ হলো কোনো একটা নির্দিষ্ট কারণে চিন্তা হচ্ছে" }, score: 1, tags: ["situational_anxiety"] },
      { text: { en: "Recent onset", bn: "সম্প্রতি শুরু হয়েছে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_13",
    segmentId: "anxiety",
    text: {
      en: "Do you feel easily fatigued?",
      bn: "আপনার কি সারাক্ষণ নিজের ক্লান্তি বা অল্পতেই হাঁপিয়ে ওঠার সমস্যা হয়?"
    },
    options: [
      { text: { en: "Yes, constantly exhausted", bn: "হ্যাঁ, শরীরে কোনো ভারী রোগ না থাকলেও সারাক্ষণ দুশ্চিন্তার মানসিক ধকলের কারণে শরীর সবসময় ক্লান্ত থাকে" }, score: 3, tags: ["anxiety_severe", "fatigue"] },
      { text: { en: "Often tired", bn: "প্রায়ই ক্লান্ত লাগে" }, score: 2, tags: ["anxiety_moderate"] },
      { text: { en: "Sometimes", bn: "মাঝে মাঝে" }, score: 1, tags: ["anxiety_mild"] },
      { text: { en: "No fatigue", bn: "ক্লান্তি নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_14",
    segmentId: "anxiety",
    text: {
      en: "Do you use substances to cope with anxiety?",
      bn: "আপনি কি আপনার এই ভয় বা দুশ্চিন্তা থেকে সাময়িক মুক্তি পেতে কোনো ওষুধ, অ্যালকোহল বা অন্য কিছুর আশ্রয় নেন?"
    },
    options: [
      { text: { en: "Yes, regularly use sedatives or alcohol", bn: "হ্যাঁ, নিজেকে শান্ত করতে বা ঘুমাতে চিকিৎসকের পরামর্শ ছাড়া ঘুমের বা নেশার ওষুধ ব্যবহার করতে হয়" }, score: 3, tags: ["substance_use", "maladaptive_coping"] },
      { text: { en: "Sometimes use alcohol or substances", bn: "মাঝে মাঝে নিই" }, score: 2, tags: ["substance_use_mild"] },
      { text: { en: "Occasionally use calming methods", bn: "মাঝে মাঝে চা-কফি বা গান শুনে মন ডাইভার্ট করার চেষ্টা করি" }, score: 1, tags: ["adaptive_coping"] },
      { text: { en: "No, I avoid substances", bn: "না, আমি এগুলো এড়িয়ে চলি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "anx_15",
    segmentId: "anxiety",
    text: {
      en: "Do you know your fears are excessive but can't stop them?",
      bn: "আপনার কি মনে হয় যে আপনার এই ভয়গুলো আসলে অতিরিক্ত বা অযৌক্তিক, কিন্তু তাও আপনি নিজেকে থামাতে পারছেন না?"
    },
    options: [
      { text: { en: "Yes, I know it's irrational but can't control it", bn: "হ্যাঁ, আমি জানি এত চিন্তা করার কিছু নেই, তাও মন শোনে না" }, score: 3, tags: ["gad", "intact_insight"] },
      { text: { en: "I believe my fears are real", bn: "না, আমার মনে হয় আমার ভয়গুলো পুরোপুরি বাস্তব এবং আমার শরীরে আসলেই বড় কোনো রোগ আছে" }, score: 2, tags: ["hypochondriasis", "poor_insight"] },
      { text: { en: "Sometimes doubt if my fears are real", bn: "মাঝে মাঝে সন্দেহ হয়" }, score: 1, tags: ["anxiety_moderate"] },
      { text: { en: "My fears are rational", bn: "আমার ভয়গুলো পরিস্থিতি অনুযায়ী স্বাভাবিক" }, score: 0, tags: [] }
    ]
  },

  // ===== SEGMENT 3: OCD (15 Questions) =====
  {
    id: "ocd_1",
    segmentId: "ocd",
    text: {
      en: "Do you have recurring, unwanted thoughts or images?",
      bn: "আপনার মাথায় কি এমন কোনো অদ্ভুত বা অস্বস্তিকর চিন্তা, ছবি বা আইডিয়া বারবার আসে যা আপনি চান না?"
    },
    options: [
      { text: { en: "Yes, fear of contamination or germs", bn: "হ্যাঁ, বারবার মনে হয় হাত নোংরা হয়ে আছে, বা কোনো বড় রোগ বা জীবাণু লেগে আছে" }, score: 3, tags: ["ocd_contamination"] },
      { text: { en: "Yes, fear of forgetting to lock doors or turn off gas", bn: "হ্যাঁ, বারবার মনে হয় ঘরের দরজা লক করিনি, বা গ্যাসের চুলা নেভাইনি" }, score: 3, tags: ["ocd_checking"] },
      { text: { en: "Yes, unwanted taboo or aggressive thoughts", bn: "হ্যাঁ, মাথায় কোনো ধার্মিক বা সামাজিক ট্যাবুর বিরুদ্ধে কুচিন্তা বা অপছন্দনীয় ছবি বারবার ভেসে ওঠে" }, score: 3, tags: ["ocd_intrusive"] },
      { text: { en: "No unwanted thoughts", bn: "না, আমার মাথায় এমন কোনো অবাধ্য বা অদ্ভুত চিন্তা বারবার আসে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_2",
    segmentId: "ocd",
    text: {
      en: "How do you feel when these thoughts come?",
      bn: "এই চিন্তাগুলো মাথায় আসলে আপনার কেমন অনুভূতি হয়?"
    },
    options: [
      { text: { en: "Intense anxiety, fear, or guilt", bn: "তীব্র মানসিক অশান্তি, ভয়, অপরাধবোধ বা চরম অ্যাংজাইটি তৈরি হয়" }, score: 3, tags: ["ocd_severe"] },
      { text: { en: "Some discomfort", bn: "একটু খুতখুতানি লাগে" }, score: 1, tags: ["ocd_mild"] },
      { text: { en: "No particular feeling", bn: "কোনো বিশেষ অনুভূতি হয় না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_3",
    segmentId: "ocd",
    text: {
      en: "Do you perform repetitive actions to relieve the anxiety?",
      bn: "এই মানসিক অশান্তি বা দুশ্চিন্তা থেকে বাঁচতে আপনি কি কোনো কাজ বারবার বা নির্দিষ্ট নিয়মে করতে বাধ্য হন?"
    },
    options: [
      { text: { en: "Yes, repeated hand washing or cleaning", bn: "হ্যাঁ, মনের খুতখুতানি দূর করতে আমি বারবার হাত ধুই, গোসলে ঘণ্টার পর ঘণ্টা কাটাই" }, score: 3, tags: ["ocd_cleaning"] },
      { text: { en: "Yes, repeated checking locks, gas, switches", bn: "হ্যাঁ, আমি বারবার তালা, গ্যাসের চাবি, বা ফ্যানের সুইচ গুনে গুনে চেক করি" }, score: 3, tags: ["ocd_checking"] },
      { text: { en: "Yes, mental rituals like counting or praying", bn: "হ্যাঁ, মনে মনে কোনো নির্দিষ্ট দোয়া, সংখ্যা গোনা বা কথা বারবার আওড়াতে হয়" }, score: 3, tags: ["ocd_mental"] },
      { text: { en: "No repetitive actions", bn: "না, আমি কোনো কাজ এভাবে বারবার করতে বাধ্য হই না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_4",
    segmentId: "ocd",
    text: {
      en: "What happens if you're prevented from performing the ritual?",
      bn: "যদি আপনাকে সেই কাজটি (যেমন হাত ধোয়া বা চেক করা) করতে বাধা দেওয়া হয়, তবে আপনার কী হবে?"
    },
    options: [
      { text: { en: "Extreme anxiety, feel like something terrible will happen", bn: "আমার অ্যাংজাইটি এত চরম পর্যায়ে পৌঁছাবে যে মনে হবে আমি পাগল হয়ে যাবো বা এক্ষুনি খারাপ কিছু ঘটে যাবে" }, score: 3, tags: ["ocd_severe"] },
      { text: { en: "Some discomfort or frustration", bn: "একটু অস্বস্তি বা রাগ লাগে" }, score: 1, tags: ["ocd_moderate"] },
      { text: { en: "No problem at all", bn: "কোনো সমস্যাই হবে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_5",
    segmentId: "ocd",
    text: {
      en: "How much time do these thoughts and rituals consume daily?",
      bn: "এই চিন্তা করা এবং সেই অনুযায়ী কাজ করার পেছনে আপনার প্রতিদিন গড়ে কতটুকু সময় নষ্ট হয়?"
    },
    options: [
      { text: { en: "More than 1 hour (sometimes 4-5 hours)", bn: "প্রতিদিন ১ ঘণ্টারও বেশি সময় (কখনো কখনো ৪-৫ ঘণ্টা) এই হাত ধোয়া, গোছানো বা চেকিংয়ে নষ্ট হয়" }, score: 3, tags: ["ocd_severe"] },
      { text: { en: "About 30 minutes to 1 hour", bn: "প্রায় ৩০ মিনিট থেকে ১ ঘণ্টা" }, score: 2, tags: ["ocd_moderate"] },
      { text: { en: "10-15 minutes", bn: "দিনে মাত্র ১০-১৫ মিনিট" }, score: 1, tags: ["ocd_mild"] },
      { text: { en: "No time wasted", bn: "আমার এমন কোনো সময় নষ্ট হয় না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_6",
    segmentId: "ocd",
    text: {
      en: "Do you have specific rules for arranging things?",
      bn: "ঘরের জিনিসপত্র বা নিজের টেবিল সাজানোর ক্ষেত্রে আপনার কি কোনো বিশেষ নিয়ম আছে?"
    },
    options: [
      { text: { en: "Yes, everything must be perfect and ordered", bn: "হ্যাঁ, সব জিনিস একদম নিখুঁতভাবে, সুনির্দিষ্ট লাইনে বা রঙ মিলিয়ে সাজানো থাকতে হবে" }, score: 3, tags: ["ocd_symmetry"] },
      { text: { en: "I prefer things organized", bn: "আমি গোছানো জিনিস পছন্দ করি" }, score: 1, tags: ["ocd_mild"] },
      { text: { en: "No specific rules", bn: "আমি বেশ অগোছালো মানুষ" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_7",
    segmentId: "ocd",
    text: {
      en: "Do you have difficulty throwing things away?",
      bn: "আপনার কি কোনো জিনিস (যেমন পুরনো কাগজ, ঠোঙা, বোতল) অপ্রয়োজনীয় জেনেও ফেলে দিতে তীব্র কষ্ট হয় বা জমিয়ে রাখার অভ্যাস আছে?"
    },
    options: [
      { text: { en: "Yes, I keep everything 'just in case'", bn: "হ্যাঁ, আমার মনে হয় ভবিষ্যতে কখনো লাগতে পারে, এই ভয়ে আমি ঘরভর্তি আবর্জনা বা অপ্রয়োজনীয় জিনিস জমিয়ে রেখেছি" }, score: 3, tags: ["hoarding"] },
      { text: { en: "Sometimes keep sentimental items", bn: "মাঝে মাঝে ডায়েরি বা গিফটের মতো স্মৃতিবিজড়িত জিনিস জমিয়ে রাখি" }, score: 1, tags: ["normal_sentiment"] },
      { text: { en: "No, I discard easily", bn: "না, অপ্রয়োজনীয় জিনিস আমি সহজেই ফেলে দিতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_8",
    segmentId: "ocd",
    text: {
      en: "Do you have fears of harming others or doing something immoral?",
      bn: "আপনার মাথায় কি কখনো কোনো কারণ ছাড়াই কাউকে আঘাত করা বা কোনো অনৈতিক কাজ করে ফেলার অদ্ভুত ভয় আসে?"
    },
    options: [
      { text: { en: "Yes, fear of harming others", bn: "হ্যাঁ, ধারালো কিছু দেখলে মনে হয় আমি কাউকে আঘাত করে বসবো কিনা" }, score: 3, tags: ["ocd_harm"] },
      { text: { en: "Occasional aggressive thoughts", bn: "রাগ হলে সাময়িক মারপিটের চিন্তা আসে" }, score: 1, tags: ["normal_anger"] },
      { text: { en: "No such thoughts", bn: "না, আমার মাথায় এমন কোনো হিংস্র বা অনৈতিক অবাধ্য চিন্তা আসে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_9",
    segmentId: "ocd",
    text: {
      en: "How does this affect your work, studies, or family life?",
      bn: "এই অবাধ্য চিন্তা বা বারবার একই কাজ করার অভ্যাস আপনার পড়াশোনা, চাকরি বা পারিবারিক জীবনে কেমন প্রভাব ফেলছে?"
    },
    options: [
      { text: { en: "Severely affected, can't function", bn: "আমি চরমভাবে পিছিয়ে পড়ছি। হাত ধুতে বা চেক করতেই আমার কাজের বা অফিসের দেরি হয়ে যায়" }, score: 3, tags: ["ocd_severe_impairment"] },
      { text: { en: "Moderately affected", bn: "একটু কাজের গতি কমে যায় বা মানুষ আমাকে খুতখুতে বলে" }, score: 2, tags: ["ocd_moderate_impairment"] },
      { text: { en: "Mildly affected", bn: "সামান্য প্রভাব পড়ে" }, score: 1, tags: ["ocd_mild_impairment"] },
      { text: { en: "Not affected", bn: "আমার জীবনে এর কোনো নেতিবাচক প্রভাব নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_10",
    segmentId: "ocd",
    text: {
      en: "How rational do you think your thoughts and rituals are?",
      bn: "আপনি নিজের মনে এই অবাধ্য চিন্তা বা কাজগুলোকে কতটা যৌক্তিক মনে করেন?"
    },
    options: [
      { text: { en: "I know it's irrational but can't stop", bn: "আমি খুব ভালো করেই জানি যে ১০ বার হাত ধোয়া বা ৫ বার তালা চেক করা একদম পাগলামি ও অযৌক্তিক" }, score: 3, tags: ["ocd_good_insight"] },
      { text: { en: "I think it's necessary and logical", bn: "আমার মনে হয় আমি যা করছি তা পুরোপুরি ঠিক এবং জীবাণু বা বিপদ থেকে বাঁচতে হলে এভাবেই করা উচিত" }, score: 2, tags: ["ocd_poor_insight"] },
      { text: { en: "I've never thought about it", bn: "আমি এ বিষয়ে কখনো ভেবে দেখিনি" }, score: 1, tags: ["ocd_unknown_insight"] }
    ]
  },
  {
    id: "ocd_11",
    segmentId: "ocd",
    text: {
      en: "Do you have counting or repeating words mentally?",
      bn: "আপনার কি কোনো কিছু বারবার গুণতে থাকার বা মনে মনে কোনো শব্দ বারবার রিপিট করার অভ্যাস আছে?"
    },
    options: [
      { text: { en: "Yes, constant counting or repeating", bn: "হ্যাঁ, রাস্তায় চলার সময় গাড়ির নাম্বার, বা ঘরের টাইলস, কিংবা মনে মনে কোনো সংখ্যা বারবার না গুণলে আমার মন শান্ত হয় না" }, score: 3, tags: ["ocd_counting"] },
      { text: { en: "Only when stressed", bn: "শুধু পড়াশোনা বা হিসাবের সময় গুনি" }, score: 1, tags: ["normal_counting"] },
      { text: { en: "No counting habits", bn: "না, এমন কোনো গোনার অভ্যাস আমার নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_12",
    segmentId: "ocd",
    text: {
      en: "Did this start in childhood or adolescence?",
      bn: "এই সমস্যাটি কি আপনার শৈশব বা কৈশোর থেকেই অল্প অল্প করে শুরু হয়েছিল?"
    },
    options: [
      { text: { en: "Yes, since childhood", bn: "হ্যাঁ, ছোটবেলা থেকেই আমার মধ্যে একটু অতিরিক্ত পরিষ্কার থাকা বা খুতখুতানি ছিল" }, score: 3, tags: ["ocd_early_onset"] },
      { text: { en: "Started recently after stress", bn: "না, এটি সাম্প্রতিক সময়ে কোনো বড় মানসিক চাপ বা ঘটনার পর হুট করে শুরু হয়েছে" }, score: 2, tags: ["ocd_adult_onset"] },
      { text: { en: "No such problem", bn: "আমার এমন কোনো সমস্যা অতীতে বা বর্তমানে ছিল না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_13",
    segmentId: "ocd",
    text: {
      en: "Does this cause conflicts with family or friends?",
      bn: "আপনি কি আপনার এই অভ্যাসের কারণে পরিবার বা বন্ধুদের সাথে প্রায়ই ঝগড়া বা অশান্তিতে জড়ান?"
    },
    options: [
      { text: { en: "Yes, I force others to follow my rules", bn: "হ্যাঁ, আমি অন্যদেরও আমার মতো পরিষ্কার থাকতে বা আমার নিয়ম মানতে বাধ্য করি" }, score: 3, tags: ["ocd_family_conflict"] },
      { text: { en: "Sometimes, but mostly internal", bn: "না, আমি আমার খুতখুতানি নিজের মধ্যেই সীমাবদ্ধ রাখি" }, score: 1, tags: ["ocd_internalized"] },
      { text: { en: "No conflicts", bn: "এমন কোনো পরিস্থিতি তৈরি হয় না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_14",
    segmentId: "ocd",
    text: {
      en: "How many times do you check your work before finishing?",
      bn: "আপনি যখন কোনো কাজ (যেমন কোনো ইমেইল বা খাতা লেখা) শেষ করেন, তখন তা কতবার রি-চেক করেন?"
    },
    options: [
      { text: { en: "Countless times, can't stop", bn: "আমি বারবার পড়তে থাকি, কোনো ভুল রয়ে গেল কিনা এই ভয়ে লেখাটা পাঠাতেই পারি না" }, score: 3, tags: ["ocd_checking"] },
      { text: { en: "2-3 times", bn: "সাধারণত একবার বা দুবার চোখ বুলিয়ে নিই" }, score: 1, tags: ["normal_proofreading"] },
      { text: { en: "No checking", bn: "আমি চেক না করেই পাঠিয়ে দিই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "ocd_15",
    segmentId: "ocd",
    text: {
      en: "Do you have physical tics or unusual movements?",
      bn: "এই অবাধ্য চিন্তার হাত থেকে বাঁচতে আপনি কি কখনো কোনো অদ্ভুত শারীরিক অঙ্গভঙ্গি (যেমন মাথা ঝাঁকানো, চোখ পিটপিট করা বা টিক্স) করেন?"
    },
    options: [
      { text: { en: "Yes, head shaking or eye blinking", bn: "হ্যাঁ, মাথায় খারাপ চিন্তা আসলে আমি মাথা জোরে ঝাঁকাই বা অদ্ভুত কোনো আওয়াজ বা মুভমেন্ট করি" }, score: 3, tags: ["ocd_tics"] },
      { text: { en: "Sometimes", bn: "মাঝে মাঝে" }, score: 1, tags: ["ocd_tics_mild"] },
      { text: { en: "No tics", bn: "না, আমি শুধু মনের চিন্তায় অস্থির থাকি" }, score: 0, tags: [] }
    ]
  },

  // ===== SEGMENT 4: TRAUMA & PSYCHOTIC DISORDERS (15 Questions) =====
  {
    id: "tr_1",
    segmentId: "trauma",
    text: {
      en: "Have you experienced any traumatic event in your life?",
      bn: "আপনার জীবনে কি অতীতে ঘটে যাওয়া কোনো ভয়াবহ দুর্ঘটনা, নির্যাতন বা প্রিয়জনের মৃত্যুর গভীর কোনো দাগ আছে?"
    },
    options: [
      { text: { en: "Yes, and it still affects me deeply", bn: "হ্যাঁ, এবং সেই ঘটনার কথা মনে পড়লে আমি আজও আতঙ্কে শিউরে উঠি" }, score: 3, tags: ["trauma_history", "ptsd"] },
      { text: { en: "Some difficult experiences", bn: "হ্যাঁ, তবে তেমন বড় কিছু নয়" }, score: 1, tags: ["normal_stress"] },
      { text: { en: "No major trauma", bn: "না, বড় কোনো ট্রমা নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_2",
    segmentId: "trauma",
    text: {
      en: "Do you have flashbacks or nightmares about the traumatic event?",
      bn: "সেই ট্রমাটিক বা ভয়াবহ ঘটনার স্মৃতি কি আপনার বর্তমানে হুট করে জীবন্ত হয়ে ফিরে আসে?"
    },
    options: [
      { text: { en: "Yes, frequent flashbacks and nightmares", bn: "হ্যাঁ, দিনের বেলা হঠাৎ মনে হয় আমি আবার সেই আগের বিপদের মধ্যেই আছি, চোখের সামনে দৃশ্যগুলো ভেসে ওঠে এবং রাতে ওটা নিয়ে দুঃস্বপ্ন দেখি" }, score: 3, tags: ["ptsd_flashbacks", "ptsd"] },
      { text: { en: "Occasionally remember and feel bad", bn: "মাঝে মাঝে মনে পড়লে খারাপ লাগে, তবে ওটা যে অতীত তা আমি পুরোপুরি ফিল করতে পারি" }, score: 1, tags: ["normal_grief"] },
      { text: { en: "No flashbacks", bn: "না, আমি অতীত সহজে মনে রাখি না বা ওটা আমাকে ডিস্টার্ব করে না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_3",
    segmentId: "trauma",
    text: {
      en: "Do you avoid places, people, or conversations related to the trauma?",
      bn: "আপনি কি সেই ট্রমার সাথে জড়িত কোনো জায়গা, মানুষ বা কথাবার্তা ইচ্ছাকৃতভাবে এড়িয়ে চলেন?"
    },
    options: [
      { text: { en: "Yes, I completely avoid anything related", bn: "হ্যাঁ, আমি ওই রাস্তার পাশ দিয়েও হাঁটি না, বা ওই ঘটনা মনে করায় এমন যেকোনো কিছু থেকে শত হাত দূরে থাকি" }, score: 3, tags: ["ptsd_avoidance", "ptsd"] },
      { text: { en: "Sometimes avoid, but can manage", bn: "না, একটু খারাপ লাগলেও আমি স্বাভাবিকভাবেই সব জায়গায় যেতে বা কথা বলতে পারি" }, score: 1, tags: ["avoidance_mild"] },
      { text: { en: "No avoidance", bn: "আমি ওসব নিয়ে ভাবিই না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_4",
    segmentId: "trauma",
    text: {
      en: "Do you feel detached from reality or your body?",
      bn: "আপনার চারপাশের পরিবেশ বা নিজের অস্তিত্ব নিয়ে কি আপনার কোনো অদ্ভুত বিভ্রম হয়?"
    },
    options: [
      { text: { en: "Yes, I feel outside my body, everything is unreal", bn: "হ্যাঁ, মাঝে মাঝে মনে হয় আমি আমার নিজের শরীর থেকে আলাদা হয়ে ওপর থেকে নিজেকে দেখছি, চারপাশটা পুরো অবাস্তব লাগে" }, score: 3, tags: ["dissociation", "depersonalization", "ptsd"] },
      { text: { en: "Sometimes, especially when stressed", bn: "না, আমি বাস্তবতার সাথে পুরোপুরি যুক্ত থাকি" }, score: 1, tags: ["dissociation_mild"] },
      { text: { en: "No, I'm fully connected to reality", bn: "না, আমি বাস্তবতার সাথে পুরোপুরি যুক্ত থাকি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_5",
    segmentId: "trauma",
    text: {
      en: "Do you hear voices that others don't hear?",
      bn: "আপনি কি কখনো এমন কোনো মানুষের কণ্ঠস্বর বা আওয়াজ শুনতে পান, যা আসেপাশের অন্য কেউ শুনতে পায় না?"
    },
    options: [
      { text: { en: "Yes, I hear voices clearly", bn: "হ্যাঁ, আমি স্পষ্ট শুনি কেউ আমার নাম ধরে ডাকছে, বা নিজেদের মধ্যে কথা বলছে" }, score: 3, tags: ["psychosis_auditory", "schizophrenia"] },
      { text: { en: "Only when falling asleep or waking up", bn: "শুধু যখন ঘুমের ঘোরে থাকি বা জাস্ট ঘুম ভাঙার মুহূর্তে ভ্রমের মতো হালকা আওয়াজ মনে হয়" }, score: 1, tags: ["hypnagogic", "normal"] },
      { text: { en: "No, I don't hear anything", bn: "না, আমি কখনোই এমন অবাস্তব কোনো আওয়াজ শুনি না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_6",
    segmentId: "trauma",
    text: {
      en: "Do you see things that others don't see?",
      bn: "আপনি কি চোখের সামনে এমন কোনো মানুষ, বস্তু বা দৃশ্য দেখতে পান যা অন্যরা দেখতে পায় না?"
    },
    options: [
      { text: { en: "Yes, I see clear shapes or people", bn: "হ্যাঁ, আমি ঘরে বা বাইরে এমন কিছু আকৃতি বা মৃত মানুষের অবয়ব স্পষ্ট দেখি" }, score: 3, tags: ["psychosis_visual", "schizophrenia"] },
      { text: { en: "Sometimes shadows or illusions", bn: "অন্ধকারে মাঝে মাঝে কাপড়ের স্তূপকে মানুষ মনে করে ভুল হয়" }, score: 1, tags: ["illusions", "normal"] },
      { text: { en: "No, I don't see anything", bn: "না, আমি অবাস্তব কিছু দেখি না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_7",
    segmentId: "trauma",
    text: {
      en: "Do you have beliefs that others consider strange or unrealistic?",
      bn: "আপনার কি এমন কোনো গভীর বিশ্বাস আছে যা অন্য সবাই ভুল বা অবাস্তব বললেও আপনি মনে-প্রাণে সত্য বলে বিশ্বাস করেন?"
    },
    options: [
      { text: { en: "Yes, I believe people are plotting against me", bn: "হ্যাঁ, আমার বিশ্বাস কোনো অদৃশ্য শক্তি, গোয়েন্দা বা মানুষ আমার ওপর ২৪ ঘণ্টা নজর রাখছে" }, score: 3, tags: ["paranoia", "delusion_persecutory", "psychosis"] },
      { text: { en: "Yes, I have special powers or a special mission", bn: "হ্যাঁ, আমার মনে হয় আমি কোনো অতিপ্রাকৃতিক ক্ষমতার অধিকারী বা ঈশ্বর আমাকে বিশেষ কোনো মিশন দিয়ে পাঠিয়েছেন" }, score: 3, tags: ["delusion_grandeur", "psychosis"] },
      { text: { en: "No unusual beliefs", bn: "না, আমার এমন কোনো অন্ধ বা অদ্ভুত বিশ্বাস নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_8",
    segmentId: "trauma",
    text: {
      en: "Do you think media messages are directed at you?",
      bn: "সোশাল মিডিয়া, টেলিভিশন বা খবরের কাগজের সাধারণ তথ্যগুলো নিয়ে আপনার কেমন মনে হয়?"
    },
    options: [
      { text: { en: "Yes, news or posts are about me", bn: "আমার স্পষ্ট মনে হয় টিভির নিউজ বা ফেসবুকের পোস্টগুলো আসলে আমাকে উদ্দেশ্য করেই কোনো কোড বা সংকেত আকারে দেওয়া হচ্ছে" }, score: 3, tags: ["delusion_reference", "psychosis"] },
      { text: { en: "Sometimes feel connections", bn: "মাঝে মাঝে কোনো পোস্ট আমার জীবনের সাথে মিলে গেলে কাকতালীয় মনে করি" }, score: 1, tags: ["normal_coincidence"] },
      { text: { en: "No, just general information", bn: "ওগুলো সাধারণ তথ্য, আমার সাথে এর কোনো ব্যক্তিগত সম্পর্ক নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_9",
    segmentId: "trauma",
    text: {
      en: "Do you feel your thoughts are being stolen or inserted?",
      bn: "আপনার কি মনে হয় যে আপনার মনের চিন্তাগুলো অন্য কেউ চুরি করে নিচ্ছে, বা আপনার মাথায় বাইরে থেকে কেউ চিন্তা ঢুকিয়ে দিচ্ছে?"
    },
    options: [
      { text: { en: "Yes, someone is controlling my thoughts", bn: "হ্যাঁ, আমার মনে হয় কোনো চিপ বা ওয়েভ দিয়ে আমার চিন্তাভাবনা নিয়ন্ত্রণ করা হচ্ছে বা আমার মনের কথা সবাই জেনে যাচ্ছে" }, score: 3, tags: ["thought_insertion", "thought_broadcasting", "psychosis"] },
      { text: { en: "No, my thoughts are my own", bn: "না, আমার চিন্তা একান্তই আমার নিজের এবং তা আমার মগজেই থাকে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_10",
    segmentId: "trauma",
    text: {
      en: "Can others easily follow your speech?",
      bn: "কথা বলার সময় অন্যরা কি আপনার কথাবার্তা বা চিন্তার খেই সহজে ধরতে পারে?"
    },
    options: [
      { text: { en: "No, I jump from topic to topic", bn: "অনেকেই বলে আমি এক কথা থেকে হুট করে একদম সম্পর্কহীন অন্য কথায় চলে যাই, আমার কথার কোনো আগামাথা খুঁজে পাওয়া যায় না" }, score: 3, tags: ["disorganized_speech", "psychosis"] },
      { text: { en: "Sometimes, especially when nervous", bn: "নার্ভাস থাকলে মাঝে মাঝে একটু আমতা আমতা করি" }, score: 1, tags: ["normal_anxiety"] },
      { text: { en: "Yes, I speak clearly", bn: "আমি গুছিয়ে কথা বলতে পারি, অন্যরা সহজেই আমার কথা বুঝতে পারে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_11",
    segmentId: "trauma",
    text: {
      en: "Has your emotional expression changed?",
      bn: "আপনার আবেগ প্রকাশ বা মুখের অভিব্যক্তিতে কি কোনো বড় পরিবর্তন এসেছে?"
    },
    options: [
      { text: { en: "I feel no emotions, face is expressionless", bn: "আমার এখন কোনো সুখ, দুঃখ বা অনুভূতি কাজ করে না; আমার মুখ সারাক্ষণ রোবটের মতো ভাবলেশহীন থাকে" }, score: 3, tags: ["flat_affect", "negative_symptoms", "psychosis"] },
      { text: { en: "I express emotions somewhat less", bn: "আমি একটু কম আবেগপ্রবণ মানুষ" }, score: 1, tags: ["introvert"] },
      { text: { en: "Normal emotional expression", bn: "পরিস্থিতি অনুযায়ী আমার রাগ, আনন্দ বা দুঃখ স্বাভাবিকভাবেই প্রকাশ পায়" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_12",
    segmentId: "trauma",
    text: {
      en: "How is your personal hygiene and self-care?",
      bn: "আপনার ব্যক্তিগত পরিষ্কার-পরিচ্ছন্নতা বা সেলফ-কেয়ারের বর্তমান অবস্থা কেমন?"
    },
    options: [
      { text: { en: "I don't bathe or take care of myself", bn: "আমি দিনের পর দিন গোসল করি না, চুল আঁচড়াই না বা কাপড়ের যত্ন নিই না" }, score: 3, tags: ["avolition", "severe_depression", "psychosis"] },
      { text: { en: "Sometimes neglect self-care", bn: "মাঝে মাঝে অলসতার কারণে একটু দেরি হয়" }, score: 1, tags: ["self_care_mild"] },
      { text: { en: "Regular self-care", bn: "আমি আমার নিজের পরিষ্কার-পরিচ্ছন্নতার দিকে নিয়মিত খেয়াল রাখি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_13",
    segmentId: "trauma",
    text: {
      en: "Are you constantly in a state of fear or hypervigilance?",
      bn: "আপনি কি সারাক্ষণ তীব্র ভয়ার্ত বা সতর্ক অবস্থায় থাকেন, যেন এই বুঝি কেউ আপনাকে আক্রমণ করবে?"
    },
    options: [
      { text: { en: "Yes, always watchful and tense", bn: "হ্যাঁ, আমি ঘরে থাকলেও দরজার দিকে তাকিয়ে থাকি, রাস্তায় হাঁটলে বারবার পেছনে তাকাই" }, score: 3, tags: ["hypervigilance", "ptsd", "paranoia"] },
      { text: { en: "Sometimes cautious", bn: "অপরিচিত বা অন্ধকার এলাকায় গেলে একটু সতর্ক থাকি" }, score: 1, tags: ["normal_safety"] },
      { text: { en: "No, I feel safe", bn: "না, আমি নিরাপদ পরিবেশে বেশ রিল্যাক্সড থাকতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_14",
    segmentId: "trauma",
    text: {
      en: "Do you sometimes freeze or become immobile?",
      bn: "আপনার কি মাঝে মাঝে শরীর একদম শক্ত বা জড় হয়ে যায়, যেখানে আপনি দীর্ঘক্ষণ এক ভঙ্গিতে পাথরের মতো বসে বা দাঁড়িয়ে থাকেন?"
    },
    options: [
      { text: { en: "Yes, I freeze for long periods", bn: "হ্যাঁ, মাঝে মাঝে আমার শরীর কোনো নির্দেশ শোনে না, আমি নড়াচড়া না করে ঘণ্টার পর ঘণ্টা একভাবে স্তব্ধ হয়ে থাকি" }, score: 3, tags: ["catatonia", "psychosis"] },
      { text: { en: "No, I don't have such episodes", bn: "না, আমার শরীরে এমন কোনো জড়তা বা অদ্ভুত প্যারালাইসিস হয় না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "tr_15",
    segmentId: "trauma",
    text: {
      en: "Has this completely isolated you from family and friends?",
      bn: "আপনার এই অদ্ভুত অভিজ্ঞতা বা লক্ষণগুলো কি আপনার পরিবার ও বন্ধুদের সাথে আপনার সম্পর্ককে পুরোপুরি বিচ্ছিন্ন করে দিয়েছে?"
    },
    options: [
      { text: { en: "Yes, I've completely withdrawn from everyone", bn: "হ্যাঁ, আমি নিজেকে সমাজ ও পরিবার থেকে পুরোপুরি গুটিয়ে নিয়েছি, কারণ কেউ আমাকে বোঝে না" }, score: 3, tags: ["social_isolation", "severe_psychosis"] },
      { text: { en: "Somewhat isolated", bn: "কিছুটা বিচ্ছিন্ন হয়ে পড়েছি" }, score: 1, tags: ["isolation_mild"] },
      { text: { en: "No, I maintain relationships", bn: "না, আমি কষ্ট সত্ত্বেও পরিবার ও বন্ধুদের সাথে যোগাযোগ বজায় রেখেছি" }, score: 0, tags: [] }
    ]
  },

  // ===== SEGMENT 5: BORDERLINE PERSONALITY (5 Questions) =====
  {
    id: "bpd_1",
    segmentId: "borderline",
    text: {
      en: "Do you have intense, unstable relationships?",
      bn: "আপনার সম্পর্কের ক্ষেত্রে চরম অস্থিরতা আছে কি?"
    },
    options: [
      { text: { en: "Yes, I idealize people then suddenly hate them", bn: "হ্যাঁ, হুট করে কাউকে দেবতাতুল্য মনে হয়, আবার হুট করে তাকে চরম ঘৃণা করি" }, score: 3, tags: ["bpd_relationships"] },
      { text: { en: "Some relationship instability", bn: "কিছুটা অস্থিরতা আছে" }, score: 1, tags: ["bpd_mild"] },
      { text: { en: "Stable relationships", bn: "সম্পর্ক স্থিতিশীল" }, score: 0, tags: [] }
    ]
  },
  {
    id: "bpd_2",
    segmentId: "borderline",
    text: {
      en: "Do you experience intense anger or difficulty controlling it?",
      bn: "আপনার কি তীব্র রাগ হয় বা রাগ নিয়ন্ত্রণে কষ্ট হয়?"
    },
    options: [
      { text: { en: "Yes, I have extreme anger outbursts", bn: "হ্যাঁ, আমার চরম রাগের বিস্ফোরণ হয়" }, score: 3, tags: ["bpd_anger"] },
      { text: { en: "Sometimes I get very angry", bn: "মাঝে মাঝে খুব রাগ হয়" }, score: 1, tags: ["bpd_anger_mild"] },
      { text: { en: "I can control my anger", bn: "আমি রাগ নিয়ন্ত্রণ করতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "bpd_3",
    segmentId: "borderline",
    text: {
      en: "Do you have a pattern of unstable self-image?",
      bn: "আপনার কি নিজের সম্পর্কে ধারণা প্রায়ই বদলায়?"
    },
    options: [
      { text: { en: "Yes, I don't know who I am", bn: "হ্যাঁ, আমি কে তা আমি বুঝতে পারি না" }, score: 3, tags: ["bpd_identity"] },
      { text: { en: "Sometimes I question my identity", bn: "মাঝে মাঝে নিজেকে নিয়ে সন্দেহ হয়" }, score: 1, tags: ["identity_issue_mild"] },
      { text: { en: "I have a stable sense of self", bn: "আমার নিজের সম্পর্কে স্পষ্ট ধারণা আছে" }, score: 0, tags: [] }
    ]
  },
  {
    id: "bpd_4",
    segmentId: "borderline",
    text: {
      en: "Do you engage in impulsive, self-damaging behaviors?",
      bn: "আপনি কি নিজের ক্ষতি করে এমন হঠকারী কাজ করেন?"
    },
    options: [
      { text: { en: "Yes, self-harm, binge eating, substance use", bn: "হ্যাঁ, নিজের হাত কাটা, বেশি খাওয়া, ড্রাগ ব্যবহার" }, score: 3, tags: ["bpd_impulsivity", "self_harm"] },
      { text: { en: "Sometimes I do risky things", bn: "মাঝে মাঝে ঝুঁকিপূর্ণ কাজ করি" }, score: 1, tags: ["impulsivity_mild"] },
      { text: { en: "No impulsive behaviors", bn: "হঠকারী কাজ করি না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "bpd_5",
    segmentId: "borderline",
    text: {
      en: "Do you feel empty or have fears of abandonment?",
      bn: "আপনি কি শূন্যতা অনুভব করেন বা পরিত্যক্ত হওয়ার ভয় পান?"
    },
    options: [
      { text: { en: "Yes, constant emptiness and fear of being left", bn: "হ্যাঁ, সারাক্ষণ শূন্যতা লাগে এবং ভয় হয় সবাই আমাকে ছেড়ে চলে যাবে" }, score: 3, tags: ["bpd_emptiness", "abandonment_fear"] },
      { text: { en: "Sometimes feel empty or scared", bn: "মাঝে মাঝে শূন্যতা বা ভয় লাগে" }, score: 1, tags: ["emptiness_mild"] },
      { text: { en: "No, I feel fine", bn: "না, আমার তেমন কিছু লাগে না" }, score: 0, tags: [] }
    ]
  },

  // ===== SEGMENT 6: NARCISSISTIC PERSONALITY (5 Questions) =====
  {
    id: "npd_1",
    segmentId: "narcissistic",
    text: {
      en: "Do you feel you are more important or special than others?",
      bn: "আপনি কি নিজেকে অন্যদের চেয়ে বেশি গুরুত্বপূর্ণ বা বিশেষ মনে করেন?"
    },
    options: [
      { text: { en: "Yes, I'm special and only I can understand things", bn: "হ্যাঁ, আমি স্পেশাল এবং শুধু আমিই কিছু বুঝি" }, score: 3, tags: ["npd_grandiosity"] },
      { text: { en: "Sometimes I think I'm better", bn: "মাঝে মাঝে নিজেকে ভালো মনে হয়" }, score: 1, tags: ["npd_mild"] },
      { text: { en: "I see myself as equal to others", bn: "আমি নিজেকে অন্যদের সমান মনে করি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "npd_2",
    segmentId: "narcissistic",
    text: {
      en: "Do you constantly seek admiration and attention?",
      bn: "আপনি কি সব সময় প্রশংসা এবং মনোযোগ খোঁজেন?"
    },
    options: [
      { text: { en: "Yes, I need constant praise", bn: "হ্যাঁ, আমার সব সময় প্রশংসার প্রয়োজন" }, score: 3, tags: ["npd_attention"] },
      { text: { en: "I enjoy attention but don't need it", bn: "মনোযোগ পেতে ভালো লাগে, কিন্তু প্রয়োজন নেই" }, score: 1, tags: ["attention_seeking_mild"] },
      { text: { en: "I'm content without constant praise", bn: "নিজের সম্পর্কে সন্তুষ্ট, প্রশংসার প্রয়োজন নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "npd_3",
    segmentId: "narcissistic",
    text: {
      en: "Do you lack empathy for others' feelings?",
      bn: "আপনি কি অন্যদের অনুভূতি বুঝতে পারেন না?"
    },
    options: [
      { text: { en: "Yes, I don't care about others' feelings", bn: "হ্যাঁ, আমার অন্যদের অনুভূতি নিয়ে চিন্তা নেই" }, score: 3, tags: ["npd_empathy"] },
      { text: { en: "Sometimes I struggle with empathy", bn: "মাঝে মাঝে বুঝতে কষ্ট হয়" }, score: 1, tags: ["empathy_mild"] },
      { text: { en: "I'm empathetic towards others", bn: "আমি অন্যদের প্রতি সহানুভূতিশীল" }, score: 0, tags: [] }
    ]
  },
  {
    id: "npd_4",
    segmentId: "narcissistic",
    text: {
      en: "Do you believe others should always follow your rules?",
      bn: "আপনি কি মনে করেন সবাই আপনার নিয়ম মেনে চলা উচিত?"
    },
    options: [
      { text: { en: "Yes, I expect others to obey me", bn: "হ্যাঁ, আমার মনে হয় সবাই আমার কথা শুনবে" }, score: 3, tags: ["npd_control"] },
      { text: { en: "Sometimes I want things my way", bn: "মাঝে মাঝে নিজের মতো করতে চাই" }, score: 1, tags: ["control_mild"] },
      { text: { en: "I respect others' opinions", bn: "আমি অন্যদের মতামত সম্মান করি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "npd_5",
    segmentId: "narcissistic",
    text: {
      en: "Do you feel envious of others or believe others envy you?",
      bn: "আপনি কি অন্যদের প্রতি ঈর্ষা বোধ করেন বা মনে করেন অন্যরা আপনাকে ঈর্ষা করে?"
    },
    options: [
      { text: { en: "Yes, I often feel envy or think others envy me", bn: "হ্যাঁ, আমি প্রায়ই ঈর্ষা করি বা মনে করি অন্যরা আমাকে ঈর্ষা করে" }, score: 3, tags: ["npd_envy"] },
      { text: { en: "Sometimes I feel envy", bn: "মাঝে মাঝে ঈর্ষা লাগে" }, score: 1, tags: ["envy_mild"] },
      { text: { en: "No envy, I'm content", bn: "না, আমি সন্তুষ্ট" }, score: 0, tags: [] }
    ]
  },

  // ===== SEGMENT 7: EATING DISORDERS (5 Questions) =====
  {
    id: "eat_1",
    segmentId: "eating",
    text: {
      en: "Are you extremely concerned about your weight and body shape?",
      bn: "আপনি কি নিজের ওজন এবং শরীরের আকৃতি নিয়ে চরম উদ্বিগ্ন?"
    },
    options: [
      { text: { en: "Yes, constantly worry about weight", bn: "হ্যাঁ, সারাক্ষণ ওজন নিয়ে চিন্তা করি" }, score: 3, tags: ["eating_concern"] },
      { text: { en: "Sometimes worry about weight", bn: "মাঝে মাঝে চিন্তা করি" }, score: 1, tags: ["eating_concern_mild"] },
      { text: { en: "I'm comfortable with my body", bn: "আমার শরীর নিয়ে আমি সন্তুষ্ট" }, score: 0, tags: [] }
    ]
  },
  {
    id: "eat_2",
    segmentId: "eating",
    text: {
      en: "Do you restrict your food intake severely?",
      bn: "আপনি কি খুব কম খাবার খান?"
    },
    options: [
      { text: { en: "Yes, I eat very little to avoid gaining weight", bn: "হ্যাঁ, ওজন বাড়ার ভয়ে আমি খুব কম খাই" }, score: 3, tags: ["anorexia"] },
      { text: { en: "Sometimes skip meals", bn: "মাঝে মাঝে খাবার এড়িয়ে চলি" }, score: 1, tags: ["restriction_mild"] },
      { text: { en: "I eat normally", bn: "আমি স্বাভাবিক খাই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "eat_3",
    segmentId: "eating",
    text: {
      en: "Do you binge eat and then feel guilty?",
      bn: "আপনি কি প্রচুর খেয়ে ফেলেন এবং পরে অপরাধবোধ করেন?"
    },
    options: [
      { text: { en: "Yes, I binge eat and then feel terrible", bn: "হ্যাঁ, আমি অনেক খেয়ে ফেলি এবং পরে খুব খারাপ অনুভব করি" }, score: 3, tags: ["bulimia", "binge_eating"] },
      { text: { en: "Sometimes I overeat and feel guilty", bn: "মাঝে মাঝে বেশি খাই এবং অপরাধবোধ হয়" }, score: 1, tags: ["overeating_mild"] },
      { text: { en: "No binge eating", bn: "না, আমি বেশি খাই না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "eat_4",
    segmentId: "eating",
    text: {
      en: "Do you vomit or use laxatives after eating?",
      bn: "খাওয়ার পর আপনি কি বমি করেন বা রেচক ব্যবহার করেন?"
    },
    options: [
      { text: { en: "Yes, I force myself to vomit", bn: "হ্যাঁ, আমি জোর করে বমি করি" }, score: 3, tags: ["bulimia_purging"] },
      { text: { en: "Sometimes I try to 'undo' the eating", bn: "মাঝে মাঝে খাবার 'নষ্ট' করার চেষ্টা করি" }, score: 1, tags: ["purging_mild"] },
      { text: { en: "No purging behaviors", bn: "না, আমি এমন কিছু করি না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "eat_5",
    segmentId: "eating",
    text: {
      en: "Do you see yourself as overweight even when others say you're not?",
      bn: "অন্যরা পাতলা বললেও আপনি কি নিজেকে মোটা মনে করেন?"
    },
    options: [
      { text: { en: "Yes, I see myself as fat no matter what", bn: "হ্যাঁ, আমি নিজেকে সব সময় মোটা দেখি" }, score: 3, tags: ["body_dysmorphia", "anorexia"] },
      { text: { en: "Sometimes I think I'm overweight", bn: "মাঝে মাঝে মনে হয় মোটা" }, score: 1, tags: ["body_image_mild"] },
      { text: { en: "I see myself realistically", bn: "আমি নিজেকে বাস্তবসম্মতভাবে দেখি" }, score: 0, tags: [] }
    ]
  },

  // ===== SEGMENT 8: MALADAPTIVE DAYDREAMING (4 Questions) =====
  {
    id: "md_1",
    segmentId: "maladaptive",
    text: {
      en: "Do you spend hours lost in fantasy or imaginary worlds?",
      bn: "আপনি কি মনের ভেতর একটি সমান্তরাল পৃথিবী বা কল্পনার জগতে ঘণ্টার পর ঘণ্টা হারিয়ে যান?"
    },
    options: [
      { text: { en: "Yes, I spend 2+ hours daily daydreaming", bn: "হ্যাঁ, আমি প্রতিদিন ২+ ঘণ্টা কল্পনায় কাটাই" }, score: 3, tags: ["maladaptive_daydreaming"] },
      { text: { en: "Sometimes I daydream excessively", bn: "মাঝে মাঝে বেশি কল্পনা করি" }, score: 1, tags: ["daydreaming_mild"] },
      { text: { en: "No, I don't daydream much", bn: "না, আমি বেশি কল্পনা করি না" }, score: 0, tags: [] }
    ]
  },
  {
    id: "md_2",
    segmentId: "maladaptive",
    text: {
      en: "Do you find it difficult to stop daydreaming and focus on reality?",
      bn: "কল্পনা করা বন্ধ করে বাস্তবে মনোযোগ দিতে আপনার কি কষ্ট হয়?"
    },
    options: [
      { text: { en: "Yes, I can't control when I start daydreaming", bn: "হ্যাঁ, আমি কল্পনা শুরু হলে থামাতে পারি না" }, score: 3, tags: ["md_control"] },
      { text: { en: "Sometimes I struggle to stop", bn: "মাঝে মাঝে থামাতে কষ্ট হয়" }, score: 1, tags: ["md_control_mild"] },
      { text: { en: "I can stop when needed", bn: "প্রয়োজন হলে থামাতে পারি" }, score: 0, tags: [] }
    ]
  },
  {
    id: "md_3",
    segmentId: "maladaptive",
    text: {
      en: "Does daydreaming interfere with your work, studies, or relationships?",
      bn: "আপনার এই কল্পনার অভ্যাস কি আপনার পড়াশোনা, কাজ বা সম্পর্ককে ব্যাহত করছে?"
    },
    options: [
      { text: { en: "Yes, I miss deadlines and ignore people", bn: "হ্যাঁ, আমার কাজ শেষ হয় না, মানুষের সাথে যোগাযোগ কমে গেছে" }, score: 3, tags: ["md_impairment"] },
      { text: { en: "Sometimes it affects my productivity", bn: "মাঝে মাঝে কাজে প্রভাব পড়ে" }, score: 1, tags: ["md_impairment_mild"] },
      { text: { en: "No, it doesn't affect my life", bn: "না, আমার জীবনে এর কোনো প্রভাব নেই" }, score: 0, tags: [] }
    ]
  },
  {
    id: "md_4",
    segmentId: "maladaptive",
    text: {
      en: "Do you make sounds, gestures, or expressions while daydreaming?",
      bn: "কল্পনা করার সময় আপনি কি কোনো শব্দ, অঙ্গভঙ্গি বা মুখের ভাব করেন?"
    },
    options: [
      { text: { en: "Yes, I talk or move while daydreaming", bn: "হ্যাঁ, আমি কল্পনা করার সময় কথা বলি বা নড়াচড়া করি" }, score: 3, tags: ["md_physical"] },
      { text: { en: "Sometimes I make expressions", bn: "মাঝে মাঝে মুখের ভাব বদলায়" }, score: 1, tags: ["md_physical_mild"] },
      { text: { en: "No, I just daydream quietly", bn: "না, আমি শান্তভাবে কল্পনা করি" }, score: 0, tags: [] }
    ]
  }
];

// ==================== EXERCISES ====================
const EXERCISES: { [key: string]: Exercise[] } = {
  depression: [
    {
      id: "dep_ex1",
      category: "depression",
      title: { en: "Behavioral Activation", bn: "আচরণগত সক্রিয়তা" },
      description: { en: "Force yourself to do small tasks even when unmotivated. This releases dopamine and breaks the cycle of inactivity.", bn: "মন ভালো না থাকলেও ছোট কাজ করতে বাধ্য করুন। এটি ডোপামিন রিলিজ করে এবং অলসতার চক্র ভাঙে。" },
      steps: {
        en: ["Start with a tiny task like making your bed", "Set a timer for 5 minutes", "Once you start, momentum builds", "Celebrate completing small tasks"],
        bn: ["বিছানা গোছানোর মতো ছোট কাজ দিয়ে শুরু করুন", "৫ মিনিটের টাইমার সেট করুন", "একবার শুরু করলে গতি তৈরি হয়", "ছোট কাজ শেষ করার জন্য নিজেকে পুরস্কৃত করুন"]
      }
    },
    {
      id: "dep_ex2",
      category: "depression",
      title: { en: "Three Good Things", bn: "তিনটি ভালো জিনিস" },
      description: { en: "Write down three positive things that happened each day. This trains your brain to notice positive events.", bn: "প্রতিদিন ঘটে যাওয়া ৩টি ভালো জিনিস লিখুন। এটি আপনার মস্তিষ্ককে ইতিবাচক জিনিস লক্ষ্য করতে প্রশিক্ষণ দেয়।" },
      steps: {
        en: ["Write 3 good things that happened today", "They can be small or big", "Reflect on why each happened", "Do this for 2 weeks"],
        bn: ["আজ ঘটে যাওয়া ৩টি ভালো জিনিস লিখুন", "ছোট বা বড় যেকোনো কিছু হতে পারে", "প্রতিটি কেন ঘটেছে তা ভাবুন", "২ সপ্তাহ ধরে এটি করুন"]
      }
    },
    {
      id: "dep_ex3",
      category: "depression",
      title: { en: "The 2-Minute Rule", bn: "২ মিনিটের নিয়ম" },
      description: { en: "When overwhelmed by a task, tell yourself you'll only do it for 2 minutes. This lowers the mental barrier to starting.", bn: "কোনো কাজে অভিভূত হলে নিজেকে বলুন আপনি এটি মাত্র ২ মিনিট করবেন। এটি শুরু করার মানসিক বাধা কমায়।" },
      steps: {
        en: ["Pick a task you're avoiding", "Commit to 2 minutes only", "After 2 minutes, you're free to stop", "Often you'll continue"],
        bn: ["একটি কাজ বেছে নিন যা আপনি এড়িয়ে যাচ্ছেন", "শুধু ২ মিনিট করার প্রতিশ্রুতি দিন", "২ মিনিট পর আপনি থামতে পারেন", "প্রায়ই আপনি চালিয়ে যান"]
      }
    }
  ],
  anxiety: [
    {
      id: "anx_ex1",
      category: "anxiety",
      title: { en: "5-4-3-2-1 Grounding Technique", bn: "৫-৪-৩-২-১ গ্রাউন্ডিং টেকনিক" },
      description: { en: "This rapidly pulls you out of anxious thoughts and into the present moment by engaging all your senses.", bn: "এটি আপনার সমস্ত ইন্দ্রিয়কে নিযুক্ত করে দ্রুত উদ্বেগ থেকে বর্তমান মুহূর্তে নিয়ে আসে।" },
      steps: {
        en: ["Look for 5 things you can see", "Touch 4 things you can feel", "Listen for 3 things you can hear", "Smell 2 things", "Taste 1 thing"],
        bn: ["৫টি জিনিস দেখুন যা আপনি দেখতে পাচ্ছেন", "৪টি জিনিস স্পর্শ করুন যা আপনি অনুভব করতে পারেন", "৩টি শব্দ শুনুন যা আপনি শুনতে পাচ্ছেন", "২টি জিনিস শুঁকুন", "১টি জিনিস স্বাদ নিন"]
      }
    },
    {
      id: "anx_ex2",
      category: "anxiety",
      title: { en: "Box Breathing", bn: "বক্স ব্রিদিং" },
      description: { en: "Used by Navy SEALs to stay calm under pressure. Activates the parasympathetic nervous system.", bn: "ন্যাভি সিলস দ্বারা চাপের মধ্যে শান্ত থাকতে ব্যবহৃত হয়। প্যারাসিমপ্যাথেটিক নার্ভাস সিস্টেম সক্রিয় করে।" },
      steps: {
        en: ["Inhale through nose for 4 seconds", "Hold for 4 seconds", "Exhale through mouth for 4 seconds", "Hold empty for 4 seconds", "Repeat 4-5 times"],
        bn: ["৪ সেকেন্ড নাক দিয়ে শ্বাস নিন", "৪ সেকেন্ড ধরে রাখুন", "৪ সেকেন্ড মুখ দিয়ে শ্বাস ছাড়ুন", "৪ সেকেন্ড ফুসফুস খালি রাখুন", "৪-৫ বার পুনরাবৃত্তি করুন"]
      }
    }
  ],
  ocd: [
    {
      id: "ocd_ex1",
      category: "ocd",
      title: { en: "ERP - Exposure and Response Prevention", bn: "ERP - এক্সপোজার অ্যান্ড রেসপন্স প্রিভেনশন" },
      description: { en: "Gradually expose yourself to triggers without performing compulsive behaviors. Teaches your brain nothing bad happens if you resist.", bn: "ধীরে ধীরে ট্রিগারের মুখোমুখি হন কিন্তু কম্পালসিভ কাজ করবেন না। এটি আপনার মস্তিষ্ককে শেখায় যে প্রতিরোধ করলে খারাপ কিছু ঘটে না।" },
      steps: {
        en: ["When urge comes, pause", "Wait 5 minutes before performing the compulsion", "Gradually increase waiting time", "Learn that anxiety passes"],
        bn: ["যখন তাগিদ আসে, থামুন", "কম্পালশন করার আগে ৫ মিনিট অপেক্ষা করুন", "ধীরে ধীরে অপেক্ষার সময় বাড়ান", "শিখুন যে উদ্বেগ চলে যায়"]
      }
    },
    {
      id: "ocd_ex2",
      category: "ocd",
      title: { en: "Brain Lock - 4 Step Technique", bn: "ব্রেইন লক - ৪ ধাপের টেকনিক" },
      description: { en: "A neuroscience-based technique to retrain your brain when obsessive thoughts appear.", bn: "অবসেসিভ চিন্তা দেখা দিলে আপনার মস্তিষ্ককে পুনঃপ্রশিক্ষণ দেওয়ার একটি নিউরোসায়েন্স-ভিত্তিক কৌশল।" },
      steps: {
        en: ["Relabel: Recognize it's OCD, not reality", "Reattribute: It's a brain chemical imbalance", "Refocus: Shift attention to something else for 15 minutes", "Revalue: Treat as worthless noise"],
        bn: ["পুনঃলেবেল: চিনুন এটি ওসিডি, বাস্তবতা নয়", "পুনঃবৈশিষ্ট্য: এটি মস্তিষ্কের রাসায়নিক ভারসাম্যহীনতা", "পুনঃফোকাস: ১৫ মিনিটের জন্য অন্য কিছুতে মনোযোগ দিন", "পুনঃমূল্য: এটিকে মূল্যহীন শব্দ হিসেবে বিবেচনা করুন"]
      }
    }
  ],
  ptsd: [
    {
      id: "ptsd_ex1",
      category: "ptsd",
      title: { en: "Butterfly Hug", bn: "বাটারফ্লাই হাগ" },
      description: { en: "A self-soothing technique that helps calm the nervous system during flashbacks or intense anxiety.", bn: "একটি স্ব-শান্ত করার কৌশল যা ফ্ল্যাশব্যাক বা তীব্র উদ্বেগের সময় স্নায়ুতন্ত্রকে শান্ত করতে সাহায্য করে।" },
      steps: {
        en: ["Cross your arms over your chest like a butterfly", "Alternate tapping on your shoulders", "Breathe deeply while tapping", "Tell yourself 'I'm safe now'"],
        bn: ["প্রজাপতির মতো আপনার বুকের উপর হাত ক্রস করুন", "আপনার কাঁধে পর্যায়ক্রমে ট্যাপ করুন", "ট্যাপ করার সময় গভীর শ্বাস নিন", "নিজেকে বলুন 'আমি এখন নিরাপদ'"]
      }
    }
  ],
  borderline: [
    {
      id: "bpd_ex1",
      category: "borderline",
      title: { en: "TIPP Technique", bn: "TIPP টেকনিক" },
      description: { en: "A crisis intervention technique from DBT that rapidly cools down overwhelming emotions.", bn: "ডিবিটি থেকে একটি ক্রাইসিস ইন্টারভেনশন টেকনিক যা দ্রুত আবেগকে শীতল করে।" },
      steps: {
        en: ["T: Temperature - Cold water on face", "I: Intense Exercise - 20 push-ups", "P: Paced Breathing - 5 sec in, 7 sec out", "P: Paired Muscle Relaxation - Tense then release"],
        bn: ["T: তাপমাত্রা - মুখে ঠান্ডা পানি", "I: তীব্র ব্যায়াম - ২০টি পুশ-আপ", "P: নিয়ন্ত্রিত শ্বাস - ৫ সেকেন্ড নিন, ৭ সেকেন্ড ছাড়ুন", "P: যুগ্ম পেশী শিথিলকরণ - টান দিন তারপর ছেড়ে দিন"]
      }
    }
  ]
};

// ==================== MAIN COMPONENT ====================
export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [currentSegment, setCurrentSegment] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showWelcome, setShowWelcome] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique segments
  const segments = Array.from(new Set(ALL_QUESTIONS.map(q => q.segmentId)));
  const getQuestionsForSegment = (segmentId: string) => ALL_QUESTIONS.filter(q => q.segmentId === segmentId);
  
  const currentSegmentId = segments[currentSegment];
  const currentQuestions = getQuestionsForSegment(currentSegmentId);
  const currentQuestion = currentQuestions[currentQuestionIndex];
  
  const totalQuestions = ALL_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSegment < segments.length - 1) {
      setCurrentSegment(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSegment > 0) {
      setCurrentSegment(prev => prev - 1);
      const prevQuestions = getQuestionsForSegment(segments[currentSegment - 1]);
      setCurrentQuestionIndex(prevQuestions.length - 1);
    }
  };

  const calculateResults = () => {
    setIsLoading(true);
    setTimeout(() => {
      const symptomMap: SymptomMap = {
        depression: 0, anxiety: 0, ocd: 0, ptsd: 0, psychosis: 0,
        borderline: 0, narcissistic: 0, eating: 0, maladaptive: 0,
        dissociation: 0, panic: 0, social_anxiety: 0, bipolar: 0,
        insomnia: 0, suicidal: 0, self_harm: 0, anhedonia: 0, melancholic: 0
      };

      ALL_QUESTIONS.forEach(q => {
        const answerScore = answers[q.id];
        if (answerScore !== undefined) {
          q.options.forEach(opt => {
            if (opt.score === answerScore) {
              opt.tags.forEach(tag => {
                const key = tag.split('_')[0] as keyof SymptomMap;
                if (key in symptomMap) {
                  symptomMap[key] += 1;
                }
              });
            }
          });
        }
      });

      const findings: Finding[] = [];
      const criticalFindings: string[] = [];

      // Depression
      if (symptomMap.depression >= 8) {
        findings.push({
          condition: "Depression-related symptoms",
          severity: "High",
          score: symptomMap.depression,
          maxScore: 15,
          description: "Your responses indicate significant depressive symptoms. This may affect your daily functioning and quality of life.",
          recommendation: "Consider consulting a mental health professional for a comprehensive evaluation.",
          exercises: EXERCISES.depression || []
        });
        if (symptomMap.suicidal > 0) criticalFindings.push("Suicidal thoughts detected - Please seek immediate professional help.");
      } else if (symptomMap.depression >= 4) {
        findings.push({
          condition: "Depression-related symptoms",
          severity: "Moderate",
          score: symptomMap.depression,
          maxScore: 15,
          description: "You're showing some signs of depression. These may be affecting your mood and energy levels.",
          recommendation: "Try the recommended exercises and consider speaking with a therapist.",
          exercises: EXERCISES.depression || []
        });
      } else if (symptomMap.depression >= 2) {
        findings.push({
          condition: "Depression-related symptoms",
          severity: "Mild",
          score: symptomMap.depression,
          maxScore: 15,
          description: "You're experiencing some mild depressive symptoms. This is common and often manageable with self-care.",
          recommendation: "Practice the recommended exercises and maintain a healthy routine.",
          exercises: EXERCISES.depression?.slice(0, 2) || []
        });
      }

      // Anxiety
      if (symptomMap.anxiety >= 8) {
        findings.push({
          condition: "Anxiety-related symptoms",
          severity: "High",
          score: symptomMap.anxiety,
          maxScore: 15,
          description: "Your responses indicate significant anxiety symptoms. This may be interfering with your daily life.",
          recommendation: "Professional evaluation is recommended. The exercises below can help manage anxiety.",
          exercises: EXERCISES.anxiety || []
        });
      } else if (symptomMap.anxiety >= 4) {
        findings.push({
          condition: "Anxiety-related symptoms",
          severity: "Moderate",
          score: symptomMap.anxiety,
          maxScore: 15,
          description: "You're showing moderate signs of anxiety. These can be managed with proper techniques.",
          recommendation: "Practice grounding techniques and consider counseling.",
          exercises: EXERCISES.anxiety?.slice(0, 2) || []
        });
      } else if (symptomMap.anxiety >= 2) {
        findings.push({
          condition: "Anxiety-related symptoms",
          severity: "Mild",
          score: symptomMap.anxiety,
          maxScore: 15,
          description: "You're experiencing some mild anxiety. This is normal and can be managed.",
          recommendation: "Try the breathing and grounding exercises.",
          exercises: EXERCISES.anxiety?.slice(0, 1) || []
        });
      }

      // OCD
      if (symptomMap.ocd >= 8) {
        findings.push({
          condition: "OCD-related symptoms",
          severity: "High",
          score: symptomMap.ocd,
          maxScore: 15,
          description: "Your responses indicate significant obsessive-compulsive patterns. These may be consuming considerable time and energy.",
          recommendation: "Cognitive Behavioral Therapy (CBT) with ERP is recommended. Consult a mental health professional.",
          exercises: EXERCISES.ocd || []
        });
      } else if (symptomMap.ocd >= 4) {
        findings.push({
          condition: "OCD-related symptoms",
          severity: "Moderate",
          score: symptomMap.ocd,
          maxScore: 15,
          description: "You're showing moderate signs of obsessive-compulsive patterns.",
          recommendation: "Try the ERP technique and consider consulting a therapist.",
          exercises: EXERCISES.ocd || []
        });
      } else if (symptomMap.ocd >= 2) {
        findings.push({
          condition: "OCD-related symptoms",
          severity: "Mild",
          score: symptomMap.ocd,
          maxScore: 15,
          description: "You're showing some mild obsessive-compulsive tendencies.",
          recommendation: "Practice the Brain Lock technique when unwanted thoughts arise.",
          exercises: EXERCISES.ocd?.slice(0, 1) || []
        });
      }

      // PTSD
      if (symptomMap.ptsd >= 4) {
        findings.push({
          condition: "PTSD-related symptoms",
          severity: "High",
          score: symptomMap.ptsd,
          maxScore: 8,
          description: "Your responses indicate significant trauma-related symptoms. This may be affecting your sense of safety.",
          recommendation: "Trauma-focused therapy is strongly recommended. Please consult a mental health professional.",
          exercises: EXERCISES.ptsd || []
        });
      } else if (symptomMap.ptsd >= 2) {
        findings.push({
          condition: "PTSD-related symptoms",
          severity: "Moderate",
          score: symptomMap.ptsd,
          maxScore: 8,
          description: "You're showing signs of trauma-related distress.",
          recommendation: "Consider therapy and try the Butterfly Hug technique.",
          exercises: EXERCISES.ptsd || []
        });
      }

      // Psychosis
      if (symptomMap.psychosis >= 3) {
        findings.push({
          condition: "Psychosis-related symptoms",
          severity: "High",
          score: symptomMap.psychosis,
          maxScore: 10,
          description: "Your responses indicate symptoms that may be related to psychosis. This requires immediate professional attention.",
          recommendation: "URGENT: Please consult a psychiatrist immediately for a comprehensive evaluation.",
          exercises: []
        });
        criticalFindings.push("Psychosis-related symptoms detected - Please seek immediate psychiatric evaluation.");
      }

      // Borderline
      if (symptomMap.borderline >= 3) {
        findings.push({
          condition: "Borderline Personality-related symptoms",
          severity: "High",
          score: symptomMap.borderline,
          maxScore: 5,
          description: "Your responses indicate patterns consistent with borderline personality traits.",
          recommendation: "Dialectical Behavior Therapy (DBT) is highly effective. Please consult a mental health professional.",
          exercises: EXERCISES.borderline || []
        });
      } else if (symptomMap.borderline >= 2) {
        findings.push({
          condition: "Borderline Personality-related symptoms",
          severity: "Moderate",
          score: symptomMap.borderline,
          maxScore: 5,
          description: "You're showing some borderline personality traits.",
          recommendation: "Try the TIPP technique for emotional regulation.",
          exercises: EXERCISES.borderline || []
        });
      }

      // Eating Disorder
      if (symptomMap.eating >= 3) {
        findings.push({
          condition: "Eating Disorder-related symptoms",
          severity: "High",
          score: symptomMap.eating,
          maxScore: 5,
          description: "Your responses indicate significant concerns related to eating and body image.",
          recommendation: "Please consult a mental health professional specializing in eating disorders.",
          exercises: []
        });
        criticalFindings.push("Eating disorder symptoms detected - Please seek professional help.");
      } else if (symptomMap.eating >= 2) {
        findings.push({
          condition: "Eating Disorder-related symptoms",
          severity: "Moderate",
          score: symptomMap.eating,
          maxScore: 5,
          description: "You're showing some concerns related to eating and body image.",
          recommendation: "Consider speaking with a therapist about body image and eating patterns.",
          exercises: []
        });
      }

      // Maladaptive Daydreaming
      if (symptomMap.maladaptive >= 3) {
        findings.push({
          condition: "Maladaptive Daydreaming",
          severity: "High",
          score: symptomMap.maladaptive,
          maxScore: 4,
          description: "Your responses indicate significant daydreaming that may be affecting your daily functioning.",
          recommendation: "Try setting a 'daydreaming time' and practice grounding techniques.",
          exercises: []
        });
      } else if (symptomMap.maladaptive >= 2) {
        findings.push({
          condition: "Maladaptive Daydreaming",
          severity: "Moderate",
          score: symptomMap.maladaptive,
          maxScore: 4,
          description: "You're showing some signs of excessive daydreaming.",
          recommendation: "Practice the Stop-Sign Technique and set boundaries for daydreaming.",
          exercises: []
        });
      }

      // Determine overall risk level
      const highRisk = findings.filter(f => f.severity === "High").length;
      const moderateRisk = findings.filter(f => f.severity === "Moderate").length;
      
      let riskLevel: "Low" | "Mild" | "Moderate" | "High" = "Low";
      if (criticalFindings.length > 0 || highRisk >= 2) riskLevel = "High";
      else if (highRisk >= 1) riskLevel = "Moderate";
      else if (moderateRisk >= 2) riskLevel = "Mild";

      // Generate summary
      const summary = {
        en: `Based on your responses, ${findings.length > 0 ? `we've identified ${findings.length} area(s) that may benefit from attention. ${criticalFindings.length > 0 ? 'Please note: Some responses indicate potentially serious concerns.' : 'The recommended exercises can help manage these symptoms.'}` : 'no significant psychological concerns were identified. However, mental health is a journey - continue to practice self-care and stay aware of your well-being.'}`,
        bn: `আপনার উত্তরের ভিত্তিতে, ${findings.length > 0 ? `আমরা ${findings.length} টি এলাকা শনাক্ত করেছি যা মনোযোগের প্রয়োজন হতে পারে। ${criticalFindings.length > 0 ? 'দয়া করে মনে রাখবেন: কিছু উত্তর গুরুতর উদ্বেগ নির্দেশ করে।' : 'প্রস্তাবিত ব্যায়ামগুলি এই উপসর্গগুলি পরিচালনা করতে সাহায্য করতে পারে।'}` : 'কোনো উল্লেখযোগ্য মানসিক উদ্বেগ শনাক্ত করা যায়নি। তবে মানসিক স্বাস্থ্য একটি যাত্রা - আত্ম-যত্ন অনুশীলন চালিয়ে যান এবং আপনার সুস্থতা সম্পর্কে সচেতন থাকুন।'}`
      };

      const resultData: AssessmentResult = {
        findings,
        symptomMap,
        totalQuestions: ALL_QUESTIONS.length,
        answeredQuestions: Object.keys(answers).length,
        completionTime: `${Math.round(Date.now() / 1000)}s`,
        timestamp: new Date().toISOString(),
        riskLevel,
        criticalFindings,
        summary
      };

      setResult(resultData);
      setShowResults(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleStart = () => setShowWelcome(false);
  const handleRetake = () => {
    setCurrentSegment(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setResult(null);
    setShowWelcome(true);
  };

  const lang = {
    en: {
      appName: "Psychological Assessment",
      welcome: {
        title: "Welcome to Psychological Assessment",
        description: "A professional, science-based screening tool designed to help you understand your mental health status.",
        whyImportant: "Why Mental Health Matters",
        benefits: ["Recognize early signs of psychological distress", "Connect mental well-being with daily productivity", "Reduce stigma around mental health issues", "Take the first step toward self-improvement"],
        estimatedTime: "Estimated time: 10-15 minutes",
        startButton: "Start Assessment",
        disclaimer: "This is a screening tool, not a clinical diagnosis. Always consult a qualified mental health professional."
      },
      assessment: {
        progress: "Progress",
        segment: "Segment",
        next: "Next",
        previous: "Previous",
        finish: "Finish"
      },
      results: {
        title: "Your Assessment Results",
        detectedDisorders: "Identified Symptom Domains",
        score: "Score",
        noDisorders: "No significant concerns detected.",
        recommendedExercises: "Recommended Brain Exercises & Techniques",
        disclaimer: "This report is for informational purposes only and does not constitute medical advice. Never make any medication decisions based solely on this assessment. If you're experiencing severe distress or suicidal thoughts, please contact emergency services immediately.",
        downloadReport: "Generate Professional Report",
        retakeButton: "Retake Assessment"
      }
    },
    bn: {
      appName: "মনস্তাত্ত্বিক মূল্যায়ন",
      welcome: {
        title: "মনস্তাত্ত্বিক মূল্যায়নে স্বাগতম",
        description: "একটি পেশাদার, বিজ্ঞান-ভিত্তিক স্ক্রীনিং টুল যা আপনার মানসিক স্বাস্থ্যের অবস্থা বুঝতে সাহায্য করে।",
        whyImportant: "মানসিক স্বাস্থ্য কেন গুরুত্বপূর্ণ",
        benefits: ["মানসিক সমস্যার প্রাথমিক লক্ষণ চিনতে পারবেন", "মানসিক সুস্থতা ও কর্মক্ষমতার সম্পর্ক বুঝতে পারবেন", "মানসিক স্বাস্থ্য নিয়ে কলঙ্ক কমাতে সাহায্য করবে", "আত্ম-উন্নয়নের প্রথম পদক্ষেপ নিতে পারবেন"],
        estimatedTime: "প্রাক্কলিত সময়: ১০-১৫ মিনিট",
        startButton: "মূল্যায়ন শুরু করুন",
        disclaimer: "এটি একটি স্ক্রীনিং টুল, ক্লিনিকাল ডায়াগনোসিস নয়। সর্বদা একজন যোগ্য মানসিক স্বাস্থ্য পেশাদারের সাথে পরামর্শ করুন।"
      },
      assessment: {
        progress: "অগ্রগতি",
        segment: "সেগমেন্ট",
        next: "পরবর্তী",
        previous: "পূর্ববর্তী",
        finish: "সমাপ্ত"
      },
      results: {
        title: "আপনার মূল্যায়নের ফলাফল",
        detectedDisorders: "শনাক্তকৃত লক্ষণ এলাকা",
        score: "স্কোর",
        noDisorders: "কোনো উল্লেখযোগ্য উদ্বেগ শনাক্ত করা যায়নি।",
        recommendedExercises: "প্রস্তাবিত মস্তিষ্কের ব্যায়াম ও কৌশল",
        disclaimer: "এই প্রতিবেদনটি শুধুমাত্র তথ্যগত উদ্দেশ্যে এবং এটি কোনো চিকিৎসা পরামর্শ নয়। কখনোই এই মূল্যায়নের ভিত্তিতে কোনো ওষুধ সেবনের সিদ্ধান্ত নেবেন না।",
        downloadReport: "পেশাদার প্রতিবেদন তৈরি করুন",
        retakeButton: "পুনরায় মূল্যায়ন"
      }
    }
  };

  const t = lang[language];

  // Welcome Screen
  if (showWelcome) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass p-8 md:p-12 rounded-2xl animate-fade-in">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <span className="text-4xl">🧠</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.welcome.title}</h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">{t.welcome.description}</p>
            
            <div className="bg-secondary/30 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-primary mb-2">{t.welcome.whyImportant}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.welcome.benefits.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-muted-foreground">⏱️ {t.welcome.estimatedTime}</p>
            </div>

            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === "en" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === "bn" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
              >
                🇧🇩 বাংলা
              </button>
            </div>

            <button onClick={handleStart} className="w-full py-3 rounded-xl bg-primary hover:bg-primary/80 text-white font-medium transition-all transform hover:scale-[1.02]">
              {t.welcome.startButton}
            </button>
            <p className="text-xs text-muted-foreground/60 mt-4">{t.welcome.disclaimer}</p>
          </div>
        </div>
      </main>
    );
  }

  // Results Screen
  if (showResults && result) {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "High": return "text-red-400";
        case "Moderate": return "text-orange-400";
        case "Mild": return "text-yellow-400";
        default: return "text-muted-foreground";
      }
    };

    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-white">{t.appName}</h1>
            <button onClick={handleRetake} className="text-sm text-muted-foreground hover:text-white transition-colors">
              {t.results.retakeButton}
            </button>
          </div>

          <div className="glass p-6 md:p-8 rounded-2xl animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-6">{t.results.title}</h2>

            {/* Summary */}
            <div className="bg-secondary/30 rounded-xl p-4 mb-6">
              <p className="text-muted-foreground text-sm">{result.summary[language]}</p>
            </div>

            {/* Critical Alerts */}
            {result.criticalFindings.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <h3 className="text-red-400 font-semibold text-sm mb-2">⚠️ {language === "en" ? "Critical Alerts" : "জরুরি সতর্কতা"}</h3>
                {result.criticalFindings.map((alert, i) => (
                  <p key={i} className="text-red-300/80 text-sm">{alert}</p>
                ))}
              </div>
            )}

            {/* Findings */}
            {result.findings.length > 0 ? (
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-white">{t.results.detectedDisorders}</h3>
                {result.findings.map((finding, idx) => (
                  <div key={idx} className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{finding.condition}</h4>
                        <span className={`text-xs ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
                        <p className="text-xs text-primary/80 mt-1">{finding.recommendation}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.results.score}: {finding.score}/{finding.maxScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <p className="text-green-400 text-sm">{t.results.noDisorders}</p>
              </div>
            )}

            {/* Exercises */}
            {result.findings.some(f => f.exercises.length > 0) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-4">{t.results.recommendedExercises}</h3>
                <div className="space-y-3">
                  {result.findings.flatMap(f => f.exercises).map((exercise, idx) => (
                    <div key={idx} className="bg-secondary/30 rounded-xl p-4">
                      <h4 className="font-medium text-white text-sm">{exercise.title[language]}</h4>
                      <p className="text-muted-foreground text-xs mt-1">{exercise.description[language]}</p>
                      {exercise.steps && (
                        <ul className="mt-2 space-y-1">
                          {exercise.steps[language].map((step, stepIdx) => (
                            <li key={stepIdx} className="text-xs text-muted-foreground pl-4">• {step}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3 mt-6">
              <button
  onClick={() => {
    if (result) {
      // Save to global variable (import from report page)
      // Since we can't import directly, use localStorage and sessionStorage
      localStorage.setItem('reportData', JSON.stringify(result));
      sessionStorage.setItem('reportData', JSON.stringify(result));
      router.push('/report');
    }
  }}
  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/80 text-white font-medium transition-all transform hover:scale-[1.02] text-center"
>
  📄 View Report
</button>
              <button 
                onClick={handleRetake} 
                className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-white font-medium transition-all"
              >
                {t.results.retakeButton}
              </button>
            </div>

            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400/80 text-center">{t.results.disclaimer}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Loading Screen
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{language === "en" ? "Analyzing your responses..." : "আপনার উত্তর বিশ্লেষণ করা হচ্ছে..."}</p>
        </div>
      </main>
    );
  }

  // Assessment Screen
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1 && currentSegment === segments.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0 && currentSegment === 0;
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white">{t.appName}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${language === "en" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${language === "bn" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="glass p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{t.assessment.progress} {Math.round(progress)}%</span>
            <span className="text-sm text-muted-foreground">{answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full progress-animate" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {t.assessment.segment} {currentSegment + 1} - {currentQuestionIndex + 1}/{currentQuestions.length}
          </div>
        </div>

        {/* Question */}
        <div className="glass p-6 md:p-8 rounded-2xl animate-fade-in">
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white">{currentQuestion.text[language]}</h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion.id, option.score)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  answers[currentQuestion.id] === option.score
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                }`}
              >
                <span className="text-sm md:text-base text-white">{option.text[language]}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className={`px-4 py-2 rounded-lg transition-all ${
                isFirstQuestion ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
              }`}
            >
              {t.assessment.previous}
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnswered}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                hasAnswered ? "bg-primary hover:bg-primary/80 text-white" : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isLastQuestion ? t.assessment.finish : t.assessment.next}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}