-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

create table if not exists listings (
  id                text primary key default gen_random_uuid()::text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  latitude          float8 not null,
  longitude         float8 not null,
  address           text not null,
  city              text not null,
  neighborhood      text,
  title             text not null,
  description       text,
  rent_monthly      int4 not null,
  room_type         text not null default 'PRIVATE_ROOM',
  gender_preference text not null default 'ANY',
  status            text not null default 'AVAILABLE',
  available_from    timestamptz,
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  source_url        text
);

-- Indexes for fast map bounds queries
create index if not exists listings_lat_lng_idx  on listings (latitude, longitude);
create index if not exists listings_status_idx   on listings (status);
create index if not exists listings_rent_idx     on listings (rent_monthly);
create index if not exists listings_city_idx     on listings (city);

-- Row Level Security (required for the anon/publishable key to work)
alter table listings enable row level security;

create policy "Anyone can read listings"
  on listings for select using (true);

create policy "Anyone can post listings"
  on listings for insert with check (true);
