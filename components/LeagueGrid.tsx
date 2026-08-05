"use client";

import { useState } from "react";
import Link from "next/link";
import { money, relativeStart } from "@/lib/format";

export type LeagueCardData = {
  id: string;
  title: string;
  sportName: string;
  sportEmoji: string;
  startAt: string; // ISO
  entryFeeCents: number;
  entryCount: number;
  maxEntries: number;
  status: string;
};

export default function LeagueGrid({ leagues }: { leagues: LeagueCardData[] }) {
  const sports = Array.from(new Set(leagues.map((l) => l.sportName)));
  const [active, setActive] = useState<string>("all");

  const visible = active === "all" ? leagues : leagues.filter((l) => l.sportName === active);

  return (
    <>
      <div className="sport-tabs">
        <button
          className={`stab ${active === "all" ? "active" : ""}`}
          onClick={() => setActive("all")}
        >
          All sports
        </button>
        {sports.map((s) => {
          const emoji = leagues.find((l) => l.sportName === s)?.sportEmoji;
          return (
            <button
              key={s}
              className={`stab ${active === s ? "active" : ""}`}
              onClick={() => setActive(s)}
            >
              {emoji} {s}
            </button>
          );
        })}
      </div>

      <div className="league-grid">
        {visible.map((l) => {
          const pct = Math.min(100, Math.round((l.entryCount / l.maxEntries) * 100));
          const filling = pct >= 70;
          const isLive = l.status === "LIVE";
          const isCompleted = l.status === "COMPLETED";
          return (
            <div className="contest-card" key={l.id}>
              <div className="cc-top">
                <span className="cc-sport">
                  {l.sportEmoji} {l.sportName}
                </span>
                <span
                  className={`cc-status ${isLive ? "status-live" : filling ? "status-hot" : "status-new"}`}
                >
                  {isLive ? "Live now" : isCompleted ? "Completed" : filling ? "Filling fast" : "Just opened"}
                </span>
              </div>
              <h3 className="cc-title">{l.title}</h3>
              <p className="cc-meta">
                {isLive ? "In progress" : isCompleted ? "Season complete" : relativeStart(new Date(l.startAt))}
              </p>
              <div className="cc-stats">
                <div>
                  <span className="cc-label">Entry</span>
                  <span className="cc-val">
                    {l.entryFeeCents === 0 ? "Free" : money(l.entryFeeCents)}
                  </span>
                </div>
                <div>
                  <span className="cc-label">Entries</span>
                  <span className="cc-val gold">
                    {l.entryCount}/{l.maxEntries}
                  </span>
                </div>
              </div>
              <div className="cc-fill-row">
                <div className="cc-bar">
                  <div className="cc-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="cc-fill-txt">
                  {l.entryCount} / {l.maxEntries} joined
                </span>
              </div>
              {l.status === "UPCOMING" ? (
                <Link href={`/draft/${l.id}`} className="btn btn-primary cc-cta">
                  Join league
                </Link>
              ) : (
                <Link href={`/leagues/${l.id}`} className="btn btn-ghost-light cc-cta">
                  View standings
                </Link>
              )}
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="contest-card cc-cta-card">
            <h3 className="cc-title">No leagues in this sport yet</h3>
            <p className="cc-meta">Check back soon, or browse another sport.</p>
          </div>
        )}
      </div>
    </>
  );
}
