"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Award, 
  AlertCircle, 
  BarChart2, 
  User 
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [mistakeCount, setMistakeCount] = useState(0);

  // Poll localStorage occasionally to get mistakes count
  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem("nsca_mistakes");
        if (stored) {
          const list = JSON.parse(stored);
          setMistakeCount(Array.isArray(list) ? list.length : 0);
        } else {
          setMistakeCount(0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    updateCount();
    // Custom event listener for instant updates when mistakes are cleared/added
    window.addEventListener("nsca_storage_update", updateCount);
    // Standard storage listener for cross-tab updates
    window.addEventListener("storage", updateCount);
    
    return () => {
      window.removeEventListener("nsca_storage_update", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  const navItems = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/mock", label: "模擬試験", icon: Award },
    { href: "/mistakes", label: "間違い", icon: AlertCircle, badge: mistakeCount > 0 ? mistakeCount : undefined },
    { href: "/stats", label: "分析", icon: BarChart2 },
    { href: "/mypage", label: "マイページ", icon: User },
  ];

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 bg-white/85 backdrop-blur-lg border-t border-slate-100 z-50 w-full shadow-2xl rounded-t-2xl">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 flex items-center justify-center relative ${
                isActive 
                  ? "bg-indigo-50/80 text-indigo-600 scale-110 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 hover:scale-105"
              }`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[9px] font-black px-1.5 min-w-[17px] h-4 rounded-full flex items-center justify-center border border-white shadow-md shadow-rose-500/20 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-1 font-bold tracking-tight transition-all duration-200 ${
                isActive ? "text-indigo-600 font-extrabold scale-105" : "text-slate-400"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

