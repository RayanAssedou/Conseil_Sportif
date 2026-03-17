"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fixture } from "@/lib/types";
import { isLive, getStatusDisplay, getDateOffset, sortFixturesByLeaguePriority } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";
import SpiralMenu from "@/components/SpiralMenu";

interface HeroConfig {
  title?: string;
  subtitle?: string;
  background_type?: string;
  background_value?: string;
  button1_text?: string;
  button1_link?: string;
  button1_bg_color?: string;
  button1_text_color?: string;
  button2_text?: string;
  button2_link?: string;
  button2_bg_color?: string;
  button2_text_color?: string;
  button2_border_color?: string;
  title_he?: string;
  subtitle_he?: string;
  button1_text_he?: string;
  button2_text_he?: string;
}

interface SectionConfig {
  title?: string;
  view_all_text?: string;
  view_all_link?: string;
}

interface Article {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  image_url: string | null;
  link: string | null;
  published_at: string;
}

interface AdminPrediction {
  id: string;
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  league_name: string | null;
  match_date: string | null;
  predicted_home: string;
  predicted_away: string;
  advice: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const { addReminder, removeReminder, hasReminder, toggleGoalAlert, hasGoalAlert } = useNotifications();
  const { t, locale } = useTranslation();
  const [hero, setHero] = useState<HeroConfig>({});
  const [section, setSection] = useState<SectionConfig>({});
  const [telegramLink, setTelegramLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [vipLink, setVipLink] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [allowedLeagues, setAllowedLeagues] = useState<Set<number> | null>(null);
  const [adminPredictions, setAdminPredictions] = useState<AdminPrediction[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  useEffect(() => {
    fetch("/api/content/hero")
      .then((r) => r.json())
      .then(setHero)
      .catch(console.error)
      .finally(() => setLoadingHero(false));

    fetch("/api/content/section?key=latest_news")
      .then((r) => r.json())
      .then(setSection)
      .catch(console.error);

    fetch("/api/content/section?key=telegram")
      .then((r) => r.json())
      .then((data) => setTelegramLink(data?.view_all_link || ""))
      .catch(console.error);

    fetch("/api/content/section?key=whatsapp")
      .then((r) => r.json())
      .then((data) => setWhatsappLink(data?.view_all_link || ""))
      .catch(console.error);

    fetch("/api/content/section?key=instagram")
      .then((r) => r.json())
      .then((data) => setInstagramLink(data?.view_all_link || ""))
      .catch(console.error);

    fetch("/api/content/section?key=whatsapp_vip")
      .then((r) => r.json())
      .then((data) => setVipLink(data?.view_all_link || ""))
      .catch(console.error);

    fetch("/api/content/articles?latest=true&limit=3")
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoadingArticles(false));

    fetch("/api/content/leagues")
      .then((r) => r.json())
      .then((d) => {
        const ids: number[] = d.league_ids || [];
        setAllowedLeagues(ids.length > 0 ? new Set(ids) : null);
      })
      .catch(() => setAllowedLeagues(null));

    const today = getDateOffset(0);
    fetch(`/api/fixtures?date=${today}`)
      .then((r) => r.json())
      .then((data) => setFixtures(data.response || []))
      .catch(console.error)
      .finally(() => setLoadingFixtures(false));

    fetch("/api/content/predictions")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAdminPredictions(data); })
      .catch(console.error)
      .finally(() => setLoadingPredictions(false));
  }, []);

  const filtered = allowedLeagues
    ? fixtures.filter((f) => allowedLeagues.has(f.league.id))
    : fixtures;

  const liveMatches = sortFixturesByLeaguePriority(filtered.filter((f) => isLive(f.fixture.status.short)));
  const upcomingByPriority = sortFixturesByLeaguePriority(filtered.filter((f) => !isLive(f.fixture.status.short)));
  const previewMatches = [...liveMatches, ...upcomingByPriority].slice(0, 10);
  const predictionPreview = adminPredictions.slice(0, 10);

  const heroStyle = hero.background_type === "image" && hero.background_value
    ? { backgroundImage: `url(${hero.background_value})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: hero.background_value || "#dc2626" };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <div className="rounded-2xl p-6 md:p-8 text-white" style={heroStyle}>
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          {locale === "en" ? (hero.title || t("home.heroTitle")) : (hero.title_he || t("home.heroTitle"))}
        </h1>
        <p className="text-white/80 text-sm md:text-base max-w-lg">
          {locale === "en" ? (hero.subtitle || t("home.heroSubtitle")) : (hero.subtitle_he || t("home.heroSubtitle"))}
        </p>
        <div className="flex gap-3 mt-5">
          <Link
            href={hero.button1_link || "/scores"}
            className="px-5 py-2.5 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            style={{ backgroundColor: hero.button1_bg_color || "#ffffff", color: hero.button1_text_color || "#dc2626" }}
          >
            {locale === "en" ? (hero.button1_text || t("home.liveScoresBtn")) : (hero.button1_text_he || t("home.liveScoresBtn"))}
          </Link>
          <Link
            href={hero.button2_link || "/pronostics"}
            className="px-5 py-2.5 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity border"
            style={{ backgroundColor: hero.button2_bg_color || "rgba(255,255,255,0.15)", color: hero.button2_text_color || "#ffffff", borderColor: hero.button2_border_color || "rgba(255,255,255,0.2)" }}
          >
            {locale === "en" ? (hero.button2_text || t("home.predictionsBtn")) : (hero.button2_text_he || t("home.predictionsBtn"))}
          </Link>
        </div>
      </div>

      {/* Mobile Hexagonal Nav */}
      <SpiralMenu />

      {/* Live Scores Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text">{t("home.liveScores")}</h2>
            {liveMatches.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-bold text-primary">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-live" />
                {liveMatches.length} {t("home.live")}
              </span>
            )}
          </div>
          <Link href="/scores" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            {t("home.viewAll")} &rarr;
          </Link>
        </div>

        {loadingFixtures ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-surface-light" />
                  <div className="h-3 w-16 bg-surface-light rounded" />
                </div>
                <div className="h-5 w-12 bg-surface-light rounded mx-auto mb-2" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-light" />
                  <div className="h-3 w-16 bg-surface-light rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : previewMatches.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {previewMatches.map((fixture) => {
              const live = isLive(fixture.fixture.status.short);
              const statusText = getStatusDisplay(fixture, locale);
              const isFollowed = hasReminder(fixture.fixture.id) || hasGoalAlert(fixture.fixture.id);
              return (
                <Link
                  key={fixture.fixture.id}
                  href={`/match/${fixture.fixture.id}`}
                  className={`relative bg-card rounded-xl border overflow-hidden p-3 transition-all duration-200 group hover:scale-[1.03] hover:shadow-lg hover:border-border ${
                    live ? "border-primary/30" : "border-border"
                  }`}
                >
                  {live && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image src={fixture.teams.home.logo} alt="" fill className="object-contain" sizes="24px" unoptimized />
                      </div>
                      <span className="text-xs font-medium text-text truncate">{fixture.teams.home.name}</span>
                    </div>
                    <span className={`text-base font-black min-w-[20px] text-center ${live ? "text-primary" : "text-text"}`}>
                      {fixture.goals.home ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image src={fixture.teams.away.logo} alt="" fill className="object-contain" sizes="24px" unoptimized />
                      </div>
                      <span className="text-xs font-medium text-text truncate">{fixture.teams.away.name}</span>
                    </div>
                    <span className={`text-base font-black min-w-[20px] text-center ${live ? "text-primary" : "text-text"}`}>
                      {fixture.goals.away ?? "-"}
                    </span>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center justify-between">
                    {live ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-live" />
                        {statusText}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-text-muted">{statusText}</span>
                    )}
                    {user && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (live) {
                            toggleGoalAlert(fixture);
                          } else {
                            isFollowed ? removeReminder(fixture.fixture.id) : addReminder(fixture);
                          }
                        }}
                        className={`p-0.5 rounded transition-all ${
                          isFollowed
                            ? "text-amber-500"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                        title={isFollowed ? t("home.following") : t("home.followMatch")}
                      >
                        <svg className="w-3.5 h-3.5" fill={isFollowed ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-text-muted text-sm">{t("home.noLiveMatches")}</p>
          </div>
        )}
      </section>

      {/* Social Links - Mobile Infinite Carousel */}
      <section className="md:hidden -mx-4 overflow-hidden" dir="ltr">
        <style>{`
          @keyframes socialLoop {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .social-infinite { animation: socialLoop 24s linear infinite; }
          .social-infinite:hover, .social-infinite:active { animation-play-state: paused; }
        `}</style>
        <div className="social-infinite flex gap-3 px-4 pb-2 w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-3 flex-shrink-0" aria-hidden={dup === 1 ? "true" : undefined}>
              <a href={telegramLink || "https://t.me/"} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-gradient-to-br from-[#0088cc] to-[#0077b5] rounded-xl p-3.5 text-white" style={{ width: "80vw" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">{t("home.telegramTitle")}</h3>
                    <p className="text-white/70 text-[11px] leading-tight">{t("home.telegramDesc")}</p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/20 rounded-lg text-[11px] font-semibold">
                    {t("home.joinTelegram")}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  </span>
                </div>
              </a>
              <a href={whatsappLink || "https://wa.me/"} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl p-3.5 text-white" style={{ width: "80vw" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">{t("home.whatsappTitle")}</h3>
                    <p className="text-white/70 text-[11px] leading-tight">{t("home.whatsappDesc")}</p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/20 rounded-lg text-[11px] font-semibold">
                    {t("home.contactWhatsapp")}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  </span>
                </div>
              </a>
              <a href={instagramLink || "https://instagram.com/"} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-xl p-3.5 text-white" style={{ width: "80vw" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">{t("home.instagramTitle")}</h3>
                    <p className="text-white/70 text-[11px] leading-tight">{t("home.instagramDesc")}</p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/20 rounded-lg text-[11px] font-semibold">
                    {t("home.followInstagram")}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  </span>
                </div>
              </a>
              <a href={vipLink || whatsappLink || "https://wa.me/"} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-3.5 text-white" style={{ width: "80vw" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">{t("vip.carouselTitle")}</h3>
                    <p className="text-white/70 text-[11px] leading-tight">{t("vip.carouselDesc")}</p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/20 rounded-lg text-[11px] font-semibold">
                    {t("vip.joinNow")}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Predictions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-text">{t("home.todayPredictions")}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
              <svg className="w-3 h-3 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-[10px] font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">{t("ai.badge")}</span>
            </span>
            {adminPredictions.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded text-xs font-bold text-amber-600 dark:text-amber-400">
                {adminPredictions.length} {adminPredictions.length === 1 ? t("common.match") : t("common.matches")}
              </span>
            )}
          </div>
          <Link href="/pronostics" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            {t("home.viewAll")} &rarr;
          </Link>
        </div>

        {!user ? (
          <div className="bg-gradient-to-br from-surface to-card rounded-2xl border border-border p-10 md:p-14 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text mb-2">{t("predictions.locked")}</h3>
            <p className="text-sm text-text-muted max-w-md mb-6 leading-relaxed">
              {t("predictions.lockedDesc")}
            </p>
            <div className="flex gap-3">
              <Link href="/auth/signin" className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors shadow-md">
                {t("predictions.signIn")}
              </Link>
              <Link href="/auth/signin?mode=signup" className="px-6 py-2.5 bg-card text-primary font-semibold text-sm rounded-lg border-2 border-primary hover:bg-primary/5 transition-colors">
                {t("predictions.signUp")}
              </Link>
            </div>
          </div>
        ) : loadingPredictions ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-surface-light" />
                  <div className="h-3 w-16 bg-surface-light rounded" />
                </div>
                <div className="h-5 w-12 bg-surface-light rounded mx-auto mb-2" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-light" />
                  <div className="h-3 w-16 bg-surface-light rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : predictionPreview.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {predictionPreview.map((pred) => {
              const timeStr = pred.match_date
                ? new Date(pred.match_date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false })
                : "";
              const isFollowed = hasReminder(pred.fixture_id);
              return (
                <Link
                  key={pred.fixture_id}
                  href={`/pronostics/${pred.fixture_id}`}
                  className="relative bg-card rounded-xl border border-border overflow-hidden p-3 transition-all duration-200 group hover:scale-[1.03] hover:shadow-lg hover:border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {pred.home_logo && (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image src={pred.home_logo} alt="" fill className="object-contain" sizes="24px" unoptimized />
                        </div>
                      )}
                      <span className="text-xs font-medium text-text truncate">{pred.home_team}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center my-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {pred.predicted_home} - {pred.predicted_away}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {pred.away_logo && (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image src={pred.away_logo} alt="" fill className="object-contain" sizes="24px" unoptimized />
                        </div>
                      )}
                      <span className="text-xs font-medium text-text truncate">{pred.away_team}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted truncate">
                      {pred.league_name || ""}{timeStr ? ` · ${timeStr}` : ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isFollowed) {
                            removeReminder(pred.fixture_id);
                          } else {
                            addReminder({
                              fixture: { id: pred.fixture_id, referee: null, timezone: "UTC", date: pred.match_date || "", timestamp: 0, periods: { first: null, second: null }, venue: { id: null, name: null, city: null }, status: { short: "NS", long: "Not Started", elapsed: null, extra: null } },
                              teams: { home: { id: 0, name: pred.home_team, logo: pred.home_logo || "", winner: null }, away: { id: 0, name: pred.away_team, logo: pred.away_logo || "", winner: null } },
                              goals: { home: null, away: null },
                              league: { id: 0, name: pred.league_name || "", country: "", logo: "", flag: "", season: 0, round: "" },
                              score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null }, extratime: { home: null, away: null }, penalty: { home: null, away: null } },
                            });
                          }
                        }}
                        className={`p-0.5 rounded transition-all ${
                          isFollowed
                            ? "text-amber-500"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                        title={isFollowed ? t("home.following") : t("home.remindKickoff")}
                      >
                        <svg className="w-3.5 h-3.5" fill={isFollowed ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                      </button>
                      <span className="text-[10px] font-medium text-primary flex items-center gap-0.5">
                        {t("home.prediction")}
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-text-muted text-sm">{t("home.noPredictions")}</p>
          </div>
        )}
        {user && adminPredictions.length > 10 && (
          <div className="mt-3 text-center">
            <Link href="/pronostics" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              {t("home.viewAllPredictions", { count: adminPredictions.length })}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* Latest News */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">{locale === "en" ? (section.title || t("home.latestNews")) : t("home.latestNews")}</h2>
          <Link href={section.view_all_link || "/articles"} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            {locale === "en" ? (section.view_all_text || t("home.viewAll")) : t("home.viewAll")} &rarr;
          </Link>
        </div>

        {loadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="h-40 bg-surface-light" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-surface-light rounded" />
                  <div className="h-3 w-full bg-surface-light rounded" />
                  <div className="h-3 w-2/3 bg-surface-light rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {article.image_url ? (
                  <div className="relative h-40 bg-surface-light overflow-hidden">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-surface flex items-center justify-center">
                    <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{article.category}</span>
                  <h3 className="text-sm font-bold text-text mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{article.summary || ""}</p>
                  <span className="text-xs text-text-muted mt-2 block">
                    {new Date(article.published_at).toLocaleDateString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">{t("home.noNews")}</p>
        )}
      </section>

      <div className="h-8" />

      {/* Social Links - Desktop Grid */}
      <section className="hidden md:grid gap-4 grid-cols-2 lg:grid-cols-4">
        <a
          href={telegramLink || "https://t.me/"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-[#0088cc] to-[#0077b5] rounded-2xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("home.telegramTitle")}</h3>
              <p className="text-white/70 text-xs">{t("home.telegramDesc")}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold group-hover:bg-white/30 transition-colors">
            {t("home.joinTelegram")}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>

        <a
          href={whatsappLink || "https://wa.me/"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("home.whatsappTitle")}</h3>
              <p className="text-white/70 text-xs">{t("home.whatsappDesc")}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold group-hover:bg-white/30 transition-colors">
            {t("home.contactWhatsapp")}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>

        <a
          href={instagramLink || "https://instagram.com/"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-2xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("home.instagramTitle")}</h3>
              <p className="text-white/70 text-xs">{t("home.instagramDesc")}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold group-hover:bg-white/30 transition-colors">
            {t("home.followInstagram")}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>

        <a
          href={vipLink || whatsappLink || "https://wa.me/"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("vip.carouselTitle")}</h3>
              <p className="text-white/70 text-xs">{t("vip.carouselDesc")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[t("vip.benefit1"), t("vip.benefit2"), t("vip.benefit3")].map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white/15 rounded-md text-[11px] font-medium">
                <svg className="w-3 h-3 text-white/80 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {b}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold group-hover:bg-white/30 transition-colors">
            {t("vip.joinNow")}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>
      </section>
    </div>
  );
}
