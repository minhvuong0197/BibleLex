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
      {/* Thập tự giá Latin: thanh ngang ngắn ở trên, thanh dọc kéo dài xuống */}
      <rect x="10.8" y="5" width="2.4" height="11" fill="currentColor" stroke="none" />
      <rect x="9" y="7.2" width="6" height="2.4" fill="currentColor" stroke="none" />
    </svg>
  )
}
