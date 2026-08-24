export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Thập tự giá */}
      <rect x="11.2" y="1.8" width="1.6" height="8.7" rx="0.5" fill="#0A68FF" />
      <rect x="8.6" y="4.4" width="6.8" height="1.6" rx="0.5" fill="#0A68FF" />
      {/* Cuốn Kinh Thánh (sách mở) */}
      <path
        transform="translate(2.4, 6) scale(0.8)"
        fill="#0A68FF"
        d="M12 7c-.9-1.2-2.5-2-4.5-2-2.3 0-4 1-4 2.5v11C3.5 18 5.2 19 7.5 19c2 0 3.6-.8 4.5-2 .9 1.2 2.5 2 4.5 2 2.3 0 4-1 4-2.5v-11C19.5 6 17.8 5 15.5 5c-2 0-3.6.8-4.5 2z"
      />
    </svg>
  )
}
