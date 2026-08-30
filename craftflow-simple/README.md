# CraftFlow 🎨
### Multi-Tenant SaaS Platform for Home-Based Businesses

[![Deploy Frontend](https://vercel.com/button)](https://vercel.com/new)
[![Deploy Backend](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

---

## Quick Start (Local)

**Backend** (Java 21 + H2 in-memory DB — zero setup):
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit → http://localhost:3000

---

## Free Deployment

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel | Free forever |
| Backend | Render | Free tier |
| Database | H2 In-Memory | Built-in |

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

---

## Tech Stack

**Backend:** Java 21, Spring Boot 3.2, Spring Security, JWT, H2 Database, JPA

**Frontend:** React 18, TypeScript, Redux Toolkit, React Query, Tailwind CSS, Vite

---

## Features

- Multi-tenant business workspaces
- 7-stage order workflow state machine
- Drag-and-drop Kanban board
- Smart production scheduling engine
- Inventory management with low-stock alerts
- Customer CRM with lifetime value tracking
- Role-based access (Owner / Staff / Customer)
- Real-time notifications

---

## License
MIT
