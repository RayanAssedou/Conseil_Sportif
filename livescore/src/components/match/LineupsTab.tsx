"use client";

import Image from "next/image";
import { useTranslation } from "@/contexts/LanguageContext";
import { FixtureLineup } from "@/lib/types";

interface LineupsTabProps {
  lineups: FixtureLineup[];
}

export default function LineupsTab({ lineups }: LineupsTabProps) {
  const { t } = useTranslation();
  if (lineups.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-text-muted">{t("lineups.notAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lineups.map((lineup, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="relative w-6 h-6">
                <Image src={lineup.team.logo} alt={lineup.team.name} fill className="object-contain" sizes="24px" unoptimized />
              </div>
              <span className="text-sm font-semibold text-text">{lineup.team.name}</span>
            </div>
            {lineup.formation && (
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {lineup.formation}
              </span>
            )}
          </div>

          {lineup.coach && (
            <div className="flex items-center gap-2.5 px-4 py-2 border-b border-border/50 bg-surface/50">
              {lineup.coach.photo && (
                <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={lineup.coach.photo} alt={lineup.coach.name} fill className="object-cover" sizes="28px" unoptimized />
                </div>
              )}
              <div>
                <span className="text-xs text-text-muted">{t("lineups.coach")}</span>
                <p className="text-sm font-medium text-text">{lineup.coach.name}</p>
              </div>
            </div>
          )}

          <div className="px-4 py-2">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("lineups.startingXI")}
            </h4>
            <div className="grid grid-cols-1 gap-0.5">
              {lineup.startXI.map((item) => (
                <div key={item.player.id} className="flex items-center gap-2.5 py-1.5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-md bg-surface text-xs font-bold text-text-secondary">
                    {item.player.number}
                  </span>
                  <span className="text-sm text-text">{item.player.name}</span>
                  <span className="text-xs text-text-muted ml-auto">{item.player.pos}</span>
                </div>
              ))}
            </div>
          </div>

          {lineup.substitutes.length > 0 && (
            <div className="px-4 py-2 border-t border-border/50">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                {t("lineups.substitutes")}
              </h4>
              <div className="grid grid-cols-1 gap-0.5">
                {lineup.substitutes.map((item) => (
                  <div key={item.player.id} className="flex items-center gap-2.5 py-1.5 opacity-70">
                    <span className="w-6 h-6 flex items-center justify-center rounded-md bg-surface text-xs font-medium text-text-muted">
                      {item.player.number}
                    </span>
                    <span className="text-sm text-text-secondary">{item.player.name}</span>
                    <span className="text-xs text-text-muted ml-auto">{item.player.pos}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
