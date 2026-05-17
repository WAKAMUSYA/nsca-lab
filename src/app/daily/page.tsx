"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sampleQuestions, Question } from "@/data/questions";
import { supabaseService } from "@/lib/supabaseService";
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Flame, 
  Lightbulb, 
  BrainCircuit, 
  Dumbbell,
  AlertTriangle,
  RotateCcw,
  Target,
  ShieldCheck,
  Zap,
  X
} from "lucide-react";

export default function DailyQuest() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Interactive AI Tab selection (Focused purely on exam tactics)
  const [activeAiTab, setActiveAiTab] = useState<"solve" | "pitfall" | "elimination" | "mnemonic">("solve");

  // Similar Question Modal States
  const [similarQuestion, setSimilarQuestion] = useState<Question | null>(null);
  const [similarSelectedOption, setSimilarSelectedOption] = useState<number | null>(null);
  const [similarIsAnswered, setSimilarIsAnswered] = useState<boolean>(false);
  const [similarIsCorrect, setSimilarIsCorrect] = useState<boolean>(false);
  const [similarActiveAiTab, setSimilarActiveAiTab] = useState<"solve" | "pitfall" | "elimination" | "mnemonic">("solve");

  // Load questions and shuffle based on chosen Exam Model
  useEffect(() => {
    const storedType = localStorage.getItem("nsca_exam_type") || "CSCS";
    const filtered = sampleQuestions.filter(
      (q) => q.subject === "Both" || q.subject === storedType
    );
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuestions(shuffled);
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
  }, [currentIndex, isCompleted]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null || isAnswered) return;

    const currentQuestion = questions[currentIndex];
    const correct = selectedOption === currentQuestion.answerIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      // Save incorrect question to localStorage
      try {
        const stored = localStorage.getItem("nsca_mistakes");
        let list: any[] = stored ? JSON.parse(stored) : [];
        
        // Avoid duplicate mistakes
        if (!list.some((q) => q.id === currentQuestion.id)) {
          const failedQ = {
            ...currentQuestion,
            dateFailed: new Date().toISOString(),
          };
          list.push(failedQ);
          localStorage.setItem("nsca_mistakes", JSON.stringify(list));
          window.dispatchEvent(new Event("nsca_storage_update"));
          
          // Real-time cloud sync for premium users
          supabaseService.addCloudMistake(failedQ);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setActiveAiTab("solve"); // reset AI tab
    } else {
      setIsCompleted(true);
      // Save daily completion and compute streak + history
      try {
        const todayStr = new Date().toDateString();
        const lastDaily = localStorage.getItem("nsca_last_daily_completed");
        
        const historyStored = localStorage.getItem("nsca_study_history");
        let history: string[] = historyStored ? JSON.parse(historyStored) : [];
        
        const streakStored = localStorage.getItem("nsca_user_streak");
        let currentStreak = streakStored ? parseInt(streakStored, 10) : 0;
        
        if (lastDaily !== todayStr) {
          if (!history.includes(todayStr)) {
            history.push(todayStr);
          }
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (lastDaily === yesterdayStr || (currentStreak === 0 && history.length === 1)) {
            currentStreak += 1;
          } else if (lastDaily !== yesterdayStr) {
            currentStreak = 1; // broken streak
          }
          
          localStorage.setItem("nsca_last_daily_completed", todayStr);
          localStorage.setItem("nsca_user_streak", currentStreak.toString());
          localStorage.setItem("nsca_study_history", JSON.stringify(history));
        }

        // Increment stats
        const totalSolvedStored = localStorage.getItem("nsca_total_solved");
        const totalSolved = totalSolvedStored ? parseInt(totalSolvedStored, 10) : 0;
        localStorage.setItem("nsca_total_solved", (totalSolved + questions.length).toString());

        const totalCorrectStored = localStorage.getItem("nsca_total_correct");
        const totalCorrect = totalCorrectStored ? parseInt(totalCorrectStored, 10) : 0;
        localStorage.setItem("nsca_total_correct", (totalCorrect + score).toString());

        window.dispatchEvent(new Event("nsca_storage_update"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRestart = () => {
    const storedType = localStorage.getItem("nsca_exam_type") || "CSCS";
    const filtered = sampleQuestions.filter(
      (q) => q.subject === "Both" || q.subject === storedType
    );
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setActiveAiTab("solve");
  };

  // Launch linked similar question modal
  const handleStartSimilarQuestion = (similarId: string) => {
    const q = sampleQuestions.find((item) => item.id === similarId);
    if (q) {
      setSimilarQuestion(q);
      setSimilarSelectedOption(null);
      setSimilarIsAnswered(false);
      setSimilarIsCorrect(false);
      setSimilarActiveAiTab("solve");
    }
  };

  const handleCheckSimilar = () => {
    if (similarSelectedOption === null || similarIsAnswered || !similarQuestion) return;
    const correct = similarSelectedOption === similarQuestion.answerIndex;
    setSimilarIsCorrect(correct);
    setSimilarIsAnswered(true);

    if (!correct) {
      // If they fail the similar question, save it to mistakes too!
      try {
        const stored = localStorage.getItem("nsca_mistakes");
        let list: any[] = stored ? JSON.parse(stored) : [];
        if (!list.some((q) => q.id === similarQuestion.id)) {
          const failedQ = {
            ...similarQuestion,
            dateFailed: new Date().toISOString(),
          };
          list.push(failedQ);
          localStorage.setItem("nsca_mistakes", JSON.stringify(list));
          window.dispatchEvent(new Event("nsca_storage_update"));
          
          // Real-time cloud sync for premium users
          supabaseService.addCloudMistake(failedQ);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Reward correct similar run
      try {
        const totalCorrectStored = localStorage.getItem("nsca_total_correct");
        const totalCorrect = totalCorrectStored ? parseInt(totalCorrectStored, 10) : 0;
        localStorage.setItem("nsca_total_correct", (totalCorrect + 1).toString());
        window.dispatchEvent(new Event("nsca_storage_update"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <p className="animate-pulse">今日の問題をロード中...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 relative">
      
      {/* Header bar with progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        {/* Progress Bar Container */}
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <span className="text-xs font-bold text-slate-500 min-w-[36px] text-right">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {!isCompleted ? (
        <div className="px-4 py-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Question info card */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                {currentQuestion.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                対象: {currentQuestion.subject}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="font-extrabold text-base text-slate-900 leading-relaxed mb-6">
              {currentQuestion.text}
            </h3>

            {/* Options list */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle = "btn-option bg-white text-slate-700 border-slate-200";
                
                if (isAnswered) {
                  if (idx === currentQuestion.answerIndex) {
                    btnStyle = "btn-option btn-option-correct";
                  } else if (selectedOption === idx) {
                    btnStyle = "btn-option btn-option-incorrect";
                  } else {
                    btnStyle = "btn-option bg-white text-slate-400 border-slate-100 opacity-60";
                  }
                } else if (selectedOption === idx) {
                  btnStyle = "btn-option btn-option-selected";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-4 rounded-xl text-left text-xs leading-relaxed font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && idx === currentQuestion.answerIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />
                    )}
                    {isAnswered && selectedOption === idx && idx !== currentQuestion.answerIndex && (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Highly accessible button block. Sitting right under the choices list! */}
            <div className="mt-5">
              {!isAnswered ? (
                <button
                  onClick={handleCheck}
                  disabled={selectedOption === null}
                  className={`w-full py-3.5 rounded-xl font-black text-xs shadow-md transition-all duration-200 text-center ${
                    selectedOption === null
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white shadow-lg shadow-indigo-200"
                  }`}
                >
                  解答する
                </button>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleNext}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white py-3.5 rounded-xl font-black text-xs shadow-md shadow-emerald-950/20 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        次の問題へ
                        <ChevronRight className="w-4 h-4 text-white" />
                      </>
                    ) : (
                      "結果を見る"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const drawer = document.getElementById("ai-explanation-drawer");
                      if (drawer) {
                        drawer.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/50"
                  >
                    💡 AIチューターの合格解説を読む（下へジャンプ）
                  </button>
                </div>
              )}
            </div>

            {/* Premium AI Assist Explanatory Drawer */}
            {isAnswered && currentQuestion.aiInsights && (
              <div id="ai-explanation-drawer" className="mt-6 bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider">AI 合格特化チューター解説</h4>
                </div>

                {/* AI Insight Tabs - 100% focused on tactics */}
                <div className="flex border-b border-slate-800 text-[11px] font-bold mb-3 overflow-x-auto gap-2">
                  <button
                    onClick={() => setActiveAiTab("solve")}
                    className={`pb-2 px-1 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                      activeAiTab === "solve" 
                        ? "border-amber-400 text-amber-400 font-black" 
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    解き方コツ
                  </button>
                  <button
                    onClick={() => setActiveAiTab("pitfall")}
                    className={`pb-2 px-1 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                      activeAiTab === "pitfall" 
                        ? "border-amber-400 text-amber-400 font-black" 
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    ひっかけ注意
                  </button>
                  <button
                    onClick={() => setActiveAiTab("elimination")}
                    className={`pb-2 px-1 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                      activeAiTab === "elimination" 
                        ? "border-amber-400 text-amber-400 font-black" 
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    消去法テク
                  </button>
                  {currentQuestion.aiInsights.mnemonic && (
                    <button
                      onClick={() => setActiveAiTab("mnemonic")}
                      className={`pb-2 px-1 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                        activeAiTab === "mnemonic" 
                          ? "border-amber-400 text-amber-400 font-black" 
                          : "border-transparent text-slate-500"
                      }`}
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      覚え方語呂
                    </button>
                  )}
                </div>

                {/* Tab content view */}
                <div className="text-xs text-slate-300 leading-relaxed min-h-[65px]">
                  {activeAiTab === "solve" && (
                    <p>{currentQuestion.aiInsights.howToSolve}</p>
                  )}
                  {activeAiTab === "pitfall" && (
                    <p className="text-rose-300 bg-rose-950/20 p-2.5 rounded-lg border border-rose-950/50">
                      <strong>⚠️ 試験での問われ方:</strong> {currentQuestion.aiInsights.pitfall}
                    </p>
                  )}
                  {activeAiTab === "elimination" && (
                    <p>{currentQuestion.aiInsights.eliminationTip}</p>
                  )}
                  {activeAiTab === "mnemonic" && currentQuestion.aiInsights.mnemonic && (
                    <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-300 font-medium">
                      {currentQuestion.aiInsights.mnemonic}
                    </div>
                  )}
                </div>

                {/* Traditional Explanation segment */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-extrabold text-slate-300 mr-1.5">[解説]</span>
                  {currentQuestion.explanation}
                </div>

                {/* 類題に挑戦ボタン */}
                {currentQuestion.similarQuestionId && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800">
                    <button
                      onClick={() => handleStartSimilarQuestion(currentQuestion.similarQuestionId!)}
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 active:scale-95 text-slate-950 py-2.5 rounded-xl font-black text-xs text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      今の解説をもとに「類題」に挑戦する
                    </button>
                  </div>
                )}

                {/* Next Question / Results Button (Placed inline at the end of explanation for a perfect fluid reading flow!) */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={handleNext}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white py-3.5 rounded-xl font-black text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 shadow-indigo-950/40"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        次の問題へ
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      "結果を見る"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Daily completion Screen */
        <div className="px-5 py-8 flex-1 flex flex-col justify-between items-center text-center animate-in fade-in duration-500">
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            
            {/* Crown / Trophy vector visual */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center shadow-xl border-4 border-white mb-6 relative">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1.5 border border-white">
                <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              今日の5問 クリア！
            </h2>
            <p className="text-xs text-indigo-600 font-bold mt-1">
              毎日の習慣が合格を引き寄せます
            </p>

            {/* Metrics cards grid */}
            <div className="mt-8 w-full grid grid-cols-2 gap-3 max-w-[320px]">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold">正解数</p>
                <p className="text-lg font-black text-indigo-600 mt-1">{score} / 5 問</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold">正答率</p>
                <p className="text-lg font-black text-indigo-600 mt-1">{(score / 5) * 100}%</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm col-span-2 flex items-center justify-between px-4">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold">獲得スコア</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">継続ボーナス</p>
                </div>
                <p className="text-lg font-black text-amber-500">+50 XP</p>
              </div>
            </div>

            {/* Encouraging message */}
            <div className="mt-6 bg-slate-100 p-4 rounded-xl text-xs text-slate-500 leading-relaxed max-w-[320px]">
              {score === 5 ? (
                "素晴らしい！全問正解です。知識がしっかりと定着しています。"
              ) : score >= 3 ? (
                "ナイス！間違えた問題は「間違いノート」に自動保存されました。後で復習しましょう。"
              ) : (
                "まずは継続が大事です！間違えた問題こそ、あなたの伸びしろ。次はもっと解けるようになります。"
              )}
            </div>
          </div>

          <div className="w-full max-w-[320px] flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white py-3.5 rounded-xl font-extrabold text-xs shadow-md transition-all text-center"
            >
              ホームに戻る
            </Link>
            <button
              onClick={handleRestart}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              もう一度解く
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ACTIVE INTERACTIVE SIMILAR QUESTION MODAL */}
      {/* ========================================== */}
      {similarQuestion && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-t-[2.5rem] p-5 shadow-2xl border-t border-slate-800 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            
            {/* Modal Header */}
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">類題特訓チャレンジ</span>
                </div>
                <button 
                  onClick={() => setSimilarQuestion(null)}
                  className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category banner */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  {similarQuestion.category}
                </span>
                <span className="text-[9px] font-bold text-slate-500">
                  類題対象: {similarQuestion.subject}
                </span>
              </div>

              {/* Question Text */}
              <h4 className="font-extrabold text-sm text-slate-100 leading-relaxed mb-6">
                {similarQuestion.text}
              </h4>

              {/* Options list */}
              <div className="flex flex-col gap-3">
                {similarQuestion.options.map((option, idx) => {
                  let btnStyle = "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200";
                  
                  if (similarIsAnswered) {
                    if (idx === similarQuestion.answerIndex) {
                      btnStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-400 font-bold";
                    } else if (similarSelectedOption === idx) {
                      btnStyle = "bg-rose-950/30 border-rose-500 text-rose-400 font-bold";
                    } else {
                      btnStyle = "bg-slate-950 border-slate-900 text-slate-600 opacity-60";
                    }
                  } else if (similarSelectedOption === idx) {
                    btnStyle = "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-black";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={similarIsAnswered}
                      onClick={() => setSimilarSelectedOption(idx)}
                      className={`w-full p-4 rounded-xl text-left text-xs leading-relaxed font-semibold transition-all border flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {similarIsAnswered && idx === similarQuestion.answerIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />
                      )}
                      {similarIsAnswered && similarSelectedOption === idx && idx !== similarQuestion.answerIndex && (
                        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Similar Question AI Explanation */}
              {similarIsAnswered && similarQuestion.aiInsights && (
                <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-850 animate-in slide-in-from-bottom-2 duration-300">
                  
                  <div className="flex items-center gap-1.5 mb-3 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">類題の攻略タクティクス</span>
                  </div>

                  {/* AI Tabs for similar */}
                  <div className="flex border-b border-slate-800 text-[10px] font-bold mb-3 overflow-x-auto gap-2">
                    <button
                      onClick={() => setSimilarActiveAiTab("solve")}
                      className={`pb-1.5 px-0.5 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                        similarActiveAiTab === "solve" 
                          ? "border-emerald-400 text-emerald-400 font-black" 
                          : "border-transparent text-slate-500"
                      }`}
                    >
                      解き方コツ
                    </button>
                    <button
                      onClick={() => setSimilarActiveAiTab("pitfall")}
                      className={`pb-1.5 px-0.5 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                        similarActiveAiTab === "pitfall" 
                          ? "border-emerald-400 text-emerald-400 font-black" 
                          : "border-transparent text-slate-500"
                      }`}
                    >
                      ひっかけ注意
                    </button>
                    <button
                      onClick={() => setSimilarActiveAiTab("elimination")}
                      className={`pb-1.5 px-0.5 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                        similarActiveAiTab === "elimination" 
                          ? "border-emerald-400 text-emerald-400 font-black" 
                          : "border-transparent text-slate-500"
                      }`}
                    >
                      消去法テク
                    </button>
                  </div>

                  {/* AI tab text for similar */}
                  <div className="text-[11px] text-slate-300 leading-relaxed min-h-[50px]">
                    {similarActiveAiTab === "solve" && (
                      <p>{similarQuestion.aiInsights.howToSolve}</p>
                    )}
                    {similarActiveAiTab === "pitfall" && (
                      <p className="text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-950/50">
                        {similarQuestion.aiInsights.pitfall}
                      </p>
                    )}
                    {similarActiveAiTab === "elimination" && (
                      <p>{similarQuestion.aiInsights.eliminationTip}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-400">[公式解説]</span> {similarQuestion.explanation}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-8">
              {!similarIsAnswered ? (
                <button
                  onClick={handleCheckSimilar}
                  disabled={similarSelectedOption === null}
                  className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all text-center ${
                    similarSelectedOption === null
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                >
                  類題の解答を確認する
                </button>
              ) : (
                <button
                  onClick={() => setSimilarQuestion(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all text-center"
                >
                  類題特訓を終了して戻る
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
