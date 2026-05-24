import type { Metadata } from 'next'
import type { Product } from '@amuzic/shared'
import ProductCard from '@/components/ProductCard'
import { MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Music Store — Instruments & Accessories',
  description:
    'Shop instruments and accessories at the Amuzic Academy store in Bavdhan, Pune. Expert guidance included.',
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/products`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.products ?? []
  } catch {
    return []
  }
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-cream border-b border-ink/8 py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="section-label mb-3">Instruments &amp; accessories</p>
          <h1 className="section-title mb-3">Music Store</h1>
          <p className="section-subtitle max-w-md">
            Quality instruments curated by our teachers. Bought here, understood here.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">

        {/* Info banner */}
        <div className="bg-white border border-ink/10 rounded-sm p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <p className="font-body font-semibold text-ink text-sm">Not sure what to buy?</p>
            <p className="font-body text-sm text-ink/50 mt-0.5 leading-relaxed">
              Our teachers provide free instrument guidance to enrolled students. WhatsApp us and we&apos;ll recommend the right instrument for your budget.
            </p>
          </div>
          <a
            href="https://wa.me/918975916381?text=Hi%2C%20I%20need%20help%20choosing%20an%20instrument."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Ask Our Teachers
          </a>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-ink/30 fill-none stroke-current" strokeWidth={1.5}>
                <path d="M9 9h6M9 12h6M9 15h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-semibold text-ink mb-2">Store Coming Soon</h2>
            <p className="font-body text-ink/50 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
              We&apos;re curating a selection of quality instruments and accessories. In the meantime, WhatsApp us and we&apos;ll guide you to the right purchase.
            </p>
            <a
              href="https://wa.me/918975916381?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20instruments."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="w-4 h-4" />
              Enquire on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
