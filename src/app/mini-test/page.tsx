"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sampleQuestions, Question, QUESTION_CATEGORIES } from "@/data/questions";
import { supabaseService } from "@/lib/supabaseService";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
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
  X,
  Lock,
  Play
} from "lucide-react";

export default function CategoryMiniTest() {
  const [isSaMember, setIsSaMember] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Quiz Flow States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isQuizRunning, setIsQuizRunning] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // AI explanation drawer tabs
  const [activeAiTab, setActiveAiTab] = useState<"solve" | "pitfall" | "elimination" | "mnemonic">("solve");

  // Similar Question Modal States
  const [similarQuestion, setSimilarQuestion] = useState<Question | null>(null);
  const [similarSelectedOption, setSimilarSelectedOption] = useState<number | null>(null);
  const [similarIsAnswered, setSimilarIsAnswered] = useState<boolean>(false);
  const [similarIsCorrect, setSimilarIsCorrect] = useState<boolean>(false);
  const [similarActiveAiTab, setSimilarActiveAiTab] = useState<"solve" | "pitfall" | "elimination" | "mnemonic">("solve");

  // Verify premium membership
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupabaseConfigured()) {
        setIsSaMember(true);
        setCheckingAuth(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_sa_member")
            .eq("id", user.id)
            .single();

          if (profile?.is_sa_member) {
            setIsSaMember(true);
          } else {
            setIsSaMember(false);
          }
        } else {
          setIsSaMember(false);
        }
      } catch (e) {
        console.error("Subscription check failed:", e);
        setIsSaMember(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSubscription();
  }, []);

  // Parse query params dynamically in Client side
  useEffect(() => {
    if (isSaMember && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        const validCategories = Object.values(QUESTION_CATEGORIES);
        if (validCategories.includes(catParam)) {
          setSelectedCategory(catParam);
          handleStartQuiz(catParam);
        }
      }
    }
  }, [isSaMember]);

  // Scroll to top on question transition
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

  // Start the mini test for a specific category
  const handleStartQuiz = (category: string) => {
    setSelectedCategory(category);
    const storedType = localStorage.getItem("nsca_exam_type") || "CSCS";
    
    // Filter questions by Category and Exam Type
    const filtered = sampleQuestions.filter(
      (q) => q.category === category && (q.subject === "Both" || q.subject === storedType)
    );

    // Shuffle and pick up to 10 questions
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setIsQuizRunning(true);
  };

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
      // Save incorrect question to mistakes list
      try {
        const stored = localStorage.getItem("nsca_mistakes");
        let list: any[] = stored ? JSON.parse(stored) : [];
        
        if (!list.some((q) => q.id === currentQuestion.id)) {
          const failedQ = {
            ...currentQuestion,
            dateFailed: new Date().toISOString(),
          };
          list.push(failedQ);
          localStorage.setItem("nsca_mistakes", JSON.stringify(list));
          window.dispatchEvent(new Event("nsca_storage_update"));
          
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
      setActiveAiTab("solve");
    } else {
      setIsCompleted(true);
      
      // Save stats to localStorage
      try {
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
    if (selectedCategory) {
      handleStartQuiz(selectedCategory);
    }
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
          
          supabaseService.addCloudMistake(failedQ);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
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

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <p className="animate-pulse text-xs font-bold">メンバー情報検証中...</p>
      </div>
    );
  }

  // Lock screen for non-members
  if (!isSaMember) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20 relative">
        <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30 flex items-center gap-3 shadow-sm">
          <Link href="/" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-extrabold text-base text-slate-900">分野別ミニテスト</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-[340px] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-xl border-4 border-slate-800 mb-5 relative mx-auto">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h3 className="font-black text-sm tracking-tight mb-2">👑 分野別集中特訓機能</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
              特定の苦手分野だけを狙い撃ちして、10問構成の集中ミニテストに挑戦！正答率のリアルタイム管理、AI解説の完全表示などを含むプレミアム特訓機能です。
            </p>

            <div className="flex flex-col gap-2.5 text-left mb-6 text-[9px] font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>各カテゴリに特化した10問ミニテスト</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>AIによる攻略タクティクス（ひっかけ・消去法）</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>間違えた問題の「間違い克服ノート」自動登録</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/subscribe"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-950/40 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                SA月額プラン(500円)に加入して解放
              </Link>
              <Link
                href="/mypage"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                すでに会員の方はログイン
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 1. SELECT CATEGORY SCREEN
  if (!isQuizRunning) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30 flex items-center gap-3 shadow-sm">
          <Link href="/" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-extrabold text-base text-slate-900">分野別ミニテスト</h1>
        </div>

        <div className="px-4 py-6 flex flex-col gap-6">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex gap-3 shadow-inner">
            <Dumbbell className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-xs text-indigo-950">苦手な分野を集中して攻略</h4>
              <p className="text-[10px] text-indigo-700 mt-1 leading-relaxed">
                全500問の問題プールから、選択した分野の問題をランダムに10問出題します。短時間で理解度を深め、効率よく合格水準へ引き上げましょう。
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">分野を選択してください</h3>
            
            {Object.entries(QUESTION_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => handleStartQuiz(category)}
                className="premium-card premium-card-interactive p-4 flex items-center justify-between bg-white text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-550 to-indigo-650 text-white flex items-center justify-center shadow-sm">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{category}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">10問のスピード実戦テストを開始</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Load state fallback
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <p className="animate-pulse text-xs font-bold">問題データをロード中...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = (currentIndex / questions.length) * 100;

  // 2. ACTIVE QUIZ SCREEN
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 relative">
      
      {/* Header bar with progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setIsQuizRunning(false)} className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {/* Progress Bar */}
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

            {/* Options List */}
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

            {/* Action Buttons */}
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
                    💡 AI解説を読む（下へジャンプ）
                  </button>
                </div>
              )}
            </div>

            {/* Premium AI Assist Explanatory Drawer */}
            {isAnswered && currentQuestion.aiInsights && (
              <div id="ai-explanation-drawer" className="mt-6 bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-xl border border-slate-880 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider">AI合格解説</h4>
                </div>

                {/* Tabs */}
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

                {/* Tab Content */}
                <div className="text-xs text-slate-300 leading-relaxed min-h-[65px]">
                  {activeAiTab === "solve" && <p>{currentQuestion.aiInsights.howToSolve}</p>}
                  {activeAiTab === "pitfall" && (
                    <p className="text-rose-300 bg-rose-950/20 p-2.5 rounded-lg border border-rose-950/50">
                      <strong>⚠️ 試験での問われ方:</strong> {currentQuestion.aiInsights.pitfall}
                    </p>
                  )}
                  {activeAiTab === "elimination" && <p>{currentQuestion.aiInsights.eliminationTip}</p>}
                  {activeAiTab === "mnemonic" && currentQuestion.aiInsights.mnemonic && (
                    <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-300 font-medium">
                      {currentQuestion.aiInsights.mnemonic}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-extrabold text-slate-300 mr-1.5">[解説]</span>
                  {currentQuestion.explanation}
                </div>

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
              </div>
            )}
          </div>
        </div>
      ) : (
        // 3. COMPLETED RESULT SCREEN
        <div className="px-5 py-8 flex-1 flex flex-col justify-between items-center text-center animate-in fade-in duration-500">
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center shadow-xl border-4 border-white mb-6 relative">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1.5 border border-white">
                <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              分野別ミニテスト クリア！
            </h2>
            <p className="text-xs text-indigo-650 font-extrabold mt-1 uppercase">
              {selectedCategory}
            </p>

            {/* Metrics cards grid */}
            <div className="mt-8 w-full grid grid-cols-2 gap-3 max-w-[320px]">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold">正解数</p>
                <p className="text-lg font-black text-indigo-600 mt-1">{score} / {questions.length} 問</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold">正答率</p>
                <p className="text-lg font-black text-indigo-600 mt-1">{Math.round((score / questions.length) * 100)}%</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm col-span-2 flex items-center justify-between px-4">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold">判定</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">合格ライン (70%)</p>
                </div>
                <p className={`text-sm font-black px-2.5 py-1 rounded-md ${
                  (score / questions.length) >= 0.7 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}>
                  {(score / questions.length) >= 0.7 ? "合格クリア！" : "不合格（復習が必要）"}
                </p>
              </div>
            </div>

            {/* Encouraging message */}
            <div className="mt-6 bg-slate-100 p-4 rounded-xl text-xs text-slate-500 leading-relaxed max-w-[320px]">
              {(score / questions.length) >= 0.7 ? (
                "素晴らしい！合格水準をクリアしています。この調子で他の分野も攻略しましょう。"
              ) : (
                "間違えた問題は「間違いノート」に自動的に保存されました。繰り返し解き直して弱点を完全に潰しましょう！"
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
              もう一度挑戦する
            </button>
            <button
              onClick={() => setIsQuizRunning(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all text-center"
            >
              他の分野を選択する
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SIMILAR QUESTION MODAL */}
      {/* ========================================== */}
      {similarQuestion && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-t-[2.5rem] p-5 shadow-2xl border-t border-slate-800 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
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

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  {similarQuestion.category}
                </span>
                <span className="text-[9px] font-bold text-slate-500">
                  類題対象: {similarQuestion.subject}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-100 leading-relaxed mb-6">
                {similarQuestion.text}
              </h4>

              {/* Options */}
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

              {/* AI Explanation for Similar */}
              {similarIsAnswered && similarQuestion.aiInsights && (
                <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-850 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-1.5 mb-3 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">類題の攻略タクティクス</span>
                  </div>

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

                  <div className="text-[11px] text-slate-300 leading-relaxed min-h-[50px]">
                    {similarActiveAiTab === "solve" && <p>{similarQuestion.aiInsights.howToSolve}</p>}
                    {similarActiveAiTab === "pitfall" && (
                      <p className="text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-950/50">
                        {similarQuestion.aiInsights.pitfall}
                      </p>
                    )}
                    {similarActiveAiTab === "elimination" && <p>{similarQuestion.aiInsights.eliminationTip}</p>}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-400">[公式解説]</span> {similarQuestion.explanation}
                  </div>
                </div>
              )}
            </div>

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
