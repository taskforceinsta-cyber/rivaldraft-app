"use client";

import { useState } from "react";
import JerseyIcon from "@/components/JerseyIcon";
import PlayerStatsModal, { StatPlayer } from "@/components/PlayerStatsModal";

export default function JerseyStatsButton({ color, player }: { color: string; player: StatPlayer }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="player-card-avatar jersey-btn"
        onClick={() => setOpen(true)}
        aria-label={`View ${player.name} stats`}
      >
        <JerseyIcon color={color} size={40} />
      </button>
      {open && <PlayerStatsModal player={player} onClose={() => setOpen(false)} />}
    </>
  );
}
