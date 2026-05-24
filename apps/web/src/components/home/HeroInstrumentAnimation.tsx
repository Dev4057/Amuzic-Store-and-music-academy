'use client'

import { useState, useEffect } from 'react'

const ANIM_STYLES = `
  @keyframes instr-enter {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes note-float {
    0%   { opacity: 0;    transform: translateY(0)      rotate(-8deg); }
    12%  { opacity: 0.7; }
    85%  { opacity: 0.45; }
    100% { opacity: 0;    transform: translateY(-150px) rotate(12deg); }
  }
  @keyframes ring-pulse {
    0%, 100% { transform: scale(0.9);  opacity: 0.06; }
    50%      { transform: scale(1.08); opacity: 0.025; }
  }
`

const FLOATING_NOTES = [
  { g: '♩', x: '9%',  b: '12%', sz: 14, dur: 4.2, dl: 0.0 },
  { g: '♪', x: '22%', b: '28%', sz: 18, dur: 3.8, dl: 1.1 },
  { g: '♫', x: '40%', b: '8%',  sz: 22, dur: 5.1, dl: 2.3 },
  { g: '♬', x: '58%', b: '32%', sz: 15, dur: 4.6, dl: 0.6 },
  { g: '♩', x: '68%', b: '6%',  sz: 19, dur: 3.5, dl: 1.8 },
  { g: '♪', x: '80%', b: '22%', sz: 14, dur: 4.9, dl: 0.3 },
  { g: '♫', x: '88%', b: '38%', sz: 16, dur: 3.7, dl: 2.7 },
  { g: '♬', x: '50%', b: '48%', sz: 12, dur: 5.3, dl: 1.4 },
]

// ── Instrument SVGs ──────────────────────────────────────────────────────────

function KeyboardSVG() {
  const c = '#2C1810'
  const g = '#C9A040'
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <rect x="8" y="28" width="264" height="132" rx="10" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.03" />
      <rect x="8" y="28" width="264" height="50" rx="10" fill={c} fillOpacity="0.06" />
      <text x="82" y="58" fontFamily="Georgia,serif" fontStyle="italic" fontSize="12" fill={c} fillOpacity="0.22">AMUZIC</text>
      <rect x="128" y="36" width="82" height="30" rx="4" stroke={c} strokeWidth="0.8" fill={g} fillOpacity="0.12" />
      <text x="169" y="56" textAnchor="middle" fontSize="9" fill={g} fillOpacity="0.65" fontFamily="monospace">♩ = 120 BPM</text>
      <circle cx="34" cy="52" r="10" stroke={c} strokeWidth="1" fill="none" />
      <circle cx="34" cy="52" r="3"  fill={c} fillOpacity="0.18" />
      <circle cx="58" cy="52" r="10" stroke={c} strokeWidth="1" fill="none" />
      <circle cx="58" cy="52" r="3"  fill={c} fillOpacity="0.18" />
      <circle cx="228" cy="52" r="3.5" fill={g} fillOpacity="0.9" />
      <circle cx="240" cy="52" r="3.5" fill={g} fillOpacity="0.38" />
      <circle cx="252" cy="52" r="3.5" fill={c} fillOpacity="0.14" />
      <rect x="12" y="84" width="256" height="68" rx="4" fill={c} fillOpacity="0.02" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={14 + i * 31} y={86} width={30} height={64} rx="3" stroke={c} strokeWidth="1" fill="none" />
      ))}
      {[0, 1, 3, 4, 5].map((i) => (
        <rect key={i} x={14 + i * 31 + 20} y={86} width={18} height={38} rx="2" fill={c} fillOpacity="0.58" />
      ))}
    </svg>
  )
}

function GuitarSVG() {
  const c = '#2C1810'
  const g = '#C9A040'
  const strings = [69, 71.4, 73.8, 76.2, 78.6, 81]
  return (
    <svg viewBox="0 0 160 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <path d="M67 8 Q67 4 80 4 Q93 4 93 8 L93 52 L67 52 Z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.07" />
      {[14, 27, 40].map((y) => (
        <g key={y}>
          <rect x="50" y={y} width="18" height="9" rx="4.5" stroke={c} strokeWidth="1" fill="none" />
          <circle cx="50" cy={y + 4.5} r="2.8" fill={c} fillOpacity="0.28" />
          <rect x="92" y={y} width="18" height="9" rx="4.5" stroke={c} strokeWidth="1" fill="none" />
          <circle cx="110" cy={y + 4.5} r="2.8" fill={c} fillOpacity="0.28" />
        </g>
      ))}
      <line x1="67" y1="52" x2="93" y2="52" stroke={c} strokeWidth="2.5" />
      <rect x="67" y="52" width="26" height="125" fill={c} fillOpacity="0.04" stroke={c} strokeWidth="1.2" />
      {[14, 26, 38, 52, 67, 83, 100, 116].map((dy) => (
        <line key={dy} x1="67" y1={52 + dy} x2="93" y2={52 + dy} stroke={c} strokeWidth="0.7" strokeOpacity="0.42" />
      ))}
      <circle cx="80" cy="105" r="2.5" fill={c} fillOpacity="0.32" />
      <circle cx="80" cy="137" r="2.5" fill={c} fillOpacity="0.32" />
      <path
        d="M80,177 C90,177 110,182 116,194 C122,206 112,218 108,226 C104,234 118,246 124,260 C130,274 120,292 80,292 C40,292 30,274 36,260 C42,246 56,234 52,226 C48,218 38,206 44,194 C50,182 70,177 80,177 Z"
        stroke={c} strokeWidth="1.8" fill={c} fillOpacity="0.05"
      />
      <circle cx="80" cy="240" r="20" stroke={g} strokeWidth="1.5" fill="none" />
      <circle cx="80" cy="240" r="14" stroke={c} strokeWidth="0.5" strokeOpacity="0.22" fill="none" />
      <circle cx="80" cy="240" r="7"  stroke={c} strokeWidth="0.5" strokeOpacity="0.14" fill="none" />
      <rect x="70" y="271" width="20" height="7" rx="1.5" fill={c} fillOpacity="0.28" stroke={c} strokeWidth="1" />
      <circle cx="80" cy="289" r="3" stroke={c} strokeWidth="1" fill="none" />
      {strings.map((x, i) => (
        <line key={i} x1={x} y1={52} x2={x} y2={275} stroke={c} strokeWidth={0.32 + i * 0.06} strokeOpacity="0.48" />
      ))}
    </svg>
  )
}

function DrumsSVG() {
  const c = '#2C1810'
  const g = '#C9A040'
  return (
    <svg viewBox="0 0 290 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <line x1="48" y1="238" x2="52" y2="90" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <line x1="28" y1="238" x2="52" y2="90" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <ellipse cx="52" cy="83"  rx="34" ry="6" stroke={g} strokeWidth="1.5" fill="none" />
      <ellipse cx="52" cy="90"  rx="34" ry="6" stroke={g} strokeWidth="1.5" fill="none" />
      <ellipse cx="78" cy="162" rx="42" ry="12" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.05" />
      <line x1="36"  y1="162" x2="36"  y2="175" stroke={c} strokeWidth="1.5" />
      <line x1="120" y1="162" x2="120" y2="175" stroke={c} strokeWidth="1.5" />
      <ellipse cx="78" cy="175" rx="42" ry="12" stroke={c} strokeWidth="1.5" fill="none" />
      {[-12, -6, 0, 6, 12].map((dx) => (
        <line key={dx} x1={78 + dx} y1="174" x2={78 + dx} y2="178" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
      ))}
      <line x1="46"  y1="187" x2="30"  y2="238" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <line x1="110" y1="187" x2="126" y2="238" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <ellipse cx="170" cy="192" rx="72" ry="58" stroke={c} strokeWidth="1.8" fill={c} fillOpacity="0.04" />
      <ellipse cx="170" cy="192" rx="58" ry="46" stroke={c} strokeWidth="0.7" strokeOpacity="0.22" fill="none" />
      <ellipse cx="170" cy="192" rx="32" ry="26" stroke={g} strokeWidth="1" fill="none" strokeOpacity="0.52" />
      <line x1="98"  y1="192" x2="98"  y2="238" stroke={c} strokeWidth="1.2" strokeOpacity="0.28" />
      <line x1="242" y1="192" x2="242" y2="238" stroke={c} strokeWidth="1.2" strokeOpacity="0.28" />
      <path d="M125 238 L132 212 L140 218 L133 238 Z" stroke={c} strokeWidth="1" fill="none" strokeOpacity="0.42" />
      <ellipse cx="160" cy="106" rx="38" ry="12" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.06" />
      <line x1="122" y1="106" x2="122" y2="118" stroke={c} strokeWidth="1.5" />
      <line x1="198" y1="106" x2="198" y2="118" stroke={c} strokeWidth="1.5" />
      <ellipse cx="160" cy="118" rx="38" ry="12" stroke={c} strokeWidth="1.5" fill="none" />
      <line x1="160" y1="118" x2="160" y2="148" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <circle cx="160" cy="148" r="3" fill={c} fillOpacity="0.18" />
      <ellipse cx="240" cy="62" rx="32" ry="5" stroke={g} strokeWidth="1.4" fill="none" transform="rotate(-12 240 62)" />
      <line x1="248" y1="67" x2="260" y2="200" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <line x1="275" y1="238" x2="260" y2="200" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <ellipse cx="248" cy="172" rx="30" ry="10" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.06" />
      <line x1="218" y1="172" x2="218" y2="184" stroke={c} strokeWidth="1.5" />
      <line x1="278" y1="172" x2="278" y2="184" stroke={c} strokeWidth="1.5" />
      <ellipse cx="248" cy="184" rx="30" ry="10" stroke={c} strokeWidth="1.5" fill="none" />
      <line x1="223" y1="184" x2="218" y2="220" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
      <line x1="273" y1="184" x2="278" y2="220" stroke={c} strokeWidth="1" strokeOpacity="0.28" />
    </svg>
  )
}

function VocalsSVG() {
  const c = '#2C1810'
  const g = '#C9A040'
  return (
    <svg viewBox="0 0 160 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <rect x="42" y="18" width="76" height="88" rx="38" stroke={c} strokeWidth="1.8" fill={c} fillOpacity="0.05" />
      {[34, 46, 58, 70, 82, 94].map((y) => {
        const hw = y <= 46 || y >= 82 ? 28 : y === 34 || y === 94 ? 22 : 34
        return <line key={y} x1={80 - hw} y1={y} x2={80 + hw} y2={y} stroke={c} strokeWidth="0.8" strokeOpacity="0.28" />
      })}
      <ellipse cx="80" cy="58" rx="22" ry="26" stroke={g} strokeWidth="1" fill="none" strokeOpacity="0.55" />
      <circle cx="80" cy="58" r="8" fill={g} fillOpacity="0.18" stroke={g} strokeWidth="0.8" />
      <rect x="40" y="104" width="80" height="10" rx="3" fill={c} fillOpacity="0.16" stroke={c} strokeWidth="1.2" />
      <path d="M44,114 L48,190 L112,190 L116,114 Z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.04" />
      <line x1="48" y1="140" x2="112" y2="140" stroke={c} strokeWidth="0.6" strokeOpacity="0.18" />
      <line x1="48" y1="165" x2="112" y2="165" stroke={c} strokeWidth="0.6" strokeOpacity="0.18" />
      <rect x="60" y="190" width="40" height="78" rx="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.04" />
      {[200, 210, 220, 230, 240, 250, 260].map((y) => (
        <line key={y} x1="61" y1={y} x2="99" y2={y} stroke={c} strokeWidth="0.5" strokeOpacity="0.13" />
      ))}
      <rect x="65" y="268" width="30" height="14" rx="3" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <circle cx="73" cy="275" r="2" fill={c} fillOpacity="0.38" />
      <circle cx="80" cy="275" r="2" fill={c} fillOpacity="0.38" />
      <circle cx="87" cy="275" r="2" fill={c} fillOpacity="0.38" />
      <path d="M28,28 Q16,58 28,88"   stroke={c} strokeWidth="1.2" strokeOpacity="0.32" fill="none" />
      <path d="M18,16 Q2,58 18,100"   stroke={c} strokeWidth="1"   strokeOpacity="0.14" fill="none" />
      <path d="M132,28 Q144,58 132,88" stroke={c} strokeWidth="1.2" strokeOpacity="0.32" fill="none" />
      <path d="M142,16 Q158,58 142,100" stroke={c} strokeWidth="1"   strokeOpacity="0.14" fill="none" />
    </svg>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

interface Instrument {
  id: string
  name: string
  tagline: string
  svg: React.ReactNode
  dispW: number
  dispH: number
}

const INSTRUMENTS: Instrument[] = [
  { id: 'keyboard', name: 'Keyboard', tagline: 'Classical to contemporary', svg: <KeyboardSVG />, dispW: 270, dispH: 175 },
  { id: 'guitar',   name: 'Guitar',   tagline: 'Acoustic & electric',       svg: <GuitarSVG />,   dispW: 118, dispH: 230 },
  { id: 'drums',    name: 'Drums',    tagline: 'Rhythm & groove',           svg: <DrumsSVG />,    dispW: 255, dispH: 210 },
  { id: 'vocals',   name: 'Vocals',   tagline: 'Find your voice',           svg: <VocalsSVG />,   dispW: 118, dispH: 230 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroInstrumentAnimation() {
  const [current, setCurrent] = useState(0)
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % INSTRUMENTS.length)
      setRenderKey((k) => k + 1)
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const instr = INSTRUMENTS[current]

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none py-14 px-8">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: ANIM_STYLES }} />

      {/* Pulse rings */}
      <div
        className="absolute rounded-full border border-ink/[0.07] pointer-events-none"
        style={{ width: 320, height: 320, animation: 'ring-pulse 3s ease-in-out infinite' }}
      />
      <div
        className="absolute rounded-full border border-ink/[0.04] pointer-events-none"
        style={{ width: 480, height: 480, animation: 'ring-pulse 3s ease-in-out 0.9s infinite' }}
      />

      {/* Staff lines */}
      {[-20, -10, 0, 10, 20].map((dy) => (
        <div
          key={dy}
          className="absolute inset-x-0 h-px bg-ink pointer-events-none"
          style={{ top: `calc(50% + ${dy}px)`, opacity: 0.04 }}
        />
      ))}

      {/* Floating notes */}
      {FLOATING_NOTES.map((n, i) => (
        <div
          key={i}
          className="absolute font-heading text-ink pointer-events-none"
          style={{
            left: n.x,
            bottom: n.b,
            fontSize: n.sz,
            animation: `note-float ${n.dur}s ease-in-out ${n.dl}s infinite`,
          }}
        >
          {n.g}
        </div>
      ))}

      {/* Instrument + label */}
      <div
        key={renderKey}
        className="relative z-10 flex flex-col items-center gap-8 w-full"
        style={{ animation: 'instr-enter 0.55s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* SVG wrapper — fixed height container so layout doesn't shift */}
        <div className="flex items-center justify-center" style={{ height: 240 }}>
          <div style={{ width: instr.dispW, maxHeight: instr.dispH }}>
            {instr.svg}
          </div>
        </div>

        {/* Name & tagline */}
        <div className="text-center">
          <p className="text-ink/25 uppercase tracking-[0.28em] text-[10px] font-body mb-2">Now Teaching</p>
          <h2 className="font-heading italic text-ink text-[52px] leading-none">{instr.name}</h2>
          <p className="text-ink/38 font-body text-sm mt-3 tracking-wide">{instr.tagline}</p>
        </div>
      </div>

      {/* Dot nav */}
      <div className="absolute bottom-8 flex items-center gap-3">
        {INSTRUMENTS.map((inst, i) => (
          <button
            key={inst.id}
            onClick={() => { setCurrent(i); setRenderKey((k) => k + 1) }}
            aria-label={`Show ${inst.name}`}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i === current ? 22 : 6,
              height:     6,
              background: i === current ? '#C9A040' : 'rgba(44,24,16,0.22)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
