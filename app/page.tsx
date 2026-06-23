'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 1. Language Data
const langData = {
  en: {
    title: "Mental Health & Personality Assessment",
    start: "Begin Assessment",
    next: "Next",
    restart: "Retake",
    lang: "বাংলা",
    disclaimer: "Confidential screening & personality tool. Select what reflects your experience.",
    severe: "You are going through a difficult time. This is not weakness—it's a brain chemistry imbalance. I sincerely recommend consulting a licensed psychiatrist. Taking care of yourself is the greatest courage.",
    moderate: "Your stress level is noticeable, but that's normal. With proper care, you can recover quickly. I have some exercises for you. Don't hesitate to seek professional help if needed.",
    healthy: "Your mental state is wonderful! You are handling life beautifully. Stay mindful, stay strong. You are doing great.",
    askExercise: "Would you like to see some brain exercises for this?",
    yes: "Yes, show me",
    no: "No, thank you",
    exercise: "Exercises & Coping Techniques",
    detected: "Detected Pattern",
    select: "Select an assessment",
    welcome: {
      title: "Welcome to Your Mental Health & Personality Assessment",
      subtitle: "Understand your mind, understand your personality.",
      p1: "🧠 Your mental health affects your daily life, emotions, and decisions.",
      p2: "⚡ Your personality traits shape how you react to stress and relationships.",
      p3: "🌱 Small, honest steps today create a healthier, stronger tomorrow.",
      cta: "Begin Your Journey"
    },
    personality: {
      title: "Personality Traits (Mini-IPIP)",
      desc: "Rate how much you agree with each statement (1=Strongly Disagree to 5=Strongly Agree).",
      result: "Your Personality Profile:",
      traits: {
        Extraversion: "Extraversion (Sociability & Energy)",
        Agreeableness: "Agreeableness (Empathy & Cooperation)",
        Conscientiousness: "Conscientiousness (Discipline & Order)",
        Neuroticism: "Neuroticism (Emotional Stability vs Reactivity)",
        Openness: "Openness (Creativity & New Experiences)"
      }
    },
    report: {
      title: "Psychological Assessment Report",
      generated: "Generated on",
      client: "Client Name",
      dob: "Date of Birth",
      age: "Age",
      assessmentType: "Assessment Type",
      mhResult: "Mental Health Screening Result",
      personalityResult: "Personality Profile (Mini-IPIP)",
      recommendation: "Recommendation",
      disclaimer: "DISCLAIMER: This is NOT a clinical psychological report. It is a self-administered screening tool. Do NOT use this report to self-medicate or make medical decisions. In case of any mental health difficulties, please consult a licensed Clinical Psychiatrist or mental health professional immediately. This report is for informational and self-awareness purposes only.",
      download: "Download Report (PDF)"
    }
  },
  bn: {
    title: "মেন্টাল হেলথ ও পার্সোনালিটি অ্যাসেসমেন্ট",
    start: "অ্যাসেসমেন্ট শুরু করুন",
    next: "পরবর্তী",
    restart: "আবার শুরু করুন",
    lang: "English",
    disclaimer: "গোপনীয় স্ক্রীনিং ও পার্সোনালিটি টুল। আপনার সাথে মিলে যাওয়া অপশন বেছে নিন।",
    severe: "আপনি কঠিন সময় পার করছেন। এটা দুর্বলতা নয়—মস্তিষ্কের রাসায়নিক ভারসাম্যহীনতা। আমি আন্তরিকভাবে একজন সাইকিয়াট্রিস্ট দেখার সুপারিশ করছি। নিজের যত্ন নেওয়াই সবচেয়ে বড় সাহস।",
    moderate: "আপনার মানসিক চাপ কিছুটা বেশি, যা স্বাভাবিক। সঠিক যত্ন নিলে দ্রুত সুস্থ হতে পারেন। আমি কিছু এক্সারসাইজ দিচ্ছি। প্রয়োজনে বিশেষজ্ঞের সাহায্য নিন।",
    healthy: "আপনার মানসিক অবস্থা চমৎকার! আপনি খুব সুন্দরভাবে জীবন সামলাচ্ছেন। সুস্থ থাকুন, নিজের যত্ন নিন!",
    askExercise: "আপনি কি কিছু ব্রেইন এক্সারসাইজ দেখতে চান?",
    yes: "হ্যাঁ, দেখুন",
    no: "না, ধন্যবাদ",
    exercise: "এক্সারসাইজ ও কৌশল",
    detected: "শনাক্ত প্যাটার্ন",
    select: "একটি অ্যাসেসমেন্ট নির্বাচন করুন",
    welcome: {
      title: "আপনার মেন্টাল হেলথ ও পার্সোনালিটি অ্যাসেসমেন্টে স্বাগতম",
      subtitle: "আপনার মন বুঝুন, আপনার ব্যক্তিত্ব বুঝুন।",
      p1: "🧠 আপনার মানসিক স্বাস্থ্য আপনার দৈনন্দিন জীবন, আবেগ ও সিদ্ধান্তকে প্রভাবিত করে।",
      p2: "⚡ আপনার ব্যক্তিত্বের বৈশিষ্ট্য নির্ধারণ করে আপনি কীভাবে স্ট্রেস ও সম্পর্ক সামলান।",
      p3: "🌱 আজকের ছোট, সৎ পদক্ষেপই আগামীর সুস্থ ও শক্তিশালী জীবন তৈরি করে।",
      cta: "যাত্রা শুরু করুন"
    },
    personality: {
      title: "ব্যক্তিত্বের বৈশিষ্ট্য (Mini-IPIP)",
      desc: "প্রতিটি বিবৃতির সাথে আপনি কতটা একমত তা রেট দিন (১=একদম একমত নই থেকে ৫=সম্পূর্ণ একমত)।",
      result: "আপনার ব্যক্তিত্ব প্রোফাইল:",
      traits: {
        Extraversion: "বহির্মুখিতা (সামাজিকতা ও শক্তি)",
        Agreeableness: "সহানুভূতি ও সমঝোতা",
        Conscientiousness: "কর্তব্যনিষ্ঠা ও শৃঙ্খলা",
        Neuroticism: "মানসিক অস্থিরতা ও আবেগপ্রবণতা",
        Openness: "নতুন অভিজ্ঞতায় উন্মুক্ততা ও সৃজনশীলতা"
      }
    },
    report: {
      title: "মনোবৈজ্ঞানিক মূল্যায়ন রিপোর্ট",
      generated: "প্রস্তুতকৃত তারিখ",
      client: "ক্লায়েন্টের নাম",
      dob: "জন্ম তারিখ",
      age: "বয়স",
      assessmentType: "মূল্যায়নের ধরন",
      mhResult: "মানসিক স্বাস্থ্য স্ক্রীনিং ফলাফল",
      personalityResult: "ব্যক্তিত্ব প্রোফাইল (Mini-IPIP)",
      recommendation: "সুপারিশ",
      disclaimer: "সতর্কীকরণ: এটি কোনো ক্লিনিক্যাল মনোবৈজ্ঞানিক রিপোর্ট নয়। এটি একটি স্ব-পরিচালিত স্ক্রীনিং টুল। এই রিপোর্টের ওপর ভিত্তি করে কোনো ওষুধ সেবন বা চিকিৎসা সিদ্ধান্ত নেওয়া যাবে না। মানসিক স্বাস্থ্য সংক্রান্ত যেকোনো জটিলতার ক্ষেত্রে অবিলম্বে একজন লাইসেন্সপ্রাপ্ত ক্লিনিক্যাল সাইকিয়াট্রিস্ট বা মানসিক স্বাস্থ্য বিশেষজ্ঞের পরামর্শ নিন। এই রिपोर्ट শুধুমাত্র তথ্য ও আত্ম-সচেতনতার উদ্দেশ্যে তৈরি।",
      download: "রিপোর্ট ডাউনলোড করুন (PDF)"
    }
  }
};

// 2. Personality Questions (Mini-IPIP - 20 Questions)
const personalityQuestions = [
  { id: 1, trait: "Extraversion", en: "I am the life of the party.", bn: "আমি যেকোনো অনুষ্ঠানের বা আড্ডার প্রাণকেন্দ্র হয়ে থাকি।", reverse: false },
  { id: 2, trait: "Extraversion", en: "I don't talk a lot.", bn: "আমি খুব একটা বেশি কথা বলি না।", reverse: true },
  { id: 3, trait: "Extraversion", en: "I talk to many new people at parties.", bn: "বিভিন্ন পার্টি বা সামাজিক অনুষ্ঠানে আমি অনেক নতুন নতুন মানুষের সাথে কথা বলি।", reverse: false },
  { id: 4, trait: "Extraversion", en: "I prefer to keep myself in the background.", bn: "আমি যেকোনো জায়গায় নিজেকে একটু গুটিয়ে বা ব্যাকগ্রাউন্ডে রাখতে পছন্দ করি।", reverse: true },
  { id: 5, trait: "Agreeableness", en: "I easily understand others' feelings.", bn: "আমি অন্যের অনুভূতির বিষয়গুলো খুব সহজে বুঝতে পারি এবং সহানুভূতি জানাই।", reverse: false },
  { id: 6, trait: "Agreeableness", en: "I am not interested in other people's problems.", bn: "অন্য মানুষের ব্যক্তিগত সমস্যা বা জটিলতা নিয়ে আমার তেমন কোনো আগ্রহ নেই।", reverse: true },
  { id: 7, trait: "Agreeableness", en: "I feel others' emotions myself.", bn: "আমি চারপাশের মানুষের আবেগ বা কষ্ট নিজের ভেতর অনুভব করতে পারি।", reverse: false },
  { id: 8, trait: "Agreeableness", en: "I don't care much about others' needs.", bn: "অন্য মানুষদের নিয়ে বা তাদের সুবিধা-অসুবিধা নিয়ে আমি আসলেই খুব একটা মাথা ঘামাই না।", reverse: true },
  { id: 9, trait: "Conscientiousness", en: "I finish tasks immediately.", bn: "ঘরের বা অফিসের যেকোনো কাজ বা দায়িত্ব আমি ফেলে না রেখে সাথে সাথেই শেষ করি।", reverse: false },
  { id: 10, trait: "Conscientiousness", en: "I often forget to put things back in their place.", bn: "আমি প্রায়ই জিনিসপত্র নির্দিষ্ট জায়গায় গুছিয়ে রাখতে ভুলে যাই।", reverse: true },
  { id: 11, trait: "Conscientiousness", en: "I like to follow a disciplined routine.", bn: "আমি একটি সুশৃঙ্খল ও নিয়মতান্ত্রিক রুটিন মেনে চলতে পছন্দ করি।", reverse: false },
  { id: 12, trait: "Conscientiousness", en: "I often make a mess of things.", bn: "আমি প্রায় সময়ই সবকিছু এলোমেলো বা জগাখিচুড়ি পাকিয়ে ফেলি।", reverse: true },
  { id: 13, trait: "Neuroticism", en: "I have frequent mood swings.", bn: "আমার খুব ঘনঘন বা হুটহাট মুড সুইং (মেজাজের পরিবর্তন) হয়।", reverse: false },
  { id: 14, trait: "Neuroticism", en: "I am mostly relaxed.", bn: "আমি অধিকাংশ সময়ই বেশ রিল্যাক্সড বা শান্ত মেজাজে থাকি।", reverse: true },
  { id: 15, trait: "Neuroticism", en: "I get upset easily over small things.", bn: "আমি খুব ছোটখাটো বা সামান্য বিষয়েই সহজে আপসেট বা মন খারাপ করে ফেলি।", reverse: false },
  { id: 16, trait: "Neuroticism", en: "I rarely feel sad or down.", bn: "আমি খুব কম সময়ই বিষণ্ণ বা মনমরা অনুভব করি।", reverse: true },
  { id: 17, trait: "Openness", en: "I have a vivid imagination.", bn: "আমার কল্পনাশক্তি অত্যন্ত প্রখর এবং চমৎকার।", reverse: false },
  { id: 18, trait: "Openness", en: "I am not interested in abstract ideas.", bn: "জটিল, তাত্ত্বিক বা বিমূর্ত আইডিয়া নিয়ে আমার কোনো আগ্রহ নেই।", reverse: true },
  { id: 19, trait: "Openness", en: "I often come up with new and great ideas.", bn: "আমার মাথায় প্রায়ই নতুন এবং চমৎকার সব আইডিয়া আসে।", reverse: false },
  { id: 20, trait: "Openness", en: "I do not have a good imagination.", bn: "আমার খুব একটা ভালো বা সৃজনশীল কল্পনাশক্তি নেই।", reverse: true },
];

// 3. Mental Health Segments
const mentalHealthSegments = [
  {
    id: "depression",
    label: "Mood Disorder (Depression/Bipolar)",
    questions: [
      { en: { q: "Your biggest problem?", a: ["Constant sadness", "Palpitations, fear", "Weird thoughts", "Fear of people"] }, bn: { q: "সবচেয়ে বড় কষ্ট কী?", a: ["সব সময় মন খারাপ", "বুক ধড়ফড়, ভয়", "অদ্ভুত চিন্তা", "মানুষের ভয়"] }, scores: [3, 2, 3, 2] },
      { en: { q: "How long have symptoms lasted?", a: ["< 2 weeks", "2+ weeks", "6+ months", "Sudden attacks"] }, bn: { q: "লক্ষণ কতদিন ধরে?", a: ["২ সপ্তাহের কম", "২+ সপ্তাহ", "৬+ মাস", "হুট করে"] }, scores: [1, 3, 2, 3] },
      { en: { q: "Physical changes?", a: ["Palpitations", "Numb body", "Headache", "None"] }, bn: { q: "শারীরিক পরিবর্তন?", a: ["বুক ধড়ফড়", "শরীর নিস্তেজ", "মাথা ব্যথা", "কোনোটি না"] }, scores: [3, 3, 2, 2] },
      { en: { q: "Enjoy hobbies?", a: ["Same", "Less", "None", "Change often"] }, bn: { q: "পছন্দের কাজে আনন্দ?", a: ["আগের মতো", "কম", "একদম নেই", "বদলায়"] }, scores: [0, 2, 3, 2] },
      { en: { q: "Mood fluctuation?", a: ["Always sad", "High then low", "Within hours", "Situational"] }, bn: { q: "মেজাজের ওঠানামা?", a: ["সব সময় খারাপ", "উচ্চ তারপর নিম্ন", "ঘণ্টায়", "পরিস্থিতি অনুযায়ী"] }, scores: [3, 3, 2, 0] },
      { en: { q: "Future outlook?", a: ["Optimistic", "Worried", "Dark", "Can't think"] }, bn: { q: "ভবিষ্যৎ ভাবনা?", a: ["আশাবাদী", "চিন্তিত", "অন্ধকার", "ভাবতে পারি না"] }, scores: [0, 1, 3, 2] },
      { en: { q: "Sleep pattern?", a: ["Can't fall", "Wake middle", "Wake early", "Sleep all day"] }, bn: { q: "ঘুমের প্যাটার্ন?", a: ["ঘুম আসে না", "মাঝরাতে ভাঙে", "ভোরে ভাঙে", "সারাদিন ঘুম"] }, scores: [2, 2, 3, 2] },
      { en: { q: "Appetite change?", a: ["Lost", "More junk", "Guilt/vomit", "No change"] }, bn: { q: "খাওয়ার পরিবর্তন?", a: ["খিদে মরে", "জাঙ্ক ফুড বেশি", "অপরাধবোধ, বমি", "কোনো পরিবর্তন"] }, scores: [3, 2, 3, 0] },
      { en: { q: "Work/study affected?", a: ["Fine", "Poor focus", "Stopped", "Others annoyed"] }, bn: { q: "কাজে প্রভাব?", a: ["ঠিক আছে", "মনোযোগ কম", "বন্ধ করে দিয়েছি", "অন্যরা বিরক্ত"] }, scores: [0, 2, 3, 3] }
    ]
  },
  {
    id: "anxiety",
    label: "Anxiety Disorder (Panic/GAD)",
    questions: [
      { en: { q: "Control over worries?", a: ["Don't worry", "Distract easily", "Hard to stop", "Mind races"] }, bn: { q: "দুশ্চিন্তার নিয়ন্ত্রণ?", a: ["দুশ্চিন্তা নেই", "সহজে সরাই", "থামানো কঠিন", "মাথা খা খা"] }, scores: [0, 1, 2, 3] },
      { en: { q: "Physical symptoms?", a: ["Never", "Rarely", "Often", "Daily panic"] }, bn: { q: "শারীরিক লক্ষণ?", a: ["কখনো না", "কদাচিৎ", "প্রায়ই", "প্রতিদিন প্যানিক"] }, scores: [0, 1, 2, 3] },
      { en: { q: "Repeated thoughts?", a: ["With rituals", "Failure", "Disasters", "No"] }, bn: { q: "বারবার চিন্তা?", a: ["কাজ দিয়ে থামাই", "ব্যর্থতা", "বিপর্যয়", "না"] }, scores: [3, 2, 2, 0] },
      { en: { q: "Unreal feelings?", a: ["Outside body", "Dreamlike", "Both", "No"] }, bn: { q: "অবাস্তব লাগে?", a: ["শরীরের বাইরে", "স্বপ্নের মতো", "দুটোই", "না"] }, scores: [3, 3, 3, 0] },
      { en: { q: "Coping under stress?", a: ["Talk/write", "Isolate", "Substances", "Self-harm"] }, bn: { q: "চাপে কী করেন?", a: ["কথা বলি/লিখি", "গুটিয়ে নেই", "নেশা", "আত্ম-ক্ষতি"] }, scores: [0, 2, 3, 3] }
    ]
  },
  {
    id: "ocd",
    label: "OCD (Obsessive-Compulsive)",
    questions: [
      { en: { q: "Repeated thoughts with rituals?", a: ["Yes, rituals", "Failure", "Disasters", "No"] }, bn: { q: "চিন্তা ও রিচুয়াল?", a: ["হ্যাঁ, কাজ করি", "ব্যর্থতা", "বিপর্যয়", "না"] }, scores: [3, 2, 2, 0] },
      { en: { q: "Feel conspired against?", a: ["Yes, watched", "Media directed", "Mocked", "No"] }, bn: { q: "ষড়যন্ত্রের অনুভূতি?", a: ["হ্যাঁ, দেখা হচ্ছে", "মিডিয়া আমার জন্য", "হাসাহাসি", "না"] }, scores: [3, 3, 2, 0] },
      { en: { q: "Scenario: Touch dirty surface.", a: ["Wash normally", "Panic", "Wash repeatedly", "Ignore"] }, bn: { q: "পরিস্থিতি: নোংরা হাত.", a: ["সাধারণ ধুব", "প্যানিক", "বারবার ধুব", "উদাসীন"] }, scores: [0, 2, 3, 2] },
      { en: { q: "Scenario: Small task.", a: ["Repeatedly check", "Too tired", "Can't focus", "Finish normally"] }, bn: { q: "পরিস্থিতি: ছোট কাজ.", a: ["বারবার চেক", "ক্লান্ত", "ফোকাস নেই", "স্বাভাবিক শেষ"] }, scores: [3, 3, 2, 0] }
    ]
  },
  {
    id: "trauma",
    label: "Trauma & PTSD",
    questions: [
      { en: { q: "Unreal feelings?", a: ["Outside body", "Dreamlike", "Both", "No"] }, bn: { q: "অবাস্তব লাগে?", a: ["শরীরের বাইরে", "স্বপ্নের মতো", "দুটোই", "না"] }, scores: [3, 3, 3, 0] },
      { en: { q: "Scenario: Accident photo.", a: ["Sad then ok", "Flashbacks", "Fear it'll happen", "Numb"] }, bn: { q: "পরিস্থিতি: দুর্ঘটনার ছবি.", a: ["খারাপ লাগে", "ফ্ল্যাশব্যাক", "ভয় হয়", "অবশ"] }, scores: [0, 3, 2, 2] },
      { en: { q: "Scenario: Friend scolds.", a: ["Withdraw", "Scream/guilt", "Resolve", "They're enemy"] }, bn: { q: "পরিস্থিতি: বন্ধু রেগে.", a: ["গুটিয়ে নেই", "চিৎকার/অপরাধ", "সমাধান", "শত্রু"] }, scores: [2, 3, 0, 3] },
      { en: { q: "Scenario: Ignored by someone.", a: ["Busy, later", "I did wrong", "I'm worthless", "Plotting"] }, bn: { q: "পরিস্থিতি: কেউ উপেক্ষা.", a: ["ব্যস্ত, পরে", "আমি ভুল করেছি", "আমি মূল্যহীন", "ষড়যন্ত্র"] }, scores: [0, 2, 3, 3] }
    ]
  },
  {
    id: "psychosis",
    label: "Psychosis & Paranoia",
    questions: [
      { en: { q: "Hear voices or see things?", a: ["Yes, whispers", "Yes, shapes", "Echoing thoughts", "No"] }, bn: { q: "আওয়াজ বা দৃশ্য?", a: ["হ্যাঁ, ফিসফিস", "হ্যাঁ, আকৃতি", "চিন্তা প্রতিধ্বনি", "না"] }, scores: [3, 3, 2, 0] },
      { en: { q: "Feel conspired?", a: ["Yes, watched", "Media directed", "Mocked", "No"] }, bn: { q: "ষড়যন্ত্রের অনুভূতি?", a: ["হ্যাঁ, দেখা হচ্ছে", "মিডিয়া আমার জন্য", "হাসাহাসি", "না"] }, scores: [3, 3, 2, 0] },
      { en: { q: "Scenario: Presentation stress.", a: ["Leave", "Panic/faint", "Breathe and finish", "Plotting against me"] }, bn: { q: "পরিস্থিতি: প্রেজেন্টেশন.", a: ["চলে যাব", "প্যানিক", "শ্বাস নিয়ে শেষ", "ষড়যন্ত্র"] }, scores: [2, 3, 0, 3] }
    ]
  },
  {
    id: "daydreaming",
    label: "Maladaptive Daydreaming",
    questions: [
      { en: { q: "How often slip into fantasy?", a: ["Rarely", "Occasionally", "Often, hours", "Constantly"] }, bn: { q: "কতবার কল্পনায় হারান?", a: ["খুব কম", "মাঝে মাঝে", "প্রায়ই, ঘণ্টা", "সারাক্ষণ"] }, scores: [0, 1, 3, 3] }
    ]
  },
  {
    id: "bpd",
    label: "BPD & Eating Disorders",
    questions: [
      { en: { q: "Scenario: Friend scolds.", a: ["Withdraw", "Scream/guilt", "Resolve", "They're enemy"] }, bn: { q: "পরিস্থিতি: বন্ধু রেগে.", a: ["গুটিয়ে নেই", "চিৎকার/অপরাধ", "সমাধান", "শত্রু"] }, scores: [2, 3, 0, 3] },
      { en: { q: "Appetite change?", a: ["Lost", "More junk", "Guilt/vomit", "No change"] }, bn: { q: "খাওয়ার পরিবর্তন?", a: ["খিদে মরে", "জাঙ্ক ফুড বেশি", "অপরাধবোধ, বমি", "কোনো পরিবর্তন"] }, scores: [3, 2, 3, 0] }
    ]
  }
];

// 4. Exercises Data
const exercises = {
  "Mood Disorder (Depression/Bipolar)": {
    en: ["1. Behavioral Activation: Do small tasks even when unmotivated.", "2. Three Good Things: Write 3 positive events daily."],
    bn: ["১. বিহেভিয়ারাল অ্যাক্টিভেশন: ছোট কাজ করুন।", "২. থ্রি গুড থিংস: ৩টি ভালো ঘটনা লিখুন।"]
  },
  "Anxiety Disorder (Panic/GAD)": {
    en: ["1. 5-4-3-2-1 Grounding: 5 see, 4 touch, 3 hear, 2 smell, 1 taste.", "2. Box Breathing: Inhale 4s, hold 4s, exhale 4s, hold 4s."],
    bn: ["১. ৫-৪-৩-২-১ গ্রাউন্ডিং: ৫ দৃশ্য, ৪ স্পর্শ, ৩ শব্দ, ২ ঘ্রাণ, ১ স্বাদ।", "২. বক্স ব্রিদিং: ৪ সেকেন্ড শ্বাস, ৪ ধরে, ৪ ছাড়, ৪ খালি।"]
  },
  "OCD (Obsessive-Compulsive)": {
    en: ["1. ERP: Delay compulsion by 5 mins.", "2. Brain Lock: Say 'This is my OCD, not me.'"],
    bn: ["১. ইআরপি: কাজ ৫ মিনিট দেরি করুন।", "২. ব্রেইন লক: 'এটা আমার ওসিডি, আমি না।'"]
  },
  "Trauma & PTSD": {
    en: ["1. Butterfly Hug: Cross arms, alternate tapping.", "2. Change the Channel: Visualize a remote to change trauma scene."],
    bn: ["১. বাটারফ্লাই হাগ: বুকের ওপর হাত, ট্যাপ করুন।", "২. চ্যানেল চেঞ্জ: কাল্পনিক রিমোট দিয়ে দৃশ্য বদলান।"]
  },
  "Psychosis & Paranoia": {
    en: ["1. Reality Testing: Ask a trusted person.", "2. Earthing: Walk barefoot or hold ice."],
    bn: ["১. রিয়েলিটি চেকিং: বিশ্বস্ত কাউকে জিজ্ঞেস করুন।", "২. আর্থিং: খালি পায়ে হাঁটুন বা বরফ ধরুন।"]
  },
  "Maladaptive Daydreaming": {
    en: ["1. Stop-Sign: Say 'STOP' and change posture.", "2. Dream Timer: 20 mins/day for daydreaming."],
    bn: ["১. স্টপ সাইন: 'স্টপ' বলুন ও ভঙ্গি বদলান।", "২. ড্রিম টাইমার: দিনে ২০ মিনিট কল্পনা।"]
  },
  "BPD & Eating Disorders": {
    en: ["1. TIPP: Temperature, Exercise, Breathing, Relaxation.", "2. 24-Hour Rule: Wait 24h before reacting."],
    bn: ["১. টিআইপিপি: তাপমাত্রা, ব্যায়াম, শ্বাস, রিল্যাক্স।", "২. ২৪-ঘণ্টা নিয়ম: প্রতিক্রিয়ার আগে অপেক্ষা।"]
  }
};

// 5. Main Component
export default function MentalHealthAssessment() {
  const [lang, setLang] = useState('bn');
  const [step, setStep] = useState(0); 
  const [selectedMH, setSelectedMH] = useState(null);
  const [currentMHQ, setCurrentMHQ] = useState(0);
  const [mhScores, setMHScores] = useState({});
  const [personalityAnswers, setPersonalityAnswers] = useState({});
  const [currentPQ, setCurrentPQ] = useState(0);
  const [showEx, setShowEx] = useState(false);
  const reportRef = useRef();

  const T = langData[lang];

  const handleMHAnswer = (score, label) => {
    setMHScores(p => ({ ...p, [label]: (p[label] || 0) + score }));
    if (currentMHQ + 1 < selectedMH.questions.length) setCurrentMHQ(c => c + 1);
    else setStep(4);
  };

  const calcMH = () => {
    const score = mhScores[selectedMH.label] || 0;
    const max = selectedMH.questions.length * 3;
    if (score >= max * 0.7) return 'severe';
    if (score >= max * 0.4) return 'moderate';
    return 'healthy';
  };

  const mhSeverity = calcMH();

  const handlePAnswer = (qId, value) => {
    setPersonalityAnswers(p => ({ ...p, [qId]: value }));
    if (currentPQ + 1 < personalityQuestions.length) setCurrentPQ(c => c + 1);
    else setStep(5);
  };

  const calculatePersonality = () => {
    const traits = {
      Extraversion: { sum: 0, count: 0 },
      Agreeableness: { sum: 0, count: 0 },
      Conscientiousness: { sum: 0, count: 0 },
      Neuroticism: { sum: 0, count: 0 },
      Openness: { sum: 0, count: 0 }
    };

    personalityQuestions.forEach(q => {
      const answer = personalityAnswers[q.id];
      if (answer !== undefined) {
        let score = answer;
        if (q.reverse) score = 6 - score;
        traits[q.trait].sum += score;
        traits[q.trait].count += 1;
      }
    });

    const result = {};
    Object.keys(traits).forEach(trait => {
      result[trait] = traits[trait].count > 0 ? (traits[trait].sum / traits[trait].count) : 0;
    });
    return result;
  };

  const personalityResult = step >= 5 ? calculatePersonality() : {};

  const generateReport = () => {
    const date = new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const mhInterpretation = {
      severe: lang === 'bn' ? 'তীব্র মানসিক সংকট (জরুরি মনোযোগ প্রয়োজন)' : 'Severe Mental Distress (Urgent Attention Required)',
      moderate: lang === 'bn' ? 'মাঝারি মানসিক চাপ (নিয়মিত পর্যবেক্ষণ প্রয়োজন)' : 'Moderate Mental Stress (Regular Monitoring Recommended)',
      healthy: lang === 'bn' ? 'স্বাভাবিক মানসিক অবস্থা (সুস্থ ও সচল)' : 'Healthy Mental State (Resilient & Balanced)'
    };

    return {
      clientName: "Self-Administered",
      dob: "N/A",
      age: "N/A",
      assessmentType: selectedMH ? selectedMH.label : "Not Selected",
      mhResult: mhInterpretation[mhSeverity],
      personalityProfile: personalityResult,
      recommendation: mhSeverity === 'severe' ? 
        (lang === 'bn' ? 'অবিলম্বে একজন লাইসেন্সপ্রাপ্ত ক্লিনিক্যাল সাইকিয়াট্রিস্টের পরামর্শ নিন।' : 'Please consult a licensed Clinical Psychiatrist immediately.') :
        mhSeverity === 'moderate' ?
        (lang === 'bn' ? 'সেলফ-কেয়ার ও নিয়মিত পর্যবেক্ষণ করুন। প্রয়োজনে বিশেষজ্ঞের সাহায্য নিন।' : 'Practice self-care and monitor regularly. Seek professional help if needed.') :
        (lang === 'bn' ? 'আপনার মানসিক স্বাস্থ্য ভালো। সুস্থ থাকুন, নিয়মিত মাইন্ডফুলনেস প্র্যাকটিস করুন।' : 'Your mental health is good. Stay healthy and practice mindfulness regularly.'),
      generatedDate: date,
      disclaimer: langData[lang].report.disclaimer
    };
  };

  const downloadReport = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Psychological_Assessment_Report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const reset = () => {
    setStep(0);
    setSelectedMH(null);
    setCurrentMHQ(0);
    setMHScores({});
    setPersonalityAnswers({});
    setCurrentPQ(0);
    setShowEx(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans relative overflow-hidden selection:bg-emerald-400/30 selection:text-emerald-200">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0b1120]/60 border-b border-slate-800/60 px-8 py-5 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-300 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-[#0b1120]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-slate-100">{T.title}</h1>
        </div>
        <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="px-5 py-2 rounded-full border border-slate-700/50 hover:border-emerald-400/50 hover:bg-emerald-500/5 transition-all duration-300 text-sm font-light tracking-wider">{T.lang}</button>
      </header>

      <main className="flex items-center justify-center min-h-[75vh] p-6">
        <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/30 rounded-3xl p-10 shadow-2xl relative overflow-hidden transition-all duration-700">
          
          {step === 0 && (
            <div className="space-y-8 animate-fade-in-up text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-300 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                <svg className="w-10 h-10 text-[#0b1120]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-light text-slate-100 tracking-wide">{T.welcome.title}</h2>
                <p className="text-sm text-emerald-300/70 font-light tracking-wider">{T.welcome.subtitle}</p>
              </div>
              <div className="space-y-4 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-3 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 backdrop-blur-sm">
                  <span className="text-xl">🧠</span>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">{T.welcome.p1}</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 backdrop-blur-sm">
                  <span className="text-xl">⚡</span>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">{T.welcome.p2}</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 backdrop-blur-sm">
                  <span className="text-xl">🌱</span>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">{T.welcome.p3}</p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium hover:shadow-2xl hover:shadow-emerald-400/20 transition-all duration-300 transform hover:scale-105">{T.welcome.cta}</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-fade-in-up">
              <h2 className="text-3xl font-light text-slate-200 tracking-wider text-center">{T.select}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentalHealthSegments.map(s => (
                  <button key={s.id} onClick={() => { setSelectedMH(s); setStep(2); }}
                    className="group p-6 rounded-2xl border border-slate-700/40 bg-slate-800/20 hover:border-emerald-400/30 hover:bg-emerald-500/5 transition-all duration-300 text-left backdrop-blur-sm">
                    <h3 className="font-medium text-slate-200 group-hover:text-emerald-200">{s.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{s.questions.length} questions</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center font-light">{T.disclaimer}</p>
            </div>
          )}

          {step === 2 && selectedMH && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between text-xs text-slate-500 tracking-widest">
                <span className="text-emerald-300/80">{selectedMH.label}</span>
                <span>{currentMHQ + 1} / {selectedMH.questions.length}</span>
              </div>
              <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${((currentMHQ + 1) / selectedMH.questions.length) * 100}%` }}></div>
              </div>
              <h2 className="text-2xl font-light text-slate-100 leading-relaxed">{selectedMH.questions[currentMHQ][lang].q}</h2>
              <div className="flex flex-col gap-3 pt-2">
                {selectedMH.questions[currentMHQ][lang].a.map((opt, i) => (
                  <button key={i} onClick={() => handleMHAnswer(selectedMH.questions[currentMHQ].scores[i], selectedMH.label)}
                    className="group w-full text-left p-5 rounded-2xl border border-slate-700/40 bg-slate-800/20 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-all duration-300 flex justify-between items-center backdrop-blur-sm">
                    <span className="text-slate-300 group-hover:text-emerald-200">{opt}</span>
                    <span className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-emerald-400 flex items-center justify-center transition-colors">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100"></span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && selectedMH && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30 backdrop-blur-sm space-y-3">
                <p className="text-lg font-light text-slate-200 leading-relaxed italic border-l-3 border-emerald-400/50 pl-4">{langData[lang][mhSeverity]}</p>
                {mhSeverity === 'severe' && <span className="inline-block text-xs text-emerald-300/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">🏥 Clinical consultation recommended</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-slate-500">{T.detected}</span>
                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-400/20 rounded-full text-sm text-emerald-300/90">{selectedMH.label}</span>
              </div>

              {mhSeverity !== 'healthy' && !showEx && (
                <div className="p-5 bg-slate-800/20 rounded-2xl border border-slate-700/30 space-y-4 animate-fade-in-up">
                  <p className="text-slate-200 font-light">{T.askExercise}</p>
                  <div className="flex gap-4">
                    <button onClick={() => { setShowEx(true); setStep(6); }} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium hover:shadow-lg hover:shadow-emerald-400/20 transition-all duration-300">{T.yes}</button>
                    <button onClick={reset} className="px-6 py-2.5 rounded-full border border-slate-600/50 hover:border-slate-400 transition-all duration-300 text-slate-300">{T.no}</button>
                  </div>
                </div>
              )}
              {mhSeverity === 'healthy' && <button onClick={() => setStep(4)} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium hover:shadow-lg hover:shadow-emerald-400/20 transition-all duration-300">{lang === 'bn' ? 'পার্সোনালিটি টেস্ট দিন' : 'Take Personality Test'}</button>}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between text-xs text-slate-500 tracking-widest">
                <span className="text-emerald-300/80">{T.personality.title}</span>
                <span>{currentPQ + 1} / {personalityQuestions.length}</span>
              </div>
              <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${((currentPQ + 1) / personalityQuestions.length) * 100}%` }}></div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-light">{T.personality.desc}</p>
                <h2 className="text-2xl font-light text-slate-100 leading-relaxed">{personalityQuestions[currentPQ][lang]}</h2>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button key={num} onClick={() => handlePAnswer(personalityQuestions[currentPQ].id, num)}
                    className="group w-full text-left p-3 rounded-xl border border-slate-700/40 bg-slate-800/20 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-all duration-300 flex justify-between items-center backdrop-blur-sm">
                    <span className="text-slate-300 group-hover:text-emerald-200">
                      {num} — {num === 1 ? (lang === 'bn' ? 'একদম একমত নই' : 'Strongly Disagree') : 
                       num === 2 ? (lang === 'bn' ? 'দ্বিমত' : 'Disagree') : 
                       num === 3 ? (lang === 'bn' ? 'নিশ্চিত নই' : 'Neutral') : 
                       num === 4 ? (lang === 'bn' ? 'একমত' : 'Agree') : 
                       (lang === 'bn' ? 'সম্পূর্ণ একমত' : 'Strongly Agree')}
                    </span>
                    <span className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-emerald-400 flex items-center justify-center transition-colors">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100"></span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-fade-in-up">
              <h3 className="text-2xl font-light text-slate-200">{T.personality.result}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(personalityResult).map(([trait, score]) => (
                  <div key={trait} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 backdrop-blur-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-200">{T.personality.traits[trait]}</span>
                      <span className="text-sm text-emerald-300">{(score as number).toFixed(1)} / 5</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${((score as number) / 5) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 font-light">
                      {score >= 4 ? (lang === 'bn' ? 'অত্যন্ত উচ্চ' : 'Very High') :
                       score >= 3.5 ? (lang === 'bn' ? 'উচ্চ' : 'High') :
                       score >= 2.5 ? (lang === 'bn' ? 'মাঝারি' : 'Moderate') :
                       score >= 1.5 ? (lang === 'bn' ? 'কম' : 'Low') :
                       (lang === 'bn' ? 'অত্যন্ত কম' : 'Very Low')}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(7)} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium hover:shadow-lg hover:shadow-emerald-400/20 transition-all duration-300">{lang === 'bn' ? 'সম্পূর্ণ রিপোর্ট দেখুন' : 'View Full Report'}</button>
            </div>
          )}

          {step === 6 && selectedMH && showEx && (
            <div className="space-y-8 animate-fade-in-up">
              <h4 className="text-xl font-light text-teal-200 border-b border-slate-700/50 pb-3">{T.exercise}</h4>
              <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30 space-y-4 backdrop-blur-sm">
                <span className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider block">{selectedMH.label}</span>
                <ul className="list-disc pl-5 space-y-3 text-base font-light text-slate-300 leading-relaxed">
                  {exercises[selectedMH.label]?.[lang]?.map((item, i) => <li key={i} className="hover:text-emerald-200 transition-colors">{item}</li>)}
                </ul>
              </div>
              <button onClick={() => setStep(4)} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium hover:shadow-lg hover:shadow-emerald-400/20 transition-all duration-300">{lang === 'bn' ? 'পার্সোনালিটি টেস্ট দিন' : 'Take Personality Test'}</button>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-8 animate-fade-in-up">
              <div ref={reportRef} className="bg-white text-slate-900 p-10 rounded-xl shadow-2xl max-w-4xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                <div className="text-center border-b-4 border-emerald-600 pb-6 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{T.report.title}</h1>
                  <p className="text-sm text-slate-500 mt-2">{T.report.generated}: {generateReport().generatedDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div><span className="font-bold text-slate-700">{T.report.client}:</span> {generateReport().clientName}</div>
                  <div><span className="font-bold text-slate-700">{T.report.dob}:</span> {generateReport().dob}</div>
                  <div><span className="font-bold text-slate-700">{T.report.age}:</span> {generateReport().age}</div>
                  <div><span className="font-bold text-slate-700">{T.report.assessmentType}:</span> {generateReport().assessmentType}</div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">{T.report.mhResult}</h2>
                  <div className={`p-4 rounded-lg ${mhSeverity === 'severe' ? 'bg-red-100 border border-red-300' : mhSeverity === 'moderate' ? 'bg-amber-100 border border-amber-300' : 'bg-emerald-100 border border-emerald-300'}`}>
                    <p className="text-lg">{generateReport().mhResult}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">{T.report.personalityResult}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(personalityResult).map(([trait, score]) => (
                      <div key={trait} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm text-slate-700">{T.personality.traits[trait]}</span>
                          <span className="text-sm text-slate-500">{(score as number).toFixed(1)} / 5</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${((score as number) / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">{T.report.recommendation}</h2>
                  <p className="text-lg leading-relaxed">{generateReport().recommendation}</p>
                </div>

                <div className="mt-8 p-4 border-2 border-red-400 rounded-lg bg-red-50">
                  <h3 className="font-bold text-red-700 text-sm mb-2">⚠️ {lang === 'bn' ? 'সতর্কীকরণ' : 'Disclaimer'}</h3>
                  <p className="text-xs text-red-600 leading-relaxed">
                    {generateReport().disclaimer}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={downloadReport} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium hover:shadow-2xl hover:shadow-emerald-400/20 transition-all duration-300">
                  {T.report.download}
                </button>
                <button onClick={reset} className="w-full py-3 rounded-full border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-300 text-slate-300 font-light">
                  {T.restart}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}