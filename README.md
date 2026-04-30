# Kaka Dikro Admin Panel

Kaka Dikro Admin Panel is a React + Vite admin dashboard for managing the Kaka Dikro ecommerce/admin workflow. It includes protected admin authentication, dashboard navigation, user/admin management, products, orders, contacts, and common UI components for tables, modals, forms, charts, and layout.

## Tech Stack

- React 18
- TypeScript
- Vite
- Redux Toolkit and React Redux
- React Router DOM
- Tailwind CSS
- Axios
- Zod validation
- ApexCharts / React ApexCharts
- React Hot Toast and React Toastify
- Lucide React and React Icons

## Features

- Admin login and protected routes
- Dashboard screen with reusable stats, charts, maps, and cards
- Admin profile and password management
- Admin/user listing, details, creation, editing, and active status changes
- Product listing, details, creation, editing, image/form handling, and active status changes
- Order listing, order view modal, status updates, active status updates, and shipping label download
- Contact listing, contact details, pagination, and deletion
- Shared table utilities for searching, pagination, loading rows, settings, and modals
- Dark mode support through local storage hooks and switcher components
- Vercel SPA deployment rewrites

## Project Structure

```text
.
|-- public/                 Static public assets and data.json
|-- src/
|   |-- common/             Shared app-level components such as Loader
|   |-- components/         Reusable UI, layout, table, chart, header, sidebar, and form components
|   |-- css/                Global styles and Tailwind output entry
|   |-- fonts/              Satoshi font files
|   |-- hooks/              Shared React hooks and toast helpers
|   |-- images/             App logos, product images, users, cards, countries, icons, and auth images
|   |-- js/                 Map/vector JavaScript assets
|   |-- layout/             Default authenticated layout
|   |-- pages/              Route-level pages
|   |-- services/           Axios instance and API service modules
|   |-- store/              Redux store, root reducer, hooks, and feature slices
|   |-- types/              Shared TypeScript data types
|   |-- validations/        Zod validation schemas
|   |-- App.tsx             Application routes and auth guard
|   `-- main.tsx            React entry point
|-- index.html              Vite HTML entry
|-- package.json            Scripts and dependencies
|-- tailwind.config.cjs     Tailwind theme/configuration
|-- tsconfig.json           TypeScript configuration
|-- vercel.json             Vercel API and SPA rewrites
`-- vite.config.js          Vite configuration
```

## Routes

| Route | Description |
| --- | --- |
| `/login` | Admin login page |
| `/dashboard` | Protected dashboard |
| `/admins` | Protected admin management page |
| `/profile` | Redirects to `/admins` |
| `/users` | Protected users table |
| `/products` | Protected products table |
| `/orders` | Protected orders table |
| `/contacts` | Protected contacts table |
| `/` | Redirects to dashboard when authenticated, otherwise login |
| `*` | Redirects to login |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Running backend API for the admin endpoints

### Installation

```bash
npm install
```

### Environment Variables

Create or update `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The app reads `VITE_API_BASE_URL` in `src/services/axiosInstance.ts`. If the variable is missing, it falls back to the hard-coded development API URL in that file.

For Vercel deployment, `vercel.json` rewrites `/api/:path*` to:

```text
http://13.235.238.226:5000/api/:path*
```

Set `VITE_API_BASE_URL=/api` when you want the frontend to use that Vercel proxy path.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the production app into `dist/`.

```bash
npm run preview
```

Previews the production build locally.

## API Modules

API access is centralized through `src/services/axiosInstance.ts`, which configures:

- `baseURL` from `VITE_API_BASE_URL`
- JSON request headers
- `withCredentials: true`
- `Authorization: Bearer <accessToken>` from `localStorage`
- 10 second request timeout

Main service modules:

| File | Purpose |
| --- | --- |
| `src/services/authService.ts` | Admin login, logout, token/profile initialization |
| `src/services/admin-api.ts` | Admin profile, password, users/admins, and status updates |
| `src/services/products-api.ts` | Product list, details, create, update, and active status APIs |
| `src/services/Orders-api.ts` | Order list, details, status updates, active updates, and label download |
| `src/services/contacts-api.ts` | Contact list, details, and delete APIs |
| `src/services/axiosError.ts` | Shared Axios error message handling |

## State Management

Redux Toolkit is configured in `src/store/`.

Active slices:

- `auth`
- `admin`
- `contacts`
- `products`
- `orders`

Use `src/store/hooks.ts` for typed Redux hooks in components.

## Styling

The UI uses Tailwind CSS with project-specific configuration in `tailwind.config.cjs`. Global styles live in `src/css/style.css`. The app also imports vendor styles for:

- `jsvectormap/dist/css/jsvectormap.css`
- `flatpickr/dist/flatpickr.min.css`

## Validation

Form/data validation helpers live in:

- `src/validations/adminValidation.ts`
- `src/validations/productValidation.ts`

## Deployment

The project includes `vercel.json` for Vercel deployment:

- `/api/:path*` requests are proxied to the backend API.
- All other routes rewrite to `/index.html` so React Router works on refresh.

Build before deployment:

```bash
npm run build
```

## Notes for Developers

- Keep generated build output in `dist/`; source changes should be made under `src/`.
- Add new API methods under `src/services/` and keep endpoint usage out of UI components when possible.
- Add new shared table, modal, and form UI under `src/components/`.
- Add route-level screens under `src/pages/`.
- Keep shared data shapes in `src/types/`.
