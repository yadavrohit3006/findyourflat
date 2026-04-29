export interface CityConfig {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  zoom: number;
  tagline: string;
  description: string;
  neighborhoods: string[];
}

export const CITIES: CityConfig[] = [
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    zoom: 12,
    tagline: 'Find flats and flatmates in Bangalore without a broker',
    description:
      'Bangalore is home to India\'s largest tech workforce, and finding the right flat can be overwhelming. FindYourFlat shows you verified listings across HSR Layout, Koramangala, Whitefield, Indiranagar, and more — all on an interactive map. No brokerage, no spam calls.',
    neighborhoods: ['HSR Layout', 'Koramangala', 'Indiranagar', 'Whitefield', 'BTM Layout', 'Marathahalli'],
  },
  {
    slug: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    lat: 28.4595,
    lng: 77.0266,
    zoom: 12,
    tagline: 'Find flats and flatmates in Gurugram without a broker',
    description:
      'Gurugram\'s rapid growth has made flat-hunting stressful — but it doesn\'t have to be. Browse listings across Sector 52, DLF Phase, Golf Course Road, and Sohna Road directly on the map. See what\'s available near your office and filter by budget, flat type, and more.',
    neighborhoods: ['Sector 52', 'DLF Phase 1', 'Golf Course Road', 'Sohna Road', 'MG Road', 'Cyber City'],
  },
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    zoom: 12,
    tagline: 'Find flats and flatmates in Mumbai without a broker',
    description:
      'In a city where every square foot counts, finding an affordable flat in Mumbai is a challenge. FindYourFlat maps available rooms and flats across Andheri, Bandra, Powai, Lower Parel, and more — so you can find what\'s near your workplace before you even visit.',
    neighborhoods: ['Andheri', 'Bandra', 'Powai', 'Lower Parel', 'Goregaon', 'Malad'],
  },
  {
    slug: 'delhi',
    name: 'Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    zoom: 12,
    tagline: 'Find flats and flatmates in Delhi without a broker',
    description:
      'Delhi\'s rental market is diverse — from South Delhi\'s upscale colonies to affordable options in Dwarka and Rohini. Browse listings on the map, compare locations, and connect directly with landlords and flatmates without paying brokerage.',
    neighborhoods: ['Lajpat Nagar', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Karol Bagh'],
  },
  {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    zoom: 12,
    tagline: 'Find flats and flatmates in Pune without a broker',
    description:
      'Pune\'s booming IT corridors and student population create a constant demand for quality shared flats. Browse listings near Hinjawadi, Kothrud, Baner, Aundh, and Viman Nagar — all pinned on the map so you can plan your commute before you commit.',
    neighborhoods: ['Hinjawadi', 'Kothrud', 'Baner', 'Aundh', 'Viman Nagar', 'Kharadi'],
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    zoom: 12,
    tagline: 'Find flats and flatmates in Hyderabad without a broker',
    description:
      'Hyderabad\'s HITEC City and Financial District have driven a surge in rental demand. Find your next flat in Gachibowli, Kondapur, Madhapur, or Jubilee Hills — directly on the map, with no middlemen involved.',
    neighborhoods: ['Gachibowli', 'Kondapur', 'Madhapur', 'Jubilee Hills', 'Kukatpally', 'Banjara Hills'],
  },
  {
    slug: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    lat: 28.5355,
    lng: 77.3910,
    zoom: 12,
    tagline: 'Find flats and flatmates in Noida without a broker',
    description:
      'Noida is one of the fastest-growing cities in the NCR, with a vibrant rental market across Sector 18, 62, 63, and 137. FindYourFlat helps you discover affordable rooms and flats near your office — no broker fee, no wasted site visits.',
    neighborhoods: ['Sector 18', 'Sector 62', 'Sector 63', 'Sector 137', 'Sector 50', 'Expressway'],
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    zoom: 12,
    tagline: 'Find flats and flatmates in Chennai without a broker',
    description:
      'Chennai\'s IT corridor along OMR and the growing startup scene in Anna Nagar and Velachery have created strong demand for rental flats. Browse the map to find your next home near your workplace, with real listings from real people.',
    neighborhoods: ['OMR', 'Anna Nagar', 'Velachery', 'Adyar', 'T. Nagar', 'Porur'],
  },
];

export function getCityBySlug(slug: string): CityConfig | undefined {
  return CITIES.find((c) => c.slug === slug);
}
