import type { Metadata } from 'next'
import { Suspense } from 'react'
import DemoBookingForm from '@/components/DemoBookingForm'
import { MapPin, Phone, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Book a Free Demo Class',
  description:
    'Book your free demo music class at Amuzic Academy, Bavdhan, Pune. Keyboard, guitar, drums and vocals. No commitment — just music.',
}

const INFO = [
  { Icon: MapPin, title: 'Bakaji Corner, Bavdhan', sub: 'Pune, Maharashtra 411021' },
  { Icon: Phone, title: '+91 89759 16381', sub: 'Call or WhatsApp' },
  { Icon: Clock, title: 'Mon–Sat, 9am–8pm', sub: 'Sunday by appointment' },
]

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-cream-dark py-20">
      <div className="max-w-xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="section-label mb-3">Free demo</p>
          <h1 className="font-heading font-light italic text-4xl md:text-5xl text-ink mb-3">
            Book Your Free Demo Class
          </h1>
          <p className="font-body text-ink/50 text-sm leading-relaxed">
            Come experience Amuzic Academy — no payment, no pressure. Just music.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8">
          <Suspense fallback={<div className="h-96 animate-pulse bg-cream rounded" />}>
            <DemoBookingForm />
          </Suspense>
        </div>

        {/* Info strip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INFO.map(({ Icon, title, sub }) => (
            <div key={title} className="bg-white border border-ink/8 rounded-sm p-4 text-center">
              <Icon className="w-4 h-4 text-burgundy mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-body font-medium text-xs text-ink">{title}</p>
              <p className="font-body text-xs text-ink/40 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
