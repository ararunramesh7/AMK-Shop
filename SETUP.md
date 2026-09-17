# Aruna Muruku Kadai - Project Setup

## Prerequisites
- Node.js (v18+)
- PostgreSQL (Supabase)
- Expo CLI (for mobile app)

## 1. Database (Supabase)
1. Create a new Supabase project.
2. Go to the SQL Editor in the Supabase Dashboard.
3. Run the SQL scripts in this order:
   - `schema.sql` (Creates tables and functions)
   - `rls-policies.sql` (Applies security policies)
   - `seed.sql` (Inserts initial demo data)

## 2. Web Application (Customer & Admin)
The web application is built with Vite, React, and Tailwind CSS.
```bash
cd web-app
npm install
npm run dev
```
Access the application:
- Customer UI: `http://localhost:5173`
- Admin Dashboard: `http://localhost:5173/admin`

*Note: Create a `.env` file in the `web-app` directory with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.*

## 3. Mobile Application (React Native)
The mobile app is built with Expo.
```bash
cd mobile-app
npm install
npm run android # Or npm run ios / npm run web
```
*Note: Update `lib/supabase.ts` with your actual Supabase URL and Anon Key.*

## Default Admin Credentials
Check the `seed.sql` file for the default admin user inserted into the database.
