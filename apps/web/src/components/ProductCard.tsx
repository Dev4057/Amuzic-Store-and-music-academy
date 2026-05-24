import type { Product } from '@amuzic/shared'
import { formatCurrency } from '@amuzic/shared'
import { MessageCircle } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card hover:shadow-[0_4px_24px_rgba(44,24,16,0.08)] transition-shadow duration-300 flex flex-col">
      {/* Placeholder image */}
      <div className="aspect-square bg-cream-dark border-b border-ink/8 flex items-center justify-center">
        <svg viewBox="0 0 60 60" className="w-14 h-14 text-ink/15 fill-current">
          <rect width="60" height="60" rx="4" />
          <path d="M30 15a15 15 0 100 30 15 15 0 000-30zm0 5a10 10 0 110 20 10 10 0 010-20z" fill="white" opacity=".4" />
        </svg>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs font-body font-medium text-burgundy uppercase tracking-[0.12em]">
            {product.category}
          </span>
        )}
        <h3 className="font-heading text-base font-semibold text-ink mt-1 mb-1 leading-snug">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-ink/45 font-body leading-relaxed mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto mb-3">
          <span className="font-heading italic text-xl text-ink">
            {formatCurrency(product.price)}
          </span>
          {product.stock_quantity > 0 ? (
            <span className="text-xs text-green-700 font-body font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-red-500 font-body font-medium">Out of Stock</span>
          )}
        </div>

        <a
          href={`https://wa.me/918975916381?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}.%20Is%20it%20available%3F`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center text-xs py-2.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Enquire on WhatsApp
        </a>
      </div>
    </div>
  )
}
