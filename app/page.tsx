'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, RotateCcw, Shield, Sparkles, 
  Brain, Heart, Activity, Eye, Zap, CheckCircle2, BarChart2, Download, AlertTriangle, Info
} from 'lucide-react';

const SEGMENTS = [
  {
    name: "Segment 1: Obsessive-Compulsive Patterns (OCD & Perfectionism Check)",
    icon: Brain,
    color: "from-emerald-400 to-teal-500",
    questions: [
      { id: 1, text: "সবকিছু একদম নিখুঁত বা সুনির্দিষ্ট নিয়মে না হলে আমার তীব্র অস্বস্তি হয় এবং একই কাজ আমি বারবার পরীক্ষা করি (যেমন: লক, হাত ধোয়া, বা গোছানো)।", type: "positive", disorder: "OCD" },
      { id: 2, text: "আমার মাথায় অনাকাঙ্ক্ষিত কোনো চিন্তা বা ছবি বারবার ঘুরপাক খায়, যা আমি চাইলেও মন থেকে তাড়াতে পারি না।", type: "positive", disorder: "OCD" },
      { id: 3, text: "কোনো কাজ এক চুল এদিক-ওদিক হলে আমি চরম বিরক্ত হই এবং পারফেকশনিজমের চক্করে পড়ে কাজ শেষ করতে অনেক বেশি সময় নষ্ট করি।", type: "positive", disorder: "OCD" },
      { id: 4, text: "আমি কাজের নিয়ম বা জিনিসপত্রের বিন্যাস নিয়ে খুব একটা মাথা ঘামাই না, অগোছালো পরিবেশেও শান্ত থাকতে পারি।", type: "reverse", disorder: "OCD" }
    ]
  },
  {
    name: "Segment 2: Generalized Anxiety & Chronic Overthinking",
    icon: Activity,
    color: "from-amber-400 to-orange-500",
    questions: [
      { id: 5, text: "আমি প্রায়সময়ই কোনো না কোনো ছোটখাটো বিষয় নিয়ে অতিরিক্ত চিন্তা (Overthinking) করি এবং মস্তিস্ক শান্ত করতে পারি না।", type: "positive", disorder: "Anxiety" },
      { id: 6, text: "ভবিষ্যতে খারাপ কিছু ঘটবে—এই ভয়ে আমি প্রায়ই আতঙ্কিত বা তীব্র বুকধড়ফড়ানি (Panic) অনুভব করি।", type: "positive", disorder: "Anxiety" },
      { id: 7, text: "হুটকরে কোনো সিদ্ধান্ত নিতে গেলে আমার হাত-পা কাঁপে বা তীব্র মানসিক চাপ অনুভব করি।", type: "positive", disorder: "Anxiety" },
      { id: 8, text: "আমি সাধারণত যেকোনো পরিস্থিতিতে বেশ রিল্যাক্সড এবং শান্ত মেজাজে থাকতে পারি।", type: "reverse", disorder: "Anxiety" }
    ]
  },
  {
    name: "Segment 3: Depressive Tendencies & Energy Depletion",
    icon: Heart,
    color: "from-blue-400 to-indigo-500",
    questions: [
      { id: 9, text: "অধিকাংশ সময়ই আমার কোনো কিছু করতে ভালো লাগে না, একসময়ের প্রিয় কাজগুলোর প্রতিও আমি আগ্রহ হারিয়ে ফেলেছি।", type: "positive", disorder: "Depression" },
      { id: 10, text: "আমি প্রায়ই নিজেকে মূল্যহীন, অপরাধী বা নিজের জীবনের ওপর চরম আশাহত অনুভব করি।", type: "positive", disorder: "Depression" },
      { id: 11, text: "কোনো কারণ ছাড়াই আমার শরীর বা মন অতিরিক্ত ক্লান্ত লাগে এবং ঘুম বা খাওয়াদাওয়ার রুটিন সম্পূর্ণ এলোমেলো হয়ে গেছে।", type: "positive", disorder: "Depression" },
      { id: 12, text: "আমি নিজের ভবিষ্যৎ নিয়ে বেশ আশাবাদী এবং দৈনন্দিন কাজে পর্যাপ্ত এনার্জি পাই।", type: "reverse", disorder: "Depression" }
    ]
  },
  {
    name: "Segment 4: Emotional Dysregulation (Mood Swings & Instability)",
    icon: Zap,
    color: "from-red-400 to-pink-500",
    questions: [
      { id: 13, text: "আমার মেজাজ খুব দ্রুত পরিবর্তিত (Mood Swings) হয়; এই অনেক ভালো তো এই হুট করে তীব্র রাগ বা বিষণ্ণতা গ্রাস করে।", type: "positive", disorder: "MoodSwings" },
      { id: 14, text: "আমি নিজের আবেগকে খুব সহজে নিয়ন্ত্রণ করতে পারি না এবং ছোটখাটো কারণে চারপাশের মানুষের ওপর ক্ষিপ্ত হয়ে যাই।", type: "positive", disorder: "MoodSwings" },
      { id: 15, text: "হুটহাট ইমোショナル হয়ে যাওয়ার কারণে আমার বন্ধুবান্ধব বা পরিবারের সাথে সম্পর্কের টানাপোড়েন তৈরি হয়।", type: "positive", disorder: "MoodSwings" },
      { id: 16, text: "আমার আবেগ ও মানসিক অবস্থা সবসময় মোটামুটি স্থিতিশীল এবং নিয়ন্ত্রণে থাকে।", type: "reverse", disorder: "MoodSwings" }
    ]
  },
  {
    name: "Segment 5: Social Battery & Relational Withdrawal",
    icon: Eye,
    color: "from-purple-400 to-fuchsia-500",
    questions: [
      { id: 17, text: "মানুষের সাথে সামান্য কথাবার্তা বা সামাজিক মেলামেশার পর আমার মানসিক শক্তি সম্পূর্ণ শেষ (Social Battery Drain) হয়ে যায়।", type: "positive", disorder: "SocialBattery" },
      { id: 18, text: "আমি নতুন মানুষের সাথে পরিচিত হওয়া বা যেকোনো সামাজিক গেট-টুগেদার ইচ্ছে করেই এড়িয়ে চলতে পছন্দ করি।", type: "positive", disorder: "SocialBattery" },
      { id: 19, text: "মানুষ আমাকে ভুল বুঝবে বা আমি সবার সামনে লজ্জিত হব—এই ভয়ে আমি গুটিয়ে থাকি।", type: "positive", disorder: "SocialBattery" },
      { id: 20, text: "আমি মানুষের সাথে আড্ডা দিতে ভীষণ পছন্দ করি এবং এটি আমার মানসিক এনার্জি বাড়িয়ে দেয়।", type: "reverse", disorder: "SocialBattery" }
    ]
  }
];

const OPTIONS = [
  { label: "একদম একমত নই", value: 1, scoreText: "Strongly Disagree" },
  { label: "দ্বিমত পোষণ করি", value: 2, scoreText: "Disagree" },
  { label: "নিউট্রাল / নিশ্চিত নই", value: 3, scoreText: "Neutral" },
  { label: "একমত", value: 4, scoreText: "Agree" },
  { label: "সম্পূর্ণ একমত", value: 5, scoreText: "Strongly Agree" }
];

export default function ComprehensiveAssessment() {
  const [started, setStarted] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const activeSegment = SEGMENTS[currentSegmentIdx];
  const activeQuestion = activeSegment?.questions[currentQuestionIdx];
  const totalQuestionsCount = 20;
  const currentGlobalProgress = (currentSegmentIdx * 4) + currentQuestionIdx;

  const handleAnswerSelection = (value: number) => {
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: value }));

    if (currentQuestionIdx < 3) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else if (currentSegmentIdx < SEGMENTS.length - 1) {
      setCurrentSegmentIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
    } else {
      setIsCompleted(true);
    }
  };

  const resetEngine = () => {
    setAnswers({});
    setCurrentSegmentIdx(0);
    setCurrentQuestionIdx(0);
    setIsCompleted(false);
    setStarted(false);
  };

  const generateDisorderReport = () => {
    const scores = { OCD: 0, Anxiety: 0, Depression: 0, MoodSwings: 0, SocialBattery: 0 };
    
    SEGMENTS.forEach(segment => {
      segment.questions.forEach(q => {
        const response = answers[q.id] || 3;
        const absoluteScore = q.type === 'positive' ? response : (6 - response);
        scores[q.disorder as keyof typeof scores] += absoluteScore;
      });
    });

    const getPercentage = (raw: number) => Math.round(((raw - 4) / 16) * 100);

    return {
      OCD: { pct: getPercentage(scores.OCD), label: "OCD & Perfectionism", desc: "অবসেসিভ চিন্তা ও পারফেক্ট করার প্রবণতা।" },
      Anxiety: { pct: getPercentage(scores.Anxiety), label: "Anxiety & Overthinking", desc: "তীব্র দুশ্চিন্তা, প্যানিক ও অস্থিরতা।" },
      Depression: { pct: getPercentage(scores.Depression), label: "Clinical Depression", desc: "হতাশা, ক্লান্তি ও এনার্জির তীব্র ঘাটতি।" },
      MoodSwings: { pct: getPercentage(scores.MoodSwings), label: "Emotional Dysregulation", desc: "হুটহাট মেজাজ পরিবর্তন ও আবেগের অস্থিরতা।" },
      SocialBattery: { pct: getPercentage(scores.SocialBattery), label: "Social Battery & Isolation", desc: "সামাজিক ভীতি ও দ্রুত মেন্টাল ড্রেন হওয়া।" }
    };
  };

  const triggerDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("PDF download simulation triggered! Final report file ready.");
    }, 1500);
  };

  const finalReport = isCompleted ? generateDisorderReport() : null;
  const SegmentIcon = activeSegment?.icon || Brain;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 min-h-[90vh] flex flex-col justify-between relative z-10">
      
      {/* NAVBAR HEADER */}
      <div className="flex items-center justify-between mb-10 border-b border-slate-800/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/20">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-pink-500 uppercase block">Full-Scale Diagnostic Suite</span>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Psychological Disorder Assessment</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800/80">
          <Shield className="w-4 h-4 text-emerald-400" /> COMPREHENSIVE SCANNING ACTIVE
        </div>
      </div>

      {/* BODY FRAMEWORK */}
      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {!started && (
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8 max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Full A to Z Disorder Screening Active
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-[1.2]">
                আলোচিত সকল মানসিক সমস্যা ও <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">ডিসঅর্ডারের পূর্ণাঙ্গ বৈজ্ঞানিক মূল্যায়ন।</span>
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
                এই স্ক্রীনিং মডিউলটি আপনার রিয়েল-টাইম রেসপন্স ট্র্যাক করে OCD, Generalized Anxiety, Clinical Depression, Mood Swings, এবং Social Battery Exhaustion-এর মাত্রা বিশ্লেষণ করবে।
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center my-6">
                {['OCD / পারফেকশনিজম', 'Anxiety / ওভারথিংকিং', 'Depression / অবসাদ', 'Mood Swings', 'Social Battery'].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-800/60 bg-slate-950/40 text-[11px] font-medium text-slate-300">
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStarted(true)}
                  className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-slate-100 text-slate-950 font-bold tracking-wide transition-all shadow-md hover:shadow-[0_4px_40px_rgba(99,102,241,0.25)] active:scale-[0.98]"
                >
                  <span>Begin Full Diagnostic Check</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          )}

          {started && !isCompleted && (
            <motion.div
              key={`${currentSegmentIdx}-${currentQuestionIdx}`}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-8 max-w-3xl mx-auto w-full"
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${activeSegment.color} bg-opacity-20`}>
                      <SegmentIcon className="w-4 h-4 text-slate-100" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">
                      {activeSegment.name}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    EVALUATION STATUS: <span className="text-indigo-400 font-bold">{currentGlobalProgress + 1}</span> / {totalQuestionsCount}
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: `${(currentGlobalProgress / totalQuestionsCount) * 100}%` }}
                    animate={{ width: `${((currentGlobalProgress + 1) / totalQuestionsCount) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 md:p-12 backdrop-blur-md relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${activeSegment.color}`} />
                <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 block mb-3 uppercase">Symptom Parameter Statement</span>
                <h3 className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed">
                  "{activeQuestion.text}"
                </h3>
              </div>

              <div className="space-y-2.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswerSelection(opt.value)}
                    className="group flex items-center justify-between w-full p-4 rounded-xl border border-slate-800/70 hover:border-indigo-500/40 bg-slate-900/20 hover:bg-indigo-500/[0.01] transition-all text-left"
                  >
                    <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100">
                      {opt.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 group-hover:text-indigo-400">
                      {opt.scoreText}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {isCompleted && finalReport && (
            <motion.div
              key="luxury-results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 w-full"
            >
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">Comprehensive Diagnostics Completed</h2>
                    <p className="text-xs text-slate-400 mt-0.5">আলোচিত ৫টি প্রধান সাইকোলজিক্যাল ডোমেনের ডাটা সাকসেসফুলি প্রসেস করা হয়েছে।</p>
                  </div>
                </div>

                <button
                  onClick={triggerDownload}
                  disabled={downloading}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-500 text-slate-950 font-bold text-sm hover:bg-indigo-400 shadow-md transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Compiling Report..." : "Download Full Diagnostics Report"}
                </button>
              </div>

              <div className="bg-gradient-to-b from-slate-900/50 to-slate-900/10 border border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-8 backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-slate-800/40 pb-4">
                  <BarChart2 className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">A to Z Mental Disorder Risk Matrix</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-6">
                    {Object.entries(finalReport).map(([key, data]) => {
                      const barColor = data.pct >= 70 ? 'from-red-500 to-rose-400' : data.pct >= 45 ? 'from-amber-500 to-orange-400' : 'from-emerald-500 to-teal-400';
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-200 m-0">{data.label}</h4>
                              <p className="text-[11px] text-slate-500 font-light m-0">{data.desc}</p>
                            </div>
                            <span className={`text-xs font-mono font-bold ${data.pct >= 70 ? 'text-red-400' : data.pct >= 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {data.pct}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div className={`h-full bg-gradient-to-r ${barColor} rounded-full`} style={{ width: `${data.pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 text-left">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">Expert Analytical Synthesizer</span>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      
                      <div className="text-xs border-b border-slate-900 pb-2.5">
                        <span className="font-bold text-slate-300 block mb-0.5">OCD & Perfectionism Verdict:</span>
                        <p className="text-slate-400 m-0 font-light">
                          {finalReport.OCD.pct >= 70 ? "🔴 পারফেকশনিজম এবং অবসেসিভ চেকিং টেন্ডেন্সি আশঙ্কাজনক মাত্রায় হাই। চিন্তার পুনরাবৃত্তি আপনার ডেইলি প্রোডাক্টিভিটি ড্রেন করছে।" : finalReport.OCD.pct >= 45 ? "🟡 পারফেকশনিজমের মৃদু অবসেসিভ প্যাটার্ন রয়েছে। ডেডলাইন মিস হওয়া ঠেকাতে একটু সচেতন হওয়া দরকার।" : "🟢 অবসেসিভ-কমপালসিভ ডোমেন সম্পূর্ণ নরমাল ও স্টেবল।"}
                        </p>
                      </div>

                      <div className="text-xs border-b border-slate-900 pb-2.5">
                        <span className="font-bold text-slate-300 block mb-0.5">Anxiety & Overthinking Verdict:</span>
                        <p className="text-slate-400 m-0 font-light">
                          {finalReport.Anxiety.pct >= 70 ? "🔴 ওভারথিংকিং এবং ফিউচার প্যানিক লেভেল অতিরিক্ত বেশি। এটি কগনিティブ ডিসিশন মেকিং ক্ষমতাকে ব্লক করে ফেলছে।" : finalReport.Anxiety.pct >= 45 ? "🟡 মডারেট এনজাইটি ও চিন্তার জটলা রয়েছে। মানসিক চাপের সময় ব্রিথিং প্র্যাকটিস করা উচিত।" : "🟢 উদ্বেগ এবং ওভারথিংকিং লেভেল সম্পূর্ণ স্বাভাবিক সীমার মধ্যে রয়েছে।"}
                        </p>
                      </div>

                      <div className="text-xs border-b border-slate-900 pb-2.5">
                        <span className="font-bold text-slate-300 block mb-0.5">Clinical Depression Verdict:</span>
                        <p className="text-slate-400 m-0 font-light">
                          {finalReport.Depression.pct >= 70 ? "🔴 মানসিক অবসাদ এবং চরম এনার্জি ক্রাইসিসের লক্ষণ স্পষ্ট। নিজেকে একা না রেখে দ্রুত মেডিকেল সাপোর্ট নেওয়া উচিত।" : finalReport.Depression.pct >= 45 ? "🟡 মৃদু মন খারাপ ও মোтивноеশনহীনতা কাজ করছে। বার্নআউট বা একটানা একঘেয়েমি থেকে এটি হতে পারে।" : "🟢 ডিপ্রেসিভ সিম্পটমের কোনো সিগনিফিক্যান্ট উপস্থিতি পাওয়া যায়নি।"}
                        </p>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-slate-300 block mb-0.5">Emotional Battery Verdict:</span>
                        <p className="text-slate-400 m-0 font-light">
                          {(finalReport.MoodSwings.pct >= 60 || finalReport.SocialBattery.pct >= 60)
                            ? "⚠️ মুড সুইং এবং সোশ্যাল ব্যাটারি ড্রেন হওয়ার রেট বেশ দ্রুত। মানুষের সাথে অতিরিক্ত ইন্টারেকশনের পর আপনার পর্যাপ্ত সলিটিউড (নিঃসঙ্গতা) প্রয়োজন।"
                            : "✅ আপনার ইমোশনাল রেগুলেশন এবং সোশ্যালাইজেশন ব্যালেন্স বেশ ভালো অবস্থায় আছে।"}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>

                <div className="flex gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light m-0">
                    <strong className="text-slate-300">মেডিকেল ডিসক্লেইমার:</strong> এটি একটি সাইকোমেট্রিক স্ক্রীনিং ক্যালকুলেটর মাত্র। স্কোর উচ্চ (🔴) আসার অর্থ এই নয় যে এটি চূড়ান্ত রোগ নির্ণয়। দীর্ঘস্থায়ী সমস্যার ক্ষেত্রে অবশ্যই একজন নিবন্ধিত মানসিক স্বাস্থ্য বিশেষজ্ঞ (Clinical Psychologist)-এর অ্যাপয়েন্টমেন্ট নেওয়া জরুরি।
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={resetEngine}
                  className="inline-flex items-center gap-2.5 text-xs font-mono font-semibold tracking-wider text-slate-400 hover:text-pink-400 bg-slate-900/60 border border-slate-800/80 px-6 py-3.5 rounded-xl transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-Calibrate Diagnostic Engine
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center border-t border-slate-900/60 pt-6">
        <p className="text-[10px] font-mono text-slate-600 tracking-[0.2em] uppercase">
          Full Clinical Framework Standard • Real-time Diagnostic Suite v2.1 • © 2026
        </p>
      </div>

    </div>
  );
}