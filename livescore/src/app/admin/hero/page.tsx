"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

const API = (path: string) => `/api${path}`;
const fetchOpts = { credentials: "include" as RequestCredentials };

export default function HeroSettingsPage() {
  const [hero, setHero] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(API("/admin/hero"), fetchOpts)
      .then((r) => r.json())
      .then((data) => setHero(data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch(API("/admin/hero"), {
      method: "PUT",
      ...fetchOpts,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hero),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(await res.text());
    }
    setSaving(false);
  };

  const update = (key: string, val: string) => setHero((h) => ({ ...h, [key]: val }));

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Hero Banner</h1>
        <p className="text-sm text-slate-500 mt-1">Customize the homepage hero section</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Content</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              value={hero.title || ""}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Football Hub"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtitle</label>
            <textarea
              value={hero.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Hebrew Content</h2>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">עברית</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title (Hebrew)</label>
            <input
              value={hero.title_he || ""}
              onChange={(e) => update("title_he", e.target.value)}
              placeholder="מרכז הכדורגל"
              dir="rtl"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtitle (Hebrew)</label>
            <textarea
              value={hero.subtitle_he || ""}
              onChange={(e) => update("subtitle_he", e.target.value)}
              rows={2}
              dir="rtl"
              placeholder="היעד שלך לתוצאות חיות, תחזיות מומחים וחדשות כדורגל"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Button 1 Text (Hebrew)</label>
              <input
                value={hero.button1_text_he || ""}
                onChange={(e) => update("button1_text_he", e.target.value)}
                placeholder="תוצאות חיות"
                dir="rtl"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Button 2 Text (Hebrew)</label>
              <input
                value={hero.button2_text_he || ""}
                onChange={(e) => update("button2_text_he", e.target.value)}
                placeholder="תחזיות"
                dir="rtl"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Background</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select
              value={hero.background_type || "color"}
              onChange={(e) => update("background_type", e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
            >
              <option value="color">Color</option>
              <option value="image">Image</option>
            </select>
          </div>

          {hero.background_type === "image" ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Background Image</label>
              <ImageUpload
                value={hero.background_value || ""}
                onChange={(url) => update("background_value", url)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Background Color</label>
              <div className="flex gap-2">
                <input
                  value={hero.background_value || "#dc2626"}
                  onChange={(e) => update("background_value", e.target.value)}
                  placeholder="#dc2626"
                  className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
                <input
                  type="color"
                  value={hero.background_value || "#dc2626"}
                  onChange={(e) => update("background_value", e.target.value)}
                  className="w-11 h-11 rounded-lg border border-slate-200 cursor-pointer p-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Button 1</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Text</label>
              <input value={hero.button1_text || ""} onChange={(e) => update("button1_text", e.target.value)} placeholder="Live Scores" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Link</label>
              <input value={hero.button1_link || ""} onChange={(e) => update("button1_link", e.target.value)} placeholder="/scores" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Background Color</label>
              <div className="flex gap-2">
                <input value={hero.button1_bg_color || ""} onChange={(e) => update("button1_bg_color", e.target.value)} placeholder="#ffffff" className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
                <input type="color" value={hero.button1_bg_color || "#ffffff"} onChange={(e) => update("button1_bg_color", e.target.value)} className="w-11 h-11 rounded-lg border border-slate-200 cursor-pointer p-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Text Color</label>
              <div className="flex gap-2">
                <input value={hero.button1_text_color || ""} onChange={(e) => update("button1_text_color", e.target.value)} placeholder="#dc2626" className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
                <input type="color" value={hero.button1_text_color || "#dc2626"} onChange={(e) => update("button1_text_color", e.target.value)} className="w-11 h-11 rounded-lg border border-slate-200 cursor-pointer p-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Button 2</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Text</label>
              <input value={hero.button2_text || ""} onChange={(e) => update("button2_text", e.target.value)} placeholder="Predictions" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Link</label>
              <input value={hero.button2_link || ""} onChange={(e) => update("button2_link", e.target.value)} placeholder="/pronostics" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Background Color</label>
              <div className="flex gap-2">
                <input value={hero.button2_bg_color || ""} onChange={(e) => update("button2_bg_color", e.target.value)} placeholder="rgba(255,255,255,0.15)" className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Text Color</label>
              <div className="flex gap-2">
                <input value={hero.button2_text_color || ""} onChange={(e) => update("button2_text_color", e.target.value)} placeholder="#ffffff" className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition" />
                <input type="color" value={hero.button2_text_color || "#ffffff"} onChange={(e) => update("button2_text_color", e.target.value)} className="w-11 h-11 rounded-lg border border-slate-200 cursor-pointer p-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
