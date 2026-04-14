# FindYourFlat

A map-based flat and room discovery platform. Browse listings directly on an interactive map, filter by rent/room type, and post your own listing in under 2 minutes.

---

## Features

- **Full-screen Mapbox map** — browse all listings as rent-price pins
- **Marker clustering** — pins group together at low zoom, expand on click
- **Listing popup** — click any pin to see title, rent, room type, and contact
- **Smart filters** — filter by rent range, room type, availability, gender preference
- **Add Listing flow** — paste a Google Maps URL → coordinates extracted automatically
- **Mobile responsive** — filter panel becomes a bottom sheet on small screens

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Map | Mapbox GL JS via `react-map-gl` v7 |
| Clustering | `use-supercluster` |
| Database | PostgreSQL + Prisma ORM |
| Forms | `react-hook-form` + Zod |
| Data fetching | SWR |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted DB)
- A [Mapbox account](https://account.mapbox.com/) (free tier is sufficient)

---

## Quick Start

### 1. Install dependencies

```bash
cd findyourflat
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Get this from https://account.mapbox.com/ → Tokens
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiLi4uIn0...

# Your PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/findyourflat
```

### 3. Set up the database

```bash
# Create the database tables
npm run db:push

# (Optional) Seed with 12 sample listings across Bangalore, Delhi, Mumbai, Pune
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the map with listing pins.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox public token. Safe to expose in browser (restrict by URL in Mapbox dashboard). |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to DB without migration history |
| `npm run db:migrate` | Run migrations (for production) |
| `npm run db:seed` | Seed sample listings |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage (map + filters)
│   ├── add-listing/page.tsx    # Add listing form page
│   └── api/listings/
│       ├── route.ts            # GET (bounds query) + POST (create)
│       └── [id]/route.ts       # GET single listing
├── components/
│   ├── MapView.tsx             # Main map (SSR-safe, loaded with next/dynamic)
│   ├── ListingMarker.tsx       # Individual price pin
│   ├── ClusterMarker.tsx       # Cluster bubble
│   ├── ListingPopup.tsx        # Popup shown on marker click
│   ├── FiltersPanel.tsx        # Floating filters (desktop) + bottom sheet (mobile)
│   ├── AddListingForm.tsx      # Multi-section listing form
│   ├── MapSkeleton.tsx         # SSR placeholder
│   └── ui/                     # Button, Input, Select, Badge, Textarea
├── hooks/
│   ├── useListings.ts          # SWR hook for bounds-based listing fetch
│   ├── useFilters.ts           # Filter state management
│   └── useDebounce.ts          # Generic debounce hook
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── parseGoogleMapsUrl.ts   # Google Maps URL → {lat, lng}
│   ├── validations.ts          # Zod schemas
│   └── utils.ts                # cn(), formatRent(), labels etc.
└── types/index.ts              # All shared TypeScript types
```

---

## Google Maps URL Parsing

When posting a listing, users paste a Google Maps URL. The app extracts coordinates from:

| URL format | Example |
|-----------|---------|
| `?q=lat,lng` | `https://maps.google.com/?q=12.9352,77.6245` |
| `@lat,lng,Xz` | `https://www.google.com/maps/@12.9352,77.6245,15z` |
| Place + `@` | `https://www.google.com/maps/place/Name/@12.9352,77.6245,15z` |
| Embed `!3d!4d` | `https://www.google.com/maps/...!3d12.9352!4d77.6245` |

**How to get a pin URL:**
1. Open Google Maps
2. Right-click any location → "What's here?"
3. Click the coordinates shown at the bottom → copies the URL

---

## API Reference

### `GET /api/listings`

Fetch listings within a map bounding box.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `bounds` | `string` | Required. `west,south,east,north` |
| `rentMin` | `number` | Minimum rent (default 0) |
| `rentMax` | `number` | Maximum rent (default 500000) |
| `roomTypes` | `string` | Comma-separated: `PRIVATE_ROOM,STUDIO` |
| `status` | `string` | `AVAILABLE`, `RESERVED`, or omit for all |
| `genderPreference` | `string` | `ANY`, `MALE_ONLY`, `FEMALE_ONLY` |

**Response:** `{ listings: ListingMapPoint[], total: number }`

---

### `POST /api/listings`

Create a new listing.

**Body:** JSON matching `CreateListingInput` (see `src/types/index.ts`)

**Response:** Full `Listing` object with `201 Created`

---

### `GET /api/listings/:id`

Fetch full listing details including contact info.

---

## Production Checklist

- [ ] Set `NEXT_PUBLIC_MAPBOX_TOKEN` to a token **restricted to your domain**
- [ ] Use `prisma migrate deploy` instead of `db:push` for production
- [ ] Add rate limiting to POST `/api/listings` (e.g. `@upstash/ratelimit`)
- [ ] Set up image uploads (Vercel Blob, S3, or Cloudinary) for listing photos
- [ ] Add authentication (NextAuth.js) to gate listing creation
- [ ] Enable PostGIS extension for production-scale spatial queries
- [ ] Add `Cache-Control` headers to `GET /api/listings` for CDN caching

---

## Sample Data

The seed script (`prisma/seed.ts`) creates 12 realistic listings across:
- **Bangalore** — HSR Layout, Whitefield, BTM Layout, Indiranagar, Koramangala, Sadashivanagar
- **Delhi NCR** — Gurugram Sector 49, Lajpat Nagar
- **Mumbai** — Bandra West, Kurla
- **Pune** — Koregaon Park, Viman Nagar

Rent range: ₹7,500 – ₹55,000/month across all room types.
