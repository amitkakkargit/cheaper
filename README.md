# Cheaper Marketplace MVP

A modern Node.js marketplace web app built with Next.js and TypeScript. This prototype uses hardcoded JSON data to simulate API responses and supports a responsive Instagram-style feed.

## Stack

- Next.js (app router)
- TypeScript
- React
- CSS for responsive design
- Jest + React Testing Library for unit and integration tests

## Core features

- Home feed with search and location filters
- Instagram-style product card layout
- Product detail page
- Seller detail page
- Seller profile creation UI
- Product posting UI
- Mock JSON data treated like an API
- Modular components, services, and types

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`

## Test commands

- Run all tests:
  ```bash
  npm test
  ```
- Run watch mode:
  ```bash
  npm run test:watch
  ```

## Project structure

- `app/` - Next.js route definitions and pages
- `components/` - UI components and layout modules
- `lib/` - mock API services and shared types
- `data/` - hardcoded JSON data representing API responses (currently 2,800+ products across all Indian states)
- `tests/` - unit and integration tests
- `scripts/generate-data.js` - data generator for reproducible mock product and seller sets

## Replacing the mock JSON with real APIs

1. Replace `lib/api.ts` data imports with fetch calls to your backend endpoints.
2. Keep the service method signatures (`getAllProducts`, `getProductById`, `searchProducts`, etc.) the same so UI components can stay unchanged.
3. Add a backend or API route layer as needed, then update the service methods to deserialize the API response.
4. For client-side filtering or search, move relevant logic into the API service or backend query layer.

This setup is intentionally built so the data layer can be swapped without rewriting the UI.
