# RentalHub ERP

RentalHub is a modular rental-operations ERP built with Django REST Framework, PostgreSQL, Redis, Celery, and Docker.

## Run

```powershell
docker compose up --build
```

- Web application: `http://localhost:3000`
- API health: `http://localhost:8000/api/health/`
- Admin credentials: `admin` / `admin123`
- Client credentials: `client` / `client123`

## Architecture

```text
React UI -> DRF views -> Services -> Repositories -> PostgreSQL
                         |       |
                         |       -> Audit log / notifications / finance
                         -> Redis cache and Celery task queue
```

The existing `accounts`, `inventory`, and `rentals` apps own their business domains. `core` provides shared RBAC, health and audit infrastructure; `finance` owns payment and invoice records; and `notifications` owns durable notification records.

## ERP workflows

```text
Draft -> Confirmed -> Picked up -> Returned -> Settled
                         |             |
                         -> Cancelled  -> Overdue -> Returned
```

- State transitions are validated in `rentals.state_machine`.
- Pricing and late-fee rules use strategies in `rentals.strategies`.
- Every order has a UUID `public_id`, exposed by `GET /api/rentals/orders/{id}/qr/` for QR scanners.
- Deposit collections/refunds are retained as immutable `DepositHistory` records.
- Dashboard metrics are accessed through a cache-backed service.

## API groups

| Group | Prefix |
| --- | --- |
| Health | `/api/health/` |
| Authentication | `/api/accounts/` |
| Inventory | `/api/inventory/` |
| Rentals & dashboard | `/api/rentals/` |

## Background work

Celery uses Redis as its broker. The scheduled hourly overdue-rental task is configured in Django settings. Add email, SMS, WhatsApp, payment gateway, and cloud-storage providers behind the corresponding service adapter; no provider credentials are stored in source control.

## Security baseline

JWT authentication, role checks, DRF permissions, database-backed audit records, opaque public order UUIDs, and Django ORM parameterization are included. For production, configure environment-only secrets, allowed hosts, HTTPS termination, CORS origins, rate limiting, a real Redis cache, structured log shipping, and an external task monitor.
