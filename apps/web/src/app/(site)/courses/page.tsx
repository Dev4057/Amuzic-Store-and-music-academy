import type { Metadata } from 'next'
import Link from 'next/link'
import BookDemoButton from '@/components/BookDemoButton'
import { formatCurrency } from '@amuzic/shared'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Music Courses',
  description:
    'Explore keyboard, guitar, drums and vocal courses at Amuzic Academy, Bavdhan, Pune. Structured curriculum, expert teachers, all age groups.',
}

const COURSES = [
  {
    slug: 'keyboard',
    number: '01',
    name: 'Keyboard',
    tagline: 'Build harmonic foundations — from first chords to classical compositions',
    description:
      'Our keyboard program is ideal for absolute beginners and intermediate players alike. Students progress through scales, chords, sight-reading, and eventually full compositions. Children as young as 5 have enrolled and thrived.',
    fee: 1500,
    duration: 12,
    highlights: ['Basic to advanced theory', 'Carnatic & Western fusion', 'Digital & acoustic keyboard', 'Solo performance training'],
  },
  {
    slug: 'guitar',
    number: '02',
    name: 'Guitar',
    tagline: 'Strum your way to mastery — acoustic rhythm and lead guitar',
    description:
      'Learn rhythm patterns, chord transitions, fingerpicking, and eventually lead guitar. We focus on songs students actually want to play — Bollywood, rock, pop — while building solid technique.',
    fee: 1500,
    duration: 12,
    highlights: ['Open & barre chords', 'Strumming patterns', 'Popular song repertoire', 'Bollywood & Western styles'],
  },
  {
    slug: 'drums',
    number: '03',
    name: 'Drums',
    tagline: 'Feel the rhythm in your bones — coordination, groove, and power',
    description:
      'Drumming builds coordination, focus, and a deep sense of rhythm. Jay\'s classes cover basic rudiments, groove patterns, fills, and full-song performance. An excellent outlet for high-energy students.',
    fee: 1800,
    duration: 12,
    highlights: ['Rudiments & technique', 'Rock, pop & jazz styles', 'Coordination exercises', 'Band performance practice'],
  },
  {
    slug: 'vocals',
    number: '04',
    name: 'Vocals',
    tagline: 'Unlock the voice within — pitch, range, and stage confidence',
    description:
      'Vocal training goes beyond just singing. Students learn breathing techniques, pitch control, range expansion, and performance confidence. For those who want to sing better — or simply stop being afraid to.',
    fee: 1500,
    duration: 12,
    highlights: ['Breathing & posture', 'Pitch & range training', 'Hindi & English songs', 'Stage confidence building'],
  },
]

export default function CoursesPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-cream border-b border-ink/8 py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="section-label mb-3">What we teach</p>
          <h1 className="section-title mb-3">Our Courses</h1>
          <p className="section-subtitle">Four instruments. One world-class academy. Serving Bavdhan, Kothrud, Baner &amp; beyond.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-14 space-y-5">
        {COURSES.map((course) => (
          <div key={course.slug} className="card border-l-2 border-l-burgundy p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">

              {/* Number */}
              <div className="flex-shrink-0">
                <span className="font-heading italic text-5xl text-gold/50">{course.number}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold text-ink">{course.name}</h2>
                    <p className="text-xs text-burgundy font-body tracking-[0.1em] uppercase mt-0.5">{course.tagline}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="font-heading italic text-2xl text-ink">
                      {formatCurrency(course.fee)}
                      <span className="text-sm font-body font-normal text-ink/40 not-italic">/mo</span>
                    </div>
                    <div className="text-xs text-ink/35 font-body">{course.duration} month curriculum</div>
                  </div>
                </div>

                <p className="text-sm text-ink/55 font-body leading-relaxed mb-4">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {course.highlights.map((h) => (
                    <span key={h} className="text-xs font-body text-ink/50 border border-ink/12 px-3 py-1 rounded-full">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <BookDemoButton course={course.slug} className="btn-primary text-xs px-5 py-2.5" />
                  <Link href={`/courses/${course.slug}`} className="btn-outline text-xs px-5 py-2.5">
                    Full Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
