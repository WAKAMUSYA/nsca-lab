"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sampleQuestions, Question } from "@/data/questions";
import { 
  ArrowLeft, 
  AlertCircle, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  BookOpen, 
  ChevronRight, 
  Calendar,
  Sparkles,
  Lightbulb,
  Target,
  ShieldCheck,
  BrainCircuit,
  Zap,
  X,
  FileText
} from "lucide-react";

interface FailedQuestion extends Question {
  dateFailed: string;
}

export default function MistakesNotebook() {
  const [mistakes, setMistakes] = useState<FailedQuestion[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Interactive Retake Modal State
  const [retakeQuestion, setRetakeQuestion] = useState<FailedQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState<"solve" | "pitfall" | "elimination" | "mnemonic">("solve");

  // Similar Question Active states
  const [similarQuestion, setSimilarQuestion] = useState<Question | null>(null);
  const [similarSelectedOption, setSimilarSelectedOption] = useState<number | null>(null);
  const [similarIsAnswered, setSimilarIsAnswered] = useState<boolean>(false);
  const [similarIsCorrect, setSimilarIsCorrect] = useState<boolean>(false);
  const [similarActiveAiTab, setSimilarActiveAiTab] = useState<"solve" | "pitfall" | "elimination" | "mnemonic">("solve");

  // Load mistakes from localStorage
  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = () => {
    try {
      const stored = localStorage.getItem("nsca_mistakes");
      if (stored) {
        setMistakes(JSON.parse(stored));
      } else {
        setMistakes([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete mistake manual
  const handleDeleteMistake = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updated = mistakes.filter((m) => m.id !== id);
    setMistakes(updated);
    try {
      localStorage.setItem("nsca_mistakes", JSON.stringify(updated));
      window.dispatchEvent(new Event("nsca_storage_update"));
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger retake question quiz
  const handleStartRetake = (q: FailedQuestion) => {
    setRetakeQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setActiveAiTab("solve");
  };

  const handleRetakeOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheckRetake = () => {
    if (selectedOption === null || !retakeQuestion) return;
    
    const correct = selectedOption === retakeQuestion.answerIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      // Remove this question from the mistakes list
      const updated = mistakes.filter((m) => m.id !== retakeQuestion.id);
      setMistakes(updated);
      try {
        localStorage.setItem("nsca_mistakes", JSON.stringify(updated));
        window.dispatchEvent(new Event("nsca_storage_update"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCloseRetake = () => {
    setRetakeQuestion(null);
  };

  // Launch linked similar question modal
  const handleStartSimilarQuestion = (similarId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      // Save similar mistake as well
      try {
        const stored = localStorage.getItem("nsca_mistakes");
        let list: any[] = stored ? JSON.parse(stored) : [];
        if (!list.some((item) => item.id === similarQuestion.id)) {
          list.push({
            ...similarQuestion,
            dateFailed: new Date().toISOString(),
          });
          localStorage.setItem("nsca_mistakes", JSON.stringify(list));
          loadMistakes(); // reload main lists
          window.dispatchEvent(new Event("nsca_storage_update"));
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

  // Filter categories
  const categories = ["All", ...Array.from(new Set(mistakes.map((m) => m.category)))];
  
  const filteredMistakes = activeCategory === "All"
    ? mistakes
    : mistakes.filter((m) => m.category === activeCategory);

  // Helper date format
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch (e) {
      return "最近";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-base text-slate-900">間違い克服ノート</h1>
      </div>

      <div className="px-4 py-6 flex flex-col gap-5 flex-1">
        
        {/* Info panel */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-xs text-rose-950">試験頻出ひっかけ・消去法を叩き込む</h4>
            <p className="text-[10px] text-rose-700 mt-1 leading-relaxed">
              間違えた問題を繰り返し解き直し、合格基準に満たない弱点を瞬時に排除します。正解するとこのリストから自動的に消去され、合格率が引き上げられます。
            </p>
          </div>
        </div>

        {mistakes.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">未克服の間違いはゼロ！</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-[240px]">
              素晴らしい状態です。デイリー問題や模擬試験を受けて、弱点ドメインを積極的にあぶり出しましょう！
            </p>
            <Link 
              href="/daily" 
              className="mt-5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2.5 px-6 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              今日の5問を解く
            </Link>
          </div>
        ) : (
          /* Active mistakes list */
          <>
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {cat === "All" ? `すべて (${mistakes.length})` : cat}
                </button>
              ))}
            </div>

            {/* Mistakes loop */}
            <div className="flex flex-col gap-4 mt-1">
              {filteredMistakes.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => handleStartRetake(m)}
                  className="premium-card p-4 hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 border-l-4 border-l-rose-500 shadow-sm bg-white"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold">
                        {m.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(m.dateFailed)}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-800 leading-relaxed mt-2.5 line-clamp-2">
                      {m.text}
                    </h4>

                    {m.aiInsights?.pitfall && (
                      <div className="mt-3 bg-rose-500/5 border border-rose-500/10 rounded-lg p-2.5 flex items-start gap-2">
                        <Target className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div className="text-[10px] text-slate-600 leading-relaxed">
                          <span className="font-extrabold text-rose-600">試験のひっかけ罠:</span> {m.aiInsights.pitfall}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 gap-2">
                    <button
                      onClick={(e) => handleDeleteMistake(m.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="この間違いを削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-2 ml-auto">
                      {m.similarQuestionId && (
                        <button
                          onClick={(e) => handleStartSimilarQuestion(m.similarQuestionId!, e)}
                          className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-all flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                          類題を解く
                        </button>
                      )}
                      
                      <span className="text-[10px] text-indigo-600 font-black flex items-center gap-1 bg-indigo-50/50 border border-indigo-100 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
                        <RotateCcw className="w-3 h-3" />
                        再挑戦する
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Retake modal quiz overlay */}
      {retakeQuestion && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-[420px] shadow-2xl border border-slate-100 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">間違い再テスト</span>
              </div>
              <button 
                onClick={handleCloseRetake}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1">
              <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2 inline-block">
                {retakeQuestion.category}
              </span>
              <h3 className="font-extrabold text-sm text-slate-800 leading-relaxed mb-5">
                {retakeQuestion.text}
              </h3>

              <div className="flex flex-col gap-2">
                {retakeQuestion.options.map((option, idx) => {
                  let btnStyle = "btn-option bg-white text-slate-700 border-slate-200";
                  
                  if (isAnswered) {
                    if (idx === retakeQuestion.answerIndex) {
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
                      onClick={() => handleRetakeOptionClick(idx)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs leading-relaxed font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && idx === retakeQuestion.answerIndex && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Success / Fail message */}
              {isAnswered && (
                <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {isCorrect ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 leading-relaxed">
                      🎉 <b>正解！この問題は克服されました！</b> ノートから自動で削除されます。
                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[11px] text-rose-800 leading-relaxed">
                      ⚠️ <b>不正解です。</b> ひっかけのパターンに引っかかっています。
                      <div className="mt-2 pt-2 border-t border-rose-200/50 text-[10px] text-slate-500">
                        <b>正しい答え:</b> {retakeQuestion.options[retakeQuestion.answerIndex]}
                      </div>
                    </div>
                  )}
                  
                  {/* Detailed Exam Tactics Tabs */}
                  {retakeQuestion.aiInsights && (
                    <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 mb-2.5 text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">AI 合格特化テクニック</span>
                      </div>

                      <div className="flex border-b border-slate-800 text-[10px] font-bold mb-3 overflow-x-auto gap-2">
                        <button
                          onClick={() => setActiveAiTab("solve")}
                          className={`pb-1.5 px-0.5 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                            activeAiTab === "solve" 
                              ? "border-amber-400 text-amber-400 font-black" 
                              : "border-transparent text-slate-500"
                          }`}
                        >
                          解き方コツ
                        </button>
                        <button
                          onClick={() => setActiveAiTab("pitfall")}
                          className={`pb-1.5 px-0.5 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                            activeAiTab === "pitfall" 
                              ? "border-amber-400 text-amber-400 font-black" 
                              : "border-transparent text-slate-500"
                          }`}
                        >
                          ひっかけ注意
                        </button>
                        <button
                          onClick={() => setActiveAiTab("elimination")}
                          className={`pb-1.5 px-0.5 flex items-center gap-1 border-b-2 transition-all whitespace-nowrap ${
                            activeAiTab === "elimination" 
                              ? "border-amber-400 text-amber-400 font-black" 
                              : "border-transparent text-slate-500"
                          }`}
                        >
                          消去法テク
                        </button>
                      </div>

                      {/* Tab Text */}
                      <div className="text-[11px] text-slate-300 leading-relaxed min-h-[50px]">
                        {activeAiTab === "solve" && (
                          <p>{retakeQuestion.aiInsights.howToSolve}</p>
                        )}
                        {activeAiTab === "pitfall" && (
                          <p className="text-rose-300">
                            {retakeQuestion.aiInsights.pitfall}
                          </p>
                        )}
                        {activeAiTab === "elimination" && (
                          <p>{retakeQuestion.aiInsights.eliminationTip}</p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
                        <span className="font-bold">[解説]</span> {retakeQuestion.explanation}
                      </div>

                      {/* 類題に挑戦ボタン */}
                      {retakeQuestion.similarQuestionId && (
                        <button
                          onClick={() => {
                            handleCloseRetake();
                            handleStartSimilarQuestion(retakeQuestion.similarQuestionId!);
                          }}
                          className="w-full mt-4 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 py-2 rounded-lg font-black text-[10px] text-center shadow-md transition-all flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                          この問題の「類題」を解く
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal action */}
            <div className="mt-6 pt-3 border-t border-slate-100">
              {!isAnswered ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleCheckRetake}
                  className={`w-full py-3.5 rounded-xl text-xs font-black text-center shadow-md transition-all ${
                    selectedOption === null
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  答えをチェック
                </button>
              ) : (
                <button
                  onClick={handleCloseRetake}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl text-xs font-black transition-all"
                >
                  閉じる
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ACTIVE INTERACTIVE SIMILAR QUESTION MODAL */}
      {/* ========================================== */}
      {similarQuestion && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-t-[2.5rem] p-5 shadow-2xl border-t border-slate-800 max-h-[92vh] overflow-y-auto flex flex-col justify-between max-w-[480px] mx-auto w-full">
            
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
