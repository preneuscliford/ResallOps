create extension if not exists pgcrypto;

create table if not exists public.iphone_models (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null unique,
  sort_order integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null,
  location text not null,
  asking_price integer not null check (asking_price >= 0),
  repair_estimate integer not null default 0 check (repair_estimate >= 0),
  resale_estimate integer not null check (resale_estimate >= 0),
  estimated_margin integer not null default 0,
  score integer not null default 0 check (score >= 0 and score <= 100),
  risk_level text not null check (risk_level in ('Faible', 'Moyen', 'Eleve')),
  recommended_action text not null check (recommended_action in ('Contacter', 'Negocier', 'Ignorer')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists opportunities_score_idx on public.opportunities (score desc);
create index if not exists opportunities_created_at_idx on public.opportunities (created_at desc);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.iphone_models(id) on delete restrict,
  storage_gb integer not null check (storage_gb in (64, 128, 256, 512, 1024)),
  color text,
  status text not null check (status in ('En stock', 'En reparation', 'Pret a vendre', 'Vendu')),
  purchase_price integer not null check (purchase_price >= 0),
  repair_cost integer not null default 0 check (repair_cost >= 0),
  sale_price integer check (sale_price >= 0),
  sale_margin integer generated always as (
    case
      when sale_price is null then null
      else sale_price - purchase_price - repair_cost
    end
  ) stored,
  imei text,
  notes text,
  purchase_date date not null default current_date,
  sold_at date,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists inventory_items_status_idx on public.inventory_items (status);
create index if not exists inventory_items_created_at_idx on public.inventory_items (created_at desc);

insert into public.iphone_models (slug, display_name, sort_order)
values
  ('iphone-xr', 'iPhone XR', 10),
  ('iphone-xs', 'iPhone XS', 20),
  ('iphone-xs-max', 'iPhone XS Max', 30),
  ('iphone-11', 'iPhone 11', 40),
  ('iphone-11-pro', 'iPhone 11 Pro', 50),
  ('iphone-11-pro-max', 'iPhone 11 Pro Max', 60),
  ('iphone-12-mini', 'iPhone 12 mini', 70),
  ('iphone-12', 'iPhone 12', 80),
  ('iphone-12-pro', 'iPhone 12 Pro', 90),
  ('iphone-12-pro-max', 'iPhone 12 Pro Max', 100),
  ('iphone-13-mini', 'iPhone 13 mini', 110),
  ('iphone-13', 'iPhone 13', 120),
  ('iphone-13-pro', 'iPhone 13 Pro', 130),
  ('iphone-13-pro-max', 'iPhone 13 Pro Max', 140),
  ('iphone-14', 'iPhone 14', 150),
  ('iphone-14-plus', 'iPhone 14 Plus', 160),
  ('iphone-14-pro', 'iPhone 14 Pro', 170),
  ('iphone-14-pro-max', 'iPhone 14 Pro Max', 180),
  ('iphone-15', 'iPhone 15', 190),
  ('iphone-15-plus', 'iPhone 15 Plus', 200),
  ('iphone-15-pro', 'iPhone 15 Pro', 210),
  ('iphone-15-pro-max', 'iPhone 15 Pro Max', 220),
  ('iphone-16', 'iPhone 16', 230),
  ('iphone-16-plus', 'iPhone 16 Plus', 240),
  ('iphone-16-pro', 'iPhone 16 Pro', 250),
  ('iphone-16-pro-max', 'iPhone 16 Pro Max', 260)
on conflict (slug) do nothing;

alter table public.opportunities enable row level security;
alter table public.iphone_models enable row level security;
alter table public.inventory_items enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'opportunities'
      and policyname = 'Public read opportunities'
  ) then
    create policy "Public read opportunities"
      on public.opportunities
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'iphone_models'
      and policyname = 'Public read iphone models'
  ) then
    create policy "Public read iphone models"
      on public.iphone_models
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory_items'
      and policyname = 'Public read inventory items'
  ) then
    create policy "Public read inventory items"
      on public.inventory_items
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

insert into public.opportunities (
  title,
  platform,
  location,
  asking_price,
  repair_estimate,
  resale_estimate,
  estimated_margin,
  score,
  risk_level,
  recommended_action
)
values
  (
    'iPhone 13 128 Go - ecran casse',
    'Leboncoin',
    'Saint-Denis',
    220,
    65,
    385,
    100,
    88,
    'Faible',
    'Contacter'
  ),
  (
    'iPhone 12 mini - batterie fatiguee',
    'eBay',
    'Paris 18e',
    170,
    30,
    275,
    75,
    74,
    'Moyen',
    'Negocier'
  ),
  (
    'iPhone 11 - ne s''allume plus',
    'Leboncoin',
    'Creteil',
    145,
    90,
    230,
    -5,
    38,
    'Eleve',
    'Ignorer'
  )
on conflict do nothing;

insert into public.inventory_items (
  model_id,
  storage_gb,
  color,
  status,
  purchase_price,
  repair_cost,
  sale_price,
  imei,
  notes,
  purchase_date,
  sold_at
)
select
  m.id,
  128,
  'Bleu',
  'Pret a vendre',
  90,
  35,
  179,
  null,
  'Batterie remplacee, ecran teste.',
  current_date - 7,
  null
from public.iphone_models m
where m.slug = 'iphone-xr'
  and not exists (
    select 1
    from public.inventory_items i
    where i.model_id = m.id
      and i.purchase_price = 90
      and i.storage_gb = 128
  );
