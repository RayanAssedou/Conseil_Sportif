"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";

const navKeys = [
  { href: "/", labelKey: "nav.home", icon: "home" },
  { href: "/scores", labelKey: "nav.liveScores", icon: "live" },
  { href: "/pronostics", labelKey: "nav.predictions", icon: "star", authRequired: true },
  { href: "/articles", labelKey: "nav.articles", icon: "article" },
  { href: "https://nextbet7.tv", labelKey: "nav.watchLive", icon: "watch", external: true, authRequired: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { reminders, goalAlerts } = useNotifications();
  const { t, locale, setLocale } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifCount = reminders.size + goalAlerts.size;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/auth/")) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href) || (href === "/scores" && pathname.startsWith("/match"));
  }

  const toggleLang = () => setLocale(locale === "en" ? "he" : "en");

  function NavIcon({ icon, active }: { icon: string; active: boolean }) {
    if (icon === "home") return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    );
    if (icon === "live") return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: active ? "white" : "#dc2626" }} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? "bg-white" : "bg-primary"}`} />
      </span>
    );
    if (icon === "star") return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    );
    if (icon === "article") return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    );
    if (icon === "watch") return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    );
    return null;
  }

  function renderNavItem({ href, labelKey, icon, external, authRequired }: typeof navKeys[number], mobile = false) {
    const active = !external && isActive(href);
    const locked = authRequired && !user;

    const baseClass = mobile
      ? `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all w-full ${
          active
            ? "bg-primary text-white"
            : locked
            ? "text-text-secondary/50"
            : "text-text-secondary hover:bg-surface-light hover:text-text"
        }`
      : `flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
          active
            ? "bg-primary text-white shadow-md shadow-primary/25"
            : locked
            ? "text-text-secondary/50 hover:bg-surface-light cursor-pointer"
            : "text-text-secondary hover:bg-surface-light hover:text-text"
        }`;

    const content = (
      <>
        <NavIcon icon={icon} active={active} />
        {locked && (
          <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        )}
        <span className={mobile ? "" : "hidden sm:inline"}>{t(labelKey)}</span>
      </>
    );

    if (locked) {
      return (
        <button
          key={href}
          onClick={() => { router.push("/auth/signin"); setMobileOpen(false); }}
          className={baseClass}
          title={t("nav.signInToWatch")}
        >
          {content}
        </button>
      );
    }

    if (external) {
      return (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={baseClass} onClick={() => setMobileOpen(false)}>
          {content}
        </a>
      );
    }

    return (
      <Link key={href} href={href} className={baseClass} onClick={() => setMobileOpen(false)}>
        {content}
      </Link>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.93 0 3.68.69 5.05 1.83L14.5 8.5l-2.5-1-2.5 1-2.55-2.67A7.956 7.956 0 0 1 12 4zm-8 8c0-1.62.5-3.13 1.33-4.38L8 10.5v3l2.5 2.5-1 3.5A7.98 7.98 0 0 1 4 12zm8 8c-1.35 0-2.62-.35-3.73-.96L9.5 15.5 12 13l4 1v3.5l-1.32 1.98A7.89 7.89 0 0 1 12 20zm5.67-2.87L16 15.5V14l2.93-3.07c.04.35.07.71.07 1.07a7.95 7.95 0 0 1-1.33 4.13z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-xl font-bold text-text tracking-tight group-hover:text-primary transition-colors">Live</span>
              <span className="text-lg sm:text-xl font-bold text-primary tracking-tight">Score</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {navKeys.map((n) => renderNavItem(n))}

            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-surface-light transition-colors text-text-secondary"
              title={locale === "en" ? "עברית" : "English"}
            >
              {locale === "en" ? "עב" : "EN"}
            </button>

            {user && (
              <Link
                href="/notifications"
                className={`relative ml-1 p-2 rounded-lg transition-colors ${
                  pathname === "/notifications"
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-surface-light hover:text-text"
                }`}
                title={t("nav.myNotifications")}
              >
                <svg className="w-5 h-5" fill={notifCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-primary rounded-full ring-2 ring-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            )}

            {!authLoading && (
              user ? (
                <div className="relative ml-1" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-light transition-colors"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover border-2 border-border" unoptimized />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-primary/20">
                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-text truncate">{user.user_metadata?.full_name || t("nav.user")}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { signOut(); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        {t("nav.signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-light hover:text-text transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    <span>{t("nav.signIn")}</span>
                  </Link>
                  <Link href="/auth/signin?mode=signup" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    <span>{t("nav.signUp")}</span>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleLang}
              className="px-2 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-surface-light transition-colors text-text-secondary"
            >
              {locale === "en" ? "עב" : "EN"}
            </button>

            {user && (
              <Link
                href="/notifications"
                className={`relative p-2 rounded-lg transition-colors ${
                  pathname === "/notifications" ? "bg-primary text-white" : "text-text-secondary"
                }`}
              >
                <svg className="w-5 h-5" fill={notifCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center px-0.5 text-[9px] font-bold text-white bg-primary rounded-full ring-2 ring-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-light transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navKeys.map((n) => renderNavItem(n, true))}
          </div>

          <div className="border-t border-border px-4 py-3">
            {!authLoading && (
              user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2 py-2">
                    {user.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover border-2 border-border" unoptimized />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{user.user_metadata?.full_name || t("nav.user")}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    {t("nav.signOut")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-text hover:bg-surface-light transition-colors"
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href="/auth/signin?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    {t("nav.signUp")}
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
