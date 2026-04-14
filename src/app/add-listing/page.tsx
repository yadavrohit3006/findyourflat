import Link from 'next/link';
import type { Metadata } from 'next';
import { AddListingForm } from '@/components/AddListingForm';

export const metadata: Metadata = {
  title: 'Post a Listing — FindYourFlat',
  description: 'List your flat or find a flatmate on FindYourFlat.',
};

export default function AddListingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Back to map"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">Post a Listing</h1>
            <p className="text-xs text-gray-500">Share your flat with others on the map</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
        {/* Explainer */}
        <div className="mb-6 rounded-2xl bg-sky-50 border border-sky-100 p-4">
          <h2 className="mb-1 text-sm font-semibold text-sky-800">How it works</h2>
          <ol className="space-y-1 text-xs text-sky-700">
            <li>1. Drop a pin on Google Maps for your flat's exact location</li>
            <li>2. Copy the URL and paste it below — we'll extract the coordinates</li>
            <li>3. Fill in the details and post — your listing appears on the map</li>
          </ol>
        </div>

        <AddListingForm />
      </main>
    </div>
  );
}
