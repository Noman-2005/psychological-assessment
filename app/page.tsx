"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  depression: number; anxiety: number; ocd: number; ptsd: number;
  psychosis: number; borderline: number; narcissistic: number; eating: number;
  maladaptive: number; dissociation: number; panic: number; social_anxiety: number;
  bipolar: number; insomnia: number; suicidal: number; self_harm: number;
  anhedonia: number; melancholic: number;
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
  indications: string[];
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

// ===== EXERCISES =====
const EXERCISES: { [key: string]: Exercise[] } = {
  depression: [
    {
      id: "dep_ex1", category: "depression",
      title: { en: "Behavioral Activation", bn: "আচরণগত সক্রিয়তা" },
      description: { en: "Force yourself to do small tasks even when unmotivated. Releases dopamine and breaks the cycle of inactivity.", bn: "মন ভালো না থাকলেও ছোট কাজ করতে বাধ্য করুন। এটি ডোপামিন রিলিজ করে এবং অলসতার চক্র ভাঙে।" },
      steps: { en: ["Start with a tiny task like making your bed", "Set a timer for 5 minutes", "Once you start, momentum builds", "Celebrate completing small tasks"], bn: ["বিছানা গোছানোর মতো ছোট কাজ দিয়ে শুরু করুন", "৫ মিনিটের টাইমার সেট করুন", "একবার শুরু করলে গতি তৈরি হয়", "ছোট কাজ শেষ করার জন্য নিজেকে পুরস্কৃত করুন"] }
    },
    {
      id: "dep_ex2", category: "depression",
      title: { en: "Three Good Things", bn: "তিনটি ভালো জিনিস" },
      description: { en: "Write down three positive things that happened each day. Trains your brain to notice positive events.", bn: "প্রতিদিন ঘটে যাওয়া ৩টি ভালো জিনিস লিখুন।" },
      steps: { en: ["Write 3 good things that happened today", "They can be small or big", "Reflect on why each happened", "Do this for 2 weeks"], bn: ["আজ ৩টি ভালো জিনিস লিখুন", "ছোট বা বড় যেকোনো কিছু হতে পারে", "প্রতিটি কেন ঘটেছে তা ভাবুন", "২ সপ্তাহ ধরে এটি করুন"] }
    },
    {
      id: "dep_ex3", category: "depression",
      title: { en: "The 2-Minute Rule", bn: "২ মিনিটের নিয়ম" },
      description: { en: "When overwhelmed, commit to just 2 minutes on a task. Lowers the mental barrier to starting.", bn: "কোনো কাজে অভিভূত হলে মাত্র ২ মিনিট করার প্রতিশ্রুতি দিন।" },
      steps: { en: ["Pick a task you're avoiding", "Commit to 2 minutes only", "After 2 minutes, you're free to stop", "Often you'll continue"], bn: ["এড়িয়ে যাওয়া একটি কাজ বেছে নিন", "শুধু ২ মিনিট করার প্রতিশ্রুতি দিন", "২ মিনিট পর থামতে পারেন", "প্রায়ই আপনি চালিয়ে যান"] }
    }
  ],
  anxiety: [
    {
      id: "anx_ex1", category: "anxiety",
      title: { en: "5-4-3-2-1 Grounding", bn: "৫-৪-৩-২-১ গ্রাউন্ডিং" },
      description: { en: "Rapidly pulls you out of anxious thoughts by engaging all your senses.", bn: "সমস্ত ইন্দ্রিয়কে নিযুক্ত করে দ্রুত উদ্বেগ থেকে বর্তমান মুহূর্তে নিয়ে আসে।" },
      steps: { en: ["Look for 5 things you can see", "Touch 4 things you can feel", "Listen for 3 things you can hear", "Smell 2 things", "Taste 1 thing"], bn: ["৫টি জিনিস দেখুন", "৪টি জিনিস স্পর্শ করুন", "৩টি শব্দ শুনুন", "২টি জিনিস শুঁকুন", "১টি জিনিস স্বাদ নিন"] }
    },
    {
      id: "anx_ex2", category: "anxiety",
      title: { en: "Box Breathing", bn: "বক্স ব্রিদিং" },
      description: { en: "Used by Navy SEALs to stay calm. Activates the parasympathetic nervous system.", bn: "চাপের মধ্যে শান্ত থাকতে ব্যবহৃত হয়। প্যারাসিমপ্যাথেটিক নার্ভাস সিস্টেম সক্রিয় করে।" },
      steps: { en: ["Inhale through nose for 4 seconds", "Hold for 4 seconds", "Exhale through mouth for 4 seconds", "Hold empty for 4 seconds", "Repeat 4-5 times"], bn: ["৪ সেকেন্ড নাক দিয়ে শ্বাস নিন", "৪ সেকেন্ড ধরে রাখুন", "৪ সেকেন্ড মুখ দিয়ে শ্বাস ছাড়ুন", "৪ সেকেন্ড খালি রাখুন", "৪-৫ বার পুনরাবৃত্তি করুন"] }
    }
  ],
  ocd: [
    {
      id: "ocd_ex1", category: "ocd",
      title: { en: "ERP – Exposure & Response Prevention", bn: "ERP টেকনিক" },
      description: { en: "Gradually expose yourself to triggers without performing compulsions.", bn: "ধীরে ধীরে ট্রিগারের মুখোমুখি হন কিন্তু কম্পালসিভ কাজ করবেন না।" },
      steps: { en: ["When urge comes, pause", "Wait 5 minutes before the compulsion", "Gradually increase waiting time", "Learn that anxiety passes"], bn: ["তাগিদ আসলে থামুন", "৫ মিনিট অপেক্ষা করুন", "ধীরে ধীরে অপেক্ষার সময় বাড়ান", "শিখুন যে উদ্বেগ চলে যায়"] }
    },
    {
      id: "ocd_ex2", category: "ocd",
      title: { en: "Brain Lock – 4 Steps", bn: "ব্রেইন লক – ৪ ধাপ" },
      description: { en: "Neuroscience-based technique to retrain your brain when obsessive thoughts appear.", bn: "অবসেসিভ চিন্তা দেখা দিলে মস্তিষ্ককে পুনঃপ্রশিক্ষণ দেওয়ার কৌশল।" },
      steps: { en: ["Relabel: Recognize it's OCD, not reality", "Reattribute: It's a brain chemical imbalance", "Refocus: Shift attention 15 minutes", "Revalue: Treat as worthless noise"], bn: ["পুনঃলেবেল: এটি ওসিডি, বাস্তবতা নয়", "পুনঃবৈশিষ্ট্য: মস্তিষ্কের রাসায়নিক ভারসাম্যহীনতা", "পুনঃফোকাস: ১৫ মিনিট অন্যত্র মনোযোগ দিন", "পুনঃমূল্য: মূল্যহীন শব্দ হিসেবে বিবেচনা করুন"] }
    }
  ],
  ptsd: [
    {
      id: "ptsd_ex1", category: "ptsd",
      title: { en: "Butterfly Hug", bn: "বাটারফ্লাই হাগ" },
      description: { en: "Self-soothing technique that calms the nervous system during flashbacks.", bn: "ফ্ল্যাশব্যাকের সময় স্নায়ুতন্ত্রকে শান্ত করার কৌশল।" },
      steps: { en: ["Cross arms over chest like a butterfly", "Alternate tapping on shoulders", "Breathe deeply while tapping", "Tell yourself 'I am safe now'"], bn: ["বুকের উপর হাত ক্রস করুন", "কাঁধে পর্যায়ক্রমে ট্যাপ করুন", "গভীর শ্বাস নিন", "বলুন 'আমি এখন নিরাপদ'"] }
    }
  ],
  borderline: [
    {
      id: "bpd_ex1", category: "borderline",
      title: { en: "TIPP Technique", bn: "TIPP টেকনিক" },
      description: { en: "DBT crisis intervention that rapidly cools down overwhelming emotions.", bn: "ডিবিটি থেকে ক্রাইসিস টেকনিক যা দ্রুত আবেগকে শীতল করে।" },
      steps: { en: ["T: Temperature – Cold water on face", "I: Intense Exercise – 20 push-ups", "P: Paced Breathing – 5s in, 7s out", "P: Paired Muscle Relaxation – Tense then release"], bn: ["T: ঠান্ডা পানি মুখে", "I: তীব্র ব্যায়াম – ২০ পুশ-আপ", "P: ৫ সেকেন্ড নিন, ৭ সেকেন্ড ছাড়ুন", "P: পেশী টান দিন তারপর ছেড়ে দিন"] }
    }
  ],
  narcissistic: [], eating: [], maladaptive: []
};

// ===== ALL 80 QUESTIONS =====
const SEGMENT_QUESTIONS: { [key: string]: Question[] } = {
  mood: [
    { id: "mood_1", segmentId: "mood", text: { en: "How has your mood been over the past two weeks?", bn: "গত দুই সপ্তাহে আপনার মন মেজাজ কেমন থাকছে?" }, options: [ { text: { en: "Almost always sad, empty, or irritable", bn: "প্রায় প্রতিদিন মন খুব খারাপ ও খালি খালি লাগে" }, score: 3, tags: ["depression_severe"] }, { text: { en: "Sometimes sad, but can be cheered up", bn: "মাঝে মাঝে মন খারাপ, তবে ভালো হয়ে যায়" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Occasionally feel down", bn: "মাঝে মাঝে একটু মন খারাপ হয়" }, score: 1, tags: ["depression_mild"] }, { text: { en: "Generally stable and positive", bn: "সাধারণত মন ভালো থাকে" }, score: 0, tags: [] } ] },
    { id: "mood_2", segmentId: "mood", text: { en: "Do you enjoy activities you used to love?", bn: "যে কাজগুলো আগে পছন্দ করতেন, সেগুলো থেকে এখন কেমন আনন্দ পান?" }, options: [ { text: { en: "No pleasure at all, mind feels dead", bn: "একদমই কোনো আনন্দ পাই না, মন পুরো মরে গেছে" }, score: 3, tags: ["depression_severe", "anhedonia"] }, { text: { en: "Much less pleasure than before", bn: "আগের চেয়ে আনন্দ অনেক কম পাই" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Slightly less interest", bn: "একটু কম আগ্রহ লাগে" }, score: 1, tags: ["depression_mild"] }, { text: { en: "Enjoy them as much as before", bn: "আগের মতোই আনন্দ পাই" }, score: 0, tags: [] } ] },
    { id: "mood_3", segmentId: "mood", text: { en: "How is your daily energy level?", bn: "আপনার দৈনন্দিন এনার্জি লেভেল কেমন?" }, options: [ { text: { en: "Extremely tired, can't get out of bed", bn: "এতটাই ক্লান্ত যে বিছানা থেকে উঠতে পারি না" }, score: 3, tags: ["depression_severe"] }, { text: { en: "Very tired, small tasks feel difficult", bn: "সারাক্ষণ ক্লান্ত লাগে, ছোট কাজ করতেও কষ্ট হয়" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Sometimes tired, but manageable", bn: "মাঝে মাঝে ক্লান্ত, তবে সামলাতে পারি" }, score: 1, tags: ["depression_mild"] }, { text: { en: "Normal energy levels", bn: "স্বাভাবিক এনার্জি থাকে" }, score: 0, tags: [] } ] },
    { id: "mood_4", segmentId: "mood", text: { en: "At what time of day is your mood the worst?", bn: "কোন সময়টায় আপনার মন সবচেয়ে বেশি খারাপ থাকে?" }, options: [ { text: { en: "Early morning, right after waking up", bn: "ভোরে ঘুম থেকে ওঠার পর মন সবচেয়ে বিষণ্ণ ও ভারী লাগে" }, score: 3, tags: ["depression_severe", "melancholic"] }, { text: { en: "Evening or night when alone", bn: "সন্ধ্যায় বা রাতে একা থাকলে মন বেশি খারাপ হয়" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "No specific pattern", bn: "নির্দিষ্ট কোনো সময় নেই" }, score: 1, tags: ["depression_mild"] }, { text: { en: "No significant mood changes", bn: "সারাদিন মেজাজে তেমন পরিবর্তন হয় না" }, score: 0, tags: [] } ] },
    { id: "mood_5", segmentId: "mood", text: { en: "What is your current sleep pattern like?", bn: "আপনার বর্তমান ঘুমের প্যাটার্ন কেমন?" }, options: [ { text: { en: "Wake up very early and can't sleep again", bn: "খুব ভোরে ঘুম ভেঙে যায় এবং আর ঘুম আসে না" }, score: 3, tags: ["depression_severe", "terminal_insomnia"] }, { text: { en: "Can't fall asleep or wake up frequently", bn: "রাতে ঘুম আসে না বা মাঝরাতে ঘুম ভেঙে যায়" }, score: 2, tags: ["depression_moderate", "insomnia"] }, { text: { en: "Sometimes have trouble sleeping", bn: "মাঝে মাঝে ঘুমাতে সমস্যা হয়" }, score: 1, tags: ["depression_mild"] }, { text: { en: "Normal sleep pattern", bn: "ঘুম স্বাভাবিক আছে" }, score: 0, tags: [] } ] },
    { id: "mood_6", segmentId: "mood", text: { en: "Has your appetite changed?", bn: "আপনার ক্ষুধায় কোনো পরিবর্তন এসেছে?" }, options: [ { text: { en: "Appetite completely gone, losing weight", bn: "খিদে মরে গেছে, জোর করে খেতে হয় এবং ওজন কমে গেছে" }, score: 3, tags: ["depression_severe", "melancholic"] }, { text: { en: "Eating more than usual, gaining weight", bn: "মন খারাপে বেশি বেশি খাচ্ছি এবং ওজন বাড়ছে" }, score: 2, tags: ["depression_moderate", "atypical"] }, { text: { en: "Slight change in appetite", bn: "ক্ষুধায় সামান্য পরিবর্তন" }, score: 1, tags: ["depression_mild"] }, { text: { en: "No significant change", bn: "ক্ষুধায় উল্লেখযোগ্য পরিবর্তন নেই" }, score: 0, tags: [] } ] },
    { id: "mood_7", segmentId: "mood", text: { en: "How do you evaluate yourself currently?", bn: "নিজের সম্পর্কে বর্তমান ভাবনা কেমন?" }, options: [ { text: { en: "Worthless, hopeless, a burden to others", bn: "নিজেকে মূল্যহীন, আশাহীন এবং পরিবারের বোঝা মনে হয়" }, score: 3, tags: ["depression_severe", "self_blame"] }, { text: { en: "Often blame myself for failures", bn: "প্রায়ই নিজেকে দোষী ও ব্যর্থ মনে করি" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Sometimes feel inadequate", bn: "মাঝে মাঝে নিজেকে অপর্যাপ্ত মনে হয়" }, score: 1, tags: ["depression_mild"] }, { text: { en: "Realistic view of myself", bn: "নিজের ভুলত্রুটি ও সাফল্য বাস্তবসম্মতভাবে দেখি" }, score: 0, tags: [] } ] },
    { id: "mood_8", segmentId: "mood", text: { en: "Do you have difficulty making decisions or concentrating?", bn: "সিদ্ধান্ত নিতে বা মনোযোগ দিতে কেমন সমস্যা হচ্ছে?" }, options: [ { text: { en: "Can't make even small decisions, mind frozen", bn: "ছোট বিষয়েও সিদ্ধান্ত নিতে পারি না, মাথা জ্যাম হয়ে থাকে" }, score: 3, tags: ["depression_severe", "cognitive_slowing"] }, { text: { en: "Struggle to focus, decisions take longer", bn: "মনোযোগ দিতে কষ্ট হয়, সিদ্ধান্ত নিতে অনেক সময় লাগে" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Sometimes have trouble concentrating", bn: "মাঝে মাঝে মনোযোগ দিতে সমস্যা হয়" }, score: 1, tags: ["depression_mild"] }, { text: { en: "No difficulty concentrating", bn: "মনোযোগ বা সিদ্ধান্তে কোনো সমস্যা নেই" }, score: 0, tags: [] } ] },
    { id: "mood_9", segmentId: "mood", text: { en: "Have you had thoughts of ending your life recently?", bn: "গত কয়েকদিনে জীবন শেষ করার কোনো চিন্তা এসেছে?" }, options: [ { text: { en: "Yes, I actively plan or seek ways", bn: "নিজেকে শেষ করার তীব্র চিন্তা আসে এবং পরিকল্পনাও খুঁজি" }, score: 3, tags: ["active_suicidal", "emergency"] }, { text: { en: "Sometimes wish I wouldn't wake up", bn: "মাঝে মাঝে মনে হয় রাতে ঘুমালে যদি আর সকাল না হতো" }, score: 2, tags: ["passive_suicidal", "depression_severe"] }, { text: { en: "Rarely think about death", bn: "মাঝে মাঝে মৃত্যুর কথা ভাবি, কিন্তু গুরুত্ব দিই না" }, score: 1, tags: ["depression_moderate"] }, { text: { en: "No thoughts of death", bn: "মরে যাওয়ার কোনো চিন্তা আসে না" }, score: 0, tags: [] } ] },
    { id: "mood_10", segmentId: "mood", text: { en: "How is your speech and physical movement?", bn: "কথা বলা বা শারীরিক নড়াচড়ার গতিতে কোনো পরিবর্তন এসেছে?" }, options: [ { text: { en: "Speak slowly and move sluggishly", bn: "খুব ধীরে কথা বলি, হাঁটতেও অনেক সময় লাগে" }, score: 3, tags: ["depression_severe", "psychomotor_retardation"] }, { text: { en: "Feel slower than usual", bn: "স্বাভাবিকের চেয়ে কিছুটা ধীর লাগে" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Occasionally feel sluggish", bn: "মাঝে মাঝে একটু অলস লাগে" }, score: 1, tags: ["depression_mild"] }, { text: { en: "Normal movement and speech", bn: "স্বাভাবিক গতি ও কথাবার্তা" }, score: 0, tags: [] } ] },
    { id: "mood_11", segmentId: "mood", text: { en: "Have you experienced intense irritability or aggression for days?", bn: "৪-৫ দিন ধরে অতিরিক্ত খিটখিটে বা আক্রমণাত্মক ছিলেন?" }, options: [ { text: { en: "Yes, got angry over small things, broke things", bn: "হ্যাঁ, সামান্য কারণে রেগে চিৎকার করেছি, জিনিস ভেঙেছি" }, score: 3, tags: ["bipolar_mania", "mood_swings"] }, { text: { en: "Sometimes irritable when sad", bn: "মন খারাপে মাঝে মাঝে একটু খিটখিটে লাগে" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Mild irritability occasionally", bn: "মাঝে মাঝে সামান্য খিটখিটে লাগে" }, score: 1, tags: ["mood_mild"] }, { text: { en: "Can control my anger", bn: "রাগ হলেও সাধারণত নিজেকে শান্ত রাখতে পারি" }, score: 0, tags: [] } ] },
    { id: "mood_12", segmentId: "mood", text: { en: "Have you made impulsive decisions without thinking of consequences?", bn: "পরিণতির কথা না ভেবে হঠকারী কোনো বড় সিদ্ধান্ত নিয়েছেন?" }, options: [ { text: { en: "Yes, spent a lot of money or took big risks", bn: "হ্যাঁ, অনেক টাকা উড়িয়েছি বা বড় ঝুঁকি নিয়েছি" }, score: 3, tags: ["bipolar_mania", "impulsivity"] }, { text: { en: "Sometimes make impulsive choices", bn: "মাঝে মাঝে হঠকারী সিদ্ধান্ত নিই" }, score: 2, tags: ["impulsivity_mild"] }, { text: { en: "Occasionally impulsive", bn: "মাঝে মাঝে একটু হঠকারী হই" }, score: 1, tags: [] }, { text: { en: "Generally careful with decisions", bn: "সিদ্ধান্তের ব্যাপারে সবসময় সতর্ক থাকি" }, score: 0, tags: [] } ] },
    { id: "mood_13", segmentId: "mood", text: { en: "What is your social life like currently?", bn: "বর্তমান সামাজিক জীবন কেমন?" }, options: [ { text: { en: "Completely withdrawn, don't leave the house", bn: "নিজেকে গুটিয়ে বন্ধ ঘরে একা পড়ে থাকি" }, score: 3, tags: ["depression_severe", "social_withdrawal"] }, { text: { en: "Socializing much less than before", bn: "আগের চেয়ে অনেক কম সামাজিক হয়েছি" }, score: 2, tags: ["depression_moderate"] }, { text: { en: "Sometimes avoid social situations", bn: "মাঝে মাঝে সামাজিক অনুষ্ঠান এড়িয়ে চলি" }, score: 1, tags: ["social_anxiety_mild"] }, { text: { en: "Normal social life", bn: "স্বাভাবিক সামাজিক জীবন আছে" }, score: 0, tags: [] } ] },
    { id: "mood_14", segmentId: "mood", text: { en: "Is this condition affecting your work, studies, or relationships?", bn: "এই মানসিক অবস্থা কি কর্মক্ষমতা বা সম্পর্কে ক্ষতি করছে?" }, options: [ { text: { en: "Severely affected, can't function properly", bn: "অফিস বা ক্লাসে যাওয়া প্রায় বন্ধ হয়ে গেছে" }, score: 3, tags: ["functional_impairment", "depression_severe"] }, { text: { en: "Significantly affected", bn: "কাজে মনোযোগ দিতে পারছি না, পারফরম্যান্স খারাপ হয়েছে" }, score: 2, tags: ["functional_impairment_moderate"] }, { text: { en: "Somewhat affected but managing", bn: "কিছুটা সমস্যা হচ্ছে, তবে সামলাচ্ছি" }, score: 1, tags: ["functional_impairment_mild"] }, { text: { en: "Not significantly affected", bn: "তেমন কোনো সমস্যা হচ্ছে না" }, score: 0, tags: [] } ] },
    { id: "mood_15", segmentId: "mood", text: { en: "Do these symptoms come in cycles (extreme highs and lows)?", bn: "এই লক্ষণগুলো কি চক্রাকারে (কখনো চরম ভালো, কখনো চরম খারাপ) আসে?" }, options: [ { text: { en: "Yes, clear cycles of highs and lows", bn: "হ্যাঁ, কয়েক মাস পর পর ভালো-খারাপের সাইকেল ঘটে" }, score: 3, tags: ["bipolar_cyclic"] }, { text: { en: "Somewhat cyclical pattern", bn: "কিছুটা চক্রাকারে আসে" }, score: 2, tags: ["bipolar_mild"] }, { text: { en: "Occasional ups and downs", bn: "মাঝে মাঝে ভালো-মন্দ হয়" }, score: 1, tags: ["mood_swings_mild"] }, { text: { en: "No, it's continuously low", bn: "না, একটানা দীর্ঘদিন ধরে মন খারাপ চলছে" }, score: 0, tags: ["unipolar_depression"] } ] }
  ],
  anxiety: [
    { id: "anx_1", segmentId: "anxiety", text: { en: "What is the nature of your worry?", bn: "আপনার দুশ্চিন্তার ধরন কেমন?" }, options: [ { text: { en: "Constant worry about everything, no specific reason", bn: "নির্দিষ্ট কারণ ছাড়াই সারাক্ষণ সব বিষয় নিয়ে মন অস্থির থাকে" }, score: 3, tags: ["anxiety_severe", "gad"] }, { text: { en: "Sudden intense fear attacks", bn: "হুট করে কোনো কারণ ছাড়াই তীব্র ভয়ের ঝাপটা আসে" }, score: 3, tags: ["panic_disorder"] }, { text: { en: "Worried about social situations", bn: "মানুষের সামনে বা অচেনা পরিবেশে বুক কেঁপে ওঠে" }, score: 2, tags: ["social_anxiety"] }, { text: { en: "Occasional worry about real problems", bn: "মাঝে মাঝে বাস্তব সমস্যা নিয়ে চিন্তা করি" }, score: 1, tags: ["anxiety_mild"] } ] },
    { id: "anx_2", segmentId: "anxiety", text: { en: "Can you control your anxiety or fears?", bn: "এই দুশ্চিন্তা বা ভয় কতটা নিয়ন্ত্রণ করতে পারেন?" }, options: [ { text: { en: "Cannot control at all, mind races constantly", bn: "চাইলেও চিন্তার স্রোত থামাতে পারি না" }, score: 3, tags: ["anxiety_severe", "gad"] }, { text: { en: "Fear comes so fast I can't control it", bn: "ভয় এত দ্রুত আসে যে নিয়ন্ত্রণের সুযোগই পাই না" }, score: 3, tags: ["panic_disorder"] }, { text: { en: "Can control with some effort", bn: "একটু সময় নিলে শান্ত হতে পারি" }, score: 2, tags: ["anxiety_moderate"] }, { text: { en: "Can manage easily", bn: "সহজেই নিয়ন্ত্রণ করতে পারি" }, score: 0, tags: [] } ] },
    { id: "anx_3", segmentId: "anxiety", text: { en: "Which physical symptoms occur most during anxiety?", bn: "দুশ্চিন্তার সময় কোন শারীরিক লক্ষণ সবচেয়ে বেশি দেখা যায়?" }, options: [ { text: { en: "Muscle tension, headache, can't relax", bn: "পেশি শক্ত হওয়া, মাথায় ব্যথা, রিল্যাক্স হতে না পারা" }, score: 2, tags: ["anxiety_moderate", "somatic_tension"] }, { text: { en: "Heart palpitations, breathlessness, trembling, sweating", bn: "বুক ধড়ফড়, দম আটকে আসা, হাত-পা কাঁপা, প্রচণ্ড ঘাম" }, score: 3, tags: ["panic_disorder"] }, { text: { en: "Stomach discomfort or dry mouth", bn: "পেটে মোচড় বা মুখ শুকিয়ে যায়" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "No physical symptoms", bn: "কোনো শারীরিক লক্ষণ নেই" }, score: 0, tags: [] } ] },
    { id: "anx_4", segmentId: "anxiety", text: { en: "Do you constantly fear something bad will happen?", bn: "সারাক্ষণ কোনো অজানা খারাপ কিছু ঘটার ভয় কাজ করে?" }, options: [ { text: { en: "Yes, constant fear of catastrophe", bn: "হ্যাঁ, মনে হয় আমার বা পরিবারের বড় কোনো বিপদ ঘটবে" }, score: 3, tags: ["anxiety_severe", "gad"] }, { text: { en: "Fear of heart attack or going crazy", bn: "হার্ট অ্যাটাক হবে বা পাগল হয়ে যাবো এই ভয়" }, score: 2, tags: ["panic_disorder", "hypochondriasis"] }, { text: { en: "Occasional unrealistic fears", bn: "মাঝে মাঝে অলীক ভয় কাজ করে" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "No such fears", bn: "এমন কোনো অলীক ভয় নেই" }, score: 0, tags: [] } ] },
    { id: "anx_5", segmentId: "anxiety", text: { en: "How do you feel about social events?", bn: "সামাজিক অনুষ্ঠান (বিয়ে বাড়ি, প্রেজেন্টেশন) নিয়ে অনুভূতি কী?" }, options: [ { text: { en: "Intense fear of being judged or embarrassed", bn: "তীব্র ভয় পাই যে সবাই আমাকে দেখছে এবং হাসাহাসি করবে" }, score: 3, tags: ["social_anxiety_severe"] }, { text: { en: "Fear of having a panic attack in public", bn: "সামাজিক অনুষ্ঠানে প্যানিক অ্যাটাক হবে এই ভয়ে যেতে পারি না" }, score: 2, tags: ["agoraphobia", "panic_disorder"] }, { text: { en: "Some nervousness but manageable", bn: "একটু নার্ভাস লাগলেও স্বাভাবিকভাবে অংশ নিতে পারি" }, score: 1, tags: ["social_anxiety_mild"] }, { text: { en: "No issue with social events", bn: "সামাজিক অনুষ্ঠানে কোনো সমস্যা নেই" }, score: 0, tags: [] } ] },
    { id: "anx_6", segmentId: "anxiety", text: { en: "How is your restlessness?", bn: "অস্থিরতা বা ছটফটে ভাব কেমন?" }, options: [ { text: { en: "Constant restlessness, can't sit still", bn: "সারাক্ষণ মনের ভেতর অস্থিরতা, এক জায়গায় শান্ত হয়ে বসতে পারি না" }, score: 3, tags: ["anxiety_severe", "gad"] }, { text: { en: "Restless during anxiety attacks", bn: "সাধারণত শান্ত, কিন্তু ভয়ের অ্যাটাক আসলে ছটফট করি" }, score: 2, tags: ["panic_disorder"] }, { text: { en: "Occasionally restless", bn: "মাঝে মাঝে একটু অস্থির লাগে" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "No restlessness", bn: "এমন অস্থিরতা নেই" }, score: 0, tags: [] } ] },
    { id: "anx_7", segmentId: "anxiety", text: { en: "Has your sleep been affected by anxiety?", bn: "দুশ্চিন্তার কারণে ঘুমে কী পরিবর্তন হয়েছে?" }, options: [ { text: { en: "Can't sleep for hours, mind racing", bn: "মাথায় চিন্তার চাকা ঘোরে বলে বিছানায় শুয়েও ঘণ্টার পর ঘণ্টা ঘুম আসে না" }, score: 3, tags: ["anxiety_severe", "insomnia"] }, { text: { en: "Wake up with palpitations or nightmares", bn: "ভয়ের ধাক্কায় বুক ধড়ফড়ানি নিয়ে মাঝরাতে ঘুম ভেঙে যায়" }, score: 2, tags: ["panic_disorder", "insomnia"] }, { text: { en: "Occasional sleep disturbance", bn: "মাঝে মাঝে ঘুমে ব্যাঘাত ঘটে" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "Normal sleep", bn: "ঘুম স্বাভাবিক" }, score: 0, tags: [] } ] },
    { id: "anx_8", segmentId: "anxiety", text: { en: "Do you have extreme fears of specific objects or situations?", bn: "কোনো নির্দিষ্ট বস্তু বা পরিস্থিতিকে চরম অযৌক্তিক ভয় পান?" }, options: [ { text: { en: "Yes, extreme irrational fear I avoid", bn: "হ্যাঁ, সাধারণ মানুষের চেয়ে অনেক বেশি ভয় পাই এবং এড়িয়ে চলি" }, score: 3, tags: ["specific_phobia"] }, { text: { en: "Fear of closed spaces or heights", bn: "বদ্ধ জায়গা বা উচ্চতায় ভয় লাগে, দম আটকে যাবে মনে হয়" }, score: 2, tags: ["claustrophobia", "panic_disorder"] }, { text: { en: "Some fear but manageable", bn: "সামান্য ভয় লাগে, কিন্তু বড় সমস্যা নয়" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "No specific fears", bn: "এমন কোনো ভয় নেই" }, score: 0, tags: [] } ] },
    { id: "anx_9", segmentId: "anxiety", text: { en: "Do you become irritable suddenly?", bn: "হুট করে মেজাজ খিটখিটে হয়ে যায়?" }, options: [ { text: { en: "Yes, irritated by small things due to constant worry", bn: "হ্যাঁ, দুশ্চিন্তার চাপে ছোটখাটো বিষয়েও মেজাজ গরম হয়ে যায়" }, score: 3, tags: ["anxiety_severe", "irritability"] }, { text: { en: "Sometimes irritable", bn: "মাঝে মাঝে খিটখিটে লাগে" }, score: 2, tags: ["anxiety_moderate"] }, { text: { en: "Occasionally", bn: "মাঝে মাঝে একটু" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "Generally calm", bn: "মেজাজ সাধারণত শান্ত থাকে" }, score: 0, tags: [] } ] },
    { id: "anx_10", segmentId: "anxiety", text: { en: "How is your concentration during anxiety?", bn: "দুশ্চিন্তার সময় মনোযোগের অবস্থা কেমন?" }, options: [ { text: { en: "Can't focus, mind goes blank", bn: "মন এক জায়গায় বসে না, মাথা পুরো ফাঁকা হয়ে যায়" }, score: 3, tags: ["anxiety_severe", "concentration_difficulty"] }, { text: { en: "Hyper-focused on my own physical symptoms", bn: "ভয়ের সময় শুধু নিজের হার্টবিটের দিকে মনোযোগ আটকে থাকে" }, score: 2, tags: ["panic_disorder", "hypervigilance"] }, { text: { en: "Some concentration difficulty", bn: "কিছুটা মনোযোগ দিতে সমস্যা হয়" }, score: 1, tags: ["anxiety_moderate"] }, { text: { en: "Normal concentration", bn: "স্বাভাবিক মনোযোগ ধরে রাখতে পারি" }, score: 0, tags: [] } ] },
    { id: "anx_11", segmentId: "anxiety", text: { en: "Have you stopped doing things to avoid fear?", bn: "ভয় এড়াতে কোনো জায়গা বা কাজ পুরোপুরি বন্ধ করেছেন?" }, options: [ { text: { en: "Yes, stopped going out alone or to public places", bn: "হ্যাঁ, একা বাইরে যাওয়া বা গণপরিবহন বন্ধ করেছি" }, score: 3, tags: ["agoraphobia", "panic_disorder"] }, { text: { en: "Avoid social situations where I might be judged", bn: "মানুষের সামনে কথা বলতে হবে এমন পরিস্থিতি এড়িয়ে চলি" }, score: 2, tags: ["social_anxiety_severe"] }, { text: { en: "Sometimes avoid certain situations", bn: "মাঝে মাঝে কিছু পরিস্থিতি এড়িয়ে চলি" }, score: 1, tags: ["anxiety_moderate"] }, { text: { en: "Don't avoid anything", bn: "কোনো কাজ বা জায়গা পুরোপুরি এড়িয়ে চলি না" }, score: 0, tags: [] } ] },
    { id: "anx_12", segmentId: "anxiety", text: { en: "How long have these anxiety symptoms been present?", bn: "এই দুশ্চিন্তার লক্ষণগুলো টানা কতদিন ধরে চলছে?" }, options: [ { text: { en: "More than 6 months, almost daily", bn: "গত ৬ মাসেরও বেশি সময় ধরে প্রায় প্রতিদিন থাকে" }, score: 3, tags: ["gad", "chronic_anxiety"] }, { text: { en: "About 1 month with panic attacks", bn: "১ মাসের মতো ধরে তীব্র প্যানিক অ্যাটাক হচ্ছে" }, score: 2, tags: ["panic_disorder"] }, { text: { en: "A few weeks due to specific stress", bn: "কয়েক সপ্তাহ হলো নির্দিষ্ট কারণে চিন্তা হচ্ছে" }, score: 1, tags: ["situational_anxiety"] }, { text: { en: "Recent onset", bn: "সম্প্রতি শুরু হয়েছে" }, score: 0, tags: [] } ] },
    { id: "anx_13", segmentId: "anxiety", text: { en: "Do you feel easily fatigued?", bn: "সারাক্ষণ ক্লান্তি বা অল্পতেই হাঁপিয়ে ওঠার সমস্যা আছে?" }, options: [ { text: { en: "Yes, constantly exhausted from the mental pressure", bn: "হ্যাঁ, দুশ্চিন্তার মানসিক ধকলে শরীর সবসময় ক্লান্ত থাকে" }, score: 3, tags: ["anxiety_severe", "fatigue"] }, { text: { en: "Often tired", bn: "প্রায়ই ক্লান্ত লাগে" }, score: 2, tags: ["anxiety_moderate"] }, { text: { en: "Sometimes fatigued", bn: "মাঝে মাঝে ক্লান্তি লাগে" }, score: 1, tags: ["anxiety_mild"] }, { text: { en: "No unusual fatigue", bn: "অস্বাভাবিক ক্লান্তি নেই" }, score: 0, tags: [] } ] },
    { id: "anx_14", segmentId: "anxiety", text: { en: "Do you use substances to cope with anxiety?", bn: "ভয় বা দুশ্চিন্তা থেকে মুক্তি পেতে ওষুধ বা অ্যালকোহলের আশ্রয় নেন?" }, options: [ { text: { en: "Yes, regularly use sedatives or alcohol without prescription", bn: "হ্যাঁ, নিজেকে শান্ত করতে প্রেসক্রিপশন ছাড়া ঘুমের বা নেশার ওষুধ নিই" }, score: 3, tags: ["substance_use", "maladaptive_coping"] }, { text: { en: "Sometimes use alcohol or substances", bn: "মাঝে মাঝে নিই" }, score: 2, tags: ["substance_use_mild"] }, { text: { en: "Occasionally use tea, music to calm down", bn: "মাঝে মাঝে চা-কফি বা গান শুনে মন ঘোরানোর চেষ্টা করি" }, score: 1, tags: ["adaptive_coping"] }, { text: { en: "No, I avoid substances", bn: "না, এগুলো এড়িয়ে চলি" }, score: 0, tags: [] } ] },
    { id: "anx_15", segmentId: "anxiety", text: { en: "Do you know your fears are excessive but can't stop them?", bn: "জানেন ভয়গুলো অতিরিক্ত, কিন্তু তবুও থামাতে পারছেন না?" }, options: [ { text: { en: "Yes, I know it's irrational but can't control it", bn: "হ্যাঁ, জানি এত চিন্তার কিছু নেই, তাও মন শোনে না" }, score: 3, tags: ["gad", "intact_insight"] }, { text: { en: "I believe my fears are completely real", bn: "আমার মনে হয় ভয়গুলো পুরোপুরি বাস্তব এবং শরীরে বড় রোগ আছে" }, score: 2, tags: ["hypochondriasis", "poor_insight"] }, { text: { en: "Sometimes doubt if my fears are real", bn: "মাঝে মাঝে সন্দেহ হয়" }, score: 1, tags: ["anxiety_moderate"] }, { text: { en: "My fears are rational", bn: "আমার ভয়গুলো পরিস্থিতি অনুযায়ী স্বাভাবিক" }, score: 0, tags: [] } ] }
  ],
  ocd: [
    { id: "ocd_1", segmentId: "ocd", text: { en: "Do you have recurring, unwanted thoughts or images?", bn: "মাথায় কি অদ্ভুত বা অস্বস্তিকর চিন্তা বা ছবি বারবার আসে?" }, options: [ { text: { en: "Yes, fear of contamination or germs", bn: "হ্যাঁ, বারবার মনে হয় হাত নোংরা বা জীবাণু লেগে আছে" }, score: 3, tags: ["ocd_contamination"] }, { text: { en: "Yes, fear of forgetting to lock doors or turn off gas", bn: "হ্যাঁ, বারবার মনে হয় দরজা লক করিনি বা গ্যাস নেভাইনি" }, score: 3, tags: ["ocd_checking"] }, { text: { en: "Yes, unwanted taboo or aggressive thoughts", bn: "হ্যাঁ, ট্যাবুর বিরুদ্ধে কুচিন্তা বা অপছন্দনীয় ছবি বারবার ভাসে" }, score: 3, tags: ["ocd_intrusive"] }, { text: { en: "No unwanted recurring thoughts", bn: "না, এমন অবাধ্য চিন্তা বারবার আসে না" }, score: 0, tags: [] } ] },
    { id: "ocd_2", segmentId: "ocd", text: { en: "How do you feel when these thoughts come?", bn: "এই চিন্তাগুলো মাথায় আসলে কেমন অনুভূতি হয়?" }, options: [ { text: { en: "Intense anxiety, fear, or guilt", bn: "তীব্র মানসিক অশান্তি, ভয় বা অপরাধবোধ তৈরি হয়" }, score: 3, tags: ["ocd_severe"] }, { text: { en: "Some discomfort", bn: "একটু খুতখুতানি লাগে" }, score: 1, tags: ["ocd_mild"] }, { text: { en: "No particular feeling", bn: "কোনো বিশেষ অনুভূতি হয় না" }, score: 0, tags: [] } ] },
    { id: "ocd_3", segmentId: "ocd", text: { en: "Do you perform repetitive actions to relieve the anxiety?", bn: "অশান্তি থেকে বাঁচতে কোনো কাজ বারবার বা নির্দিষ্ট নিয়মে করতে বাধ্য হন?" }, options: [ { text: { en: "Yes, repeated hand washing or cleaning", bn: "হ্যাঁ, মনের খুতখুতানি দূর করতে বারবার হাত ধুই বা গোসলে ঘণ্টার পর ঘণ্টা" }, score: 3, tags: ["ocd_cleaning"] }, { text: { en: "Yes, repeated checking of locks, gas, switches", bn: "হ্যাঁ, বারবার তালা, গ্যাসের চাবি বা সুইচ গুনে গুনে চেক করি" }, score: 3, tags: ["ocd_checking"] }, { text: { en: "Yes, mental rituals like counting or praying", bn: "হ্যাঁ, মনে মনে নির্দিষ্ট দোয়া বা সংখ্যা বারবার আওড়াতে হয়" }, score: 3, tags: ["ocd_mental"] }, { text: { en: "No repetitive actions", bn: "না, এভাবে বারবার করতে বাধ্য হই না" }, score: 0, tags: [] } ] },
    { id: "ocd_4", segmentId: "ocd", text: { en: "What happens if you're prevented from performing the ritual?", bn: "সেই কাজ করতে বাধা দিলে কী হয়?" }, options: [ { text: { en: "Extreme anxiety, feel something terrible will happen", bn: "অ্যাংজাইটি চরম পর্যায়ে পৌঁছায়, মনে হয় এক্ষুনি খারাপ কিছু ঘটে যাবে" }, score: 3, tags: ["ocd_severe"] }, { text: { en: "Some discomfort or frustration", bn: "একটু অস্বস্তি বা রাগ লাগে" }, score: 1, tags: ["ocd_moderate"] }, { text: { en: "No problem at all", bn: "কোনো সমস্যাই হবে না" }, score: 0, tags: [] } ] },
    { id: "ocd_5", segmentId: "ocd", text: { en: "How much time do these thoughts and rituals consume daily?", bn: "প্রতিদিন এই চিন্তা ও কাজের পেছনে গড়ে কতটুকু সময় নষ্ট হয়?" }, options: [ { text: { en: "More than 1 hour (sometimes 4-5 hours)", bn: "প্রতিদিন ১+ ঘণ্টা (কখনো ৪-৫ ঘণ্টা)" }, score: 3, tags: ["ocd_severe"] }, { text: { en: "About 30 minutes to 1 hour", bn: "প্রায় ৩০ মিনিট থেকে ১ ঘণ্টা" }, score: 2, tags: ["ocd_moderate"] }, { text: { en: "10-15 minutes", bn: "দিনে মাত্র ১০-১৫ মিনিট" }, score: 1, tags: ["ocd_mild"] }, { text: { en: "No time wasted", bn: "এমন সময় নষ্ট হয় না" }, score: 0, tags: [] } ] },
    { id: "ocd_6", segmentId: "ocd", text: { en: "Do you have specific rules for arranging things?", bn: "জিনিসপত্র সাজানোর ক্ষেত্রে কোনো বিশেষ নিয়ম আছে?" }, options: [ { text: { en: "Yes, everything must be perfectly ordered", bn: "হ্যাঁ, সব জিনিস নিখুঁতভাবে সুনির্দিষ্ট লাইনে সাজানো থাকতে হবে" }, score: 3, tags: ["ocd_symmetry"] }, { text: { en: "I prefer things organized", bn: "গোছানো জিনিস পছন্দ করি" }, score: 1, tags: ["ocd_mild"] }, { text: { en: "No specific rules", bn: "বেশ অগোছালো মানুষ" }, score: 0, tags: [] } ] },
    { id: "ocd_7", segmentId: "ocd", text: { en: "Do you have difficulty throwing things away?", bn: "পুরনো বা অপ্রয়োজনীয় জিনিস ফেলে দিতে তীব্র কষ্ট হয়?" }, options: [ { text: { en: "Yes, I keep everything 'just in case'", bn: "হ্যাঁ, ভবিষ্যতে লাগতে পারে ভেবে ঘরভর্তি অপ্রয়োজনীয় জিনিস জমিয়ে রেখেছি" }, score: 3, tags: ["hoarding"] }, { text: { en: "Keep sentimental items", bn: "ডায়েরি বা গিফটের মতো স্মৃতির জিনিস জমিয়ে রাখি" }, score: 1, tags: ["normal_sentiment"] }, { text: { en: "No, I discard easily", bn: "না, অপ্রয়োজনীয় জিনিস সহজেই ফেলে দিতে পারি" }, score: 0, tags: [] } ] },
    { id: "ocd_8", segmentId: "ocd", text: { en: "Do you fear harming others or doing something immoral?", bn: "কাউকে আঘাত করা বা অনৈতিক কাজ করে ফেলার অদ্ভুত ভয় আসে?" }, options: [ { text: { en: "Yes, fear I might harm someone", bn: "হ্যাঁ, ধারালো কিছু দেখলে মনে হয় কাউকে আঘাত করে বসবো কিনা" }, score: 3, tags: ["ocd_harm"] }, { text: { en: "Occasional anger-driven aggressive thoughts", bn: "রাগ হলে সাময়িক মারপিটের চিন্তা আসে" }, score: 1, tags: ["normal_anger"] }, { text: { en: "No such thoughts", bn: "না, এমন হিংস্র চিন্তা আসে না" }, score: 0, tags: [] } ] },
    { id: "ocd_9", segmentId: "ocd", text: { en: "How does this affect your work, studies, or family life?", bn: "এই অভ্যাস পড়াশোনা, চাকরি বা পারিবারিক জীবনে কেমন প্রভাব ফেলছে?" }, options: [ { text: { en: "Severely affected, I'm constantly late or can't function", bn: "হাত ধুতে বা চেক করতেই অফিসে বা ক্লাসে দেরি হয়ে যায়" }, score: 3, tags: ["ocd_severe_impairment"] }, { text: { en: "Moderately affected", bn: "কাজের গতি কমে যায় বা লোকে খুতখুতে বলে" }, score: 2, tags: ["ocd_moderate_impairment"] }, { text: { en: "Mildly affected", bn: "সামান্য প্রভাব পড়ে" }, score: 1, tags: ["ocd_mild_impairment"] }, { text: { en: "Not affected", bn: "কোনো নেতিবাচক প্রভাব নেই" }, score: 0, tags: [] } ] },
    { id: "ocd_10", segmentId: "ocd", text: { en: "How rational do you think your thoughts and rituals are?", bn: "এই অবাধ্য চিন্তা বা কাজগুলোকে কতটা যৌক্তিক মনে করেন?" }, options: [ { text: { en: "I know it's irrational but can't stop", bn: "জানি ১০ বার হাত ধোয়া বা ৫ বার তালা চেক করা পাগলামি, তবুও থামাতে পারি না" }, score: 3, tags: ["ocd_good_insight"] }, { text: { en: "I think it's necessary and logical", bn: "আমি যা করছি তা সম্পূর্ণ ঠিক এবং বিপদ থেকে বাঁচতে এটি দরকার" }, score: 2, tags: ["ocd_poor_insight"] }, { text: { en: "I've never thought about it", bn: "এ বিষয়ে কখনো ভেবে দেখিনি" }, score: 1, tags: ["ocd_unknown_insight"] } ] },
    { id: "ocd_11", segmentId: "ocd", text: { en: "Do you count things or repeat words mentally?", bn: "কোনো কিছু বারবার গোনার বা মনে মনে শব্দ রিপিট করার অভ্যাস আছে?" }, options: [ { text: { en: "Yes, constant counting — tiles, car plates, etc.", bn: "হ্যাঁ, রাস্তায় গাড়ির নাম্বার বা টাইলস না গুণলে মন শান্ত হয় না" }, score: 3, tags: ["ocd_counting"] }, { text: { en: "Only when doing math or studying", bn: "শুধু পড়াশোনা বা হিসাবের সময় গুনি" }, score: 1, tags: ["normal_counting"] }, { text: { en: "No counting habits", bn: "না, এমন গোনার অভ্যাস নেই" }, score: 0, tags: [] } ] },
    { id: "ocd_12", segmentId: "ocd", text: { en: "Did this start in childhood or adolescence?", bn: "সমস্যাটি কি শৈশব বা কৈশোর থেকে শুরু হয়েছিল?" }, options: [ { text: { en: "Yes, since childhood", bn: "হ্যাঁ, ছোটবেলা থেকেই অতিরিক্ত পরিষ্কার থাকা বা খুতখুতানি ছিল" }, score: 3, tags: ["ocd_early_onset"] }, { text: { en: "Started recently after a stressful event", bn: "না, সাম্প্রতিক কোনো বড় মানসিক চাপের পর হুট করে শুরু হয়েছে" }, score: 2, tags: ["ocd_adult_onset"] }, { text: { en: "No such problem at all", bn: "আমার এমন কোনো সমস্যা নেই" }, score: 0, tags: [] } ] },
    { id: "ocd_13", segmentId: "ocd", text: { en: "Does this cause conflicts with family or friends?", bn: "এই অভ্যাসের কারণে পরিবার বা বন্ধুদের সাথে প্রায়ই ঝগড়া হয়?" }, options: [ { text: { en: "Yes, I force others to follow my rules", bn: "হ্যাঁ, অন্যদেরও আমার নিয়ম মেনে চলতে বাধ্য করি" }, score: 3, tags: ["ocd_family_conflict"] }, { text: { en: "No, I keep it to myself", bn: "না, খুতখুতানি নিজের মধ্যেই সীমাবদ্ধ রাখি" }, score: 1, tags: ["ocd_internalized"] }, { text: { en: "No conflicts", bn: "এমন পরিস্থিতি তৈরি হয় না" }, score: 0, tags: [] } ] },
    { id: "ocd_14", segmentId: "ocd", text: { en: "How many times do you check your work before finishing?", bn: "কোনো কাজ শেষ করার আগে কতবার রি-চেক করেন?" }, options: [ { text: { en: "Countless times, I can't submit due to fear of errors", bn: "বারবার পড়তে থাকি, ভুল রয়ে গেল কিনা এই ভয়ে পাঠাতেই পারি না" }, score: 3, tags: ["ocd_checking"] }, { text: { en: "1-2 times", bn: "সাধারণত একবার বা দুবার চোখ বুলিয়ে নিই" }, score: 1, tags: ["normal_proofreading"] }, { text: { en: "I send without checking", bn: "চেক না করেই পাঠিয়ে দিই" }, score: 0, tags: [] } ] },
    { id: "ocd_15", segmentId: "ocd", text: { en: "Do you have physical tics or unusual movements to ward off thoughts?", bn: "খারাপ চিন্তা থেকে বাঁচতে কোনো অদ্ভুত শারীরিক অঙ্গভঙ্গি বা টিক করেন?" }, options: [ { text: { en: "Yes, head shaking, eye blinking or vocalizations", bn: "হ্যাঁ, মাথায় খারাপ চিন্তা আসলে জোরে মাথা ঝাঁকাই বা অদ্ভুত আওয়াজ করি" }, score: 3, tags: ["ocd_tics"] }, { text: { en: "Sometimes", bn: "মাঝে মাঝে" }, score: 1, tags: ["ocd_tics_mild"] }, { text: { en: "No, no physical tics", bn: "না, শুধু মনের চিন্তায় অস্থির থাকি" }, score: 0, tags: [] } ] }
  ],
  trauma: [
    { id: "tr_1", segmentId: "trauma", text: { en: "Have you experienced a traumatic event that still affects you?", bn: "জীবনে কোনো ভয়াবহ দুর্ঘটনা, নির্যাতন বা প্রিয়জনের মৃত্যুর গভীর দাগ আছে?" }, options: [ { text: { en: "Yes, and it still deeply affects me", bn: "হ্যাঁ, সেই ঘটনার কথা মনে পড়লে আজও আতঙ্কে শিউরে উঠি" }, score: 3, tags: ["trauma_history", "ptsd"] }, { text: { en: "Some difficult experiences but manageable", bn: "হ্যাঁ, তবে তেমন বড় কিছু নয়" }, score: 1, tags: ["normal_stress"] }, { text: { en: "No major trauma", bn: "না, বড় কোনো ট্রমা নেই" }, score: 0, tags: [] } ] },
    { id: "tr_2", segmentId: "trauma", text: { en: "Do you have flashbacks or nightmares about the traumatic event?", bn: "সেই ভয়াবহ ঘটনার স্মৃতি কি হুট করে জীবন্ত হয়ে ফিরে আসে?" }, options: [ { text: { en: "Yes, frequent flashbacks and nightmares", bn: "হ্যাঁ, দিনে মনে হয় আবার সেই বিপদে আছি, রাতে দুঃস্বপ্ন দেখি" }, score: 3, tags: ["ptsd_flashbacks", "ptsd"] }, { text: { en: "Occasionally remember and feel bad", bn: "মাঝে মাঝে মনে পড়লে খারাপ লাগে, তবে অতীত বলে জানি" }, score: 1, tags: ["normal_grief"] }, { text: { en: "No flashbacks", bn: "না, অতীত আমাকে ডিস্টার্ব করে না" }, score: 0, tags: [] } ] },
    { id: "tr_3", segmentId: "trauma", text: { en: "Do you avoid places, people, or conversations related to the trauma?", bn: "ট্রমার সাথে জড়িত জায়গা, মানুষ বা কথাবার্তা ইচ্ছাকৃতভাবে এড়িয়ে চলেন?" }, options: [ { text: { en: "Yes, I completely avoid anything related", bn: "হ্যাঁ, ওই রাস্তা বা ওই ঘটনা মনে করায় এমন যেকোনো কিছু থেকে দূরে থাকি" }, score: 3, tags: ["ptsd_avoidance", "ptsd"] }, { text: { en: "Somewhat avoid but can manage", bn: "একটু খারাপ লাগলেও স্বাভাবিকভাবে সব জায়গায় যেতে পারি" }, score: 1, tags: ["avoidance_mild"] }, { text: { en: "No avoidance", bn: "ওসব নিয়ে ভাবিই না" }, score: 0, tags: [] } ] },
    { id: "tr_4", segmentId: "trauma", text: { en: "Do you feel detached from reality or your body?", bn: "চারপাশের পরিবেশ বা নিজের অস্তিত্ব নিয়ে কোনো অদ্ভুত বিভ্রম হয়?" }, options: [ { text: { en: "Yes, I feel outside my body, everything seems unreal", bn: "হ্যাঁ, মনে হয় নিজের শরীর থেকে আলাদা হয়ে ওপর থেকে নিজেকে দেখছি" }, score: 3, tags: ["dissociation", "depersonalization", "ptsd"] }, { text: { en: "Sometimes, especially under stress", bn: "মাঝে মাঝে, বিশেষত চাপের সময়" }, score: 1, tags: ["dissociation_mild"] }, { text: { en: "No, fully connected to reality", bn: "না, বাস্তবতার সাথে পুরোপুরি যুক্ত আছি" }, score: 0, tags: [] } ] },
    { id: "tr_5", segmentId: "trauma", text: { en: "Do you hear voices that others don't hear?", bn: "এমন কোনো কণ্ঠস্বর বা আওয়াজ শুনতে পান যা অন্যরা শুনতে পায় না?" }, options: [ { text: { en: "Yes, I hear voices clearly", bn: "হ্যাঁ, স্পষ্ট শুনি কেউ আমার নাম ধরে ডাকছে বা কথা বলছে" }, score: 3, tags: ["psychosis_auditory", "schizophrenia"] }, { text: { en: "Only when falling asleep or waking up", bn: "শুধু ঘুমের ঘোরে বা জাস্ট ঘুম ভাঙার মুহূর্তে হালকা ভ্রম হয়" }, score: 1, tags: ["hypnagogic", "normal"] }, { text: { en: "No, I don't hear anything unusual", bn: "না, অবাস্তব কোনো আওয়াজ শুনি না" }, score: 0, tags: [] } ] },
    { id: "tr_6", segmentId: "trauma", text: { en: "Do you see things that others don't see?", bn: "চোখের সামনে এমন কিছু দেখেন যা অন্যরা দেখতে পায় না?" }, options: [ { text: { en: "Yes, I see clear shapes or people", bn: "হ্যাঁ, ঘরে বা বাইরে কিছু আকৃতি বা মৃত মানুষের অবয়ব স্পষ্ট দেখি" }, score: 3, tags: ["psychosis_visual", "schizophrenia"] }, { text: { en: "Sometimes shadows or optical illusions", bn: "অন্ধকারে মাঝে মাঝে কাপড়কে মানুষ মনে করে ভুল হয়" }, score: 1, tags: ["illusions", "normal"] }, { text: { en: "No, I don't see anything unusual", bn: "না, অবাস্তব কিছু দেখি না" }, score: 0, tags: [] } ] },
    { id: "tr_7", segmentId: "trauma", text: { en: "Do you have beliefs others consider strange or unrealistic?", bn: "এমন কোনো গভীর বিশ্বাস আছে যা সবাই ভুল বললেও আপনি সত্য মনে করেন?" }, options: [ { text: { en: "Yes, I believe people are spying on or plotting against me", bn: "হ্যাঁ, কোনো অদৃশ্য শক্তি বা মানুষ আমার ওপর ২৪ ঘণ্টা নজর রাখছে" }, score: 3, tags: ["paranoia", "delusion_persecutory", "psychosis"] }, { text: { en: "Yes, I have special powers or a special mission", bn: "হ্যাঁ, আমি অতিপ্রাকৃতিক ক্ষমতার অধিকারী বা ঈশ্বর আমাকে বিশেষ মিশন দিয়ে পাঠিয়েছেন" }, score: 3, tags: ["delusion_grandeur", "psychosis"] }, { text: { en: "No unusual beliefs", bn: "না, এমন অদ্ভুত বিশ্বাস নেই" }, score: 0, tags: [] } ] },
    { id: "tr_8", segmentId: "trauma", text: { en: "Do you think media messages are directed at you personally?", bn: "টিভির নিউজ বা সোশ্যাল মিডিয়ার পোস্ট কি আপনাকে উদ্দেশ্য করে মনে হয়?" }, options: [ { text: { en: "Yes, news or posts contain hidden messages for me", bn: "হ্যাঁ, টিভির নিউজ বা পোস্টগুলো আমাকে উদ্দেশ্য করে কোড বা সংকেত দেওয়া হচ্ছে" }, score: 3, tags: ["delusion_reference", "psychosis"] }, { text: { en: "Sometimes I notice coincidences", bn: "মাঝে মাঝে কোনো পোস্ট আমার জীবনের সাথে মিলে গেলে কাকতালীয় মনে করি" }, score: 1, tags: ["normal_coincidence"] }, { text: { en: "No, just general information", bn: "ওগুলো সাধারণ তথ্য, আমার সাথে কোনো ব্যক্তিগত সম্পর্ক নেই" }, score: 0, tags: [] } ] },
    { id: "tr_9", segmentId: "trauma", text: { en: "Do you feel your thoughts are being stolen or inserted?", bn: "মনে হয় কেউ আপনার চিন্তা চুরি করছে বা বাইরে থেকে চিন্তা ঢুকিয়ে দিচ্ছে?" }, options: [ { text: { en: "Yes, someone is controlling my thoughts", bn: "হ্যাঁ, কোনো চিপ বা ওয়েভ দিয়ে আমার চিন্তা নিয়ন্ত্রণ করা হচ্ছে" }, score: 3, tags: ["thought_insertion", "thought_broadcasting", "psychosis"] }, { text: { en: "No, my thoughts are entirely my own", bn: "না, আমার চিন্তা একান্তই আমার নিজের" }, score: 0, tags: [] } ] },
    { id: "tr_10", segmentId: "trauma", text: { en: "Can others easily follow your speech?", bn: "কথা বলার সময় অন্যরা আপনার কথার খেই সহজে ধরতে পারে?" }, options: [ { text: { en: "No, I jump from topic to topic confusingly", bn: "অনেকেই বলে আমি এক কথা থেকে সম্পর্কহীন অন্য কথায় চলে যাই" }, score: 3, tags: ["disorganized_speech", "psychosis"] }, { text: { en: "Sometimes, especially when nervous", bn: "নার্ভাস থাকলে মাঝে মাঝে আমতা আমতা করি" }, score: 1, tags: ["normal_anxiety"] }, { text: { en: "Yes, I speak clearly and coherently", bn: "আমি গুছিয়ে কথা বলতে পারি" }, score: 0, tags: [] } ] },
    { id: "tr_11", segmentId: "trauma", text: { en: "Has your emotional expression changed?", bn: "আবেগ প্রকাশ বা মুখের অভিব্যক্তিতে বড় কোনো পরিবর্তন এসেছে?" }, options: [ { text: { en: "I feel no emotions, my face is expressionless", bn: "কোনো সুখ, দুঃখ কাজ করে না; মুখ রোবটের মতো ভাবলেশহীন থাকে" }, score: 3, tags: ["flat_affect", "negative_symptoms", "psychosis"] }, { text: { en: "I express emotions somewhat less", bn: "একটু কম আবেগপ্রবণ মানুষ" }, score: 1, tags: ["introvert"] }, { text: { en: "Normal emotional expression", bn: "পরিস্থিতি অনুযায়ী রাগ, আনন্দ বা দুঃখ স্বাভাবিকভাবে প্রকাশ পায়" }, score: 0, tags: [] } ] },
    { id: "tr_12", segmentId: "trauma", text: { en: "How is your personal hygiene and self-care?", bn: "ব্যক্তিগত পরিষ্কার-পরিচ্ছন্নতা বা সেলফ-কেয়ারের বর্তমান অবস্থা কেমন?" }, options: [ { text: { en: "I don't bathe or take care of myself for days", bn: "দিনের পর দিন গোসল করি না, চুল আঁচড়াই না বা কাপড়ের যত্ন নিই না" }, score: 3, tags: ["avolition", "severe_depression", "psychosis"] }, { text: { en: "Sometimes neglect self-care due to laziness", bn: "মাঝে মাঝে অলসতায় একটু দেরি হয়" }, score: 1, tags: ["self_care_mild"] }, { text: { en: "Regular self-care routine", bn: "নিয়মিত পরিষ্কার-পরিচ্ছন্নতার দিকে খেয়াল রাখি" }, score: 0, tags: [] } ] },
    { id: "tr_13", segmentId: "trauma", text: { en: "Are you constantly in a state of fear or hypervigilance?", bn: "সারাক্ষণ তীব্র ভয়ার্ত বা সতর্ক অবস্থায় থাকেন, যেন কেউ আক্রমণ করবে?" }, options: [ { text: { en: "Yes, always watchful, check exits and surroundings", bn: "হ্যাঁ, ঘরে থাকলেও দরজার দিকে তাকিয়ে থাকি, রাস্তায় বারবার পেছনে তাকাই" }, score: 3, tags: ["hypervigilance", "ptsd", "paranoia"] }, { text: { en: "Sometimes cautious in unfamiliar places", bn: "অপরিচিত বা অন্ধকার এলাকায় একটু সতর্ক থাকি" }, score: 1, tags: ["normal_safety"] }, { text: { en: "No, I feel safe", bn: "না, নিরাপদ পরিবেশে বেশ রিল্যাক্সড থাকি" }, score: 0, tags: [] } ] },
    { id: "tr_14", segmentId: "trauma", text: { en: "Do you sometimes freeze or become completely immobile?", bn: "মাঝে মাঝে শরীর শক্ত বা জড় হয়ে দীর্ঘক্ষণ পাথরের মতো থাকেন?" }, options: [ { text: { en: "Yes, I freeze for long periods uncontrollably", bn: "হ্যাঁ, শরীর কোনো নির্দেশ শোনে না, ঘণ্টার পর ঘণ্টা স্তব্ধ হয়ে থাকি" }, score: 3, tags: ["catatonia", "psychosis"] }, { text: { en: "No, I don't have such episodes", bn: "না, শরীরে এমন জড়তা হয় না" }, score: 0, tags: [] } ] },
    { id: "tr_15", segmentId: "trauma", text: { en: "Has this completely isolated you from family and friends?", bn: "এই অদ্ভুত অভিজ্ঞতা বা লক্ষণগুলো কি পরিবার ও বন্ধুদের সাথে সম্পর্ক বিচ্ছিন্ন করেছে?" }, options: [ { text: { en: "Yes, I've completely withdrawn from everyone", bn: "হ্যাঁ, সমাজ ও পরিবার থেকে পুরোপুরি গুটিয়ে নিয়েছি, কেউ আমাকে বোঝে না" }, score: 3, tags: ["social_isolation", "severe_psychosis"] }, { text: { en: "Somewhat isolated", bn: "কিছুটা বিচ্ছিন্ন হয়ে পড়েছি" }, score: 1, tags: ["isolation_mild"] }, { text: { en: "No, I maintain relationships", bn: "না, কষ্ট সত্ত্বেও পরিবার ও বন্ধুদের সাথে যোগাযোগ বজায় রেখেছি" }, score: 0, tags: [] } ] }
  ],
  borderline: [
    { id: "bpd_1", segmentId: "borderline", text: { en: "Do you have intense, unstable relationships?", bn: "সম্পর্কের ক্ষেত্রে চরম অস্থিরতা আছে?" }, options: [ { text: { en: "Yes, I idealize people then suddenly hate them", bn: "হ্যাঁ, হুট করে কাউকে দেবতাতুল্য মনে হয়, আবার হুট করে চরম ঘৃণা করি" }, score: 3, tags: ["bpd_relationships"] }, { text: { en: "Some relationship instability", bn: "কিছুটা অস্থিরতা আছে" }, score: 1, tags: ["bpd_mild"] }, { text: { en: "Stable relationships", bn: "সম্পর্ক স্থিতিশীল" }, score: 0, tags: [] } ] },
    { id: "bpd_2", segmentId: "borderline", text: { en: "Do you experience intense anger or difficulty controlling it?", bn: "তীব্র রাগ হয় বা রাগ নিয়ন্ত্রণে কষ্ট হয়?" }, options: [ { text: { en: "Yes, I have extreme anger outbursts", bn: "হ্যাঁ, চরম রাগের বিস্ফোরণ হয়" }, score: 3, tags: ["bpd_anger"] }, { text: { en: "Sometimes I get very angry", bn: "মাঝে মাঝে খুব রাগ হয়" }, score: 1, tags: ["bpd_anger_mild"] }, { text: { en: "I can control my anger", bn: "রাগ নিয়ন্ত্রণ করতে পারি" }, score: 0, tags: [] } ] },
    { id: "bpd_3", segmentId: "borderline", text: { en: "Do you have an unstable sense of who you are?", bn: "নিজের সম্পর্কে ধারণা প্রায়ই বদলায়?" }, options: [ { text: { en: "Yes, I don't know who I am", bn: "হ্যাঁ, আমি কে তা বুঝতে পারি না" }, score: 3, tags: ["bpd_identity"] }, { text: { en: "Sometimes I question my identity", bn: "মাঝে মাঝে নিজেকে নিয়ে সন্দেহ হয়" }, score: 1, tags: ["identity_issue_mild"] }, { text: { en: "I have a stable sense of self", bn: "নিজের সম্পর্কে স্পষ্ট ধারণা আছে" }, score: 0, tags: [] } ] },
    { id: "bpd_4", segmentId: "borderline", text: { en: "Do you engage in impulsive, self-damaging behaviors?", bn: "নিজের ক্ষতি করে এমন হঠকারী কাজ করেন?" }, options: [ { text: { en: "Yes, self-harm, binge eating, or substance use", bn: "হ্যাঁ, নিজের হাত কাটা, বেশি খাওয়া, ড্রাগ ব্যবহার" }, score: 3, tags: ["bpd_impulsivity", "self_harm"] }, { text: { en: "Sometimes I do risky things impulsively", bn: "মাঝে মাঝে ঝুঁকিপূর্ণ কাজ করি" }, score: 1, tags: ["impulsivity_mild"] }, { text: { en: "No impulsive behaviors", bn: "হঠকারী কাজ করি না" }, score: 0, tags: [] } ] },
    { id: "bpd_5", segmentId: "borderline", text: { en: "Do you feel chronically empty or fear being abandoned?", bn: "শূন্যতা অনুভব করেন বা সবাই আপনাকে ছেড়ে যাবে এই ভয় পান?" }, options: [ { text: { en: "Yes, constant emptiness and fear of being left", bn: "হ্যাঁ, সারাক্ষণ শূন্যতা লাগে এবং ভয় হয় সবাই ছেড়ে চলে যাবে" }, score: 3, tags: ["bpd_emptiness", "abandonment_fear"] }, { text: { en: "Sometimes feel empty or afraid", bn: "মাঝে মাঝে শূন্যতা বা ভয় লাগে" }, score: 1, tags: ["emptiness_mild"] }, { text: { en: "No, I feel fine", bn: "না, তেমন কিছু লাগে না" }, score: 0, tags: [] } ] }
  ],
  narcissistic: [
    { id: "npd_1", segmentId: "narcissistic", text: { en: "Do you feel you are more important or special than others?", bn: "নিজেকে অন্যদের চেয়ে বেশি গুরুত্বপূর্ণ বা বিশেষ মনে করেন?" }, options: [ { text: { en: "Yes, I'm special and uniquely capable", bn: "হ্যাঁ, আমি স্পেশাল এবং শুধু আমিই কিছু বুঝি" }, score: 3, tags: ["npd_grandiosity"] }, { text: { en: "Sometimes I think I'm better than others", bn: "মাঝে মাঝে নিজেকে ভালো মনে হয়" }, score: 1, tags: ["npd_mild"] }, { text: { en: "I see myself as equal to others", bn: "নিজেকে অন্যদের সমান মনে করি" }, score: 0, tags: [] } ] },
    { id: "npd_2", segmentId: "narcissistic", text: { en: "Do you constantly seek admiration and attention?", bn: "সব সময় প্রশংসা এবং মনোযোগ খোঁজেন?" }, options: [ { text: { en: "Yes, I need constant praise to feel okay", bn: "হ্যাঁ, সব সময় প্রশংসার প্রয়োজন" }, score: 3, tags: ["npd_attention"] }, { text: { en: "I enjoy attention but don't need it", bn: "মনোযোগ পেতে ভালো লাগে, কিন্তু প্রয়োজন নেই" }, score: 1, tags: ["attention_seeking_mild"] }, { text: { en: "I'm content without constant praise", bn: "প্রশংসা ছাড়াও সন্তুষ্ট থাকি" }, score: 0, tags: [] } ] },
    { id: "npd_3", segmentId: "narcissistic", text: { en: "Do you lack empathy for others' feelings?", bn: "অন্যদের অনুভূতি বুঝতে বা পরোয়া করতে কষ্ট হয়?" }, options: [ { text: { en: "Yes, I don't care much about others' feelings", bn: "হ্যাঁ, অন্যদের অনুভূতি নিয়ে আমার তেমন চিন্তা নেই" }, score: 3, tags: ["npd_empathy"] }, { text: { en: "Sometimes I struggle to empathize", bn: "মাঝে মাঝে বুঝতে কষ্ট হয়" }, score: 1, tags: ["empathy_mild"] }, { text: { en: "I'm empathetic towards others", bn: "অন্যদের প্রতি সহানুভূতিশীল" }, score: 0, tags: [] } ] },
    { id: "npd_4", segmentId: "narcissistic", text: { en: "Do you believe others should always follow your rules?", bn: "মনে করেন সবাই আপনার নিয়ম মেনে চলা উচিত?" }, options: [ { text: { en: "Yes, I expect others to obey me", bn: "হ্যাঁ, সবাই আমার কথা শুনবে এই প্রত্যাশা থাকে" }, score: 3, tags: ["npd_control"] }, { text: { en: "Sometimes I want things my way", bn: "মাঝে মাঝে নিজের মতো করতে চাই" }, score: 1, tags: ["control_mild"] }, { text: { en: "I respect others' opinions", bn: "অন্যদের মতামত সম্মান করি" }, score: 0, tags: [] } ] },
    { id: "npd_5", segmentId: "narcissistic", text: { en: "Do you feel envious of others or believe others envy you?", bn: "অন্যদের প্রতি ঈর্ষা বোধ করেন বা মনে করেন তারা আপনাকে ঈর্ষা করে?" }, options: [ { text: { en: "Yes, frequently envious or believe others envy me", bn: "হ্যাঁ, প্রায়ই ঈর্ষা করি বা মনে করি অন্যরা আমাকে ঈর্ষা করে" }, score: 3, tags: ["npd_envy"] }, { text: { en: "Sometimes I feel envious", bn: "মাঝে মাঝে ঈর্ষা লাগে" }, score: 1, tags: ["envy_mild"] }, { text: { en: "No envy, I'm content", bn: "না, সন্তুষ্ট আছি" }, score: 0, tags: [] } ] }
  ],
  eating: [
    { id: "eat_1", segmentId: "eating", text: { en: "Are you extremely concerned about your weight and body shape?", bn: "নিজের ওজন এবং শরীরের আকৃতি নিয়ে চরম উদ্বিগ্ন?" }, options: [ { text: { en: "Yes, constantly worried about weight", bn: "হ্যাঁ, সারাক্ষণ ওজন নিয়ে চিন্তা করি" }, score: 3, tags: ["eating_concern"] }, { text: { en: "Sometimes worry about weight", bn: "মাঝে মাঝে চিন্তা করি" }, score: 1, tags: ["eating_concern_mild"] }, { text: { en: "I'm comfortable with my body", bn: "শরীর নিয়ে সন্তুষ্ট" }, score: 0, tags: [] } ] },
    { id: "eat_2", segmentId: "eating", text: { en: "Do you severely restrict your food intake?", bn: "ওজন বাড়ার ভয়ে খুব কম খাবার খান?" }, options: [ { text: { en: "Yes, I eat very little to avoid gaining weight", bn: "হ্যাঁ, ওজন বাড়ার ভয়ে খুব কম খাই" }, score: 3, tags: ["anorexia"] }, { text: { en: "Sometimes skip meals", bn: "মাঝে মাঝে খাবার এড়িয়ে চলি" }, score: 1, tags: ["restriction_mild"] }, { text: { en: "I eat normally", bn: "স্বাভাবিক খাই" }, score: 0, tags: [] } ] },
    { id: "eat_3", segmentId: "eating", text: { en: "Do you binge eat and then feel guilty?", bn: "প্রচুর খেয়ে ফেলেন এবং পরে অপরাধবোধ করেন?" }, options: [ { text: { en: "Yes, I binge and then feel terrible", bn: "হ্যাঁ, অনেক খেয়ে ফেলি এবং পরে খুব খারাপ অনুভব করি" }, score: 3, tags: ["bulimia", "binge_eating"] }, { text: { en: "Sometimes I overeat and feel guilty", bn: "মাঝে মাঝে বেশি খাই এবং অপরাধবোধ হয়" }, score: 1, tags: ["overeating_mild"] }, { text: { en: "No binge eating", bn: "না, বেশি খাই না" }, score: 0, tags: [] } ] },
    { id: "eat_4", segmentId: "eating", text: { en: "Do you vomit or use laxatives after eating?", bn: "খাওয়ার পর বমি করেন বা রেচক ব্যবহার করেন?" }, options: [ { text: { en: "Yes, I force myself to vomit", bn: "হ্যাঁ, জোর করে বমি করি" }, score: 3, tags: ["bulimia_purging"] }, { text: { en: "Sometimes try to undo the eating", bn: "মাঝে মাঝে খাবার নষ্ট করার চেষ্টা করি" }, score: 1, tags: ["purging_mild"] }, { text: { en: "No purging behaviors", bn: "না, এমন কিছু করি না" }, score: 0, tags: [] } ] },
    { id: "eat_5", segmentId: "eating", text: { en: "Do you see yourself as overweight even when others say you're not?", bn: "অন্যরা পাতলা বললেও নিজেকে মোটা মনে করেন?" }, options: [ { text: { en: "Yes, I always see myself as fat", bn: "হ্যাঁ, সব সময় নিজেকে মোটা দেখি" }, score: 3, tags: ["body_dysmorphia", "anorexia"] }, { text: { en: "Sometimes think I'm overweight", bn: "মাঝে মাঝে মোটা মনে হয়" }, score: 1, tags: ["body_image_mild"] }, { text: { en: "I see myself realistically", bn: "নিজেকে বাস্তবসম্মতভাবে দেখি" }, score: 0, tags: [] } ] }
  ],
  maladaptive: [
    { id: "md_1", segmentId: "maladaptive", text: { en: "Do you spend hours lost in fantasy or imaginary worlds?", bn: "মনের ভেতর কল্পনার জগতে ঘণ্টার পর ঘণ্টা হারিয়ে যান?" }, options: [ { text: { en: "Yes, 2+ hours daily in fantasy", bn: "হ্যাঁ, প্রতিদিন ২+ ঘণ্টা কল্পনায় কাটাই" }, score: 3, tags: ["maladaptive_daydreaming"] }, { text: { en: "Sometimes daydream excessively", bn: "মাঝে মাঝে বেশি কল্পনা করি" }, score: 1, tags: ["daydreaming_mild"] }, { text: { en: "No, I don't daydream excessively", bn: "না, বেশি কল্পনা করি না" }, score: 0, tags: [] } ] },
    { id: "md_2", segmentId: "maladaptive", text: { en: "Is it difficult to stop daydreaming and focus on reality?", bn: "কল্পনা বন্ধ করে বাস্তবে মনোযোগ দিতে কষ্ট হয়?" }, options: [ { text: { en: "Yes, I can't control when I start", bn: "হ্যাঁ, কল্পনা শুরু হলে থামাতে পারি না" }, score: 3, tags: ["md_control"] }, { text: { en: "Sometimes I struggle to stop", bn: "মাঝে মাঝে থামাতে কষ্ট হয়" }, score: 1, tags: ["md_control_mild"] }, { text: { en: "I can stop when needed", bn: "প্রয়োজন হলে থামাতে পারি" }, score: 0, tags: [] } ] },
    { id: "md_3", segmentId: "maladaptive", text: { en: "Does daydreaming interfere with work, studies, or relationships?", bn: "এই কল্পনার অভ্যাস পড়াশোনা, কাজ বা সম্পর্ককে ব্যাহত করছে?" }, options: [ { text: { en: "Yes, I miss deadlines and neglect people", bn: "হ্যাঁ, কাজ শেষ হয় না, মানুষের সাথে যোগাযোগ কমে গেছে" }, score: 3, tags: ["md_impairment"] }, { text: { en: "Sometimes affects productivity", bn: "মাঝে মাঝে কাজে প্রভাব পড়ে" }, score: 1, tags: ["md_impairment_mild"] }, { text: { en: "No, it doesn't affect my life", bn: "না, জীবনে কোনো প্রভাব নেই" }, score: 0, tags: [] } ] },
    { id: "md_4", segmentId: "maladaptive", text: { en: "Do you make sounds, gestures, or expressions while daydreaming?", bn: "কল্পনা করার সময় শব্দ, অঙ্গভঙ্গি বা মুখের ভাব করেন?" }, options: [ { text: { en: "Yes, I talk or move while daydreaming", bn: "হ্যাঁ, কল্পনা করার সময় কথা বলি বা নড়াচড়া করি" }, score: 3, tags: ["md_physical"] }, { text: { en: "Sometimes I make expressions", bn: "মাঝে মাঝে মুখের ভাব বদলায়" }, score: 1, tags: ["md_physical_mild"] }, { text: { en: "No, I daydream quietly", bn: "না, শান্তভাবে কল্পনা করি" }, score: 0, tags: [] } ] },
    { id: "md_5", segmentId: "maladaptive", text: { en: "Do you pace, rock, or make repetitive movements while daydreaming?", bn: "কল্পনার সময় নিজেকে হাঁটতে, দুলতে বা পুনরাবৃত্তিমূলক নড়াচড়া করতে দেখেন?" }, options: [ { text: { en: "Yes, I frequently pace or rock while daydreaming", bn: "হ্যাঁ, কল্পনা করার সময় প্রায়ই হাঁটি বা দুলতে থাকি" }, score: 3, tags: ["md_physical_movement", "maladaptive_daydreaming"] }, { text: { en: "Sometimes small movements or gestures", bn: "মাঝে মাঝে ছোটখাটো নড়াচড়া করি" }, score: 2, tags: ["md_movement_mild"] }, { text: { en: "Rarely, some physical restlessness", bn: "খুব কম, কিছু শারীরিক অস্থিরতা লক্ষ্য করি" }, score: 1, tags: ["md_restlessness"] }, { text: { en: "No, I daydream completely still", bn: "না, সম্পূর্ণ স্থির হয়ে কল্পনা করি" }, score: 0, tags: [] } ] }
  ]
};

// ===== SEGMENT LABELS (FOR INTERNAL USE ONLY - NOT SHOWN TO USER) =====
const SEGMENT_LABELS = {
  mood: { en: "Mood & Affect", bn: "মেজাজ", code: "MD" },
  anxiety: { en: "Anxiety", bn: "উদ্বেগ", code: "AX" },
  ocd: { en: "Intrusive Patterns", bn: "অনুপ্রবেশী", code: "OC" },
  trauma: { en: "Trauma & Perception", bn: "ট্রমা", code: "TR" },
  borderline: { en: "Emotional Regulation", bn: "আবেগ", code: "BP" },
  narcissistic: { en: "Self-Concept", bn: "আত্ম-ধারণা", code: "NP" },
  eating: { en: "Eating Patterns", bn: "খাদ্যাভ্যাস", code: "ED" },
  maladaptive: { en: "Inner World", bn: "অভ্যন্তরীণ", code: "MW" },
};

// ===== FONT STYLES =====
const FontStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,500&family=Noto+Serif+Bengali:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    .cf-root { font-family: 'Fraunces', 'Noto Serif Bengali', Georgia, serif; }
    .cf-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.07em; }
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
    @keyframes cfFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  `}</style>
);

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

  const segmentKeys = Object.keys(SEGMENT_QUESTIONS);
  const currentSegmentId = segmentKeys[currentSegment];
  const currentQuestions = SEGMENT_QUESTIONS[currentSegmentId] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = Object.values(SEGMENT_QUESTIONS).reduce((a, q) => a + q.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const l = language;
  const letters = ["A", "B", "C", "D"];

  // Severity helpers
  const sev = (s: string) => ({ High: "text-[#8b2e2e]", Moderate: "text-[#9a5d1f]", Mild: "text-[#8a6d3b]" }[s] || "text-[#5a4a2f]");
  const sevBg = (s: string) => ({ High: "border-[#8b2e2e]/50 bg-[#f6e3e0]", Moderate: "border-[#9a5d1f]/50 bg-[#f6ead9]", Mild: "border-[#8a6d3b]/50 bg-[#f7f0de]" }[s] || "border-[#c4a45c]/40 bg-[#f4ecdb]");

  // Navigation
  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(p => p + 1);
    } else if (currentSegment < segmentKeys.length - 1) {
      setCurrentSegment(p => p + 1);
      setCurrentQuestionIndex(0);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(p => p - 1);
    } else if (currentSegment > 0) {
      setCurrentSegment(p => p - 1);
      const prev = SEGMENT_QUESTIONS[segmentKeys[currentSegment - 1]];
      setCurrentQuestionIndex(prev.length - 1);
    }
  };

  const handleRetake = () => {
    setCurrentSegment(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setResult(null);
    setShowWelcome(true);
  };

  // ===== CALCULATE RESULTS =====
  const calculateResults = () => {
    setIsLoading(true);
    setTimeout(() => {
      const sm: SymptomMap = {
        depression: 0, anxiety: 0, ocd: 0, ptsd: 0, psychosis: 0, borderline: 0,
        narcissistic: 0, eating: 0, maladaptive: 0, dissociation: 0, panic: 0,
        social_anxiety: 0, bipolar: 0, insomnia: 0, suicidal: 0, self_harm: 0, anhedonia: 0, melancholic: 0
      };
      Object.values(SEGMENT_QUESTIONS).flat().forEach(q => {
        const s = answers[q.id];
        if (s !== undefined) {
          q.options.forEach(o => {
            if (o.score === s) o.tags.forEach(tag => {
              const k = tag.split('_')[0] as keyof SymptomMap;
              if (k in sm) sm[k]++;
            });
          });
        }
      });

      const findings: Finding[] = [];
      const critical: string[] = [];

      const add = (cond: string, sev: Finding["severity"], score: number, max: number, desc: string, rec: string, ex: Exercise[], ind: string[]) => {
        findings.push({ condition: cond, severity: sev, score, maxScore: max, description: desc, recommendation: rec, exercises: ex, indications: ind });
      };

      // Depression
      if (sm.depression >= 8) {
        add("Depression-related symptoms", "High", sm.depression, 15,
          "Brain neurotransmitters (serotonin, dopamine, norepinephrine) are imbalanced, affecting mood, sleep, appetite, and motivation.",
          "Consult a mental health professional. Practice Behavioral Activation and 'Three Good Things'.",
          EXERCISES.depression,
          ["Persistent low mood", "Loss of interest", "Fatigue", "Sleep disturbances"]);
        if (sm.suicidal > 0) critical.push("Suicidal thoughts detected — please seek immediate help.");
      } else if (sm.depression >= 4) {
        add("Depression-related symptoms", "Moderate", sm.depression, 15,
          "Signs of depression affecting mood and energy.",
          "Try recommended exercises and consider speaking with a therapist.",
          EXERCISES.depression,
          ["Low mood", "Reduced interest", "Fatigue"]);
      } else if (sm.depression >= 2) {
        add("Depression-related symptoms", "Mild", sm.depression, 15,
          "Mild depressive symptoms, often manageable with self-care.",
          "Practice the exercises and maintain a healthy routine.",
          EXERCISES.depression.slice(0, 2),
          ["Occasional low mood", "Mild fatigue"]);
      }

      // Anxiety
      if (sm.anxiety >= 8) {
        add("Anxiety-related symptoms", "High", sm.anxiety, 15,
          "Overactivation of the amygdala triggers 'fight or flight' even without real threats.",
          "Professional evaluation recommended. Practice 5-4-3-2-1 Grounding and Box Breathing.",
          EXERCISES.anxiety,
          ["Excessive worry", "Restlessness", "Physical tension", "Difficulty concentrating"]);
      } else if (sm.anxiety >= 4) {
        add("Anxiety-related symptoms", "Moderate", sm.anxiety, 15,
          "Moderate anxiety manageable with proper techniques.",
          "Practice grounding techniques and consider counseling.",
          EXERCISES.anxiety,
          ["Moderate worry", "Physical tension"]);
      } else if (sm.anxiety >= 2) {
        add("Anxiety-related symptoms", "Mild", sm.anxiety, 15,
          "Mild anxiety, normal and manageable.",
          "Try breathing and grounding exercises.",
          EXERCISES.anxiety.slice(0, 1),
          ["Mild worry", "Occasional tension"]);
      }

      // OCD
      if (sm.ocd >= 8) {
        add("OCD-related symptoms", "High", sm.ocd, 15,
          "Hyperactivity in the orbital frontal cortex and basal ganglia creates 'brain lock' — intrusive thoughts get stuck.",
          "CBT with ERP is recommended. Practice the Brain Lock technique.",
          EXERCISES.ocd,
          ["Recurring intrusive thoughts", "Repetitive behaviors", "Anxiety without rituals"]);
      } else if (sm.ocd >= 4) {
        add("OCD-related symptoms", "Moderate", sm.ocd, 15,
          "Moderate obsessive-compulsive patterns.",
          "Try ERP and consider consulting a therapist.",
          EXERCISES.ocd,
          ["Some intrusive thoughts", "Mild repetitive behaviors"]);
      } else if (sm.ocd >= 2) {
        add("OCD-related symptoms", "Mild", sm.ocd, 15,
          "Mild obsessive-compulsive tendencies.",
          "Practice Brain Lock when unwanted thoughts arise.",
          EXERCISES.ocd.slice(0, 1),
          ["Mild intrusive thoughts", "Occasional checking"]);
      }

      // PTSD
      if (sm.ptsd >= 4) {
        add("PTSD-related symptoms", "High", sm.ptsd, 8,
          "The brain's fear system stays stuck in an overactive state after trauma. Amygdala remains hypervigilant.",
          "Trauma-focused therapy strongly recommended. Consult a professional.",
          EXERCISES.ptsd,
          ["Flashbacks", "Avoidance", "Hypervigilance", "Emotional numbing"]);
      } else if (sm.ptsd >= 2) {
        add("PTSD-related symptoms", "Moderate", sm.ptsd, 8,
          "Signs of trauma-related distress.",
          "Consider therapy and try Butterfly Hug.",
          EXERCISES.ptsd,
          ["Some avoidance", "Occasional flashbacks"]);
      }

      // Psychosis
      if (sm.psychosis >= 3) {
        add("Psychosis-related symptoms", "High", sm.psychosis, 10,
          "Disruptions in dopamine signaling pathways affect perception, leading to hallucinations and delusions.",
          "URGENT: Please consult a psychiatrist immediately.",
          [],
          ["Hallucinations", "Delusions", "Disorganized thinking", "Paranoia"]);
        critical.push("Psychosis-related symptoms detected — seek immediate psychiatric evaluation.");
      }

      // Borderline
      if (sm.borderline >= 3) {
        add("Borderline Personality-related symptoms", "High", sm.borderline, 5,
          "Hypersensitivity in the amygdala and prefrontal cortex leads to intense emotional reactions.",
          "DBT is highly effective. Consult a mental health professional.",
          EXERCISES.borderline,
          ["Intense relationships", "Mood swings", "Fear of abandonment", "Impulsivity"]);
      } else if (sm.borderline >= 2) {
        add("Borderline Personality-related symptoms", "Moderate", sm.borderline, 5,
          "Some borderline personality traits present.",
          "Try TIPP technique for emotional regulation.",
          EXERCISES.borderline,
          ["Relationship instability", "Mood fluctuations"]);
      }

      // Narcissistic
      if (sm.narcissistic >= 3) {
        add("Narcissistic-related traits", "High", sm.narcissistic, 5,
          "Inflated self-image and difficulty with empathy often stem from deep-seated insecurities.",
          "Consider therapy to explore self-concept and relational patterns.",
          [],
          ["Grandiosity", "Need for admiration", "Lack of empathy"]);
      } else if (sm.narcissistic >= 2) {
        add("Narcissistic-related traits", "Moderate", sm.narcissistic, 5,
          "Some narcissistic traits present.",
          "Practice self-reflection and empathy exercises.",
          [],
          ["Some grandiosity", "Occasional lack of empathy"]);
      }

      // Eating Disorder
      if (sm.eating >= 3) {
        add("Eating Disorder-related symptoms", "High", sm.eating, 5,
          "Disruptions in brain reward and appetite centers combine with distorted body image.",
          "Consult a professional specializing in eating disorders.",
          [],
          ["Weight preoccupation", "Restrictive eating", "Binge-purge cycle", "Distorted body image"]);
        critical.push("Eating disorder symptoms detected — seek professional help.");
      } else if (sm.eating >= 2) {
        add("Eating Disorder-related symptoms", "Moderate", sm.eating, 5,
          "Concerns related to eating and body image.",
          "Consider speaking with a therapist about body image.",
          [],
          ["Weight concerns", "Some restriction"]);
      }

      // Maladaptive Daydreaming
      if (sm.maladaptive >= 3) {
        add("Maladaptive Daydreaming", "High", sm.maladaptive, 5,
          "The brain's default mode network becomes overactive, making fantasy a primary dopamine source.",
          "Set a 'daydreaming time' and practice grounding techniques.",
          [],
          ["Hours lost in fantasy", "Difficulty stopping", "Interferes with life", "Physical movements while daydreaming"]);
      } else if (sm.maladaptive >= 2) {
        add("Maladaptive Daydreaming", "Moderate", sm.maladaptive, 5,
          "Signs of excessive daydreaming.",
          "Practice Stop-Sign Technique, set boundaries.",
          [],
          ["Excessive daydreaming", "Some focus interference"]);
      }

      const high = findings.filter(f => f.severity === "High").length;
      const mod = findings.filter(f => f.severity === "Moderate").length;
      let riskLevel: AssessmentResult["riskLevel"] = "Low";
      if (critical.length > 0 || high >= 2) riskLevel = "High";
      else if (high >= 1) riskLevel = "Moderate";
      else if (mod >= 2) riskLevel = "Mild";

      const res: AssessmentResult = {
        findings, symptomMap: sm, totalQuestions, answeredQuestions: answeredCount,
        completionTime: "", timestamp: new Date().toISOString(), riskLevel,
        criticalFindings: critical,
        summary: {
          en: findings.length > 0 ? `We identified ${findings.length} area(s) that may benefit from attention.${critical.length > 0 ? " Some responses indicate potentially serious concerns." : ""}` : "No significant psychological concerns identified. Continue practicing self-care.",
          bn: findings.length > 0 ? `আমরা ${findings.length}টি এলাকা শনাক্ত করেছি যা মনোযোগের প্রয়োজন।${critical.length > 0 ? " কিছু উত্তর গুরুতর উদ্বেগ নির্দেশ করে।" : ""}` : "কোনো উল্লেখযোগ্য মানসিক উদ্বেগ শনাক্ত হয়নি। আত্ম-যত্ন অব্যাহত রাখুন।"
        }
      };
      setResult(res);
      setShowResults(true);
      setIsLoading(false);
    }, 1500);
  };

  const isLast = currentQuestionIndex === currentQuestions.length - 1 && currentSegment === segmentKeys.length - 1;
  const isFirst = currentQuestionIndex === 0 && currentSegment === 0;
  const hasAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  // ── WELCOME ──
  if (showWelcome) {
    return (
      <main className="cf-root min-h-screen flex items-center justify-center p-4 cf-ink">
        <FontStyles />
        <div className="max-w-2xl w-full relative">
          <div className="cf-paper rounded-sm border border-[#c4a45c]/40 shadow-[0_30px_80px_rgba(0,0,0,0.55)] p-8 md:p-14 cf-fade">
            <div className="brass-rule mb-6" />
            <div className="flex items-center justify-between cf-mono text-[10px] text-[#5a4a2f] uppercase mb-8">
              <span>{l === "en" ? "Form 7-A · Self-Report Inventory" : "ফর্ম ৭-এ · স্ব-প্রতিবেদন তালিকা"}</span>
              <span>Bangladesh · Bilingual</span>
            </div>
            <div className="text-center">
              <p className="cf-mono text-[11px] text-[#8a6d3b] uppercase tracking-[0.3em] mb-3">{l === "en" ? "Case Intake Form" : "কেস ইনটেক ফর্ম"}</p>
              <h1 className="text-3xl md:text-5xl font-medium text-[#1c2538] mb-5 tracking-tight">{l === "en" ? "Psychological Assessment" : "মনস্তাত্ত্বিক মূল্যায়ন"}</h1>
              <div className="w-16 h-px bg-[#c4a45c] mx-auto mb-6" />
              <p className="text-[#3d3525] text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
                {l === "en" ? "A professional, science-based screening instrument to help you understand the present state of your mental health. Every entry remains strictly confidential." : "একটি পেশাদার, বিজ্ঞান-ভিত্তিক স্ক্রীনিং যন্ত্র যা আপনার মানসিক স্বাস্থ্যের বর্তমান অবস্থা বুঝতে সাহায্য করে।"}
              </p>
            </div>
            <div className="border border-[#c4a45c]/40 bg-[#f9f2e3] rounded-sm p-5 mb-7 text-left">
              <h3 className="cf-mono text-[11px] uppercase tracking-[0.2em] text-[#8a6d3b] mb-3">{l === "en" ? "Purpose of This Intake" : "এই ইনটেকের উদ্দেশ্য"}</h3>
              <ul className="space-y-2 text-sm text-[#3d3525]">
                {(l === "en" ? ["Recognize early signs of psychological distress", "Connect mental well-being with daily productivity", "Reduce stigma around mental health", "Take the first step toward self-improvement"] : ["মানসিক সমস্যার প্রাথমিক লক্ষণ চিনতে পারবেন", "মানসিক সুস্থতা ও কর্মক্ষমতার সম্পর্ক বুঝতে পারবেন", "মানসিক স্বাস্থ্য নিয়ে কলঙ্ক কমাতে সাহায্য করবে", "আত্ম-উন্নয়নের প্রথম পদক্ষেপ নিতে পারবেন"]).map((b, i) => (
                  <li key={i} className="flex gap-3"><span className="cf-mono text-[#c4a45c] flex-shrink-0">{String(i + 1).padStart(2, "0")}</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between border-t border-b border-[#c4a45c]/30 py-3 mb-8">
              <span className="cf-mono text-[11px] text-[#5a4a2f] uppercase tracking-wider">{l === "en" ? "Estimated time — 10 to 15 minutes" : "প্রাক্কলিত সময় — ১০ থেকে ১৫ মিনিট"}</span>
            </div>
            <div className="flex gap-2 justify-center mb-6">
              {(["en", "bn"] as Language[]).map(lng => (
                <button key={lng} onClick={() => setLanguage(lng)} className={`px-4 py-1.5 rounded-sm text-xs cf-mono uppercase tracking-wider transition-all border ${language === lng ? "bg-[#1c2538] text-[#c4a45c] border-[#1c2538]" : "border-[#c4a45c]/40 text-[#5a4a2f] hover:border-[#1c2538]"}`}>
                  {lng === "en" ? "English" : "বাংলা"}
                </button>
              ))}
            </div>
            <button onClick={() => setShowWelcome(false)} className="w-full py-4 rounded-sm bg-[#1c2538] hover:bg-[#222e47] text-[#e9d9ad] font-medium text-sm md:text-base tracking-wide transition-all border border-[#c4a45c]/60 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              {l === "en" ? "Open Case File" : "কেস ফাইল খুলুন"}
            </button>
            <p className="cf-mono text-[10px] text-[#8a6d3b]/80 mt-5 text-center leading-relaxed">{l === "en" ? "Screening instrument only — not a clinical diagnosis. Always consult a qualified mental health professional." : "স্ক্রীনিং যন্ত্র মাত্র — ক্লিনিকাল ডায়াগনোসিস নয়।"}</p>
            {/* add this right after the disclaimer paragraph */}
<div className="mt-8 pt-4 border-t border-[#c4a45c]/30 text-center">
  <p className="cf-mono text-[10px] text-[#5a4a2f] tracking-wide">
    Developed by{' '}
    <a
      href="https://my-portfolio-eta-seven-hrcv9gnzaf.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#8a6d3b] hover:text-[#1c2538] transition-colors duration-200 font-medium underline decoration-[#c4a45c]/40 underline-offset-2 hover:decoration-[#1c2538]"
    >
      Shibli Noman Arnob
    </a>
  </p>
</div>
          </div>
        </div>
      </main>
    );
  }

  // ── LOADING ──
  if (isLoading) {
    return (
      <main className="cf-root min-h-screen flex items-center justify-center cf-ink">
        <FontStyles />
        <div className="text-center">
          <div className="w-14 h-14 border-2 border-[#c4a45c]/30 border-t-[#c4a45c] rounded-full animate-spin mx-auto mb-5" />
          <p className="cf-mono text-xs text-[#c4a45c] uppercase tracking-[0.2em]">{l === "en" ? "Compiling your case file…" : "আপনার কেস ফাইল প্রস্তুত হচ্ছে…"}</p>
        </div>
      </main>
    );
  }

  // ── RESULTS ──
  if (showResults && result) {
    return (
      <main className="cf-root min-h-screen p-4 md:p-8 cf-ink">
        <FontStyles />
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 px-1">
            <h1 className="cf-mono text-[11px] text-[#c4a45c] uppercase tracking-[0.25em]">{l === "en" ? "Psychological Case File" : "মনস্তাত্ত্বিক কেস ফাইল"}</h1>
            <button onClick={handleRetake} className="cf-mono text-[11px] text-[#8a93a8] hover:text-[#e9d9ad] uppercase tracking-wider transition-colors">{l === "en" ? "Retake" : "পুনরায়"}</button>
          </div>
          <div className="cf-paper rounded-sm border border-[#c4a45c]/40 shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-6 md:p-10 cf-fade">
            <div className="brass-rule mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-medium text-[#1c2538]">{l === "en" ? "Case File — Findings" : "কেস ফাইল — ফলাফল"}</h2>
              <span className="cf-mono text-[10px] uppercase px-3 py-1.5 rounded-full border-2 cf-ink text-[#c4a45c] border-[#c4a45c]/50" style={{ transform: "rotate(-3deg)" }}>
                {result.riskLevel}
              </span>
            </div>
            <div className="border-l-2 border-[#c4a45c] bg-[#f9f2e3] rounded-sm p-4 mb-6">
              <p className="text-[#3d3525] text-sm leading-relaxed">{result.summary[l]}</p>
            </div>
            {result.criticalFindings.length > 0 && (
              <div className="border-2 border-[#8b2e2e]/60 bg-[#f6e3e0] rounded-sm p-4 mb-6">
                <h3 className="text-[#8b2e2e] cf-mono text-[11px] uppercase tracking-wider font-semibold mb-2">⚠ {l === "en" ? "Critical Alerts" : "জরুরি সতর্কতা"}</h3>
                {result.criticalFindings.map((a, i) => <p key={i} className="text-[#7a2828] text-sm">{a}</p>)}
              </div>
            )}
            {result.findings.length > 0 ? (
              <div className="space-y-5 mb-6">
                <h3 className="cf-mono text-[11px] uppercase tracking-[0.2em] text-[#8a6d3b]">{l === "en" ? "Identified Symptom Domains" : "শনাক্তকৃত লক্ষণ এলাকা"}</h3>
                {result.findings.map((f, i) => (
                  <div key={i} className={`border rounded-sm p-5 ${sevBg(f.severity)}`}>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <h4 className="font-medium text-[#1c2538] text-base">{f.condition}</h4>
                        <span className={`cf-mono text-[10px] uppercase tracking-wider font-semibold ${sev(f.severity)}`}>{f.severity}</span>
                      </div>
                      <div className="cf-mono text-[11px] text-[#5a4a2f]">{l === "en" ? "Score" : "স্কোর"}: {f.score}/{f.maxScore}</div>
                    </div>
                    <div className="mb-3">
                      <p className="cf-mono text-[10px] uppercase tracking-wider text-[#8a6d3b] mb-1">{l === "en" ? "Clinical Note" : "ক্লিনিকাল নোট"}</p>
                      <p className="text-sm text-[#3d3525] leading-relaxed">{f.description}</p>
                    </div>
                    {f.indications.length > 0 && (
                      <div className="mb-3">
                        <p className="cf-mono text-[10px] uppercase tracking-wider text-[#8a6d3b] mb-1">{l === "en" ? "Key Indicators" : "প্রধান সূচক"}</p>
                        <ul className="text-sm text-[#3d3525] space-y-1">
                          {f.indications.map((ind, idx) => <li key={idx} className="flex gap-2"><span className="text-[#c4a45c]">—</span><span>{ind}</span></li>)}
                        </ul>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="cf-mono text-[10px] uppercase tracking-wider text-[#8a6d3b] mb-1">{l === "en" ? "Recommendation" : "সুপারিশ"}</p>
                      <p className="text-sm text-[#3d3525] leading-relaxed">{f.recommendation}</p>
                    </div>
                    {f.exercises.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#c4a45c]/30">
                        <p className="cf-mono text-[10px] uppercase tracking-wider text-[#8a6d3b] mb-2">{l === "en" ? "Exercises" : "ব্যায়াম"}</p>
                        <ul className="space-y-2">
                          {f.exercises.slice(0, 2).map((ex, ei) => (
                            <li key={ei} className="text-sm text-[#3d3525]">
                              <span className="font-medium text-[#1c2538]">{ex.title[l]}</span>
                              <span className="text-[#5a4a2f] text-xs block mt-0.5">{ex.description[l]}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[#3b6b4f]/40 bg-[#e8efe6] rounded-sm p-4 mb-6">
                <p className="text-[#2d543d] text-sm">{l === "en" ? "No significant concerns detected." : "কোনো উল্লেখযোগ্য উদ্বেগ শনাক্ত হয়নি।"}</p>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-3 mt-6">
              <button onClick={() => { if (result) { const d = JSON.stringify(result); localStorage.setItem('reportData', d); sessionStorage.setItem('reportData', d); router.push('/report'); } }} className="flex-1 py-3.5 rounded-sm bg-[#1c2538] hover:bg-[#222e47] text-[#e9d9ad] font-medium text-sm tracking-wide transition-all border border-[#c4a45c]/60 text-center">
                {l === "en" ? "Open Full Report" : "সম্পূর্ণ প্রতিবেদন দেখুন"}
              </button>
              <button onClick={handleRetake} className="flex-1 py-3.5 rounded-sm border border-[#1c2538]/30 text-[#1c2538] font-medium text-sm tracking-wide transition-all hover:bg-[#1c2538]/5">
                {l === "en" ? "Retake Assessment" : "পুনরায় মূল্যায়ন"}
              </button>
            </div>
            <div className="mt-6 p-4 border border-[#8b2e2e]/30 bg-[#f6e3e0]/60 rounded-sm">
              <p className="cf-mono text-[10px] text-[#8b2e2e] text-center leading-relaxed">{l === "en" ? "Screening tool only — not medical advice. If experiencing severe distress or suicidal thoughts, contact emergency services immediately." : "স্ক্রীনিং টুল মাত্র — চিকিৎসা পরামর্শ নয়।"}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── ASSESSMENT ──
  // User only sees: Question number and the question itself. Segment name is HIDDEN.
  return (
    <main className="cf-root min-h-screen p-4 md:p-8 cf-ink">
      <FontStyles />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-5 px-1">
          <h1 className="cf-mono text-[11px] text-[#c4a45c] uppercase tracking-[0.25em]">{l === "en" ? "Confidential Assessment" : "গোপনীয় মূল্যায়ন"}</h1>
          <div className="flex gap-1.5">
            {(["en", "bn"] as Language[]).map(lng => (
              <button key={lng} onClick={() => setLanguage(lng)} className={`px-3 py-1 rounded-sm text-[10px] cf-mono uppercase tracking-wider transition-all border ${language === lng ? "bg-[#c4a45c] text-[#0e1a2b] border-[#c4a45c]" : "border-[#c4a45c]/40 text-[#8a93a8] hover:border-[#c4a45c]"}`}>
                {lng === "en" ? "EN" : "বাংলা"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="cf-paper border border-[#c4a45c]/40 rounded-sm p-4 mb-1">
          <div className="flex justify-between items-center mb-2">
            <span className="cf-mono text-[10px] text-[#5a4a2f] uppercase tracking-wider">{l === "en" ? "Progress" : "অগ্রগতি"} — {Math.round(progress)}%</span>
            <span className="cf-mono text-[10px] text-[#5a4a2f]">{answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full h-1.5 bg-[#0e1a2b]/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#8a6d3b] to-[#c4a45c] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question - Segment Name is HIDDEN from user */}
        <div className="cf-paper rounded-sm border border-[#c4a45c]/40 shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-6 md:p-10 cf-fade" key={currentQuestion?.id}>
          <div className="flex items-center justify-between mb-6">
            <span className="cf-mono text-[11px] text-[#8a6d3b]">
              {l === "en" ? `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}` : `প্রশ্ন ${currentQuestionIndex + 1}/${currentQuestions.length}`}
            </span>
            <span className="cf-mono text-[10px] text-[#8a6d3b]/70">{currentQuestionIndex + 1}/{currentQuestions.length}</span>
          </div>
          <h2 className="text-lg md:text-2xl font-medium text-[#1c2538] mb-8 leading-snug">{currentQuestion?.text[l]}</h2>
           
<div className="space-y-2.5">
  {currentQuestion?.options.map((opt, idx) => {
    const isSelected = answers[currentQuestion.id] === idx; // ← Store INDEX, not score
    return (
      <button
  key={idx}
  onClick={() => {
    if (isSelected) {
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: idx });
    }
  }}
  className={`w-full text-left p-4 rounded-sm transition-all duration-200 flex items-start gap-4 ${
    isSelected ? "bg-[#1c2538] border border-[#c4a45c]" : "bg-[#f9f2e3] border border-transparent hover:border-[#c4a45c] hover:bg-[#f4ecdb]"
  }`}
>
  <span className={`cf-mono flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] border ${
    isSelected ? "border-[#c4a45c] text-[#c4a45c]" : "border-[#8a6d3b]/40 text-[#8a6d3b]"
  }`}>
    {String.fromCharCode(65 + idx)}
  </span>
  <span className={`text-sm md:text-base leading-relaxed pt-0.5 ${
    isSelected ? "text-white" : "text-[#1c2538]"
  }`}>
    {opt.text[l]}
  </span>
</button>
    );
  })}
</div>
          <div className="flex justify-between items-center mt-9 pt-5 border-t border-[#c4a45c]/30">
            <button onClick={handlePrevious} disabled={isFirst} className={`cf-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm border transition-all ${isFirst ? "opacity-30 cursor-not-allowed border-[#8a6d3b]/20 text-[#8a6d3b]" : "border-[#8a6d3b]/40 text-[#5a4a2f] hover:border-[#1c2538]"}`}>
              ← {l === "en" ? "Previous" : "পূর্ববর্তী"}
            </button>
            <button onClick={handleNext} disabled={!hasAnswered} className={`cf-mono text-xs uppercase tracking-wider px-6 py-2.5 rounded-sm border transition-all ${hasAnswered ? "bg-[#1c2538] border-[#c4a45c]/60 text-[#e9d9ad] hover:bg-[#222e47]" : "bg-transparent border-[#8a6d3b]/20 text-[#8a6d3b]/50 cursor-not-allowed"}`}>
              {isLast ? (l === "en" ? "Submit File →" : "ফাইল জমা →") : (l === "en" ? "Next →" : "পরবর্তী →")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}