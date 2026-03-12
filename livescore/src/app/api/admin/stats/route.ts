import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [usersRes, articlesRes, predictionsRes, visitsRes, visitsTodayRes, visitsWeekRes] = await Promise.all([
    supabase.from("user_profiles").select("id, created_at"),
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("predictions").select("id", { count: "exact", head: true }),
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", todayStart),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", weekAgo),
  ]);

  const users = usersRes.data || [];
  const totalUsers = users.length;
  const newUsersToday = users.filter((u) => u.created_at && u.created_at >= todayStart).length;
  const newUsersWeek = users.filter((u) => u.created_at && u.created_at >= weekAgo).length;
  const newUsersMonth = users.filter((u) => u.created_at && u.created_at >= monthAgo).length;

  const totalVisits = visitsRes.count ?? 0;
  const visitsToday = visitsTodayRes.count ?? 0;
  const visitsWeek = visitsWeekRes.count ?? 0;

  let dailyVisits: { date: string; count: number }[] = [];
  try {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return d.toISOString().split("T")[0];
    }).reverse();

    const promises = last7.map(async (date) => {
      const dayStart = `${date}T00:00:00.000Z`;
      const dayEnd = `${date}T23:59:59.999Z`;
      const { count } = await supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("viewed_at", dayStart)
        .lte("viewed_at", dayEnd);
      return { date, count: count ?? 0 };
    });
    dailyVisits = await Promise.all(promises);
  } catch {
    dailyVisits = [];
  }

  return NextResponse.json({
    users: { total: totalUsers, today: newUsersToday, week: newUsersWeek, month: newUsersMonth },
    articles: articlesRes.count ?? 0,
    predictions: predictionsRes.count ?? 0,
    traffic: { total: totalVisits, today: visitsToday, week: visitsWeek, dailyVisits },
  });
}
