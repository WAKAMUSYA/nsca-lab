"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getRandomQuote, Quote } from "@/lib/quotes";
import { 
  BookOpen, 
  Award, 
  AlertCircle, 
  BarChart2, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Settings, 
  GraduationCap, 
  ChevronRight,
  TrendingUp,
  Map,
  Target
} from "lucide-react";

export default function Home() {
  const [examType, setExamType] = useState<"CSCS" | "NSCA-CPT">("CSCS");
  const [examDate, setExamDate] = useState<string>("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  
  // Motivational Quotes State
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [streak, setStreak] = useState<number>(3); // Initial dummy streak
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [completedMocksCount, setCompletedMocksCount] = useState<number>(0);
  const [todayCompleted, setTodayCompleted] = useState<boolean>(false);

  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string>("ゲスト");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaMember, setIsSaMember] = useState<boolean>(false);

  // Load active user and nickname from Supabase
  useEffect(() => {
    setCurrentQuote(getRandomQuote());

    const checkUser = async () => {
      const configured = isSupabaseConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("nickname, is_sa_member")
              .eq("id", user.id)
              .single();
            if (profile) {
              if (profile.nickname) {
                setNickname(profile.nickname);
              }
              setIsSaMember(profile.is_sa_member || false);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkUser();

    const handleStorageUpdate = () => {
      checkUser();
    };
    
    window.addEventListener("nsca_storage_update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("nsca_storage_update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const handleCycleQuote = () => {
    let nextQuote = getRandomQuote();
    // Avoid double consecutive quotes
    while (currentQuote && nextQuote.text === currentQuote.text) {
      nextQuote = getRandomQuote();
    }
    setCurrentQuote(nextQuote);
  };

  // Load user configurations from localStorage dynamically with live event listeners
  useEffect(() => {
    const loadStats = () => {
      try {
        const storedType = localStorage.getItem("nsca_exam_type");
        if (storedType) setExamType(storedType as "CSCS" | "NSCA-CPT");

        // Set default target exam date to 60 days from now if not set
        let storedDate = localStorage.getItem("nsca_exam_date");
        if (!storedDate) {
          const sixtyDaysLater = new Date();
          sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
          const yyyy = sixtyDaysLater.getFullYear();
          const mm = String(sixtyDaysLater.getMonth() + 1).padStart(2, "0");
          const dd = String(sixtyDaysLater.getDate()).padStart(2, "0");
          storedDate = `${yyyy}-${mm}-${dd}`;
          localStorage.setItem("nsca_exam_date", storedDate);
        }
        setExamDate(storedDate);

        // Mistakes Count
        const mistakes = localStorage.getItem("nsca_mistakes");
        if (mistakes) {
          const list = JSON.parse(mistakes);
          setMistakeCount(list.length);
        } else {
          setMistakeCount(0);
        }

        // Today completed check
        const lastDaily = localStorage.getItem("nsca_last_daily_completed");
        const today = new Date().toDateString();
        setTodayCompleted(lastDaily === today);
        
        // Mock progress
        const mockProgress = localStorage.getItem("nsca_mock_scores");
        if (mockProgress) {
          const scores = JSON.parse(mockProgress);
          setCompletedMocksCount(Object.keys(scores).length);
        } else {
          setCompletedMocksCount(0);
        }

        // User streak
        const streakStored = localStorage.getItem("nsca_user_streak");
        if (streakStored) {
          setStreak(parseInt(streakStored, 10));
        } else {
          localStorage.setItem("nsca_user_streak", "3"); // initial default
          setStreak(3);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadStats();
    window.addEventListener("nsca_storage_update", loadStats);
    window.addEventListener("storage", loadStats);

    return () => {
      window.removeEventListener("nsca_storage_update", loadStats);
      window.removeEventListener("storage", loadStats);
    };
  }, []);

  // Compute countdown whenever examDate changes
  useEffect(() => {
    if (!examDate) return;
    try {
      localStorage.setItem("nsca_exam_date", examDate);
      
      const exam = new Date(examDate);
      const today = new Date();
      // Reset hours to get accurate date difference
      exam.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = exam.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays);
    } catch (e) {
      console.error(e);
    }
  }, [examDate]);

  const handleExamTypeChange = (type: "CSCS" | "NSCA-CPT") => {
    setExamType(type);
    localStorage.setItem("nsca_exam_type", type);
    window.dispatchEvent(new Event("nsca_storage_update"));
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen text-slate-800 pb-20">
      
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 text-white px-5 pt-8 pb-12 rounded-b-[2rem] shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                {user ? `こんにちは ${nickname}さん` : "STUDY SHELL"}
              </p>
              <h1 className="font-extrabold text-lg text-white">NSCA LAB</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
              <span className="text-xs font-black text-slate-100">{streak}日連続</span>
            </div>
            
            {!user && (
              <Link
                href="/mypage"
                className="text-[10px] font-black text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 px-3.5 py-1.5 rounded-full shadow transition-all flex items-center justify-center cursor-pointer animate-in fade-in"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Countdown Header */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-500 text-slate-900 px-2 py-0.5 rounded-md font-bold">
                  {examType}
                </span>
                <span className="text-xs text-slate-200 font-medium">受験予定</span>
              </div>
              <input 
                type="date" 
                value={examDate} 
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-2 text-xs bg-transparent border-b border-white/20 text-indigo-200 outline-none cursor-pointer focus:border-indigo-400 font-bold"
              />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-300 font-bold">試験まであと</p>
              <p className="text-3xl font-black text-amber-400 tracking-tight mt-0.5">
                {daysLeft !== null && daysLeft > 0 ? `${daysLeft}日` : daysLeft === 0 ? "当日！" : "設定済"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="px-4 -mt-6">
        
        {/* Core Hero Banner (本日の覚悟・言霊 - Pure Quotes Card) */}
        <div 
          onClick={handleCycleQuote}
          className="premium-card bg-white p-5 shadow-lg border border-slate-100/90 relative overflow-hidden flex flex-col gap-3 cursor-pointer group hover:border-slate-200/50 hover:bg-slate-50/20 active:scale-[0.99] transition-all duration-200 animate-in fade-in duration-300 select-none"
          title="タップして新しい言霊を呼び起こす"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          
          {/* Quote Header */}
          {currentQuote && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] bg-slate-900 text-white font-black tracking-widest px-2 py-0.5 rounded-md uppercase">
                  ⚔️ 本日の覚悟 — {currentQuote.category}
                </span>
                <span className="text-[9px] text-slate-400 font-bold group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                  🔄 タップで切り替え
                </span>
              </div>
              
              <blockquote className="border-l-2 border-indigo-500 pl-3.5 my-1">
                <p className="text-xs font-bold text-slate-800 italic leading-relaxed tracking-wide">
                  「{currentQuote.text}」
                </p>
                <cite className="block text-[10px] text-slate-400 font-extrabold not-italic mt-2 text-right">
                  — {currentQuote.author}
                </cite>
              </blockquote>
            </div>
          )}
        </div>

        {/* Feature Cards Grid Section */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">コア機能一覧</h3>
          
          <div className="mt-3 flex flex-col gap-3">
            
            {/* Feature 1: Daily Quest */}
            <Link href="/daily" className="premium-card premium-card-interactive p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md ${
                  todayCompleted ? "bg-emerald-500" : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">今日の5問</h4>
                    {todayCompleted && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">完了</span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Feature 2: Mistakes Notebook */}
            <Link href="/mistakes" className="premium-card premium-card-interactive p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">間違いノート</h4>
                    {isSaMember ? (
                      mistakeCount > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.2 rounded-full font-black">
                          {mistakeCount}問
                        </span>
                      )
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                        👑 PREMIUM
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Feature 3: Analysis */}
            <Link href="/stats" className="premium-card premium-card-interactive p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">弱点分析</h4>
                    {!isSaMember && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                        👑 PREMIUM
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Feature: Category Mini Test */}
            <Link href="/mini-test" className="premium-card premium-card-interactive p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-650 flex items-center justify-center text-white shadow-md">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">分野別ミニテスト</h4>
                    {!isSaMember && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                        👑 PREMIUM
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Feature 4: Mock Tests */}
            <Link href="/mock" className="premium-card premium-card-interactive p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-md">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">模擬試験</h4>
                    {completedMocksCount > 0 && (
                      <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.2 rounded font-black">
                        {completedMocksCount}件完了
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Feature 5: Roadmap */}
            <Link href="/roadmap" className="premium-card premium-card-interactive p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">学習計画ロードマップ</h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

          </div>
        </div>


        {/* Quick Settings Drawer (Interactive Setup) */}
        <div className="mt-8 premium-card p-4 border-slate-200/60">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-slate-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h4 className="text-xs font-bold text-slate-500">資格選択</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExamTypeChange("CSCS")}
              className={`py-2.5 px-3 text-xs font-extrabold rounded-lg border transition-all ${
                examType === "CSCS"
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              CSCS
            </button>
            <button
              onClick={() => handleExamTypeChange("NSCA-CPT")}
              className={`py-2.5 px-3 text-xs font-extrabold rounded-lg border transition-all ${
                examType === "NSCA-CPT"
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              CPT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
