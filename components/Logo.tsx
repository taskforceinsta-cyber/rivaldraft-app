export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="url(#logo-g)" />
      <path d="M12 27L20 11L28 27H23L20 20.5L17 27H12Z" fill="#0B0B14" />
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B85FF" />
          <stop offset="1" stopColor="#3DDC97" />
        </linearGradient>
      </defs>
    </svg>
  );
}
