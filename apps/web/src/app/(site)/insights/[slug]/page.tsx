import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url?: string
  tags: string[]
  author_name: string
  published_at?: string
  reading_time_minutes?: number
}

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json() as { data?: BlogPost }
    return json.data ?? null
  } catch {
    return null
  }
}

async function fetchAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog?limit=100`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json() as { data?: { slug: string }[] }
    return (json.data ?? []).map((p) => p.slug)
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.cover_image_url ? [post.cover_image_url] : [] },
  }
}

function formatPublishedDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function renderMarkdown(content: string): Promise<string> {
  const { marked } = await import('marked')
  const { default: DOMPurify } = await import('dompurify')
  const { JSDOM } = await import('jsdom')
  const { window } = new JSDOM('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purify = DOMPurify(window as any)
  const raw = await marked(content)
  return purify.sanitize(raw)
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug)
  if (!post) notFound()

  const html = await renderMarkdown(post.content)

  return (
    <div className="min-h-screen bg-cream">
      {/* Cover */}
      {post.cover_image_url && (
        <div className="h-64 lg:h-80 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20">
        {/* Back */}
        <Link href="/insights" className="font-body text-sm text-ink/40 hover:text-ink transition-colors mb-8 inline-block">
          ← Back to Insights
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span key={tag} className="font-body text-xs text-gold-dark border border-gold/30 px-3 py-0.5 rounded-full capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-heading text-3xl lg:text-5xl font-medium text-ink leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 font-body text-sm text-ink/40 mb-10 pb-10 border-b border-ink/8">
          <span>{post.author_name}</span>
          {post.published_at && <span>{formatPublishedDate(post.published_at)}</span>}
          {post.reading_time_minutes && <span>{post.reading_time_minutes} min read</span>}
        </div>

        {/* Content */}
        <div
          className="prose prose-stone max-w-none
            prose-headings:font-heading prose-headings:font-medium
            prose-a:text-burgundy prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-gold prose-blockquote:text-ink/60"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 pt-10 border-t border-ink/8 text-center">
          <p className="font-body text-sm text-ink/40 mb-4">Enjoyed this? Come learn music with us.</p>
          <Link href="/book-demo" className="btn-primary px-8 py-3">
            Book a Free Demo Class
          </Link>
        </div>
      </div>
    </div>
  )
}
