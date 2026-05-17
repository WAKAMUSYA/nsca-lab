"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Dumbbell,
  GraduationCap
} from "lucide-react";

export default function SubscribePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSaMember, setIsSaMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const checkAuthAndPlan = async () => {
      const configured = isSupabaseConfigured();
      setIsConfigured(configured);

      if (!configured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_sa_member")
            .eq("id", user.id)
            .single();

          if (profile) {
            setIsSaMember(!!profile.is_sa_member);
          }
        }
      } catch (e) {
        console.error("Auth status load failed:", e);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndPlan();
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/mypage?redirect=/subscribe");
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
        window.location.href = data.url;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-5">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-400 mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">データをロード中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100 pb-20">
      
      {/* Top Header Navigation */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">プラン加入</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-8 flex flex-col gap-6">
        
        {/* Main Header Copy */}
        <div className="text-center flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-black mx-auto">
            <Sparkles className="w-3 h-3" />
            <span>STRENGTH ARTS プレミアム共通プラン</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            NSCA LAB の制限を<br />
            すべて解除して合格へ。
          </h1>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium px-4">
            模擬試験、弱点分析、自動間違いノート作成など、合格するために設計されたすべての極上アシスト機能が使い放題になります。
          </p>
        </div>

        {isSaMember ? (
          /* Case A: Already Subscribed celebrate card */
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">プレミアムプラン加入済み</h2>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                おめでとうございます！現在、すべての制限解除機能がアクティブです。
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link 
                href="/"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] py-3 rounded-xl transition-all cursor-pointer block text-center shadow-md shadow-indigo-900/50"
              >
                ホーム画面に戻る
              </Link>
              <Link 
                href="/mypage"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-extrabold text-[11px] py-3 rounded-xl transition-all cursor-pointer block text-center"
              >
                契約内容を確認・解約する
              </Link>
            </div>
          </div>
        ) : (
          /* Case B: Subscribe Upsell and Price card */
          <div className="flex flex-col gap-6">
            
            {/* Stunning Glassmorphism Pricing Card */}
            <div className="bg-gradient-to-br from-indigo-900/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Product Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    RECOMMENDED
                  </span>
                  <h3 className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5">
                    👑 SA月額プレミアム会員
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">¥500</p>
                  <p className="text-[9px] text-slate-400">/ 月（税込）</p>
                </div>
              </div>

              {/* Bullet Features List */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  プランに含まれるすべての特権
                </p>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200">全3回分のフル模擬試験が解放</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">お試し用第1回に加え、プレミアム用の第2回・第3回が使い放題。</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200">AI 自動間違いノート</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">間違えた問題が自動で蓄積され、自分専用の問題集を自動生成します。</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200">精密な弱点分析チャート</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">正答率データをビジュアルなレーダーチャートで完全可視化。</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200">無制限デイリー特訓問題</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">毎日更新される合格特訓問題を無制限に解くことができます。</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200">AI合格ロードマップ機能</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">試験日から逆算して、あなた専用の学習スケジュールを完全提案。</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {user ? (
                  <button
                    onClick={handleSubscribe}
                    disabled={billingLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-500/50 disabled:to-amber-600/50 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {billingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-slate-950" />
                        <span>Stripe決済画面へ接続中...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>👑 SA月額プラン(500円)に申し込む</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/mypage?redirect=/subscribe"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-indigo-900/50 transition-all text-center block"
                  >
                    🔑 ログインまたは新規登録して申し込む
                  </Link>
                )}
                
                <p className="text-[8.5px] text-slate-400 text-center leading-relaxed mt-1">
                  ※ 解約金・違約金は一切ありません。いつでもご契約者様のマイページより1クリックで安全に解約・一時停止手続きを行っていただけます。
                </p>
              </div>
            </div>

            {/* Smart Purchase Value Statement */}
            <div className="bg-white/5 rounded-2xl p-4.5 border border-white/5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-indigo-300">
                <TrendingUp className="w-4 h-4" />
                <h4 className="font-extrabold text-[11px] text-slate-200">紙の問題集よりも圧倒的に合格に近いワケ</h4>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-relaxed">
                市販の重い参考書や問題集（3,000円以上）は、間違えた問題のコピーや手書きのノート作成が必要で、多大な「勉強以外の手間」が発生します。<br />
                NSCA LABは、月額500円というミニマムな投資で合格に必要な機能をすべて自動化。限られた時間をすべて本質的な暗記と学習に投入可能です。
              </p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
