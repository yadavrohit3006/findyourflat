'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { parseGoogleMapsUrl } from '@/lib/parseGoogleMapsUrl';
import { createListingSchema, type CreateListingSchema } from '@/lib/validations';

const ROOM_TYPE_OPTIONS = [
  { value: 'PRIVATE_ROOM', label: 'Private Room' },
  { value: 'SHARED_ROOM', label: 'Shared Room' },
  { value: 'ENTIRE_FLAT', label: 'Entire Flat' },
  { value: 'STUDIO', label: 'Studio' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select preference…' },
  { value: 'ANY', label: 'Any Gender' },
  { value: 'MALE_ONLY', label: 'Male Only' },
  { value: 'FEMALE_ONLY', label: 'Female Only' },
  { value: 'NON_BINARY_FRIENDLY', label: 'Non-Binary Friendly' },
];

export function AddListingForm() {
  const router = useRouter();
  const [coordsPreview, setCoordsPreview] = useState<{ lat: number; lng: number } | null>(null);
  const [coordsError, setCoordsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingSchema>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      roomType: 'PRIVATE_ROOM',
    },
  });

  function handleMapsUrlBlur(e: React.FocusEvent<HTMLInputElement>) {
    const url = e.target.value.trim();
    if (!url) return;

    const coords = parseGoogleMapsUrl(url);
    if (coords) {
      setCoordsPreview(coords);
      setCoordsError(null);
      setValue('latitude', coords.lat, { shouldValidate: true });
      setValue('longitude', coords.lng, { shouldValidate: true });
    } else {
      setCoordsPreview(null);
      setCoordsError(
        'Could not extract coordinates. Make sure you paste a pin URL (e.g. maps.google.com/?q=28.45,77.02) not a search URL.'
      );
    }
  }

  async function onSubmit(data: CreateListingSchema) {
    setSubmitError(null);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error ?? 'Something went wrong. Please try again.');
        return;
      }

      router.push('/?success=1');
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Section: Location */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">1</span>
          Location
        </h2>

        <div className="space-y-4">
          {/* Google Maps URL */}
          <div>
            <Input
              label="Google Maps pin URL"
              required
              placeholder="https://maps.google.com/?q=28.4595,77.0266"
              hint="Drop a pin on Google Maps → Share → Copy link. Must contain coordinates."
              {...register('googleMapsUrl')}
              onBlur={handleMapsUrlBlur}
              error={errors.googleMapsUrl?.message ?? (coordsError ?? undefined)}
            />
            {coordsPreview && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">
                <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coordinates extracted: {coordsPreview.lat.toFixed(5)}, {coordsPreview.lng.toFixed(5)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Address"
              required
              placeholder="14th Cross, HSR Layout"
              {...register('address')}
              error={errors.address?.message}
            />
            <Input
              label="City"
              required
              placeholder="Bangalore"
              {...register('city')}
              error={errors.city?.message}
            />
          </div>

          <Input
            label="Neighbourhood (optional)"
            placeholder="HSR Layout"
            {...register('neighborhood')}
            error={errors.neighborhood?.message}
          />
        </div>
      </section>

      {/* Section: Listing Details */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">2</span>
          Listing Details
        </h2>

        <div className="space-y-4">
          <Input
            label="Title"
            required
            placeholder="1BHK in HSR Layout — Fully Furnished"
            {...register('title')}
            error={errors.title?.message}
          />

          <Textarea
            label="Description (optional)"
            placeholder="Describe the flat, amenities, nearby places, and any house rules..."
            rows={4}
            {...register('description')}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Rent (₹)"
              type="number"
              required
              placeholder="15000"
              min={500}
              {...register('rentMonthly', { valueAsNumber: true })}
              error={errors.rentMonthly?.message}
            />
            <Input
              label="Available from"
              type="date"
              required
              {...register('availableFrom')}
              error={errors.availableFrom?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Room type"
              required
              options={ROOM_TYPE_OPTIONS}
              {...register('roomType')}
              error={errors.roomType?.message}
            />
            <Select
              label="Gender preference"
              required
              options={GENDER_OPTIONS}
              {...register('genderPreference')}
              error={errors.genderPreference?.message}
            />
          </div>
        </div>
      </section>

      {/* Section: Contact */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">3</span>
          Contact Info
        </h2>

        <div className="space-y-4">
          <Input
            label="Your name"
            placeholder="Priya S."
            required
            {...register('contactName')}
            error={errors.contactName?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 9876543210"
              {...register('contactPhone')}
              error={errors.contactPhone?.message}
              hint="Phone or email required"
            />
            <Input
              label="Email"
              type="email"
              placeholder="priya@example.com"
              {...register('contactEmail')}
              error={errors.contactEmail?.message}
            />
          </div>
        </div>
      </section>

      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        Post Listing
      </Button>
    </form>
  );
}
