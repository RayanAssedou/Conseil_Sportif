"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";
import { useProPlusModal } from "@/contexts/ProPlusModalContext";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { openProPlus } = useProPlusModal();
  const [socialLinks, setSocialLinks] = useState({ telegram: "", whatsapp: "", instagram: "", facebook: "", tiktok: "", twitter: "", youtube: "", vip: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/content/section?key=telegram").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=whatsapp").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=instagram").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=facebook").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=tiktok").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=twitter").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=youtube").then((r) => r.json()).catch(() => null),
      fetch("/api/content/section?key=whatsapp_vip").then((r) => r.json()).catch(() => null),
    ]).then(([tg, wa, ig, fb, tt, tw, yt, vip]) => {
      setSocialLinks({
        telegram: tg?.view_all_link || "https://t.me/Niv_grafica",
        whatsapp: wa?.view_all_link || "https://wa.me/972504593270",
        instagram: ig?.view_all_link || "https://www.instagram.com/nivphotografi?igsh=MTVuMG90bG1kZGkzcw==",
        facebook: fb?.view_all_link || "https://www.facebook.com/share/g/1FjxBVg48G/",
        tiktok: tt?.view_all_link || "https://www.tiktok.com/@niv_winner_tips?_r=1&_t=ZS-958O1XrBfQC",
        twitter: tw?.view_all_link || "https://x.com/nivphotograf",
        youtube: yt?.view_all_link || "https://youtube.com/channel/UCSiVU6MH4GCS9-68ClAsyEQ?si=e7blRdgdbT1CT8mD",
        vip: vip?.view_all_link || wa?.view_all_link || "https://wa.me/972504593270",
      });
    });
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/")) return null;

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/scores", label: t("footer.liveScores") },
    { href: "/pronostics", label: t("footer.predictions") },
    { href: "/articles", label: t("footer.articles") },
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
              <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                <Image src="/logo.png" alt="חמ״ל" width={40} height={40} className="w-10 h-10 object-contain" />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">חמ״ל</span>
                  <span className="text-lg font-bold text-text group-hover:text-primary transition-colors">ספורט</span>
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
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#010101]/10 hover:bg-[#010101] text-[#010101] dark:text-white hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#000000]/10 hover:bg-[#000000] text-[#000000] dark:text-white hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="X"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <button
                  onClick={() => openProPlus(socialLinks.vip)}
                  className="w-9 h-9 rounded-lg bg-violet-500/10 hover:bg-gradient-to-br hover:from-violet-500 hover:to-blue-600 text-violet-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-[0_0_8px_rgba(139,92,246,0.4)] hover:shadow-[0_0_14px_rgba(139,92,246,0.6)]"
                  aria-label="Pro+"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
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
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#1877F2]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#1877F2]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#1877F2] transition-colors">{t("footer.facebook")}</span>
                </a>
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#010101]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#010101]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#010101] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#010101] dark:group-hover:text-white transition-colors">{t("footer.tiktok")}</span>
                </a>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#000]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#000]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#000] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#000] dark:group-hover:text-white transition-colors">{t("footer.twitter")}</span>
                </a>
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-light hover:bg-[#FF0000]/10 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#FF0000]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-[#FF0000] transition-colors">{t("footer.youtube")}</span>
                </a>
                {socialLinks.vip && (
                  <button
                    onClick={() => openProPlus(socialLinks.vip)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-blue-500/5 border border-violet-500/30 hover:border-violet-400/50 transition-all group shadow-[0_0_10px_rgba(139,92,246,0.15)] hover:shadow-[0_0_16px_rgba(139,92,246,0.3)] w-full"
                  >
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent group-hover:from-violet-400 group-hover:to-blue-400 transition-colors">{t("vip.title")}</span>
                    <span className="ml-auto px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-violet-500 to-blue-600 text-white rounded uppercase tracking-wider shadow-[0_0_8px_rgba(139,92,246,0.5)]">PRO+</span>
                  </button>
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
          </div>
        </div>
      </div>
    </footer>
  );
}

