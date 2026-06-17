# Crypto Market Analytics — Frontend

A fully responsive, backend-driven admin + user dashboard for real-time cryptocurrency analytics built on Vite + React.

## Tech Stack

| Concern | Tool |
|---|---|
| Build | Vite + React 19 |
| Styling | Tailwind CSS v4 + MUI v9 |
| State | Redux Toolkit |
| Routing | React Router v7 |
| HTTP | Axios |
| Forms | Formik + Yup |
| Charts | Recharts |
| Toasts | react-hot-toast |
| SEO | react-helmet-async |
| Icons | lucide-react |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Environment Variables

Create a `.env` file in this folder:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Folder Structure

```
src/
├── components/    # Reusable UI primitives (Button, Card, Modal, Table…)
├── features/      # Feature-scoped UI + local hooks
├── pages/         # Route-level page components
├── hooks/         # Cross-cutting hooks (useAuth, usePagination…)
├── services/      # Axios service layer (one file per API group)
├── store/         # Redux Toolkit store + slices
├── routes/        # AppRouter, ProtectedRoute, RoleRoute
├── layouts/       # AuthLayout, DashboardLayout
└── utils/         # formatters, storage, constants
```

## Backend

Backend runs on `http://localhost:5000`. See `../backend/` for setup instructions.

> All UI data is fetched from the real backend. No static/mock data used.
