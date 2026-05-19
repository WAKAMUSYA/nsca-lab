"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { supabaseService } from "@/lib/supabaseService";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  Cloud,
  LogOut,
  KeyRound,
  UserPlus,
  User,
  CreditCard,
  ShieldCheck,
  Edit2,
  Check,
  Award,
  Shield,
  FileText,
  Clock,
  Zap,
  Download,
  Share,
  Settings,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function MyPage() {
  const [examType, setExamType] = useState("CSCS");
  const [examDate, setExamDate] = useState("");
  
  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  
  // Supabase & Profile states
  const [isConfigured, setIsConfigured] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState("ゲストメンバー");
  const [isSaMember, setIsSaMember] = useState(false);
  const [subStatus, setSubStatus] = useState<string>("none"); // "active" | "canceled" | "expired" | "none"
  const [subPeriodEnd, setSubPeriodEnd] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);

  // Nickname Edit States
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  
  // Accordion Toggles
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auth Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const loadSettings = () => {
    try {
      const storedType = localStorage.getItem("nsca_exam_type");
      if (storedType) setExamType(storedType);

      const storedDate = localStorage.getItem("nsca_exam_date");
      if (storedDate) setExamDate(storedDate);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettings();

    // Check PWA installation states
    if (typeof window !== "undefined") {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
        setIsAlreadyInstalled(true);
      }
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);
    }

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforePrompt);

    // Check Supabase configuration
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (configured) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          // Load Profile details and verify SA Plan membership gate on mount
          supabase
            .from("profiles")
            .select("nickname, is_sa_member")
            .eq("id", user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setUser(user);
                setNickname(profile.nickname || "メンバー");
                setIsSaMember(!!profile.is_sa_member);
                setNewNickname(profile.nickname || "メンバー");

                // Fetch current subscription status details
                supabase
                  .from("subscriptions")
                  .select("status, current_period_end")
                  .eq("user_id", user.id)
                  .eq("product_key", "strength_arts_member")
                  .maybeSingle()
                  .then(({ data: sub }) => {
                    if (sub) {
                      setSubStatus(sub.status || "none");
                      setSubPeriodEnd(sub.current_period_end || "");
                    }
                  });

                // Auto sync progress
                supabaseService.syncAll();
              } else {
                // Safely clear undefined profiles
                supabase.auth.signOut();
                setUser(null);
              }
            });
        } else {
          setUser(null);
          const guestNick = localStorage.getItem("nsca_guest_nickname") || "ゲストメンバー";
          setNickname(guestNick);
          setNewNickname(guestNick);
        }
      });
    } else {
      setUser(null);
      const guestNick = localStorage.getItem("nsca_guest_nickname") || "ゲストメンバー";
      setNickname(guestNick);
      setNewNickname(guestNick);
    }

    // Storage update listeners
    window.addEventListener("nsca_storage_update", loadSettings);
    window.addEventListener("storage", loadSettings);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
      window.removeEventListener("nsca_storage_update", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  const handleExamTypeChange = (type: string) => {
    setExamType(type);
    localStorage.setItem("nsca_exam_type", type);
    window.dispatchEvent(new Event("nsca_storage_update"));
  };

  const handleExamDateChange = (date: string) => {
    setExamDate(date);
    localStorage.setItem("nsca_exam_date", date);
    window.dispatchEvent(new Event("nsca_storage_update"));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email || (!forgotPasswordMode && !password)) {
      setAuthError("必要な項目をすべて入力してください。");
      return;
    }

    setAuthLoading(true);
    try {
      if (forgotPasswordMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setResetEmailSent(true);
        setAuthError("パスワード再設定用のメールを送信しました。メールボックスをご確認ください。");
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setAuthError("アカウント登録確認メールを送信しました！メールをご確認の上、ログインしてください。");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname, is_sa_member")
          .eq("id", data.user.id)
          .single();

        // Fetch subscription status details
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", data.user.id)
          .eq("product_key", "strength_arts_member")
          .maybeSingle();

        setUser(data.user);
        setNickname(profile?.nickname || "メンバー");
        setIsSaMember(!!profile?.is_sa_member);
        setNewNickname(profile?.nickname || "メンバー");
        if (sub) {
          setSubStatus(sub.status || "none");
          setSubPeriodEnd(sub.current_period_end || "");
        }

        // Load cloud data and sync
        setSyncing(true);
        await supabaseService.pullCloudDataToLocal();
        setSyncing(false);
        setSyncStatus("success");
        window.dispatchEvent(new Event("nsca_storage_update"));
      }
    } catch (err: any) {
      setAuthError(err.message || "認証エラーが発生しました。");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNickname("ゲストメンバー");
    setIsSaMember(false);
    setSubStatus("none");
    setSubPeriodEnd("");
    setEmail("");
    setPassword("");
    setSyncStatus("idle");
    window.dispatchEvent(new Event("nsca_storage_update"));
  };

  const handleUpdateNickname = async () => {
    if (!newNickname.trim()) return;
    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ nickname: newNickname })
          .eq("id", user.id);
        if (error) throw error;
      } else {
        localStorage.setItem("nsca_guest_nickname", newNickname);
      }
      setNickname(newNickname);
      setEditingNickname(false);
      window.dispatchEvent(new Event("nsca_storage_update"));
      window.dispatchEvent(new Event("storage"));
      alert("ニックネームを更新しました！");
    } catch (e) {
      console.error("Nickname update failed:", e);
      alert("ニックネームの更新に失敗しました。");
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      alert("ご契約にはログインが必要です。ログイン後にお手続きをお願いします。");
      return;
    }
    setBillingLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "price_1Pplaceholder";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId: priceId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "決済画面の呼び出しに失敗しました。");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "管理画面の呼び出しに失敗しました。");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSubStatus("canceled");
        setShowCancelModal(false);
        setShowCancelSuccessModal(true);
      } else {
        alert(data.error || "解約処理に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
    } finally {
      setBillingLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } catch {
      return "";
    }
  };



  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      
      {/* Profile Welcome Header Banner */}
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 text-white px-5 pt-8 md:pt-10 pb-16 md:pb-20 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Navigation line */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <Link href="/" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-extrabold text-base text-white">マイページ</h1>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-white/20 animate-pulse" style={{ animationDuration: '3s' }}>
            {nickname.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-white">{nickname} さん</h2>
            </div>
            
            {/* Membership pills */}
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              {isSaMember ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-amber-300">
                  👑 SA月額会員
                </span>
              ) : (
                <span className="text-[9px] font-medium bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                  👤 一般メンバー
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-4 -mt-8 md:-mt-10 flex flex-col gap-6">

        {/* Sleek Tabbed Login Box (Only when NOT logged in) */}
        {!user && (
          <div className="premium-card p-6 bg-white border border-slate-100 shadow-md relative overflow-hidden animate-in fade-in duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            {forgotPasswordMode ? (
              // Forgot Password Mode
              <div>
                <h3 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  パスワードの再設定
                </h3>
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                    ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
                  </p>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="メールアドレス"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all"
                      required
                    />
                  </div>

                  {authError && (
                    <p className={`text-[10px] font-bold p-3 rounded-xl border animate-in fade-in ${
                      resetEmailSent 
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                        : "text-rose-500 bg-rose-50 border-rose-100"
                    }`}>
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {authLoading ? "送信中..." : "再設定メールを送信"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordMode(false);
                      setResetEmailSent(false);
                      setAuthError("");
                    }}
                    className="text-[10px] text-indigo-600 font-bold hover:underline self-center cursor-pointer mt-1"
                  >
                    ログインに戻る
                  </button>
                </form>
              </div>
            ) : (
              // Normal Login / Sign Up Tabs
              <div>
                <div className="flex border-b border-slate-100 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setAuthError("");
                    }}
                    className={`flex-1 pb-3 text-center text-xs font-black transition-all cursor-pointer ${
                      !isSignUp 
                        ? 'border-b-2 border-indigo-600 text-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    ログイン
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setAuthError("");
                    }}
                    className={`flex-1 pb-3 text-center text-xs font-black transition-all cursor-pointer ${
                      isSignUp 
                        ? 'border-b-2 border-indigo-600 text-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    新規アカウント作成
                  </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all"
                        required
                        autoComplete="email"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={isSignUp ? "パスワード (6文字以上)" : "パスワード"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all"
                        required
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(true);
                        setAuthError("");
                      }}
                      className="text-[10px] text-slate-400 font-bold hover:text-indigo-600 self-end cursor-pointer -mt-1"
                    >
                      パスワードをお忘れですか？
                    </button>
                  )}

                  {authError && (
                    <p className={`text-[10px] font-bold p-3 rounded-xl border animate-in fade-in ${
                      authError.includes("登録確認") || authError.includes("再設定")
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : "text-rose-500 bg-rose-50 border-rose-100"
                    }`}>
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    {isSignUp ? <UserPlus className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
                    {authLoading ? "処理中..." : isSignUp ? "アカウントを新規登録" : "ログインする"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 1. Target Exam Customizer (目標設定 - Outside accordion, positioned at the very top) */}
        <div className="premium-card p-5 bg-white shadow-md border border-slate-100 flex flex-col gap-3.5 relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            目標設定
          </h3>

          <div className="flex flex-col gap-3.5">
            <div>
              {/* Type Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExamTypeChange("CSCS")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    examType === "CSCS"
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  CSCS 受験モデル
                </button>
                <button
                  onClick={() => handleExamTypeChange("NSCA-CPT")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    examType === "NSCA-CPT"
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  NSCA-CPT 受験モデル
                </button>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  本試験日
                </span>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => handleExamDateChange(e.target.value)}
                  className="text-xs bg-transparent border-none text-slate-700 font-black outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Unified App Settings & Account Plan Card (設定) */}
        <div className="premium-card bg-white shadow-md border border-slate-100 overflow-hidden relative transition-all duration-300">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full p-5 flex items-center justify-between font-extrabold text-xs text-slate-800 hover:bg-slate-50 transition-all cursor-pointer outline-none"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-indigo-600 animate-spin" style={{ animationDuration: '10s' }} />
              設定
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
          </button>

          {showSettings && (
            <div className="px-5 pb-5 border-t border-slate-100/80 pt-5 flex flex-col gap-5 bg-slate-50/20 animate-in slide-in-from-top-4 duration-300">
              
              {/* A. Nickname Changer */}
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-wider">👤 ニックネーム</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="ニックネームを入力"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                    maxLength={12}
                  />
                  <button
                    onClick={handleUpdateNickname}
                    className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-[10px] font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              </div>

              {/* B. Plan Status List */}
              <div className="border-t border-slate-100 pt-4">
                <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-wider">💳 ご契約プラン</label>
                <div className="flex flex-col gap-2.5">
                  
                  {/* SA Monthly plan card */}
                  <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex flex-col gap-3 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                          👑 STRENGTH ARTS 月額会員
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">
                          全PWAサービスの制限を解除する共通プラン（月額500円）
                        </p>
                      </div>
                      <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-lg border transition-all ${
                        isSaMember 
                          ? "bg-amber-100 text-amber-800 border-amber-300" 
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}>
                        {isSaMember ? "加入中" : "未加入"}
                      </span>
                    </div>

                    {/* Stripe checkout or portal redirect buttons */}
                    <div className="pt-2 border-t border-slate-100">
                      {isSaMember ? (
                        <div className="flex flex-col gap-2">
                          {subStatus === "canceled" ? (
                            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col gap-1 items-center justify-center text-center animate-in fade-in duration-300">
                              <span className="text-[10px] font-black text-amber-800 flex items-center gap-1.5">
                                ⏳ 自動解約の予約済み
                              </span>
                              <p className="text-[9px] text-amber-700 font-bold">
                                有効期限: <span className="font-extrabold">{formatDate(subPeriodEnd)}</span>
                              </p>
                              <p className="text-[8px] text-slate-400 mt-1 leading-normal">
                                有効期限までは、引き続きすべてのプレミアム機能（試験対策）をご利用いただけます。追加の請求は発生しません。
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowCancelModal(true)}
                              disabled={billingLoading}
                              className="w-full bg-white hover:bg-rose-50/60 disabled:bg-slate-50 text-rose-600 border border-rose-100 font-extrabold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {billingLoading ? "接続中..." : "🚫 月額プランの解約手続き"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleSubscribe}
                          disabled={billingLoading}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-[10px] py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
                        >
                          {billingLoading ? "接続中..." : "👑 SA月額プラン(500円)に申し込む"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Privacy & Disclaimer Accordions (プライバシーポリシー ＆ 免責事項) */}
        <div className="flex flex-col gap-2">
          
          {/* Privacy Policy */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="w-full p-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                プライバシーポリシー
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showPrivacy ? 'rotate-180' : ''}`} />
            </button>
            
            {showPrivacy && (
              <div className="p-4 pt-0 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed bg-slate-50/50">
                <p className="font-bold text-slate-700 mb-1">【個人情報・学習進捗の取扱いについて】</p>
                1. NSCA LABは、ユーザーの学習データ（解答履歴、間違いノート履歴、カレンダー等）の保護を最優先課題として取り扱います。<br />
                2. 入力されたメールアドレスおよびアカウント認証情報は、暗号化処理された上でクラウド（Supabase）に保存され、進捗データのバックアップおよび同期以外の目的には使用しません。<br />
                3. 当サービスは、第三者にユーザー情報を提供・開示することは一切ありません。安心して学習にご活用ください。
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setShowDisclaimer(!showDisclaimer)}
              className="w-full p-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                免責事項
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDisclaimer ? 'rotate-180' : ''}`} />
            </button>
            
            {showDisclaimer && (
              <div className="p-4 pt-0 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed bg-slate-50/50">
                <p className="font-bold text-slate-700 mb-1">【本アプリの利用に関する免責】</p>
                1. NSCA LABは、NSCA-CPTおよびCSCS試験合格に特化した補助的な学習ツールです。当アプリに掲載されている練習問題やAI解説は高い専門性と精度をもって制作されておりますが、実際の試験の合格を法的に保証するものではありません。<br />
                2. 解説の正誤・試験傾向の突然の変更・その他アプリ上の不具合などによって発生したあらゆるトラブルや損害、および試験結果に対して、制作者および当サービスは一切の責任を負いかねます。
              </div>
            )}
          </div>

        </div>





        {/* 7. Dedicated PWA Installation Trigger Widget */}
        {!isAlreadyInstalled && (
          <div className="premium-card p-5 bg-white border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-lg pointer-events-none" />
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-slate-800">ホーム画面に追加 (PWAインストール)</h4>
                <p className="text-[9.5px] text-slate-400 mt-1 leading-relaxed">
                  ホーム画面にアイコンを追加すると、アドレスバーのないフル画面で、本物のアプリと同様にサクサク快適に試験対策を進められます。
                </p>

                {isIOS ? (
                  <div className="mt-3 bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 flex items-start gap-1.5 text-[9px] text-amber-800 font-bold leading-normal">
                    <Share className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>iPhone Safariの「共有（四角に上矢印）」メニューから「ホーム画面に追加」を選択してください。</span>
                  </div>
                ) : deferredPrompt ? (
                  <button
                    onClick={handleInstallPwa}
                    className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ホーム画面にアプリを追加する
                  </button>
                ) : (
                  <p className="text-[9px] text-indigo-500 font-bold bg-indigo-50 p-2.5 rounded-xl border border-indigo-100/60 mt-3 leading-relaxed">
                    💡 お使いのブラウザはすでにインストール済みか、またはブラウザのメニューからいつでも手動でホーム画面に追加可能です。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. Bottom Clean Settings Logout Button (Only when logged in) */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full bg-white border border-rose-100 hover:bg-rose-50/30 text-rose-500 py-3.5 px-4 rounded-2xl font-black text-xs text-center shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <LogOut className="w-4 h-4" />
            アカウントからログアウト
          </button>
        )}

      </div>

      {/* In-app cancellation confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center self-center shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-slate-800 text-sm">月額プランを解約しますか？</h3>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                解約手続き完了後も、現在の支払い有効期限までは、引き続きすべての試験対策機能（CSCS/NSCA-CPT）をフルにご利用いただけます。
              </p>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer text-center font-bold"
              >
                いいえ、戻る
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={billingLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center cursor-pointer"
              >
                {billingLoading ? "処理中..." : "はい、解約する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation success modal */}
      {showCancelSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center self-center shadow-inner">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">解約手続きが完了しました</h3>
              <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                自動更新の停止手続きを承りました。<br />
                現在の有効期限（{formatDate(subPeriodEnd)}）までは、すべてのプレミアム機能をご利用いただけます。
              </p>
            </div>
            <button
              onClick={() => setShowCancelSuccessModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow cursor-pointer mt-2"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
