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
      {/* Thập tự giá vuông (4 cạnh, đầu vuông) */}
      <rect x="10.8" y="6" width="2.4" height="8" fill="currentColor" stroke="none" />
      <rect x="8.5" y="8.8" width="7" height="2.4" fill="currentColor" stroke="none" />
    </svg>
  )
}
