"use client";

import { useEffect } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_LINK = "https://wa.me/972526142250";

export default function BonusModal({ isOpen, onClose }: BonusModalProps) {
  const { t, locale } = useTranslation();
  const isRtl = locale === "he" || locale === "ar";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const features = [
    { key: "bonus.vip", icon: "headset" },
    { key: "bonus.personal", icon: "user" },
    { key: "bonus.transparent", icon: "eye" },
    { key: "bonus.security", icon: "shield" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-[#111111] border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <button
          onClick={onClose}
          className={`sticky top-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 flex items-center justify-center text-white hover:bg-amber-500/20 transition-all ${isRtl ? "float-left ml-3" : "float-right mr-3"}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pt-6 pb-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">{t("bonus.headline")}</span>
            </h2>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">{t("bonus.subtitle")}</p>
          </div>

          {/* Bonus Badge */}
          <div className="relative mx-auto max-w-xs">
            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-5 text-center">
              <span className="text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent" dir="ltr">100₪</span>
              <p className="text-amber-200/80 text-sm mt-1 font-medium">{t("bonus.gift")}</p>
              <p className="text-white/40 text-[11px] mt-2">{t("bonus.condition")}</p>
            </div>
          </div>

          {/* Bonus on Every Deposit */}
          <div className="relative mx-auto max-w-xs">
            <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/25 rounded-2xl p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 mb-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-green-400">{t("bonus.everyDeposit")}</h3>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">{t("bonus.everyDepositDesc")}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map(({ key, icon }) => (
              <div key={key} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {icon === "headset" && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  )}
                  {icon === "user" && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                  {icon === "eye" && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {icon === "shield" && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  )}
                </div>
                <p className="text-white/90 text-sm leading-relaxed">{t(key)}</p>
              </div>
            ))}
          </div>

          {/* Sports tagline */}
          <div className="text-center">
            <p className="text-white/70 text-sm leading-relaxed">{t("bonus.sports")}</p>
            <p className="text-amber-400/80 text-xs mt-2 font-semibold">{t("bonus.certified")}</p>
          </div>

          {/* CTA */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-base hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all hover:scale-[1.02]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t("bonus.cta")}
          </a>

          <p className="text-center text-white/40 text-xs">{t("bonus.phone")}</p>
        </div>
      </div>
    </div>
  );
}
