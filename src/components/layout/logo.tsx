export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      overflow="visible"
    >
      {/* soft contact shadow for 3D depth */}
      <ellipse cx="12" cy="24.6" rx="7" ry="1.2" fill="#1e40af" opacity="0.15" />
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* folded page corner — bleeds above the frame */}
        <path
          d="M12 -2.2 L19.5 -3.4 L20.6 1 L13.2 2.2 Z"
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="0.8"
        />
        {/* book back cover (white) */}
        <rect
          x="5.5"
          y="2"
          width="13"
          height="18.5"
          rx="2.3"
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="1.1"
        />
        {/* spine (blue) */}
        <rect x="5.5" y="2" width="3" height="18.5" rx="2.3" fill="#2563eb" />
        {/* page edges */}
        <path d="M18 3.5 v15.5" stroke="#bfdbfe" strokeWidth="1" />
        <path d="M17 3.9 v14.7" stroke="#bfdbfe" strokeWidth="0.8" />
        {/* cross on the cover */}
        <g stroke="#2563eb" strokeWidth="1.7">
          <path d="M12.2 6 v7.4" />
          <path d="M9.1 9 h6.2" />
        </g>
        {/* ribbon bookmark — bleeds below the frame */}
        <path d="M14.4 20.5 L14.4 27 L12.2 24.9 L10 27 L10 20.5 Z" fill="#2563eb" />
      </g>
    </svg>
  )
}
