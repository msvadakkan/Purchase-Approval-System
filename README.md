# ProcureFlow — Purchase Approval System

A complete multi-company purchase request and procurement system with vendor portal, tender management, quote comparison, and LPO generation.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.1-777BB4?logo=php&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Two Project Versions

This repository contains **two fully independent, deployable versions** of the same system. Choose the one that fits your hosting environment.

| | Version 1 — Next.js | Version 2 — PHP Easy |
|---|---|---|
| **Folder** | `/` (project root) | `php_host_easy/` |
| **Frontend** | Next.js 14 + Tailwind CSS | Vanilla HTML + CSS + JS |
| **Backend** | Next.js API Routes | PHP 8.1 (no framework) |
| **Database** | MongoDB (via Node driver) | MongoDB (via PHP driver) |
| **Best for** | VPS / Docker / Vercel | cPanel / Shared hosting |
| **Install** | `docker compose up` or `npm run dev` | Upload files + run installer |

---

## Features

- **Multi-company** — register multiple companies, switch context per request
- **Role-based approvals** — Employee → Manager → Dept Head → CEO chain with configurable thresholds
- **Vendor Portal** — vendors self-register, browse open tenders, submit quotes
- **Tender Management** — create requirements, collect quotes, compare prices
- **LPO Generation** — UAE-format Local Purchase Orders with VAT, print/PDF export
- **Admin Panel** — manage users, roles, approval thresholds
- **Mobile responsive** — works on all screen sizes

---

## Version 1 — Next.js (Docker / VPS)

### Quick Start — Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/msvadakkan/Purchase-Approval-System.git
cd Purchase-Approval-System

# Start with Docker (MongoDB + Next.js app)
docker compose up -d

# Open in browser
open http://localhost:3000
```

### Quick Start — Local Dev

```bash
# Prerequisites: Node.js 18+, MongoDB running locally

npm install
cp .env.example .env.local    # edit MONGODB_URI if needed
npm run dev
# → http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://mongo:27017` | MongoDB connection string |
| `MONGODB_DB` | `purchase_approval` | Database name |
| `JWT_SECRET` | *(required)* | Secret for JWT signing |

### Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@company.com | admin123 |
| CEO | ceo@company.com | demo123 |
| Dept Head | depthead@company.com | demo123 |
| Manager | manager@company.com | demo123 |
| Employee | employee@company.com | demo123 |

---

## Version 2 — PHP Easy (cPanel / Shared Hosting)

Located in the `php_host_easy/` folder. **Zero framework dependencies** — plain PHP 8.1 + MongoDB driver.

### Installation on cPanel

1. **Upload** the `php_host_easy/` folder contents to your `public_html` (or a subdirectory)
2. **Install PHP MongoDB driver** — in cPanel → Select PHP Version → Extensions → enable `mongodb`
3. **Install Composer dependencies** via SSH:
   ```bash
   cd public_html
   composer install --no-dev --optimize-autoloader
   ```
4. **Run the web installer** — visit `http://yoursite.com/install.php`
   - Enter your MongoDB URI (MongoDB Atlas URI or local)
   - Click **Install & Seed Database**
   - **Delete `install.php`** after setup!
5. **Log in** at `http://yoursite.com/` with `admin@company.com` / `admin123`

### Installation via SSH (faster)

```bash
# Upload files, then:
cd public_html
composer install --no-dev
cp .env.example .env
nano .env          # set MONGO_URI, MONGO_DB, JWT_SECRET
php includes/seed.php
```

### MongoDB Atlas (free cloud DB)

If your host doesn't have MongoDB, use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier:
1. Create a free cluster
2. Get the connection string: `mongodb+srv://user:pass@cluster.mongodb.net`
3. Paste it as `MONGO_URI` in your `.env` or installer

### File Structure

```
php_host_easy/
├── index.html              # Staff SPA entry point
├── vendor-login.html       # Vendor sign-in
├── vendor-register.html    # Vendor self-registration
├── vendor-portal.html      # Vendor dashboard SPA
├── install.php             # Web installer (delete after use)
├── .htaccess               # Apache URL rewriting
├── .env.example            # Environment template
├── composer.json           # PHP dependencies
├── api/
│   ├── index.php           # API router
│   ├── auth.php            # Login endpoints
│   ├── requests.php        # Purchase requests CRUD
│   ├── vendors.php         # Vendor management + login
│   ├── tenders.php         # Tenders + quotes
│   ├── lpos.php            # Local Purchase Orders
│   ├── companies.php       # Company registry
│   └── admin.php           # Approval levels + stats
├── includes/
│   ├── bootstrap.php       # .env loader
│   ├── config.php          # DB + JWT config
│   ├── auth.php            # JWT helpers + middleware
│   └── seed.php            # Database seeder
├── assets/
│   ├── css/main.css        # All styles
│   └── js/
│       ├── api.js          # HTTP client
│       ├── app.js          # Staff SPA
│       └── vendor-app.js   # Vendor portal SPA
└── uploads/                # Uploaded documents (auto-created)
```

---

## Contributing

We welcome contributions to both versions! This project is open-source and community-driven.

### How to Contribute

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** — in either `/` (Next.js) or `php_host_easy/` (PHP)
4. **Test** your changes work end-to-end
5. **Commit** with a clear message: `git commit -m "feat: add email notifications"`
6. **Push** and open a **Pull Request** against `main`

### Contribution Ideas

- [ ] Email notifications on approval/rejection
- [ ] PDF export for LPOs (server-side)
- [ ] Dashboard charts and analytics
- [ ] Bulk approve/reject requests
- [ ] Advanced search and filters
- [ ] Audit trail export (CSV/Excel)
- [ ] Two-factor authentication
- [ ] REST API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Dark mode

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` — e.g. `v1.2.0`
- Breaking changes → bump MAJOR
- New features → bump MINOR
- Bug fixes → bump PATCH

Please update the version in `package.json` and tag releases accordingly.

### Code Style

- **Next.js**: ESLint + Prettier (`.eslintrc.json`)
- **PHP**: PSR-12 coding standard, no framework coupling
- Both versions should stay **feature-equivalent**

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│  Staff SPA (index.html / Next.js pages)              │
│  Vendor Portal (vendor-portal.html / /vendor/*)      │
└──────────────────┬──────────────────────────────────┘
                   │ REST API calls
┌──────────────────▼──────────────────────────────────┐
│  API Layer                                           │
│  Next.js: src/app/api/**/route.js                    │
│  PHP:     php_host_easy/api/*.php                    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  MongoDB                                             │
│  Collections: users, vendors, purchase_requests,     │
│               tenders, quotes, lpos, companies,      │
│               approval_levels                        │
└─────────────────────────────────────────────────────┘
```

---

## License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ for teams that need a simple, self-hosted procurement workflow.*
