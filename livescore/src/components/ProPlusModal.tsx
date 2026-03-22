"use client";

import { useEffect } from "react";
import { useProPlusModal } from "@/contexts/ProPlusModalContext";
import { useTranslation } from "@/contexts/LanguageContext";

interface PlanLine { bold: boolean; key: string }

interface PlanConfig {
  id: number;
  nameKey: string;
  subtitleKey: string;
  price: string;
  priceLabelKey: string;
  gradient: string;
  btnGradient: string;
  textColor: string;
  iconBg: string;
  icon: "bolt" | "crown" | "diamond";
  badge?: string;
  lines: PlanLine[];
}

function PlanIcon({ icon, className }: { icon: PlanConfig["icon"]; className?: string }) {
  if (icon === "bolt")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    );
  if (icon === "crown")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-2.79-6.57a1.5 1.5 0 00-2.77.02L6.64 10l-5.31-1.42c-.8-.21-1.62.27-1.83 1.07-.16.6.04 1.22.5 1.58L4.5 14.5l-1 4.5h17l-1-4.5L24 11.22c.46-.36.66-.97.07-1.58z" />
      </svg>
    );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
    </svg>
  );
}

const plans: PlanConfig[] = [
  {
    id: 1,
    nameKey: "proPlus.plan1.name",
    subtitleKey: "proPlus.plan1.subtitle",
    price: "₪299",
    priceLabelKey: "proPlus.perWeek",
    gradient: "from-[#E8C4A0] via-[#CD7F32] to-[#7A3B10]",
    btnGradient: "from-[#7A3B10] to-[#5C2A08] hover:from-[#6B3310] hover:to-[#4A2006]",
    textColor: "text-white",
    iconBg: "bg-violet-500/15",
    icon: "bolt",
    lines: [
      { bold: true, key: "proPlus.plan1.line1" },
      { bold: false, key: "proPlus.plan1.line2" },
      { bold: false, key: "proPlus.plan1.line3" },
      { bold: false, key: "proPlus.plan1.line4" },
      { bold: true, key: "proPlus.plan1.line5" },
    ],
  },
  {
    id: 2,
    nameKey: "proPlus.plan2.name",
    subtitleKey: "proPlus.plan2.subtitle",
    price: "₪799",
    priceLabelKey: "proPlus.perMonth",
    gradient: "from-[#E8E8E8] via-[#C0C0C0] to-[#8A8D91]",
    btnGradient: "from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700",
    textColor: "text-gray-900",
    iconBg: "bg-gray-900/10",
    icon: "crown",
    badge: "BEST VALUE",
    lines: [
      { bold: true, key: "proPlus.plan2.line1" },
      { bold: false, key: "proPlus.plan2.line2" },
      { bold: false, key: "proPlus.plan2.line3" },
      { bold: true, key: "proPlus.plan2.line4" },
      { bold: false, key: "proPlus.plan2.line5" },
      { bold: true, key: "proPlus.plan2.line6" },
    ],
  },
  {
    id: 3,
    nameKey: "proPlus.plan3.name",
    subtitleKey: "proPlus.plan3.subtitle",
    price: "20%",
    priceLabelKey: "proPlus.ofProfits",
    gradient: "from-[#F7E078] via-[#D4A730] to-[#B8860B]",
    btnGradient: "from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700",
    textColor: "text-gray-900",
    iconBg: "bg-gray-900/10",
    icon: "diamond",
    lines: [
      { bold: true, key: "proPlus.plan3.line1" },
      { bold: false, key: "proPlus.plan3.line2" },
      { bold: true, key: "proPlus.plan3.line3" },
      { bold: false, key: "proPlus.plan3.line4" },
    ],
  },
];

export default function ProPlusModal() {
  const { isOpen, whatsappLink, closeProPlus } = useProPlusModal();
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

  const link = whatsappLink || "https://wa.me/";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      onClick={closeProPlus}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? "rtl" : "ltr"}
        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        <button
          onClick={closeProPlus}
          className={`sticky top-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-violet-500/30 flex items-center justify-center text-white hover:bg-violet-500/20 transition-all ${isRtl ? "float-left ml-3" : "float-right mr-3"}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title with premium sparkle */}
        <div className="text-center pt-6 pb-4 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-[0_0_30px_rgba(139,92,246,0.4)] mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent" style={{ textShadow: "0 0 20px rgba(139,92,246,0.5)" }} dir="ltr">Pro+</span>
            {" "}
            <span>{t("proPlus.title")}</span>
          </h2>
          <p className="text-white/60 text-sm mt-2">{t("proPlus.subtitle")}</p>
        </div>

        {/* Cards */}
        <div className="flex flex-col lg:flex-row gap-5 px-5 pb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex-1 rounded-2xl bg-gradient-to-br ${plan.gradient} p-6 flex flex-col shadow-xl ${
                plan.badge ? "ring-2 ring-white/50 lg:scale-[1.03]" : ""
              }`}
            >
              {/* Best value badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white rounded-full shadow-lg">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-700">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                  <PlanIcon icon={plan.icon} className={`w-6 h-6 ${plan.textColor}`} />
                </div>
              </div>

              {/* Plan header */}
              <div className="text-center mb-4">
                <span className={`text-sm font-semibold uppercase tracking-wider ${plan.textColor} opacity-70`}>
                  {t(plan.nameKey)}
                </span>
                <div className={`text-xs font-medium ${plan.textColor} opacity-50 mt-0.5`}>
                  {t(plan.subtitleKey)}
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-5">
                <span className={`text-5xl font-extrabold ${plan.textColor} leading-none`} dir="ltr">
                  {plan.price}
                </span>
                <span className={`block text-sm font-medium ${plan.textColor} opacity-70 mt-1`}>
                  {t(plan.priceLabelKey)}
                </span>
              </div>

              {/* Divider */}
              <div className={`h-px w-full ${plan.textColor === "text-white" ? "bg-white/20" : "bg-black/10"} mb-4`} />

              {/* Content lines with check icons */}
              <div className="flex-1 space-y-3 mb-6">
                {plan.lines.map((line, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className={`text-[13px] leading-relaxed ${plan.textColor} ${line.bold ? "font-bold" : "font-normal opacity-85"}`}>
                      {t(line.key)}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA with WhatsApp icon */}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r ${plan.btnGradient} text-white text-base font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t("proPlus.cta")}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
