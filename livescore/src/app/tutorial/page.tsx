"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

const YOUTUBE_ID = "5SmOIurMjho";

export default function TutorialPage() {
  const { t, locale } = useTranslation();
  const isRtl = locale === "he" || locale === "ar";

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

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">{t("nav.tutorial")}</h1>
        <p className="text-text-muted text-sm">{t("tutorial.subtitle")}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}`}
            title={t("nav.tutorial")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
