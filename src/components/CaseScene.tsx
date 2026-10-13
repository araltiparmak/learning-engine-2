const AMBER = '#f59e0b'
const AMBER_SOFT = '#fbbf24'

function Motif({ motif }: { motif: string }) {
  const stroke = {
    stroke: AMBER,
    strokeWidth: 7,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (motif) {
    case 'lupe': // magnifying glass
      return (
        <g {...stroke}>
          <circle cx="-14" cy="-14" r="30" />
          <line x1="8" y1="8" x2="34" y2="34" />
        </g>
      )
    case 'frage': // question mark
      return (
        <g {...stroke}>
          <path d="M -20 -18 A 20 20 0 1 1 6 2 L 6 14" />
          <circle cx="6" cy="30" r="1.5" fill={AMBER} stroke="none" />
        </g>
      )
    case 'juwel': // jewel
      return (
        <g {...stroke}>
          <path d="M -24 -8 L -12 -24 L 12 -24 L 24 -8 L 0 26 Z" />
          <path d="M -24 -8 L 24 -8 M -12 -24 L 0 -8 L 12 -24 M 0 -8 L 0 26" strokeWidth="4" />
        </g>
      )
    case 'schluessel': // key
      return (
        <g {...stroke}>
          <circle cx="-18" cy="-18" r="16" />
          <line x1="-7" y1="-7" x2="26" y2="26" />
          <line x1="18" y1="18" x2="26" y2="10" />
          <line x1="26" y1="26" x2="34" y2="18" />
        </g>
      )
    case 'karte': // map pin
      return (
        <g {...stroke}>
          <path d="M 0 30 C -22 4 -22 -10 -22 -14 A 22 22 0 1 1 22 -14 C 22 -10 22 4 0 30 Z" />
          <circle cx="0" cy="-14" r="7" fill={AMBER} stroke="none" />
        </g>
      )
    case 'uhr': // clock
      return (
        <g {...stroke}>
          <circle cx="0" cy="0" r="30" />
          <line x1="0" y1="0" x2="0" y2="-18" />
          <line x1="0" y1="0" x2="14" y2="8" />
        </g>
      )
    case 'maske': // domino mask
      return (
        <g {...stroke}>
          <path d="M -34 -6 C -34 -20 -18 -20 -6 -14 C -2 -12 2 -12 6 -14 C 18 -20 34 -20 34 -6 C 34 12 18 18 8 8 C 2 2 -2 2 -8 8 C -18 18 -34 12 -34 -6 Z" />
          <circle cx="-16" cy="-2" r="5" fill={AMBER} stroke="none" />
          <circle cx="16" cy="-2" r="5" fill={AMBER} stroke="none" />
        </g>
      )
    case 'notiz': // notebook
      return (
        <g {...stroke}>
          <rect x="-24" y="-30" width="48" height="60" rx="4" />
          <line x1="-14" y1="-14" x2="14" y2="-14" strokeWidth="4" />
          <line x1="-14" y1="0" x2="14" y2="0" strokeWidth="4" />
          <line x1="-14" y1="14" x2="6" y2="14" strokeWidth="4" />
        </g>
      )
    case 'waage': // scales
      return (
        <g {...stroke}>
          <line x1="0" y1="-30" x2="0" y2="26" />
          <line x1="-28" y1="-22" x2="28" y2="-22" />
          <path d="M -28 -22 L -38 -2 L -18 -2 Z" strokeWidth="4" />
          <path d="M 28 -22 L 18 -2 L 38 -2 Z" strokeWidth="4" />
          <line x1="-14" y1="26" x2="14" y2="26" />
        </g>
      )
    case 'klammer': // sentence bracket [ ]
      return (
        <g {...stroke} strokeWidth="8">
          <path d="M -14 -30 L -30 -30 L -30 30 L -14 30" />
          <path d="M 14 -30 L 30 -30 L 30 30 L 14 30" />
          <circle cx="0" cy="0" r="4" fill={AMBER} stroke="none" />
        </g>
      )
    case 'phantombild': // composite sketch — the description
      return (
        <g {...stroke}>
          <rect x="-26" y="-32" width="52" height="64" rx="4" />
          <path d="M -14 -14 C -14 -24 14 -24 14 -14 L 14 -2 C 14 10 -14 10 -14 -2 Z" strokeWidth="4" />
          <circle cx="-6" cy="-12" r="2.5" fill={AMBER} stroke="none" />
          <circle cx="6" cy="-12" r="2.5" fill={AMBER} stroke="none" />
          <line x1="-16" y1="20" x2="16" y2="20" strokeWidth="4" />
        </g>
      )
    case 'brieftasche': // wallet — ownership
      return (
        <g {...stroke}>
          <rect x="-30" y="-18" width="60" height="38" rx="5" />
          <path d="M -30 -6 L 30 -6" strokeWidth="4" />
          <circle cx="16" cy="7" r="4" fill={AMBER} stroke="none" />
        </g>
      )
    case 'kalender': // calendar — dates and timetables
      return (
        <g {...stroke}>
          <rect x="-28" y="-24" width="56" height="52" rx="4" />
          <line x1="-28" y1="-10" x2="28" y2="-10" strokeWidth="4" />
          <line x1="-16" y1="-32" x2="-16" y2="-18" />
          <line x1="16" y1="-32" x2="16" y2="-18" />
          <circle cx="-10" cy="6" r="3" fill={AMBER} stroke="none" />
          <circle cx="4" cy="6" r="3" fill={AMBER} stroke="none" />
          <circle cx="18" cy="6" r="3" fill={AMBER} stroke="none" />
          <circle cx="-10" cy="18" r="3" fill={AMBER} stroke="none" />
        </g>
      )
    case 'lampe': // interrogation lamp
      return (
        <g {...stroke}>
          <line x1="0" y1="-34" x2="0" y2="-20" />
          <path d="M -20 -20 L 20 -20 L 12 -4 L -12 -4 Z" />
          <path d="M -22 6 L -14 22 M 0 8 L 0 26 M 22 6 L 14 22" strokeWidth="4" opacity="0.7" />
        </g>
      )
    case 'ziel': // target board — intent and plan
      return (
        <g {...stroke}>
          <circle cx="0" cy="0" r="30" />
          <circle cx="0" cy="0" r="17" strokeWidth="4" />
          <circle cx="0" cy="0" r="4" fill={AMBER} stroke="none" />
          <line x1="14" y1="-14" x2="36" y2="-36" strokeWidth="4" />
        </g>
      )
    case 'route': // escape route
      return (
        <g {...stroke}>
          <path d="M -34 22 C -14 22 -18 -8 2 -8 C 20 -8 16 -26 34 -26" strokeDasharray="9 8" />
          <circle cx="-34" cy="22" r="5" fill={AMBER} stroke="none" />
          <path d="M 24 -33 L 34 -26 L 24 -19" strokeWidth="6" />
        </g>
      )
    default:
      return (
        <g {...stroke}>
          <circle cx="0" cy="0" r="26" />
        </g>
      )
  }
}

function CaseScene({ motif, className = '' }: { motif: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 180"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="spot" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="180" rx="12" fill="url(#spot)" />
      {/* folded file corner */}
      <path d="M 0 12 Q 0 0 12 0 L 120 0 L 132 16 L 388 16 Q 400 16 400 28 L 400 168 Q 400 180 388 180 L 12 180 Q 0 180 0 168 Z" fill="none" />
      <path d="M 12 0 L 120 0 L 132 16 L 12 16 Z" fill={AMBER} opacity="0.9" />
      {/* light ring */}
      <circle cx="200" cy="92" r="58" fill="none" stroke={AMBER_SOFT} strokeWidth="2" opacity="0.35" />
      {/* scattered clue dots */}
      <circle cx="60" cy="120" r="3" fill={AMBER} opacity="0.5" />
      <circle cx="340" cy="60" r="3" fill={AMBER} opacity="0.5" />
      <circle cx="330" cy="130" r="2" fill={AMBER} opacity="0.4" />
      <g transform="translate(200 92)">
        <Motif motif={motif} />
      </g>
    </svg>
  )
}

export default CaseScene
