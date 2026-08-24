export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
      <path d="M8.5 3.5v17" opacity={0.45} />
      <path d="M13 6.5v8" />
      <path d="M10 9.5h6" />
    </svg>
  )
}
