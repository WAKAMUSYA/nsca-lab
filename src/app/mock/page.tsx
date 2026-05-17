"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mockExams, sampleQuestions, Question } from "@/data/questions";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { supabaseService } from "@/lib/supabaseService";
import { 
  ArrowLeft, 
  Award, 
  Clock, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Play, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  FileText,
  Lock
} from "lucide-react";

export default function MockExams() {
  const [completedScores, setCompletedScores] = useState<Record<string, number>>({});
  const [isSaMember, setIsSaMember] = useState(false);
  
  // Simulation Active states
  const [activeExam, setActiveExam] = useState<typeof mockExams[0] | null>(null);
  const [isExamRunning, setIsExamRunning] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qIndex -> optionIndex
  const [flagged, setFlagged] = useState<Record<number, boolean>>({}); // qIndex -> flagged true/false
  const [examResult, setExamResult] = useState<{ score: number; total: number; percent: number } | null>(null);

  // Load scores and verify active SA Monthly plan subscription status
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nsca_mock_scores");
      if (stored) {
        setCompletedScores(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    const checkSubscription = async () => {
      if (!isSupabaseConfigured()) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_sa_member")
          .eq("id", user.id)
          .single();
        if (profile) {
          setIsSaMember(profile.is_sa_member || false);
        }
      }
    };
    checkSubscription();
  }, []);

  // Scroll main container to top when switching questions or completing
  useEffect(() => {
    const scrollToTop = () => {
      const scrollable = document.querySelector('main');
      if (scrollable) {
        scrollable.scrollTo(0, 0);
      }
      window.scrollTo(0, 0);
    };
    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [currentQIndex, examResult]);

  // Start exam handler
  const handleStartExam = (exam: typeof mockExams[0], sprintMode = true) => {
    setActiveExam(exam);
    
    const storedType = localStorage.getItem("nsca_exam_type") || "CSCS";
    const filteredSource = sampleQuestions.filter(
      (q) => q.subject === "Both" || q.subject === storedType
    );
    
    // Select questions
    let selected: Question[] = [];
    if (sprintMode) {
      // Choose 10 random questions for visual testing ease
      selected = [...filteredSource].sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
      // Replicate 100 questions by repeating samples
      selected = Array.from({ length: 100 }, (_, i) => {
        const q = filteredSource[i % filteredSource.length];
        return {
          ...q,
          id: `${q.id}-dup-${i}`,
        };
      });
    }

    setExamQuestions(selected);
    setCurrentQIndex(0);
    setAnswers({});
    setFlagged({});
    setIsExamRunning(true);
    setExamResult(null);
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optIdx,
    }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQIndex]: !prev[currentQIndex],
    }));
  };

  const handleSubmitExam = () => {
    setIsExamRunning(false);
    
    // Calculate score
    let correctCount = 0;
    const failedQuestions: any[] = [];

    examQuestions.forEach((q, idx) => {
      const chosen = answers[idx];
      if (chosen === q.answerIndex) {
        correctCount++;
      } else {
        // Log to mistakes
        failedQuestions.push({
          ...q,
          dateFailed: new Date().toISOString(),
        });
      }
    });

    const percent = Math.round((correctCount / examQuestions.length) * 100);
    const result = { score: correctCount, total: examQuestions.length, percent };
    setExamResult(result);

    // Save score to localStorage
    if (activeExam) {
      const updatedScores = {
        ...completedScores,
        [activeExam.id]: Math.max(completedScores[activeExam.id] || 0, percent),
      };
      setCompletedScores(updatedScores);
      try {
        localStorage.setItem("nsca_mock_scores", JSON.stringify(updatedScores));

        // Save new mistakes if any
        if (failedQuestions.length > 0) {
          const storedMistakes = localStorage.getItem("nsca_mistakes");
          let mistakesList = storedMistakes ? JSON.parse(storedMistakes) : [];
          failedQuestions.forEach((fq) => {
            if (!mistakesList.some((m: any) => m.id === fq.id)) {
              mistakesList.push(fq);
              // Real-time cloud sync for premium users
              supabaseService.addCloudMistake(fq);
            }
          });
          localStorage.setItem("nsca_mistakes", JSON.stringify(mistakesList));
          window.dispatchEvent(new Event("nsca_storage_update"));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      
      {/* Dynamic Header */}
      {!isExamRunning ? (
        <>
          <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30 flex items-center gap-3 shadow-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-extrabold text-base text-slate-900">模擬試験</h1>
          </div>

          <div className="px-4 py-6 flex flex-col gap-4">
            
            {/* Mock Exams List */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">模擬試験一覧</h3>

              {mockExams.map((mock) => {
                const bestScore = completedScores[mock.id];
                const isDone = bestScore !== undefined;
                const isLocked = mock.id !== "mock-1" && !isSaMember;

                return (
                  <div key={mock.id} className="premium-card p-4 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded">
                          {mock.category}
                        </span>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[9.5px] text-amber-600 font-black bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg animate-pulse">
                            <Lock className="w-3 h-3" />
                            プレミアムロック
                          </span>
                        ) : isDone ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-black">
                            <CheckCircle className="w-3.5 h-3.5" />
                            最高スコア: {bestScore}%
                          </span>
                        ) : null}
                      </div>
                      
                      <h4 className="font-extrabold text-sm text-slate-900 mt-2">
                        {mock.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {mock.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {mock.totalQuestions} 問
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          時間制限なし
                        </span>
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="pt-2">
                        <Link
                          href="/subscribe"
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md shadow-amber-950/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          SA月額プラン(500円)に加入して解放
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleStartExam(mock, true)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-lg text-slate-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                          10問スプリント
                        </button>
                        <button
                          onClick={() => handleStartExam(mock, false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          本番開始 (100問)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </>
      ) : (
        /* ACTIVE EXAM RUNNING PORTAL */
        <div className="flex-1 flex flex-col justify-between bg-slate-900 text-slate-100">
          
          {/* Active HUD bar */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded uppercase">
                {activeExam?.category}
              </span>
              <span className="text-[11px] text-slate-300 font-bold">
                Q {currentQIndex + 1} / {examQuestions.length}
              </span>
            </div>
            
            <div className="text-[10px] text-slate-400 font-bold bg-slate-900 border border-slate-850 px-3 py-1 rounded-full flex items-center gap-1">
              <span>⚡ 時間制限なし</span>
            </div>
          </div>

          {!examResult ? (
            /* Running Exam interface */
            <div className="px-4 py-6 flex-1 flex flex-col justify-between">
              
              <div>
                {/* Flags bar */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-slate-500 font-bold">
                    ID: #{examQuestions[currentQIndex].id}
                  </span>
                  <button 
                    onClick={toggleFlag}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      flagged[currentQIndex] 
                        ? "bg-amber-500/10 border-amber-500 text-amber-400" 
                        : "border-slate-800 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    🚩 後で確認
                  </button>
                </div>

                {/* Question text */}
                <h3 className="font-extrabold text-sm leading-relaxed text-slate-100 mb-6">
                  {examQuestions[currentQIndex].text}
                </h3>

                {/* Option selection */}
                <div className="flex flex-col gap-3">
                  {examQuestions[currentQIndex].options.map((option, idx) => {
                    const isSelected = answers[currentQIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-4 rounded-xl text-left text-xs leading-relaxed font-semibold transition-all border ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-black shadow-md shadow-indigo-500/5"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls (Placed immediately below options for scroll-free accessibility!) */}
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-3">
                    <button
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex((prev) => prev - 1)}
                      className="flex-1 border border-slate-800 bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 py-3 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      戻る
                    </button>
                    
                    {currentQIndex < examQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex((prev) => prev + 1)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 transition-all shadow-md shadow-indigo-600/10"
                      >
                        次へ
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitExam}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 transition-all shadow-md shadow-indigo-600/10"
                      >
                        試験を終了する
                      </button>
                    )}
                  </div>
                </div>

                {/* Secondary: Navigation Question Grid Drawer (Placed below controls) */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">解答状況グリッド</h4>
                  <div className="flex flex-wrap gap-2">
                    {examQuestions.map((_, idx) => {
                      const isAnswered = answers[idx] !== undefined;
                      const isCurrent = currentQIndex === idx;
                      const isFlagged = flagged[idx];

                      let gridStyle = "bg-slate-950 text-slate-500 border-slate-800";
                      if (isCurrent) {
                        gridStyle = "bg-indigo-600 border-indigo-600 text-white font-black scale-105 shadow-md shadow-indigo-600/20";
                      } else if (isFlagged) {
                        gridStyle = "bg-amber-500/15 border-amber-500 text-amber-400";
                      } else if (isAnswered) {
                        gridStyle = "bg-slate-800 border-slate-700 text-slate-300";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentQIndex(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all ${gridStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/40 text-center">
                  <button
                    onClick={handleSubmitExam}
                    className="text-center text-[10px] text-slate-500 font-bold hover:text-slate-400 py-1 transition-colors"
                  >
                    途中で提出して終了する
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="px-5 py-8 flex-1 flex flex-col justify-between items-center text-center animate-in fade-in duration-500 bg-slate-950 text-white">
              <div className="w-full flex-1 flex flex-col items-center justify-center">
                
                <div className="w-20 h-20 rounded-full bg-indigo-900 flex items-center justify-center border-4 border-slate-800 mb-6 shadow-2xl relative">
                  <Award className="w-10 h-10 text-amber-400" />
                </div>

                <h2 className="text-xl font-black tracking-tight">模擬試験 判定結果</h2>
                <p className="text-xs text-indigo-400 font-bold mt-1 uppercase tracking-widest">
                  {activeExam?.title}
                </p>

                {/* Score meters */}
                <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-[320px]">
                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs text-slate-400 font-bold">正解数</span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {examResult.score} / {examResult.total} 問
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xs text-slate-400 font-bold">正答率</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {examResult.percent}%
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">判定基準: 70%合格</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        examResult.percent >= 70 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {examResult.percent >= 70 ? "合格基準クリア！" : "不合格判定"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Review suggestion */}
                <div className="mt-6 bg-slate-900 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed max-w-[320px] border border-slate-850 flex items-start gap-2.5 text-left">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
                  <p>
                    間違えた問題（{examResult.total - examResult.score}問）は、自動的に<b>「間違いノート」</b>に保存されました。忘れないうちに解き直し、合格確率を押し上げましょう！
                  </p>
                </div>

                {/* 解答詳細・解説一覧セクション */}
                <div className="mt-8 w-full max-w-[480px] text-left">
                  <h3 className="text-xs font-black text-slate-200 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    📝 解答詳細と詳細解説
                  </h3>
                  
                  <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
                    {examQuestions.map((q, idx) => {
                      const chosen = answers[idx];
                      const isCorrect = chosen === q.answerIndex;

                      return (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl border text-[11px] leading-relaxed transition-all ${
                            isCorrect 
                              ? "bg-slate-900/40 border-emerald-950/60" 
                              : "bg-slate-900/40 border-rose-950/60"
                          }`}
                        >
                          {/* 問題のヘッダー情報 */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] text-slate-500 font-bold">
                              第 {idx + 1} 問 (ID: #{q.id})
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                              isCorrect 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {isCorrect ? "正解 ◯" : "不正解 ✕"}
                            </span>
                          </div>

                          {/* 問題文 */}
                          <p className="font-bold text-slate-200 mb-3">
                            {q.text}
                          </p>

                          {/* 選択肢とユーザーの選択状況 */}
                          <div className="flex flex-col gap-1.5 mb-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/40">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = chosen === optIdx;
                              const isAnswer = q.answerIndex === optIdx;
                              
                              let optionStyle = "text-slate-400";
                              let prefix = "　";
                              
                              if (isAnswer) {
                                optionStyle = "text-emerald-400 font-extrabold";
                                prefix = "◯ ";
                              } else if (isSelected) {
                                optionStyle = "text-rose-400 font-extrabold line-through";
                                prefix = "✕ ";
                              }

                              return (
                                <div key={optIdx} className={`flex items-start gap-1 ${optionStyle}`}>
                                  <span className="font-mono">{prefix}</span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* 詳細解説 */}
                          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 text-[10px] leading-relaxed text-slate-300">
                            <p className="font-black text-indigo-400 mb-1 flex items-center gap-1">
                              💡 解説
                            </p>
                            <p className="text-slate-300">
                              {q.explanation}
                            </p>

                            {/* AI Insights があればさらに表示 */}
                            {q.aiInsights && (
                              <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-col gap-1.5 text-[9.5px] text-slate-400">
                                <div>
                                  <span className="font-black text-amber-500">⚡ 解法インサイト:</span> {q.aiInsights.howToSolve}
                                </div>
                                <div>
                                  <span className="font-black text-amber-500">⚠️ ここがひっかけ:</span> {q.aiInsights.pitfall}
                                </div>
                                {q.aiInsights.mnemonic && (
                                  <div className="bg-indigo-950/30 p-1.5 rounded border border-indigo-900/30 text-indigo-300">
                                    <span className="font-black text-indigo-400">🧠 語呂合わせ:</span> {q.aiInsights.mnemonic}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="w-full max-w-[320px] flex flex-col gap-3">
                <button
                  onClick={() => setIsExamRunning(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-extrabold text-xs shadow-md transition-all"
                >
                  模試ポータルに戻る
                </button>
                <button
                  onClick={() => handleStartExam(activeExam!, examQuestions.length === 10)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-3.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  再挑戦する
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
