# CraftFlow — Multi-Tenant SaaS for Home-Based Businesses

A production-grade platform for handmade craft sellers, bakers, candle makers, jewelry creators, and custom gift businesses.

## Architecture

```
craftflow/
├── backend/          # Spring Boot 3.2 + Java 21 + PostgreSQL
│   ├── src/main/java/com/craftflow/
│   │   ├── config/           # Security, CORS config
│   │   ├── controller/       # REST endpoints
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── entity/           # JPA entities
│   │   ├── exception/        # Global error handling
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JWT, TenantContext, UserPrincipal
│   │   └── service/          # Business logic
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/     # Flyway SQL migrations
└── frontend/         # React 18 + TypeScript + Tailwind CSS
    └── src/
        ├── api/              # Axios client + API functions
        ├── components/       # Reusable UI components
        ├── pages/            # Route-level pages
        ├── store/            # Redux Toolkit slices
        ├── types/            # TypeScript interfaces
        └── utils/            # Helpers, formatters
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Java 21 + Maven (for local backend dev)

### Run with Docker (Recommended)

```bash
git clone <repo>
cd craftflow
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Database: localhost:5432

### Local Development

**Backend:**
```bash
cd backend
# Start PostgreSQL first
docker-compose up postgres -d
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env or environment)
| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | craftflow | Database name |
| DB_USERNAME | craftflow | DB user |
| DB_PASSWORD | craftflow123 | DB password |
| JWT_SECRET | (set this!) | Min 256-bit secret |
| JWT_EXPIRATION | 86400000 | Token expiry in ms (24h) |
| CORS_ORIGINS | http://localhost:3000 | Allowed origins |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | /api | Backend API URL |

## Features

### Multi-Tenancy
- Complete data isolation per business (tenant)
- Tenant-aware JWT authentication with `TenantContext`
- Each business gets a unique slug (e.g., `priyas-candle-studio`)

### Order Workflow (State Machine)
```
RECEIVED → CONFIRMED → MATERIALS_READY → IN_PRODUCTION → QUALITY_CHECK → READY_TO_SHIP → DELIVERED
```
- Strict workflow validation (cannot skip stages)
- Full status history audit trail
- Visual Kanban board with drag-and-drop

### Production Planning Engine
- Priority queue sorted by delivery date + rush flag
- Delayed order detection
- Production capacity tracking
- Real-time dashboard metrics

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register business |
| POST | /api/auth/login | Login |
| GET | /api/orders/dashboard | Dashboard metrics |
| GET | /api/orders | List orders (paginated) |
| POST | /api/orders | Create order |
| PATCH | /api/orders/:id/status | Advance order status |
| GET | /api/orders/queue | Production queue |
| GET/POST | /api/products | Products CRUD |
| GET/POST | /api/customers | Customers CRUD |
| GET/POST | /api/inventory | Inventory CRUD |
| POST | /api/inventory/:id/transactions | Stock in/out |
| GET | /api/notifications | Notifications |

## Database Schema

15 tables with proper indexing:
- `tenants` — Business workspaces
- `users` — Auth + roles (OWNER/STAFF/CUSTOMER)
- `businesses` — Business profiles
- `products` — Product catalog
- `categories` — Product categories
- `customers` — CRM
- `customer_addresses` — Multiple addresses
- `orders` — Order management
- `order_items` — Line items
- `order_status_history` — Audit trail
- `inventory` — Raw materials & finished goods
- `inventory_transactions` — Stock movements
- `production_tasks` — Task management
- `notifications` — In-app alerts
- `refresh_tokens` — JWT refresh

## Security

- Bcrypt password hashing (strength 12)
- JWT with configurable expiry
- Role-based access control (`@PreAuthorize`)
- Tenant isolation enforced at repository layer
- CORS configured for production

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Set `DB_PASSWORD` to a secure password
- [ ] Configure `CORS_ORIGINS` to your domain
- [ ] Set up SSL/TLS (nginx or load balancer)
- [ ] Configure SMTP for email notifications
- [ ] Enable database connection pooling (HikariCP configured)
- [ ] Set up monitoring (Spring Actuator endpoints included)
