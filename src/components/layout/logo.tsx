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
      {/* trang trái & phải: lề an toàn, không sát mép khung */}
      <path
        d="M12 7 C 10.2 5.8 7 5.6 5 6.7 L 5 16.8 C 7 15.2 10 15.4 12 16.8 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M12 7 C 13.8 5.8 17 5.6 19 6.7 L 19 16.8 C 17 15.2 14 15.4 12 16.8 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* gáy giữa (xanh) */}
      <path d="M12 7 L 12 16.8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      {/* dòng chữ trang */}
      <g stroke="#60a5fa" strokeWidth="0.9" strokeLinecap="round" opacity="0.95">
        <path d="M6.6 10 h4" />
        <path d="M6.6 12.5 h3.6" />
        <path d="M14.4 10 h4" />
        <path d="M14.4 12.5 h3.6" />
      </g>
    </svg>
  )
}
