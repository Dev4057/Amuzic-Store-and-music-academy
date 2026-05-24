import Link from 'next/link'
import { MapPin } from 'lucide-react'
import HeroInstrumentAnimation from './HeroInstrumentAnimation'

export default function HeroSection() {
  return (
    <section className="bg-cream overflow-hidden">
      <div className="w-full min-h-[92vh] flex flex-col lg:grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_500px]">

        {/* ── Left: editorial text ─────────────────────────────────── */}
        <div className="flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 py-24 lg:py-0">
          <div className="max-w-xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-10">
              <span className="w-10 h-px bg-gold flex-shrink-0" />
              <span className="section-label flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Bakaji Corner, Bavdhan, Pune
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-heading font-light italic text-6xl sm:text-7xl lg:text-8xl xl:text-[100px] leading-[0.88] tracking-tight text-ink mb-12">
              The Art<br />
              of Music,<br />
              <span className="text-burgundy">Taught Well.</span>
            </h1>

            {/* Gold rule */}
            <div className="w-20 h-px bg-gold mb-10" />

            {/* Description + CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-8 mb-16">
              <p className="font-body text-ink/55 text-base leading-relaxed max-w-xs">
                Professional music education for all ages — keyboard, guitar, drums &amp; vocals.
                Taught by working musicians who genuinely care.
              </p>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link href="/book-demo" className="btn-primary px-8 py-3.5">
                  Book Free Demo
                </Link>
                <Link href="/courses" className="btn-outline px-8 py-3.5">
                  Explore Courses
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10 pt-8 border-t border-ink/10">
              {[
                ['500+', 'Students Trained'],
                ['10+',  'Years Teaching'],
                ['4',    'Instruments'],
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="font-heading italic text-4xl lg:text-5xl text-gold">{num}</p>
                  <p className="font-body text-xs text-ink/45 mt-1 tracking-wide uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: animated instrument panel ─────────────────────── */}
        <div className="hidden lg:flex min-h-[92vh] lg:-translate-y-16 xl:-translate-y-20">
          <HeroInstrumentAnimation />
        </div>

      </div>
    </section>
  )
}
