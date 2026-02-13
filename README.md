# Compliance Registry Frontend

Next.js + React + Tailwind frontend for Supabase (Postgres).

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure Supabase**:
   - Edit `.env.local` and add your Supabase project URL and anon key.
   - Get these from: **Supabase Dashboard → Project Settings → API**

3. **Run the dev server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Pages

- **Site Dashboard** (`/`) – Pick a site, see equipment and open task counts
- **Equipment List** (`/sites/[siteId]/equipment`) – Equipment for a site with open task count
- **Equipment Detail** (`/sites/[siteId]/equipment/[equipmentId]`) – Requirements and tasks for equipment
- **Tasks** (`/tasks`) – Open tasks with filters (site, status)

## Data Model

- **Read**: Uses `public.site_equipment_requirements_tasks_v` view for lists
- **Write**: Uses tables (`tasks`, etc.) for inserts/updates
