"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { salaryFmt } from "@/lib/format";

export type GameLogEntry = {
  gameweek: number;
  opponent: string;
  points: number;
  goals: number;
  assists: number;
  minutes: number;
};

export type StatPlayer = {
  name: string;
  team: string;
  position: string;
  salary: number;
  appearances: number;
  goals: number;
  assists: number;
  shotAccuracy: number;
  pointsPerGame: number;
  gameLogs: GameLogEntry[];
};

export default function PlayerStatsModal({
  player,
  onClose,
}: {
  player: StatPlayer;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <div className="modal-head">
          <h3>{player.name}</h3>
          <p>
            {player.team} · {player.position} · {salaryFmt(player.salary)}
          </p>
        </div>

        <div className="modal-stat-grid">
          <div className="modal-stat">
            <span className="modal-stat-val">{player.appearances}</span>
            <span className="modal-stat-lbl">Apps</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-val">{player.goals}</span>
            <span className="modal-stat-lbl">Goals</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-val">{player.assists}</span>
            <span className="modal-stat-lbl">Assists</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-val">
              {player.position === "GK" ? "—" : `${player.shotAccuracy.toFixed(0)}%`}
            </span>
            <span className="modal-stat-lbl">Shot acc.</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-val">{player.pointsPerGame.toFixed(1)}</span>
            <span className="modal-stat-lbl">Pts / game</span>
          </div>
        </div>

        <h4 className="modal-sub-h">Last {player.gameLogs.length} games</h4>
        <div className="modal-log">
          {player.gameLogs.length === 0 ? (
            <div className="modal-log-empty">No match history yet this season.</div>
          ) : (
            <>
              <div className="modal-log-row modal-log-head">
                <span>GW</span>
                <span>Opponent</span>
                <span>Min</span>
                <span>G</span>
                <span>A</span>
                <span>Pts</span>
              </div>
              {player.gameLogs.map((g) => (
                <div className="modal-log-row" key={g.gameweek}>
                  <span>{g.gameweek}</span>
                  <span>{g.opponent}</span>
                  <span>{g.minutes}&rsquo;</span>
                  <span>{g.goals}</span>
                  <span>{g.assists}</span>
                  <span className="modal-log-pts">{g.points.toFixed(1)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
