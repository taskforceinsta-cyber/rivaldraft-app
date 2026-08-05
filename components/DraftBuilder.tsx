"use client";

import { useMemo, useState, useActionState } from "react";
import { submitEntry } from "@/lib/actions";
import { salaryFmt } from "@/lib/format";

type PlayerData = {
  id: string;
  name: string;
  team: string;
  position: string;
  salary: number;
  projPoints: number;
};

const SQUAD_SIZE = 5;

export default function DraftBuilder({
  leagueId,
  salaryCap,
  players,
}: {
  leagueId: string;
  salaryCap: number;
  players: PlayerData[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [squadName, setSquadName] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await submitEntry(formData);
    },
    null
  );

  const selectedPlayers = players.filter((p) => selected.has(p.id));
  const salaryUsed = selectedPlayers.reduce((sum, p) => sum + p.salary, 0);
  const overCap = salaryUsed > salaryCap;
  const canSubmit = selected.size === SQUAD_SIZE && !overCap && !pending;

  const positions = useMemo(
    () => Array.from(new Set(players.map((p) => p.position))),
    [players]
  );
  const [posFilter, setPosFilter] = useState("ALL");
  const visible = posFilter === "ALL" ? players : players.filter((p) => p.position === posFilter);

  function toggle(id: string, salary: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= SQUAD_SIZE) return prev;
        if (salaryUsed + salary > salaryCap * 1.5) return prev; // guard against absurd overshoot
        next.add(id);
      }
      return next;
    });
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="leagueId" value={leagueId} />
      <input type="hidden" name="squadName" value={squadName} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="playerId" value={id} />
      ))}

      {state?.error && <div className="form-error">{state.error}</div>}

      <div className="draft-bar card">
        <div className="field draft-name-field">
          <label htmlFor="squadName">Squad name</label>
          <input
            id="squadName"
            type="text"
            placeholder="My Squad"
            value={squadName}
            onChange={(e) => setSquadName(e.target.value)}
            maxLength={40}
          />
        </div>
        <div className="draft-stat">
          <span className="cc-label">Salary used</span>
          <span className={`cc-val ${overCap ? "over" : ""}`}>
            {salaryFmt(salaryUsed)} / {salaryFmt(salaryCap)}
          </span>
        </div>
        <div className="draft-stat">
          <span className="cc-label">Players</span>
          <span className="cc-val">
            {selected.size} / {SQUAD_SIZE}
          </span>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit}>
          {pending ? "Submitting…" : "Lock in squad"}
        </button>
      </div>

      <div className="pos-tabs">
        <button
          type="button"
          className={`stab ${posFilter === "ALL" ? "active" : ""}`}
          onClick={() => setPosFilter("ALL")}
        >
          All positions
        </button>
        {positions.map((pos) => (
          <button
            type="button"
            key={pos}
            className={`stab ${posFilter === pos ? "active" : ""}`}
            onClick={() => setPosFilter(pos)}
          >
            {pos}
          </button>
        ))}
      </div>

      <div className="player-table card">
        <div className="prow prow-head">
          <span>Player</span>
          <span>Team</span>
          <span>Pos</span>
          <span>Salary</span>
          <span>Proj</span>
          <span></span>
        </div>
        {visible.map((p) => {
          const isSelected = selected.has(p.id);
          const disabled = !isSelected && selected.size >= SQUAD_SIZE;
          return (
            <div className={`prow ${isSelected ? "picked" : ""}`} key={p.id}>
              <span className="p-name">{p.name}</span>
              <span className="p-muted">{p.team}</span>
              <span className="p-muted">{p.position}</span>
              <span className="p-salary">{salaryFmt(p.salary)}</span>
              <span className="p-proj">{p.projPoints.toFixed(1)}</span>
              <button
                type="button"
                className={`btn btn-sm ${isSelected ? "btn-danger" : "btn-ghost-light"}`}
                onClick={() => toggle(p.id, p.salary)}
                disabled={disabled}
              >
                {isSelected ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </form>
  );
}
