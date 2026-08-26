export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* bóng đổ nhẹ tạo chiều sâu 3D */}
      <ellipse cx="12" cy="20.6" rx="8" ry="1.6" fill="#1e3a8a" opacity="0.18" />
      {/* hai trang sách (khối trắng, viền xanh) */}
      <path
        d="M12 5 C 10 3.5 6 3 3.5 5 L 3.5 18 C 6 16 10 16.2 12 17.5 C 14 16.2 18 16 20.5 18 L 20.5 5 C 18 3 14 3.5 12 5 Z"
        fill="#ffffff"
        stroke="#2563eb"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* nếp gấp chính giữa */}
      <path d="M12 5 L 12 17.5" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" />
      {/* gáy sách (binding) nhô nhẹ ở đỉnh */}
      <rect x="11" y="3.1" width="2" height="3.4" rx="1.1" fill="#2563eb" />
      {/* dòng chữ trang (nhẹ) */}
      <g stroke="#93c5fd" strokeWidth="0.9" strokeLinecap="round" opacity="0.95">
        <path d="M6 8 h4" />
        <path d="M6 10.6 h4" />
        <path d="M14 8 h4" />
        <path d="M14 10.6 h4" />
      </g>
    </svg>
  )
}
