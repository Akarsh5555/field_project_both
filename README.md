# FieldAssist - Unified Monorepo

FieldAssist is a full-stack Enterprise Sales Force Automation (SFA) and Field Operations Management platform. This repository unifies the client-side portal and server-side backend foundation into a single monorepo.

---

## 📁 Repository Structure

```text
fieldassist/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                  # Unified API service layer & clients
│   │   ├── components/           # UI components, layout, maps, and guards
│   │   ├── context/              # Authentication & global application state
│   │   ├── integrations/         # Supabase client & real-time bindings
│   │   ├── pages/                # Dashboard, Beat Plans, Orders, Visits, etc.
│   │   └── types/                # TypeScript interfaces & domain models
│   ├── public/                   # Static assets & PWA files
│   └── package.json
│
├── backend/                      # Supabase + Drizzle ORM + PostgreSQL + Edge Functions
│   ├── drizzle/                  # Schema definitions & versioned SQL migrations
│   ├── scripts/                  # Seed scripts, verification suites & dev server
│   ├── src/                      # Backend integrations, geolocation & queries
│   ├── supabase/                 # Edge functions (orders, visits, products, retailers)
│   └── package.json
│
├── .gitignore                    # Monorepo git ignore rules
├── package.json                  # Root monorepo scripts
└── README.md                     # Documentation
```

---

## 🚀 Features

- **Multi-Role Access Control (RBAC):** Dedicated workflows for Admin, Sales Manager, and Field Sales Representatives.
- **GPS Beat Planning & Route Optimization:** Interactive OpenStreetMap route visualizer and schedule tracker without external map API key requirements.
- **Order & Inventory Tracking:** End-to-end order processing, catalog pricing, and stock visibility.
- **Attendance & Geofenced Visits:** Check-in / check-out with GPS geolocation validation and merchant feedback.
- **Retailer & Distributor CRM:** Hierarchy management with credit limits, beat assignments, and contact records.
- **Executive Analytics:** Real-time revenue charts, target vs. actual metrics, and team performance dashboards.

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun**

### 2. Install All Dependencies
Run from the root directory:
```bash
npm run install:all
```
Or install in each directory individually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3. Environment Variables

#### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://your-backend-api.example.com/api/v1
VITE_USE_MOCK_FALLBACK=true
```

#### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
VITE_SUPABASE_URL="https://your_project.supabase.co"
```

### 4. Running the Applications

#### Run Frontend:
```bash
npm run dev:frontend
```
Frontend development server will be available at `http://localhost:5173`.

#### Run Backend Dev Server / Migrations:
```bash
npm run dev:backend
```

---

## 🔀 Git Lineage & Origins

This monorepo was created by merging both original codebases while preserving complete Git history from both repositories:
- **Frontend Source:** [https://github.com/tilak2007/field_poject_front_end.git](https://github.com/tilak2007/field_poject_front_end.git)
- **Backend Source:** [https://github.com/Akarsh5555/fieldassist-backend-foundation.git](https://github.com/Akarsh5555/fieldassist-backend-foundation.git)
