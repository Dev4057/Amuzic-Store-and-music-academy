import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BookDemoButton from '@/components/BookDemoButton'
import { getCourseBySlug, getAllCourseSlugs } from '@/lib/courseData'
import { formatCurrency } from '@amuzic/shared'
import { Check, MessageCircle } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseBySlug(params.slug)
  if (!course) return {}
  return {
    title: `${course.name} Classes in Bavdhan, Pune`,
    description: `${course.description} Learn ${course.name.toLowerCase()} at Amuzic Academy, Bakaji Corner, Bavdhan, Pune. ${formatCurrency(course.fee)}/month.`,
  }
}

export default function CourseDetailPage({ params }: Props) {
  const course = getCourseBySlug(params.slug)
  if (!course) notFound()

  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-ink text-cream py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="text-xs font-body font-medium tracking-[0.2em] uppercase text-gold mb-4">
            Course Details
          </p>
          <h1 className="font-heading font-light italic text-5xl md:text-6xl text-cream leading-tight mb-2">
            {course.name}
          </h1>
          <p className="font-body text-cream/50 text-base mb-8">{course.tagline}</p>

          <div className="flex flex-wrap gap-10 text-sm font-body border-t border-cream/10 pt-6">
            <div>
              <p className="text-cream/40 text-xs uppercase tracking-wide mb-1">Monthly Fee</p>
              <p className="font-heading italic text-2xl text-cream">{formatCurrency(course.fee)}</p>
            </div>
            <div>
              <p className="text-cream/40 text-xs uppercase tracking-wide mb-1">Admission Fee</p>
              <p className="font-heading italic text-2xl text-cream">{formatCurrency(course.admissionFee)}</p>
            </div>
            <div>
              <p className="text-cream/40 text-xs uppercase tracking-wide mb-1">Curriculum</p>
              <p className="font-heading italic text-2xl text-cream">{course.duration} Months</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            <div className="card p-7">
              <h2 className="font-heading text-xl font-semibold text-ink mb-3">About This Course</h2>
              <p className="font-body text-sm text-ink/55 leading-relaxed">{course.longDescription}</p>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-xl font-semibold text-ink mb-5">Curriculum</h2>
              <div className="space-y-0">
                {course.levels.map((level, i) => (
                  <div key={level.name} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-burgundy text-cream text-xs flex items-center justify-center font-body font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      {i < course.levels.length - 1 && (
                        <div className="w-px flex-1 bg-ink/10 mt-1 mb-1" />
                      )}
                    </div>
                    <div className="pb-5 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-body font-semibold text-ink text-sm">{level.name}</h3>
                        <span className="text-xs text-ink/35 font-body">{level.duration}</span>
                      </div>
                      <p className="text-xs text-ink/50 font-body leading-relaxed">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-xl font-semibold text-ink mb-4">What You&apos;ll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.whatYouLearn.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-body text-ink/60">
                    <Check className="w-3.5 h-3.5 text-burgundy flex-shrink-0" strokeWidth={2.5} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-xl font-semibold text-ink mb-4">Frequently Asked Questions</h2>
              <div className="space-y-5 divide-y divide-ink/8">
                {course.faq.map((item) => (
                  <div key={item.q} className="pt-5 first:pt-0">
                    <p className="font-body font-semibold text-sm text-ink mb-1.5">{item.q}</p>
                    <p className="font-body text-sm text-ink/50 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* CTA */}
            <div className="card p-6 sticky top-20">
              <p className="font-heading text-lg font-semibold text-ink text-center mb-1">Ready to start?</p>
              <p className="text-xs text-ink/40 font-body text-center mb-5">First demo class is free</p>
              <BookDemoButton course={course.slug} className="btn-primary w-full justify-center mb-3" />
              <a
                href="https://wa.me/918975916381"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full justify-center text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Ask on WhatsApp
              </a>
              <div className="mt-5 pt-5 border-t border-ink/8 space-y-2">
                {[
                  `Structured ${course.duration}-month curriculum`,
                  'Small batches (max 8 students)',
                  'No joining fee for first demo',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-body text-ink/45">
                    <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher */}
            <div className="card p-6">
              <h3 className="font-heading text-base font-semibold text-ink mb-4">Your Teacher</h3>
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                  <span className="font-heading italic text-lg text-cream">{course.teacherInitials}</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-ink">{course.teacher}</p>
                  <p className="text-xs text-gold font-body tracking-wide mt-0.5">{course.name} Teacher</p>
                </div>
              </div>
              <p className="text-xs text-ink/50 font-body leading-relaxed">{course.teacherBio}</p>
            </div>

            {/* Who is it for */}
            <div className="card p-6">
              <h3 className="font-heading text-base font-semibold text-ink mb-4">Who Is This For?</h3>
              <ul className="space-y-2.5">
                {course.whoIsItFor.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs font-body text-ink/55">
                    <Check className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
