export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <rect x="2" y="2" width="24" height="24" rx="7" fill="var(--kn-accent)" />
      <path
        d="M9 8v12M9 14l9-6M12 12l7 8"
        stroke="var(--kn-accent-foreground)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
