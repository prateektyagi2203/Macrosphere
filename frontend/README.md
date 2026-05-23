# Frontend README

MacroSphere Frontend - Next.js 15 + TypeScript + Tailwind CSS

## 📁 Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (API client, store)
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000

## 🛠️ Development

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run start            # Production server
npm run lint             # Linting
npm run type-check       # TypeScript check
npm run test             # Unit tests
npm run test:ui          # Test UI
npm run playwright       # E2E tests
npm run format           # Format code
```

## 📦 Key Dependencies

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## 🎨 Components

- `Sidebar` - Navigation menu
- `Header` - Top bar with actions
- `KPICards` - Key metric displays
- `MacroInputPanel` - Interactive sliders
- `Charts` - Data visualizations

## 🌐 Pages

- `/` - Dashboard
- `/factors` - Macro factors
- `/scenarios` - Scenario builder
- `/simulations` - Monte Carlo
- `/allocation` - Allocation details
- `/insights` - AI insights
- `/research` - Research notes
- `/docs` - Documentation

## 🎯 State Management

Uses Zustand for state:
- `useAnalysisStore()` - Global analysis state
- Macro inputs
- Score response
- Allocation
- AI insights
- UI state (loading, error)

## 🔌 API Integration

`lib/api.ts` exports `apiClient` with methods:

```typescript
await apiClient.calculateScore(inputs)
await apiClient.runFullAnalysis(inputs)
await apiClient.runSimulation(inputs)
await apiClient.loadScenario(key)
```

## 🧪 Testing

```bash
npm run test                 # Vitest
npm run test:coverage        # Coverage report
npm run playwright           # E2E tests
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly UI
- Sidebar collapses on mobile

## ♿ Accessibility

- WCAG AA compliant
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Dark mode support

## 🚢 Deployment

### Vercel
```bash
git push origin main
```

Environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://api.macrosphere.com
```

### Docker
```bash
docker build -t macrosphere-web .
docker run -p 3000:3000 macrosphere-web
```

## 📊 Performance

- Next.js optimizations
- Image optimization
- Code splitting
- Dynamic imports
- CSS optimization with Tailwind

## 🔒 Security

- Content Security Policy ready
- CORS configured in next.config.js
- API proxy through rewrites
- Environment variables for secrets

## 🐛 Debugging

```bash
# Enable debug logging
NEXT_DEBUG=1 npm run dev

# TypeScript checking
npm run type-check
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Zustand](https://github.com/pmndrs/zustand)

---

Version 1.0.0
