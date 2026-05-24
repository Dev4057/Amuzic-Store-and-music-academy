import type { MetadataRoute } from 'next'

const BASE_URL = 'https://amuzicacademy.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const coursesSlugs = ['keyboard', 'guitar', 'drums', 'vocals']

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/book-demo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/why-music`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/showcase`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/store`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const courseRoutes: MetadataRoute.Sitemap = coursesSlugs.map((slug) => ({
    url: `${BASE_URL}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...courseRoutes]
}
