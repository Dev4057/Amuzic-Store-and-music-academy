import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const TEACHERS = [
  {
    name: 'Gopal',
    initials: 'G',
    role: 'Keyboard & Guitar',
    experience: '12+ years',
    bio: 'A classically trained musician with deep roots in Western and Carnatic traditions. Gopal\'s calm, encouraging teaching style has made him the favourite of parents and students alike. He has a particular gift for working with young children and adults returning to music.',
    specializations: ['Classical Piano', 'Rhythm Guitar', 'Music Theory', 'Carnatic Fusion'],
  },
  {
    name: 'Jay Nawale',
    initials: 'J',
    role: 'Drums & Percussion',
    experience: '8+ years',
    bio: 'Jay brings the energy of real live performance to every lesson. He has played with local bands across Pune, teaching students not just how to drum — but how to hold the beat that everyone else leans on.',
    specializations: ['Rock Drumming', 'Jazz Percussion', 'Groove & Fills', 'Sight Reading'],
  },
  {
    name: 'Mrs. Manisha',
    initials: 'M',
    role: 'Vocals',
    experience: '10+ years',
    bio: 'Mrs. Manisha brings warmth and precision to every vocal lesson. Her training spans classical and contemporary styles, and her patient, nurturing approach has helped students of all ages find their voice and build genuine confidence.',
    specializations: ['Classical Vocals', 'Bollywood Singing', 'Breath & Tone', 'Beginners'],
  },
]

export default function TeachersSection() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        <div className="mb-16">
          <p className="section-label mb-3">The Faculty</p>
          <h2 className="section-title">Meet Your<br />Teachers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEACHERS.map((teacher) => (
            <div
              key={teacher.name}
              className="border border-ink/10 rounded-sm p-10 hover:border-burgundy/25
                         hover:shadow-[0_8px_40px_rgba(44,24,16,0.06)] transition-all duration-300"
            >
              <div className="flex items-start gap-6 mb-7">
                <div className="w-14 h-14 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                  <span className="font-heading italic text-xl text-cream">{teacher.initials}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-heading text-2xl font-semibold text-ink">{teacher.name}</h3>
                  <p className="font-body text-xs text-gold tracking-[0.12em] uppercase mt-0.5">
                    {teacher.role}
                  </p>
                  <p className="font-body text-xs text-ink/35 mt-0.5">{teacher.experience} teaching</p>
                </div>
              </div>

              <p className="font-body text-sm text-ink/55 leading-relaxed mb-6">{teacher.bio}</p>

              <div className="flex flex-wrap gap-2">
                {teacher.specializations.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-body text-ink/50 border border-ink/12 px-3 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 font-body text-sm text-burgundy
                       hover:gap-4 transition-all duration-200"
          >
            More about our team <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
