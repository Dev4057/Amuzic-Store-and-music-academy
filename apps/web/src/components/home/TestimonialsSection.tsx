const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Kothrud',
    text: 'My 8-year-old daughter has been learning keyboard here for 6 months and her progress is remarkable. Gopal sir has a magical way of making learning fun. We drive from Kothrud every week — absolutely worth it.',
    course: 'Keyboard',
  },
  {
    name: 'Rahul Desai',
    location: 'Baner',
    text: 'I wanted to learn guitar as an adult and was worried I\'d started too late. The team here proved me completely wrong. Within 3 months I was playing songs I love. Best decision I made this year.',
    course: 'Guitar',
  },
  {
    name: 'Sneha Patil',
    location: 'Bavdhan',
    text: 'Jay sir\'s drum classes are incredible. My son (12) is obsessed with music now, and he\'s become more disciplined in his studies too. Music does something to the mind.',
    course: 'Drums',
  },
  {
    name: 'Anita Kulkarni',
    location: 'Pashan',
    text: 'I had stage fright my whole life. The vocal training helped me find my voice — literally and figuratively. I performed at our housing society event last month and people couldn\'t believe the change.',
    course: 'Vocals',
  },
]

export default function TestimonialsSection() {
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
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-cream border border-ink/8 rounded-sm p-8
                         hover:shadow-[0_4px_24px_rgba(44,24,16,0.07)] transition-shadow duration-300"
            >
              {/* Decorative open-quote */}
              <div className="font-heading italic text-7xl text-gold/25 leading-none select-none mb-1">
                &ldquo;
              </div>

              <p className="font-body text-sm text-ink/60 leading-relaxed mb-7 italic">
                {t.text}
              </p>

              <div className="flex items-center justify-between border-t border-ink/8 pt-5">
                <div>
                  <p className="font-body font-medium text-ink text-sm">{t.name}</p>
                  <p className="font-body text-xs text-ink/35 mt-0.5">{t.location}</p>
                </div>
                <span className="font-body text-xs text-burgundy border border-burgundy/20 px-3 py-1 rounded-full tracking-wide">
                  {t.course}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
