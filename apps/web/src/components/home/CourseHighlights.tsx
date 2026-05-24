import Link from 'next/link'
import BookDemoButton from '@/components/BookDemoButton'
import { formatCurrency } from '@amuzic/shared'
import { ArrowRight } from 'lucide-react'

const COURSES = [
  {
    slug: 'keyboard',
    number: '01',
    name: 'Keyboard',
    tagline: 'Build harmonic foundations',
    description: 'From basic chords to classical compositions. Perfect for beginners of all ages.',
    fee: 1500,
  },
  {
    slug: 'guitar',
    number: '02',
    name: 'Guitar',
    tagline: 'Strum your way to mastery',
    description: 'Acoustic & rhythm guitar. Learn the songs you love while building real technique.',
    fee: 1500,
  },
  {
    slug: 'drums',
    number: '03',
    name: 'Drums',
    tagline: 'Feel the rhythm in your bones',
    description: 'Groove, fills, and full kit control. Develop timing, coordination, and power.',
    fee: 1800,
  },
  {
    slug: 'vocals',
    number: '04',
    name: 'Vocals',
    tagline: 'Unlock the voice within',
    description: 'Breathing, pitch, range, and performance. Sing with confidence and control.',
    fee: 1500,
  },
]

export default function CourseHighlights() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <p className="section-label mb-3">Our Courses</p>
            <h2 className="section-title">Four Paths to<br />Musical Excellence</h2>
          </div>
          <p className="font-body text-ink/50 text-sm leading-relaxed max-w-xs">
            Every course is taught by professional musicians with a structured, level-based curriculum.
          </p>
        </div>

        {/* Course grid — gap-px creates hairline dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/10">
          {COURSES.map((course) => (
            <div
              key={course.slug}
              className="bg-cream p-8 flex flex-col group hover:bg-cream-dark transition-colors duration-300"
            >
              <span className="font-heading italic text-5xl text-gold/60 mb-6 leading-none">
                {course.number}
              </span>
              <h3 className="font-heading text-2xl font-semibold text-ink mb-1">{course.name}</h3>
              <p className="font-body text-xs text-burgundy tracking-[0.1em] uppercase mb-4">
                {course.tagline}
              </p>
              <p className="font-body text-sm text-ink/55 leading-relaxed mb-8 flex-1">
                {course.description}
              </p>
              <div className="border-t border-ink/10 pt-5 space-y-4">
                <div>
                  <p className="font-heading italic text-2xl text-ink">{formatCurrency(course.fee)}</p>
                  <p className="font-body text-xs text-ink/35 mt-0.5">per month</p>
                </div>
                <div className="flex flex-col gap-2">
                  <BookDemoButton
                    course={course.slug}
                    className="btn-primary text-xs w-full justify-center py-2.5"
                  />
                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-body text-ink/50
                               hover:text-burgundy hover:gap-3 transition-all duration-200"
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
