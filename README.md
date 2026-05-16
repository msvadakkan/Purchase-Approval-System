# Purchase Approval System

Full-stack web application for purchase request approvals, vendor registration, and procurement tendering.

## Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend  | PHP 8.x (plain PHP, no framework) |
| Database | MongoDB                  |

---

## Prerequisites

1. **PHP 8.0+** with the MongoDB PECL extension
2. **Composer** — https://getcomposer.org
3. **MongoDB** running on `localhost:27017`
4. **Node.js 18+** + npm (for the React frontend)

### Install MongoDB PHP extension (Windows)
```
pecl install mongodb
```
Add `extension=mongodb` to your `php.ini`.

---

## Setup

### 1. Backend (PHP)
```bash
cd backend
composer install
# Start PHP built-in server on port 8000:
php -S localhost:8000 index.php
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev   # Starts on http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to `http://localhost:8000`.

---

## Demo Accounts

| Role            | Email                    | Password     |
|-----------------|--------------------------|--------------|
| Admin           | admin@company.com        | admin123     |
| CEO             | ceo@company.com          | password123  |
| Department Head | depthead@company.com     | password123  |
| Manager         | manager@company.com      | password123  |
| Employee        | alice@company.com        | password123  |

---

## Approval Thresholds (default)

| Role            | Approves up to |
|-----------------|---------------|
| Manager         | AED 5,000     |
| Department Head | AED 25,000    |
| CEO             | Unlimited      |

Admin can change these from **Admin Panel → Approval Levels**.

---

## Features

### Internal Users
- **Purchase Requests** — submit with amount, category, description; auto-routed to correct approver
- **Multi-level Approval** — Manager → Department Head → CEO based on configurable thresholds
- **Requirements / Tenders** — create procurement requirements for vendor bidding
- **Quote Comparison Sheet** — side-by-side comparison of all vendor quotes
- **Vendor Registry** — admin approves/rejects vendor registrations, views documents
- **Admin Panel** — manage users, configure approval levels

### Vendor Portal (`/vendor/*`)
- **Registration** — company info, VAT, bank details, file attachments (Trade License, VAT Cert, Bank Doc)
- **Login** — separate session from internal users
- **Browse Tenders** — see open procurement requirements
- **Submit Quote** — unit price, total, delivery time, terms, warranty; can update quote until tender closes
