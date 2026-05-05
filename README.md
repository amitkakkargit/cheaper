# Cheaper Web

Next.js web frontend for the Cheaper local marketplace. Buyers and sellers discover local products, meet in person, manually confirm the handoff, and review only after the transaction has been confirmed.

## Local Stack

- Web app: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Mobile app: sibling `cheaper-mobile` Expo project
- Database and business rules live in `cheaper-api`

The web dev script uses webpack because Turbopack was hitting local panic errors in this project.

## Setup

1. Start PostgreSQL and the API from `../cheaper-api`.
2. Install web dependencies:

```powershell
npm install
```

3. Create `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

4. Confirm the API base URL:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
```

5. Start the frontend on port `3000`:

```powershell
npm run dev
```

6. Open `http://localhost:3000`.

## User Workflow

1. Browse products on the home feed.
2. Search or filter products by text, category, location, or seller where available.
3. Open a product detail page to see product information, seller details, generated local images, handoff actions, and reviews.
4. Open a seller page to see seller profile details and seller products.
5. Sign in with email or phone OTP from the account button in the header.
6. After login, the header shows only the avatar/account icon.
7. Click the avatar to open profile settings.
8. Update name and avatar from the profile popup.
9. Click outside the popup, move focus away, or press Escape to close it.

## Authentication Workflow

- Email OTP and phone OTP are both supported.
- OTPs are valid for 60 seconds.
- OTPs are validated by the API against database records.
- For local development, no real SMS or email is sent. The API returns the OTP in the request response.
- The JWT is stored in browser local storage as `cheaperAccessToken`.
- Protected actions use `Authorization: Bearer <token>`.

## Seller Workflow

1. Log in.
2. Create a seller profile from the seller creation screen.
3. A seller profile is linked to the logged-in user.
4. Only the owner of a seller profile can post products for that seller.
5. Sellers can confirm sold products that belong to their own seller profile.
6. Sellers cannot review their own products or their own seller profile.

## Product Workflow

1. Log in.
2. Create or use an existing seller profile.
3. Post a product with title/name, description, price, condition, category, location, seller relation, and optional media fields.
4. Products are saved through the API and backed by Prisma/PostgreSQL.
5. Product listing images use the local `/api/product-image/[id]/[index]` route so the UI does not depend on blocked external image services.
6. Product video URLs from blocked sample hosts are intentionally not used in the UI.

## Manual Handoff Workflow

Cheaper does not handle payments. Buyer and seller meet in person and confirm the transaction manually.

1. Buyer opens the product page and clicks `I got this product`.
2. API creates or updates the purchase confirmation for that buyer and product.
3. Seller opens the same product page and clicks `I sold this product`.
4. API confirms the seller side only if the seller owns the product listing.
5. Reviews unlock only after the buyer and seller confirmations both exist.

## Review Workflow

- Review buttons are visible only to logged-in users who are allowed to review.
- The web UI uses selectable star ratings through `RatingStars`.
- Buyers can review products they confirmed receiving after the seller also confirms the sale.
- Buyers can review the seller for the confirmed transaction.
- Sellers cannot review their own product or seller profile.
- A seller may review another seller's product only when acting as the buyer for that product.
- The API enforces one product review per user/product and one seller review per user/seller.
- Public review displays should show only public information: reviewer name, rating, comment, and date.
- Email, phone, internal user IDs, and private account data should not be shown in public review lists.

## Notifications

Forms and protected actions use a common notification pattern:

- Success notification after a save, confirmation, login, or review succeeds.
- Error notification when the API rejects the request or validation fails.
- Controllers stay on the API; web components call service helpers instead of embedding backend logic.

## Project Structure

- `app/`: Next.js App Router pages and route handlers.
- `components/`: reusable UI, account menu, auth/profile popup, product actions, cards, stars, and notifications.
- `lib/`: API clients, API base URL handling, shared types, and auth token helpers.
- `data/`: legacy JSON seed source used by `cheaper-api`.
- `tests/`: Jest and React Testing Library tests.
- `scripts/`: local data generation utilities.

## Important Files

- `lib/apiBaseUrl.ts`: keeps browser and server API requests pointed at port `3001`.
- `lib/clientApi.ts`: browser-side auth/profile/action API helpers.
- `lib/api.ts`: server-side product and seller data helpers.
- `components/AccountMenu.tsx`: header login/avatar/profile popup workflow.
- `components/ProductActions.tsx`: buyer/seller confirmation and review workflow.
- `components/RatingStars.tsx`: readonly and interactive star ratings.
- `components/FormNotification.tsx`: common success/error form messages.

## Development Commands

```powershell
npm run dev
npm run build
npm test -- --runInBand
npx tsc --noEmit --incremental false
```

## Full Local Startup Order

From separate terminals:

```powershell
cd d:\Projects\cheaper-all\cheaper-api
npm run start:dev
```

```powershell
cd d:\Projects\cheaper-all\cheaper
npm run dev
```

Then open `http://localhost:3000`.

## Troubleshooting

If the frontend is not on port `3000`, stop the other Next.js process and restart:

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess
Stop-Process -Id <PID> -Force
```

If API calls go to the wrong port, check `.env.local` and restart the dev server.

If `GET /products` returns 404 from Next.js, the frontend is calling itself instead of the backend. Confirm `NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"`.

If image services return 403, use the built-in product image route. The app already avoids known blocked sources such as `fakeimg.pl`.
