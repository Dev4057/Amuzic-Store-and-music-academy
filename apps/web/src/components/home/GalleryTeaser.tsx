import Link from 'next/link'
import { Play, ArrowRight } from 'lucide-react'

const PLACEHOLDERS = [
  { label: 'Annual Recital 2024', sub: 'December 2024', bg: 'bg-burgundy', light: false },
  { label: 'Guitar Workshop', sub: 'All levels welcome', bg: 'bg-ink', light: false },
  { label: 'Junior Performers', sub: 'Ages 5–12', bg: 'bg-gold/20 border border-gold/30', light: true },
  { label: 'Vocal Showcase', sub: 'Solo performances', bg: 'bg-cream border border-ink/12', light: true },
]

export default function GalleryTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-6">
          <div>
            <p className="section-label mb-3">Student Showcase</p>
            <h2 className="section-title">Real Students,<br />Real Progress</h2>
          </div>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 font-body text-sm text-burgundy
                       hover:gap-4 transition-all duration-200 shrink-0"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PLACEHOLDERS.map((p) => (
            <div
              key={p.label}
              className={`${p.bg} rounded-sm aspect-[3/4] flex flex-col justify-between p-6
                          group cursor-pointer hover:opacity-90 transition-opacity duration-200`}
            >
              <div className="self-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              </div>
              <div>
                <p className={`font-heading text-lg leading-tight ${p.light ? 'text-ink' : 'text-cream'}`}>
                  {p.label}
                </p>
                <p className={`font-body text-xs mt-0.5 ${p.light ? 'text-ink/50' : 'text-cream/50'}`}>
                  {p.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
