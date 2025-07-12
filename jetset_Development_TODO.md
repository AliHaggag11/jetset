
# 🧭 JetSet – AI Travel Planner SaaS
### Stack: Next.js + Supabase + Groq AI API

---

## ✅ Phase 0: Planning & Setup

- [ ] Define user personas (e.g. solo traveler, budget couple, group of friends)
- [ ] Finalize core features for MVP
- [ ] Set up GitHub repo (monorepo or split)
- [ ] Create a basic roadmap and milestones
- [ ] Register domain and set up Vercel/Supabase projects
- [ ] Get Groq API key: https://console.groq.com/keys

---

## ⚙️ Phase 1: Project Bootstrap

### 🔹 1. Frontend Setup (Next.js)

- [ ] Scaffold Next.js project (App Router)
- [ ] Install Tailwind CSS
- [ ] Install shadcn/ui
- [ ] Set up base layout: Header, Footer, Main container
- [ ] Add environment config (.env.local)
  - `NEXT_PUBLIC_SUPABASE_URL=`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
  - `GROQ_API_KEY=`

---

### 🔹 2. Backend Setup (Supabase)

- [ ] Create Supabase project
- [ ] Enable Email Auth
- [ ] Set up database tables:

```sql
-- users table (default from Supabase Auth)

create table trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  title text,
  destination text,
  start_date date,
  end_date date,
  budget int,
  persona text,
  created_at timestamp default now()
);

create table trip_preferences (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips on delete cascade,
  interest_culture boolean,
  interest_food boolean,
  interest_nature boolean,
  interest_shopping boolean,
  interest_nightlife boolean
);

create table itineraries (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips on delete cascade,
  day int,
  content jsonb,
  cost_estimate int,
  created_at timestamp default now()
);

create table deal_alerts (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips on delete cascade,
  type text,
  description text,
  link text,
  is_active boolean default true,
  created_at timestamp default now()
);

create table ai_requests (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips on delete cascade,
  prompt text,
  response text,
  created_at timestamp default now()
);
```

---

## 🧠 Phase 2: AI Integration

### 🔹 3. Groq AI Setup

- [x] Create `lib/groq.ts` (server-side AI)
- [x] Create `lib/types.ts` (shared interfaces)
- [x] Write generic `generateGroqResponse(prompt: string): Promise<string>`
- [x] Create prompt templates:
  - [x] Itinerary generation
  - [x] Cost estimation
  - [x] Personality-based variation
  - [x] Group plan compromise

---

## 🧑‍💻 Phase 3: Core Feature Development

### 🔹 4. Auth

- [ ] Set up Supabase Auth
- [ ] Create login/signup/logout flow
- [ ] Protect routes (dashboard, trip planner)

---

### 🔹 5. Trip Wizard (Trip Creation Flow)

- [ ] Step 1: Trip name, destination, travel dates
- [ ] Step 2: Total budget
- [ ] Step 3: Persona (dropdown: foodie, adventurer, family, etc.)
- [ ] Step 4: Interests (checkboxes: culture, nightlife, nature, etc.)
- [ ] [Submit] → save trip + preferences to Supabase

---

### 🔹 6. Itinerary Page

- [ ] Load trip + preferences
- [x] Build `generateItinerary()` call using Groq
- [ ] Display day-by-day itinerary using cards
- [ ] Show estimated cost per day
- [ ] Save itinerary JSON to Supabase
- [ ] Allow regenerate/edit plan

---

### 🔹 7. Deal Alert System (MVP)

- [ ] Build mock deals list (hardcoded or dummy API)
- [ ] Display live deal alerts linked to itinerary
- [ ] Add basic CRON placeholder for future price check
- [ ] Save deals to Supabase

---

### 🔹 8. Saved Trips & Dashboard

- [ ] Create dashboard to list user’s trips
- [ ] Each card shows trip summary + status
- [ ] Link to view/edit itinerary

---

### 🔹 9. AI Chat Assistant (Optional MVP+)

- [ ] Simple chat UI with Groq (Q&A about trip)
- [ ] Add chat context to AI prompts
- [ ] Log prompt/response to `ai_requests` table

---

## 💅 Phase 4: Polish & Launch

- [ ] Create landing page: “Plan Your Dream Trip for Less — With AI”
- [ ] Add shareable public itinerary link (`/public/trip/:id`)
- [ ] Add PDF/print/export option (MVP+)
- [ ] Add SEO metadata, OG tags
- [ ] Test mobile PWA behavior
- [ ] Set up Vercel deploy preview
- [ ] Test all edge cases & empty states

---

## 🚀 Phase 5: Launch & Marketing

- [ ] Launch teaser page with waitlist
- [ ] Submit to Product Hunt
- [ ] Create TikTok/YT Shorts demo: “AI Planned My Paris Trip in $800”
- [ ] Reach out to travel influencers
- [ ] Collect user feedback & iterate

---

## ✏️ Cursor IDE Prompt

```
You are an expert full-stack developer assisting with building an AI-powered travel planning SaaS. The stack includes:

- Frontend: Next.js (App Router) with Tailwind CSS and shadcn/ui
- Backend: Supabase (PostgreSQL, Auth)
- AI: Groq API (free tier - 14,400 requests/day)

The product lets users:
- Create a trip with destination, dates, budget, and interests
- Generate an AI-based itinerary using Groq
- Estimate total trip cost
- Get real-time deal alerts (future feature)
- Save and view multiple trips
- Optional: group trip coordination and personality-based plans

You will help with:
- Writing clean TypeScript and React code
- Integrating Supabase (Auth + DB) into frontend
- Calling Groq API securely and efficiently
- Building a trip wizard, itinerary viewer, and dashboard
- Handling async flows, loading states, and edge cases
- Following good UX, performance, and code quality practices

Start by helping me build the Trip Wizard page as a multi-step form using shadcn/ui components. Keep the state between steps and store user input locally before sending to Supabase.
```
