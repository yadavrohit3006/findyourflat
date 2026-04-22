'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormLocationPicker } from '@/components/FormLocationPicker';
import { createListingSchema, type CreateListingSchema } from '@/lib/validations';

const LISTING_TYPE_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'NEW_LISTING', label: 'New Listing — full flat available' },
  { value: 'REPLACEMENT', label: 'Replacement — someone moving out' },
];

const FLAT_TYPE_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: '1RK', label: '1 RK' },
  { value: '1BHK', label: '1 BHK' },
  { value: '2BHK', label: '2 BHK' },
  { value: '3BHK', label: '3 BHK' },
  { value: '4BHK', label: '4 BHK' },
];

const FURNISHING_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select preference…' },
  { value: 'ANY', label: 'Any Gender' },
  { value: 'MALE_ONLY', label: 'Male Only' },
  { value: 'FEMALE_ONLY', label: 'Female Only' },
];

export interface ExtractedListing {
  title?: string | null;
  description?: string | null;
  rentMonthly?: number | null;
  listingType?: string | null;
  flatType?: string | null;
  furnishingStatus?: string | null;
  genderPreference?: string | null;
  availableFrom?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  city?: string | null;
  neighborhood?: string | null;
}

interface AdminListingFormProps {
  defaultData?: ExtractedListing;
}

export function AdminListingForm({ defaultData }: AdminListingFormProps) {
  const router = useRouter();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingSchema>({
    resolver: zodResolver(createListingSchema),
    mode: 'onTouched',
    defaultValues: {
      title: defaultData?.title ?? '',
      description: defaultData?.description ?? '',
      rentMonthly: defaultData?.rentMonthly ?? undefined,
      listingType: (defaultData?.listingType as CreateListingSchema['listingType']) ?? undefined,
      flatType: (defaultData?.flatType as CreateListingSchema['flatType']) ?? undefined,
      furnishingStatus: (defaultData?.furnishingStatus as CreateListingSchema['furnishingStatus']) ?? undefined,
      genderPreference: (defaultData?.genderPreference as CreateListingSchema['genderPreference']) ?? undefined,
      availableFrom: defaultData?.availableFrom ?? '',
      contactName: defaultData?.contactName ?? '',
      contactPhone: defaultData?.contactPhone ?? '',
      contactEmail: defaultData?.contactEmail ?? '',
      address: defaultData?.address ?? '',
      city: defaultData?.city ?? '',
      neighborhood: defaultData?.neighborhood ?? '',
    },
  });

  function handleLocationPick(loc: { lat: number; lng: number; address: string; city: string }) {
    setLocationError(null);
    setValue('latitude', loc.lat, { shouldValidate: true });
    setValue('longitude', loc.lng, { shouldValidate: true });
    setValue('address', loc.address, { shouldValidate: false });
    if (loc.city) setValue('city', loc.city, { shouldValidate: false });
  }

  async function onSubmit(data: CreateListingSchema) {
    setSubmitError(null);

    if (!data.latitude || !data.longitude) {
      setLocationError('Please search and select a location above.');
      return;
    }

    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error ?? 'Something went wrong. Please try again.');
        return;
      }

      router.push('/admin/listings');
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    }
  }

  const locationHint = defaultData?.address
    ? `AI extracted: "${defaultData.address}" — search below to pin the exact map location.`
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Section: Location */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">1</span>
          Location
        </h2>
        {locationHint && (
          <p className="mb-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
            {locationHint}
          </p>
        )}

        <div className="space-y-4">
          <FormLocationPicker
            onPick={handleLocationPick}
            initialQuery={defaultData?.neighborhood ? `${defaultData.neighborhood}, ${defaultData.city}` : defaultData?.city ?? ''}
            error={locationError ?? (errors.latitude?.message || errors.longitude?.message)}
          />

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
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Listing type"
              required
              options={LISTING_TYPE_OPTIONS}
              {...register('listingType')}
              error={errors.listingType?.message}
            />
            <Select
              label="Flat type"
              required
              options={FLAT_TYPE_OPTIONS}
              {...register('flatType')}
              error={errors.flatType?.message}
            />
          </div>

          <Select
            label="Furnishing status"
            required
            options={FURNISHING_OPTIONS}
            {...register('furnishingStatus')}
            error={errors.furnishingStatus?.message}
          />

          <Input
            label="Title"
            required
            placeholder="2BHK in HSR Layout — Fully Furnished"
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
              min={1000}
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

          <Select
            label="Gender preference"
            required
            options={GENDER_OPTIONS}
            {...register('genderPreference')}
            error={errors.genderPreference?.message}
          />
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
            label="Name (optional)"
            placeholder="Priya S."
            {...register('contactName')}
            error={errors.contactName?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              type="tel"
              placeholder="9876543210"
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

      <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700" loading={isSubmitting}>
        Approve & Publish
      </Button>
    </form>
  );
}
