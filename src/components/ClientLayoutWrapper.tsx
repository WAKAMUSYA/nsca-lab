"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { 
  Sparkles, 
  Smartphone, 
  Flame, 
  Zap, 
  BrainCircuit, 
  ShieldCheck, 
  Download, 
  Laptop, 
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Volume2,
  Clock,
  BookOpen,
  X
} from "lucide-react";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const [isPwaLaunched, setIsPwaLaunched] = useState<boolean | null>(null);

  // Initialize and listen to storage updates to toggle PWA Mode
  useEffect(() => {
    const checkState = () => {
      const launched = localStorage.getItem("nsca_pwa_launched") === "true";
      setIsPwaLaunched(launched);
    };
    checkState();

    window.addEventListener("nsca_storage_update", checkState);
    window.addEventListener("storage", checkState);
    
    return () => {
      window.removeEventListener("nsca_storage_update", checkState);
      window.removeEventListener("storage", checkState);
    };
  }, []);

  // Show a clean, fluid loading skeleton while hydration completes
  if (isPwaLaunched === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <GraduationCap className="w-12 h-12 text-indigo-400 animate-bounce mb-4" />
        <p className="text-xs font-bold animate-pulse">NSCA LAB ロード中...</p>
      </div>
    );
  }

  // Determine if we should display the Landing Page (LP)
  // LP is active ONLY on the root "/" route and when PWA launched is false
  const showLandingPage = pathname === "/" && !isPwaLaunched;

  if (showLandingPage) {
    // Render the stunningly gorgeous, high-converting, full-width Landing Page (LP)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        
        {/* Glowing atmospheric backing spots */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Navigation Header */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-lg">
              NL
            </div>
            <span className="font-extrabold text-base tracking-wider text-white">NSCA LAB</span>
          </div>
          <button
            onClick={() => {
              localStorage.setItem("nsca_pwa_launched", "true");
              window.dispatchEvent(new Event("nsca_storage_update"));
            }}
            className="text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1"
          >
            アプリを起動する
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 z-10">
          <div className="w-full max-w-5xl text-center flex flex-col items-center gap-6">
            
            {/* Tagline */}
            <span className="text-[10px] bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
              🛡️ NSCA-CSCS & CPT 最短合格のための習慣化PWA
            </span>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white max-w-4xl">
              問題集ではなく、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-amber-400 to-orange-500">
                合格までの「習慣」を作る。
              </span>
            </h1>
            
            {/* Subtext */}
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              紙の問題集を買って弱点分析をエクセルで手動集計していませんか？<br />
              NSCA LABは、300問の超動的問題プールとAI合格特化解説、忘却曲線に沿った「今日の5問」で、ジムでも電車内でもあなたの合格を科学的に伴走します。
            </p>

            {/* CTA Trigger */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={() => {
                  localStorage.setItem("nsca_pwa_launched", "true");
                  window.dispatchEvent(new Event("nsca_storage_update"));
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 active:scale-98 text-white font-black text-xs px-8 py-4 rounded-full shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 fill-white/10" />
                無料で特訓を始める（PWA起動）
              </button>
            </div>

            {/* Interactive Mockups/Desktop Visual Feature block */}
            <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              {/* Feature 1 */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col gap-3 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">300問の「動的」問題集</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  体重や種目をプログラム内で動的計算し、丸暗記を防ぎます。設問の解説や解き方コツもすべて体重データに合わせて自動変化する特許級の設計。
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col gap-3 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">AI合格特化解説（4つの盾）</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  単なる公式解説だけでなく、試験頻出の「ひっかけ注意」、実戦的な「消去法テクニック」、暗記を支える「覚え方語呂合わせ」を全問搭載。
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col gap-3 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">電波ゼロでも動くオフラインPWA</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  スマホのホーム画面に1秒でインストール可能。電波の届かない地下鉄の車内やジムの奥深くでも、解答履歴を完全にローカル保存して起動。
                </p>
              </div>

            </div>

            {/* Pricing Section on LP */}
            <div className="mt-16 w-full max-w-3xl bg-indigo-950/20 border border-indigo-900/50 rounded-3xl p-8 flex flex-col gap-6 backdrop-blur-sm">
              <div className="text-center flex flex-col gap-2">
                <h3 className="text-lg font-black text-white">特訓プランの価格体系</h3>
                <p className="text-slate-400 text-xs">すべての機能（300問・弱点分析・間違いノート・模擬試験）をお試し可能</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black border border-amber-500/20">👑 共通パス</span>
                    <h4 className="font-extrabold text-sm text-white mt-2">SA月額会員</h4>
                    <p className="text-xs text-indigo-400 font-bold mt-1">月額 500円</p>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      NSCA LABだけでなく、腰痛復帰リハビリサイトなどすべてのStrength Arts連携システムを使い倒せる共通プラン。
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-black border border-indigo-500/20">🎫 専用パス</span>
                    <h4 className="font-extrabold text-sm text-white mt-2">NSCA LAB 年次</h4>
                    <p className="text-xs text-indigo-400 font-bold mt-1">年額 2,000円</p>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      NSCA試験合格に向けて1年間完全に使いこなしたい方向けの、最も安価で手軽な専用年間チケット。
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* LP Footer */}
        <footer className="w-full border-t border-slate-900/80 bg-slate-950 px-6 py-6 text-center text-[10px] text-slate-500 z-10">
          © {new Date().getFullYear()} NSCA LAB - Strength Arts. All rights reserved.
        </footer>

      </div>
    );
  }

  // Determine if screen rendering is running on PC/Desktop
  // Since we want standard responsiveness, we handle PC wrapper layout using CSS grid:
  // - Desktop/Tablet (md and up): Wrap the children in a gorgeous abstract mockup shell simulating a real mobile phone
  // - Mobile: Remove all wrappers and display full screen for a native, distraction-free app feeling!
  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-0 md:p-8 relative overflow-hidden">
      
      {/* Premium ambient backdrop glow (Visible on PC only) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent)] pointer-events-none hidden md:block" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none hidden md:block" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-[120px] pointer-events-none hidden md:block" />

      {/* Global outer wrapper Grid */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 z-10">
        
        {/* Left Column: Premium Desktop Marketing Sidebar (Visible on Desktop only) */}
        <div className="hidden md:flex flex-col max-w-sm text-left text-white select-none">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs">
              NL
            </div>
            <span className="font-extrabold text-xs tracking-wider text-slate-300">NSCA LAB</span>
          </div>

          <span className="text-[9px] bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-extrabold px-3 py-1 rounded-full self-start mb-4 uppercase tracking-widest">
            🖥️ PC SIMULATOR MODE
          </span>
          
          <h2 className="text-2xl font-black leading-tight tracking-tight">
            NSCA合格専用PWA<br />
            <span className="text-gradient bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              NSCA LAB Simulator
            </span>
          </h2>
          
          <p className="text-slate-400 text-[11px] mt-4 leading-relaxed font-medium">
            スマートフォンにインストールして本領を発揮するモバイル特化のPWA学習システムです。PCの広いブラウザ画面では、実機同様の挙動をシミュレートする高級スマートフォンフレームにて演習いただけます。
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-base">🎫</span>
              <div>
                <p className="text-[9px] text-slate-400 font-bold">契約プランの確認・変更</p>
                <p className="text-[10px] font-bold text-slate-200">マイページから模擬契約切り替えが可能</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-base">📱</span>
              <div>
                <p className="text-[9px] text-slate-400 font-bold">PWAホーム画面追加</p>
                <p className="text-[10px] font-bold text-slate-200">マイページからインストーラー起動可能</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              localStorage.setItem("nsca_pwa_launched", "false");
              window.dispatchEvent(new Event("nsca_storage_update"));
            }}
            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 hover:underline self-start flex items-center gap-1.5 transition-all cursor-pointer mt-8"
          >
            ⬅️ 製品紹介（LP）ページへ戻る
          </button>
        </div>

        {/* Right Column / Center: PWA Smartphone frame (Responsive layout) */}
        {/* On Mobile (width < 768px): This class strips all margins/paddings and makes it fit exactly 100vw and 100vh! */}
        {/* On Desktop: We wrap it inside an exquisite mockup smartphone frame with realistic status bar and glassmorphic backing! */}
        <div className="w-full md:max-w-[410px] md:bg-slate-900 md:rounded-[3rem] md:p-3 md:shadow-2xl md:border-4 md:border-slate-800 md:relative md:ring-8 md:ring-slate-850/50 flex flex-col">
          
          {/* Realistic Phone Speaker / Notch (Desktop only) */}
          <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30 items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
          </div>

          {/* Actual PWA App Container */}
          <div className="w-full min-h-screen md:min-h-[760px] md:max-h-[82vh] bg-slate-50 md:rounded-[2.3rem] overflow-hidden overflow-y-auto flex flex-col relative shadow-inner">
            <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
              {children}
            </main>
            
            {/* Render Bottom Navigation inside PWA shell wrapper */}
            <Navigation />
          </div>

        </div>

      </div>

    </div>
  );
}
