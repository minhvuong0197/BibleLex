export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="slxPage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef4ff" />
        </linearGradient>
      </defs>
      {/* trang trái & phải (khối, chuyển sáng nhẹ) */}
      <path
        d="M12 6 C 10 4.4 6 4 3.8 5.6 L 3.8 17.5 C 6 15.8 9.8 16 12 17.4 Z"
        fill="url(#slxPage)"
        stroke="#2563eb"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M12 6 C 14 4.4 18 4 20.2 5.6 L 20.2 17.5 C 18 15.8 14.2 16 12 17.4 Z"
        fill="url(#slxPage)"
        stroke="#2563eb"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* gáy giữa */}
      <path d="M12 6 L 12 17.4" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" />
      {/* dòng chữ trang */}
      <g stroke="#93c5fd" strokeWidth="0.9" strokeLinecap="round" opacity="0.9">
        <path d="M5.6 9 h4" />
        <path d="M5.6 11.4 h3.6" />
        <path d="M14.4 9 h4" />
        <path d="M14.4 11.4 h3.6" />
      </g>
    </svg>
  )
}
