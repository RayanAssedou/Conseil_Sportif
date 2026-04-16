"use client";

import { useState, useEffect } from "react";

const LS_KEY = "age_verified";
const BLOCKED_URL = "https://www.google.com";

export default function AgeVerificationModal() {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const verified = localStorage.getItem(LS_KEY);
    if (!verified) {
      setShow(true);
      requestAnimationFrame(() => setAnimating(true));
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(LS_KEY, "true");
    setAnimating(false);
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 300);
  };

  const handleDeny = () => {
    window.location.href = BLOCKED_URL;
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-300 ${
        animating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className={`relative z-10 w-full max-w-sm mx-4 transition-all duration-300 ${
          animating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        dir="rtl"
      >
        <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#111111] border border-white/10 shadow-[0_0_60px_rgba(220,38,38,0.15)]">
          <div className="relative px-6 pt-8 pb-2 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <span className="text-2xl font-black text-white">18+</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">אימות גיל</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-1">
              אני מצהיר/ה בזאת כי אני בן/בת 18 ומעלה.
            </p>
            <p className="text-white/40 text-xs">
              תוכן זה מיועד למבוגרים בלבד
            </p>
          </div>

          <div className="px-6 pb-8 pt-5 space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-red-700 text-white font-bold text-base shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_4px_30px_rgba(220,38,38,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              כן, אני מעל גיל 18
            </button>

            <button
              onClick={handleDeny}
              className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white/80 active:scale-[0.98] transition-all"
            >
              לא, אני מתחת לגיל 18
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
