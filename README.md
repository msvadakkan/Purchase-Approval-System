# Purchase Approval System

A full-stack web application for multi-company purchase request approvals, vendor management, tender/requirement creation, quote comparison, and LPO (Local Purchase Order) generation.

![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Lucide Icons |
| Backend  | PHP 8.2 (plain PHP, no framework) |
| Database | MongoDB 7 |
| Server   | Nginx (frontend) + Apache (PHP backend) |

---

## 🚀 Quick Deploy — Single Command

```bash
git clone https://github.com/YOUR_USERNAME/purchase-approval-system.git && \
cd purchase-approval-system && \
docker-compose up --build -d
```

Open **http://localhost** — the app is ready.

---

## 🐳 Docker Station Installation Guide

Docker Station is the Docker management UI on **Synology NAS** and other container platforms. Follow the steps below for your platform.

---

### Option A — Synology NAS (Docker Station)

#### Step 1 — Enable SSH and connect to your NAS

```bash
ssh admin@YOUR_NAS_IP
```

#### Step 2 — Clone the repository

```bash
cd /volume1/docker
git clone https://github.com/YOUR_USERNAME/purchase-approval-system.git
cd purchase-approval-system
```

> If `git` is not installed, open **Package Center** → search **Git Server** → install it.

#### Step 3 — Launch via Docker Compose

```bash
docker-compose up --build -d
```

This builds and starts three containers:
- `frontend` — Nginx serving the React app (port 80)
- `backend` — PHP 8.2 + Apache
- `mongo` — MongoDB 7

#### Step 4 — Open Docker Station UI (optional management)

1. Open **DSM** → **Docker Station** (or **Container Manager** on DSM 7.2+)
2. Go to **Project** tab → click **Create**
3. Set Project Name: `purchase-approval`
4. Set path to the cloned folder: `/volume1/docker/purchase-approval-system`
5. Click **Build** — Docker Station reads `docker-compose.yml` automatically

#### Step 5 — Access the app

Open your browser: `http://YOUR_NAS_IP`

> To expose externally, go to **Control Panel → Application Portal** and set up a reverse proxy pointing to port 80.

---

### Option B — Docker Desktop (Windows / Mac)

#### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/purchase-approval-system.git
cd purchase-approval-system
```

#### Step 2 — Build and start

```bash
docker-compose up --build -d
```

#### Step 3 — Open the app

Go to **http://localhost** in your browser.

To monitor containers, open **Docker Desktop** → **Containers** — you will see `frontend`, `backend`, and `mongo` all running.

---

### Option C — Linux VPS / Server

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# Clone and run
git clone https://github.com/YOUR_USERNAME/purchase-approval-system.git
cd purchase-approval-system
docker-compose up --build -d
```

---

## 📦 Container Architecture

```
Browser
   │
   ▼
┌─────────────────────────────────┐
│  frontend (Nginx — port 80)     │
│  - Serves React SPA             │
│  - Proxies /api/* → backend:80  │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  backend (PHP 8.2 + Apache)     │
│  - REST API at /api/*           │
│  - Serves uploaded files        │
│  - Connects to MongoDB          │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  mongo (MongoDB 7)              │
│  - Persistent volume: mongo_data│
└─────────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

Set these in `docker-compose.yml` under the `backend` service:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://mongo:27017` | MongoDB connection string |

### Custom Port

To run on a port other than 80, edit `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "8080:80"   # Change 8080 to any free port
```

### MongoDB Atlas (Cloud DB)

To use MongoDB Atlas instead of the local container:

1. Remove the `mongo` service and `mongo_data` volume from `docker-compose.yml`
2. Set the environment variable on the `backend` service:

```yaml
backend:
  environment:
    MONGODB_URI: "mongodb+srv://USER:PASSWORD@cluster.mongodb.net/purchase_approval?retryWrites=true&w=majority"
```

---

## 🛠 Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View live logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Stop everything
docker-compose down

# Stop and delete all data (volumes)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build -d

# Open a shell inside backend
docker-compose exec backend bash

# Open MongoDB shell
docker-compose exec mongo mongosh purchase_approval
```

---

## Local Development (without Docker)

### Prerequisites
- PHP 8.0+ with MongoDB PECL extension
- Composer
- MongoDB running on `localhost:27017`
- Node.js 18+ + npm

### Backend
```bash
cd backend
composer install
php -S localhost:8000 index.php
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Vite proxies `/api/*` to `http://localhost:8000`.

---

## 📋 Demo Accounts

| Role            | Email                | Password     |
|-----------------|----------------------|--------------|
| Admin           | admin@company.com    | admin123     |
| CEO             | ceo@company.com      | password123  |
| Department Head | depthead@company.com | password123  |
| Manager         | manager@company.com  | password123  |
| Employee        | alice@company.com    | password123  |

---

## 🏢 Demo Companies (auto-seeded)

| Company | TRN | City |
|---------|-----|------|
| Alpha Trading LLC | 100234567890003 | Dubai |
| Beta Supplies FZE | 100456789012003 | Dubai (JAFZA) |

---

## ✅ Approval Thresholds (default)

| Role            | Approves up to |
|-----------------|----------------|
| Manager         | AED 5,000      |
| Department Head | AED 25,000     |
| CEO             | Unlimited      |

Change thresholds in **Admin Panel → Approval Levels**.

---

## ✨ Features

### Multi-Company Management
- Register unlimited companies under one account
- Each company has: name, trade license, VAT/TRN, address, logo, contacts
- Company switcher in sidebar — instantly switch context
- Purchase requests and LPOs are linked to the active company

### Purchase Requests & Approvals
- Submit requests with amount, category, company
- Auto-routed to correct approver based on amount thresholds
- Multi-level: Manager → Department Head → CEO
- Approve/reject with comments, full audit history

### Requirements / Tenders
- Create procurement requirements for vendor bidding
- Vendors submit quotes with pricing, delivery, warranty terms
- Side-by-side quote comparison sheet
- Lowest bid highlighted automatically

### LPO Generation
- Generate formal Local Purchase Orders (UAE format)
- Dynamic line items with quantity, unit, unit price
- Auto-calculates subtotal, VAT (5%), total
- Includes vendor bank details, payment terms, signature area
- Print / Save as PDF with one click (`Ctrl+P`)
- Status workflow: Draft → Sent → Acknowledged

### Vendor Portal (`/vendor/*`)
- Self-registration with UAE company details, bank details
- File attachments: Trade License, VAT Certificate, Bank Document
- Browse open tenders and submit quotes
- Admin approves/rejects vendor registrations

### Admin Panel
- Manage users (create, edit, deactivate, delete)
- Configure approval level thresholds
- View system-wide stats

---

## 📁 Project Structure

```
purchase-approval-system/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── apache.conf
│   ├── index.php              # Single-entry router
│   ├── composer.json
│   └── src/
│       ├── DB.php
│       ├── JWT.php
│       ├── Middleware.php
│       ├── helpers.php
│       └── Controllers/
│           ├── AuthController.php
│           ├── UserController.php
│           ├── AdminController.php
│           ├── RequestController.php
│           ├── VendorController.php
│           ├── TenderController.php
│           ├── CompanyController.php
│           └── LPOController.php
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── src/
    │   ├── App.jsx            # Routes + lazy loading
    │   ├── api.js
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── VendorAuthContext.jsx
    │   │   └── CompanyContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx     # Sidebar + mobile hamburger
    │   │   ├── VendorLayout.jsx
    │   │   └── StatusBadge.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Requests.jsx / NewRequest.jsx / RequestDetail.jsx
    │       ├── Requirements.jsx / NewRequirement.jsx / RequirementDetail.jsx
    │       ├── QuoteComparison.jsx
    │       ├── PendingApprovals.jsx
    │       ├── Companies.jsx / NewCompany.jsx
    │       ├── LPOs.jsx / NewLPO.jsx / LPODetail.jsx
    │       ├── Vendors.jsx
    │       ├── AdminPanel.jsx
    │       └── vendor/
    │           ├── VendorLogin.jsx
    │           ├── VendorRegister.jsx
    │           ├── VendorDashboard.jsx
    │           ├── VendorTenders.jsx
    │           └── VendorTenderDetail.jsx
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Internal user login |
| GET/POST | `/api/users` | List / create users |
| PUT/DELETE | `/api/users/:id` | Update / delete user |
| GET/PUT | `/api/admin/approval-levels` | Approval thresholds |
| GET | `/api/admin/stats` | Dashboard stats |
| GET/POST | `/api/requests` | List / create purchase requests |
| POST | `/api/requests/:id/approve` | Approve request |
| POST | `/api/requests/:id/reject` | Reject request |
| GET/POST | `/api/tenders` | List / create tenders |
| POST | `/api/tenders/:id/quote` | Submit vendor quote |
| GET | `/api/tenders/:id/comparison` | Quote comparison |
| GET/POST | `/api/vendors` | List / register vendors |
| POST | `/api/vendors/login` | Vendor login |
| POST | `/api/vendors/:id/approve` | Approve vendor |
| GET/POST | `/api/companies` | List / create companies |
| GET/PUT/DELETE | `/api/companies/:id` | Manage company |
| GET/POST | `/api/lpos` | List / create LPOs |
| GET/PUT/DELETE | `/api/lpos/:id` | Manage LPO |

---

## License

MIT
