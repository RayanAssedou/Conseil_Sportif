"use client";

import { useState, useEffect } from "react";

const API = (path: string) => `/api${path}`;
const fetchOpts = { credentials: "include" as RequestCredentials };

export default function SettingsPage() {
  const [section, setSection] = useState<Record<string, string>>({});
  const [telegram, setTelegram] = useState<Record<string, string>>({});
  const [whatsapp, setWhatsapp] = useState<Record<string, string>>({});
  const [instagram, setInstagram] = useState<Record<string, string>>({});
  const [facebook, setFacebook] = useState<Record<string, string>>({});
  const [whatsappVip, setWhatsappVip] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [savedTelegram, setSavedTelegram] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [savedWhatsapp, setSavedWhatsapp] = useState(false);
  const [savingInstagram, setSavingInstagram] = useState(false);
  const [savedInstagram, setSavedInstagram] = useState(false);
  const [savingFacebook, setSavingFacebook] = useState(false);
  const [savedFacebook, setSavedFacebook] = useState(false);
  const [savingWhatsappVip, setSavingWhatsappVip] = useState(false);
  const [savedWhatsappVip, setSavedWhatsappVip] = useState(false);
  const [fbPixel, setFbPixel] = useState<Record<string, string>>({});
  const [googleTag, setGoogleTag] = useState<Record<string, string>>({});
  const [savingFbPixel, setSavingFbPixel] = useState(false);
  const [savedFbPixel, setSavedFbPixel] = useState(false);
  const [savingGoogleTag, setSavingGoogleTag] = useState(false);
  const [savedGoogleTag, setSavedGoogleTag] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(API("/content/section?key=latest_news")).then((r) => r.json()),
      fetch(API("/content/section?key=telegram")).then((r) => r.json()),
      fetch(API("/content/section?key=whatsapp")).then((r) => r.json()),
      fetch(API("/content/section?key=instagram")).then((r) => r.json()),
      fetch(API("/content/section?key=facebook")).then((r) => r.json()),
      fetch(API("/content/section?key=facebook_pixel")).then((r) => r.json()),
      fetch(API("/content/section?key=google_tag")).then((r) => r.json()),
      fetch(API("/content/section?key=whatsapp_vip")).then((r) => r.json()),
    ])
      .then(([sData, tData, wData, iData, fbData, fpData, gtData, wvData]) => {
        setSection(sData || {});
        setTelegram(tData || {});
        setWhatsapp(wData || {});
        setInstagram(iData || {});
        setFacebook(fbData || {});
        setFbPixel(fpData || {});
        setGoogleTag(gtData || {});
        setWhatsappVip(wvData || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch(API("/admin/section"), {
      method: "PUT",
      ...fetchOpts,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...section, section_key: "latest_news" }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(await res.text());
    }
    setSaving(false);
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelegram(true);
    setSavedTelegram(false);
    const res = await fetch(API("/admin/section"), {
      method: "PUT",
      ...fetchOpts,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...telegram, section_key: "telegram" }),
    });
    if (res.ok) {
      setSavedTelegram(true);
      setTimeout(() => setSavedTelegram(false), 3000);
    } else {
      alert(await res.text());
    }
    setSavingTelegram(false);
  };

  const saveSocial = async (data: Record<string, string>, sectionKey: string, setIsSaving: (v: boolean) => void, setIsSaved: (v: boolean) => void) => {
    setIsSaving(true);
    setIsSaved(false);
    const res = await fetch(API("/admin/section"), {
      method: "PUT",
      ...fetchOpts,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, section_key: sectionKey }),
    });
    if (res.ok) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      alert(await res.text());
    }
    setIsSaving(false);
  };

  const update = (key: string, val: string) => setSection((s) => ({ ...s, [key]: val }));
  const updateTelegram = (key: string, val: string) => setTelegram((t) => ({ ...t, [key]: val }));
  const updateWhatsapp = (key: string, val: string) => setWhatsapp((w) => ({ ...w, [key]: val }));
  const updateInstagram = (key: string, val: string) => setInstagram((ig) => ({ ...ig, [key]: val }));
  const updateFacebook = (key: string, val: string) => setFacebook((fb) => ({ ...fb, [key]: val }));

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage site sections and database</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">Latest News Section</h2>
            <p className="text-sm text-slate-500 -mt-3">Configure how the latest news section appears on the homepage.</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Section Title</label>
              <input
                value={section.title || ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Latest News"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">View All Text</label>
                <input
                  value={section.view_all_text || ""}
                  onChange={(e) => update("view_all_text", e.target.value)}
                  placeholder="View all"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">View All Link</label>
                <input
                  value={section.view_all_link || ""}
                  onChange={(e) => update("view_all_link", e.target.value)}
                  placeholder="/articles"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Section"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        <form onSubmit={handleSaveTelegram}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0088cc]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Telegram Group</h2>
                <p className="text-sm text-slate-500">Set the Telegram invite link shown on the homepage</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telegram Link</label>
              <div className="flex gap-2">
              <div className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
                <input
                  type="url"
                  value={telegram.view_all_link || ""}
                  onChange={(e) => updateTelegram("view_all_link", e.target.value)}
                  placeholder="https://t.me/your-group"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Paste your Telegram group or channel invite link (e.g. https://t.me/yourchannel)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingTelegram}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0088cc] text-white text-sm font-semibold rounded-lg hover:bg-[#0077b5] transition-colors shadow-sm disabled:opacity-50"
              >
                {savingTelegram ? "Saving..." : "Save Telegram Link"}
              </button>
              {savedTelegram && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* WhatsApp */}
        <form onSubmit={(e) => { e.preventDefault(); saveSocial(whatsapp, "whatsapp", setSavingWhatsapp, setSavedWhatsapp); }}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">WhatsApp</h2>
                <p className="text-sm text-slate-500">Set the WhatsApp contact link shown on the homepage</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Link</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-[#25D366]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={whatsapp.view_all_link || ""}
                  onChange={(e) => updateWhatsapp("view_all_link", e.target.value)}
                  placeholder="https://wa.me/1234567890"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Paste your WhatsApp link (e.g. https://wa.me/1234567890)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingWhatsapp}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1DA855] transition-colors shadow-sm disabled:opacity-50"
              >
                {savingWhatsapp ? "Saving..." : "Save WhatsApp Link"}
              </button>
              {savedWhatsapp && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Instagram */}
        <form onSubmit={(e) => { e.preventDefault(); saveSocial(instagram, "instagram", setSavingInstagram, setSavedInstagram); }}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Instagram</h2>
                <p className="text-sm text-slate-500">Set the Instagram profile link shown on the homepage</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Instagram Link</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-[#E1306C]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={instagram.view_all_link || ""}
                  onChange={(e) => updateInstagram("view_all_link", e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Paste your Instagram profile link (e.g. https://instagram.com/yourprofile)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingInstagram}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {savingInstagram ? "Saving..." : "Save Instagram Link"}
              </button>
              {savedInstagram && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Facebook */}
        <form onSubmit={(e) => { e.preventDefault(); saveSocial(facebook, "facebook", setSavingFacebook, setSavedFacebook); }}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Facebook</h2>
                <p className="text-sm text-slate-500">Set the Facebook page link shown on the homepage</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Facebook Link</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-[#1877F2]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={facebook.view_all_link || ""}
                  onChange={(e) => updateFacebook("view_all_link", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Paste your Facebook page link (e.g. https://facebook.com/yourpage)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingFacebook}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1877F2] text-white text-sm font-semibold rounded-lg hover:bg-[#166fe5] transition-colors shadow-sm disabled:opacity-50"
              >
                {savingFacebook ? "Saving..." : "Save Facebook Link"}
              </button>
              {savedFacebook && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* WhatsApp Pro+ Community */}
        <form onSubmit={(e) => { e.preventDefault(); saveSocial(whatsappVip, "whatsapp_vip", setSavingWhatsappVip, setSavedWhatsappVip); }}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">WhatsApp Pro+ Community</h2>
                <p className="text-sm text-slate-500">Set the exclusive Pro+ WhatsApp group invite link</p>
              </div>
              <span className="ml-auto px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-violet-100 to-blue-100 text-violet-700 rounded-full uppercase tracking-wider shadow-[0_0_6px_rgba(139,92,246,0.3)]">PRO+</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pro+ WhatsApp Link</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-gradient-to-b from-violet-50 to-blue-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-violet-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={whatsappVip.view_all_link || ""}
                  onChange={(e) => setWhatsappVip((v) => ({ ...v, view_all_link: e.target.value }))}
                  placeholder="https://chat.whatsapp.com/your-vip-group"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Paste your Pro+ WhatsApp group invite link (e.g. https://chat.whatsapp.com/xxxxx)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingWhatsappVip}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-violet-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50"
              >
                {savingWhatsappVip ? "Saving..." : "Save Pro+ Link"}
              </button>
              {savedWhatsappVip && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Tracking Codes */}
        <div className="border-t border-slate-200 pt-6 mt-2">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Tracking & Analytics</h2>
          <p className="text-sm text-slate-500 mb-5">Add your tracking pixels and tags to monitor site traffic.</p>
        </div>

        {/* Facebook Pixel */}
        <form onSubmit={(e) => { e.preventDefault(); saveSocial(fbPixel, "facebook_pixel", setSavingFbPixel, setSavedFbPixel); }}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Facebook Pixel</h2>
                <p className="text-sm text-slate-500">Track conversions and build audiences with Meta Pixel</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pixel ID</label>
              <input
                type="text"
                value={fbPixel.view_all_link || ""}
                onChange={(e) => setFbPixel((p) => ({ ...p, view_all_link: e.target.value }))}
                placeholder="e.g. 123456789012345"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1.5">Enter your Facebook Pixel ID (found in Meta Events Manager)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingFbPixel}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1877F2] text-white text-sm font-semibold rounded-lg hover:bg-[#1565D8] transition-colors shadow-sm disabled:opacity-50"
              >
                {savingFbPixel ? "Saving..." : "Save Pixel ID"}
              </button>
              {savedFbPixel && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Google Tag */}
        <form onSubmit={(e) => { e.preventDefault(); saveSocial(googleTag, "google_tag", setSavingGoogleTag, setSavedGoogleTag); }}>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Google Tag (GTM / GA4)</h2>
                <p className="text-sm text-slate-500">Track site analytics with Google Tag Manager or Google Analytics</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tag ID</label>
              <input
                type="text"
                value={googleTag.view_all_link || ""}
                onChange={(e) => setGoogleTag((g) => ({ ...g, view_all_link: e.target.value }))}
                placeholder="e.g. GTM-XXXXXXX or G-XXXXXXXXXX"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1.5">Enter your GTM container ID (GTM-XXXXXXX) or GA4 measurement ID (G-XXXXXXXXXX)</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingGoogleTag}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] text-white text-sm font-semibold rounded-lg hover:bg-[#3367D6] transition-colors shadow-sm disabled:opacity-50"
              >
                {savingGoogleTag ? "Saving..." : "Save Google Tag"}
              </button>
              {savedGoogleTag && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
