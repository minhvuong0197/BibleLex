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
      {/* trang trái & phải: tỉ lệ mở tự nhiên (rộng > cao), viền trắng */}
      <path
        d="M12 6 C 10 4.7 6.5 4.5 3.5 5.7 L 3.5 18.3 C 6.5 16.5 10 16.7 12 18.3 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M12 6 C 14 4.7 17.5 4.5 20.5 5.7 L 20.5 18.3 C 17.5 16.5 14 16.7 12 18.3 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* gáy giữa (xanh) */}
      <path d="M12 6 L 12 18.3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      {/* dòng chữ trang */}
      <g stroke="#60a5fa" strokeWidth="0.9" strokeLinecap="round" opacity="0.95">
        <path d="M5.6 9.5 h4" />
        <path d="M5.6 12 h3.6" />
        <path d="M14.4 9.5 h4" />
        <path d="M14.4 12 h3.6" />
      </g>
    </svg>
  )
}
