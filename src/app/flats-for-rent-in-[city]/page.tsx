import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CITIES, getCityBySlug } from '@/lib/cities';

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};

  const title = `Flats for Rent in ${city.name} — FindYourFlat`;
  const description = `Browse flats and rooms for rent in ${city.name}, ${city.state}. Find flatmates, no-broker listings near ${city.neighborhoods.slice(0, 3).join(', ')} and more — all on an interactive map.`;
  const url = `https://findyourflat.vercel.app/flats-for-rent-in-${city.slug}`;

  return {
    title,
    description,
    keywords: [
      `flats for rent in ${city.name}`,
      `rooms for rent in ${city.name}`,
      `flatmate in ${city.name}`,
      `no broker flat ${city.name}`,
      `pg in ${city.name}`,
      ...city.neighborhoods.map((n) => `flat in ${n}`),
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'FindYourFlat',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const mapUrl = `/?lat=${city.lat}&lng=${city.lng}&zoom=${city.zoom}`;
  const canonicalUrl = `https://findyourflat.vercel.app/flats-for-rent-in-${city.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'FindYourFlat',
        url: 'https://findyourflat.vercel.app',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://findyourflat.vercel.app/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebPage',
        name: `Flats for Rent in ${city.name}`,
        description: city.description,
        url: canonicalUrl,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findyourflat.vercel.app' },
            { '@type': 'ListItem', position: 2, name: `Flats in ${city.name}`, item: canonicalUrl },
          ],
        },
      },
      {
        '@type': 'RealEstateAgent',
        name: 'FindYourFlat',
        description: `Browse no-broker flat listings in ${city.name}`,
        url: canonicalUrl,
        areaServed: {
          '@type': 'City',
          name: city.name,
          containedInPlace: { '@type': 'State', name: city.state },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-base font-bold text-gray-900">FindYourFlat</span>
            </Link>
            <Link
              href="/add-listing"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
            >
              Post a Listing
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-sky-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Flats in {city.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 leading-tight">
              Flats for Rent in {city.name}
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 leading-relaxed">
              {city.description}
            </p>
          </div>

          {/* CTA card */}
          <div className="mb-12 rounded-2xl bg-sky-600 p-8 text-white">
            <h2 className="mb-2 text-2xl font-bold">Browse listings on the map</h2>
            <p className="mb-6 text-sky-100">
              See every available flat in {city.name} pinned on an interactive map. Filter by budget, flat type, furnishing, and gender preference.
            </p>
            <Link
              href={mapUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497z" />
              </svg>
              Open Map — {city.name}
            </Link>
          </div>

          {/* Popular neighbourhoods */}
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Popular neighbourhoods in {city.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {city.neighborhoods.map((n) => (
                <Link
                  key={n}
                  href={mapUrl}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-sky-300 hover:text-sky-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {n}
                </Link>
              ))}
            </div>
          </section>

          {/* Why FindYourFlat */}
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Why FindYourFlat?</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Zero brokerage',
                  body: 'Connect directly with landlords and flatmates. No middlemen, no commission.',
                },
                {
                  icon: (
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497z" />
                    </svg>
                  ),
                  title: 'Map-first search',
                  body: `See exactly where each flat is in ${city.name}. Plan your commute before visiting.`,
                },
                {
                  icon: (
                    <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg>
                  ),
                  title: 'Smart filters',
                  body: 'Filter by rent, flat type, furnishing, and gender preference in seconds.',
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-sky-50">
                    {f.icon}
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Other cities */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Browse other cities</h2>
            <div className="flex flex-wrap gap-2">
              {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/flats-for-rent-in-${c.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-sky-300 hover:text-sky-600 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 FindYourFlat. All rights reserved.</p>
            <Link href="/add-listing" className="text-sm text-sky-600 hover:underline">
              Post a free listing →
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
