import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/all/news?limit=30",
      { next: { revalidate: 300 } }
    );

    if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);

    const data = await res.json();

    const articles = data.articles?.map((article: Record<string, unknown>) => ({
      id: article.dataSourceIdentifier || String(Math.random()),
      headline: article.headline,
      description: article.description,
      published: article.published,
      image: (article.images as Array<{ url: string }>)?.[0]?.url || null,
      link: (article.links as { web?: { href?: string } })?.web?.href || null,
      category: ((article.categories as Array<{ description?: string }>)?.[0]?.description) || "Football",
    })) || [];

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ articles: [] });
  }
}
