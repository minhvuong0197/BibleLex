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
      {/* cuốn Kinh Thánh mở ra */}
      <path d="M12 5 C 10 3.5 6 3 3.5 5 L 3.5 18 C 6 16 10 16.2 12 17.5 C 14 16.2 18 16 20.5 18 L 20.5 5 C 18 3 14 3.5 12 5 Z" />
      {/* gáy sách ở giữa */}
      <path d="M12 5 L 12 17.5" opacity={0.45} />
      {/* dòng chữ trên trang */}
      <g opacity={0.5}>
        <path d="M6 8 h4.2" />
        <path d="M6 11 h4.2" />
        <path d="M6 14 h3.6" />
        <path d="M13.8 8 h4.2" />
        <path d="M13.8 11 h4.2" />
        <path d="M14.4 14 h3.6" />
      </g>
    </svg>
  )
}
