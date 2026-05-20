"use client";

import { useEffect } from "react";

interface WatchLiveModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WatchLiveModal({ open, onClose }: WatchLiveModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-live-title"
    >
      <div
        dir="rtl"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card text-text rounded-2xl border border-border shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-4 border-b border-border">
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-light text-text-secondary hover:text-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-2xl leading-none" aria-hidden="true">⚽🏀</div>
          <h2
            id="watch-live-title"
            className="text-xl sm:text-2xl font-bold text-text mt-2 leading-snug"
          >
            כל הספורט שבעולם במקום אחד!
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-sm sm:text-base leading-relaxed">
          <p className="text-text-secondary">
            החל מיום שני{" "}
            <strong className="text-text whitespace-nowrap">1.6.2025</strong>,
            אנחנו שמחים להודיע על הרחבת השירות והוספת חבילות הספורט המובילות
            בישראל!
          </p>

          <div>
            <p className="font-semibold text-text mb-2">מה מחכה לכם בפנים?</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-text">חבילת ספורט 1 המלאה:</strong>{" "}
                  ערוצים 1, 2, 3, 4, 5 ו-6.
                </span>
              </li>
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-text">ערוצי ONE:</strong> שידורי ONE
                  ו-ONE HD.
                </span>
              </li>
              <li className="flex items-start gap-2 text-text-secondary">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-text">חבילת ספורט 5:</strong> ספורט 5,
                  5 לייב ו-5 גולד.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-text-secondary">
            כל הליגות הגדולות, השידורים החיים והניתוחים הכי חמים — ישירות אצלנו.
            <br />
            תתכוננו לחוויית צפייה ברמה אחרת!
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors shadow-md shadow-primary/20"
          >
            הבנתי
          </button>
        </div>
      </div>
    </div>
  );
}
