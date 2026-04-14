"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string;
  image_url: string | null;
  link: string | null;
  published_at: string;
}

export default function ArticleDetailPage() {
  const { t, locale } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/content/articles/${id}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data && !data.error) setArticle(data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 bg-surface-light rounded" />
          <div className="h-8 w-3/4 bg-surface-light rounded" />
          <div className="h-4 w-1/3 bg-surface-light rounded" />
          <div className="h-72 bg-surface-light rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-surface-light rounded" />
            <div className="h-4 w-5/6 bg-surface-light rounded" />
            <div className="h-4 w-2/3 bg-surface-light rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">{t("articleDetail.notFound")}</h1>
        <p className="text-text-muted mb-6">{t("articleDetail.notFoundDesc")}</p>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t("articleDetail.backToArticles")}
        </Link>
      </div>
    );
  }

  const publishedDate = new Date(article.published_at).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasRichContent = article.content && article.content !== "<p></p>" && article.content.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t("articleDetail.backToArticles")}
      </Link>

      <article className="space-y-6">
        {article.image_url && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-surface-light shadow-lg">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
              unoptimized
            />
          </div>
        )}

        <div>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
            {t("articles.categoryLabel")}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-text leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-text-muted">
          <time dateTime={article.published_at}>{publishedDate}</time>
        </div>

        {article.summary && !hasRichContent && (
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-base text-text leading-relaxed whitespace-pre-line">
              {article.summary}
            </p>
          </div>
        )}

        {hasRichContent && (
          <div
            className="article-content bg-card rounded-xl border border-border p-6 md:p-8"
            dangerouslySetInnerHTML={{ __html: article.content! }}
          />
        )}

        {article.link && (
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t("articleDetail.readFull")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </article>
    </div>
  );
}
