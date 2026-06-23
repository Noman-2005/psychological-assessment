'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ==========================================
// 1. LANGUAGE DATA (USER FACING ONLY)
// ==========================================
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
      disorderAnalysis: "Identified Patterns (Based on your responses)",
      disclaimer: "DISCLAIMER: This is NOT a clinical psychological report. It is a self-administered screening tool. Do NOT use this report to self-medicate or make medical decisions. In case of any mental health difficulties, please consult a licensed Clinical Psychiatrist or mental health professional immediately. This report is for informational and self-awareness purposes only.",
      download: "Download Report (PDF)"
    }
  },
  bn: {
    title: "মেন্টাল হেলথ ও পার্সোনালিটি অ্যাসেসমেন্ট",
    start: "অ্যাসেসম্পেন্ট শুরু করুন",
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
        Neuroticism: "মানсима অস্থিরতা ও আবেগপ্রবণতা",
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
      disorderAnalysis: "শনাক্ত প্যাটার্নসমূহ (আপনার উত্তরের ওপর ভিত্তি করে)",
      disclaimer: "সতর্কীকরণ: এটি কোনো ক্লিনিক্যাল মনোবৈজ্ঞানিক রিপোর্ট নয়। এটি একটি স্ব-পরিচালিত স্ক্রীনিং টুল। এই রিপোর্টের ওপর ভিত্তি করে কোনো ওষুধ সেবন বা চিকিৎসা সিদ্ধান্ত নেওয়া যাবে না। মানসিক স্বাস্থ্য সংক্রান্ত যেকোনো জটিলতার ক্ষেত্রে অবিলম্বে একজন লাইসেন্সপ্রাপ্ত ক্লিনিক্যাল সাইকিয়াট্রিস্ট বা মানসিক স্বাস্থ্য বিশেষজ্ঞের পরামর্শ নিন। এই রিপোর্ট শুধুমাত্র তথ্য ও আত্ম-সচেতনতার উদ্দেশ্যে তৈরি।",
      download: "রিপোর্ট ডাউনলোড করুন (PDF)"
    }
  }
};

// ==========================================
// 2. 25 QUESTIONS WITH SECURE INDICATIONS
// ==========================================
const mhQuestions = [
  {
    id: 1,
    en: {
      q: "What is your biggest problem that brought you here?",
      options: [
        { text: "Constant sadness, no pleasure", indication: ["Depression"] },
        { text: "Palpitations, fear of something bad", indication: ["Anxiety", "Panic"] },
        { text: "Weird thoughts, repeated washing/counting", indication: ["OCD"] },
        { text: "Fear of people, prefer staying alone", indication: ["Social Anxiety", "Withdrawal"] }
      ]
    },
    bn: {
      q: "আপনার এখন সবচেয়ে বড় কষ্ট বা সমস্যাটা কী, যেটা নিয়ে আপনি আমার কাছে এসেছেন?",
      options: [
        { text: "সব সময় মন খারাপ, কোনো কিছুতেই আনন্দ পাই না", indication: ["Depression"] },
        { text: "সারাক্ষণ বুক ধড়ফড় করে, মনে হয় খারাপ কিছু ঘটবে", indication: ["Anxiety", "Panic"] },
        { text: "মাথায় অদ্ভুত চিন্তা, বারবার হাত ধোয়া বা গোনা", indication: ["OCD"] },
        { text: "মানুষের সাথে মিশতে ভয় লাগে, একা থাকতে ভালো লাগে", indication: ["Social Anxiety", "Withdrawal"] }
      ]
    },
    scores: [3, 3, 3, 2]
  },
  {
    id: 2,
    en: {
      q: "How long have these symptoms been present?",
      options: [
        { text: "Less than 2 weeks", indication: ["Acute Stress", "Adjustment"] },
        { text: "2 weeks or more", indication: ["Depression"] },
        { text: "More than 6 months", indication: ["Chronic Anxiety", "GAD"] },
        { text: "Comes in sudden attacks for 10-20 mins", indication: ["Panic"] }
      ]
    },
    bn: {
      q: "এই লক্ষণগুলো সাধারণত কতদিন ধরে তীব্রভাবে স্থায়ী হচ্ছে?",
      options: [
        { text: "২ সপ্তাহের কম", indication: ["Acute Stress", "Adjustment"] },
        { text: "টানা ২ সপ্তাহ বা তার বেশি", indication: ["Depression"] },
        { text: "৬ মাসের বেশি", indication: ["Chronic Anxiety", "GAD"] },
        { text: "হুট করে ১০-২০ মিনিটের জন্য আসে", indication: ["Panic"] }
      ]
    },
    scores: [1, 3, 2, 3]
  },
  {
    id: 3,
    en: {
      q: "What physical changes do you feel during discomfort?",
      options: [
        { text: "Palpitations, shortness of breath, shaking", indication: ["Panic", "Anxiety"] },
        { text: "Body feels numb, no energy", indication: ["Depression"] },
        { text: "Headache, neck pain, muscle tension", indication: ["Somatic Tension"] },
        { text: "No physical symptoms, only mental storm", indication: ["Pure Obsession", "Cognitive"] }
      ]
    },
    bn: {
      q: "আপনার এই অস্বস্তির সময় শরীরে কীরকম পরিবর্তন টের পান?",
      options: [
        { text: "বুক ধড়ফড় করে, শ্বাস ছোট হয়ে আসে, হাত-পা কাঁপে", indication: ["Panic", "Anxiety"] },
        { text: "শরীর নিস্তেজ, বিছানা থেকে ওঠার শক্তি নেই", indication: ["Depression"] },
        { text: "মাথা ও ঘাড়ের পেছনে ব্যথা, পেশি শক্ত", indication: ["Somatic Tension"] },
        { text: "শারীরিক লক্ষণ নেই, শুধু মাথায় চিন্তার ঝড়", indication: ["Pure Obsession", "Cognitive"] }
      ]
    },
    scores: [3, 3, 2, 2]
  },
  {
    id: 4,
    en: {
      q: "Do you have repeated thoughts you cannot get out of your head?",
      options: [
        { text: "Yes, and I must do a ritual to stop it", indication: ["OCD"] },
        { text: "Yes, constantly about failure or self-harm", indication: ["Depressive Rumination", "Depression"] },
        { text: "Yes, always worrying about future disasters", indication: ["Catastrophizing", "Anxiety"] },
        { text: "No, I have normal control over thoughts", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "এমন কোনো চিন্তা কি আপনার মনে বারবার আসে, যা আপনি মাথা থেকে বের করতে পারেন না?",
      options: [
        { text: "হ্যাঁ, এবং সেই চিন্তা দূর করতে বারবার কাজ করি", indication: ["OCD"] },
        { text: "হ্যাঁ, শুধু নিজের ক্ষতি বা ব্যর্থতার কথা ভাবি", indication: ["Depressive Rumination", "Depression"] },
        { text: "হ্যাঁ, ভবিষ্যতে খারাপ কী হবে তা নিয়ে দুশ্চিন্তা", indication: ["Catastrophizing", "Anxiety"] },
        { text: "না, আমি চিন্তা নিয়ন্ত্রণ করতে পারি", indication: ["Normal"] }
      ]
    },
    scores: [3, 2, 2, 0]
  },
  {
    id: 5,
    en: {
      q: "Do you ever feel like the world around you is unreal or dead?",
      options: [
        { text: "Yes, I feel outside my body", indication: ["Depersonalization", "Dissociative"] },
        { text: "Yes, surroundings seem dreamlike", indication: ["Derealization", "Dissociative"] },
        { text: "Both, especially under stress", indication: ["Dissociative", "Trauma"] },
        { text: "No, I am fully connected to reality", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "আপনার কি কখনো মনে হয় যে চারপাশের পৃথিবী বা নিজের শরীরটা অবাস্তব বা নিস্প্রাণ?",
      options: [
        { text: "হ্যাঁ, নিজেকে শরীরের বাইরে মনে হয়", indication: ["Depersonalization", "Dissociative"] },
        { text: "হ্যাঁ, পরিচিত পরিবেশ অচেনা ও স্বপ্নের মতো লাগে", indication: ["Derealization", "Dissociative"] },
        { text: "দুটোই, বিশেষ করে চাপের সময়", indication: ["Dissociative", "Trauma"] },
        { text: "না, আমি সবসময় বাস্তবতার সাথে যুক্ত", indication: ["Normal"] }
      ]
    },
    scores: [3, 3, 3, 0]
  },
  {
    id: 6,
    en: {
      q: "Do you hear voices or see things others cannot?",
      options: [
        { text: "Yes, someone whispers or commands me", indication: ["Auditory Hallucination", "Psychosis"] },
        { text: "Yes, I see strange shapes that disappear", indication: ["Visual Hallucination", "Psychosis"] },
        { text: "I don't hear but my thoughts echo loudly", indication: ["Thought Broadcasting", "Severe Anxiety"] },
        { text: "No, I don't experience such things", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "আপনি কি এমন কোনো আওয়াজ শুনতে পান বা কিছু দেখতে পান, যা অন্য কেউ পায় না?",
      options: [
        { text: "হ্যাঁ, কেউ ফিসফিস করে কথা বলে বা আদেশ দেয়", indication: ["Auditory Hallucination", "Psychosis"] },
        { text: "হ্যাঁ, অদ্ভুত আকৃতি বা মানুষ দেখি যা মিলিয়ে যায়", indication: ["Visual Hallucination", "Psychosis"] },
        { text: "শুনি না, তবে নিজের চিন্তার আওয়াজ প্রতিধ্বনিত হয়", indication: ["Thought Broadcasting", "Severe Anxiety"] },
        { text: "না, আমি অবাস্তব কিছু শুনি না বা দেখি না", indication: ["Normal"] }
      ]
    },
    scores: [3, 3, 2, 0]
  },
  {
    id: 7,
    en: {
      q: "Do you feel people are conspiring to harm you?",
      options: [
        { text: "Yes, I believe people are watching me", indication: ["Persecutory Delusion", "Paranoia"] },
        { text: "Yes, TV or social media posts are directed at me", indication: ["Delusion of Reference", "Paranoia"] },
        { text: "People aren't harming, but I feel they mock me", indication: ["Social Anxiety", "Low Self-esteem"] },
        { text: "No, I have no such beliefs", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "আপনার কি মনে হয় যে মানুষ বা অদৃশ্য শক্তি আপনার ক্ষতি করার জন্য ষড়যন্ত্র করছে?",
      options: [
        { text: "হ্যাঁ, মানুষ আমার ক্ষতি করতে নজর রাখছে", indication: ["Persecutory Delusion", "Paranoia"] },
        { text: "হ্যাঁ, টিভি বা সোশ্যাল মিডিয়া আমাকে উদ্দেশ্য করে", indication: ["Delusion of Reference", "Paranoia"] },
        { text: "ক্ষতি না, তবে সবাই আমাকে নিয়ে হাসাহাসি করে", indication: ["Social Anxiety", "Low Self-esteem"] },
        { text: "না, এমন ধারণা বা ভয় নেই", indication: ["Normal"] }
      ]
    },
    scores: [3, 3, 2, 0]
  },
  {
    id: 8,
    en: {
      q: "Do you enjoy hobbies or activities you used to love?",
      options: [
        { text: "Same pleasure as before", indication: ["Normal"] },
        { text: "Much less pleasure", indication: ["Mild Depression"] },
        { text: "No pleasure at all, feel empty", indication: ["Severe Anhedonia", "Depression"] },
        { text: "Change hobbies frequently", indication: ["Impulsivity", "Mood Fluctuation"] }
      ]
    },
    bn: {
      q: "যে কাজগুলো করতে আপনি আগে খুব পছন্দ করতেন, সেগুলো থেকে এখন কেমন আনন্দ পান?",
      options: [
        { text: "আগের মতোই আনন্দ পাই", indication: ["Normal"] },
        { text: "অনেক কম আনন্দ পাই", indication: ["Mild Depression"] },
        { text: "একদমই কোনো আনন্দ পাই না, শূন্য লাগে", indication: ["Severe Anhedonia", "Depression"] },
        { text: "পছন্দের কাজ ঘনঘন পরিবর্তন হয়", indication: ["Impulsivity", "Mood Fluctuation"] }
      ]
    },
    scores: [0, 2, 3, 2]
  },
  {
    id: 9,
    en: {
      q: "How does your mood fluctuate?",
      options: [
        { text: "Always sad or irritable", indication: ["Unipolar Depression"] },
        { text: "Days of high energy then deep depression", indication: ["Bipolar Disorder"] },
        { text: "Changes within hours", indication: ["Emotional Lability", "Borderline Traits"] },
        { text: "Changes according to situation", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "আপনার মুড বা মেজাজের ওঠানামা কেমন হয়?",
      options: [
        { text: "সব সময় মন খারাপ বা খিটখীটে", indication: ["Unipolar Depression"] },
        { text: "কয়েকদিন হাই এনার্জি, তারপর ডিপ্রেশন", indication: ["Bipolar Disorder"] },
        { text: "কয়েক ঘণ্টার ব্যবধানে বদলে যায়", indication: ["Emotional Lability", "Borderline Traits"] },
        { text: "পরিস্থিতি অনুযায়ী বদলায়", indication: ["Normal"] }
      ]
    },
    scores: [3, 3, 2, 0]
  },
  {
    id: 10,
    en: {
      q: "How do you view your future?",
      options: [
        { text: "Optimistic, I have plans", indication: ["Normal"] },
        { text: "A bit worried, but hopeful", indication: ["Mild Anxiety"] },
        { text: "Only darkness, no chance of recovery", indication: ["Hopelessness", "Severe Depression"] },
        { text: "Can't think about future", indication: ["Cognitive Overload", "Burnout"] }
      ]
    },
    bn: {
      q: "নিজের ভবিষ্যৎ নিয়ে আপনার ভাবনা কী?",
      options: [
        { text: "আশাবাদী, পরিকল্পনা আছে", indication: ["Normal"] },
        { text: "একটু চিন্তিত, তবে ঠিক হবে", indication: ["Mild Anxiety"] },
        { text: "সামনে অন্ধকার, ভালো হওয়ার সুযোগ নেই", indication: ["Hopelessness", "Severe Depression"] },
        { text: "ভবিষ্যৎ নিয়ে ভাবতেই পারি না", indication: ["Cognitive Overload", "Burnout"] }
      ]
    },
    scores: [0, 1, 3, 2]
  },
  {
    id: 11,
    en: {
      q: "What is your current sleep pattern like?",
      options: [
        { text: "Can't fall asleep for hours", indication: ["Initial Insomnia", "Anxiety"] },
        { text: "Wake up in the middle of night", indication: ["Middle Insomnia", "Stress"] },
        { text: "Wake up too early and can't go back", indication: ["Terminal Insomnia", "Severe Depression"] },
        { text: "Want to sleep all day", indication: ["Hypersomnia", "Atypical Depression"] }
      ]
    },
    bn: {
      q: "আপনার বর্তমান ঘুমের প্যাটার্নটি কেমন?",
      options: [
        { text: "ঘণ্টার পর ঘণ্টা ঘুম আসে না", indication: ["Initial Insomnia", "Anxiety"] },
        { text: "মাঝরাতে ঘুম ভেঙে যায়", indication: ["Middle Insomnia", "Stress"] },
        { text: "স্বাভাবিকের চেয়ে ২-৩ ঘণ্টা আগে ঘুম ভেঙে যায়", indication: ["Terminal Insomnia", "Severe Depression"] },
        { text: "সারাদিন ঘুমাতে ইচ্ছা করে", indication: ["Hypersomnia", "Atypical Depression"] }
      ]
    },
    scores: [2, 2, 3, 2]
  },
  {
    id: 12,
    en: {
      q: "Has your appetite changed?",
      options: [
        { text: "Lost appetite, losing weight", indication: ["Typical Depression", "Melancholia"] },
        { text: "Eating more junk food", indication: ["Emotional Eating", "Atypical Depression"] },
        { text: "Guilt after eating, want to vomit", indication: ["Bulimia", "Eating Disorder"] },
        { text: "No significant change", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "আপনার খাওয়ার চাহিদা বা অ্যাপেটাইটে কোনো পরিবর্তন এসেছে?",
      options: [
        { text: "খিদে মরে গেছে, ওজন কমছে", indication: ["Typical Depression", "Melancholia"] },
        { text: "স্ট্রেসে বেশি জাঙ্ক ফুড খাচ্ছি", indication: ["Emotional Eating", "Atypical Depression"] },
        { text: "খাওয়ার পর অপরাধবোধ হয়, বমি করতে ইচ্ছা করে", indication: ["Bulimia", "Eating Disorder"] },
        { text: "কোনো উল্লেখযোগ্য পরিবর্তন নেই", indication: ["Normal"] }
      ]
    },
    scores: [3, 2, 3, 0]
  },
  {
    id: 13,
    en: {
      q: "How much has this affected your work/studies?",
      options: [
        { text: "Not much, doing fine", indication: ["Normal", "High Functioning"] },
        { text: "Concentration is poor", indication: ["Moderate Impairment"] },
        { text: "Stopped going to work/class", indication: ["Severe Impairment", "Depression"] },
        { text: "I have no problem, but others are annoyed", indication: ["Mania", "Lack of Insight"] }
      ]
    },
    bn: {
      q: "এই মানসিক অবস্থার কারণে আপনার পড়াশোনা, চাকরি বা সামাজিক জীবন কতটুকু ব্যাহত হচ্ছে?",
      options: [
        { text: "খুব একটা সমস্যা হচ্ছে না", indication: ["Normal", "High Functioning"] },
        { text: "কাজে মনোযোগ দিতে পারছি না", indication: ["Moderate Impairment"] },
        { text: "অফিস/ক্লাসে যাওয়া বন্ধ করে দিয়েছি", indication: ["Severe Impairment", "Depression"] },
        { text: "আমার কোনো সমস্যা নেই, অন্যরা বিরক্ত", indication: ["Mania", "Lack of Insight"] }
      ]
    },
    scores: [0, 2, 3, 3]
  },
  {
    id: 14,
    en: {
      q: "What do you do when extremely stressed?",
      options: [
        { text: "Talk to family, write diary", indication: ["Healthy Coping"] },
        { text: "Isolate myself", indication: ["Avoidant", "Withdrawn"] },
        { text: "Smoke, drink, or use drugs", indication: ["Substance Use Risk", "Maladaptive Coping"] },
        { text: "Cut myself or hurt myself", indication: ["NSSI", "Borderline Traits", "Self-harm"] }
      ]
    },
    bn: {
      q: "যখন চরম মানসিক চাপে বা কষ্টে থাকেন, তখন নিজেকে শান্ত করতে কী করেন?",
      options: [
        { text: "পরিবারের সাথে কথা বলি, ডায়েরি লিখি", indication: ["Healthy Coping"] },
        { text: "নিজেকে ঘরবন্দি করে ফেলি", indication: ["Avoidant", "Withdrawn"] },
        { text: "ধূমপান, অ্যালকোহল বা ড্রাগস নিই", indication: ["Substance Use Risk", "Maladaptive Coping"] },
        { text: "হাত কাটি বা শরীরে আঘাত করি", indication: ["NSSI", "Borderline Traits", "Self-harm"] }
      ]
    },
    scores: [0, 2, 3, 3]
  },
  {
    id: 15,
    en: {
      q: "When feeling very low, what thoughts come to your mind about life?",
      options: [
        { text: "Wish I didn't wake up", indication: ["Passive Suicidal Ideation"] },
        { text: "Plan how to end my life", indication: ["Active Suicidal Ideation", "Emergency"] },
        { text: "Don't want to die, but want relief", indication: ["Psychache", "Ambivalence"] },
        { text: "Life is valuable, no such thoughts", indication: ["Normal"] }
      ]
    },
    bn: {
      q: "মন যখন খুব খারাপ থাকে, তখন জীবন নিয়ে কীরকম চিন্তা মাথায় আসে?",
      options: [
        { text: "মরে গেলে ভালো হতো, ঘুম থেকে না উঠলে", indication: ["Passive Suicidal Ideation"] },
        { text: "কীভাবে জীবন শেষ করা যায় তা নিয়ে পরিকল্পনা করি", indication: ["Active Suicidal Ideation", "Emergency"] },
        { text: "মরতে চাই না, তবে যন্ত্রণা থেকে মুক্তি চাই", indication: ["Psychache", "Ambivalence"] },
        { text: "জীবন মূল্যবান, মরে যাওয়ার চিন্তা আসে না", indication: ["Normal"] }
      ]
    },
    scores: [3, 3, 2, 0]
  },
  {
    id: 16,
    en: {
      q: "What do you think is the real cause of your current distress?",
      options: [
        { text: "I know it's my mental health issue", indication: ["Good Insight"] },
        { text: "It's because of others' behaviour", indication: ["External Blame"] },
        { text: "It's my fate, nothing can be done", indication: ["Fatalistic"] },
        { text: "I have no idea", indication: ["Poor Insight"] }
      ]
    },
    bn: {
      q: "আপনার এই মানসিক কষ্ট বা পরিবর্তনগুলোর পেছনে আসল কারণ কী বলে আপনার মনে হয়?",
      options: [
        { text: "আমি জানি এটি আমার মানসিক সমস্যা", indication: ["Good Insight"] },
        { text: "অন্যদের আচরণের কারণে", indication: ["External Blame"] },
        { text: "এটি আমার ভাগ্য, কিছু করার নেই", indication: ["Fatalistic"] },
        { text: "আমার কোনো ধারণা নেই", indication: ["Poor Insight"] }
      ]
    },
    scores: [0, 2, 2, 3]
  },
  {
    id: 17,
    en: {
      q: "Scenario: You are giving a presentation and feel everyone is staring at you. What do you do?",
      options: [
        { text: "Excuse myself and leave", indication: ["Avoidance", "Social Anxiety"] },
        { text: "Panic, think I'll faint", indication: ["Panic Disorder"] },
        { text: "Deep breathe and finish", indication: ["Healthy Coping"] },
        { text: "Think they are plotting against me", indication: ["Paranoia", "Psychosis"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: আপনি প্রেজেন্টেশন দিচ্ছেন, মনে হচ্ছে সবাই আপনার দিকে তাকাচ্ছে। আপনি কী করবেন?",
      options: [
        { text: "শরীর খারাপ বলে চলে যাব", indication: ["Avoidance", "Social Anxiety"] },
        { text: "প্যানিকড, মনে হবে অজ্ঞান হয়ে যাব", indication: ["Panic Disorder"] },
        { text: "গভীর শ্বাস নিয়ে শেষ করব", indication: ["Healthy Coping"] },
        { text: "মনে হবে তারা ষড়যন্ত্র করছে", indication: ["Paranoia", "Psychosis"] }
      ]
    },
    scores: [2, 3, 0, 3]
  },
  {
    id: 18,
    en: {
      q: "Scenario: You touch a dirty surface while shopping. What do you do?",
      options: [
        { text: "Wash normally later", indication: ["Normal", "Healthy"] },
        { text: "Panic and rush to washroom", indication: ["Anxiety", "Hypochondriasis"] },
        { text: "Wash repeatedly for 5-10 mins", indication: ["OCD"] },
        { text: "Don't care due to depression", indication: ["Depressive Apathy", "Depression"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: শপিং মলে হাত নোংরা জায়গায় লাগলো। আপনি কী করবেন?",
      options: [
        { text: "সাধারণ নিয়মে হাত ধুয়ে নেব", indication: ["Normal", "Healthy"] },
        { text: "প্যানিকড হয়ে ওয়াশরুম খুঁজব", indication: ["Anxiety", "Hypochondriasis"] },
        { text: "৫-১০ মিনিট বারবার ধুতে থাকব", indication: ["OCD"] },
        { text: "খেয়াল করব না, ডিপ্রেশনে উদাসীন", indication: ["Depressive Apathy", "Depression"] }
      ]
    },
    scores: [0, 2, 3, 2]
  },
  {
    id: 19,
    en: {
      q: "Scenario: You see a road accident photo on social media. What happens?",
      options: [
        { text: "Feel sad, then move on", indication: ["Normal"] },
        { text: "Flashbacks and heart racing", indication: ["PTSD", "Trauma"] },
        { text: "Fear it will happen to me", indication: ["Anxiety", "Agoraphobia"] },
        { text: "Completely numb, no emotion", indication: ["Dissociative", "Trauma"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: সোশ্যাল মিডিয়ায় সড়ক দুর্ঘটনার ছবি দেখলেন। আপনার কী হয়?",
      options: [
        { text: "খারাপ লাগে, তারপর ঠিক", indication: ["Normal"] },
        { text: "ফ্ল্যাশব্যাক, বুক ধড়ফড়", indication: ["PTSD", "Trauma"] },
        { text: "ভয় হয় আমারও হবে", indication: ["Anxiety", "Agoraphobia"] },
        { text: "পুরো অবশ, কোনো আবেগ নেই", indication: ["Dissociative", "Trauma"] }
      ]
    },
    scores: [0, 3, 2, 2]
  },
  {
    id: 20,
    en: {
      q: "Scenario: A friend scolds you for a mistake. How do you react?",
      options: [
        { text: "Withdraw and isolate", indication: ["Depressive Withdrawal"] },
        { text: "Scream, break things, then guilt", indication: ["Borderline Traits", "Impulsivity"] },
        { text: "Listen calmly and resolve", indication: ["Healthy", "Emotional Maturity"] },
        { text: "Think they are an enemy", indication: ["Paranoia", "Splitting"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: বন্ধু আপনার ভুলের জন্য রেগে গেল। আপনার প্রতিক্রিয়া কী?",
      options: [
        { text: "গুটিয়ে যাই, সবার সাথে যোগাযোগ বন্ধ", indication: ["Depressive Withdrawal"] },
        { text: "চিৎকার করি, জিনিস ভাঙি, তারপর অপরাধী", indication: ["Borderline Traits", "Impulsivity"] },
        { text: "শান্ত থেকে কথা শুনি ও সমাধান করি", indication: ["Healthy", "Emotional Maturity"] },
        { text: "মনে হয় সে আমার শত্রু", indication: ["Paranoia", "Splitting"] }
      ]
    },
    scores: [2, 3, 0, 3]
  },
  {
    id: 21,
    en: {
      q: "Scenario: You have a small task to finish. What is your approach?",
      options: [
        { text: "Repeatedly check, takes whole day", indication: ["OCD", "Perfectionism"] },
        { text: "Too tired, can't start", indication: ["Depressive Lethargy", "Avolition"] },
        { text: "Can't focus due to racing thoughts", indication: ["Anxiety", "Cognitive Overload"] },
        { text: "Finish normally with focus", indication: ["Healthy Functioning"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: একটি ছোট কাজ শেষ করতে হবে। আপনার পদ্ধতি কী?",
      options: [
        { text: "বারবার চেক করি, সারাদিন লাগে", indication: ["OCD", "Perfectionism"] },
        { text: "ক্লান্ত, শুরু করতে পারি না", indication: ["Depressive Lethargy", "Avolition"] },
        { text: "দুশ্চিন্তায় ফোকাস করতে পারি না", indication: ["Anxiety", "Cognitive Overload"] },
        { text: "স্বাভাবিকভাবে শেষ করি", indication: ["Healthy Functioning"] }
      ]
    },
    scores: [3, 3, 2, 0]
  },
  {
    id: 22,
    en: {
      q: "Scenario: A big plan fails. What happens next?",
      options: [
        { text: "Find alternative, stay resilient", indication: ["Healthy", "Resilience"] },
        { text: "Feel hopeless, think of ending life", indication: ["Severe Depression", "Suicidal Risk"] },
        { text: "Anxious, can't sleep or eat", indication: ["Acute Stress", "Anxiety"] },
        { text: "No reaction, start risky new plan", indication: ["Mania", "Hypomania"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: একটি বড় পরিকল্পনা ব্যর্থ হলো। পরবর্তী পদক্ষেপ কী?",
      options: [
        { text: "বিকল্প খুঁজি, স্থিতিশীল থাকি", indication: ["Healthy", "Resilience"] },
        { text: "আশাহীন, জীবন শেষ করার চিন্তা", indication: ["Severe Depression", "Suicidal Risk"] },
        { text: "অ্যাংজাইটি, ঘুম বা খাওয়া নেই", indication: ["Acute Stress", "Anxiety"] },
        { text: "কোনো প্রতিক্রিয়া নেই, নতুন ঝুঁকিপূর্ণ পরিকল্পনা", indication: ["Mania", "Hypomania"] }
      ]
    },
    scores: [0, 3, 2, 3]
  },
  {
    id: 23,
    en: {
      q: "Scenario: You are ignored by someone you respect. What do you think?",
      options: [
        { text: "They are busy, will reply later", indication: ["Rational", "Healthy"] },
        { text: "I must have done something wrong", indication: ["Anxious Attachment", "Overthinking"] },
        { text: "I am worthless, they all hate me", indication: ["Low Self-esteem", "Depressive Rumination"] },
        { text: "They are plotting against me", indication: ["Paranoia", "Delusional"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: আপনার সম্মানিত কেউ মেসেজ দেখেও রিপ্লাই দিলেন না। আপনার প্রথম ভাবনা কী?",
      options: [
        { text: "তিনি ব্যস্ত, পরে রিপ্লাই দেবেন", indication: ["Rational", "Healthy"] },
        { text: "আমি নিশ্চয়ই ভুল করেছি", indication: ["Anxious Attachment", "Overthinking"] },
        { text: "আমি মূল্যহীন, সবাই আমাকে ঘৃণা করে", indication: ["Low Self-esteem", "Depressive Rumination"] },
        { text: "তিনি আমার বিরুদ্ধে ষড়যন্ত্র করছেন", indication: ["Paranoia", "Delusional"] }
      ]
    },
    scores: [0, 2, 3, 3]
  },
  {
    id: 24,
    en: {
      q: "Scenario: Late at night, you hear someone whisper your name. What do you think?",
      options: [
        { text: "Just my imagination, I'll sleep", indication: ["Rational", "Healthy"] },
        { text: "Scared, think of ghost", indication: ["Normal Fear", "Anxiety"] },
        { text: "It's a supernatural being talking to me", indication: ["Psychotic", "Delusional"] },
        { text: "I ignore it", indication: ["Healthy", "Rational"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: গভীর রাতে একা, কেউ আপনার নাম ফিসфিস করে ডাকলো। আপনি কী ভাববেন?",
      options: [
        { text: "মনের ভুল, আমি ঘুমাবো", indication: ["Rational", "Healthy"] },
        { text: "ভূতের ভয়ে আতঙ্কিত", indication: ["Normal Fear", "Anxiety"] },
        { text: "এটি অদৃশ্য শক্তি যা আমার সাথে কথা বলে", indication: ["Psychotic", "Delusional"] },
        { text: "পাত্তা দিই না, ঘুমাই", indication: ["Healthy", "Rational"] }
      ]
    },
    scores: [0, 1, 3, 0]
  },
  {
    id: 25,
    en: {
      q: "Scenario: You feel an intense drive to achieve something but lose focus instantly. What describes you?",
      options: [
        { text: "Racing thoughts and bursting energy", indication: ["Mania", "Hypomania"] },
        { text: "Fear of failure stalls me completely", indication: ["Anxiety", "Perfectionism"] },
        { text: "I simply don't care anymore", indication: ["Depression", "Apathy"] },
        { text: "I manage to break tasks and execute", indication: ["Healthy", "Executive Function"] }
      ]
    },
    bn: {
      q: "পরিস্থিতি: আপনার হঠাৎ খুব বড় কিছু করার তীব্র তাগিদ অনুভব হয় কিন্তু মুহূর্তেই ফোকাস হারিয়ে ফেলেন। কোনটি আপনাকে প্রকাশ করে?",
      options: [
        { text: "মাথায় চিন্তার গতি তীব্র এবং অতিরিক্ত এনার্জি কাজ করে", indication: ["Mania", "Hypomania"] },
        { text: "ব্যর্থতার ভয় আমাকে পুরোপুরি থামিয়ে দেয়", indication: ["Anxiety", "Perfectionism"] },
        { text: "আমি আসলে এখন আর কোনো কিছুর তোয়াক্কা করি না", indication: ["Depression", "Apathy"] },
        { text: "আমি কাজগুলো ছোট ছোট ভাগে ভাগ করে শেষ করতে পারি", indication: ["Healthy", "Executive Function"] }
      ]
    },
    scores: [3, 2, 2, 0]
  }
];

// ==========================================
// 3. PERSONALITY QUESTIONS (MINI-IPIP)
// ==========================================
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
  { id: 18, trait: "Openness", en: "I am not interested in abstract ideas.", bn: "জटिल, তাত্ত্বিক বা বিমূর্ত আইডিয়া নিয়ে আমার কোনো আগ্রহ নেই।", reverse: true },
  { id: 19, trait: "Openness", en: "I often come up with new and great ideas.", bn: "আমার মাথায় প্রায়ই নতুন এবং চমৎকার সব আইডিয়া আসে।", reverse: false },
  { id: 20, trait: "Openness", en: "I do not have a good imagination.", bn: "আমার খুব একটা ভালো বা সৃজনশীল কল্পনাশক্তি নেই।", reverse: true },
];

// ==========================================
// 4. MAIN COMPONENT
// ==========================================
export default function MentalHealthAssessment() {
  const [lang, setLang] = useState('bn');
  const [step, setStep] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [mhAnswers, setMHAnswers] = useState([]); 
  const [personalityAnswers, setPersonalityAnswers] = useState({});
  const [currentPQ, setCurrentPQ] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef();

  const T = langData[lang];

  const handleMHAnswer = (optionIndex) => {
    setMHAnswers(prev => [...prev, optionIndex]);
    if (currentQ + 1 < mhQuestions.length) {
      setCurrentQ(c => c + 1);
    } else {
      setStep(4);
    }
  };

  const handlePAnswer = (qId, value) => {
    setPersonalityAnswers(p => ({ ...p, [qId]: value }));
    if (currentPQ + 1 < personalityQuestions.length) {
      setCurrentPQ(c => c + 1);
    } else {
      setShowReport(true);
      setStep(7);
    }
  };

  const calculateMHScore = () => {
    let totalScore = 0;
    mhQuestions.forEach((q, index) => {
      const selectedOption = mhAnswers[index];
      if (selectedOption !== undefined) {
        totalScore += q.scores[selectedOption];
      }
    });
    const maxScore = mhQuestions.length * 3;
    const percentage = (totalScore / maxScore) * 100;
    if (percentage >= 70) return 'severe';
    if (percentage >= 40) return 'moderate';
    return 'healthy';
  };

  const analyzeIndications = () => {
    const disorderCount = {};

    mhQuestions.forEach((q, index) => {
      const selectedOption = mhAnswers[index];
      if (selectedOption !== undefined) {
        // FIXED: Always read indications from static English schema to avoid 'undefined' on language switch
        const indications = q.en.options[selectedOption].indication;
        if (indications) {
          indications.forEach(ind => {
            disorderCount[ind] = (disorderCount[ind] || 0) + 1;
          });
        }
      }
    });

    return Object.keys(disorderCount)
      .filter(d => disorderCount[d] >= 2 && d !== "Normal" && d !== "Healthy")
      .sort((a, b) => disorderCount[b] - disorderCount[a]);
  };

  const calculatePersonality = () => {
    const traits = { Extraversion: { sum: 0, count: 0 }, Agreeableness: { sum: 0, count: 0 }, Conscientiousness: { sum: 0, count: 0 }, Neuroticism: { sum: 0, count: 0 }, Openness: { sum: 0, count: 0 } };
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

  const mhSeverity = calculateMHScore();
  const detectedDisorders = analyzeIndications();
  const personalityResult = calculatePersonality();

  const reset = () => {
    setStep(0); setCurrentQ(0); setMHAnswers([]); setPersonalityAnswers({}); setCurrentPQ(0); setShowReport(false);
  };

  const downloadReport = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;
    try {
      const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Multi-page handling logic to protect clipping
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save('Psychological_Assessment_Report.pdf');
    } catch (error) {
      console.error('PDF Generation Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans relative overflow-hidden">
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
            <div className="space-y-8 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-300 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-[#0b1120]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-light text-slate-100 tracking-wide">{T.welcome.title}</h2>
                <p className="text-sm text-emerald-300/70 font-light tracking-wider">{T.welcome.subtitle}</p>
              </div>
              <div className="space-y-4 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-3 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30">
                  <span className="text-xl">🧠</span>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">{T.welcome.p1}</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30">
                  <span className="text-xl">⚡</span>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">{T.welcome.p2}</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30">
                  <span className="text-xl">🌱</span>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">{T.welcome.p3}</p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium transition-all duration-300 transform hover:scale-105">{T.welcome.cta}</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="flex justify-between text-xs text-slate-500 tracking-widest">
                <span className="text-emerald-300/80">Mental Health Screening</span>
                <span>{currentQ + 1} / {mhQuestions.length}</span>
              </div>
              <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${((currentQ + 1) / mhQuestions.length) * 100}%` }}></div>
              </div>
              {/* FIXED BUG: Added .q property to correctly render string instead of whole object */}
              <h2 className="text-2xl font-light text-slate-100 leading-relaxed">
                {mhQuestions[currentQ][lang].q}
              </h2>
              <div className="flex flex-col gap-3 pt-2">
                {mhQuestions[currentQ][lang].options.map((opt, i) => (
                  <button key={i} onClick={() => handleMHAnswer(i)}
                    className="group w-full text-left p-5 rounded-2xl border border-slate-700/40 bg-slate-800/20 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-all duration-300 flex justify-between items-center backdrop-blur-sm">
                    <span className="text-slate-300 group-hover:text-emerald-200">{opt.text}</span>
                    <span className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-emerald-400 flex items-center justify-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100"></span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
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
                    className="group w-full text-left p-3 rounded-xl border border-slate-700/40 bg-slate-800/20 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-all duration-300 flex justify-between items-center">
                    <span className="text-slate-300 group-hover:text-emerald-200">
                      {num} — {num === 1 ? (lang === 'bn' ? 'একদম একমত নই' : 'Strongly Disagree') : 
                       num === 2 ? (lang === 'bn' ? 'দ্বিমত' : 'Disagree') : 
                       num === 3 ? (lang === 'bn' ? 'নিশ্চিত নই' : 'Neutral') : 
                       num === 4 ? (lang === 'bn' ? 'একমত' : 'Agree') : 
                       (lang === 'bn' ? 'সম্পূর্ণ একমত' : 'Strongly Agree')}
                    </span>
                    <span className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-emerald-400 flex items-center justify-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100"></span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && showReport && (
            <div className="space-y-8">
              <div ref={reportRef} className="bg-white text-slate-900 p-10 rounded-xl shadow-2xl max-w-4xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                <div className="text-center border-b-4 border-emerald-600 pb-6 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{T.report.title}</h1>
                  <p className="text-sm text-slate-500 mt-2">{T.report.generated}: {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div><span className="font-bold text-slate-700">{T.report.client}:</span> Anonymous Participant</div>
                  <div><span className="font-bold text-slate-700">{T.report.assessmentType}:</span> Holistic Psychological Screening</div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">{T.report.mhResult}</h2>
                  <div className={`p-4 rounded-lg ${mhSeverity === 'severe' ? 'bg-red-100 border border-red-300' : mhSeverity === 'moderate' ? 'bg-amber-100 border border-amber-300' : 'bg-emerald-100 border border-emerald-300'}`}>
                    <p className="text-base font-medium">{langData[lang][mhSeverity]}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">{T.report.disorderAnalysis}</h2>
                  <div className="flex flex-wrap gap-2">
                    {detectedDisorders.length > 0 ? (
                      detectedDisorders.map((d, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-300 text-blue-800 rounded-full text-xs font-semibold">
                          {d}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No core clinical traits identified from responses.</p>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">{T.report.personalityResult}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(personalityResult).map(([trait, score]) => (
                      <div key={trait} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-xs text-slate-700">{T.personality.traits[trait]}</span>
                          <span className="text-xs text-slate-500">{(score).toFixed(1)} / 5.0</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(score / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 border border-red-300 rounded-lg bg-red-50/50">
                  <h3 className="font-bold text-red-700 text-xs mb-1">⚠️ {lang === 'bn' ? 'সতর্কীকরণ' : 'Disclaimer'}</h3>
                  <p className="text-[11px] text-red-600 leading-relaxed">{T.report.disclaimer}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={downloadReport} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0b1120] font-medium shadow-xl">
                  {T.report.download}
                </button>
                <button onClick={reset} className="w-full py-3 rounded-full border border-slate-600/50 hover:border-emerald-400/50 text-slate-300 font-light">
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