"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { useProPlusModal } from "@/contexts/ProPlusModalContext";

const menuItems = [
  { href: "https://chat.whatsapp.com/F8XeC3mbQfQ0vdUZoNbeqT", labelKey: "nav.liveTicker", icon: "ticker", authRequired: false, external: true },
  { href: "/scores", labelKey: "nav.liveScores", icon: "live", authRequired: false },
  { href: "/pronostics", labelKey: "nav.predictions", icon: "star", authRequired: true },
  { href: "/articles", labelKey: "nav.articles", icon: "article", authRequired: false },
  { href: "https://nextbet7.tv", labelKey: "nav.watchLive", icon: "watch", authRequired: true, external: true },
  { href: "__vip__", labelKey: "vip.short", icon: "vip", authRequired: false, external: true },
];

function HexIcon({ icon, active, desktop }: { icon: string; active: boolean; desktop?: boolean }) {
  const cls = desktop ? "w-8 h-8" : "w-6 h-6";
  const pri = active ? "#ffffff" : "#dc2626";
  const sec = active ? "rgba(255,255,255,0.5)" : "#94a3b8";
  const fill = active ? "#ffffff" : "#334155";
  const fillSoft = active ? "rgba(255,255,255,0.25)" : "rgba(100,116,139,0.15)";

  if (icon === "ticker")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 5.92 2 10.66c0 2.72 1.63 5.15 4.15 6.72l-.88 3.3a.5.5 0 00.73.55l3.84-2.07c.69.13 1.41.2 2.16.2 5.52 0 10-3.92 10-8.7S17.52 2 12 2z" fill={fillSoft} />
        <path d="M12 3C7.03 3 3 6.47 3 10.66c0 2.4 1.42 4.56 3.65 6.02a.75.75 0 01.32.82l-.6 2.26 2.72-1.47a.75.75 0 01.58-.06c.73.16 1.5.24 2.33.24 4.97 0 9-3.47 9-7.81S16.97 3 12 3z" stroke={fill} strokeWidth={1.3} />
        <circle cx="8" cy="10.5" r="1.2" fill={pri} />
        <circle cx="12" cy="10.5" r="1.2" fill={pri} />
        <circle cx="16" cy="10.5" r="1.2" fill={pri} />
      </svg>
    );

  if (icon === "live")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <rect x="1.5" y="3.5" width="21" height="14" rx="2.5" fill={fillSoft} />
        <rect x="2" y="4" width="20" height="13" rx="2" stroke={fill} strokeWidth={1.3} />
        <path d="M9.5 8v7l6.5-3.5L9.5 8z" fill={pri} />
        <circle cx="5" cy="7" r="0.8" fill={pri} opacity={0.8}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <path d="M7.5 20h9M12 17v3" stroke={sec} strokeWidth={1.3} strokeLinecap="round" />
        <path d="M8 20.5h8" stroke={fill} strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );

  if (icon === "star")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01L12 2z" fill={fillSoft} />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01L12 2z" stroke={fill} strokeWidth={1.3} strokeLinejoin="round" />
        <path d="M12 5.5l2 4.1 4.5.65-3.25 3.17.77 4.47L12 15.47l-4.02 2.42.77-4.47L5.5 10.25l4.5-.65L12 5.5z" fill={pri} opacity={0.9} />
        <path d="M12 7l1.3 2.65 2.92.42-2.11 2.06.5 2.9L12 13.3l-2.61 1.73.5-2.9-2.11-2.06 2.92-.42L12 7z" fill={active ? "#fff" : "#dc2626"} opacity={0.4} />
      </svg>
    );

  if (icon === "article")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="18" rx="2.5" fill={fillSoft} />
        <rect x="2.5" y="3.5" width="19" height="17" rx="2" stroke={fill} strokeWidth={1.3} />
        <rect x="5" y="6" width="6" height="5" rx="1" fill={pri} opacity={0.7} />
        <line x1="13" y1="7" x2="19" y2="7" stroke={pri} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="13" y1="9.5" x2="18" y2="9.5" stroke={sec} strokeWidth={1.2} strokeLinecap="round" />
        <line x1="5" y1="14" x2="19" y2="14" stroke={sec} strokeWidth={1.2} strokeLinecap="round" />
        <line x1="5" y1="17" x2="15" y2="17" stroke={sec} strokeWidth={1.2} strokeLinecap="round" />
      </svg>
    );

  if (icon === "watch")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={fillSoft} />
        <circle cx="12" cy="12" r="9.5" stroke={fill} strokeWidth={1.3} />
        <circle cx="12" cy="12" r="7" stroke={sec} strokeWidth={0.7} strokeDasharray="2 2" />
        <path d="M10 8l7 4-7 4V8z" fill={pri} />
        <path d="M10 8l7 4-7 4V8z" stroke={fill} strokeWidth={0.5} opacity={0.3} />
        <circle cx="12" cy="12" r="1.2" fill={active ? "#fff" : "#dc2626"} opacity={0.35} />
        <circle cx="4.5" cy="7" r="0.6" fill={pri} opacity={0.5} />
        <circle cx="19.5" cy="17" r="0.6" fill={pri} opacity={0.5} />
      </svg>
    );

  if (icon === "vip")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M12 1l3.5 7.1L23 9.2l-5.65 5.5L18.7 23 12 19.3 5.3 23l1.35-8.3L1 9.2l7.5-1.1L12 1z" fill={active ? "rgba(255,255,255,0.2)" : "rgba(59,130,246,0.15)"} />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01L12 2z" stroke={active ? "#fff" : "#3b82f6"} strokeWidth={1.3} strokeLinejoin="round" />
        <path d="M12 5.5l2 4.1 4.5.65-3.25 3.17.77 4.47L12 15.47l-4.02 2.42.77-4.47L5.5 10.25l4.5-.65L12 5.5z" fill={active ? "#fff" : "#3b82f6"} opacity={0.7} />
        <circle cx="12" cy="11.5" r="2.8" fill={active ? "rgba(255,255,255,0.4)" : "rgba(59,130,246,0.3)"} />
        <text x="12" y="13.2" textAnchor="middle" fontSize="4.5" fontWeight="900" fontFamily="Arial" fill={active ? "#3b82f6" : "#1e40af"} opacity={0.9}>+</text>
      </svg>
    );

  return null;
}

export default function SpiralMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { openProPlus } = useProPlusModal();
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
                ? "bg-gradient-to-b from-blue-400 to-blue-600"
                : active
                  ? "bg-gradient-to-b from-red-500 to-red-600"
                  : "bg-gradient-to-b from-slate-200 to-slate-300 group-hover:from-red-300 group-hover:to-red-400"
            }`}
          />
          <div
            className={`absolute inset-[2px] flex items-center justify-center transition-colors duration-300 ${
              isVip
                ? "bg-blue-50 dark:bg-blue-950 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
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
            isVip ? "text-blue-500 dark:text-blue-400 group-hover:text-blue-600"
              : active ? "text-red-600" : locked ? "text-slate-400" : "text-slate-500 group-hover:text-red-500"
          }`}
          {...(isVip ? { dir: "ltr" } : {})}
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

    if (isVip) {
      return (
        <button
          key={item.href}
          onClick={() => openProPlus(vipLink)}
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
