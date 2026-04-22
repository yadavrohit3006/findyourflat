'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminListingForm, type ExtractedListing } from '@/components/admin/AdminListingForm';

type Step = 'input' | 'extracting' | 'review';

export default function AdminNewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [extracted, setExtracted] = useState<ExtractedListing | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<'image' | 'url'>('image');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extract = useCallback(async (body: object) => {
    setStep('extracting');
    setError('');
    try {
      const res = await fetch('/api/admin/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Extraction failed');
        setStep('input');
        return;
      }
      setExtracted(data);
      setStep('review');
    } catch {
      setError('Network error. Please try again.');
      setStep('input');
    }
  }, []);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please use an image under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, imageBase64] = dataUrl.split(',');
      const imageMediaType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
      extract({ imageBase64, imageMediaType });
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleUrlExtract() {
    if (!url.trim()) return;
    extract({ url: url.trim() });
  }

  function reset() {
    setStep('input');
    setExtracted(null);
    setError('');
    setUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step === 'input' ? router.push('/admin/listings') : reset()}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Listing</h1>
        {step === 'review' && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">
            AI pre-filled — review below
          </span>
        )}
      </div>

      {step === 'input' && (
        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-1">
            <button
              onClick={() => setInputMode('image')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                inputMode === 'image'
                  ? 'bg-sky-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload Screenshot
            </button>
            <button
              onClick={() => setInputMode('url')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                inputMode === 'url'
                  ? 'bg-sky-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Paste URL
            </button>
          </div>

          {inputMode === 'image' ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-gray-300 bg-white hover:border-sky-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-gray-100 p-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Drop screenshot here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5 MB</p>
                </div>
                <p className="text-xs text-gray-400 max-w-xs">
                  Works great with WhatsApp forwards, Facebook group post screenshots, and housing society notices.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://facebook.com/groups/..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlExtract()}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Note: Facebook Marketplace listings require login and won&apos;t work — use a screenshot for those.
                </p>
              </div>
              <button
                onClick={handleUrlExtract}
                disabled={!url.trim()}
                className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none text-white font-medium py-2.5 text-sm transition-colors"
              >
                Extract Details
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 mb-2">Or fill in details manually</p>
            <button
              onClick={() => { setExtracted({}); setStep('review'); }}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Skip extraction → go to form
            </button>
          </div>
        </div>
      )}

      {step === 'extracting' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" style={{ borderWidth: 3 }} />
            <div>
              <p className="font-medium text-gray-800 text-sm">Extracting listing details…</p>
              <p className="text-xs text-gray-400 mt-1">Claude is reading the listing. Takes ~5 seconds.</p>
            </div>
          </div>
        </div>
      )}

      {step === 'review' && extracted !== null && (
        <div>
          <div className="mb-6 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">
            Review and edit the details below, then pin the location on the map and click Approve & Publish.
          </div>
          <AdminListingForm defaultData={extracted} />
          <button
            onClick={reset}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600"
          >
            ← Start over with a different screenshot
          </button>
        </div>
      )}
    </div>
  );
}
