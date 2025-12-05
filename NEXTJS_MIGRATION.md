# Vite to Next.js Migration Guide

## ✅ Completed Migration Steps

### 1. Package Configuration
- ✅ Updated `package.json` with Next.js dependencies
- ✅ Removed Vite-specific dependencies
- ✅ Changed scripts to use `next dev`, `next build`, `next start`
- ✅ Installed all dependencies successfully

### 2. Project Structure Created
```
frontend/
├── pages/
│   ├── _app.js          ✅ Created (App wrapper with navigation)
│   ├── _document.js     ✅ Created (HTML document structure)
│   ├── index.js         ✅ Created (Home/Chat page)
│   └── organizer.js     ⏳ To be created
├── components/
│   ├── ChatInterface.js ✅ Created (Migrated from Vite)
│   └── OrganizerDashboard.js ⏳ To be created
├── lib/
│   ├── socket.js        ✅ Created (SSR-safe socket service)
│   └── api.js           ✅ Created (API client)
├── styles/
│   ├── globals.css      ✅ Created (Global styles + navigation)
│   ├── ChatInterface.module.css ✅ Created
│   └── OrganizerDashboard.module.css ⏳ To be created
├── public/              ✅ Ready for static assets
├── next.config.js       ✅ Created
└── package.json         ✅ Updated
```

### 3. Key Changes Made

#### Socket.IO Service (`lib/socket.js`)
- Added SSR safety checks (`typeof window !== 'undefined'`)
- Singleton pattern for client-side only
- Added new AI chat methods
- Compatible with Next.js hydration

#### API Client (`lib/api.js`)
- Changed env var from `VITE_API_URL` to `NEXT_PUBLIC_BACKEND_URL`
- Works with Next.js environment variables

#### ChatInterface Component
- Added `'use client'` directive for client-side rendering
- Changed CSS imports to CSS modules
- Added `mounted` state to prevent hydration mismatches
- Used `useRef` for socket service to persist across renders
- All styles converted to camelCase class names

### 4. Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## ⏳ Remaining Migration Steps

### Step 1: Create Organizer Dashboard Component

Need to create:
1. `components/OrganizerDashboard.js` - Convert from Vite JSX
2. `styles/OrganizerDashboard.module.css` - Convert CSS to module
3. `pages/organizer.js` - Page wrapper

### Step 2: Update _app.js Navigation
- Make navigation links highlight based on current page
- Add any global state management if needed

### Step 3: Add Public Assets
- Add favicon.ico to `public/`
- Add any other static assets

### Step 4: Testing
- Test chat interface
- Test organizer dashboard
- Verify Socket.IO connections work
- Test routing between pages
- Verify styles are correct

### Step 5: Clean Up Old Vite Files (Optional)
- Keep `src/` as backup temporarily
- Can delete after confirming everything works:
  - `src/`
  - `vite.config.js`
  - `index.html`

## 🔧 How to Run

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

## 📝 Key Differences: Vite vs Next.js

| Feature | Vite/React | Next.js |
|---------|-----------|---------|
| **Routing** | react-router-dom | File-based pages/ |
| **Environment** | `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |
| **CSS** | Plain CSS imports | CSS Modules or styled-jsx |
| **Client-only** | No special handling | Need `'use client'` directive |
| **SSR Safety** | Not needed | Must check `typeof window` |
| **Navigation** | `<Link>` from react-router | `<Link>` from next/link |
| **Assets** | /public → / | /public → / (same) |

## 🎯 Current Status

✅ **Working:**
- Next.js app structure
- Navigation between pages
- ChatInterface component
- Socket.IO client (SSR-safe)
- API client
- Styling system

⏳ **In Progress:**
- OrganizerDashboard migration

❌ **Not Started:**
- Cleanup of old Vite files

## 🚀 Next Steps

1. **Complete organizer dashboard migration** (15 min)
2. **Test both pages** (10 min)
3. **Add environment file** (2 min)
4. **Clean up old files** (5 min)

Total time to complete: ~30 minutes

## 💡 Tips

### Client-Side Only Components
For components that use browser APIs or Socket.IO:
```jsx
'use client';

import { useEffect, useState } from 'react';

export default function Component() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null; // or loading state
  
  // Component code
}
```

### Dynamic Imports
For heavy client-side libraries:
```jsx
import dynamic from 'next/dynamic';

const ChatInterface = dynamic(
  () => import('../components/ChatInterface'),
  { ssr: false }
);
```

### Environment Variables
- **Public** (accessible in browser): `NEXT_PUBLIC_*`
- **Private** (server-side only): No prefix
- Access: `process.env.NEXT_PUBLIC_BACKEND_URL`

## 🐛 Common Issues & Solutions

### Issue: "window is not defined"
**Solution:** Add check or use `'use client'`
```jsx
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

### Issue: Hydration mismatch
**Solution:** Use `mounted` state pattern
```jsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### Issue: Socket.IO not connecting
**Solution:** Ensure socket is created only on client
```jsx
const socketService = getSocketService(); // Only in browser
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Migration Guide](https://nextjs.org/docs/migrating/from-vite)
- [App Router vs Pages Router](https://nextjs.org/docs/app)
