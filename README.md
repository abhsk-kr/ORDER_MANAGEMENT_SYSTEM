# Inventory & Order Management System

Full-stack inventory & order management app with FastAPI backend and React frontend.

---

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Backend      | Python 3.11 + FastAPI                         |
| Frontend     | React 18 + Tailwind CSS                       |
| Database     | PostgreSQL 15 (Alpine)                        |
| Container    | Docker + Docker Compose                       |
| ORM          | SQLAlchemy 2.0                                |
| Validation   | Pydantic v2                                   |
| Build Tool   | Vite                                          |

---

## Features

### Dashboard
- 4 stat cards: Total Products, Total Customers, Total Orders, Low Stock Items
- Low-stock product alerts (quantity < 10)

### Products
- Full CRUD operations
- SKU uniqueness enforcement
- Stock tracking with highlight for low stock
- Modal-based add/edit forms with validation

### Customers
- Create and delete customers
- Email uniqueness enforcement
- Cannot delete customers with existing orders (protected)

### Orders
- Multi-step order creation wizard (Select Customer → Add Products → Review & Confirm)
- Automatic stock deduction on order creation
- Stock restoration on order cancellation
- Unit price snapshot at order time
- Order detail view with itemized list
- Insufficient stock rejection with clear error messages

---

## Project Structure

```
inventory-management/
├── backend/
│   ├── main.py                  # FastAPI app, lifespan, CORS, routes
│   ├── database.py              # SQLAlchemy engine & session
│   ├── models.py                # ORM models (Product, Customer, Order, OrderItem)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── routers/
│   │   ├── products.py          # /products CRUD endpoints
│   │   ├── customers.py         # /customers CRUD endpoints
│   │   ├── orders.py            # /orders CRUD + business logic
│   │   └── dashboard.py         # /dashboard aggregated stats
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Centralized fetch-based API client
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Stat cards + low-stock table
│   │   │   ├── Products.jsx     # Product CRUD table with modals
│   │   │   ├── Customers.jsx    # Customer table with add/delete
│   │   │   └── Orders.jsx       # Order list + create wizard + detail view
│   │   ├── App.jsx              # Main layout with sidebar navigation
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Tailwind directives
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── nginx.conf               # SPA routing fallback
│   ├── Dockerfile               # Multi-stage build (node → nginx)
│   └── .dockerignore
├── docker-compose.yml           # db + backend + frontend orchestration
├── .env.example
└── README.md
```

---

## Live Links

| Service  | URL                                                |
| -------- | -------------------------------------------------- |
| Frontend | https://inventory-frontend-woad-mu.vercel.app      |
| Backend  | https://order-management-system-1kin.onrender.com  |
| API Docs | https://order-management-system-1kin.onrender.com/docs |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/abhsk-kr/ORDER_MANAGEMENT_SYSTEM.git
cd ORDER_MANAGEMENT_SYSTEM

# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up --build -d
```

Once running:

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost:3000   |
| Backend  | http://localhost:8000   |
| API Docs | http://localhost:8000/docs |

### Run Without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Ensure PostgreSQL is running and DATABASE_URL is set
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## API Endpoints

### Products

| Method | Endpoint             | Description      | Status Codes          |
| ------ | -------------------- | ---------------- | --------------------- |
| POST   | /products            | Create product   | 201, 400, 422         |
| GET    | /products            | List products    | 200                   |
| GET    | /products/{id}       | Get by ID        | 200, 404              |
| PUT    | /products/{id}       | Update product   | 200, 400, 404, 422    |
| DELETE | /products/{id}       | Delete product   | 204, 404              |

### Customers

| Method | Endpoint             | Description        | Status Codes          |
| ------ | -------------------- | ------------------ | --------------------- |
| POST   | /customers           | Create customer    | 201, 400, 422         |
| GET    | /customers           | List customers     | 200                   |
| GET    | /customers/{id}      | Get by ID          | 200, 404              |
| DELETE | /customers/{id}      | Delete customer    | 200, 400, 404         |

### Orders

| Method | Endpoint             | Description           | Status Codes          |
| ------ | -------------------- | --------------------- | --------------------- |
| POST   | /orders              | Create order          | 201, 400, 404, 422    |
| GET    | /orders              | List orders           | 200                   |
| GET    | /orders/{id}         | Get order with items  | 200, 404              |
| DELETE | /orders/{id}         | Cancel/delete order   | 200, 400, 404         |

### Dashboard

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| GET    | /dashboard           | Aggregated stats + low-stock items |

### Health

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | /health              | Health check → 200  |

---

## Business Logic Rules

1. **SKU uniqueness** — `POST/PUT /products` returns `400` if SKU is duplicate
2. **Email uniqueness** — `POST /customers` returns `400` if email is duplicate
3. **Stock never negative** — Pydantic validates `quantity >= 0` on every input
4. **Order creation**:
   - Validates customer existence → `404`
   - Checks stock for **every** item → `400` if any insufficient
   - Deducts stock **atomically** for all items
   - Calculates `total_amount = Σ(quantity × unit_price)`
   - Snapshots `unit_price` per item at order time
5. **Order deletion** — Restores stock for all items in the order
6. **Customer deletion** — Blocked if customer has existing orders (`400`)

---

## Frontend Pages

| Page        | Description                                         |
| ----------- | --------------------------------------------------- |
| Dashboard   | 4 stat cards + low-stock products table             |
| Products    | Full CRUD table with modals, yellow highlight on low stock |
| Customers   | Table with add modal, delete with confirmation      |
| Orders      | Order list, multi-step create wizard, detail modal, delete |

### UI Features
- Sidebar navigation with SVG icons (drawer on mobile with hamburger + backdrop)
- Responsive mobile layout (hidden columns, full-screen modals, stacked buttons)
- Loading spinners during API calls
- Toast notifications for success/error (react-hot-toast, bottom-center on mobile)
- Form validation before submit
- Empty state messages when lists are empty

---

## Environment Variables

| Variable           | Default                                                          | Description                      |
| ------------------ | ---------------------------------------------------------------- | -------------------------------- |
| POSTGRES_USER      | inventory_user                                                   | PostgreSQL username              |
| POSTGRES_PASSWORD  | inventory_pass                                                   | PostgreSQL password              |
| POSTGRES_DB        | inventory_db                                                     | PostgreSQL database name         |
| DATABASE_URL       | postgresql://inventory_user:inventory_pass@db:5432/inventory_db  | Full connection string           |
| VITE_API_URL       | http://localhost:8000                                             | Backend URL (frontend env)       |

---

## Docker Services

| Service   | Image                  | Ports        | Depends On      |
| --------- | ---------------------- | ------------ | --------------- |
| db        | postgres:15-alpine     | 5432         | —               |
| backend   | python:3.11-slim       | 8000:8000    | db (healthy)    |
| frontend  | nginx:alpine           | 3000:80      | backend         |

Data persists via the `postgres_data` named volume.

---

## Deployment

### Backend (Render / Railway / Fly.io)
- Set `DATABASE_URL` to a hosted PostgreSQL connection string
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel / Netlify)
- Set `VITE_API_URL` to the deployed backend URL
- Build command: `npm run build`
- Publish directory: `dist`

---

## API Documentation

Once the backend is running, interactive OpenAPI docs are available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## License

MIT
