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

  const handleClick = () => {
    const path = isGoal ? `/match/${toast.fixtureId}` : `/pronostics/${toast.fixtureId}`;
    router.push(path);
    onDismiss();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-xl shadow-2xl border cursor-pointer
        transform transition-all duration-300 ease-out
        animate-slide-in-right hover:scale-[1.02]
        ${isGoal
          ? "bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950 dark:to-surface border-emerald-200 dark:border-emerald-800"
          : "bg-gradient-to-r from-amber-50 to-white dark:from-amber-950 dark:to-surface border-amber-200 dark:border-amber-800"
        }
      `}
      style={{ minWidth: 300, maxWidth: 380 }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isGoal ? "bg-emerald-100" : "bg-amber-100"
        }`}>
          {isGoal ? (
            <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.93 0 3.68.69 5.05 1.83L14.5 8.5l-2.5-1-2.5 1-2.55-2.67A7.956 7.956 0 0112 4zm-8 8c0-1.62.5-3.13 1.33-4.38L8 10.5v3l2.5 2.5-1 3.5A7.98 7.98 0 014 12zm8 8c-1.35 0-2.62-.35-3.73-.96L9.5 15.5 12 13l4 1v3.5l-1.32 1.98A7.89 7.89 0 0112 20zm5.67-2.87L16 15.5V14l2.93-3.07c.04.35.07.71.07 1.07a7.95 7.95 0 01-1.33 4.13z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isGoal ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`}>
            {toast.title}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{toast.body}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
            {t("toast.clickToView")}
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        ref={progressRef}
        className={`h-1 w-full ${isGoal ? "bg-emerald-400/40" : "bg-amber-400/40"}`}
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
