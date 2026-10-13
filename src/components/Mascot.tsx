export type Mood =
  | 'happy'
  | 'teach'
  | 'celebrate'
  | 'sleep'
  | 'run'
  | 'drive'
  | 'fly'
  | 'eat'
  | 'drink'
  | 'speak'
  | 'study'
  | 'work'
  | 'wave'
  | 'wake'
  | 'look'
  | 'science'

const dark = '#431407'

function Mascot({
  mood = 'happy',
  className = 'w-24',
}: {
  mood?: Mood
  className?: string
}) {
  const openMouth = mood === 'celebrate' || mood === 'eat' || mood === 'speak'

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {/* ears */}
      <path d="M30 44 L20 8 L54 27 Z" fill="#ea580c" />
      <path d="M90 44 L100 8 L66 27 Z" fill="#ea580c" />
      <path d="M32 37 L26 16 L46 27 Z" fill="#7c2d12" />
      <path d="M88 37 L94 16 L74 27 Z" fill="#7c2d12" />
      {/* head */}
      <path
        d="M60 112 C36 108 14 90 15 62 C16 38 36 24 60 24 C84 24 104 38 105 62 C106 90 84 108 60 112 Z"
        fill="#f97316"
      />
      {/* white muzzle patches */}
      <ellipse cx="44" cy="86" rx="19" ry="15" fill="#fff7ed" />
      <ellipse cx="76" cy="86" rx="19" ry="15" fill="#fff7ed" />
      {/* cheeks */}
      <circle cx="25" cy="74" r="5" fill="#fdba74" />
      <circle cx="95" cy="74" r="5" fill="#fdba74" />

      {/* eyes */}
      {mood === 'celebrate' && (
        <g stroke={dark} strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M33 62 Q40 54 47 62" />
          <path d="M73 62 Q80 54 87 62" />
        </g>
      )}
      {mood === 'sleep' && (
        <g stroke={dark} strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M33 60 Q40 66 47 60" />
          <path d="M73 60 Q80 66 87 60" />
        </g>
      )}
      {mood === 'wake' && (
        <g>
          <circle cx="40" cy="61" r="7.5" fill="#fff" stroke={dark} strokeWidth="2" />
          <circle cx="80" cy="61" r="7.5" fill="#fff" stroke={dark} strokeWidth="2" />
          <circle cx="40" cy="61" r="3.5" fill={dark} />
          <circle cx="80" cy="61" r="3.5" fill={dark} />
        </g>
      )}
      {mood === 'look' && (
        <g>
          <circle cx="43" cy="58" r="5.5" fill={dark} />
          <circle cx="83" cy="58" r="5.5" fill={dark} />
          <circle cx="45" cy="56" r="1.8" fill="#fff" />
          <circle cx="85" cy="56" r="1.8" fill="#fff" />
        </g>
      )}
      {mood !== 'celebrate' && mood !== 'sleep' && mood !== 'wake' && mood !== 'look' && (
        <g>
          <circle cx="40" cy="61" r="5.5" fill={dark} />
          <circle cx="80" cy="61" r="5.5" fill={dark} />
          <circle cx="42" cy="59" r="1.8" fill="#fff" />
          <circle cx="82" cy="59" r="1.8" fill="#fff" />
        </g>
      )}
      {mood === 'teach' && (
        <g stroke={dark} strokeWidth="3" fill="none">
          <circle cx="40" cy="61" r="11" />
          <circle cx="80" cy="61" r="11" />
          <path d="M51 61 L69 61" />
          <path d="M29 61 L20 56" />
          <path d="M91 61 L100 56" />
        </g>
      )}

      {/* nose */}
      <ellipse cx="60" cy="81" rx="7" ry="5.5" fill={dark} />

      {/* mouth */}
      {openMouth ? (
        <path d="M48 92 Q60 106 72 92 Q60 97 48 92 Z" fill={dark} />
      ) : mood === 'sleep' ? (
        <path d="M54 95 Q60 99 66 95" stroke={dark} strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M49 93 Q60 102 71 93" stroke={dark} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}

      {/* pose accessories */}
      {mood === 'celebrate' && (
        <g>
          <path d="M60 2 L46 28 L74 28 Z" fill="#3b82f6" />
          <circle cx="60" cy="4" r="4.5" fill="#f43f5e" />
        </g>
      )}
      {mood === 'sleep' && (
        <g>
          <path d="M34 24 Q56 2 90 10 L96 24 Q68 16 40 31 Z" fill="#3b82f6" />
          <circle cx="97" cy="22" r="5" fill="#fff" />
          <text x="98" y="46" fontSize="16" fill="#94a3b8" fontFamily="sans-serif">z</text>
          <text x="107" y="34" fontSize="12" fill="#cbd5e1" fontFamily="sans-serif">z</text>
        </g>
      )}
      {mood === 'run' && (
        <g>
          <path d="M30 40 Q60 30 90 40 L90 47 Q60 37 30 47 Z" fill="#ef4444" />
          <g stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round">
            <path d="M2 44 H16" />
            <path d="M0 60 H14" />
            <path d="M2 76 H16" />
          </g>
        </g>
      )}
      {mood === 'drive' && (
        <g>
          <circle cx="60" cy="114" r="20" fill="none" stroke="#334155" strokeWidth="6" />
          <circle cx="42" cy="106" r="7" fill="#ea580c" />
          <circle cx="78" cy="106" r="7" fill="#ea580c" />
        </g>
      )}
      {mood === 'fly' && (
        <g>
          <path d="M4 24 L34 12 L22 34 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M2 40 Q10 36 16 40" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M0 30 Q6 27 10 30" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {mood === 'eat' && (
        <g>
          <circle cx="91" cy="99" r="9" fill="#d97706" />
          <circle cx="88" cy="96" r="1.5" fill="#78350f" />
          <circle cx="94" cy="100" r="1.5" fill="#78350f" />
          <circle cx="90" cy="103" r="1.5" fill="#78350f" />
          <circle cx="99" cy="107" r="6" fill="#ea580c" />
        </g>
      )}
      {mood === 'drink' && (
        <g>
          <rect x="80" y="90" width="22" height="20" rx="3" fill="#fff" stroke="#334155" strokeWidth="2.5" />
          <path d="M102 94 Q112 98 102 105" fill="none" stroke="#334155" strokeWidth="2.5" />
          <path d="M87 84 Q89 78 87 73" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M95 84 Q97 78 95 73" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="77" cy="105" r="6" fill="#ea580c" />
        </g>
      )}
      {mood === 'speak' && (
        <g>
          <rect x="74" y="4" width="44" height="24" rx="9" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
          <path d="M84 27 L80 38 L94 27 Z" fill="#fff" />
          <text
            x="96"
            y="20"
            fontSize="11"
            fontFamily="sans-serif"
            fontWeight="bold"
            fill={dark}
            textAnchor="middle"
          >
            Hallo!
          </text>
        </g>
      )}
      {mood === 'study' && (
        <g>
          <path d="M60 4 L94 17 L60 30 L26 17 Z" fill="#1f2937" />
          <path d="M78 23 V36" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="78" cy="39" r="3" fill="#fbbf24" />
        </g>
      )}
      {mood === 'work' && (
        <g>
          <path d="M80 94 V90 Q80 87 84 87 H88 Q92 87 92 90 V94" fill="none" stroke="#92400e" strokeWidth="3" />
          <rect x="72" y="94" width="28" height="20" rx="3" fill="#92400e" />
          <rect x="72" y="101" width="28" height="3" fill="#78350f" />
        </g>
      )}
      {mood === 'wave' && (
        <g>
          <ellipse cx="104" cy="72" rx="8" ry="10" fill="#ea580c" transform="rotate(20 104 72)" />
          <path d="M112 56 Q118 63 114 71" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M117 48 Q125 59 119 73" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {mood === 'wake' && (
        <g>
          <circle cx="100" cy="18" r="11" fill="#fff" stroke={dark} strokeWidth="2.5" />
          <path d="M100 11 V18 L105 21" stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M92 9 L88 5" stroke={dark} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M108 9 L112 5" stroke={dark} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {mood === 'look' && (
        <g>
          <ellipse cx="103" cy="26" rx="7" ry="6" fill="#3b82f6" />
          <circle cx="110" cy="19" r="4.5" fill="#3b82f6" />
          <path d="M114 19 L120 21 L114 23 Z" fill="#f59e0b" />
          <circle cx="111" cy="18" r="1.2" fill="#fff" />
        </g>
      )}
      {mood === 'science' && (
        <g>
          <path d="M29 57 L14 52" stroke={dark} strokeWidth="3" />
          <path d="M91 57 L106 52" stroke={dark} strokeWidth="3" />
          <circle cx="40" cy="61" r="11" fill="#bae6fd" fillOpacity="0.55" stroke={dark} strokeWidth="3" />
          <circle cx="80" cy="61" r="11" fill="#bae6fd" fillOpacity="0.55" stroke={dark} strokeWidth="3" />
          <path d="M51 61 L69 61" stroke={dark} strokeWidth="3" fill="none" />
          <rect x="100" y="80" width="7" height="10" fill="#94a3b8" />
          <path d="M98 90 L92 104 Q91 108 95 108 H112 Q116 108 115 104 L109 90 Z" fill="#c084fc" stroke="#7e22ce" strokeWidth="1.5" />
          <circle cx="104" cy="75" r="2" fill="#c084fc" />
          <circle cx="108" cy="69" r="1.5" fill="#c084fc" />
        </g>
      )}
    </svg>
  )
}

export default Mascot
