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
      {/* trang trái & phải: tỉ lệ cao hơn, cân đối, viền trắng quanh sách */}
      <path
        d="M12 4.5 C 10 3 6 2.8 3.8 4.3 L 3.8 19.2 C 6 17.4 9.8 17.6 12 19 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.5 C 14 3 18 2.8 20.2 4.3 L 20.2 19.2 C 18 17.4 14.2 17.6 12 19 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* gáy giữa (xanh) */}
      <path d="M12 4.5 L 12 19" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      {/* dòng chữ trang */}
      <g stroke="#60a5fa" strokeWidth="0.9" strokeLinecap="round" opacity="0.95">
        <path d="M5.6 8.5 h4" />
        <path d="M5.6 11 h3.6" />
        <path d="M14.4 8.5 h4" />
        <path d="M14.4 11 h3.6" />
      </g>
    </svg>
  )
}
