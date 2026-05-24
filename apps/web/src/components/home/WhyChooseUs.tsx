import { GraduationCap, BookOpen, Users, MapPin, Theater, LayoutGrid } from 'lucide-react'

const FEATURES = [
  {
    Icon: GraduationCap,
    title: 'Expert Teachers',
    description: 'Trained musicians with real performance experience — not just theory.',
  },
  {
    Icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'Level-based learning. You always know where you stand and where you\'re headed.',
  },
  {
    Icon: Users,
    title: 'All Age Groups',
    description: 'Classes for children (5+), adults, and seniors. Never too early or too late.',
  },
  {
    Icon: MapPin,
    title: 'Convenient Location',
    description: 'Bakaji Corner, Bavdhan — accessible from Kothrud, Baner, Pashan, and Aundh.',
  },
  {
    Icon: Theater,
    title: 'Performance Opportunities',
    description: 'Annual recitals and community concerts. Students learn to perform, not just practice.',
  },
  {
    Icon: LayoutGrid,
    title: 'Small Batch Sizes',
    description: 'Maximum 8 students per batch. Personal attention guaranteed in every class.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-24 lg:py-32 bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 lg:gap-24">

          {/* Left — sticky heading */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-body font-medium tracking-[0.2em] uppercase text-gold mb-4">
              Why Amuzic
            </p>
            <h2 className="font-heading font-light italic text-4xl md:text-5xl text-cream leading-tight mb-6">
              Why Choose<br />Amuzic Academy?
            </h2>
            <div className="w-12 h-px bg-gold mb-6" />
            <p className="font-body text-cream/45 text-sm leading-relaxed">
              We&apos;re not just a music school. We&apos;re a community of musicians, students, and families who believe in the transformative power of music.
            </p>
          </div>

          {/* Right — feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-cream/8">
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="bg-ink p-8 hover:bg-[#3D2318] transition-colors duration-300"
              >
                <Icon className="w-5 h-5 text-gold mb-5" strokeWidth={1.5} />
                <h3 className="font-heading text-xl font-semibold text-cream mb-2">{title}</h3>
                <p className="font-body text-sm text-cream/45 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
