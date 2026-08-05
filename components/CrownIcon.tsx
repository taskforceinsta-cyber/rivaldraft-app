export default function CrownIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8l4 3 5-6 5 6 4-3-1.5 10h-15L3 8z" />
      <rect x="4" y="19" width="16" height="2" rx="1" />
    </svg>
  );
}
