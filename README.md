# ResallOps Radar

Base de stack pour un projet interne de detection d'opportunites iPhone.

## Stack

- Next.js App Router
- TypeScript
- API routes pour health, opportunities et scoring
- Connecteurs Supabase prets a brancher

## Demarrage

1. Installer les dependances avec `npm install`
2. Copier `.env.example` vers `.env.local`
3. Renseigner les variables Supabase
4. Lancer `npm run dev`

## Connexion Supabase

- `NEXT_PUBLIC_SUPABASE_URL` est deja pre-rempli avec votre projet
- ajoutez `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ajoutez `SUPABASE_SERVICE_ROLE_KEY`
- executez [schema.sql](C:/Users/prene/OneDrive/Bureau/resallOps/supabase/schema.sql) dans l'editeur SQL Supabase

Tant que les variables ne sont pas renseignees, l'application utilise automatiquement les donnees mock.

## Premiers modules poses

- `app/page.tsx` : dashboard MVP
- `app/api/score/route.ts` : logique d'estimation
- `lib/supabase/*` : clients de connexion
- `lib/mock-data.ts` : donnees de demonstration
- `app/inventory/page.tsx` : gestion de stock iPhone
- `app/api/inventory/route.ts` : lecture et creation des appareils
- `supabase/schema.sql` : tables `iphone_models` et `inventory_items`

## Suite logique

- executer a nouveau `supabase/schema.sql` pour ajouter les tables stock
- saisir vos appareils dans `/inventory`
- ajouter ensuite les flux de reparation detaillee ou de vente si besoin
