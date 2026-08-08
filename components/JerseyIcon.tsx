export default function JerseyIcon({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path
        d="M16 6 L7 11 L11 20 L16 17 L16 41 Q16 43 18 43 L30 43 Q32 43 32 41 L32 17 L37 20 L41 11 L32 6
           L27.5 8.5 Q24 11 20.5 8.5 Z"
        fill={color}
        stroke="rgba(0,0,0,.28)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M20.5 8.5 Q24 11 27.5 8.5" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1" />
    </svg>
  );
}
