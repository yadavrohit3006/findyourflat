import type { MetadataRoute } from 'next';
import { CITIES } from '@/lib/cities';

const BASE_URL = 'https://findyourflat.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages = CITIES.map((city) => ({
    url: `${BASE_URL}/flats-for-rent-in-${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/add-listing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...cityPages,
  ];
}
