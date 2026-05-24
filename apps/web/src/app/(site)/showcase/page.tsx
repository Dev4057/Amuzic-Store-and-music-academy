import type { Metadata } from 'next'
import type { ShowcaseVideo } from '@amuzic/shared'
import VideoCard from '@/components/VideoCard'
import BookDemoButton from '@/components/BookDemoButton'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Student Showcase — Performances & Progress',
  description:
    'Watch Amuzic Academy students perform — keyboard, guitar, drums, and vocals. Real students, real progress, from Bavdhan, Pune.',
}

async function getShowcaseVideos(): Promise<ShowcaseVideo[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/showcase`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.videos ?? []
  } catch {
    return []
  }
}

export default async function ShowcasePage() {
  const videos = await getShowcaseVideos()

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-ink text-cream py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-xs font-body font-medium tracking-[0.2em] uppercase text-gold mb-4">Real students</p>
          <h1 className="font-heading font-light italic text-5xl md:text-6xl text-cream leading-tight mb-3">
            Student Showcase
          </h1>
          <p className="font-body text-cream/45 text-base max-w-md leading-relaxed">
            Every student you see here started exactly where you are now. This is what a few months of dedication looks like.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 mb-16">

            {/* Row 1: Large hero + portrait */}
            <div className="grid grid-cols-12 gap-4">

              {/* Annual Recital — hero card */}
              <div className="col-span-12 md:col-span-7 bg-ink rounded-sm p-10 min-h-[320px] relative overflow-hidden flex flex-col justify-between">
                <span className="absolute inset-0 flex items-center justify-end pr-12 font-heading italic text-[220px] text-cream/[0.035] leading-none select-none pointer-events-none">
                  ♫
                </span>
                <div className="relative">
                  <p className="text-xs text-gold uppercase tracking-[0.25em] font-body mb-4">Annual Recital</p>
                  <h3 className="font-heading font-light italic text-4xl text-cream leading-tight">
                    December 2024
                  </h3>
                  <p className="font-body text-sm text-cream/35 mt-3 leading-relaxed max-w-xs">
                    Every student on stage. Every family in the front row. Our annual celebration of musical progress.
                  </p>
                </div>
                <div className="relative flex flex-wrap gap-2">
                  {['Keyboard', 'Guitar', 'Drums', 'Vocals'].map((c) => (
                    <span key={c} className="text-xs font-body text-cream/25 border border-cream/10 px-3 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Junior Performers — portrait */}
              <div className="col-span-12 md:col-span-5 bg-burgundy rounded-sm p-8 min-h-[320px] relative overflow-hidden flex flex-col justify-between">
                <span className="absolute bottom-4 right-4 font-heading italic text-[130px] text-cream/[0.07] leading-none select-none pointer-events-none">
                  ♪
                </span>
                <div className="relative">
                  <p className="text-xs text-gold uppercase tracking-[0.25em] font-body mb-4">Junior Performers</p>
                  <h3 className="font-heading font-light italic text-3xl text-cream leading-tight">
                    Ages 5–12
                  </h3>
                  <p className="font-body text-sm text-cream/40 mt-3 leading-relaxed">
                    Where tiny hands make big music. Our youngest stars take the stage.
                  </p>
                </div>
                <div className="relative">
                  <p className="font-heading italic text-6xl text-cream/15 leading-none">28</p>
                  <p className="font-body text-xs text-cream/30 uppercase tracking-wider mt-1">Students performed</p>
                </div>
              </div>
            </div>

            {/* Row 2: Three equal cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Guitar Workshop */}
              <div className="bg-cream-dark border border-ink/8 rounded-sm p-7 min-h-[210px] relative overflow-hidden flex flex-col justify-between">
                <span className="absolute -bottom-3 -right-1 font-heading text-[110px] text-ink/[0.04] leading-none select-none pointer-events-none">
                  ♩
                </span>
                <div>
                  <p className="text-xs text-burgundy uppercase tracking-[0.2em] font-body mb-2">Guitar Workshop</p>
                  <h3 className="font-heading text-xl font-semibold text-ink">Open to All Levels</h3>
                  <p className="font-body text-xs text-ink/40 mt-2 leading-relaxed">
                    Strumming, fingerpicking, chord theory — one afternoon.
                  </p>
                </div>
                <p className="font-body text-xs text-ink/25 font-medium uppercase tracking-wider">Every quarter</p>
              </div>

              {/* Vocal Showcase */}
              <div className="bg-gold/10 border border-gold/25 rounded-sm p-7 min-h-[210px] relative overflow-hidden flex flex-col justify-between">
                <span className="absolute -bottom-3 -right-1 font-heading text-[110px] text-gold/[0.15] leading-none select-none pointer-events-none">
                  ♬
                </span>
                <div>
                  <p className="text-xs text-ink/40 uppercase tracking-[0.2em] font-body mb-2">Vocal Showcase</p>
                  <h3 className="font-heading text-xl font-semibold text-ink">Solo Performances</h3>
                  <p className="font-body text-xs text-ink/40 mt-2 leading-relaxed">
                    Hindustani, Bollywood, and Western — voices in full bloom.
                  </p>
                </div>
                <p className="font-body text-xs text-ink/25 font-medium uppercase tracking-wider">Twice yearly</p>
              </div>

              {/* Drum Clinic */}
              <div className="bg-ink rounded-sm p-7 min-h-[210px] relative overflow-hidden flex flex-col justify-between">
                <span className="absolute -bottom-3 -right-1 font-heading text-[110px] text-cream/[0.06] leading-none select-none pointer-events-none">
                  ♭
                </span>
                <div>
                  <p className="text-xs text-gold uppercase tracking-[0.2em] font-body mb-2">Drum Clinic</p>
                  <h3 className="font-heading font-light italic text-xl text-cream">Advanced Students</h3>
                  <p className="font-body text-xs text-cream/35 mt-2 leading-relaxed">
                    Speed, precision, groove — the full spectrum of percussive skill.
                  </p>
                </div>
                <p className="font-body text-xs text-cream/20 font-medium uppercase tracking-wider">Annual event</p>
              </div>
            </div>

            {/* Row 3: Full-width keyboard recital band */}
            <div className="bg-cream border border-ink/8 rounded-sm p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-shrink-0">
                  <span className="font-heading italic text-8xl text-burgundy/15 leading-none select-none">♮</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-burgundy uppercase tracking-[0.2em] font-body mb-1">Keyboard Recital</p>
                  <h3 className="font-heading text-2xl font-semibold text-ink">All Levels Welcome</h3>
                  <p className="font-body text-sm text-ink/45 mt-1 leading-relaxed">
                    From first-month foundation students to advanced composers — all sharing the same stage.
                  </p>
                </div>
                <div className="flex-shrink-0 sm:text-right">
                  <p className="font-heading italic text-6xl text-ink/8 leading-none select-none">2025</p>
                  <p className="font-body text-xs text-ink/30 uppercase tracking-wider mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 bg-cream-dark border border-ink/8 rounded-sm p-10 md:p-14 text-center">
          <h2 className="font-heading font-light italic text-3xl md:text-4xl text-ink mb-3">
            Your child could be on this page next year.
          </h2>
          <p className="font-body text-ink/50 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Every showcase performer started with a free demo class. It takes one step to begin.
          </p>
          <BookDemoButton className="btn-primary px-8 py-3.5">
            Book Free Demo <ArrowRight className="w-4 h-4" />
          </BookDemoButton>
        </div>
      </div>
    </div>
  )
}
