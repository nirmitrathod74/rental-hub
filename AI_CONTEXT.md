# RentalHub AI Context

## Purpose

RentalHub is an Odoo-inspired rental operations ERP for the Odoo Hackathon. It manages equipment catalogues, rental orders, deposits, pickup/return workflows, operational metrics, and administration. It is not a marketplace.

## Running the project

```powershell
cd "C:\Users\NIrmit\Desktop\Rental Hub\rental-hub"
docker compose up --build
```

| Service | URL / port |
| --- | --- |
| React frontend | `http://localhost:3000` |
| Django API | `http://localhost:8000` |
| API health | `http://localhost:8000/api/health/` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

Seeded accounts: `admin` / `admin123`, and `client` / `client123`.

## Technology

- Frontend: React 18, Vite, React Router, Lucide, Chart.js
- Backend: Django 4.2, Django REST Framework, SimpleJWT
- Data: PostgreSQL
- Async/cache: Celery and Redis
- Deployment/development: Docker Compose

## Backend modules

| Module | Responsibility |
| --- | --- |
| `accounts` | Custom user, JWT login, registration, profile |
| `inventory` | Products, variants, price lists, rental periods, availability |
| `rentals` | Orders, items, inspections, deposit history, state machine, quotations/invoices |
| `core` | Health endpoint, shared RBAC helpers, audit records, reusable soft-delete base |
| `finance` | Payment and invoice persistence/services |
| `notifications` | Durable notification records and notification service |
| `rentalhub` | Django settings, URLs, Celery configuration |

## Architecture rules

1. Keep views thin: parse/validate request, call a service, return a response.
2. Put business workflows in service classes or state machines.
3. Keep database access behind repository classes where a repository already exists.
4. Do not add direct Redis access to views; use a service/cache abstraction.
5. Do not permanently delete finance or audit records.
6. Use migrations for every model schema change. Run `python manage.py makemigrations --check --dry-run` before handoff.
7. Preserve existing public API paths unless the request explicitly authorizes an API-breaking change.

## Rental workflow

```text
draft -> confirmed -> picked_up -> returned -> settled
                 \-> cancelled
picked_up -> overdue -> returned -> settled
```

Transitions are defined in `backend/rentals/state_machine.py`. They reserve/release inventory, create audit records, and queue durable notification records. Never update an order status directly when a state-machine transition is available.

## Finance and deposits

- `RentalOrder` keeps totals, payments, deposits, refunds, and late fees.
- `DepositHistory` is the operational deposit ledger.
- `finance.Payment` represents a payment/provider settlement.
- `finance.Invoice` represents an invoice record.
- Late fees use strategies in `backend/rentals/strategies.py`.

## API map

| Group | Prefix |
| --- | --- |
| Health | `/api/health/` |
| Accounts | `/api/accounts/` |
| Inventory | `/api/inventory/` |
| Rentals | `/api/rentals/` |

Important endpoints:

- `POST /api/accounts/login/`
- `GET /api/inventory/products/`
- `GET, POST /api/rentals/orders/`
- `POST /api/rentals/orders/{id}/confirm/`
- `POST /api/rentals/orders/{id}/pickup/`
- `POST /api/rentals/orders/{id}/return_inspection/`
- `POST /api/rentals/orders/{id}/settle/`
- `GET /api/rentals/orders/{id}/qr/`
- `GET /api/rentals/dashboard/metrics/`

## Frontend conventions

- The React entry point is `frontend/src/App.jsx`.
- `frontend/src/components/AppShell.jsx` contains the fixed topbar and role-aware sidebar.
- `frontend/src/styles/theme.css` is the shared Odoo-inspired design system.
- Keep UI colors, buttons, cards, forms, badges, and tables consistent with the theme tokens.
- Prefer reusable components over page-specific inline styles for all new UI.
- The frontend API client is `frontend/src/api/index.js`; preserve its JWT behavior.

## Verification

```powershell
docker compose exec -T backend python manage.py check
docker compose exec -T backend python manage.py test rentals
cd frontend; npm run build
```

## Current limitations

- Email, SMS, WhatsApp, payment gateway, and cloud storage are service-ready but do not have configured production providers.
- QR API returns a stable UUID payload; a client/scanner can encode it as an image.
- Development defaults are intentionally permissive; production must configure secrets, HTTPS, allowed hosts, CORS origins, rate limiting, and managed Redis/logging.
