"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

const sectionStyles = [
  { color: "from-red-500 to-red-600", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
  { color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  { color: "from-amber-500 to-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  { color: "from-violet-500 to-violet-600", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/20" },
];

const sectionIcons = [
  <svg key="age" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>,
  <svg key="service" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>,
  <svg key="disclaimer" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>,
  <svg key="copyright" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>,
];

const sectionKeys = [
  { title: "terms.ageTitle", body: "terms.ageBody" },
  { title: "terms.serviceTitle", body: "terms.serviceBody" },
  { title: "terms.disclaimerTitle", body: "terms.disclaimerBody" },
  { title: "terms.copyrightTitle", body: "terms.copyrightBody" },
];

export default function TermsPage() {
  const { t, locale } = useTranslation();
  const isRtl = locale === "he" || locale === "ar";
  const year = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10" dir={isRtl ? "rtl" : "ltr"}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-8"
      >
        <svg className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {t("terms.backHome")}
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">{t("terms.title")}</h1>
        <p className="text-text-muted text-sm">{t("terms.subtitle")}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 md:p-6 mb-8">
        <p className="text-text-secondary text-sm leading-relaxed">
          {t("terms.intro")}
        </p>
      </div>

      <div className="space-y-4">
        {sectionKeys.map((section, i) => (
          <div
            key={i}
            className={`bg-card rounded-2xl border ${sectionStyles[i].borderColor} overflow-hidden`}
          >
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${sectionStyles[i].bgColor} flex items-center justify-center`}>
                  <span className={`bg-gradient-to-br ${sectionStyles[i].color} bg-clip-text text-transparent`}>
                    {sectionIcons[i]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-text mb-2">{t(section.title)}</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">{t(section.body)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs text-text-muted">
          {t("terms.footer", { year: String(year) })}
        </p>
      </div>
    </div>
  );
}
