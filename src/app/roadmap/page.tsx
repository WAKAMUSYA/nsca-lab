"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QUESTION_CATEGORIES } from "@/data/questions";
import { 
  ArrowLeft, 
  Map, 
  Calendar, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Lock, 
  Compass,
  Award,
  BookOpen,
  CheckSquare,
  Square,
  Sparkles
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRemaining: number;
  status: "completed" | "active" | "locked";
  categories: string[];
  subtopics: string[]; // subtopic IDs associated with this milestone
}

const SUBTOPICS_CONFIG: Record<string, { name: string; domainIndex: number; weight: number }> = {
  "m1-1": { name: "筋肉の起始・停止の暗記", domainIndex: 0, weight: 20 },
  "m1-2": { name: "エネルギー代謝3回路の特性", domainIndex: 0, weight: 20 },
  "m1-3": { name: "第1・2・3種の梃子の分類", domainIndex: 0, weight: 20 },
  
  "m2-1": { name: "三大栄養素の運動時推奨量", domainIndex: 1, weight: 20 },
  "m2-2": { name: "運動前中後の水分補給量", domainIndex: 1, weight: 20 },
  "m2-3": { name: "主要エルゴジェニックエイドの効果", domainIndex: 1, weight: 25 },
  
  "m3-1": { name: "ベンチプレスの正しい補助法", domainIndex: 2, weight: 25 },
  "m3-2": { name: "クイックリフトのエラー修正", domainIndex: 2, weight: 25 },
  "m3-3": { name: "セット・レップ数と強度相関", domainIndex: 3, weight: 25 },
  
  "m4-1": { name: "体力テストの標準実施順序", domainIndex: 4, weight: 30 },
  "m4-2": { name: "アジリティテストの測定方法", domainIndex: 4, weight: 30 },
  "m4-3": { name: "ジム施設安全クリアランス基準", domainIndex: 4, weight: 30 },
  
  "m5-1": { name: "模試で安定的正答率80%越え", domainIndex: 3, weight: 30 },
  "m5-2": { name: "間違いノート克服率100%", domainIndex: 3, weight: 30 },
};

export default function RoadmapPage() {
  const [examType, setExamType] = useState("CSCS");
  const [daysLeft, setDaysLeft] = useState<number | null>(60);
  const [checkedSubtopics, setCheckedSubtopics] = useState<string[]>([]);
  
  // Custom base domain progress values
  const [domainProgress, setDomainProgress] = useState([
    { name: "解剖生理学・エネルギー代謝", percent: 40, color: "bg-indigo-600", base: 40 },
    { name: "スポーツ栄養学・サプリメント", percent: 35, color: "bg-amber-500", base: 35 },
    { name: "レジスタンストレーニング実技・指導法", percent: 20, color: "bg-rose-500", base: 20 },
    { name: "プログラム設計・ピリオダイゼーション", percent: 15, color: "bg-purple-600", base: 15 },
    { name: "測定項目と評価基準", percent: 10, color: "bg-teal-500", base: 10 },
  ]);

  const milestones: Milestone[] = [
    {
      id: "m1",
      title: "基礎医学・生理学フェーズ",
      description: "解剖学的な起始・停止、神経系、および無酸素・有酸素エネルギー供給回路の徹底暗記",
      daysRemaining: 60,
      status: "completed",
      categories: ["生理学", "バイオメカニクス"],
      subtopics: ["m1-1", "m1-2", "m1-3"],
    },
    {
      id: "m2",
      title: "栄養学・エネルギーバランス手法",
      description: "アスリートの三大栄養素推奨量、水分補給タイミング、エルゴジェニックエイドの効果検証",
      daysRemaining: 45,
      status: "active",
      categories: ["栄養学", "サプリメント"],
      subtopics: ["m2-1", "m2-2", "m2-3"],
    },
    {
      id: "m3",
      title: "プログラム構成・実技指導ルール",
      description: "ピリオダイゼーション計画、1RM比率に基づくセット重量算出、クイックリフトのエラー修正",
      daysRemaining: 30,
      status: "locked",
      categories: ["プログラム設計", "実技指導"],
      subtopics: ["m3-1", "m3-2", "m3-3"],
    },
    {
      id: "m4",
      title: "測定評価・施設安全マネジメント",
      description: "体力測定プロトコル順序、Tテスト・プロアジリティ基準値、マシン間クリアランス管理",
      daysRemaining: 15,
      status: "locked",
      categories: ["測定と評価", "安全管理"],
      subtopics: ["m4-1", "m4-2", "m4-3"],
    },
    {
      id: "m5",
      title: "最終模擬試験・合格判定調整",
      description: "100問の総合模擬試験で正答率80%以上をキープし、万全の状態で本番に臨む",
      daysRemaining: 5,
      status: "locked",
      categories: ["模擬試験", "弱点補強"],
      subtopics: ["m5-1", "m5-2"],
    },
  ];

  // Load state on mount
  useEffect(() => {
    try {
      const storedType = localStorage.getItem("nsca_exam_type");
      if (storedType) setExamType(storedType);

      const storedDate = localStorage.getItem("nsca_exam_date");
      if (storedDate) {
        const exam = new Date(storedDate);
        const today = new Date();
        exam.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        setDaysLeft(diff);
      }

      const checkedStored = localStorage.getItem("nsca_roadmap_checked_subtopics");
      if (checkedStored) {
        setCheckedSubtopics(JSON.parse(checkedStored));
      } else {
        // Default checked starting values to look interactive and rewarding on first visit
        const initialChecked = ["m1-1", "m1-2"];
        localStorage.setItem("nsca_roadmap_checked_subtopics", JSON.stringify(initialChecked));
        setCheckedSubtopics(initialChecked);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Compute dynamic domain progress percentages whenever checkedSubtopics changes
  useEffect(() => {
    setDomainProgress((prev) => 
      prev.map((domain, idx) => {
        let additional = 0;
        Object.entries(SUBTOPICS_CONFIG).forEach(([id, sub]) => {
          if (sub.domainIndex === idx && checkedSubtopics.includes(id)) {
            additional += sub.weight;
          }
        });
        return {
          ...domain,
          percent: Math.min(domain.base + additional, 100),
        };
      })
    );
  }, [checkedSubtopics]);

  // Handle checking/unchecking a subtopic
  const toggleSubtopic = (id: string) => {
    let updated: string[];
    if (checkedSubtopics.includes(id)) {
      updated = checkedSubtopics.filter((item) => item !== id);
    } else {
      updated = [...checkedSubtopics, id];
    }
    setCheckedSubtopics(updated);
    try {
      localStorage.setItem("nsca_roadmap_checked_subtopics", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-base text-slate-900">合格ロードマップ</h1>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6">

        {/* Dynamic Countdown Header */}
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded font-black">
              {examType} 突破計画
            </span>
            <h2 className="font-extrabold text-base text-slate-100 mt-2">
              試験日まであと {daysLeft !== null && daysLeft > 0 ? `${daysLeft}日` : "設定済"}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              課題をクリアするごとに網羅率ゲージが上昇します。自分のペースで進捗をマークしましょう。
            </p>
          </div>
          <Compass className="w-12 h-12 text-indigo-500 strokeWidth={1.5} opacity-80" />
        </div>

        {/* Domain progress bars */}
        <div className="premium-card p-5 bg-white shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Map className="w-4 h-4 text-indigo-600" />
            分野別・シラバス網羅率
          </h3>
          
          <div className="flex flex-col gap-4">
            {domainProgress.map((domain) => (
              <div key={domain.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-700">{domain.name}</span>
                  <span className="text-slate-500">{domain.percent}%</span>
                </div>
                
                {/* Visual meter */}
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden w-full relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${domain.color}`}
                    style={{ width: `${domain.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-step milestone path */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mb-4">合格へのマイルストーン</h3>
          
          <div className="flex flex-col relative pl-6 border-l-2 border-slate-200 gap-6 ml-4 py-2">
            
            {milestones.map((m) => {
              const isCompleted = m.status === "completed";
              const isActive = m.status === "active";
              const isLocked = m.status === "locked";

              // Check how many subtopics are completed for this milestone
              const milestoneDoneCount = m.subtopics.filter(id => checkedSubtopics.includes(id)).length;
              const isMilestoneFullyChecked = milestoneDoneCount === m.subtopics.length;

              return (
                <div key={m.id} className="relative">
                  
                  {/* Positioned Node icon on border-l */}
                  <div className="absolute -left-[35px] top-1.5 bg-slate-50 rounded-full p-0.5 z-10">
                    {isMilestoneFullyChecked ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500 fill-white" />
                    ) : isActive || isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 border-4 border-indigo-100 flex items-center justify-center animate-pulse" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-4 border-slate-50 flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Milestone Card */}
                  <div className={`premium-card p-4 transition-all duration-200 ${
                    isActive 
                      ? "border-indigo-400 ring-2 ring-indigo-50 bg-white" 
                      : isCompleted
                        ? "bg-white/90 border-slate-200"
                        : "bg-slate-50/50 border-slate-200/50 opacity-80"
                  }`}>
                    
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        isMilestoneFullyChecked 
                          ? "bg-emerald-50 text-emerald-700"
                          : isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-500"
                      }`}>
                        あと {m.daysRemaining} 日目目安
                      </span>
                      {isMilestoneFullyChecked ? (
                        <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                          ✓ 段階クリア
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">
                          進捗: {milestoneDoneCount} / {m.subtopics.length}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 mt-2.5">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {m.description}
                    </p>

                    {/* Interactive Subtopics Checklist */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">理解度チェック項目</p>
                      
                      {m.subtopics.map((subId) => {
                        const sub = SUBTOPICS_CONFIG[subId];
                        if (!sub) return null;
                        const isChecked = checkedSubtopics.includes(subId);

                        return (
                          <button
                            key={subId}
                            onClick={() => toggleSubtopic(subId)}
                            className="flex items-center gap-2.5 text-left text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors w-full py-0.5"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            )}
                            <span className={isChecked ? "line-through text-slate-400 font-medium" : ""}>
                              {sub.name}
                            </span>
                            {!isChecked && (
                              <span className="text-[8px] bg-slate-100 text-slate-400 px-1 py-0.2 rounded font-medium ml-auto">
                                +{sub.weight}%
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tag bubbles */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {m.categories.map((cat) => (
                        <span key={cat} className="text-[9px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">
                          #{cat}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/daily"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-3.5 px-4 rounded-2xl font-black text-xs text-center shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            今日の推奨課題に取り組む
          </Link>
        </div>

      </div>
    </div>
  );
}
