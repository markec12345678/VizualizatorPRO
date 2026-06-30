import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://vizualizatorpro.si'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'sl-SI': baseUrl,
          'en-US': baseUrl,
          'de-DE': baseUrl,
          'it-IT': baseUrl,
        },
      },
    },
  ]
}
