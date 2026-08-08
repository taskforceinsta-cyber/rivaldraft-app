const PALETTE = [
  "#C8102E", // red
  "#6CABDD", // sky blue
  "#034694", // navy blue
  "#00A650", // green
  "#FDB913", // gold
  "#7A263A", // maroon
  "#132257", // dark navy
  "#EF7B10", // orange
];

export function teamColor(team: string): string {
  let hash = 0;
  for (let i = 0; i < team.length; i++) hash = (hash * 31 + team.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

const POSITION_ORDER = ["GK", "DEF", "MID", "FWD"];

export function sortByPosition<T extends [string, unknown]>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ia = POSITION_ORDER.indexOf(a[0]);
    const ib = POSITION_ORDER.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
