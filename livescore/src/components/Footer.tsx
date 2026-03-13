"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [socialLinks, setSocialLinks] = useState({ telegram: "", whatsapp: "", instagram: "", vip: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/content/section?key=telegram").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=whatsapp").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=instagram").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=whatsapp_vip").then((r) => r.json()).catch(() => null),
    ]).then(([tg, wa, ig, vip]) => {
      setSocialLinks({
        telegram: tg?.view_all_link || "https://t.me/",
        whatsapp: wa?.view_all_link || "https://wa.me/",
        instagram: ig?.view_all_link || "https://instagram.com/",
        vip: vip?.view_all_link || "",
      });
    });
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/")) return null;

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/scores", label: t("footer.liveScores") },
    { href: "/pronostics", label: t("footer.predictions") },
    { href: "/articles", label: t("footer.articles") },
    { href: "/notifications", label: t("footer.notifications") },
  ];

  const featureLinks = [
    { label: t("footer.goalAlerts"), icon: goalAlertIcon },
    { label: t("footer.matchReminders"), icon: reminderIcon },
    { label: t("footer.statistics"), icon: statsIcon },
    { label: t("footer.lineups"), icon: lineupsIcon },
    { label: t("footer.watchLive"), icon: watchIcon },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="bg-surface border-t border-border">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.93 0 3.68.69 5.05 1.83L14.5 8.5l-2.5-1-2.5 1-2.55-2.67A7.956 7.956 0 0112 4zm-8 8c0-1.62.5-3.13 1.33-4.38L8 10.5v3l2.5 2.5-1 3.5A7.98 7.98 0 014 12zm8 8c-1.35 0-2.62-.35-3.73-.96L9.5 15.5 12 13l4 1v3.5l-1.32 1.98A7.89 7.89 0 0112 20zm5.67-2.87L16 15.5V14l2.93-3.07c.04.35.07.71.07 1.07a7.95 7.95 0 01-1.33 4.13z" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-text group-hover:text-primary transition-colors">ספורט</span>
                  <span className="text-lg font-bold text-primary">חמייל</span>
                </div>
              </Link>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                {t("footer.tagline")}
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2 mt-5">
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Telegram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#E4405F]/10 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] text-[#E4405F] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation column */}
            <div>
              <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                {t("footer.navigation")}
              </h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <svg className="w-3 h-3 text-text-muted/50 group-hover:text-primary transition-colors rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features column */}
            <div>
              <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                {t("footer.features")}
              </h3>
              <ul className="space-y-2.5">
                {featureLinks.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="w-5 h-5 rounded-md bg-surface-light flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Community column */}
            <div>
              <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                {t("footer.community")}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                {t("footer.joinCommunity")}
              </p>
              <div className="space-y-2">
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#0088cc]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#0088cc]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#0088cc] transition-colors">{t("footer.telegram")}</span>
                </a>
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#25D366]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#25D366]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#25D366] transition-colors">{t("footer.whatsapp")}</span>
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#E4405F]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#E4405F]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#E4405F] transition-colors">{t("footer.instagram")}</span>
                </a>
                {socialLinks.vip && (
                  <a
                    href={socialLinks.vip}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-400/20 hover:border-amber-400/40 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">{t("vip.title")}</span>
                    <span className="ml-auto px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded uppercase tracking-wider">VIP</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              © {year} {t("footer.brand")}. {t("footer.rights")}
            </p>
            <p className="text-xs text-text-muted flex items-center gap-1">
              {t("footer.madeWith")}
              <svg className="w-3.5 h-3.5 text-primary animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              {t("footer.forFans")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

const goalAlertIcon = (
  <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" />
  </svg>
);

const reminderIcon = (
  <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const statsIcon = (
  <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const lineupsIcon = (
  <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const watchIcon = (
  <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
