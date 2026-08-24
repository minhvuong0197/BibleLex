export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3" width="17" height="18" rx="2.5" fill="currentColor" />
      <rect x="6.5" y="3" width="1.8" height="18" fill="white" opacity="0.85" />
      <rect x="9.8" y="6.5" width="8.7" height="1.6" rx="0.8" fill="white" opacity="0.6" />
      <rect x="9.8" y="10" width="8.7" height="1.6" rx="0.8" fill="white" opacity="0.6" />
      <rect x="9.8" y="13.5" width="6" height="1.6" rx="0.8" fill="white" opacity="0.6" />
    </svg>
  )
}
