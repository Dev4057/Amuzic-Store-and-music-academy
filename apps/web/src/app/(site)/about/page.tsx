import type { Metadata } from 'next'
import BookDemoButton from '@/components/BookDemoButton'
import { Target, Heart, Users, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Amuzic Academy — Bavdhan, Pune',
  description:
    'Learn about Amuzic Academy, its director Mr. Amol Naik, and the teachers who have been shaping musical journeys in Bavdhan, Pune since 2015.',
}

const VALUES = [
  {
    Icon: Target,
    title: 'Structure Matters',
    body: 'A student who learns randomly will progress randomly. We believe in methodical, level-based progression that gives every student clarity about where they are and where they\'re going.',
  },
  {
    Icon: Heart,
    title: 'Joy is Non-Negotiable',
    body: 'Discipline without joy produces students who quit. We work hard to make every class something students look forward to — even when the material is difficult.',
  },
  {
    Icon: Users,
    title: 'Every Student is Different',
    body: 'A child needs patient, playful teaching. An adult needs clear explanations and respect for their time. A senior needs encouragement and a safe space to make mistakes. We adapt.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-cream">

      {/* Hero */}
      <div className="bg-ink text-cream py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="section-label text-gold mb-4">Our Story</p>
          <h1 className="font-heading font-light italic text-5xl md:text-6xl text-cream leading-tight mb-5">
            About Amuzic Academy
          </h1>
          <p className="font-body text-cream/55 text-base leading-relaxed max-w-xl">
            A music school built on a simple belief: every person who wants to make music deserves the chance to.
          </p>
        </div>
      </div>

      {/* Founder story */}
      <div className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="flex items-start gap-5 mb-10">
            <div className="w-14 h-14 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
              <span className="font-heading italic text-xl text-cream">A</span>
            </div>
            <div className="pt-1">
              <h2 className="font-heading text-2xl font-semibold text-ink">Mr. Amol Naik</h2>
              <p className="font-body text-xs text-burgundy tracking-[0.12em] uppercase mt-0.5">
                Founder &amp; Director
              </p>
            </div>
          </div>

          <div className="space-y-5 font-body text-sm text-ink/60 leading-relaxed">
            <p>
              Amuzic Academy was born from a personal conviction: that music education in India is too often reserved for those with the right family connections, the right geography, or the right budget. Mr. Amol Naik founded the academy at Bakaji Corner, Bavdhan, with the intention of making world-class music education accessible to everyone in Pune&apos;s western suburbs — from young children to retirees, from complete beginners to students who&apos;ve been self-teaching for years.
            </p>
            <p>
              What started as a small space with two students and a single keyboard has grown into a thriving community of over 500 alumni, four courses, and a team of dedicated musicians-turned-teachers who believe — as Mr. Naik does — that the job of a music teacher is not just to teach notes, but to change lives.
            </p>
            <p>
              The academy is deliberately located in Bavdhan to serve the growing residential communities across the area — families from Pashan, Baner, Aundh, Kothrud, and Wakad make the journey every week because they&apos;ve seen what structured music education does for their children and themselves.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 bg-cream-dark">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="section-label mb-3">Our Philosophy</p>
          <h2 className="section-title mb-12">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VALUES.map(({ Icon, title, body }) => (
              <div key={title} className="card p-8">
                <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center mb-5">
                  <Icon className="w-4 h-4 text-burgundy" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-ink mb-2">{title}</h3>
                <p className="font-body text-sm text-ink/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teaching team */}
      <div className="py-20 bg-ink text-cream">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="text-xs font-body font-medium tracking-[0.2em] uppercase text-gold mb-3">
            The Faculty
          </p>
          <h2 className="font-heading text-4xl font-semibold text-cream mb-12">Our Teaching Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {[
              {
                name: 'Gopal',
                initials: 'G',
                role: 'Keyboard & Guitar',
                experience: '12+ years',
                bio: 'A classically trained musician with deep roots in both Western and Carnatic traditions. Gopal\'s calm, encouraging teaching style has made him the favourite teacher of parents and students alike. He has a particular gift for working with young children and adults returning to music after a long gap.',
                specializations: ['Classical Piano', 'Rhythm Guitar', 'Carnatic Fusion', 'Music Theory', 'Beginners'],
              },
              {
                name: 'Jay Nawale',
                initials: 'J',
                role: 'Drums & Percussion',
                experience: '8+ years',
                bio: 'Jay brings the energy and authenticity of real live performance to every lesson. He has played with local bands across Pune and brings that experience into the classroom — teaching students not just how to drum, but how to play with others, listen, and hold the beat that everyone else leans on.',
                specializations: ['Rock Drumming', 'Jazz Percussion', 'Bollywood Rhythms', 'Ensemble Playing', 'Advanced Students'],
              },
            ].map((teacher) => (
              <div key={teacher.name} className="border border-cream/10 rounded-sm p-8 hover:border-cream/20 transition-colors">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                    <span className="font-heading italic text-lg text-cream">{teacher.initials}</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-heading text-xl font-semibold text-cream">{teacher.name}</h3>
                    <p className="font-body text-xs text-gold tracking-[0.1em] uppercase mt-0.5">{teacher.role}</p>
                    <p className="font-body text-xs text-cream/35 mt-0.5">{teacher.experience} teaching</p>
                  </div>
                </div>
                <p className="font-body text-sm text-cream/50 leading-relaxed mb-5">{teacher.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {teacher.specializations.map((s) => (
                    <span key={s} className="text-xs font-body text-cream/45 border border-cream/10 px-3 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-cream-dark text-center">
        <div className="max-w-lg mx-auto px-6">
          <h2 className="font-heading font-light italic text-4xl text-ink mb-4">Come Meet Us</h2>
          <p className="font-body text-ink/55 text-sm mb-8 leading-relaxed">
            The best way to understand Amuzic Academy is to visit. Your first demo class is free and entirely without obligation.
          </p>
          <BookDemoButton className="btn-primary px-8 py-3.5">
            Book Free Demo <ArrowRight className="w-4 h-4" />
          </BookDemoButton>
        </div>
      </div>
    </div>
  )
}
