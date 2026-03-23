"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const langRefMobile = useRef<HTMLDivElement>(null);
  const notifCount = reminders.size + goalAlerts.size;

  const [socialLinks, setSocialLinks] = useState({ telegram: "", whatsapp: "", instagram: "", facebook: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/content/section?key=telegram").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=whatsapp").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=instagram").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=facebook").then((r) => r.json()).catch(() => null),
    ]).then(([tg, wa, ig, fb]) => {
      const validUrl = (v: string | undefined, fallback: string) =>
        v && v.startsWith("http") ? v : fallback;
      setSocialLinks({
        telegram: validUrl(tg?.view_all_link, "https://t.me/"),
        whatsapp: validUrl(wa?.view_all_link, "https://wa.me/"),
        instagram: validUrl(ig?.view_all_link, "https://instagram.com/"),
        facebook: validUrl(fb?.view_all_link, "https://facebook.com/"),
      });
    });
  }, []);

  const langOptions = [
    { code: "en" as const, label: "EN", fullName: "English", flag: "🇬🇧" },
    { code: "he" as const, label: "עב", fullName: "עברית", flag: "🇮🇱" },
    { code: "ar" as const, label: "عر", fullName: "العربية", flag: "🇸🇦" },
    { code: "ru" as const, label: "РУ", fullName: "Русский", flag: "🇷🇺" },
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
      const target = e.target as Node;
      const inDesktopLang = langRef.current?.contains(target);
      const inMobileLang = langRefMobile.current?.contains(target);
      if (!inDesktopLang && !inMobileLang) setShowLangMenu(false);
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

  const currentLang = langOptions.find((l) => l.code === locale) || langOptions[0];

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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <Image src="/logo.png" alt="חמ״ל" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" priority />
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold text-primary tracking-tight">חמ״ל</span>
              <span className="text-lg sm:text-xl font-bold text-text tracking-tight group-hover:text-primary transition-colors">ספורט</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {navKeys.map((n) => renderNavItem(n))}

            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-surface-light transition-colors text-text-secondary"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <svg className={`w-3 h-3 transition-transform ${showLangMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-card rounded-xl border border-border shadow-xl py-1 z-50">
                  {langOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                        locale === lang.code
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-surface-light hover:text-text"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="font-semibold">{lang.label}</span>
                      <span className="text-text-muted">{lang.fullName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-light hover:text-text transition-all"
              title={theme === "light" ? "Dark mode" : "Light mode"}
            >
              {theme === "light" ? (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
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
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-primary rounded-full ring-2 ring-background">
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background rounded-xl border border-border shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-text truncate">{user.user_metadata?.full_name || t("nav.user")}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { signOut(); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-2"
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
            <div className="relative" ref={langRefMobile}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-surface-light transition-colors text-text-secondary"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-card rounded-xl border border-border shadow-xl py-1 z-50">
                  {langOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                        locale === lang.code
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-surface-light hover:text-text"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="font-semibold">{lang.label}</span>
                      <span className="text-text-muted">{lang.fullName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-light transition-all"
              aria-label={theme === "light" ? "Dark mode" : "Light mode"}
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
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
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center px-0.5 text-[9px] font-bold text-white bg-primary rounded-full ring-2 ring-background">
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
        <div className="md:hidden border-t border-border bg-background shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navKeys.map((n) => renderNavItem(n, true))}
          </div>

          {(socialLinks.telegram || socialLinks.whatsapp || socialLinks.instagram || socialLinks.facebook) && (
            <div className="border-t border-border px-4 py-3 space-y-2">
              {socialLinks.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-[#0088cc] text-white hover:bg-[#006fa1] transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-sm font-semibold">Telegram</span>
                </a>
              )}
              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1da851] transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-sm font-semibold">WhatsApp</span>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white hover:opacity-90 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  <span className="text-sm font-semibold">Instagram</span>
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-semibold">Facebook</span>
                </a>
              )}
            </div>
          )}

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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
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
