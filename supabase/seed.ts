import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bebsuhmuuqlrivkjmgws.supabase.co',
  'sb_publishable_pmJz-iK42KuS2k6QF2Dv8Q_13J89P9r'
);

const sampleListings = [
  { latitude: 12.9352, longitude: 77.6245, address: '14th Cross, HSR Layout Sector 4', city: 'Bangalore', neighborhood: 'HSR Layout', title: '1BHK in HSR Layout — Fully Furnished', description: 'Bright, well-ventilated 1BHK on the 3rd floor. Fully equipped kitchen, high-speed WiFi, dedicated parking. 10 mins walk to HSR BDA complex.', rent_monthly: 22000, room_type: 'ENTIRE_FLAT', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-02-01', contact_name: 'Priya S.', contact_email: 'priya@example.com', source_url: 'https://maps.google.com/?q=12.9352,77.6245' },
  { latitude: 12.9698, longitude: 77.7499, address: 'Whitefield Main Road, near ITPL', city: 'Bangalore', neighborhood: 'Whitefield', title: 'Private Room in 3BHK Flat — ITPL', description: 'Private room in a shared 3BHK. Attached bathroom, AC included. Society gym and pool.', rent_monthly: 14000, room_type: 'PRIVATE_ROOM', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-01-15', contact_name: 'Rahul M.', contact_phone: '+91 9876543210', source_url: 'https://maps.google.com/?q=12.9698,77.7499' },
  { latitude: 12.9121, longitude: 77.6446, address: 'BTM Layout 2nd Stage', city: 'Bangalore', neighborhood: 'BTM Layout', title: 'Studio Apartment — BTM Layout', description: 'Compact studio for solo professionals. Modular kitchen, daily housekeeping. Close to Silk Board.', rent_monthly: 16500, room_type: 'STUDIO', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-02-10', contact_name: 'Ananya R.', contact_email: 'ananya@example.com', source_url: 'https://maps.google.com/?q=12.9121,77.6446' },
  { latitude: 13.0067, longitude: 77.5802, address: 'Indiranagar 100 Feet Road', city: 'Bangalore', neighborhood: 'Indiranagar', title: '2BHK — Indiranagar, looking for flatmate', description: 'One private room in my 2BHK. Spacious with balcony. Safe locality, cafes nearby. Prefer female flatmate.', rent_monthly: 18000, room_type: 'PRIVATE_ROOM', gender_preference: 'FEMALE_ONLY', status: 'AVAILABLE', available_from: '2025-01-20', contact_name: 'Meera K.', contact_email: 'meera@example.com', source_url: 'https://maps.google.com/?q=13.0067,77.5802' },
  { latitude: 28.4595, longitude: 77.0266, address: 'Sector 49, Gurugram', city: 'Gurugram', neighborhood: 'Sector 49', title: 'Private Room — DLF Phase 3 area', description: '3BHK society apartment. 24/7 security, power backup. Close to Huda City Centre metro.', rent_monthly: 15000, room_type: 'PRIVATE_ROOM', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-02-01', contact_name: 'Vikram T.', contact_phone: '+91 9988776655', source_url: 'https://maps.google.com/?q=28.4595,77.0266' },
  { latitude: 28.6139, longitude: 77.2090, address: 'Lajpat Nagar IV', city: 'Delhi', neighborhood: 'Lajpat Nagar', title: '2BHK Entire Flat — Lajpat Nagar', description: 'Entire 2BHK available immediately. Freshly painted, semi-furnished. Ground floor with garden.', rent_monthly: 28000, room_type: 'ENTIRE_FLAT', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-01-25', contact_name: 'Suresh P.', contact_email: 'suresh@example.com', source_url: 'https://maps.google.com/?q=28.6139,77.2090' },
  { latitude: 19.0760, longitude: 72.8777, address: 'Bandra West, Turner Road', city: 'Mumbai', neighborhood: 'Bandra West', title: 'Shared Room in Bandra — Sea Facing', description: 'Bed in shared room in 3BHK sea-facing apartment. Fully furnished, meals available.', rent_monthly: 19000, room_type: 'SHARED_ROOM', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-02-05', contact_name: 'Neha J.', contact_email: 'neha@example.com', source_url: 'https://maps.google.com/?q=19.0760,72.8777' },
  { latitude: 19.0178, longitude: 72.8478, address: 'Kurla West, near LBS Marg', city: 'Mumbai', neighborhood: 'Kurla', title: '1RK Studio — Kurla West', description: 'Compact 1RK for single person. Clean building. 5 mins from Kurla station.', rent_monthly: 12000, room_type: 'STUDIO', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-01-18', contact_name: 'Rajan D.', contact_phone: '+91 9123456789', source_url: 'https://maps.google.com/?q=19.0178,72.8478' },
  { latitude: 18.5204, longitude: 73.8567, address: 'Koregaon Park Lane 6', city: 'Pune', neighborhood: 'Koregaon Park', title: 'Private Room — Koregaon Park', description: 'Beautiful room in bungalow-style flat. Peaceful, tree-lined street. Fibre internet included.', rent_monthly: 13500, room_type: 'PRIVATE_ROOM', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-02-01', contact_name: 'Aditya C.', contact_email: 'aditya@example.com', source_url: 'https://maps.google.com/?q=18.5204,73.8567' },
  { latitude: 18.5679, longitude: 73.9143, address: 'Viman Nagar, near Phoenix Mall', city: 'Pune', neighborhood: 'Viman Nagar', title: '2BHK — Viman Nagar, 1 Room Available', description: 'One room in 2BHK. IT professionals as flatmates. Gated society, gym access. Near airport.', rent_monthly: 12000, room_type: 'PRIVATE_ROOM', gender_preference: 'MALE_ONLY', status: 'AVAILABLE', available_from: '2025-01-28', contact_name: 'Siddharth L.', contact_phone: '+91 9765432109', source_url: 'https://maps.google.com/?q=18.5679,73.9143' },
  { latitude: 12.9784, longitude: 77.6408, address: 'Koramangala 5th Block', city: 'Bangalore', neighborhood: 'Koramangala', title: 'Premium 3BHK — Koramangala 5th Block', description: 'High-end 3BHK. Designer interiors, modular kitchen, 2 covered parking. Rooftop pool.', rent_monthly: 55000, room_type: 'ENTIRE_FLAT', gender_preference: 'ANY', status: 'AVAILABLE', available_from: '2025-02-01', contact_name: 'Deepak N.', contact_email: 'deepak@example.com', source_url: 'https://maps.google.com/?q=12.9784,77.6408' },
  { latitude: 13.0012, longitude: 77.5553, address: 'Sadashivanagar, Palace Road', city: 'Bangalore', neighborhood: 'Sadashivanagar', title: 'Shared Room — Sadashivanagar', description: 'Bed in clean shared room. Ideal for students/interns. All utilities included.', rent_monthly: 7500, room_type: 'SHARED_ROOM', gender_preference: 'ANY', status: 'RESERVED', available_from: '2025-03-01', contact_name: 'Kavita S.', contact_email: 'kavita@example.com', source_url: 'https://maps.google.com/?q=13.0012,77.5553' },
];

async function main() {
  console.log('🌱 Seeding Supabase...');

  const { error: deleteError } = await supabase.from('listings').delete().neq('id', '');
  if (deleteError) console.warn('Could not clear table:', deleteError.message);

  const { data, error } = await supabase.from('listings').insert(sampleListings).select('id');

  if (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data?.length} listings into Supabase.`);
}

main();
