"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show after a brief moment so it doesn't feel spammy
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS Safari, show instructions if not installed and not standalone
    if (isIosDevice && !(window.navigator as any).standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again in this session
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  // If dismissed in session, do not render
  useEffect(() => {
    const dismissed = sessionStorage.getItem("pwa_dismissed");
    if (dismissed === "true") {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-8 duration-300 max-w-[448px] mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-100">
              ホーム画面に追加して学習を快適に
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              NSCA LABをPWAとしてインストールすると、オフライン対応や全画面での学習が可能になります。
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
        {isIOS ? (
          <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg w-full font-medium">
            <Share className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
            <span>Safariの「共有」ボタンを押して「ホーム画面に追加」を選択してください。</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
            >
              後で
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              インストール
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
