# Cheaper Marketplace MVP

A modern local marketplace web app built with Next.js and TypeScript. Buyers and sellers meet in person, confirm the product handoff manually, and can review only after both sides confirm.

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
- NestJS API integration through `NEXT_PUBLIC_API_BASE_URL`
- Mock phone sign-in for local development
- Buyer confirms product received
- Seller confirms product sold
- Product and seller reviews after confirmed handoff
- Modular components, services, and types

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Start `cheaper-api` on `http://localhost:3001`.
4. Run the frontend development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`

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
- `lib/` - backend API services, client API helper, and shared types
- `data/` - legacy JSON source data migrated into PostgreSQL by `cheaper-api`
- `tests/` - unit and integration tests
- `scripts/generate-data.js` - data generator for reproducible mock product and seller sets

## Local flow

1. Sign in from the home page with mock phone auth.
2. Create a seller profile and keep the returned seller ID.
3. Post a product using that seller ID.
4. A buyer signs in and clicks `I got this product`.
5. The seller signs in and clicks `I sold this product`.
6. The buyer can submit product and seller reviews.
