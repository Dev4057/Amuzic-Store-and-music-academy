'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/why-music', label: 'Why Music?' },
  { href: '/insights', label: 'Insights' },
  { href: '/showcase', label: 'Showcase' },
  { href: '/store', label: 'Store' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-ink/8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt="Amuzic logo" width={36} height={36} className="rounded-sm object-contain" />
            <span className="font-heading text-xl font-semibold text-ink">Amuzic</span>
            <span className="font-heading text-xl italic text-burgundy">Store & Music Academy</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm text-ink/55 hover:text-ink transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book-demo" className="btn-primary text-xs px-5 py-2.5">
              Book Free Demo
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 text-ink/55 hover:text-ink transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream border-t border-ink/8 px-6 py-6 space-y-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block font-body text-sm text-ink/65 hover:text-ink py-3 border-b border-ink/6 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-5">
            <Link
              href="/book-demo"
              onClick={() => setOpen(false)}
              className="btn-primary w-full justify-center"
            >
              Book Free Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
