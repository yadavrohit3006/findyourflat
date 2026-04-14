import { z } from 'zod';

export const createListingSchema = z
  .object({
    latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
    longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
    address: z.string().min(3, 'Address is required').max(200),
    city: z.string().min(2, 'City is required').max(100),
    neighborhood: z.string().max(100).optional(),
    title: z.string().min(5, 'Title must be at least 5 characters').max(120),
    description: z.string().max(2000).optional(),
    rentMonthly: z
      .number()
      .int('Rent must be a whole number')
      .min(1000, 'Minimum rent is ₹1,000')
      .max(500000, 'Maximum rent is ₹5,00,000'),
    listingType: z.enum(['NEW_LISTING', 'REPLACEMENT'], {
      required_error: 'Please select a listing type',
    }),
    flatType: z.enum(['1RK', '1BHK', '2BHK', '3BHK', '4BHK'], {
      required_error: 'Please select a flat type',
    }),
    genderPreference: z.enum(['ANY', 'MALE_ONLY', 'FEMALE_ONLY'], {
      required_error: 'Gender preference is required',
    }),
    availableFrom: z.string().min(1, 'Available from date is required'),
    contactName: z.string().max(100).optional(),
    contactEmail: z
      .string()
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Enter a valid email address'
      )
      .optional()
      .or(z.literal('')),
    contactPhone: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .optional()
      .or(z.literal('')),
  })
  .refine((d) => !!(d.contactEmail || d.contactPhone), {
    message: 'Provide at least one contact method — phone or email',
    path: ['contactPhone'],
  });

export type CreateListingSchema = z.infer<typeof createListingSchema>;
