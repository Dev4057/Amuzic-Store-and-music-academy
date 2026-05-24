import type { Metadata } from 'next'
import BookDemoButton from '@/components/BookDemoButton'
import { Brain, Calculator, Dumbbell, Heart, Theater, Infinity, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why Music? The Science & Soul of Musical Education',
  description:
    'Discover why learning music transforms children and adults alike — from brain development and emotional intelligence to discipline and joy. The science is clear. The stories are undeniable.',
}

const BENEFITS = [
  {
    Icon: Brain,
    title: 'Music Rewires the Brain',
    body: 'Decades of neuroscience research show that learning a musical instrument creates new neural pathways and strengthens connections between brain hemispheres. Children who study music develop superior working memory, spatial reasoning, and language processing. A child who learns to read sheet music is simultaneously learning to read, calculate, and coordinate — it\'s the closest thing to a complete brain workout available to a young person.',
  },
  {
    Icon: Calculator,
    title: 'Mathematics You Can Hear',
    body: 'Music is mathematics made tangible. Rhythm is fractions. Scales are geometric patterns. Harmony is physics. Students who study music consistently outperform their peers in mathematics — not because music teachers drill numbers, but because musical training builds the precise kind of pattern recognition and logical thinking that mathematics demands.',
  },
  {
    Icon: Dumbbell,
    title: 'Discipline Without Dread',
    body: 'Learning an instrument is one of the few activities where effort has an immediate, audible reward. A child who practises a scale correctly can hear the improvement the very next day. This creates a healthy relationship with effort and delayed gratification — perhaps the most valuable life skill a young person can develop.',
  },
  {
    Icon: Heart,
    title: 'Emotional Intelligence',
    body: 'Music is, fundamentally, the language of emotion. Students who learn to perform music — to express joy, sadness, tension, and resolution through an instrument — develop a remarkably sophisticated emotional vocabulary. They become better listeners. They understand that communication is not just about words.',
  },
  {
    Icon: Theater,
    title: 'Confidence on Stage and Off',
    body: 'Performing music in front of others is one of the most powerful confidence-building experiences available. Students who participate in our annual recitals learn to manage nerves, project presence, and recover gracefully from mistakes. These skills transfer directly to school presentations and every other situation that requires standing up and being seen.',
  },
  {
    Icon: Infinity,
    title: 'A Gift That Never Expires',
    body: 'Every other skill you teach a child has a shelf life. The ability to write code becomes obsolete. Academic knowledge fades. But the ability to sit at a piano or pick up a guitar and fill a room with music — that never leaves. Our oldest student is 67. She started learning keyboards at 60 and says it\'s the thing she\'s proudest of in her life.',
  },
]

const STATS = [
  { value: '40%', label: 'higher verbal memory in music students vs. non-musicians (Hong Kong study, 2003)' },
  { value: '3×', label: 'more likely to stay in school through graduation (Brookings Institution research)' },
  { value: '57%', label: 'of music learners report significantly reduced stress and anxiety (BAPAM, 2019)' },
  { value: '15 IQ pts', label: 'average gain in children who received music lessons vs. control groups (Toronto study)' },
]

export default function WhyMusicPage() {
  return (
    <div className="bg-cream">

      {/* Hero */}
      <div className="bg-ink text-cream py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <p className="text-xs font-body font-medium tracking-[0.2em] uppercase text-gold mb-6">
            The Research
          </p>
          <h1 className="font-heading font-light italic text-5xl md:text-6xl lg:text-7xl text-cream leading-[0.9] mb-7">
            Why Music?
          </h1>
          <p className="font-body text-cream/55 text-base leading-relaxed max-w-2xl">
            Every parent wants their child to be confident, disciplined, creative, and happy. Music education is one of the most well-researched paths to all four — and it happens to be deeply joyful along the way.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-cream-dark py-12 border-b border-ink/8">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.value}>
                <p className="font-heading italic text-3xl md:text-4xl text-burgundy mb-1">{s.value}</p>
                <p className="font-body text-xs text-ink/45 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-24 lg:py-32 bg-cream">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="mb-16">
            <p className="section-label mb-3">The Evidence</p>
            <h2 className="section-title">Six Reasons the Research<br />Is Unambiguous</h2>
            <p className="section-subtitle">These aren&apos;t opinions. They&apos;re decades of evidence.</p>
          </div>

          <div className="space-y-0 divide-y divide-ink/8">
            {BENEFITS.map(({ Icon, title, body }, i) => (
              <div
                key={title}
                className={`py-10 grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 ${i % 2 === 1 ? 'md:grid-cols-[1fr_80px]' : ''}`}
              >
                {i % 2 === 1 ? (
                  <>
                    <div className="md:order-1">
                      <h3 className="font-heading text-2xl font-semibold text-ink mb-3">{title}</h3>
                      <p className="font-body text-sm text-ink/55 leading-relaxed">{body}</p>
                    </div>
                    <div className="md:order-2 flex md:justify-end md:items-start pt-1">
                      <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-burgundy" strokeWidth={1.5} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start pt-1">
                      <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-burgundy" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-semibold text-ink mb-3">{title}</h3>
                      <p className="font-body text-sm text-ink/55 leading-relaxed">{body}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pull quote */}
      <div className="bg-cream-dark py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <div className="font-heading italic text-8xl text-gold/25 leading-none select-none mb-2">
            &ldquo;
          </div>
          <blockquote className="font-heading italic text-2xl md:text-3xl text-ink font-light leading-snug mb-6">
            My son failed his class 6 maths exam. Six months after starting drum lessons, he topped his class. His teacher asked what changed. I said: rhythm.
          </blockquote>
          <p className="font-body text-ink/40 text-sm">— Parent of a student, Pashan</p>
        </div>
      </div>

      {/* It's never too late */}
      <div className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <p className="section-label mb-4">For adults too</p>
          <h2 className="font-heading text-3xl font-semibold text-ink mb-8">It&apos;s Never Too Late</h2>
          <div className="space-y-5 font-body text-sm text-ink/55 leading-relaxed">
            <p>
              The myth that music must be learned in childhood is one of the most persistent — and damaging — beliefs about musical education. The adult brain is not a lesser learner; it is a different learner. Adults bring qualities that children lack: discipline, self-motivation, clear goals, and the ability to understand why they are learning something.
            </p>
            <p>
              Many of our most committed and rapidly-progressing students are adults in their 30s, 40s, and 50s who finally decided to learn the instrument they always wanted to. They practice more consistently than children. They ask better questions. And they experience the joy of musical discovery with a depth that only lived experience can bring.
            </p>
            <p>
              If you&apos;ve been waiting for the &ldquo;right time&rdquo; to start — you&apos;re reading this at the right time. Come for a free demo class. Bring your children. Come alone. Just come, and let us show you what music can do.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-burgundy text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(201,160,64,0.15), transparent 55%)' }}
        />
        <div className="relative max-w-xl mx-auto px-6">
          <h2 className="font-heading font-light italic text-4xl text-cream mb-4">
            Ready to Experience It Yourself?
          </h2>
          <p className="font-body text-cream/55 text-sm mb-8 leading-relaxed">
            Your first demo class is completely free. No registration fees, no pressure, no commitment.
          </p>
          <BookDemoButton className="btn-gold px-8 py-3.5">
            Book Free Demo <ArrowRight className="w-4 h-4" />
          </BookDemoButton>
        </div>
      </div>
    </div>
  )
}
