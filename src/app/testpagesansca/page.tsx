"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, ShieldAlert, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function TestPageSanSca() {
  const [user, setUser] = useState<any>(null);
  const [isSaMember, setIsSaMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, is_sa_member")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setIsSaMember(profile.is_sa_member || false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const toggleMockSubscription = async () => {
    if (!user) {
      alert("この操作を行うにはログインが必要です。マイページ等からログインしてください。");
      return;
    }
    const nextState = !isSaMember;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_sa_member: nextState })
        .eq("id", user.id);
      if (error) throw error;
      setIsSaMember(nextState);
      window.dispatchEvent(new Event("nsca_storage_update"));
      alert(`👑 SA月額会員資格を模擬的に ${nextState ? "有効化" : "無効化"} しました！`);
    } catch (e) {
      console.error(e);
      alert("Supabaseプロファイルの更新に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="w-full bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/mypage" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-extrabold text-sm tracking-wider">NSCA LAB 隠しデバッグパネル</span>
        </div>
        <span className="text-[9px] text-red-400 font-extrabold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
          ⚠️ 開発・テスト用秘密ページ
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 mx-auto mb-3 border border-amber-400/20">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-lg font-black text-white">SA 模擬プラン切り替え</h1>
          <p className="text-slate-400 text-[10px] mt-1.5 leading-relaxed">
            本番決済（Stripeなど）を導入する前段階のシミュレーション用に、ログイン中のアカウントに対して「SA月額会員（Supabase）」の状態を手動で安全にON/OFFすることができます。
          </p>
        </div>

        {loading ? (
          <div className="text-center text-xs py-12 text-slate-500 font-bold animate-pulse">
            アカウント状態を読み込み中...
          </div>
        ) : !user ? (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center shadow-lg">
            <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto mb-3" />
            <h3 className="text-xs font-black text-white">ログインされていません</h3>
            <p className="text-[10px] text-slate-500 mt-1 mb-4 leading-relaxed">
              プラン切り替えは、ログインしているアカウントの進捗データと連携します。マイページよりログインしてからこの隠しページを再度開いてください。
            </p>
            <Link 
              href="/mypage" 
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all"
            >
              マイページへ移動してログイン
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Account Info Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">STATUS</span>
              <h3 className="text-xs font-extrabold text-white mt-0.5">{user.email} さん</h3>
              <p className="text-[9px] text-slate-500 mt-1">ログイン中のSupabase ID: <span className="font-mono text-[8px] bg-white/5 px-1 py-0.5 rounded text-slate-400">{user.id}</span></p>
            </div>

            {/* Simulated Billing Control Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">模擬契約コントロール</h3>
              </div>

              {/* SA Monthly Plan */}
              <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl flex justify-between items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-black text-white flex items-center gap-1.5">
                    👑 Strength Arts 月額会員 (SA月額)
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                    データベース内の「is_sa_member」フィールドを真理値反転します。
                  </p>
                </div>
                <button
                  onClick={toggleMockSubscription}
                  className={`px-3 py-2 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
                    isSaMember 
                      ? "bg-rose-600 border-rose-500 text-white hover:bg-rose-500 shadow-md shadow-rose-950/20" 
                      : "bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {isSaMember ? "模擬契約 解除" : "模擬契約 ON"}
                </button>
              </div>
            </div>
            
            {/* Note */}
            <div className="text-center text-[9px] text-slate-500 leading-relaxed font-medium">
              💡 切り替えた模擬資格の状態は、アプリのホーム画面やマイページのプラン表示に即座にリアルタイム自動同期されます。
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
