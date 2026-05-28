import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Music education tips, student stories, and academy news from Amuzic Academy in Bavdhan, Pune.',
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url?: string
  tags: string[]
  author_name: string
  published_at?: string
  reading_time_minutes?: number
}

async function fetchPosts(): Promise<BlogPost[]> {
  try {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
    const res = await fetch(`${apiUrl}/api/blog?limit=20`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json() as { data?: BlogPost[] }
    return json.data ?? []
  } catch {
    return []
  }
}

function formatPublishedDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const TAG_COLORS: Record<string, string> = {
  keyboard: 'bg-purple-100 text-purple-700',
  guitar: 'bg-green-100 text-green-700',
  drums: 'bg-red-100 text-red-700',
  vocals: 'bg-blue-100 text-blue-700',
}

export default async function InsightsPage() {
  const posts = await fetchPosts()

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-ink text-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <p className="font-body text-gold text-xs uppercase tracking-[0.2em] mb-4">From the Academy</p>
          <h1 className="font-heading text-4xl lg:text-6xl font-light text-cream mb-6">
            Insights &amp; Stories
          </h1>
          <p className="font-body text-cream/50 text-base max-w-lg leading-relaxed">
            Music education tips, student journeys, and everything happening at Amuzic Academy.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="font-heading text-5xl text-ink/10 mb-6">✎</div>
            <h2 className="font-heading text-2xl text-ink/40 mb-3">Insights coming soon</h2>
            <p className="font-body text-sm text-ink/30">We&apos;re working on some great content. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/insights/${post.slug}`} className="group block">
                <article className="bg-cream border border-ink/8 rounded-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(44,24,16,0.08)] transition-shadow duration-300 h-full flex flex-col">
                  {/* Cover */}
                  <div className="aspect-[16/9] bg-ink/5 overflow-hidden flex-shrink-0">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-heading italic text-6xl text-ink/10">♪</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`font-body text-xs px-2 py-0.5 rounded-full capitalize ${TAG_COLORS[tag] ?? 'bg-gold/10 text-gold-dark'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="font-heading text-xl font-medium text-ink mb-3 leading-snug group-hover:text-burgundy transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="font-body text-sm text-ink/55 leading-relaxed mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between border-t border-ink/6 pt-4 mt-auto">
                      <span className="font-body text-xs text-ink/35">{post.author_name}</span>
                      <div className="flex items-center gap-3 font-body text-xs text-ink/35">
                        {post.reading_time_minutes && <span>{post.reading_time_minutes} min read</span>}
                        {post.published_at && <span>{formatPublishedDate(post.published_at)}</span>}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
