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
      {/* trang trái & phải: viền trắng đậm, lề an toàn */}
      <path
        d="M12 7 C 10.2 5.8 7 5.6 5 6.7 L 5 16.8 C 7 15.2 10 15.4 12 16.8 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 7 C 13.8 5.8 17 5.6 19 6.7 L 19 16.8 C 17 15.2 14 15.4 12 16.8 Z"
        fill="url(#slxPage)"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* gáy giữa (xanh đậm) */}
      <path d="M12 7 L 12 16.8" stroke="#1e40af" strokeWidth="1.7" strokeLinecap="round" />
      {/* dòng chữ trang: nét đều, cân đối, tương phản cao */}
      <g stroke="#1d4ed8" strokeWidth="1.05" strokeLinecap="round">
        <path d="M6.4 9.8 h3.4" />
        <path d="M6.4 11.8 h3.4" />
        <path d="M6.4 13.8 h3.4" />
        <path d="M14.2 9.8 h3.4" />
        <path d="M14.2 11.8 h3.4" />
        <path d="M14.2 13.8 h3.4" />
      </g>
    </svg>
  )
}
