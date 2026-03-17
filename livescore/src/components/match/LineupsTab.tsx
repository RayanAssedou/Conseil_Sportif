"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { FixtureLineup } from "@/lib/types";

interface LineupsTabProps {
  lineups: FixtureLineup[];
}

export default function LineupsTab({ lineups }: LineupsTabProps) {
  const { t } = useTranslation();
  const [showSubs, setShowSubs] = useState(false);

  if (lineups.length < 2) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-text-muted">{t("lineups.notAvailable")}</p>
      </div>
    );
  }

  const home = lineups[0];
  const away = lineups[1];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Formations header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5 flex-shrink-0">
            <Image src={home.team.logo} alt={home.team.name} fill className="object-contain" sizes="20px" unoptimized />
          </div>
          <span className="text-sm font-semibold text-text">{home.team.name}</span>
          {home.formation && (
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {home.formation}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {away.formation && (
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {away.formation}
            </span>
          )}
          <span className="text-sm font-semibold text-text">{away.team.name}</span>
          <div className="relative w-5 h-5 flex-shrink-0">
            <Image src={away.team.logo} alt={away.team.name} fill className="object-contain" sizes="20px" unoptimized />
          </div>
        </div>
      </div>

      {/* Football pitch */}
      <FootballPitch home={home} away={away} />

      {/* Coaches */}
      <div className="border-t border-border">
        <div className="px-4 py-2 bg-surface/50">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center">{t("lineups.coach")}</p>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <CoachInfo coach={home.coach} />
          <CoachInfo coach={away.coach} align="right" />
        </div>
      </div>

      {/* Starting XI list */}
      <div className="border-t border-border">
        <div className="px-4 py-2 bg-surface/50">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center">{t("lineups.startingXI")}</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border">
          <PlayerList players={home.startXI} teamColors={home.team.colors} side="home" />
          <PlayerList players={away.startXI} teamColors={away.team.colors} side="away" />
        </div>
      </div>

      {/* Substitutes */}
      {(home.substitutes.length > 0 || away.substitutes.length > 0) && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowSubs(!showSubs)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface/50 hover:bg-surface transition-colors"
          >
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("lineups.substitutes")}</span>
            <svg
              className={`w-3.5 h-3.5 text-text-muted transition-transform ${showSubs ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {showSubs && (
            <div className="grid grid-cols-2 divide-x divide-border">
              <PlayerList players={home.substitutes} teamColors={home.team.colors} side="home" isSub />
              <PlayerList players={away.substitutes} teamColors={away.team.colors} side="away" isSub />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Football Pitch ──────────────────────────────────────────── */

function FootballPitch({ home, away }: { home: FixtureLineup; away: FixtureLineup }) {
  const homeColor = home.team.colors?.player?.primary || "44aa44";
  const awayColor = away.team.colors?.player?.primary || "3344cc";
  const homeGkColor = home.team.colors?.goalkeeper?.primary || "ffcc00";
  const awayGkColor = away.team.colors?.goalkeeper?.primary || "ff8800";
  const homeNumColor = home.team.colors?.player?.number || "ffffff";
  const awayNumColor = away.team.colors?.player?.number || "ffffff";
  const homeGkNumColor = home.team.colors?.goalkeeper?.number || "000000";
  const awayGkNumColor = away.team.colors?.goalkeeper?.number || "000000";

  const homeRows = parseGrid(home.startXI);
  const awayRows = parseGrid(away.startXI);

  const homeMaxRow = Math.max(...homeRows.map((r) => r.row), 1);
  const awayMaxRow = Math.max(...awayRows.map((r) => r.row), 1);

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2 / 2.6" }}>
      {/* Pitch background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d8a4e] to-[#1e6b3a]" />

      {/* Field markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 680 880" preserveAspectRatio="none">
        {/* Outer boundary */}
        <rect x="40" y="20" width="600" height="840" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        {/* Halfway line */}
        <line x1="40" y1="440" x2="640" y2="440" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        {/* Center circle */}
        <circle cx="340" cy="440" r="72" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <circle cx="340" cy="440" r="4" fill="rgba(255,255,255,0.3)" />
        {/* Home penalty area (top) */}
        <rect x="170" y="20" width="340" height="132" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <rect x="228" y="20" width="224" height="48" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <circle cx="340" cy="120" r="4" fill="rgba(255,255,255,0.3)" />
        {/* Away penalty area (bottom) */}
        <rect x="170" y="728" width="340" height="132" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <rect x="228" y="812" width="224" height="48" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <circle cx="340" cy="760" r="4" fill="rgba(255,255,255,0.3)" />
        {/* Corner arcs */}
        <path d="M40,36 A16,16 0 0,1 56,20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <path d="M624,20 A16,16 0 0,1 640,36" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <path d="M40,844 A16,16 0 0,0 56,860" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <path d="M624,860 A16,16 0 0,0 640,844" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      </svg>

      {/* Home team (top half) */}
      <div className="absolute top-0 left-0 right-0 bottom-1/2">
        {homeRows.map((p, i) => {
          const isGk = p.row === 1;
          const yPct = (p.row / (homeMaxRow + 1)) * 95 + 2;
          const xPct = getXPosition(p.col, p.totalInRow);
          return (
            <PlayerDot
              key={i}
              x={xPct}
              y={yPct}
              number={p.number}
              name={p.name}
              color={isGk ? `#${homeGkColor}` : `#${homeColor}`}
              numColor={isGk ? `#${homeGkNumColor}` : `#${homeNumColor}`}
            />
          );
        })}
      </div>

      {/* Away team (bottom half, mirrored) */}
      <div className="absolute top-1/2 left-0 right-0 bottom-0">
        {awayRows.map((p, i) => {
          const isGk = p.row === 1;
          const yPct = 98 - (p.row / (awayMaxRow + 1)) * 95;
          const xPct = getXPosition(p.col, p.totalInRow);
          return (
            <PlayerDot
              key={i}
              x={xPct}
              y={yPct}
              number={p.number}
              name={p.name}
              color={isGk ? `#${awayGkColor}` : `#${awayColor}`}
              numColor={isGk ? `#${awayGkNumColor}` : `#${awayNumColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Player Dot on Pitch ────────────────────────────────────── */

function PlayerDot({
  x, y, number, name, color, numColor,
}: {
  x: number; y: number; number: number; name: string; color: string; numColor: string;
}) {
  const shortName = name.split(" ").pop() || name;
  return (
    <div
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg border-2 border-white/30"
        style={{ backgroundColor: color, color: numColor }}
      >
        {number}
      </div>
      <span className="mt-0.5 text-[8px] sm:text-[9px] font-medium text-white text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-[60px] truncate">
        {shortName}
      </span>
    </div>
  );
}

/* ─── Coach Info ──────────────────────────────────────────────── */

function CoachInfo({ coach, align = "left" }: { coach: FixtureLineup["coach"]; align?: "left" | "right" }) {
  if (!coach) return <div />;
  return (
    <div className={`flex items-center gap-2.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
      {coach.photo && (
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border">
          <Image src={coach.photo} alt={coach.name} fill className="object-cover" sizes="32px" unoptimized />
        </div>
      )}
      <span className="text-sm font-medium text-text">{coach.name}</span>
    </div>
  );
}

/* ─── Player List ────────────────────────────────────────────── */

type PlayerEntry = FixtureLineup["startXI"][number];
type TeamColors = FixtureLineup["team"]["colors"];

function PlayerList({
  players, teamColors, side, isSub = false,
}: {
  players: PlayerEntry[]; teamColors: TeamColors; side: "home" | "away"; isSub?: boolean;
}) {
  const posMap: Record<string, string> = { G: "GK", D: "DF", M: "MF", F: "FW" };
  return (
    <div className={`py-1 ${isSub ? "opacity-70" : ""}`}>
      {players.map((item) => (
        <div
          key={item.player.id}
          className={`flex items-center gap-2 px-3 py-1.5 ${side === "away" ? "flex-row-reverse text-right" : ""}`}
        >
          <span
            className="w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold flex-shrink-0"
            style={{
              backgroundColor: teamColors ? `#${teamColors.player.primary}` : (side === "home" ? "#44aa44" : "#3344cc"),
              color: teamColors ? `#${teamColors.player.number}` : "#ffffff",
            }}
          >
            {item.player.number}
          </span>
          <span className="text-xs text-text flex-1 truncate">{item.player.name}</span>
          <span className="text-[10px] text-text-muted font-medium flex-shrink-0">
            {posMap[item.player.pos] || item.player.pos}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Grid parsing helpers ───────────────────────────────────── */

interface ParsedPlayer {
  row: number;
  col: number;
  totalInRow: number;
  number: number;
  name: string;
}

function parseGrid(startXI: PlayerEntry[]): ParsedPlayer[] {
  const rowMap = new Map<number, ParsedPlayer[]>();

  for (const item of startXI) {
    const grid = item.player.grid;
    if (!grid) continue;
    const [rowStr, colStr] = grid.split(":");
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    if (isNaN(row) || isNaN(col)) continue;

    const p: ParsedPlayer = { row, col, totalInRow: 0, number: item.player.number, name: item.player.name };
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(p);
  }

  const result: ParsedPlayer[] = [];
  for (const [, players] of rowMap) {
    players.sort((a, b) => a.col - b.col);
    for (const p of players) {
      p.totalInRow = players.length;
      result.push(p);
    }
  }

  return result;
}

function getXPosition(col: number, totalInRow: number): number {
  if (totalInRow <= 1) return 50;
  const padding = 12;
  const available = 100 - 2 * padding;
  const step = available / (totalInRow - 1);
  return padding + (col - 1) * step;
}
