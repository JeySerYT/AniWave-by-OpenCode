# AniWave - Agent Instructions

## Project Overview

AniWave is an anime catalog web application built with React + Vite, using AniList GraphQL API.

## Build / Lint / Test Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build locally
npm run preview
```

## Code Style Guidelines

### General Principles
- Use functional React components with hooks
- Prefer named exports for hooks and utilities
- Use default exports for page components and UI components
- Keep components focused and single-purpose

### File Structure
```
src/
├── api/           # Apollo Client setup and GraphQL queries
├── components/    # Reusable UI components (Header, AnimeCard, Hero, etc.)
├── context/       # React Context providers (LanguageContext)
├── hooks/        # Custom hooks (useAnime, useSearch, useFavorites)
├── locales/      # i18n translation files
├── pages/        # Page components (Home, Search, Profile, AnimeDetails)
├── styles/       # Global CSS (variables.css, globals.css, animations.css)
└── assets/       # Static assets (logo.svg)
```

### Imports Order
1. React and hooks
2. Third-party libraries (@apollo/client, framer-motion, react-router-dom)
3. Internal modules (api/, context/, hooks/)
4. Components
5. Styles (CSS files)

```jsx
// Correct import order
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { LanguageProvider } from '../context/LanguageContext';
import AnimeCard from '../components/AnimeCard';
import './Component.css';
```

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
  // Hooks first
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // effect logic
  }, [dependency]);

  // Handlers
  const handleClick = () => {
    // handler logic
  };

  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  // Render
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
- Use border-radius: 9999px for pill-shaped elements

### CSS Variables Available
```css
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-card: #1a1a1a;
--accent-red: #E53935;
--accent-pink: #FF4081;
--text-primary: #ffffff;
--text-secondary: #aaa;
--text-muted: #888;
--border-subtle: rgba(255, 255, 255, 0.1);
```

### AniList API

- Uses AniList GraphQL API (https://graphql.anilist.co)
- Apollo Client for state management
- Queries are in `src/api/queries.js`
- Custom hooks in `src/hooks/` wrap useQuery

### Error Handling

- Always handle loading and error states in components
- Use ErrorMessage component for error display
- Wrap async operations in try/catch
- Provide fallback values for API data

### Performance Considerations

- Use `loading="lazy"` for images
- Memoize expensive computations with useMemo
- Use useCallback for event handlers passed as props
- Use proper key props in lists

### Animations

- Use Framer Motion for page transitions and component animations
- Keep animation duration between 0.3s-0.6s
- Use staggered delays (0.03s-0.05s per item) for lists
- Use cubic-bezier(0.4, 0, 0.2, 1) for smooth easing

### Git Workflow

- Commit message format: `type: description`
- Types: feat, fix, refactor, style, docs, test, chore
- Example: `feat: add search filters`, `fix: card hover effect`
- Always run `npm run build` before committing to verify no errors
