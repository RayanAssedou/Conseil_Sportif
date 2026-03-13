"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";

const menuItems = [
  { href: "/", labelKey: "nav.home", icon: "home", authRequired: false },
  { href: "/scores", labelKey: "nav.liveScores", icon: "live", authRequired: false },
  { href: "/pronostics", labelKey: "nav.predictions", icon: "star", authRequired: true },
  { href: "/articles", labelKey: "nav.articles", icon: "article", authRequired: false },
  { href: "https://nextbet7.tv", labelKey: "nav.watchLive", icon: "watch", authRequired: true, external: true },
  { href: "__vip__", labelKey: "vip.short", icon: "vip", authRequired: false, external: true },
];

function HexIcon({ icon, active, desktop }: { icon: string; active: boolean; desktop?: boolean }) {
  const cls = desktop ? "w-8 h-8" : "w-6 h-6";
  const color = active ? "#ffffff" : "#64748b";

  if (icon === "home")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill={active ? "#dc2626" : "none"} stroke={active ? "#fff" : color} strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-4.5v-5.5a1.5 1.5 0 00-1.5-1.5h-2a1.5 1.5 0 00-1.5 1.5V21H6a1 1 0 01-1-1V9.5z" />
      </svg>
    );

  if (icon === "live")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="14" rx="2" stroke={active ? "#fff" : color} strokeWidth={1.6} fill={active ? "#dc2626" : "none"} />
        <path d="M10 9l5 3-5 3V9z" fill={active ? "#fff" : color} />
        <path d="M8 21h8M12 18v3" stroke={active ? "#dc2626" : color} strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );

  if (icon === "star")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill={active ? "#dc2626" : "none"} stroke={active ? "#fff" : color} strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    );

  if (icon === "article")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill={active ? "#dc2626" : "none"} stroke={active ? "#fff" : color} strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
        <path strokeLinecap="round" d="M7 8h4M7 12h10M7 16h10" stroke={active ? "#fff" : color} strokeWidth={1.6} />
      </svg>
    );

  if (icon === "watch")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={active ? "#fff" : color} strokeWidth={1.6} fill={active ? "#dc2626" : "none"} />
        <path d="M10 8.5l6 3.5-6 3.5V8.5z" fill={active ? "#fff" : color} />
      </svg>
    );

  if (icon === "vip")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          stroke={active ? "#fff" : "#f59e0b"} strokeWidth={1.6}
          fill={active ? "#f59e0b" : "none"} />
        <circle cx="12" cy="12" r="3" fill={active ? "#fff" : "#f59e0b"} opacity={0.6} />
      </svg>
    );

  return null;
}

export default function SpiralMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [vipLink, setVipLink] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/api/content/section?key=whatsapp_vip")
      .then((r) => r.json())
      .then((data) => setVipLink(data?.view_all_link || ""))
      .catch(() => {});
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href) || (href === "/scores" && pathname.startsWith("/match"));
  }

  function renderItem(item: typeof menuItems[number], index: number, desktop: boolean) {
    const isVip = item.icon === "vip";
    const resolvedHref = isVip ? (vipLink || "#") : item.href;
    const active = !item.external && isActive(item.href);
    const locked = item.authRequired && !user;

    const hexSize = desktop ? "w-[72px] h-[72px]" : "w-14 h-14";
    const lockSize = desktop ? "w-5 h-5" : "w-4 h-4";
    const labelSize = desktop ? "text-xs" : "text-[10px]";
    const maxW = desktop ? "max-w-[80px]" : "max-w-[60px]";

    const delay = `${index * 120}ms`;

    const hexContent = (
      <div
        className="flex flex-col items-center gap-2 group"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
          transition: `opacity 0.5s ease ${delay}, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}`,
        }}
      >
        <div
          className={`relative ${hexSize} transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${
            active ? "scale-110" : ""
          }`}
          style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
        >
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              isVip
                ? "bg-gradient-to-b from-amber-400 to-amber-600"
                : active
                  ? "bg-gradient-to-b from-red-500 to-red-600"
                  : "bg-gradient-to-b from-slate-200 to-slate-300 group-hover:from-red-300 group-hover:to-red-400"
            }`}
          />
          <div
            className={`absolute inset-[2px] flex items-center justify-center transition-colors duration-300 ${
              isVip
                ? "bg-amber-50 dark:bg-amber-950 group-hover:bg-amber-100 dark:group-hover:bg-amber-900"
                : active ? "bg-red-600" : "bg-card group-hover:bg-red-50 dark:group-hover:bg-red-950"
            }`}
            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
          >
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <svg className={`${lockSize} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            )}
            <HexIcon icon={item.icon} active={active} desktop={desktop} />
          </div>
        </div>
        <span
          className={`${labelSize} font-semibold leading-tight text-center ${maxW} transition-colors duration-300 ${
            isVip ? "text-amber-600 dark:text-amber-400 group-hover:text-amber-700"
              : active ? "text-red-600" : locked ? "text-slate-400" : "text-slate-500 group-hover:text-red-500"
          }`}
        >
          {t(item.labelKey)}
        </span>
      </div>
    );

    if (locked) {
      return (
        <button
          key={item.href}
          onClick={() => router.push("/auth/signin")}
          className="appearance-none bg-transparent border-none cursor-pointer"
        >
          {hexContent}
        </button>
      );
    }

    if (item.external) {
      return (
        <a key={item.href} href={resolvedHref} target="_blank" rel="noopener noreferrer" className="no-underline">
          {hexContent}
        </a>
      );
    }

    return (
      <Link key={item.href} href={item.href} className="no-underline">
        {hexContent}
      </Link>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden -mt-2 mb-4">
        <div className="bg-card rounded-2xl px-2 py-4 shadow-sm border border-border">
          <div className="flex items-center justify-around">
            {menuItems.map((item, i) => renderItem(item, i, false))}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block -mt-2 mb-6">
        <div className="bg-card rounded-2xl px-6 py-6 shadow-sm border border-border">
          <div className="flex items-center justify-center gap-10 lg:gap-14">
            {menuItems.map((item, i) => renderItem(item, i, true))}
          </div>
        </div>
      </div>
    </>
  );
}
