"use client";

import { FixtureEvent } from "@/lib/types";

interface EventsTabProps {
  events: FixtureEvent[];
}

export default function EventsTab({ events }: EventsTabProps) {
  if (events.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center">
        <p className="text-text-muted">Aucun événement disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
          <span className="text-xs font-bold text-text-secondary w-10 text-center">
            {event.time.elapsed}&apos;
          </span>
          <span className="text-sm text-text">{event.player.name}</span>
          <span className="text-xs text-text-muted ml-auto">{event.detail}</span>
        </div>
      ))}
    </div>
  );
}
