export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Book cover (filled bright blue) */}
      <path
        d="M5 3.3c-1.1 0-2 .9-2 2v13.4c0 1.1.9 2 2 2h14.4c.6 0 1-.5 1-1V4.3c0-.6-.4-1-1-1H5Z"
        fill="#0A68FF"
      />
      {/* Spine (gạch dọc ở gáy sách) */}
      <path d="M8.7 3.3v17.4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
      {/* Page lines */}
      <path
        d="M11.6 7h6M11.6 10.2h6M11.6 13.4h4.2"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}
