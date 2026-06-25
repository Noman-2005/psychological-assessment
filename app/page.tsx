'use client';
import { useState } from 'react';

/* ======================= TYPES ======================= */
type Lang = 'bn' | 'en';
type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

interface Bilingual { bn: string; en: string; }

interface Option {
  text: Bilingual;
  score: number;
  tags: string[];
  risk?: RiskLevel;
}
interface Question {
  id: string;
  text: Bilingual;
  options: Option[];
}
interface Segment {
  id: string;
  displayName: Bilingual; // "Segment 1" same in both, kept for consistency
  questions: Question[];
}
interface SymptomScore {
  domain: Bilingual;
  rawScore: number;
  maxScore: number;
  percentage: number;
  severity: 'Low' | 'Mild' | 'Moderate' | 'High';
}
interface AssessmentResult {
  scores: SymptomScore[];
  flaggedDomains: SymptomScore[];
  criticalRisk: boolean;
  completedAt: string;
}

const t = (b: Bilingual, lang: Lang) => b[lang];

/* ======================= DATA: SEGMENT 1 — DEPRESSION (Doc 4, 15Q) ======================= */
const depressionSegment: Segment = {
  id: 'depression',
  displayName: { bn: 'সেগমেন্ট ১', en: 'Segment 1' },
  questions: [
    { id: 'dep_1', text: { bn: 'গত দুই সপ্তাহে আপনার মন মেজাজ কেমন থাকছে?', en: 'Over the past two weeks, how has your mood generally been?' }, options: [
      { text: { bn: 'প্রায় প্রতিদিন, সারাদিনই মন খুব খারাপ ও খালি খালি লাগে।', en: 'Almost every day, all day, I feel very low and empty.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'একেক দিন একেক রকম, তবে মাঝে মাঝে কোনো কারণ ছাড়াই অতিরিক্ত আনন্দ বা এক্সাইটমেন্ট ফিল করি।', en: 'It varies day to day, but sometimes I feel unusually elated or excited for no reason.' }, score: 2, tags: ['bipolar_flag'] },
      { text: { bn: 'পরিস্থিতি অনুযায়ী মন ভালো বা খারাপ হয়, নিয়ন্ত্রণ করা যায়।', en: 'My mood shifts based on situations, and I can manage it.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_2', text: { bn: 'আপনার পছন্দের বা শখের কাজগুলো (যেমন: আড্ডা, খেলা, সিনেমা) এখন কেমন লাগে?', en: 'How do your favorite activities (hobbies, hanging out, movies) feel now?' }, options: [
      { text: { bn: 'আগের চেয়ে আনন্দ অনেক কম পাই, জোর করে করতে হয়।', en: 'I enjoy them much less than before; I have to force myself.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'একদমই কোনো আনন্দ বা ফিলিং পাই না, মন পুরো মরে গেছে।', en: 'I feel no joy at all anymore, completely numb.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'আগের মতোই আনন্দ পাই, কোনো পরিবর্তন হয়নি।', en: 'I enjoy them just as before, no change.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_3', text: { bn: 'আপনার দৈনন্দিন কাজের এনার্জি বা শক্তির লেভেল কেমন?', en: 'What is your energy level like for daily tasks?' }, options: [
      { text: { bn: 'শরীর সারাক্ষণ ক্লান্ত লাগে, ছোট একটা কাজ করতেও পাহাড়সম কষ্ট হয়।', en: 'I feel constantly exhausted; even small tasks feel like climbing a mountain.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'শরীরে অতিরিক্ত এনার্জি ফিল করি, ঘুমানোরও প্রয়োজন বোধ করি না, সারাক্ষণ কাজ করতে ইচ্ছা করে।', en: 'I feel excessive energy, barely need sleep, and constantly want to work.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'কাজের চাপে মাঝে মাঝে ক্লান্ত লাগলেও সাধারণত স্বাভাবিক এনার্জি থাকে।', en: 'I sometimes feel tired from workload, but energy is generally normal.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_4', text: { bn: 'সারাদিনের মধ্যে কোন সময়টায় আপনার মন সবচেয়ে বেশি খারাপ বা ব্যাকুল থাকে?', en: 'At what time of day does your mood feel worst or most restless?' }, options: [
      { text: { bn: 'একদম ভোরে বা সকালে ঘুম থেকে ওঠার পর মন সবচেয়ে বেশি বিষণ্ণ ও ভারী লাগে।', en: 'Right after waking up early morning, my mood feels heaviest and most depressed.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'সন্ধ্যার দিকে বা রাতে একা থাকলে মন বেশি খারাপ হয়।', en: 'My mood worsens in the evening or at night when alone.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'নির্দিষ্ট কোনো সময় নেই, যেকোনো সময়ই মন খারাপ হতে পারে।', en: 'No specific time; my mood can drop at any point.' }, score: 1, tags: ['depression'] },
    ]},
    { id: 'dep_5', text: { bn: 'আপনার বর্তমান ঘুমের প্যাটার্ন কেমন?', en: 'What is your current sleep pattern like?' }, options: [
      { text: { bn: 'রাতে সহজে ঘুম আসে না, বিছানায় ঘণ্টার পর ঘণ্টা এপাশ-ওপাশ করি।', en: 'I struggle to fall asleep, tossing and turning for hours.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'খুব ভোরে (স্বাভাবিকের চেয়ে ২-৩ ঘণ্টা আগে) ঘুম ভেঙে যায় এবং এরপর আর কোনোভাবেই ঘুম আসে না।', en: 'I wake up very early (2-3 hours before usual) and can\'t fall back asleep.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'মাত্র ২-৩ ঘণ্টা ঘুমালেও আমার শরীর একদম চাঙ্গা থাকে, ক্লান্ত লাগে না।', en: 'Even on 2-3 hours of sleep, I feel completely fresh, not tired.' }, score: 3, tags: ['bipolar_flag'] },
    ]},
    { id: 'dep_6', text: { bn: 'আপনার ক্ষুধা এবং ওজনের ক্ষেত্রে কোনো পরিবর্তন এসেছে কি?', en: 'Has there been any change in your appetite or weight?' }, options: [
      { text: { bn: 'খিদে একদম মরে গেছে, জোর করে খেতে হয় এবং ওজন অনেক কমে গেছে।', en: 'My appetite is completely gone; I have to force myself to eat, and I\'ve lost a lot of weight.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'মন খারাপের কারণে উল্টো বেশি বেশি খাচ্ছি (বিশেষ করে মিষ্টি বা জাঙ্ক ফুড) এবং ওজন বাড়ছে।', en: 'Due to low mood I\'m overeating instead (especially sweets/junk food), and gaining weight.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'ক্ষুধা ও ওজনে কোনো উল্লেখযোগ্য পরিবর্তন আসেনি।', en: 'No significant change in appetite or weight.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_7', text: { bn: 'নিজের সম্পর্কে আপনার বর্তমান মূল্যায়ন বা ভাবনা কেমন?', en: 'How do you currently view or evaluate yourself?' }, options: [
      { text: { bn: 'নিজেকে খুব অপরাধী, ব্যর্থ এবং পরিবারের ওপর একটা বোঝা মনে হয়।', en: 'I feel deeply guilty, like a failure, and a burden to my family.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'নিজেকে অত্যন্ত গুরুত্বপূর্ণ, ক্ষমতাশালী বা স্পেশাল কেউ মনে হয়, যার অনেক বড় বড় পরিকল্পনা আছে।', en: 'I feel extremely important, powerful, or special, with grand plans.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'নিজের ভুলত্রুটি ও সাফল্য দুটোই বাস্তবসম্মতভাবে দেখতে পাই।', en: 'I view my flaws and successes realistically.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_8', text: { bn: 'কোনো বিষয়ে সিদ্ধান্ত নিতে বা মনোযোগ দিতে আপনার কেমন সমস্যা হচ্ছে?', en: 'How much difficulty are you having with decisions or focus?' }, options: [
      { text: { bn: 'খুব ছোটখাটো বিষয়েও সিদ্ধান্ত নিতে পারি না, মাথা জ্যাম হয়ে থাকে, মনোযোগ দেওয়া অসম্ভব লাগে।', en: 'I can\'t decide even on small things; my mind feels jammed, focusing feels impossible.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'মাথায় একসাথে এত এত নতুন চিন্তা আসে যে একটা বিষয়ে মন স্থির করতে পারি না, মন ছুটে বেড়ায়।', en: 'So many new thoughts race through my head that I can\'t settle on one; my mind races.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'কাজের চাপে মনোযোগ একটু কমলেও সিদ্ধান্ত নিতে বড় কোনো সমস্যা হয় না।', en: 'Focus dips a bit under workload, but no major problem deciding things.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_9', text: { bn: 'আপনার কথা বলা বা শারীরিক নড়াচড়ার গতিতে কোনো পরিবর্তন এসেছে?', en: 'Has your speech or physical movement speed changed?' }, options: [
      { text: { bn: 'আমি খুব ধীরে ধীরে কথা বলি, হাত-পা নাড়াতে বা হাঁটতেও অনেক সময় লাগে, যেন শরীর স্তব্ধ হয়ে গেছে।', en: 'I speak very slowly, moving or walking takes a long time, as if my body has frozen.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'আমি খুব দ্রুত কথা বলছি, অন্যরা আমার কথার গতি ধরতে পারছে না এবং আমি এক জায়গায় স্থির বসতে পারছি না।', en: 'I speak very fast, others can\'t keep up, and I can\'t sit still in one place.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'কথা বলা বা হাঁটাচলার গতি সবসময় যেমন থাকে তেমনই আছে।', en: 'My speech and movement speed are unchanged.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_10', text: { bn: 'গত কয়েকদিনে আপনার মনে জীবন শেষ করে দেওয়ার মতো কোনো চিন্তা এসেছে?', en: 'In recent days, have you had any thoughts of ending your life?' }, options: [
      { text: { bn: 'মাঝে মাঝে মনে হয় এই জীবন রেখে লাভ কী, রাতে ঘুমালে যদি আর সকাল না হতো।', en: 'Sometimes I think what\'s the point of living, or wish I wouldn\'t wake up.' }, score: 2, tags: ['depression', 'suicidal_passive'], risk: 'moderate' },
      { text: { bn: 'নিজেকে শেষ করার তীব্র চিন্তা আসে এবং আমি মনে মনে এর উপায় বা পরিকল্পনাও খুঁজি।', en: 'I have intense thoughts of ending my life and I think about methods or plans.' }, score: 3, tags: ['depression', 'suicidal_active'], risk: 'critical' },
      { text: { bn: 'না, জীবন নিয়ে কষ্ট থাকলেও মরে যাওয়ার মতো কোনো চিন্তা কখনো আসেনি।', en: 'No, despite hardship, I\'ve never had thoughts of dying.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_11', text: { bn: 'আপনি কি কখনো এমন কোনো সময়ের মধ্য দিয়ে গেছেন যখন ৪-৫ দিন ধরে আপনার মেজাজ অতিরিক্ত খিটখিটে বা আক্রমণাত্মক ছিল?', en: 'Have you gone through periods of 4-5 days where your mood was extremely irritable or aggressive?' }, options: [
      { text: { bn: 'হ্যাঁ, সামান্য কারণে রেগে গিয়ে চিৎকার করেছি, জিনিসপত্র ভেঙেছি এবং নিজেকে সামলাতে পারিনি।', en: 'Yes, I\'ve shouted, broken things over small things, and couldn\'t control myself.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'মন খারাপের কারণে মাঝে মাঝে একটু খিটখিটে লাগে, তবে তা তীব্র রূপ নেয় না।', en: 'Low mood sometimes makes me a bit irritable, but it doesn\'t become severe.' }, score: 1, tags: ['depression'] },
      { text: { bn: 'না, রাগ হলেও আমি সাধারণত নিজেকে শান্ত রাখতে পারি।', en: 'No, even when angry I can usually keep myself calm.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_12', text: { bn: 'আপনি কি কখনো কোনো কারণ ছাড়াই হুট করে অনেক বেশি টাকা খরচ করা, ঝুঁকিপূর্ণ ড্রাইভিং বা বড় কোনো হঠকারী সিদ্ধান্ত নিয়েছেন?', en: 'Have you ever, without reason, suddenly spent a lot of money, driven recklessly, or made a big impulsive decision?' }, options: [
      { text: { bn: 'হ্যাঁ, এমন কিছু সময়ে আমি পরিণতির কথা না ভেবে অনেক টাকা উড়িয়েছি বা বড় রিস্ক নিয়েছি, যা পরে অনুশোচনা তৈরি করেছে।', en: 'Yes, at times I\'ve spent recklessly or taken big risks without thinking of consequences, regretting it later.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'না, আমি টাকা-পয়সা বা সিদ্ধান্তের ব্যাপারে সবসময় বেশ সতর্ক থাকি।', en: 'No, I\'m always quite careful about money and decisions.' }, score: 0, tags: [] },
      { text: { bn: 'মন খারাপ থাকলে মাঝে মাঝে একটু বেশি কেনাকাটা করি, তবে তা নিয়ন্ত্রণে থাকে।', en: 'When upset I sometimes shop a bit more, but it stays in control.' }, score: 1, tags: ['depression'] },
    ]},
    { id: 'dep_13', text: { bn: 'আপনার বর্তমান সামাজিক জীবন বা মানুষের সাথে মেলামেশার অবস্থা কেমন?', en: 'What is your current social life or interaction with people like?' }, options: [
      { text: { bn: 'মানুষের সাথে মিশতে একদম ইচ্ছা করে না, নিজেকে গুটিয়ে বন্ধ ঘরে একা পড়ে থাকি।', en: 'I have no desire to socialize at all, withdrawing alone in a closed room.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'আমি হুট করে অনেক বেশি সামাজিক হয়ে গেছি, অপরিচিত মানুষের সাথেও যেচে গিয়ে গভীর আড্ডা দিচ্ছি।', en: 'I\'ve suddenly become overly social, eagerly chatting deeply even with strangers.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'বন্ধুদের সাথে যোগাযোগ আগের মতোই স্বাভাবিক আছে।', en: 'My contact with friends remains normal as before.' }, score: 0, tags: [] },
    ]},
    { id: 'dep_14', text: { bn: 'আপনার কি মনে হয় আপনার এই মানসিক অবস্থা আপনার ক্যারিয়ার, পড়াশোনা বা সম্পর্কে বড় ক্ষতি করছে?', en: 'Do you feel your current mental state is significantly harming your career, studies, or relationships?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি কর্মক্ষমতা হারিয়ে ফেলছি, অফিস বা ক্লাসে যাওয়া প্রায় বন্ধ।', en: 'Yes, I\'m losing my functioning, almost stopped going to office/class.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'আমার কোনো সমস্যা নেই, কিন্তু আশেপাশের মানুষ আমার অতিরিক্ত এনার্জি বা আচরণে অতিষ্ঠ হয়ে উঠছে।', en: 'I have no problem, but people around me are getting fed up with my excessive energy/behavior.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'কষ্ট হলেও আমি আমার দায়িত্বগুলো ঠিকঠাক পালন করতে পারছি।', en: 'Despite difficulty, I\'m managing my responsibilities properly.' }, score: 1, tags: ['depression'] },
    ]},
    { id: 'dep_15', text: { bn: 'এই লক্ষণগুলো কি আপনার জীবনে চক্রাকারে (কখনো চরম ভালো, কখনো চরম খারাপ) বারবার ফিরে আসে?', en: 'Do these symptoms recur cyclically in your life (sometimes extremely good, sometimes extremely bad)?' }, options: [
      { text: { bn: 'হ্যাঁ, কয়েক মাস পর পর বা বছরের নির্দিষ্ট সময়ে এই ভালো-খারাপের সাইকেলটি ঘটে।', en: 'Yes, this good-bad cycle happens every few months or at specific times of year.' }, score: 3, tags: ['bipolar_flag'] },
      { text: { bn: 'না, আমার এই মন খারাপের অনুভূতিটি একটানা দীর্ঘদিন ধরে চলছে, ভালো হওয়ার কোনো গ্যাপ নেই।', en: 'No, this low mood has been continuous for a long time, with no gaps of feeling better.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'না, এটি আমার জীবনে প্রথমবার ঘটছে।', en: 'No, this is happening for the first time in my life.' }, score: 1, tags: ['depression'] },
    ]},
  ],
};

/* ======================= DATA: SEGMENT 2 — ANXIETY (Doc 4, 15Q) ======================= */
const anxietySegment: Segment = {
  id: 'anxiety',
  displayName: { bn: 'সেগমেন্ট ২', en: 'Segment 2' },
  questions: [
    { id: 'anx_1', text: { bn: 'আপনার দুশ্চিন্তার ধরনটি কেমন?', en: 'What is the nature of your worry?' }, options: [
      { text: { bn: 'নির্দিষ্ট কোনো কারণ ছাড়াই সারাক্ষণ, প্রতিদিন ছোটখাটো সব বিষয় নিয়ে মন অস্থির থাকে।', en: 'Without specific reason, my mind stays restless about small things every day.' }, score: 3, tags: ['anxiety'] },
      { text: { bn: 'হুট করে কোনো কারণ ছাড়াই তীব্র ভয়ের একটা ঝাপটা আসে, মনে হয় দম আটকে এখনই মরে যাবো।', en: 'Suddenly, without reason, an intense wave of fear hits, feeling like I\'ll suffocate and die right now.' }, score: 3, tags: ['panic'] },
      { text: { bn: 'মানুষের সামনে কথা বলতে বা অচেনা পরিবেশে গেলে বুক কেঁপে ওঠে।', en: 'My chest pounds when speaking in front of people or in unfamiliar settings.' }, score: 2, tags: ['social_anxiety'] },
    ]},
    { id: 'anx_2', text: { bn: 'আপনার এই দুশ্চিন্তা বা ভয়গুলো আপনি কতটা নিয়ন্ত্রণ করতে পারেন?', en: 'How much control do you have over these worries or fears?' }, options: [
      { text: { bn: 'আমি চাইলেও এই চিন্তার স্রোত থামাতে পারি না, মাথা সারাক্ষণ খা খা করে।', en: 'Even if I want to, I can\'t stop this stream of thoughts; my head feels constantly buzzing.' }, score: 3, tags: ['anxiety'] },
      { text: { bn: 'ভয়টা এত দ্রুত আসে যে নিয়ন্ত্রণ করার কোনো সুযোগই পাই না, শরীর অবশ হয়ে আসে।', en: 'The fear comes so fast I get no chance to control it; my body goes numb.' }, score: 3, tags: ['panic'] },
      { text: { bn: 'একটু সময় নিয়ে নিজেকে বোঝালে বা ওখান থেকে সরে আসলে শান্ত হতে পারি।', en: 'Taking some time to calm myself or stepping away, I can settle down.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_3', text: { bn: 'দুশ্চিন্তার সময় আপনার শরীরে নিচের কোন লক্ষণটি সবচেয়ে বেশি দেখা যায়?', en: 'During worry, which physical symptom appears most?' }, options: [
      { text: { bn: 'পেশি শক্ত হয়ে থাকা, ঘাড় ও মাথায় প্রচণ্ড ব্যথা, সহজে রিল্যাক্স হতে না পারা।', en: 'Tense muscles, severe neck/head pain, difficulty relaxing.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'বুক ধড়ফড় করা, দম আটকে আসা, হাত-পা অবশ হয়ে যাওয়া বা কাঁপা, প্রচণ্ড ঘাম হওয়া।', en: 'Racing heart, breathlessness, numb or shaking limbs, heavy sweating.' }, score: 3, tags: ['panic'] },
      { text: { bn: 'শুধু পেটের ভেতর কেমন যেন মোচড় দিয়ে ওঠে বা মুখ শুকিয়ে যায়।', en: 'Just a knot in my stomach or dry mouth.' }, score: 1, tags: ['social_anxiety'] },
    ]},
    { id: 'anx_4', text: { bn: 'আপনার কি সারাক্ষণ কোনো অজানা খারাপ কিছু ঘটার ভয় বা আশঙ্কা কাজ করে?', en: 'Do you constantly fear something unknown and bad is about to happen?' }, options: [
      { text: { bn: 'হ্যাঁ, মনে হয় এই বুঝি আমার বা পরিবারের কারও বড় কোনো বিপদ বা দুর্ঘটনা ঘটবে।', en: 'Yes, I feel like a major danger or accident is about to happen to me or my family.' }, score: 3, tags: ['anxiety'] },
      { text: { bn: 'না, তবে আমার ভয় হয় যে আমার হুট করে হার্ট অ্যাটাক হবে বা আমি পাগল হয়ে যাবো।', en: 'No, but I fear I\'ll suddenly have a heart attack or go crazy.' }, score: 2, tags: ['panic'] },
      { text: { bn: 'না, এমন কোনো অলীক ভয় আমার কাজ করে না।', en: 'No, I don\'t have such irrational fears.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_5', text: { bn: 'কোনো সামাজিক অনুষ্ঠান (যেমন: বিয়ে বাড়ি, প্রেজেন্টেশন, অপরিচিত মানুষের আড্ডা) নিয়ে আপনার অনুভূতি কী?', en: 'How do you feel about social events (weddings, presentations, gatherings with strangers)?' }, options: [
      { text: { bn: 'আমি তীব্র ভয় পাই যে সবাই আমার দিকে তাকিয়ে আছে, আমি কোনো ভুল করলে সবাই হাসাহাসি করবে।', en: 'I intensely fear everyone is watching me and will laugh if I make a mistake.' }, score: 3, tags: ['social_anxiety'] },
      { text: { bn: 'সামাজিক অনুষ্ঠান ভালোই লাগে, কিন্তু সেখানে প্যানিক অ্যাটাক হলে মানুষ দেখে ফেলবে—এই ভয়ে যেতে পারি না।', en: 'I enjoy social events, but I avoid them fearing people will see if I have a panic attack.' }, score: 3, tags: ['panic', 'agoraphobia'] },
      { text: { bn: 'একটু নার্ভাস লাগলেও সামাজিক অনুষ্ঠানে আমি স্বাভাবিকভাবেই অংশ নিতে পারি।', en: 'Despite slight nervousness, I can participate normally.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_6', text: { bn: 'আপনার অস্থিরতা বা ছটফটে ভাব কেমন থাকে?', en: 'What is your restlessness/fidgetiness like?' }, options: [
      { text: { bn: 'সারাক্ষণ মনের ভেতর একটা খুতখুতানি বা অস্থিরতা থাকে, এক জায়গায় শান্ত হয়ে বসতে পারি না।', en: 'I constantly feel an inner unease, can\'t sit still calmly.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'আমি সাধারণত শান্তই থাকি, কিন্তু ভয়ের অ্যাটাকটা আসলে ছটফট করতে থাকি।', en: 'I\'m usually calm, but during a fear attack I become restless.' }, score: 1, tags: ['panic'] },
      { text: { bn: 'এমন কোনো অস্থিরতা আমার নেই।', en: 'I have no such restlessness.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_7', text: { bn: 'দুশ্চিন্তার কারণে আপনার ঘুমের কী পরিবর্তন হয়েছে?', en: 'How has worry affected your sleep?' }, options: [
      { text: { bn: 'মাথায় সারাক্ষণ চিন্তার চাকা ঘোরে বলে বিছানায় শুয়েও ঘণ্টার পর ঘণ্টা ঘুম আসে না।', en: 'Thoughts keep racing so even lying down I can\'t sleep for hours.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'ভয়ের বা দুঃস্বপ্নের ধাক্কায় হুট করে বুক ধড়ফড়ানি নিয়ে মাঝরাতে ঘুম ভেঙে যায়।', en: 'I wake up mid-night with a racing heart from fear or nightmares.' }, score: 2, tags: ['panic'] },
      { text: { bn: 'ঘুম স্বাভাবিক আছে, দুশ্চিন্তা ঘুমের ক্ষতি করে না।', en: 'Sleep is normal; worry doesn\'t affect it.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_8', text: { bn: 'আপনি কি কোনো নির্দিষ্ট বস্তু বা পরিস্থিতিকে (যেমন: তেলাপোকা, ইনজেকশন, লিফট, উচু জায়গা) চরম অযৌক্তিক ভয় পান?', en: 'Do you have extreme irrational fear of any specific object/situation (cockroaches, injections, elevators, heights)?' }, options: [
      { text: { bn: 'হ্যাঁ, সাধারণ মানুষের চেয়ে ওই জিনিসগুলোর প্রতি আমার ভয় মারাত্মক বেশি এবং আমি ওগুলো এড়িয়ে চলি।', en: 'Yes, my fear of those things is far greater than average, and I avoid them.' }, score: 2, tags: ['anxiety', 'phobia'] },
      { text: { bn: 'বদ্ধ জায়গা বা লিফটে আমার ভয় লাগে কারণ মনে হয় দম আটকে যাবে।', en: 'I fear enclosed spaces or elevators, feeling I\'ll suffocate.' }, score: 2, tags: ['panic'] },
      { text: { bn: 'সামান্য ভয় বা অস্বস্তি লাগলেও ওটা কোনো বড় সমস্যা নয়।', en: 'Slight fear or discomfort, but not a big issue.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_9', text: { bn: 'আপনার কি হুট করে মেজাজ খিটখিটে হয়ে যায়?', en: 'Do you suddenly become irritable?' }, options: [
      { text: { bn: 'হ্যাঁ, সারাক্ষণ দুশ্চিন্তার চাপে থাকার কারণে মানুষের সাধারণ কথায় বা ছোটখাটো বিষয়েও মেজাজ গরম হয়ে যায়।', en: 'Yes, constant worry stress makes me lose temper even at normal remarks or small things.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'না, আমি রাগী নই, শুধু মনের ভেতর একা একা ভয় পাই।', en: 'No, I\'m not angry, I just fear quietly inside.' }, score: 1, tags: ['anxiety'] },
      { text: { bn: 'মেজাজ সাধারণত শান্তই থাকে।', en: 'My mood is generally calm.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_10', text: { bn: 'দুশ্চিন্তার সময় আপনার মনোযোগের অবস্থা কেমন হয়?', en: 'What is your attention/focus like during worry?' }, options: [
      { text: { bn: 'মন এক জায়গায় বসে না, মন খালি এদিক-ওদিক ছুটে যায় বা মাথা পুরো ফাঁকা (blank) হয়ে যায়।', en: 'My mind won\'t settle, it darts around or goes completely blank.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'ভয়ের সময় শুধু নিজের শরীরের লক্ষণের (যেমন হার্টবিট) ওপর মনোযোগ আটকে থাকে, বাইরের কিছু মাথায় ঢোকে না।', en: 'During fear, attention fixates only on bodily sensations (like heartbeat), nothing else registers.' }, score: 2, tags: ['panic'] },
      { text: { bn: 'চিন্তিত থাকলেও কাজের সময় মনোযোগ ধরে রাখতে পারি।', en: 'Even when worried, I can maintain focus during work.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_11', text: { bn: 'আপনি কি ভয় বা দুশ্চিন্তা এড়াতে নির্দিষ্ট কোনো জায়গা বা কাজ করা পুরোপুরি বন্ধ করে দিয়েছেন?', en: 'Have you completely stopped certain places or activities to avoid fear/worry?' }, options: [
      { text: { bn: 'হ্যাঁ, একা বাইরে যাওয়া, শপিং মলে যাওয়া বা গণপরিবহনে ওঠা বন্ধ করে দিয়েছি পাছে যদি প্যানিক অ্যাটাক হয়।', en: 'Yes, I\'ve stopped going out alone, to malls, or public transport fearing a panic attack.' }, score: 3, tags: ['agoraphobia'] },
      { text: { bn: 'হ্যাঁ, মানুষের সামনে কথা বলতে হবে এমন চাকরি, ক্লাস বা ইন্টারভিউ আমি এড়িয়ে চলি।', en: 'Yes, I avoid jobs, classes, or interviews requiring public speaking.' }, score: 3, tags: ['social_anxiety'] },
      { text: { bn: 'না, ভয় লাগলেও আমি কোনো কাজ বা জায়গা পুরোপুরি এড়িয়ে চলি না।', en: 'No, despite fear I don\'t fully avoid any place or activity.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_12', text: { bn: 'আপনার এই দুশ্চিন্তার লক্ষণগুলো টানা কতদিন ধরে চলছে?', en: 'How long have these worry symptoms persisted continuously?' }, options: [
      { text: { bn: 'গত ৬ মাসেরও বেশি সময় ধরে প্রায় প্রতিদিন অধিকাংশ সময় দুশ্চিন্তা থাকে।', en: 'For more than 6 months, worry occurs most of the time almost daily.' }, score: 3, tags: ['anxiety'] },
      { text: { bn: '১ মাসের মতো বা তার কম সময় ধরে এই তীব্র প্যানিক অ্যাটাকগুলো হচ্ছে।', en: 'These intense panic attacks have been happening for about a month or less.' }, score: 2, tags: ['panic'] },
      { text: { bn: 'মাত্র কয়েক সপ্তাহ হলো কোনো একটা নির্দিষ্ট কারণে (যেমন পরীক্ষা বা কাজের চাপ) চিন্তা হচ্ছে।', en: 'Only a few weeks, due to a specific reason (exams, work pressure).' }, score: 1, tags: ['anxiety'] },
    ]},
    { id: 'anx_13', text: { bn: 'আপনার কি সারাক্ষণ নিজের ক্লান্তি বা অল্পতেই হাঁপিয়ে ওঠার সমস্যা হয়?', en: 'Do you constantly feel fatigued or get easily winded?' }, options: [
      { text: { bn: 'হ্যাঁ, শরীরে কোনো ভারী রোগ না থাকলেও সারাক্ষণ দুশ্চিন্তার মানসিক ধকলের কারণে শরীর সবসময় ক্লান্ত থাকে।', en: 'Yes, with no major illness, my body stays constantly tired from the mental strain of worrying.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'না, ক্লান্তি নেই, তবে ভয়ের সময় শরীর কাঁপতে থাকে।', en: 'No fatigue, but my body shakes during fear.' }, score: 1, tags: ['panic'] },
      { text: { bn: 'পর্যাপ্ত বিশ্রাম নিলে শরীর একদম ফ্রেশ থাকে।', en: 'With adequate rest, my body feels completely fresh.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_14', text: { bn: 'আপনি কি আপনার এই ভয় বা দুশ্চিন্তা থেকে সাময়িক মুক্তি পেতে কোনো ওষুধ, অ্যালকোহল বা অন্য কিছুর আশ্রয় নেন?', en: 'Do you turn to medication, alcohol, or anything else for temporary relief from fear/worry?' }, options: [
      { text: { bn: 'হ্যাঁ, নিজেকে শান্ত করতে বা ঘুমাতে চিকিৎসকের পরামর্শ ছাড়া ঘুমের বা নেশার ওষুধ ব্যবহার করতে হয়।', en: 'Yes, I use sleeping pills or substances without medical advice to calm down or sleep.' }, score: 2, tags: ['anxiety', 'substance_risk'] },
      { text: { bn: 'না, আমি এগুলো এড়িয়ে চলি, কষ্ট হলেও সহ্য করি।', en: 'No, I avoid these and endure the discomfort.' }, score: 0, tags: [] },
      { text: { bn: 'মাঝে মাঝে চা-কফি বা গান শুনে মন ডাইভার্ট করার চেষ্টা করি।', en: 'I sometimes try to distract myself with tea/coffee or music.' }, score: 0, tags: [] },
    ]},
    { id: 'anx_15', text: { bn: 'আপনার কি মনে হয় যে আপনার এই ভয়গুলো আসলে অতিরিক্ত বা অযৌক্তিক, কিন্তু তাও আপনি নিজেকে থামাতে পারছেন না?', en: 'Do you feel your fears are excessive or irrational, yet you still can\'t stop them?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি জানি এত চিন্তা করার কিছু নেই বা এই পরিস্থিতিতে মরে যাওয়ার কথা না, তাও মন শোনে না।', en: 'Yes, I know there\'s nothing to worry this much about, yet my mind won\'t listen.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'না, আমার মনে হয় আমার ভয়গুলো পুরোপুরি বাস্তব এবং আমার শরীরে আসলেই বড় কোনো রোগ আছে যা ডাক্তাররা ধরছেন না।', en: 'No, I feel my fears are entirely real and I genuinely have a serious illness doctors are missing.' }, score: 2, tags: ['anxiety', 'health_anxiety'] },
      { text: { bn: 'আমার ভয়গুলো পরিস্থিতি অনুযায়ী স্বাভাবিক বলেই মনে হয়।', en: 'My fears seem normal given the circumstances.' }, score: 0, tags: [] },
    ]},
  ],
};

/* ======================= DATA: SEGMENT 3 — OCD (Doc 4, 15Q) ======================= */
const ocdSegment: Segment = {
  id: 'ocd',
  displayName: { bn: 'সেগমেন্ট ৩', en: 'Segment 3' },
  questions: [
    { id: 'ocd_1', text: { bn: 'আপনার মাথায় কি এমন কোনো অদ্ভুত বা অস্বস্তিকর চিন্তা, ছবি বা আইডিয়া বারবার আসে যা আপনি চান না?', en: 'Do strange or distressing thoughts, images, or ideas repeatedly come to mind that you don\'t want?' }, options: [
      { text: { bn: 'হ্যাঁ, বারবার মনে হয় হাত নোংরা হয়ে আছে, বা কোনো বড় রোগ বা জীবাণু লেগে আছে।', en: 'Yes, I repeatedly feel my hands are dirty or contaminated with germs/disease.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'হ্যাঁ, বারবার মনে হয় ঘরের দরজা লক করিনি, বা গ্যাসের চুলা নেভাইনি, যার ফলে বড় দুর্ঘটনা ঘটবে।', en: 'Yes, I repeatedly think I forgot to lock the door or turn off the gas, causing a major accident.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'হ্যাঁ, মাথায় কোনো ধার্মিক বা সামাজিক ট্যাবুর বিরুদ্ধে কুচিন্তা বা অপছন্দনীয় ছবি বারবার ভেসে ওঠে।', en: 'Yes, unwanted thoughts/images against religious or social taboos repeatedly appear.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'না, আমার মাথায় এমন কোনো অবাধ্য বা অদ্ভুত চিন্তা বারবার আসে না।', en: 'No, I don\'t have such intrusive or strange recurring thoughts.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_2', text: { bn: 'এই চিন্তাগুলো মাথায় আসলে আপনার কেমন অনুভূতি হয়?', en: 'How do you feel when these thoughts come to mind?' }, options: [
      { text: { bn: 'তীব্র মানসিক অশান্তি, ভয়, অপরাধবোধ বা চরম অ্যাংজাইটি তৈরি হয়।', en: 'Intense distress, fear, guilt, or extreme anxiety.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'একটু খুতখুতানি লাগে, তবে অন্য কাজে মন দিলে সহজেই ভুলে যাই।', en: 'A bit of unease, but easily forgotten by focusing elsewhere.' }, score: 1, tags: [] },
      { text: { bn: 'কোনো বিশেষ অনুভূতি হয় না, চিন্তা আসে আর যায়।', en: 'No particular feeling; the thought comes and goes.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_3', text: { bn: 'এই মানসিক অশান্তি বা দুশ্চিন্তা থেকে বাঁচতে আপনি কি কোনো কাজ বারবার বা নির্দিষ্ট নিয়মে করতে বাধ্য হন?', en: 'To escape this distress, do you feel compelled to repeat certain actions in a fixed way?' }, options: [
      { text: { bn: 'হ্যাঁ, মনের খুতখুতানি দূর করতে আমি বারবার হাত ধুই, গোসলে ঘণ্টার পর ঘণ্টা কাটাই বা ঘর পরিষ্কার করি।', en: 'Yes, to relieve unease I wash my hands repeatedly, spend hours bathing, or clean repeatedly.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'হ্যাঁ, আমি বারবার তালা, গ্যাসের চাবি, বা ফ্যানের সুইচ গুনে গুনে চেক করি।', en: 'Yes, I repeatedly check locks, gas valves, or switches, counting them.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'হ্যাঁ, মনে মনে কোনো নির্দিষ্ট দোয়া, সংখ্যা গোনা বা কথা বারবার আওড়াতে হয়, নয়তো মনে হয় খারাপ কিছু ঘটবে।', en: 'Yes, I must mentally repeat a prayer, counting, or phrase, or else something bad will happen.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'না, আমি কোনো কাজ এভাবে বারবার করতে বাধ্য হই না।', en: 'No, I don\'t feel compelled to repeat actions like this.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_4', text: { bn: 'যদি আপনাকে সেই কাজটি (যেমন হাত ধোয়া বা চেক করা) করতে বাধা দেওয়া হয়, তবে আপনার কী হবে?', en: 'If you were prevented from doing that act (like washing or checking), what would happen?' }, options: [
      { text: { bn: 'আমার অ্যাংজাইটি এত চরম পর্যায়ে পৌঁছাবে যে মনে হবে আমি পাগল হয়ে যাবো বা এক্ষুনি খারাপ কিছু ঘটে যাবে।', en: 'My anxiety would become so extreme I\'d feel I\'m going crazy or something bad will happen right now.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'একটু অস্বস্তি বা রাগ লাগবে, তবে আমি নিজেকে সামলে অন্য কাজ করতে পারবো।', en: 'A bit of discomfort or anger, but I could manage and do something else.' }, score: 1, tags: [] },
      { text: { bn: 'কোনো সমস্যাই হবে না।', en: 'No problem at all.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_5', text: { bn: 'এই চিন্তা করা এবং সেই অনুযায়ী কাজ করার পেছনে আপনার প্রতিদিন গড়ে কতটুকু সময় নষ্ট হয়?', en: 'On average, how much time per day do you lose to these thoughts and related actions?' }, options: [
      { text: { bn: 'প্রতিদিন ১ ঘণ্টারও বেশি সময় (কখনো কখনো ৪-৫ ঘণ্টা) এই হাত ধোয়া, গোছানো বা চেকিংয়ে নষ্ট হয়।', en: 'More than 1 hour daily (sometimes 4-5 hours) is lost to washing, organizing, or checking.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'দিনে মাত্র ১০-১৫ মিনিট একটু খুতখুতানি বা গোছগাছ করতে সময় যায়, যা আমার জীবনে কোনো বাধা তৈরি করে না।', en: 'Only 10-15 minutes daily for minor fussing or tidying, which causes no disruption.' }, score: 1, tags: [] },
      { text: { bn: 'আমার এমন কোনো সময় নষ্ট হয় না।', en: 'I don\'t lose any time like this.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_6', text: { bn: 'ঘরের জিনিসপত্র বা নিজের টেবিল সাজানোর ক্ষেত্রে আপনার কি কোনো বিশেষ নিয়ম আছে?', en: 'Do you have specific rules for arranging household items or your desk?' }, options: [
      { text: { bn: 'হ্যাঁ, সব জিনিস একদম নিখুঁতভাবে, সুনির্দিষ্ট লাইনে বা রঙ মিলিয়ে সাজানো থাকতে হবে, একটু নড়চড় হলে আমি সহ্য করতে পারি না।', en: 'Yes, everything must be perfectly aligned or color-matched; I can\'t tolerate it being even slightly off.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'আমি গোছানো জিনিস পছন্দ করি, তবে একটু অগোছালো থাকলেও আমার কাজে কোনো সমস্যা হয় না।', en: 'I prefer order but slight messiness doesn\'t cause me problems.' }, score: 1, tags: [] },
      { text: { bn: 'আমি বেশ অগোছালো মানুষ, সাজানো-গোছানো নিয়ে আমার কোনো মাথাব্যথা নেই।', en: 'I\'m quite messy and don\'t care about organizing.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_7', text: { bn: 'আপনার কি কোনো জিনিস (যেমন পুরনো কাগজ, ঠোঙা, বোতল) অপ্রয়োজনীয় জেনেও ফেলে দিতে তীব্র কষ্ট হয় বা জমিয়ে রাখার অভ্যাস আছে?', en: 'Do you find it intensely hard to discard useless items (old papers, bags, bottles), or do you hoard them?' }, options: [
      { text: { bn: 'হ্যাঁ, আমার মনে হয় ভবিষ্যতে কখনো লাগতে পারে, এই ভয়ে আমি ঘরভর্তি আবর্জনা বা অপ্রয়োজনীয় জিনিস জমিয়ে রেখেছি।', en: 'Yes, fearing I might need it someday, I\'ve filled my home with clutter or useless items.' }, score: 3, tags: ['ocd', 'hoarding'] },
      { text: { bn: 'না, অপ্রয়োজনীয় জিনিস আমি সহজেই ডাস্টবিনে ফেলে দিতে পারি।', en: 'No, I easily discard unneeded items.' }, score: 0, tags: [] },
      { text: { bn: 'মাঝে মাঝে ডায়েরি বা গিফটের মতো স্মৃতিবিজড়িত জিনিস জমিয়ে রাখি।', en: 'I sometimes keep sentimental items like diaries or gifts.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_8', text: { bn: 'আপনার মাথায় কি কখনো কোনো কারণ ছাড়াই কাউকে আঘাত করা বা কোনো অনৈতিক কাজ করে ফেলার অদ্ভুত ভয় আসে?', en: 'Do you ever have a strange fear of hurting someone or doing something immoral, without reason?' }, options: [
      { text: { bn: 'হ্যাঁ, ধারালো কিছু দেখলে মনে হয় আমি কাউকে আঘাত করে বসবো কিনা, যদিও আমি শান্ত প্রকৃতির মানুষ, এই চিন্তায় আমি ওসব জিনিস থেকে দূরে থাকি।', en: 'Yes, seeing something sharp I fear I might hurt someone, though I\'m calm by nature; I avoid such objects.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'না, আমার মাথায় এমন কোনো হিংস্র বা অনৈতিক অবাধ্য চিন্তা আসে না।', en: 'No, I don\'t have such violent or immoral intrusive thoughts.' }, score: 0, tags: [] },
      { text: { bn: 'রাগ হলে সাময়িক মারপিটের চিন্তা আসে, কিন্তু তা অবাধ্য চিন্তা নয়।', en: 'When angry I have momentary thoughts of fighting, but it\'s not intrusive.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_9', text: { bn: 'এই অবাধ্য চিন্তা বা বারবার একই কাজ করার অভ্যাস আপনার পড়াশোনা, চাকরি বা পারিবারিক জীবনে কেমন প্রভাব ফেলছে?', en: 'How is this affecting your studies, work, or family life?' }, options: [
      { text: { bn: 'আমি চরমভাবে পিছিয়ে পড়ছি। হাত ধুতে বা চেক করতেই আমার কাজের বা অফিসের দেরি হয়ে যায়, জীবন অতিষ্ঠ হয়ে গেছে।', en: 'I\'m falling severely behind. Washing/checking delays my work/office; life has become unbearable.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'একটু কাজের গতি কমে যায় বা মানুষ আমাকে খুতখুতে বলে, তবে আমি আমার প্রধান কাজগুলো শেষ করতে পারি।', en: 'Work pace slows a bit or people call me fussy, but I can complete main tasks.' }, score: 1, tags: [] },
      { text: { bn: 'আমার জীবনে এর কোনো নেতিবাচক প্রভাব নেই।', en: 'No negative impact on my life.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_10', text: { bn: 'আপনি নিজের মনে এই অবাধ্য চিন্তা বা কাজগুলোকে কতটা যৌক্তিক মনে করেন?', en: 'How logical do you personally consider these intrusive thoughts/actions to be?' }, options: [
      { text: { bn: 'আমি খুব ভালো করেই জানি যে এভাবে হাত ধোয়া বা তালা চেক করা একদম পাগলামি ও অযৌক্তিক, কিন্তু তাও আমি নিজেকে থামাতে পারি না।', en: 'I know very well that this washing/checking is irrational, but I still can\'t stop myself.' }, score: 2, tags: ['ocd', 'good_insight'] },
      { text: { bn: 'আমার মনে হয় আমি যা করছি তা পুরোপুরি ঠিক এবং জীবাণু বা বিপদ থেকে বাঁচতে হলে এভাবেই করা উচিত, অন্যরাই অসাবধান।', en: 'I think what I do is entirely correct and necessary to avoid germs/danger; others are just careless.' }, score: 3, tags: ['ocd', 'poor_insight'] },
      { text: { bn: 'আমি এ বিষয়ে কখনো ভেবে দেখিনি।', en: 'I\'ve never thought about this.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_11', text: { bn: 'আপনার কি কোনো কিছু বারবার গুণতে থাকার বা মনে মনে কোনো শব্দ বারবার রিপিট করার অভ্যাস আছে?', en: 'Do you have a habit of repeatedly counting things or mentally repeating words?' }, options: [
      { text: { bn: 'হ্যাঁ, রাস্তায় চলার সময় গাড়ির নাম্বার, বা ঘরের টাইলস, কিংবা মনে মনে কোনো সংখ্যা বারবার না গুণলে আমার মন শান্ত হয় না।', en: 'Yes, my mind won\'t settle unless I count car numbers, tiles, or numbers repeatedly.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'না, এমন কোনো গোনার অভ্যাস আমার নেই।', en: 'No, I don\'t have such a counting habit.' }, score: 0, tags: [] },
      { text: { bn: 'শুধু পড়াশোনা বা হিসাবের সময় গুনি, অন্য সময় নয়।', en: 'I only count during studying or calculations, not otherwise.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_12', text: { bn: 'এই সমস্যাটি কি আপনার শৈশব বা কৈশোর থেকেই অল্প অল্প করে শুরু হয়েছিল?', en: 'Did this problem start gradually from childhood/adolescence?' }, options: [
      { text: { bn: 'হ্যাঁ, ছোটবেলা থেকেই আমার মধ্যে একটু অতিরিক্ত পরিষ্কার থাকা বা খুতখুতানি ছিল, যা এখন তীব্র আকার ধারণ করেছে।', en: 'Yes, since childhood I had slight over-cleanliness or fussiness, which has now intensified.' }, score: 2, tags: ['ocd'] },
      { text: { bn: 'না, এটি সাম্প্রতিক সময়ে কোনো বড় মানসিক চাপ বা ঘটনার পর হুট করে শুরু হয়েছে।', en: 'No, it started suddenly recently after a major stressful event.' }, score: 2, tags: ['ocd'] },
      { text: { bn: 'আমার এমন কোনো সমস্যা অতীতে বা বর্তমানে ছিল না।', en: 'I\'ve never had this problem, past or present.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_13', text: { bn: 'আপনি কি আপনার এই অভ্যাসের কারণে পরিবার বা বন্ধুদের সাথে প্রায়ই ঝগড়া বা অশান্তিতে জড়ান?', en: 'Does this habit cause frequent conflict with family or friends?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি অন্যদেরও আমার মতো পরিষ্কার থাকতে বা আমার নিয়ম মানতে বাধ্য করি, যা নিয়ে সারাক্ষণ ঘরে অশান্তি হয়।', en: 'Yes, I force others to follow my cleanliness rules too, causing constant household conflict.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'না, আমি আমার খুতখুতানি নিজের মধ্যেই সীমাবদ্ধ রাখি, অন্যদের ডিস্টার্ব করি না।', en: 'No, I keep my fussiness to myself, not disturbing others.' }, score: 1, tags: ['ocd'] },
      { text: { bn: 'এমন কোনো পরিস্থিতি তৈরি হয় না।', en: 'Such situations don\'t arise.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_14', text: { bn: 'আপনি যখন কোনো কাজ (যেমন কোনো ইমেইল বা খাতা লেখা) শেষ করেন, তখন তা কতবার রি-চেক করেন?', en: 'When you finish a task (writing an email/notes), how many times do you re-check it?' }, options: [
      { text: { bn: 'আমি বারবার পড়তে থাকি, কোনো ভুল রয়ে গেল কিনা এই ভয়ে লেখাটা পাঠাতেই পারি না, ঘণ্টার পর ঘণ্টা পার হয়ে যায়।', en: 'I re-read repeatedly, unable to send it for fear of mistakes, taking hours.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'সাধারণত একবার বা দুবার চোখ বুলিয়ে নিই, যা স্বাভাবিক।', en: 'I usually glance once or twice, which is normal.' }, score: 0, tags: [] },
      { text: { bn: 'আমি চেক না করেই পাঠিয়ে দিই, ভুল হলে পরে দেখা যাবে।', en: 'I send without checking; mistakes can be fixed later.' }, score: 0, tags: [] },
    ]},
    { id: 'ocd_15', text: { bn: 'এই অবাধ্য চিন্তার হাত থেকে বাঁচতে আপনি কি কখনো কোনো অদ্ভুত শারীরিক অঙ্গভঙ্গি (যেমন মাথা ঝাঁকানো, চোখ পিটপিট করা বা টিক্স) করেন?', en: 'To escape intrusive thoughts, do you ever perform odd physical gestures (head shaking, eye blinking, tics)?' }, options: [
      { text: { bn: 'হ্যাঁ, মাথায় খারাপ চিন্তা আসলে আমি মাথা জোরে ঝাঁকাই বা অদ্ভুত কোনো আওয়াজ বা মুভমেন্ট করি ওটা দূর করার জন্য।', en: 'Yes, when bad thoughts come I shake my head hard or make odd sounds/movements to dispel them.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'না, আমি শুধু মনের চিন্তায় অস্থির থাকি, শরীরে এমন কোনো অনিচ্ছাকৃত মুভমেন্ট হয় না।', en: 'No, I\'m just mentally restless, no involuntary physical movements.' }, score: 1, tags: ['ocd'] },
      { text: { bn: 'আমার এমন কোনো লক্ষণ নেই।', en: 'I have no such symptoms.' }, score: 0, tags: [] },
    ]},
  ],
};

/* ======================= DATA: SEGMENT 4 — TRAUMA & PSYCHOSIS (Doc 4, 15Q) ======================= */
const traumaPsychosisSegment: Segment = {
  id: 'trauma_psychosis',
  displayName: { bn: 'সেগমেন্ট ৪', en: 'Segment 4' },
  questions: [
    { id: 'tp_1', text: { bn: 'আপনার জীবনে কি অতীতে ঘটে যাওয়া কোনো ভয়াবহ দুর্ঘটনা, নির্যাতন বা প্রিয়জনের মৃত্যুর গভীর কোনো দাগ আছে?', en: 'Has a past traumatic accident, abuse, or loss of a loved one left a deep mark on your life?' }, options: [
      { text: { bn: 'হ্যাঁ, এবং সেই ঘটনার কথা মনে পড়লে আমি আজও আতঙ্কে শিউরে উঠি।', en: 'Yes, and remembering that event still makes me shudder with terror today.' }, score: 3, tags: ['ptsd'] },
      { text: { bn: 'না, বড় কোনো ট্রমা নেই, তবে সাধারণ কিছু দুঃখজনক ঘটনা আছে।', en: 'No major trauma, but some ordinary sad events.' }, score: 1, tags: [] },
      { text: { bn: 'আমার অতীত জীবন বেশ শান্ত ও স্বাভাবিক ছিল।', en: 'My past life was quite calm and normal.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_2', text: { bn: 'সেই ট্রমাটিক বা ভয়াবহ ঘটনার স্মৃতি কি আপনার বর্তমানে হুট করে জীবন্ত হয়ে ফিরে আসে?', en: 'Does the memory of that traumatic event suddenly return vividly in the present?' }, options: [
      { text: { bn: 'হ্যাঁ, দিনের বেলা হঠাৎ মনে হয় আমি আবার সেই আগের বিপদের মধ্যেই আছি, চোখের সামনে দৃশ্যগুলো ভেসে ওঠে এবং রাতে ওটা নিয়ে দুঃস্বপ্ন দেখি।', en: 'Yes, suddenly during the day I feel I\'m back in that danger, scenes flash before my eyes, and I have nightmares about it at night.' }, score: 3, tags: ['ptsd'] },
      { text: { bn: 'মাঝে মাঝে মনে পড়লে খারাপ লাগে, তবে ওটা যে অতীত তা আমি পুরোপুরি ফিল করতে পারি।', en: 'Sometimes remembering feels bad, but I can fully feel it\'s in the past.' }, score: 1, tags: [] },
      { text: { bn: 'না, আমি অতীত সহজে মনে রাখি না বা ওটা আমাকে ডিস্টার্ব করে না।', en: 'No, I don\'t easily recall the past, or it doesn\'t disturb me.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_3', text: { bn: 'আপনি কি সেই ট্রমার সাথে জড়িত কোনো জায়গা, মানুষ বা কথাবার্তা ইচ্ছাকৃতভাবে এড়িয়ে চলেন?', en: 'Do you intentionally avoid places, people, or conversations related to that trauma?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি ওই রাস্তার পাশ দিয়েও হাঁটি না, বা ওই ঘটনা মনে করায় এমন যেকোনো কিছু থেকে শত হাত দূরে থাকি।', en: 'Yes, I won\'t even walk past that road, or anything reminding me of it I stay far away from.' }, score: 3, tags: ['ptsd'] },
      { text: { bn: 'না, একটু খারাপ লাগলেও আমি স্বাভাবিকভাবেই সব জায়গায় যেতে বা কথা বলতে পারি।', en: 'No, despite some discomfort I can go anywhere or talk normally.' }, score: 0, tags: [] },
      { text: { bn: 'আমি ওসব নিয়ে ভাবিই না।', en: 'I don\'t think about it at all.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_4', text: { bn: 'আপনার চারপাশের পরিবেশ বা নিজের অস্তিত্ব নিয়ে কি আপনার কোনো অদ্ভুত বিভ্রম হয়?', en: 'Do you have any strange sense of unreality about your surroundings or your own existence?' }, options: [
      { text: { bn: 'হ্যাঁ, মাঝে মাঝে মনে হয় আমি আমার নিজের শরীর থেকে আলাদা হয়ে ওপর থেকে নিজেকে দেখছি, চারপাশটা পুরো অবাস্তব লাগে।', en: 'Yes, sometimes I feel detached from my own body, watching myself from above, and surroundings feel entirely unreal.' }, score: 2, tags: ['ptsd', 'dissociation'] },
      { text: { bn: 'না, আমি বাস্তবতার সাথে পুরোপুরি যুক্ত থাকি।', en: 'No, I stay fully connected to reality.' }, score: 0, tags: [] },
      { text: { bn: 'প্রচণ্ড ঘুমের অভাব বা ক্লান্তিতে মাঝে মাঝে একটু ঝিমঝিম লাগে।', en: 'Sometimes a bit dizzy from severe lack of sleep or fatigue.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_5', text: { bn: 'আপনি কি কখনো এমন কোনো মানুষের কণ্ঠস্বর বা আওয়াজ শুনতে পান, যা আশেপাশের অন্য কেউ শুনতে পায় না?', en: 'Do you ever hear voices or sounds that others around you cannot hear?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি স্পষ্ট এমন কিছু শুনি যা অন্য কেউ শুনতে পায় না।', en: 'Yes, I clearly hear something that others cannot.' }, score: 3, tags: ['psychosis'], risk: 'high' },
      { text: { bn: 'না, আমি কখনোই এমন অবাস্তব কোনো আওয়াজ শুনি না।', en: 'No, I never hear such unreal sounds.' }, score: 0, tags: [] },
      { text: { bn: 'শুধু যখন ঘুমের ঘোরে থাকি বা জাস্ট ঘুম ভাঙার মুহূর্তে ভ্রমের মতো হালকা আওয়াজ মনে হয়।', en: 'Only while drowsy or just waking up, a faint dream-like sound.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_6', text: { bn: 'আপনি কি চোখের সামনে এমন কোনো মানুষ, বস্তু বা দৃশ্য দেখতে পান যা অন্যরা দেখতে পায় না?', en: 'Do you see a person, object, or scene before you that others cannot see?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি ঘরে বা বাইরে এমন কিছু আকৃতি স্পষ্ট দেখি যা পরক্ষণেই গায়েব হয়ে যায়।', en: 'Yes, I clearly see shapes indoors or outdoors that vanish moments later.' }, score: 3, tags: ['psychosis'], risk: 'high' },
      { text: { bn: 'না, আমি অবাস্তব কিছু দেখি না।', en: 'No, I don\'t see unreal things.' }, score: 0, tags: [] },
      { text: { bn: 'অন্ধকারে মাঝে মাঝে কাপড়ের স্তূপকে মানুষ মনে করে ভুল হয়, কিন্তু লাইট জ্বাললে ঠিক হয়ে যায়।', en: 'In the dark I sometimes mistake a pile of clothes for a person, but it corrects with light.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_7', text: { bn: 'আপনার কি এমন কোনো গভীর বিশ্বাস আছে যা অন্য সবাই ভুল বা অবাস্তব বললেও আপনি মনে-প্রাণে সত্য বলে বিশ্বাস করেন?', en: 'Do you hold a deep belief that everyone else calls false, but you truly believe is real?' }, options: [
      { text: { bn: 'হ্যাঁ, আমার বিশ্বাস কোনো অদৃশ্য শক্তি বা মানুষ আমার ওপর নজর রাখছে এবং আমার ক্ষতি করার বড় প্ল্যান করছে।', en: 'Yes, I believe some unseen force or person is watching me and plotting to harm me.' }, score: 3, tags: ['psychosis'], risk: 'high' },
      { text: { bn: 'হ্যাঁ, আমার মনে হয় আমি কোনো অতিপ্রাকৃতিক ক্ষমতার অধিকারী বা বিশেষ কোনো মিশনের জন্য পাঠানো হয়েছি।', en: 'Yes, I feel I possess supernatural powers or was sent for a special mission.' }, score: 3, tags: ['psychosis'], risk: 'high' },
      { text: { bn: 'না, আমার এমন কোনো অন্ধ বা অদ্ভুত বিশ্বাস নেই যা বাস্তবতার বাইরে।', en: 'No, I have no such irrational beliefs beyond reality.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_8', text: { bn: 'সোশাল মিডিয়া, টেলিভিশন বা খবরের কাগজের সাধারণ তথ্যগুলো নিয়ে আপনার কেমন মনে হয়?', en: 'How do you feel about general information on social media, TV, or newspapers?' }, options: [
      { text: { bn: 'আমার স্পষ্ট মনে হয় টিভির নিউজ বা ফেসবুকের পোস্টগুলো আসলে আমাকে উদ্দেশ্য করেই কোনো কোড বা সংকেত আকারে দেওয়া হচ্ছে।', en: 'I clearly feel TV news or Facebook posts are coded messages directed specifically at me.' }, score: 3, tags: ['psychosis'], risk: 'moderate' },
      { text: { bn: 'ওগুলো সাধারণ তথ্য, আমার সাথে এর কোনো ব্যক্তিগত সম্পর্ক নেই।', en: 'It\'s just general information with no personal connection to me.' }, score: 0, tags: [] },
      { text: { bn: 'মাঝে মাঝে কোনো পোস্ট আমার জীবনের সাথে মিলে গেলে কাকতালীয় মনে করি।', en: 'Sometimes if a post matches my life I consider it coincidence.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_9', text: { bn: 'আপনার কি মনে হয় যে আপনার মনের চিন্তাগুলো অন্য কেউ চুরি করে নিচ্ছে, বা আপনার মাথায় বাইরে থেকে কেউ চিন্তা ঢুকিয়ে দিচ্ছে?', en: 'Do you feel someone is stealing your thoughts, or inserting thoughts into your head from outside?' }, options: [
      { text: { bn: 'হ্যাঁ, আমার মনে হয় বাইরে থেকে আমার চিন্তাভাবনা নিয়ন্ত্রণ করা হচ্ছে বা আমার মনের কথা সবাই জেনে যাচ্ছে।', en: 'Yes, I feel my thoughts are controlled from outside, or everyone knows what I\'m thinking.' }, score: 3, tags: ['psychosis'], risk: 'high' },
      { text: { bn: 'না, আমার চিন্তা একান্তই আমার নিজের এবং তা আমার মগজেই থাকে।', en: 'No, my thoughts are entirely my own and stay in my mind.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_10', text: { bn: 'কথা বলার সময় অন্যরা কি আপনার কথাবার্তা বা চিন্তার খেই সহজে ধরতে পারে?', en: 'Can others easily follow your train of thought when you speak?' }, options: [
      { text: { bn: 'অনেকেই বলে আমি এক কথা থেকে হুট করে একদম সম্পর্কহীন অন্য কথায় চলে যাই, আমার কথার কোনো আগামাথা খুঁজে পাওয়া যায় না।', en: 'Many say I suddenly jump from one topic to a completely unrelated one; my speech makes no sense.' }, score: 3, tags: ['psychosis'] },
      { text: { bn: 'আমি গুছিয়ে কথা বলতে পারি, অন্যরা সহজেই আমার কথা বুঝতে পারে।', en: 'I speak coherently, others easily understand me.' }, score: 0, tags: [] },
      { text: { bn: 'নার্ভাস থাকলে মাঝে মাঝে একটু আমতা আমতা করি, তবে কথা লজিক্যাল থাকে।', en: 'When nervous I sometimes stumble a bit, but speech stays logical.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_11', text: { bn: 'আপনার আবেগ প্রকাশ বা মুখের অভিব্যক্তিতে কি কোনো বড় পরিবর্তন এসেছে?', en: 'Has there been a major change in your emotional expression or facial expressions?' }, options: [
      { text: { bn: 'আমার এখন কোনো সুখ, দুঃখ বা অনুভূতি কাজ করে না; আমার মুখ সারাক্ষণ ভাবলেশহীন (flat) থাকে।', en: 'I now feel no joy, sadness, or emotion; my face stays constantly flat/expressionless.' }, score: 3, tags: ['psychosis'] },
      { text: { bn: 'পরিস্থিতি অনুযায়ী আমার রাগ, আনন্দ বা দুঃখ স্বাভাবিকভাবেই প্রকাশ পায়।', en: 'My anger, joy, or sadness express naturally based on situations.' }, score: 0, tags: [] },
      { text: { bn: 'আমি একটু কম আবেগপ্রবণ মানুষ, তবে একদম অনুভূতিহীন নই।', en: 'I\'m a slightly less emotional person, but not feelingless.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_12', text: { bn: 'আপনার ব্যক্তিগত পরিষ্কার-পরিচ্ছন্নতা বা সেলফ-কেয়ারের বর্তমান অবস্থা কেমন?', en: 'What is your current state of personal hygiene or self-care?' }, options: [
      { text: { bn: 'আমি দিনের পর দিন গোসল করি না, চুল আঁচড়াই না বা কাপড়ের যত্ন নিই না; নিজের শরীরের যত্ন নেওয়ার কোনো ইচ্ছাই আমার নেই।', en: 'I go days without bathing, combing hair, or caring for clothes; I have no desire to care for my body.' }, score: 3, tags: ['psychosis', 'depression'] },
      { text: { bn: 'আমি আমার নিজের পরিষ্কার-পরিচ্ছন্নতার দিকে নিয়মিত খেয়াল রাখি।', en: 'I regularly maintain my personal hygiene.' }, score: 0, tags: [] },
      { text: { bn: 'মাঝে মাঝে অলসতার কারণে একটু দেরি হয়, তবে সাধারণত ঠিক থাকে।', en: 'Sometimes a bit delayed from laziness, but generally fine.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_13', text: { bn: 'আপনি কি সারাক্ষণ তীব্র ভয়ার্ত বা সতর্ক অবস্থায় থাকেন, যেন এই বুঝি কেউ আপনাকে আক্রমণ করবে?', en: 'Are you constantly in an intensely fearful or vigilant state, as if someone is about to attack you?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি ঘরে থাকলেও দরজার দিকে তাকিয়ে থাকি, রাস্তায় হাঁটলে বারবার পেছনে তাকাই, সারাক্ষণ শরীর টানটান হয়ে থাকে।', en: 'Yes, even at home I watch the door, look back repeatedly while walking, body constantly tense.' }, score: 3, tags: ['ptsd'] },
      { text: { bn: 'না, আমি নিরাপদ পরিবেশে বেশ রিল্যাক্সড থাকতে পারি।', en: 'No, I can stay quite relaxed in safe environments.' }, score: 0, tags: [] },
      { text: { bn: 'অপরিচিত বা অন্ধকার এলাকায় গেলে একটু সতর্ক থাকি, যা স্বাভাবিক।', en: 'I\'m a bit cautious in unfamiliar or dark areas, which is normal.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_14', text: { bn: 'আপনার কি মাঝে মাঝে শরীর একদম শক্ত বা জড় হয়ে যায়, যেখানে আপনি দীর্ঘক্ষণ এক ভঙ্গিতে স্থির থাকেন?', en: 'Does your body sometimes become completely stiff or frozen, remaining still in one posture for long periods?' }, options: [
      { text: { bn: 'হ্যাঁ, মাঝে মাঝে আমার শরীর কোনো নির্দেশ শোনে না, আমি নড়াচড়া না করে ঘণ্টার পর ঘণ্টা একভাবে স্তব্ধ হয়ে থাকি।', en: 'Yes, sometimes my body won\'t respond to commands, staying motionless for hours.' }, score: 3, tags: ['psychosis'] },
      { text: { bn: 'না, আমার শরীরে এমন কোনো জড়তা বা অদ্ভুত প্যারালাইসিস হয় না।', en: 'No, I don\'t experience such stiffness or odd paralysis.' }, score: 0, tags: [] },
    ]},
    { id: 'tp_15', text: { bn: 'আপনার এই অদ্ভুত অভিজ্ঞতা বা লক্ষণগুলো কি আপনার পরিবার ও বন্ধুদের সাথে আপনার সম্পর্ককে পুরোপুরি বিচ্ছিন্ন করে দিয়েছে?', en: 'Have these unusual experiences/symptoms completely cut off your relationships with family and friends?' }, options: [
      { text: { bn: 'হ্যাঁ, আমি নিজেকে সমাজ ও পরিবার থেকে পুরোপুরি গুটিয়ে নিয়েছি, কারণ কেউ আমাকে বোঝে না এবং আমি কাউকে বিশ্বাস করতে পারি না।', en: 'Yes, I\'ve completely withdrawn from society and family, as no one understands me and I trust no one.' }, score: 3, tags: ['psychosis', 'ptsd'] },
      { text: { bn: 'না, আমি কষ্ট সত্ত্বেও পরিবার ও বন্ধুদের সাথে যোগাযোগ বজায় রেখেছি।', en: 'No, despite difficulty I\'ve maintained contact with family and friends.' }, score: 0, tags: [] },
    ]},
  ],
};

/* ======================= DATA: SEGMENT 5 — SITUATIONAL (Doc 9, 15Q) ======================= */
const situationalSegment: Segment = {
  id: 'situational',
  displayName: { bn: 'সেগমেন্ট ৫', en: 'Segment 5' },
  questions: [
    { id: 'sit_1', text: { bn: 'আপনি একটি গুরুত্বপূর্ণ ইন্টারভিউ বা প্রেজেন্টেশন দিতে গেছেন। হুট করে আপনার মনে হলো সবাই আপনার দিকে খুব নিখুঁতভাবে তাকাচ্ছে এবং আপনার হাত-পা কাঁপতে শুরু করেছে। এই অবস্থায় আপনি কী করবেন?', en: 'You\'re at an important interview/presentation. Suddenly you feel everyone is staring intensely at you and your hands/legs start shaking. What would you do?' }, options: [
      { text: { bn: 'আমি সেখান থেকে শরীর খারাপের উসিলা দিয়ে দ্রুত বের হয়ে চলে যাবো এবং নেক্সট টাইম এমন পরিস্থিতি এড়িয়ে চলবো।', en: 'I\'d quickly leave citing feeling unwell, and avoid such situations next time.' }, score: 2, tags: ['social_anxiety'] },
      { text: { bn: 'আমি প্রচণ্ড প্যানিকড হয়ে যাবো, মনে হবে আমি এখনই অজ্ঞান হয়ে যাবো বা হার্ট অ্যাটাক করবো এবং সাহায্যের জন্য চিৎকার করতে ইচ্ছা করবে।', en: 'I\'d become extremely panicked, feeling I\'ll faint or have a heart attack, wanting to scream for help.' }, score: 3, tags: ['panic'] },
      { text: { bn: 'আমি ভেতরে ভেতরে প্রচণ্ড অস্বস্তি বোধ করলেও গভীর শ্বাস নিয়ে নিজেকে শান্ত করার চেষ্টা করবো এবং কাঁপা স্বরে হলেও প্রেজেন্টেশন শেষ করবো।', en: 'Despite intense inner discomfort, I\'d take deep breaths to calm myself and finish, even with a shaky voice.' }, score: 0, tags: [] },
      { text: { bn: 'আমার মনে হবে ইন্টারভিউ বোর্ডের সদস্যরা আগে থেকেই আমার বিরুদ্ধে কোনো ষড়যন্ত্র করে রেখেছে আমাকে লজ্জিত করার জন্য।', en: 'I\'d feel the interview panel has already conspired beforehand to humiliate me.' }, score: 3, tags: ['psychosis'], risk: 'moderate' },
    ]},
    { id: 'sit_2', text: { bn: 'আপনি খুব ক্লান্ত হয়ে রাতে ঘুমাতে গেছেন। বিছানায় শোবামাত্রই আপনার মাথায় আগামীকালের একটা কাজ বা কোনো পুরনো ভুলের চিন্তা চলে আসলো। সাধারণত এরপর আপনার সাথে কী ঘটে?', en: 'Exhausted, you go to bed. The moment you lie down, a thought about tomorrow\'s task or an old mistake comes to mind. What usually happens next?' }, options: [
      { text: { bn: 'আমি ওই চিন্তাটা মাথা থেকে ঝেড়ে ফেলে সহজে ও শান্তিতে ঘুমিয়ে পড়ি।', en: 'I shake off the thought and fall asleep easily and peacefully.' }, score: 0, tags: [] },
      { text: { bn: 'ওই একটা চিন্তা থেকে আরও ১০০টা নেতিবাচক চিন্তা মাথায় জ্যাম জ্যাম করবে, বুক ধড়ফড় করবে এবং সারা রাত ছটফট করতে করতে ভোর হয়ে যাবে।', en: 'That one thought spirals into a hundred negative thoughts, heart racing, tossing all night until dawn.' }, score: 3, tags: ['anxiety'] },
      { text: { bn: 'আমার তীব্র মন খারাপ হবে, মনে হবে আমার জীবনে আসলে কোনো আশাই নেই এবং আমি কাঁদতে কাঁদতে একসময় ঘুমাবো বা সারারাত ঘুমই আসবে না।', en: 'I\'d feel intensely sad, like there\'s no hope in life, crying myself to sleep or staying awake all night.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'ওই চিন্তাটা মাথা থেকে দূর করার জন্য আমি উঠে বসে ঘরের লাইট বা ফ্যানের সুইচ একটা নির্দিষ্ট সংখ্যায় (যেমন ৫ বার) অন-অফ করতে বাধ্য হবো, নয়তো ঘুমাবো না।', en: 'To clear that thought, I\'d be compelled to get up and switch the light/fan a fixed number of times (e.g., 5), or I won\'t sleep.' }, score: 3, tags: ['ocd'] },
    ]},
    { id: 'sit_3', text: { bn: 'আপনার অফিসের বস বা বিশ্ববিদ্যালয়ের কোনো প্রিয় শিক্ষক কোনো কারণ ছাড়াই আপনার একটি মেসেজ দেখেও সিন (Read) করে রিপ্লাই দিলেন না। আপনার প্রথম প্রতিক্রিয়া কী হবে?', en: 'Your boss or favorite professor reads your message but doesn\'t reply, with no apparent reason. What\'s your first reaction?' }, options: [
      { text: { bn: 'আমার মনে হবে তিনি নিশ্চয়ই ব্যস্ত আছেন, পরে ফ্রি হলে রিপ্লাই দেবেন।', en: 'I\'d assume they\'re busy and will reply when free.' }, score: 0, tags: [] },
      { text: { bn: 'আমি সারাক্ষণ অস্থিরতায় ভুগবো, বারবার ফোন চেক করবো এবং ভাববো আমি নিশ্চয়ই বড় কোনো ভুল করেছি যার জন্য তিনি আমার ওপর রেগে আছেন।', en: 'I\'d be constantly anxious, checking my phone repeatedly, thinking I must have made a big mistake they\'re angry about.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'আমার মনে হবে আমার কোনো যোগ্যতাই নেই, সবাই আমাকে অবহেলা করে এবং এই ভেবে আমি তীব্র ডিপ্রেশনে ডুবে যাবো।', en: 'I\'d feel worthless, like everyone neglects me, sinking into intense depression.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'আমার নিশ্চিত বিশ্বাস হবে যে তিনি ইচ্ছে করে আমাকে ক্যারিয়ারে বা পড়াশোনায় ড্রপ করানোর জন্য কোনো গোপন ষড়যন্ত্র করছেন।', en: 'I\'d be certain they\'re deliberately conspiring to sabotage my career or studies.' }, score: 3, tags: ['psychosis'], risk: 'moderate' },
    ]},
    { id: 'sit_4', text: { bn: 'আপনি একটি শপিং মলে কেনাকাটা করতে গেছেন। হুট করে আপনার মনে হলো আপনার হাতটা কোনো একটা নোংরা বা সন্দেহজনক জায়গায় লেগে গেছে। আপনি তখন কী করবেন?', en: 'You\'re shopping at a mall. Suddenly you feel your hand touched something dirty or suspicious. What would you do?' }, options: [
      { text: { bn: 'একটু অস্বস্তি লাগলেও আমি কেনাকাটা শেষ করে সাধারণ নিয়মে হাত ধুয়ে নেবো।', en: 'Despite mild discomfort, I\'d finish shopping and wash hands normally afterward.' }, score: 0, tags: [] },
      { text: { bn: 'আমি প্রচণ্ড প্যানিকড হয়ে যাবো, মনে হবে এখনই কোনো মারাত্মক জীবাণু বা মরণব্যাধি আমার শরীরে ঢুকে গেছে এবং আমি শপিং ফেলে হন্যে হয়ে ওয়াশরুম খুঁজবো।', en: 'I\'d panic intensely, feeling a deadly germ has entered my body, abandoning shopping to desperately search for a washroom.' }, score: 3, tags: ['anxiety', 'health_anxiety'] },
      { text: { bn: 'আমি হ্যান্ড স্যানিটাইজার বা সাবান দিয়ে হাত ধোয়া শুরু করবো এবং মনে মনে খুতখুতানি না যাওয়া পর্যন্ত টানা ৫-১০ মিনিট হাত ধোবো বা ঘষতেই থাকবো।', en: 'I\'d start washing/sanitizing and keep scrubbing for 5-10 minutes straight until the unease subsides.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'আমার কোনো ওসব খেয়ালই থাকবে না, কারণ আমার মন এতটাই বিষণ্ণ যে নিজের শরীরের পরিচ্ছন্নতা নিয়ে আমার কোনো মাথাব্যথাই নেই।', en: 'I wouldn\'t even notice, as my mind is so depressed I don\'t care about my own hygiene.' }, score: 3, tags: ['depression'] },
    ]},
    { id: 'sit_5', text: { bn: 'আপনার খুব কাছের একজন বন্ধু বা পরিবারের কেউ আপনার একটি ছোট ভুলের কারণে আপনার ওপর প্রচণ্ড রেগে গেল এবং আপনাকে কিছু কড়া কথা শোনালো। আপনি কীভাবে রিঅ্যাক্ট করবেন?', en: 'A close friend or family member gets extremely angry at a small mistake of yours and says harsh things. How would you react?' }, options: [
      { text: { bn: 'আমার মন ভেঙে যাবে, মনে হবে এই পৃথিবীতে কেউ আমাকে ভালোবাসে না এবং আমি কয়েকদিন নিজেকে পুরো ঘরবন্দি করে সবার সাথে যোগাযোগ বন্ধ করে দেবো।', en: 'I\'d be heartbroken, feeling no one loves me, and shut myself in for days, cutting off contact.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'আমি নিজের আবেগ ধরে রাখতে পারবো না; হুট করে প্রচণ্ড রেগে গিয়ে চিৎকার করবো, জিনিসপত্র ভাঙবো বা নিজের হাত কাটবো, আবার পরক্ষণেই চরম অপরাধবোধে ভুগবো।', en: 'I couldn\'t hold my emotions; I\'d suddenly rage, shout, break things, or cut myself, then immediately feel intense guilt.' }, score: 3, tags: ['borderline', 'self_harm_flag'], risk: 'high' },
      { text: { bn: 'আমি শান্ত থেকে তাঁর কথা শুনবো এবং পরিস্থিতি ঠান্ডা হলে যৌক্তিকভাবে ভুল বোঝাবুঝি দূর করার চেষ্টা করবো।', en: 'I\'d stay calm, listen, and once things cool down, try to logically resolve the misunderstanding.' }, score: 0, tags: [] },
      { text: { bn: 'আমার মনে হবে সে কখনোই আমার আসল বন্ধু ছিল না, সে আসলে মুখোসধারী এক শত্রু যে এতদিন সুযোগ খুঁজছিল আমার ক্ষতি করার।', en: 'I\'d feel they were never a real friend, but a masked enemy waiting for a chance to harm me.' }, score: 3, tags: ['psychosis', 'borderline'] },
    ]},
    { id: 'sit_6', text: { bn: 'আপনাকে আজ একটি ছোট কিন্তু গুরুত্বপূর্ণ কাজ (যেমন একটি ফর্ম পূরণ বা ঘর গোছানো) শেষ করতে হবে। কাজটির সামনে বসার পর আপনার আচরণ কেমন হয়?', en: 'You must finish a small but important task today (filling a form, tidying up). What\'s your behavior when you sit to do it?' }, options: [
      { text: { bn: 'আমি কাজটা নিখুঁত করার জন্য বারবার কাটাকাটি বা রি-চেক করতে থাকি, যার ফলে একটা ছোট কাজ করতেই আমার সারাদিন পার হয়ে যায়।', en: 'I keep redoing/re-checking for perfection, so the whole day passes on a small task.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'আমি এতটাই ক্লান্ত এবং মানসিকভাবে নিস্তেজ ফিল করি যে কাজটার দিকে তাকিয়েও কোনো এনার্জি পাই না, আলসেমি করে বিছানায় পড়ে থাকি।', en: 'I feel so exhausted and mentally numb that even looking at the task drains me, lying in bed lethargically.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'আমার মাথায় সারাক্ষণ অন্য সব দুশ্চিন্তা ঘুরপাক খাবে বলে আমি কাজে বিন্দুমাত্র মনোযোগ ধরে রাখতে পারি না, মন ছটফট করে।', en: 'My mind keeps spinning with other worries, so I can\'t focus on the task at all, restless.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'আমি স্বাভাবিক মনোযোগ দিয়ে এবং সঠিক সময়ে কাজটি শেষ করতে পারি।', en: 'I can finish the task with normal focus and within proper time.' }, score: 0, tags: [] },
    ]},
    { id: 'sit_7', text: { bn: 'আপনি বাড়ি থেকে বের হয়ে কিছুদূর যাওয়ার পর হঠাৎ মনে হলো আপনি বোধহয় ঘরের মেইন দরজা লক করেননি বা গ্যাসের চুলা বন্ধ করেননি। আপনি তখন কী করেন?', en: 'After leaving home and going some distance, you suddenly feel you may not have locked the main door or turned off the gas. What do you do?' }, options: [
      { text: { bn: 'আমি জানি আমি লক করেছি, তাই ওটা পাত্তা না দিয়ে নিজের গন্তব্যে চলে যাই।', en: 'I know I locked it, so I ignore it and continue to my destination.' }, score: 0, tags: [] },
      { text: { bn: 'আমি ফিরে এসে একবার চেক করি এবং নিশ্চিত হয়ে চলে যাই।', en: 'I go back, check once, confirm, and leave.' }, score: 0, tags: [] },
      { text: { bn: 'আমি ফিরে এসে চেক করি, লক করা দেখলেও মনে খুতখুতানি দূর হয় না। আমি বারবার তালাটা ধরে টানি এবং চলে যাওয়ার পরও সারা রাস্তা শুধু ওই চিন্তাতেই অস্থির থাকি।', en: 'I go back and check, but even seeing it locked the unease doesn\'t go away; I keep tugging the lock, and remain anxious about it the whole way after.' }, score: 3, tags: ['ocd'] },
      { text: { bn: 'আমার মাথা পুরো ফাঁকা (blank) হয়ে যায়, প্যানিক অ্যাটাক শুরু হয় এবং মনে হয় এতক্ষণে আমার পুরো ঘর পুড়ে ছাই হয়ে গেছে।', en: 'My mind goes completely blank, a panic attack starts, and I feel my house has already burned to ashes by now.' }, score: 3, tags: ['anxiety', 'panic'] },
    ]},
    { id: 'sit_8', text: { bn: 'আপনার জীবনের একটি বড় পরিকল্পনা (যেমন ক্যারিয়ার বা বিশেষ কোনো রিলেশনশিপ) হুট করে ব্যর্থ হয়ে গেল। এই চরম ধাক্কায় আপনার পরবর্তী পদক্ষেপ কী হয়?', en: 'A major life plan (career or special relationship) suddenly fails. What is your next step after this severe blow?' }, options: [
      { text: { bn: 'আমি নিজেকে বোঝাই যে জীবনে এমন উত্থান-পতন আসতেই পারে, একটু সময় নিয়ে আমি বিকল্প কোনো পথ বা নতুন পরিকল্পনা তৈরি করি।', en: 'I remind myself such ups and downs are normal, and after some time I make an alternative plan.' }, score: 0, tags: [] },
      { text: { bn: 'আমি পুরোপুরি আশাহীন হয়ে পড়ি, মনে হয় আমার জীবনের এখানেই সমাপ্তি এবং নিজের ক্ষতি করার বা জীবন শেষ করে দেওয়ার তীব্র চিন্তা মাথায় আসে।', en: 'I become completely hopeless, feeling my life ends here, with intense thoughts of self-harm or ending my life.' }, score: 3, tags: ['depression', 'suicidal_active'], risk: 'critical' },
      { text: { bn: 'আমি সারাক্ষণ ছটফট করি, রাতে ঘুমাতে পারি না, আমার রক্তচাপ বেড়ে যায় এবং "কেন এমন হলো" এই চিন্তায় বুক ধড়ফড়ানি বন্ধ হয় না।', en: 'I\'m constantly restless, can\'t sleep at night, blood pressure rises, and "why did this happen" thoughts keep my heart racing.' }, score: 2, tags: ['anxiety'] },
      { text: { bn: 'আমি কোনো ধাক্কাই অনুভব করি না, উল্টো আমার মনে হয় আমি একাই একশ এবং পরদিনই কোনো পরিণতির কথা না ভেবে সম্পূর্ণ নতুন এক ঝুঁকিপূর্ণ কাজে টাকা বা সময় ইনভেস্ট করে বসি।', en: 'I feel no blow at all; instead I feel invincible and the very next day invest money/time in a completely new risky venture without thinking of consequences.' }, score: 3, tags: ['bipolar_flag'] },
    ]},
    { id: 'sit_9', text: { bn: 'আপনি গভীর রাতে আপনার ঘরে একা পড়াশোনা করছেন বা কাজ করছেন। হুট করে আপনার মনে হলো কেউ আপনার ঘরের জানালার বাইরে বা দেয়ালের ওপাশ থেকে আপনার নাম ধরে ফিসফিস করে ডাকলো, কিন্তু বাইরে কেউ নেই। আপনি তখন কী ভাববেন?', en: 'Late at night, alone in your room, you suddenly feel someone whispered your name from outside the window or wall, but no one is there. What would you think?' }, options: [
      { text: { bn: 'আমার মনে হবে এটা হয়তো আমার অতিরিক্ত ঘুমের অভাব বা ক্লান্তিজনিত মনের ভুল, তাই আমি ওটা পাত্তা না দিয়ে ঘুমাতে যাবো।', en: 'I\'d think it\'s probably a trick of the mind from lack of sleep or fatigue, and go to sleep ignoring it.' }, score: 0, tags: [] },
      { text: { bn: 'আমি প্রচণ্ড ভয় পেয়ে যাবো, ভূত বা চোরের ভয়ে ঘরের সব লাইট জ্বালিয়ে দেবো এবং সারারাত আতঙ্কে কাঁপবো।', en: 'I\'d be terrified, turning on all the lights fearing ghosts/thieves, trembling in fear all night.' }, score: 1, tags: ['anxiety'] },
      { text: { bn: 'আমি নিশ্চিত হবো যে এটি কোনো অদৃশ্য শক্তি, জিন বা কোনো স্পেশাল এনার্জি যা শুধু আমার সাথেই যোগাযোগ করতে পারে।', en: 'I\'d be certain it\'s some unseen force or special energy that can only communicate with me.' }, score: 3, tags: ['psychosis'], risk: 'high' },
    ]},
    { id: 'sit_10', text: { bn: 'আপনি একটি রেস্টুরেন্ট বা পাবলিক প্লেসে একা বসে আছেন। আশেপাশের কিছু মানুষ নিজেদের মধ্যে হাসাহাসি করছে বা ফিসফিস করে কথা বলছে। আপনার মনে প্রথম কী চিন্তা আসবে?', en: 'You\'re sitting alone in a restaurant/public place. Some nearby people are laughing or whispering among themselves. What\'s your first thought?' }, options: [
      { text: { bn: 'ওনারা নিজেদের কোনো বিষয় নিয়ে হাসছেন, এর সাথে আমার কোনো সম্পর্ক নেই।', en: 'They\'re laughing about their own matter, unrelated to me.' }, score: 0, tags: [] },
      { text: { bn: 'আমার একটু অস্বস্তি লাগবে, মনে হবে আমার জামা-কাপড় বা চুলে কোনো সমস্যা আছে কিনা যার জন্য ওনারা আমাকে নিয়ে মজা নিচ্ছেন।', en: 'I\'d feel a bit uneasy, wondering if something\'s wrong with my clothes/hair that they\'re mocking.' }, score: 2, tags: ['social_anxiety'] },
      { text: { bn: 'আমি নিশ্চিতভাবে জানি যে ওনারা আমাকে উদ্দেশ্য করেই ইশারা-ইঙ্গিতে কথা বলছেন এবং আমাকে অপমান করার জন্য ছক আঁকছেন।', en: 'I\'d be certain they\'re talking and gesturing specifically about me, plotting to humiliate me.' }, score: 3, tags: ['psychosis'], risk: 'moderate' },
    ]},
    { id: 'sit_11', text: { bn: 'আপনি সকালে ঘুম থেকে উঠলেন এবং দেখলেন আজকে চারপাশের আবহাওয়া খুব সুন্দর, বাড়ির সবাই খুব হাসিখুশি। কিন্তু আপনার নিজের ভেতর কেমন লাগবে?', en: 'You wake up to beautiful weather and everyone at home is cheerful. But how do you feel inside?' }, options: [
      { text: { bn: 'আবহাওয়া ও চারপাশের পরিবেশ দেখে আমারও বেশ ভালো ও ফ্রেশ লাগবে।', en: 'Seeing the weather and surroundings, I\'d also feel good and fresh.' }, score: 0, tags: [] },
      { text: { bn: 'চারপাশ যতই সুন্দর হোক, আমার ভেতরের মন পুরো শূন্য, অবশ এবং নিস্প্রাণ লাগবে; কোনো ভালো পরিস্থিতিই আমার ভেতরের কালো মেঘ সরাতে পারবে না।', en: 'No matter how beautiful, my inner mind feels completely empty, numb, lifeless; no good situation can clear my inner dark cloud.' }, score: 3, tags: ['depression'] },
      { text: { bn: 'চারপাশের মানুষের হাসিখুশি মুখ দেখে আমার উল্টো মেজাজ খিটখিটে হয়ে যাবে, মনে হবে সবাই খুব শব্দ করছে এবং আমার একা একটা অন্ধকার ঘরে পড়ে থাকতে ইচ্ছা করবে।', en: 'Seeing others\' cheerful faces makes me irritable instead, feeling everyone is too loud, wanting to lie alone in a dark room.' }, score: 2, tags: ['depression'] },
    ]},
    { id: 'sit_12', text: { bn: 'রাস্তায় চলার সময় বা ফেসবুক স্ক্রোল করার সময় হুট করে আপনার সামনে একটি মারাত্মক সড়ক দুর্ঘটনার ছবি বা নিউজ চলে আসলো। এটা দেখার পর আপনার কী অবস্থা হয়?', en: 'While walking or scrolling Facebook, a graphic road accident photo/news suddenly appears. What happens after seeing it?' }, options: [
      { text: { bn: 'একটু খারাপ লাগবে বা আফসোস হবে, তারপর আমি স্বাভাবিক অন্য কাজে মনোযোগ দেবো।', en: 'I\'d feel a bit bad or sorry, then move on to other normal tasks.' }, score: 0, tags: [] },
      { text: { bn: 'আমার অতীতের কোনো বড় দুর্ঘটনার ট্রমাটিক স্মৃতি হুবহু জীবন্ত হয়ে চোখের সামনে ভেসে উঠবে, বুক ধড়ফড় করবে এবং মনে হবে আমি নিজেই এখন ওই দুর্ঘটনার মধ্যে মরে যাচ্ছি।', en: 'A traumatic memory of my own past accident would vividly flash before my eyes, heart racing, feeling like I\'m dying in that accident right now.' }, score: 3, tags: ['ptsd'] },
      { text: { bn: 'ছবিটা দেখার পর আমার মাথায় সারাক্ষণ একটা ভয় কাজ করবে যে আমি বা আমার কোনো প্রিয়জনও এখনই এমন দুর্ঘটনায় মারা যাবে এবং আমি সেই ভয়ে রাস্তায় বের হওয়া বন্ধ করে দেবো।', en: 'After seeing it, I\'d be constantly fearful that I or a loved one will die in such an accident, stopping me from going outside.' }, score: 3, tags: ['anxiety', 'agoraphobia'] },
    ]},
    { id: 'sit_13', text: { bn: 'আপনি একটি গ্রুপ প্রজেক্ট বা পারিবারিক অনুষ্ঠানে আছেন যেখানে অন্য কেউ একটি ভালো কাজের জন্য অনেক প্রশংসা পাচ্ছে, কিন্তু আপনার দিকে কেউ তেমন মনোযোগ দিচ্ছে না। আপনার কেমন লাগবে?', en: 'In a group project or family event, someone else is being praised a lot while no one pays much attention to you. How would you feel?' }, options: [
      { text: { bn: 'তার ভালো কাজের জন্য আমি খুশি হবো এবং স্বাভাবিকভাবে অনুষ্ঠান উপভোগ করবো।', en: 'I\'d be happy for them and enjoy the event normally.' }, score: 0, tags: [] },
      { text: { bn: 'আমার তীব্র হিংসা ও ক্ষোভ হবে। আমার মনে হবে এই গ্রুপের সবচেয়ে স্পেশাল বা বুদ্ধিমান মানুষ আমি, অথচ এই মূর্খরা আমাকে বাদ দিয়ে অন্যকে প্রশংসা করছে।', en: 'I\'d feel intense jealousy and resentment, feeling I\'m the most special/intelligent person here, yet these fools praise someone else over me.' }, score: 3, tags: ['narcissistic'] },
      { text: { bn: 'আমার মনে হবে আমি আসলে খুব নগণ্য ও কুৎসিত একজন মানুষ, আমার কোনো যোগ্যতা নেই বলেই কেউ আমাকে পাত্তা দেয় না, এই ভেবে আমি এক কোনায় গিয়ে মুখ কালো করে বসে থাকবো।', en: 'I\'d feel like an insignificant, ugly person with no worth, which is why no one notices me, sitting glumly in a corner.' }, score: 2, tags: ['depression', 'social_anxiety'] },
    ]},
    { id: 'sit_14', text: { bn: 'জীবনের কোনো এক পর্যায়ে আপনার তীব্র মন খারাপ বা রাগ হলো। এই সময় সাধারণত নিজেকে শান্ত করার জন্য আপনার কোন আচরণটি প্রকাশ পায়?', en: 'At some point you feel intensely upset or angry. What behavior typically emerges to calm yourself?' }, options: [
      { text: { bn: 'আমি গান শুনি, ঘুমানোর চেষ্টা করি বা বিশ্বস্ত কারও সাথে কথা বলে মন হালকা করি।', en: 'I listen to music, try to sleep, or talk to someone trusted to lighten my mood.' }, score: 0, tags: [] },
      { text: { bn: 'আমি নিজেকে পুরো ঘরবন্দি করে দিন দুনিয়া থেকে আলাদা হয়ে যাই, ফোন অফ করে দিই।', en: 'I confine myself entirely, cutting off from the world, turning off my phone.' }, score: 2, tags: ['depression'] },
      { text: { bn: 'আমি ব্লেড দিয়ে নিজের হাত কাটি, সিগারেটের ছ্যাঁকা দিই বা ড্রাগস/অ্যালকোহল নিয়ে নিজেকে অবশ করার চেষ্টা করি এই মেন্টাল পেইন থেকে বাঁচতে।', en: 'I cut myself with a blade, burn myself with cigarettes, or numb myself with drugs/alcohol to escape this mental pain.' }, score: 3, tags: ['borderline', 'self_harm_flag'], risk: 'high' },
    ]},
    { id: 'sit_15', text: { bn: 'আয়নায় নিজের চেহারার বা ওজনের দিকে তাকানোর পর আপনার মাথায় কোন চিন্তাটি সবচেয়ে বেশি ঘোরে?', en: 'Looking at your face/weight in the mirror, what thought dominates your mind?' }, options: [
      { text: { bn: 'আমার শরীর যেমন আছে আমি তা নিয়ে সন্তুষ্ট এবং সুস্থ থাকার চেষ্টা করি।', en: 'I\'m content with my body as it is and try to stay healthy.' }, score: 0, tags: [] },
      { text: { bn: 'আমার শরীর শুকিয়ে কঙ্কাল হয়ে গেলেও আয়নায় আমার মনে হয় আমি অনেক মোটা হয়ে যাচ্ছি, এবং এই ভয়ে আমি খাওয়াদাওয়া প্রায় পুরোপুরি বন্ধ করে দিয়েছি।', en: 'Even though my body has become skeletal, in the mirror I feel I\'m getting very fat, and out of this fear I\'ve almost completely stopped eating.' }, score: 3, tags: ['eating'] },
      { text: { bn: 'মন খারাপ থাকলে আমি প্রচুর পরিমাণে জাঙ্ক ফুড বা মিষ্টি একসাথে খেয়ে ফেলি, আর পরে ওজন বাড়ার অপরাধবোধে নিজে নিজেই আঙুল মুখে দিয়ে বমি করে পেট খালি করি।', en: 'When upset I binge eat junk food/sweets, then out of guilt over weight gain I make myself vomit to empty my stomach.' }, score: 3, tags: ['eating'] },
    ]},
  ],
};

const ALL_SEGMENTS: Segment[] = [
  depressionSegment,
  anxietySegment,
  ocdSegment,
  traumaPsychosisSegment,
  situationalSegment,
];

/* ======================= DOMAIN DISPLAY NAMES (bilingual) ======================= */
const DOMAIN_DISPLAY: Record<string, Bilingual> = {
  depression: { bn: 'বিষণ্নতার (Depression) লক্ষণ', en: 'Depressive symptoms' },
  bipolar_flag: { bn: 'মুড পরিবর্তনের প্যাটার্ন (আরও মূল্যায়ন প্রয়োজন)', en: 'Mood fluctuation pattern (further evaluation advised)' },
  anxiety: { bn: 'অ্যাংজাইটি-সম্পর্কিত লক্ষণ', en: 'Anxiety-related symptoms' },
  panic: { bn: 'প্যানিক-সম্পর্কিত লক্ষণ', en: 'Panic-related symptoms' },
  social_anxiety: { bn: 'সামাজিক অ্যাংজাইটি লক্ষণ', en: 'Social anxiety symptoms' },
  agoraphobia: { bn: 'অ্যাগোরাফোবিয়া-সম্পর্কিত এড়িয়ে চলা', en: 'Agoraphobia-related avoidance' },
  phobia: { bn: 'নির্দিষ্ট ফোবিয়ার প্যাটার্ন', en: 'Specific phobia pattern' },
  health_anxiety: { bn: 'স্বাস্থ্য নিয়ে অতিরিক্ত উদ্বেগের প্যাটার্ন', en: 'Health-anxiety pattern' },
  substance_risk: { bn: 'মাদক/ওষুধ ব্যবহারের ঝুঁকি ইঙ্গিত', en: 'Substance-use risk indicator' },
  ocd: { bn: 'অবসেসিভ-কম্পালসিভ (OCD) লক্ষণ প্যাটার্ন', en: 'Obsessive-Compulsive symptom patterns' },
  hoarding: { bn: 'হোর্ডিং-সম্পর্কিত প্যাটার্ন', en: 'Hoarding-related pattern' },
  good_insight: { bn: 'OCD ইনসাইট ইঙ্গিত (ভালো/মাঝারি)', en: 'OCD insight indicator (fair/good)' },
  poor_insight: { bn: 'OCD ইনসাইট ইঙ্গিত (দুর্বল)', en: 'OCD insight indicator (poor)' },
  ptsd: { bn: 'ট্রমা-সম্পর্কিত (PTSD) লক্ষণ প্যাটার্ন', en: 'Trauma-related (PTSD) symptom patterns' },
  dissociation: { bn: 'ডিসোসিয়েটিভ লক্ষণ প্যাটার্ন', en: 'Dissociative symptom pattern' },
  psychosis: { bn: 'বাস্তবতা-উপলব্ধি সম্পর্কিত লক্ষণ (পেশাদার মূল্যায়ন জোরালোভাবে প্রয়োজন)', en: 'Reality-testing related symptoms (professional evaluation strongly advised)' },
  borderline: { bn: 'আবেগগত অস্থিরতার প্যাটার্ন (Borderline traits)', en: 'Emotional instability pattern (Borderline traits)' },
  narcissistic: { bn: 'আত্মম্ভাবিতা ও সহানুভূতি-সম্পর্কিত বৈশিষ্ট্য', en: 'Self-image & empathy related traits' },
  eating: { bn: 'খাদ্যাভ্যাস ও শরীরের আকৃতি-সম্পর্কিত লক্ষণ', en: 'Eating & body-image related symptoms' },
  self_harm_flag: { bn: 'নিজের ক্ষতি করার ঝুঁকি ইঙ্গিত', en: 'Self-harm risk indicator' },
  suicidal_passive: { bn: 'প্যাসিভ সুইসাইডাল চিন্তাভাবনা', en: 'Passive suicidal ideation' },
  suicidal_active: { bn: 'অ্যাকটিভ সুইসাইডাল চিন্তাভাবনা', en: 'Active suicidal ideation' },
};

/* ======================= SCORING ENGINE ======================= */
function severityLabel(pct: number): SymptomScore['severity'] {
  if (pct <= 25) return 'Low';
  if (pct <= 50) return 'Mild';
  if (pct <= 75) return 'Moderate';
  return 'High';
}

function calculateResults(answers: Record<string, number>): AssessmentResult {
  const tagAgg: Record<string, { score: number; count: number }> = {};
  let criticalRisk = false;
  const riskOrder: RiskLevel[] = ['none', 'low', 'moderate', 'high', 'critical'];
  let highestRisk: RiskLevel = 'none';

  for (const seg of ALL_SEGMENTS) {
    for (const q of seg.questions) {
      const idx = answers[q.id];
      if (idx === undefined) continue;
      const opt = q.options[idx];
      if (!opt) continue;
      if (opt.risk && riskOrder.indexOf(opt.risk) > riskOrder.indexOf(highestRisk)) highestRisk = opt.risk;
      if (opt.risk === 'critical' || opt.risk === 'high') criticalRisk = true;
      for (const tag of opt.tags) {
        if (!tagAgg[tag]) tagAgg[tag] = { score: 0, count: 0 };
        tagAgg[tag].score += opt.score;
        tagAgg[tag].count += 1;
      }
    }
  }

  const scores: SymptomScore[] = Object.entries(tagAgg).map(([tag, v]) => {
    const maxScore = v.count * 3;
    const percentage = maxScore > 0 ? Math.round((v.score / maxScore) * 100) : 0;
    return {
      domain: DOMAIN_DISPLAY[tag] || { bn: tag, en: tag },
      rawScore: v.score,
      maxScore,
      percentage,
      severity: severityLabel(percentage),
    };
  });

  const flaggedDomains = scores.filter((s) => s.severity === 'Moderate' || s.severity === 'High');
  return {
    scores: scores.sort((a, b) => b.percentage - a.percentage),
    flaggedDomains,
    criticalRisk,
    completedAt: new Date().toISOString(),
  };
}

/* ======================= RECOMMENDATIONS (bilingual, keyed by domain tag) ======================= */
interface ExerciseGuide { title: Bilingual; steps: Bilingual[]; }

const RECOMMENDATIONS: Record<string, ExerciseGuide[]> = {
  depression: [
    { title: { bn: 'Behavioral Activation', en: 'Behavioral Activation' }, steps: [
      { bn: 'মন ভালো না লাগলেও ছোট একটা কাজ (বিছানা গোছানো, ৫ মিনিট হাঁটা) জোর করে করুন।', en: 'Even if you don\'t feel like it, force yourself to do a small task (make the bed, walk 5 minutes).' },
      { bn: 'কাজ শেষ করার অনুভূতিটা নোট করুন — এটাই ব্রেইনে ডোপামিন রিলিজ করে।', en: 'Notice the feeling of completing it — this releases dopamine in the brain.' },
    ]},
    { title: { bn: 'Three Good Things', en: 'Three Good Things' }, steps: [
      { bn: 'প্রতি রাতে ঘুমানোর আগে দিনের ৩টি ভালো জিনিস ডায়েরিতে লিখুন।', en: 'Each night before sleep, write down 3 good things from the day in a journal.' },
    ]},
  ],
  anxiety: [
    { title: { bn: '5-4-3-2-1 গ্রাউন্ডিং', en: '5-4-3-2-1 Grounding' }, steps: [
      { bn: '৫টি জিনিস দেখুন, ৪টি স্পর্শ করুন, ৩টি শব্দ শুনুন, ২টি গন্ধ নিন, ১টি স্বাদ অনুভব করুন।', en: 'See 5 things, touch 4, hear 3 sounds, smell 2, taste 1.' },
    ]},
    { title: { bn: 'Worry Time', en: 'Worry Time' }, steps: [
      { bn: 'দিনের একটা নির্দিষ্ট ২০ মিনিট সময় ঠিক করুন দুশ্চিন্তার জন্য, বাকি সময় "এখন না, পরে" বলুন।', en: 'Set a fixed 20-minute slot each day for worrying; otherwise say "not now, later."' },
    ]},
  ],
  panic: [
    { title: { bn: 'বক্স ব্রিদিং', en: 'Box Breathing' }, steps: [
      { bn: '৪ সেকেন্ড শ্বাস নিন, ৪ সেকেন্ড ধরে রাখুন, ৪ সেকেন্ড ছাড়ুন, ৪ সেকেন্ড খালি রাখুন — ৪-৫ বার।', en: 'Inhale 4s, hold 4s, exhale 4s, hold empty 4s — repeat 4-5 times.' },
    ]},
  ],
  ocd: [
    { title: { bn: 'ERP — প্রাথমিক পরিচিতি', en: 'ERP — Brief Introduction' }, steps: [
      { bn: 'একজন licensed therapist-এর supervision-এ ERP সবচেয়ে নিরাপদ — নিজে নিজে শুরু করার আগে পরামর্শ নিন।', en: 'ERP is safest under a licensed therapist\'s supervision — consult before attempting alone.' },
    ]},
    { title: { bn: 'Brain Lock 4-Step', en: 'Brain Lock 4-Step' }, steps: [
      { bn: 'Relabel: "এটা OCD-র চিন্তা, বাস্তব নয়"', en: 'Relabel: "This is an OCD thought, not reality."' },
      { bn: 'Reattribute: ব্রেইন কেমিস্ট্রির কারণে চিন্তাটা আসছে', en: 'Reattribute: it\'s due to brain chemistry.' },
      { bn: 'Refocus: ১৫ মিনিট অন্য কাজে মন দিন', en: 'Refocus: spend 15 minutes on another activity.' },
      { bn: 'Revalue: চিন্তাটাকে কম গুরুত্ব দিন', en: 'Revalue: give the thought less importance.' },
    ]},
  ],
  ptsd: [
    { title: { bn: 'Butterfly Hug', en: 'Butterfly Hug' }, steps: [
      { bn: 'দুই হাত বুকের ওপর আড়াআড়ি রাখুন, কাঁধে মৃদু ট্যাপ করুন, মনে মনে বলুন "আমি এখন নিরাপদ"।', en: 'Cross your arms over your chest, gently tap your shoulders, and tell yourself "I am safe now."' },
    ]},
    { title: { bn: 'Safe Place Visualization', en: 'Safe Place Visualization' }, steps: [
      { bn: 'চোখ বন্ধ করে একটা নিরাপদ, শান্ত দৃশ্য কল্পনা করুন — শব্দ, রং, গন্ধ বিস্তারিত মনে আনুন।', en: 'Close your eyes and imagine a calm, safe scene — recall its sounds, colors, smells in detail.' },
    ]},
  ],
  psychosis: [
    { title: { bn: 'Grounding through physical senses', en: 'Grounding through physical senses' }, steps: [
      { bn: 'মেঝেতে খালি পায়ে হাঁটুন বা ঠান্ডা পানি/বরফ ধরুন — শরীরের সংবেদন বাস্তবতার সাথে যুক্ত করতে সাহায্য করে।', en: 'Walk barefoot or hold cold water/ice — helps connect the body to present reality.' },
      { bn: 'এই domain-এ symptom থাকলে দ্রুত একজন psychiatrist-এর সাথে সরাসরি কথা বলা সবচেয়ে গুরুত্বপূর্ণ পরবর্তী পদক্ষেপ।', en: 'If symptoms in this domain are present, speaking directly with a psychiatrist soon is the most important next step.' },
    ]},
  ],
  borderline: [
    { title: { bn: 'TIPP Technique', en: 'TIPP Technique' }, steps: [
      { bn: 'Temperature: চোখে-মুখে ঠান্ডা পানির ঝাপটা দিন', en: 'Temperature: splash cold water on your face.' },
      { bn: 'Intense Exercise: ২০টা পুশ-আপ বা জাম্পিং করুন', en: 'Intense Exercise: do 20 push-ups or jumping jacks.' },
      { bn: 'Paced Breathing: ৫ সেকেন্ড শ্বাস, ৭ সেকেন্ড ছাড়ুন', en: 'Paced Breathing: inhale 5s, exhale 7s.' },
      { bn: 'Paired Muscle Relaxation: পেশি শক্ত করে ছেড়ে দিন', en: 'Paired Muscle Relaxation: tense muscles then release.' },
    ]},
    { title: { bn: 'The 24-Hour Rule', en: 'The 24-Hour Rule' }, steps: [
      { bn: 'তীব্র ইমোশনের সময় বড় সিদ্ধান্ত বা বার্তা পাঠানো ২৪ ঘণ্টা পিছিয়ে দিন।', en: 'Postpone major decisions or messages by 24 hours during intense emotion.' },
    ]},
  ],
  narcissistic: [
    { title: { bn: 'The Empathy Lens', en: 'The Empathy Lens' }, steps: [
      { bn: 'অন্যের জায়গায় নিজেকে কল্পনা করে ভাবুন তার কেমন লাগছে।', en: 'Imagine yourself in the other person\'s shoes and consider how they feel.' },
    ]},
    { title: { bn: 'Flaw Journaling', en: 'Flaw Journaling' }, steps: [
      { bn: 'সপ্তাহে একদিন নিজের ৩টি ভুল লিখে স্বীকার করুন।', en: 'Once a week, write down and acknowledge 3 of your own mistakes.' },
    ]},
  ],
  eating: [
    { title: { bn: 'Mirror Re-framing', en: 'Mirror Re-framing' }, steps: [
      { bn: 'আয়নায় খুঁত না খুঁজে শরীরের কার্যকারিতার প্রশংসা করুন।', en: 'Instead of finding flaws in the mirror, appreciate what your body does for you.' },
    ]},
    { title: { bn: 'Mindful Eating', en: 'Mindful Eating' }, steps: [
      { bn: 'ফোন/টিভি বন্ধ রেখে প্রতি লোকমা ধীরে চিবিয়ে খান, স্বাদ অনুভব করুন।', en: 'With phone/TV off, chew each bite slowly and savor the taste.' },
    ]},
  ],
};

function getRecommendationsByTags(tags: string[]): Record<string, ExerciseGuide[]> {
  const result: Record<string, ExerciseGuide[]> = {};
  for (const tag of tags) if (RECOMMENDATIONS[tag]) result[tag] = RECOMMENDATIONS[tag];
  return result;
}

const CRISIS_RESOURCES_BD = [
  { bn: 'Kaan Pete Roi (মানসিক সহায়তা হেল্পলাইন)', en: 'Kaan Pete Roi (mental health helpline)', value: '09606-282525 / 09606-282526' },
  { bn: 'জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন', en: 'National Mental Health Helpline', value: '09611-677777 / 109 (toll-free)' },
  { bn: 'জরুরি জাতীয় সেবা', en: 'National Emergency Service', value: '999' },
];

/* ======================= UI TEXT DICTIONARY ======================= */
const UI = {
  appTitle: { bn: 'Psychological Assessment', en: 'Psychological Assessment' },
  chooseLanguage: { bn: 'আপনার পছন্দের ভাষা বাছাই করুন', en: 'Choose your preferred language' },
  langBn: { bn: 'বাংলা', en: 'বাংলা' },
  langEn: { bn: 'English', en: 'English' },
  welcomeBody: {
    bn: 'আপনার মানসিক স্বাস্থ্য সরাসরি প্রভাব ফেলে আপনার ফোকাস, প্রোডাক্টিভিটি, সিদ্ধান্ত গ্রহণের ক্ষমতা এবং সম্পর্কের উপর। এই অ্যাসেসমেন্টটি কিছু সম্ভাব্য মানসিক symptom pattern চিহ্নিত করতে সাহায্য করবে।',
    en: 'Your mental health directly affects your focus, productivity, decision-making, and relationships. This assessment helps identify possible psychological symptom patterns.',
  },
  estTime: { bn: 'আনুমানিক সময়: ১২-১৫ মিনিট', en: 'Estimated time: 12-15 minutes' },
  welcomeDisclaimer: {
    bn: 'এটি কোনো ক্লিনিক্যাল ডায়াগনোসিস নয়। ফলাফল শুধুমাত্র স্ক্রিনিং ও সচেতনতার উদ্দেশ্যে। চূড়ান্ত সিদ্ধান্তের জন্য একজন লাইসেন্সড সাইকিয়াট্রিস্ট/সাইকোলজিস্টের পরামর্শ নিন।',
    en: 'This is not a clinical diagnosis. Results are for screening and awareness purposes only. Consult a licensed psychiatrist/psychologist for a final assessment.',
  },
  startBtn: { bn: 'শুরু করুন', en: 'Start' },
  questionLabel: { bn: 'প্রশ্ন', en: 'Question' },
  backBtn: { bn: 'পেছনে', en: 'Back' },
  nextBtn: { bn: 'পরবর্তী', en: 'Next' },
  finishBtn: { bn: 'সম্পন্ন করুন', en: 'Finish' },
  crisisTitle: { bn: 'আপনি একা নন — এখনই সাহায্য নিন', en: 'You are not alone — get help now' },
  crisisFooter: { bn: 'এই রিপোর্ট কোনো চিকিৎসা বা জরুরি সাহায্যের বিকল্প নয়।', en: 'This report is not a substitute for medical or emergency help.' },
  domainsTitle: { bn: 'চিহ্নিত লক্ষণ ক্ষেত্রসমূহ', en: 'Identified Symptom Domains' },
  observationTitle: { bn: 'ক্লিনিক্যাল অবজারভেশন নোট', en: 'Clinical Observation Note' },
  observationFlagged: {
    bn: 'আপনার উত্তরের ভিত্তিতে নিচের ক্ষেত্রগুলোতে symptom pattern লক্ষ্য করা গেছে যা মাঝারি থেকে তীব্র পর্যায়ের হতে পারে: ',
    en: 'Based on your answers, symptom patterns were observed in the following areas that may range from moderate to severe: ',
  },
  observationFlaggedTail: {
    bn: '। একজন লাইসেন্সড psychiatrist বা psychologist-এর সাথে সরাসরি assessment করানো অত্যন্ত গুরুত্বপূর্ণ।',
    en: '. A direct assessment with a licensed psychiatrist or psychologist is strongly recommended.',
  },
  noFlagged: {
    bn: 'আপাতদৃষ্টিতে কোনো তীব্র সমস্যার লক্ষণ পাওয়া যায়নি। তবুও নিয়মিত self-care চালিয়ে যান।',
    en: 'No significantly elevated symptom patterns were found. Continue regular self-care nonetheless.',
  },
  exercisesSuffix: { bn: 'এর জন্য প্রস্তাবিত এক্সারসাইজ', en: 'Recommended Exercises' },
  downloadBtn: { bn: 'রিপোর্ট ডাউনলোড করুন (PDF)', en: 'Download Report (PDF)' },
  disclaimerTitle: { bn: 'Disclaimer', en: 'Disclaimer' },
  disclaimerBody: {
    bn: 'এই রিপোর্ট কোনো ক্লিনিক্যাল ডায়াগনোসিস নয়। এটি শুধুমাত্র educational ও screening উদ্দেশ্যে তৈরি। এই রিপোর্টের ভিত্তিতে কোনো ওষুধ শুরু, বন্ধ বা পরিবর্তন করবেন না। সঠিক ডায়াগনোসিস ও চিকিৎসার জন্য একজন লাইসেন্সড সাইকিয়াট্রিস্ট বা ক্লিনিক্যাল সাইকোলজিস্টের পরামর্শ নিন।',
    en: 'This report is not a clinical diagnosis. It is intended for educational and screening purposes only. Do not start, stop, or modify any medication based on this report. Consult a licensed psychiatrist or clinical psychologist for proper diagnosis and treatment.',
  },
};

/* ======================= MAIN COMPONENT ======================= */
type Screen = 'language' | 'welcome' | 'assessment' | 'result';

export default function PsychologicalAssessmentApp() {
  const [screen, setScreen] = useState<Screen>('language');
  const [lang, setLang] = useState<Lang>('bn');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const allQuestions = ALL_SEGMENTS.flatMap((s) => s.questions);
  const currentQ = allQuestions[step];
  const segmentIndex = currentQ
    ? ALL_SEGMENTS.findIndex((s) => s.questions.some((q) => q.id === currentQ.id))
    : 0;

  function chooseLanguage(l: Lang) {
    setLang(l);
    setScreen('welcome');
  }
  function startAssessment() {
    setScreen('assessment');
    setStep(0);
    setAnswers({});
  }
  function selectOption(idx: number) {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
  }
  function goNext() {
    if (step < allQuestions.length - 1) setStep(step + 1);
    else {
      setResult(calculateResults(answers));
      setScreen('result');
    }
  }
  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  async function downloadPdf() {
    if (!result) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 20;

    if (result.criticalRisk) {
      doc.setFontSize(12);
      doc.setTextColor(200, 0, 0);
      doc.text('Immediate Support Resources (Bangladesh):', 20, y);
      y += 7;
      doc.setFontSize(9);
      CRISIS_RESOURCES_BD.forEach((r) => {
        doc.text(`${r.en}: ${r.value}`, 20, y);
        y += 5;
      });
      y += 5;
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(18);
    doc.text('Psychological Assessment Report', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(result.completedAt).toLocaleString()}`, 20, y);
    y += 12;

    doc.setFontSize(13);
    doc.text('Identified Symptom Domains', 20, y);
    y += 8;
    doc.setFontSize(10);
    result.scores.forEach((s) => {
      doc.text(`${s.domain.en}: ${s.severity} (${s.percentage}%)`, 20, y);
      y += 6;
    });

    y += 6;
    doc.setFontSize(13);
    doc.text('Clinical Observation Note', 20, y);
    y += 8;
    doc.setFontSize(10);
    const note =
      result.flaggedDomains.length > 0
        ? `Elevated symptom patterns observed in: ${result.flaggedDomains.map((d) => d.domain.en).join(', ')}. Professional evaluation by a licensed psychiatrist/psychologist is strongly recommended.`
        : 'No significantly elevated symptom patterns observed. Continue regular self-care.';
    const noteLines = doc.splitTextToSize(note, 170);
    doc.text(noteLines, 20, y);
    y += noteLines.length * 6 + 10;

    doc.setFontSize(13);
    doc.text('Disclaimer', 20, y);
    y += 8;
    doc.setFontSize(9);
    const disclaimer =
      'This report is not a clinical diagnosis. It is intended for educational and screening purposes only. Do not start, stop, or modify any medication based on this report. For diagnosis and treatment, consult a licensed psychiatrist or clinical psychologist.';
    const discLines = doc.splitTextToSize(disclaimer, 170);
    doc.text(discLines, 20, y);

    doc.save('psychological-assessment-report.pdf');
  }

  /* ---------- LANGUAGE SELECT SCREEN ---------- */
  if (screen === 'language') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-md p-10 text-center space-y-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            Psychological Assessment
          </h1>
          <p className="text-slate-300">আপনার পছন্দের ভাষা বাছাই করুন<br />Choose your preferred language</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => chooseLanguage('bn')} className="btn-primary px-8 py-3 rounded-xl font-semibold">
              বাংলা
            </button>
            <button onClick={() => chooseLanguage('en')} className="btn-primary px-8 py-3 rounded-xl font-semibold">
              English
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- WELCOME SCREEN ---------- */
  if (screen === 'welcome') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-xl p-10 text-center space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            {t(UI.appTitle, lang)}
          </h1>
          <p className="text-slate-300 leading-relaxed">{t(UI.welcomeBody, lang)}</p>
          <p className="text-sm text-slate-400">{t(UI.estTime, lang)}</p>
          <div className="text-xs text-slate-500 border border-white/10 rounded-lg p-3">{t(UI.welcomeDisclaimer, lang)}</div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={startAssessment} className="btn-primary inline-block px-8 py-3 rounded-xl font-semibold">
              {t(UI.startBtn, lang)}
            </button>
            <button onClick={() => setScreen('language')} className="text-xs text-slate-400 underline">
              {lang === 'bn' ? 'ভাষা পরিবর্তন করুন' : 'Change language'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- ASSESSMENT SCREEN ---------- */
  if (screen === 'assessment' && currentQ) {
    const pct = Math.round(((step + 1) / allQuestions.length) * 100);
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-full max-w-2xl space-y-2">
          <p className="text-sm text-slate-400">
            {t(ALL_SEGMENTS[segmentIndex].displayName, lang)} · {t(UI.questionLabel, lang)} {step + 1} / {allQuestions.length}
          </p>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="glass-card p-8 max-w-2xl w-full">
          <p className="text-lg font-medium mb-6 leading-relaxed">{t(currentQ.text, lang)}</p>
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                className={`option-btn w-full text-left p-4 rounded-xl border border-white/10 ${
                  answers[currentQ.id] === idx ? 'selected border-emerald-500' : ''
                }`}
              >
                {t(opt.text, lang)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-2xl justify-between">
          <button onClick={goBack} disabled={step === 0} className="px-6 py-2 rounded-lg border border-white/10 disabled:opacity-30">
            {t(UI.backBtn, lang)}
          </button>
          <button
            onClick={goNext}
            disabled={answers[currentQ.id] === undefined}
            className="btn-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-30"
          >
            {step === allQuestions.length - 1 ? t(UI.finishBtn, lang) : t(UI.nextBtn, lang)}
          </button>
        </div>
      </main>
    );
  }

  /* ---------- RESULT SCREEN ---------- */
  if (screen === 'result' && result) {
    const flaggedTags = Object.keys(RECOMMENDATIONS).filter((tag) =>
      result.flaggedDomains.some((d) => DOMAIN_DISPLAY[tag] && d.domain.en === DOMAIN_DISPLAY[tag].en)
    );
    const recs = getRecommendationsByTags(flaggedTags);

    return (
      <main className="min-h-screen p-6 flex flex-col items-center gap-8 max-w-3xl mx-auto">
        {result.criticalRisk && (
          <div className="w-full glass-card border-2 border-red-500/50 p-6 bg-red-500/10 text-red-200">
            <p className="font-semibold mb-2">{t(UI.crisisTitle, lang)}</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              {CRISIS_RESOURCES_BD.map((r) => (
                <li key={r.en}>{lang === 'bn' ? r.bn : r.en}: {r.value}</li>
              ))}
            </ul>
            <p className="text-xs mt-3 text-red-300/80">{t(UI.crisisFooter, lang)}</p>
          </div>
        )}

        <div className="glass-card w-full p-8">
          <h2 className="text-2xl font-bold mb-6">{t(UI.domainsTitle, lang)}</h2>
          <div className="space-y-4">
            {result.scores.map((s) => (
              <div key={s.domain.en}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t(s.domain, lang)}</span>
                  <span>{s.severity}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-400" style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {result.flaggedDomains.length > 0 ? (
          <div className="glass-card w-full p-8">
            <h2 className="text-2xl font-bold mb-4">{t(UI.observationTitle, lang)}</h2>
            <p className="text-slate-300 leading-relaxed">
              {t(UI.observationFlagged, lang)}
              <strong>{result.flaggedDomains.map((d) => t(d.domain, lang)).join(', ')}</strong>
              {t(UI.observationFlaggedTail, lang)}
            </p>
          </div>
        ) : (
          <div className="glass-card w-full p-8 text-center">
            <p className="text-emerald-400 font-semibold">{t(UI.noFlagged, lang)}</p>
          </div>
        )}

        {Object.entries(recs).map(([tag, exercises]) => (
          <div key={tag} className="glass-card w-full p-8">
            <h3 className="text-xl font-semibold mb-4">
              {t(DOMAIN_DISPLAY[tag], lang)} — {t(UI.exercisesSuffix, lang)}
            </h3>
            {exercises.map((ex) => (
              <div key={ex.title.en} className="mb-4">
                <p className="font-medium text-emerald-400">{t(ex.title, lang)}</p>
                <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                  {ex.steps.map((s, i) => (
                    <li key={i}>{t(s, lang)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        <button onClick={downloadPdf} className="btn-primary px-6 py-3 rounded-xl font-semibold">
          {t(UI.downloadBtn, lang)}
        </button>

        <div className="glass-card w-full p-6 text-xs text-slate-400 border border-white/10">
          <strong>{t(UI.disclaimerTitle, lang)}:</strong> {t(UI.disclaimerBody, lang)}
        </div>
      </main>
    );
  }

  return null;
}