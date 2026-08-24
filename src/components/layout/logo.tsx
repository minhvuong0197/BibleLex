export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Bìa Kinh Thánh (xanh biển sáng tươi, hardcode) */}
      <path
        d="M5 3.3c-1.1 0-2 .9-2 2v13.4c0 1.1.9 2 2 2h14.4c.6 0 1-.5 1-1V4.3c0-.6-.4-1-1-1H5Z"
        fill="#0A68FF"
      />
      {/* Thập tự giá (cross) */}
      <rect x="11.1" y="5.6" width="1.8" height="12.8" rx="0.6" fill="#ffffff" />
      <rect x="7.4" y="9.4" width="9.2" height="1.8" rx="0.6" fill="#ffffff" />
    </svg>
  )
}
