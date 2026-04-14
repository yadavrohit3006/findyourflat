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
      .min(500, 'Minimum rent is ₹500')
      .max(500000, 'Maximum rent is ₹5,00,000'),
    roomType: z.enum(['PRIVATE_ROOM', 'SHARED_ROOM', 'ENTIRE_FLAT', 'STUDIO']),
    genderPreference: z.enum(['ANY', 'MALE_ONLY', 'FEMALE_ONLY', 'NON_BINARY_FRIENDLY'], {
      required_error: 'Gender preference is required',
    }),
    availableFrom: z.string().min(1, 'Available from date is required'),
    contactName: z.string().max(100).optional(),
    contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    contactPhone: z.string().max(20).optional(),
  })
  .refine((d) => !!(d.contactEmail || d.contactPhone), {
    message: 'Provide at least one contact method — phone or email',
    path: ['contactPhone'],
  });

export type CreateListingSchema = z.infer<typeof createListingSchema>;
