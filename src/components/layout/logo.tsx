export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      overflow="visible"
    >
      {/* soft contact shadow for 3D depth */}
      <ellipse cx="12" cy="25.2" rx="6.5" ry="1.1" fill="#1e3a8a" opacity="0.18" />
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* book cover (white) — bleeds above and below the frame */}
        <rect
          x="5.5"
          y="-2.5"
          width="13"
          height="25"
          rx="2.4"
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="1.1"
        />
        {/* spine (blue) */}
        <rect x="5.5" y="-2.5" width="3.2" height="25" rx="2.4" fill="#2563eb" />
        {/* page edges on the right */}
        <path d="M17.8 -1.3 v22.6" stroke="#dbeafe" stroke-width="1" />
        <path d="M18.6 -1 v21.8" stroke="#dbeafe" stroke-width="0.9" />
        {/* cross centered on the cover */}
        <g stroke="#2563eb" stroke-width="2">
          <path d="M12.1 3.4 v8.4" />
          <path d="M8.6 6.8 h6.9" />
        </g>
      </g>
    </svg>
  )
}
