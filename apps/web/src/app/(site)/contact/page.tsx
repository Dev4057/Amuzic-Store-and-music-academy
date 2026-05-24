import type { Metadata } from 'next'
import BookDemoButton from '@/components/BookDemoButton'
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Amuzic Academy, Bavdhan, Pune',
  description:
    'Get in touch with Amuzic Academy. Visit us at Bakaji Corner, Bavdhan, Pune, call +91 89759 16381, or WhatsApp for a quick response.',
}

export default function ContactPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Page header */}
      <div className="bg-cream border-b border-ink/8 py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="section-label mb-3">Say hello</p>
          <h1 className="section-title mb-3">Get in Touch</h1>
          <p className="section-subtitle max-w-md">
            We&apos;re always happy to hear from you. Reach us however is most convenient.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Info column */}
          <div className="space-y-5">

            <div className="card p-7">
              <h2 className="font-heading text-lg font-semibold text-ink mb-5">Visit Us</h2>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-burgundy" />
                </div>
                <div>
                  <p className="font-body font-medium text-ink text-sm">Amuzic Academy</p>
                  <p className="font-body text-sm text-ink/50 mt-1 leading-relaxed">
                    Bakaji Corner, Bavdhan<br />
                    Pune, Maharashtra 411021
                  </p>
                  <a
                    href="https://maps.google.com/?q=Bavdhan+Pune+Maharashtra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-burgundy hover:text-burgundy-dark font-body font-medium mt-2 transition-colors"
                  >
                    Open in Maps <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-lg font-semibold text-ink mb-5">Call or WhatsApp</h2>
              <div className="flex gap-4 mb-5">
                <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-burgundy" />
                </div>
                <div>
                  <p className="font-body text-xs text-ink/35 mb-0.5">Phone / WhatsApp</p>
                  <a href="tel:+918975916381" className="font-body font-semibold text-ink hover:text-burgundy transition-colors text-sm">
                    +91 89759 16381
                  </a>
                </div>
              </div>
              <a
                href="https://wa.me/918975916381?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Amuzic%20Academy."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-body font-semibold text-sm px-5 py-2.5 rounded hover:bg-green-600 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-lg font-semibold text-ink mb-5">Hours</h2>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-burgundy" />
                </div>
                <div className="space-y-2 text-sm font-body w-full">
                  {[
                    { day: 'Monday – Friday', hours: '9:00 am – 8:00 pm' },
                    { day: 'Saturday', hours: '9:00 am – 7:00 pm' },
                    { day: 'Sunday', hours: 'By appointment' },
                  ].map(({ day, hours }) => (
                    <div key={day} className="flex justify-between gap-8">
                      <span className="text-ink/45">{day}</span>
                      <span className="font-medium text-ink">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-7">
              <h2 className="font-heading text-lg font-semibold text-ink mb-4">Areas We Serve</h2>
              <div className="flex flex-wrap gap-2">
                {['Bavdhan', 'Kothrud', 'Baner', 'Pashan', 'Aundh', 'Wakad', 'Warje', 'Shivane'].map((area) => (
                  <span
                    key={area}
                    className="text-xs font-body text-burgundy border border-burgundy/20 px-3 py-1 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Map placeholder + CTA */}
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="aspect-video bg-ink flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-9 h-9 text-gold mx-auto mb-3" />
                  <p className="font-body font-medium text-cream text-sm">Bakaji Corner, Bavdhan</p>
                  <p className="font-body text-xs text-cream/40 mt-1">Pune, Maharashtra 411021</p>
                  <a
                    href="https://maps.google.com/?q=Bavdhan+Pune+Maharashtra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-4 text-xs text-gold hover:text-gold-light font-body font-medium transition-colors"
                  >
                    Open in Google Maps <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-burgundy rounded-sm p-8 relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(201,160,64,0.15), transparent 60%)' }}
              />
              <div className="relative">
                <h2 className="font-heading font-light italic text-2xl text-cream mb-3">Ready to Visit?</h2>
                <p className="font-body text-cream/55 text-sm mb-7 leading-relaxed">
                  Book a free demo class and come see the academy in person. Meet the teachers. Hear the music. No pressure at all.
                </p>
                <BookDemoButton className="btn-gold w-full justify-center py-3.5">
                  Book Free Demo <ArrowRight className="w-4 h-4" />
                </BookDemoButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
