const FALLBACK_TESTIMONIALS = [
  {
    id: '1',
    name: 'Priya Kulkarni',
    role: 'Parent of keyboard student',
    quote: 'My daughter has been learning keyboard at Amuzic for 8 months. The transformation is remarkable — she is more focused, more patient, and performs at every family gathering now.',
    course: 'keyboard',
    rating: 5,
  },
  {
    id: '2',
    name: 'Rahul Deshmukh',
    role: 'Software Engineer, learning guitar',
    quote: 'I started guitar at 34, thinking it was too late. The teachers proved me completely wrong. After 6 months I can play 10 songs. The best stress relief after a long day of meetings.',
    course: 'guitar',
    rating: 5,
  },
  {
    id: '3',
    name: 'Sudha Joshi',
    role: 'Retired teacher, learning vocals',
    quote: 'I fulfilled my lifelong dream of learning music after retirement. The teachers are so patient and encouraging. Amuzic Academy truly believes music is for everyone.',
    course: 'vocals',
    rating: 5,
  },
  {
    id: '4',
    name: 'Sneha Patil',
    role: 'Parent of drums student',
    quote: "My son's drum classes have been incredible. He's become more disciplined and focused. Music does something wonderful to the mind.",
    course: 'drums',
    rating: 5,
  },
]

interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  course?: string | null
  rating: number
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
    const res = await fetch(`${apiUrl}/api/testimonials`, { next: { revalidate: 3600 } })
    if (!res.ok) return FALLBACK_TESTIMONIALS
    const json = await res.json() as { data?: Testimonial[] }
    return json.data && json.data.length > 0 ? json.data : FALLBACK_TESTIMONIALS
  } catch {
    return FALLBACK_TESTIMONIALS
  }
}

export default async function TestimonialsSection() {
  const testimonials = await fetchTestimonials()

  return (
    <section className="py-24 lg:py-32 bg-cream-dark">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <p className="section-label mb-3">Testimonials</p>
            <h2 className="section-title">What Our<br />Students Say</h2>
          </div>
          <p className="font-body text-ink/45 text-sm max-w-xs leading-relaxed">
            From Bavdhan to Baner — music changes lives. These are their words.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-cream border border-ink/8 rounded-sm p-8
                         hover:shadow-[0_4px_24px_rgba(44,24,16,0.07)] transition-shadow duration-300"
            >
              <div className="font-heading italic text-7xl text-gold/25 leading-none select-none mb-1">
                &ldquo;
              </div>

              <p className="font-body text-sm text-ink/60 leading-relaxed mb-7 italic">
                {t.quote}
              </p>

              <div className="flex items-center justify-between border-t border-ink/8 pt-5">
                <div>
                  <p className="font-body font-medium text-ink text-sm">{t.name}</p>
                  <p className="font-body text-xs text-ink/35 mt-0.5">{t.role}</p>
                </div>
                {t.course && (
                  <span className="font-body text-xs text-burgundy border border-burgundy/20 px-3 py-1 rounded-full tracking-wide capitalize">
                    {t.course}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
