"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, NotifToast } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/LanguageContext";

const AUTO_DISMISS_MS = 8000;

function ToastItem({ toast, onDismiss }: { toast: NotifToast; onDismiss: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${AUTO_DISMISS_MS}ms linear`;
      requestAnimationFrame(() => {
        if (progressRef.current) progressRef.current.style.width = "0%";
      });
    }
  }, []);

  const isGoal = toast.type === "goal";
  const isPenalty = toast.type === "penalty";
  const isScoreEvent = isGoal || isPenalty;

  const handleClick = () => {
    const path = isScoreEvent ? `/match/${toast.fixtureId}` : `/pronostics/${toast.fixtureId}`;
    router.push(path);
    onDismiss();
  };

  const accent = isScoreEvent
    ? { bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-400/30 dark:border-emerald-500/20", iconBg: "bg-emerald-500", title: "text-emerald-700 dark:text-emerald-300", progress: "bg-emerald-500/30" }
    : { bg: "from-blue-500/10 to-blue-500/5", border: "border-blue-400/30 dark:border-blue-500/20", iconBg: "bg-blue-500", title: "text-blue-700 dark:text-blue-300", progress: "bg-blue-500/30" };

  return (
    <div
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer
        transform transition-all duration-300 ease-out
        animate-slide-in-right hover:scale-[1.02] hover:shadow-2xl
        bg-gradient-to-br ${accent.bg}
        backdrop-blur-xl bg-white/80 dark:bg-surface/90
        border ${accent.border}
        shadow-lg shadow-black/5 dark:shadow-black/20
      `}
      style={{ minWidth: 320, maxWidth: 400, fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <div className="flex items-start gap-3.5 p-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${accent.iconBg} flex items-center justify-center shadow-md`}>
          {isScoreEvent ? (
            <span className="text-lg leading-none" role="img" aria-label="goal">{isPenalty ? "⚽" : "⚽"}</span>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isScoreEvent && (
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${
              isPenalty
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
            }`}>
              {isPenalty ? "Penalty" : "Goal"}
            </span>
          )}
          <p className={`text-[15px] font-semibold leading-snug tracking-tight ${accent.title}`}>
            {toast.title}
          </p>
          <p className="text-[13px] font-normal text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {toast.body}
          </p>
          <p className="text-[10px] text-slate-400/80 dark:text-slate-500 mt-2 uppercase tracking-[0.08em] font-medium">
            {t("toast.clickToView")}
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors mt-0.5"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        ref={progressRef}
        className={`h-[3px] w-full ${accent.progress} rounded-full`}
        style={{ width: "100%" }}
      />
    </div>
  );
}

export default function NotificationToast() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
      {toasts.slice(-5).map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
