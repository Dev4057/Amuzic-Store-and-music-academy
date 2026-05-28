import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-cream/8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="font-heading text-xl font-semibold text-cream">Amuzic</span>
              <span className="font-heading text-xl italic text-gold"> Store & Music Academy</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nurturing musical talent and curating quality instruments in Bavdhan, Pune since 2015. Every person who wants to make music deserves the chance to.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-body font-medium text-cream text-xs uppercase tracking-[0.18em] mb-5">Courses</h4>
            <ul className="space-y-3 text-sm">
              {(['keyboard', 'guitar', 'drums', 'vocals'] as const).map((c) => (
                <li key={c}>
                  <Link href={`/courses/${c}`} className="hover:text-cream transition-colors capitalize">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-body font-medium text-cream text-xs uppercase tracking-[0.18em] mb-5">Explore</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/why-music', label: 'Why Music?' },
                { href: '/insights', label: 'Insights & Blog' },
                { href: '/showcase', label: 'Student Showcase' },
                { href: '/store', label: 'Music Store' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body font-medium text-cream text-xs uppercase tracking-[0.18em] mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>Bakaji Corner, Bavdhan</li>
              <li>Pune, Maharashtra 411021</li>
              <li className="pt-1">
                <a href="tel:+918975916381" className="hover:text-cream transition-colors">
                  +91 89759 16381
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918975916381"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/25">
          <p>© {new Date().getFullYear()} Amuzic Store &amp; Music Academy. All rights reserved.</p>
          <p>Bavdhan · Kothrud · Baner · Pashan · Aundh</p>
        </div>
      </div>
    </footer>
  )
}
