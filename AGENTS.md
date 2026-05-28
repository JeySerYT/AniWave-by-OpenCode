# AniWave - Agent Instructions

## Project Overview

AniWave is an anime catalog web application built with React + Vite, using AniLibria API for anime data. Features include anime search with filters, collections system (watching/completed/planned), user profiles with OAuth authentication (Google/GitHub), video player with HLS, and informational pages (FAQ, Terms, Privacy, DMCA).

## Tech Stack

### Frontend
- React 18 + Vite 5
- AniLibria API (REST, `anilibria.top/api/v1`)
- @tanstack/react-query
- Framer Motion (анимации)
- React Router
- HLS.js (видео плеер)

### Backend
- FastAPI (Python)
- SQLAlchemy + PostgreSQL
- JWT Authentication (httpOnly cookies)
- OAuth (Google/GitHub)

## Build / Lint / Test Commands

### Frontend
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Backend
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run backend
py backend/main.py
# or
cd backend && uvicorn app.main:app --reload --port 8081

# Run with custom port
PORT=8082 py backend/main.py
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8081/api
```

### Backend (backend/.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=aniwave

JWT_SECRET=your-secret-key-min-32-chars

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8081
PORT=8081
```

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:8081/api/auth/oauth/google/callback`
4. Copy credentials to `.env`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Add authorization callback URL: `http://localhost:8081/api/auth/oauth/github/callback`
4. Copy credentials to `.env`

## Code Style Guidelines

### General Principles
- Use functional React components with hooks
- Prefer named exports for hooks and utilities
- Use default exports for page components and UI components
- Keep components focused and single-purpose
- Avoid unnecessary comments in code
- Avoid magic numbers - use constants or CSS variables
- Always run `npm run build` before committing

### File Structure
```
src/
├── api/           # AniLibria API client (anilibria.js) and backend config (config.js)
├── components/    # Reusable UI components (Header, Footer, AnimeCard, Hero, etc.)
├── context/       # React Context providers (LanguageContext, AuthContext)
├── hooks/         # Custom hooks (useAnime, useSearch, useCollections, etc.)
├── locales/       # i18n translation files
├── pages/         # Page components (Home, Search, Profile, AnimeDetails, AnimeWatch, etc.)
├── styles/        # Global CSS (variables.css, globals.css)
├── utils/         # Utilities (translation.js)
└── assets/        # Static assets (logo.svg, favicon.svg)

backend/
├── app/
│   ├── routers/      # API endpoints (auth.py, profile.py, favorites.py, watch_progress.py)
│   ├── services/     # Business logic (user_service.py, favorite_service.py)
│   ├── models/       # SQLAlchemy models (models.py)
│   ├── schemas/      # Pydantic schemas (schemas.py)
│   ├── utils/        # Utilities (auth.py)
│   └── database.py   # Database connection
├── main.py           # FastAPI app entry point
└── requirements.txt  # Python dependencies
```

### Imports Order
1. React and hooks
2. Third-party libraries (@tanstack/react-query, framer-motion, react-router-dom)
3. Internal modules (api/, context/, hooks/)
4. Components
5. Styles (CSS files)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AnimeCard`, `HeroSection` |
| Hooks | camelCase with `use` prefix | `useAnime`, `useSearch` |
| CSS files | kebab-case matching component | `AnimeCard.css`, `hero-section.css` |
| Variables | camelCase | `animeList`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS`, `API_URL` |
| CSS classes | kebab-case | `.anime-card`, `.hero-title` |

### Component Structure

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Component.css';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
  }, [dependency]);

  const handleClick = () => {
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <motion.div
      className="component-name"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Title</h1>
    </motion.div>
  );
};

export default ComponentName;
```

### CSS Guidelines

- Use CSS variables from `src/styles/variables.css`
- Use `cubic-bezier(0.4, 0, 0.2, 1)` for smooth transitions
- Use `clamp()` for responsive font sizes
- Keep transitions between 0.3s-0.4s for smoothness
- Use `border-radius: 9999px` for pill-shaped elements
- Use `border-radius: 16px` or `20px` for cards and modals

### CSS Variables Available
```css
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-card: #1a1a1a;
--bg-elevated: #222222;
--accent-red: #E53935;
--accent-pink: #FF4081;
--text-primary: #ffffff;
--text-secondary: #aaa;
--text-muted: #888;
--border-subtle: rgba(255, 255, 255, 0.1);
```

### Authentication Flow

#### OAuth (Google/GitHub)
1. Frontend calls `/api/auth/oauth/{provider}` → gets auth_url
2. User is redirected to Google/GitHub
3. OAuth provider redirects to `/api/auth/oauth/{provider}/callback`
4. Backend exchanges code for tokens, creates user if not exists
5. Backend sets tokens as httpOnly cookies (access_token — 15min, refresh_token — 7 days)
6. Backend redirects to `/profile?logged_in=true`

#### Email/Password Auth
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Backend sets httpOnly cookies on success
3. AuthContext calls `/api/auth/me` with `credentials: 'include'` to get user data

### Profile & Collections

- Collections (watching/completed/planned) stored on backend
- Profile fields (avatar, banner, bio, username) stored on backend
- Avatar/banner upload via FileReader → base64 → PUT /api/profile
- Collections: GET/POST /api/favorites, PATCH/DELETE /api/favorites/{id}

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main page with trending/popular/ongoing anime |
| Search | `/search` | Anime search with filters (genre, year, status, sort) |
| Profile | `/profile` | User profile with collections (watching/completed/planned) |
| AnimeDetails | `/anime/:code` | Anime details page with related/similar |
| AnimeWatch | `/anime/:code/watch` | Video player with HLS, quality selector, episode list |
| FAQ | `/faq` | Frequently asked questions |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |
| DMCA | `/dmca` | DMCA notice |
| Login | `/login` | Login with email/password or OAuth |
| Register | `/register` | Registration with email/password |
| OAuthCallback | `/oauth/callback/:provider` | OAuth redirect handler |

### AniLibria API

- Uses AniLibria REST API (https://anilibria.top/api/v1)
- All fetches via `fetchWithTimeout()` in `src/api/anilibria.js`
- @tanstack/react-query for caching (staleTime: 5min, gcTime: 10min)
- Endpoints: getTitle, getTitleList, getTitleUpdates, getTitleOngoing, getSchedule, getGenres, getYears, searchTitles, getTopAnime

### API Endpoints (Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Email/password registration |
| `/auth/login` | POST | Email/password login |
| `/auth/logout` | POST | Logout |
| `/auth/me` | GET | Get current user |
| `/auth/oauth/{provider}` | GET | Get OAuth auth_url |
| `/profile` | PUT | Update profile |
| `/favorites` | GET/POST | List/add collections |
| `/favorites/{anime_id}` | PATCH/DELETE | Update/remove collection item |
| `/watch-progress` | GET/POST | List/save watch progress |

### Error Handling

- Always handle loading and error states in components
- Use ErrorMessage component for error display
- Wrap async operations in try/catch
- Provide fallback values for API data
- Backend returns proper HTTP status codes (400, 401, 409, 500)

### Performance Considerations

- Use `loading="lazy"` for images
- Memoize expensive computations with useMemo
- Use useCallback for event handlers passed as props
- Use proper key props in lists

### Animations

- Use Framer Motion for page transitions and component animations
- Keep animation duration between 0.3s-0.6s
- Use staggered delays (0.03s-0.05s per item) for lists
- Use cubic-bezier(0.25, 0.46, 0.45, 0.94) for smooth easing
- Use drop-shadow for glow effects on text

### Git Workflow

- Commit message format: `type: description`
- Types: feat, fix, refactor, style, docs, test, chore
- Example: `feat: add search filters`, `fix: card hover effect`
- Always run `npm run build` before committing to verify no errors
- Frontend and backend changes should be on the same branch

### Sub-agents Usage

When using sub-agents for complex tasks:
1. Use 2-3 agents: one for writing code, one for reviewing
2. Always verify changes with `npm run build` (frontend) or test import (backend)
3. Report errors found by reviewers
4. Apply fixes manually if agents fail
