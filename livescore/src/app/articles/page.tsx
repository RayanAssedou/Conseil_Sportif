"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  image_url: string | null;
  link: string | null;
  published_at: string;
  is_featured?: boolean;
}

export default function ArticlesPage() {
  const { t, locale } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content/articles")
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = articles.find((a) => a.is_featured);
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{t("articles.title")}</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {t("articles.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
            <div className="h-64 bg-surface-light" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="h-40 bg-surface-light" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 bg-surface-light rounded" />
                  <div className="h-4 w-full bg-surface-light rounded" />
                  <div className="h-3 w-2/3 bg-surface-light rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">{t("articles.noArticles")}</h3>
          <p className="text-sm text-text-muted max-w-xs">
            {t("articles.checkBackLater")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Article of the Day - full width banner */}
          {featured && (
            <Link
              href={`/articles/${featured.id}`}
              className="block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-64 md:h-80 bg-surface-light overflow-hidden">
                {featured.image_url ? (
                  <Image
                    src={featured.image_url}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 100vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    {t("articles.articleOfDay")}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-2.5 py-1 bg-primary text-white text-xs font-bold rounded mb-3 uppercase tracking-wider">
                    {featured.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {featured.title}
                  </h2>
                  {featured.summary && (
                    <p className="text-white/80 text-sm mt-2 line-clamp-2">{featured.summary}</p>
                  )}
                  <span className="text-white/50 text-xs mt-3 block">
                    {new Date(featured.published_at).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Articles grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
                >
                  {article.image_url ? (
                    <div className="relative h-40 bg-surface-light overflow-hidden flex-shrink-0">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-surface flex items-center justify-center flex-shrink-0">
                      <svg className="w-10 h-10 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{article.category}</span>
                    <h3 className="text-sm font-bold text-text mt-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-xs text-text-muted mt-1.5 line-clamp-2 flex-1">{article.summary}</p>
                    )}
                    <span className="text-xs text-text-muted mt-3 block">
                      {new Date(article.published_at).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
