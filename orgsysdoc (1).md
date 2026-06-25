# SmallOrg Central - Cloud-Native ERP SaaS
## Modern System Design & Implementation Specification

---

**Document Version:** 3.0 (Django/React SaaS Edition)  
**Last Updated:** October 2023  
**Author:** Aimtek Technologies  
**Classification:** Confidential - Internal Use Only  
**Region:** Malawi & SADC Market Focus  
**Architecture:** Multi-Tenant SaaS (Django + React)

---

## 📑 Table of Contents

1.  [Executive Summary](#1-executive-summary)
2.  [Strategic Vision & Problem Statement](#2-strategic-vision--problem-statement)
3.  [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
4.  [Multi-Tenancy Strategy & Data Isolation](#4-multi-tenancy-strategy--data-isolation)
5.  [Core Module Specifications (Django Apps)](#5-core-module-specifications-django-apps)
6.  [Data Integration & Workflow Logic](#6-data-integration--workflow-logic)
7.  [Security, Compliance & Governance](#7-security-compliance--governance)
8.  [Implementation Strategy & Roadmap](#8-implementation-strategy--roadmap)
9.  [Financial Analysis & Cost Estimation](#9-financial-analysis--cost-estimation)
10. [Future-Proofing: AI & Advanced Features](#10-future-proofing-ai--advanced-features)

---

## 1. Executive Summary

### 1.1 Overview
**SmallOrg Central** is a robust, cloud-native Multi-Tenant SaaS ERP platform designed to democratize enterprise-level efficiency. By decoupling the frontend and backend, we ensure scalability, maintainability, and a superior user experience. The system unifies critical business modules into a single cohesive platform, eliminating data silos and providing real-time intelligence via a modern React interface.

### 1.2 Strategic Value Proposition
| **Legacy Approach** | **SmallOrg Central (SaaS)** |
| :--- | :--- |
| Fragmented on-premise spreadsheets | **Unified API-First Ecosystem** |
| Manual data re-entry | **Event-Driven Architecture (Django Signals)** |
| Static, server-rendered pages | **Interactive SPA (React)** with real-time updates |
| High CapEx hardware investment | **OpEx Subscription Model** (Pay-as-you-grow) |
| Security vulnerabilities | **Tenant Isolation & Row-Level Security** |

---

## 2. Strategic Vision & Problem Statement

### 2.1 The Problem
Small organizations in emerging markets are trapped in the "Productivity Gap." They have outgrown basic tools but find standard ERPs (SAP/Oracle) financially inaccessible and technically overwhelming.

### 2.2 The Solution
A **Modular, Multi-Tenant SaaS** platform built on **Django** for secure, rapid backend logic and **React** for a dynamic, responsive frontend.
*   **Zero Infrastructure Hassle:** Customers simply sign up and log in.
*   **Mobile-First Design:** The React frontend ensures seamless operation on low-bandwidth connections and mobile devices.
*   **Modular Scalability:** Enable modules (CRM, Payroll) via a license key in the Django Admin without redeploying code.

---

## 3. System Architecture & Technology Stack

### 3.1 Architectural Philosophy
The system follows a **Service-Oriented Architecture (SOA)** using a strict decoupled pattern.
*   **Frontend:** React Single Page Application (SPA) handling UI state, routing, and user interaction.
*   **Backend:** Django REST Framework (DRF) serving as the monolithic brain, handling business logic, data persistence, and auth.
*   **Multi-Tenancy:** Implemented at the data layer to ensure complete logical isolation between clients (Tenants).

### 3.2 Technology Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | **React.js + Vite** | Fast development, component reusability, massive ecosystem. |
| **State Mgmt** | **Redux Toolkit / RTK Query** | Efficient server state management and caching. |
| **UI Library** | **Tailwind CSS / Material UI** | Rapid styling, responsive design out of the box. |
| **Backend** | **Python (Django 5.x)** | Secure, "batteries-included," best-in-class ORM and Admin panel. |
| **API Layer** | **Django REST Framework (DRF)** | Standardized, browsable API, robust serialization. |
| **Database (Prod)** | **PostgreSQL 15+** | Critical for Multi-tenancy, ACID compliance, JSONB support. |
| **Database (Dev)** | **SQLite3** | Zero-configuration, file-based database for rapid local development. |
| **Async Tasks** | **Celery + Redis** | Background processing for payroll, invoicing, and heavy reporting. |
| **Web Server** | **Gunicorn + Nginx** | Production-grade WSGI server and reverse proxy. |
| **Containerization**| **Docker & Docker Compose** | Ensures parity between development and production environments. |
| **Infrastructure** | **AWS (Africa - Cape Town)** | Low latency, robust IAM, and S3 storage. |

### 3.3 System Diagram
```text
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Tenant A  │  │   Tenant B  │  │   Super     │             │
│  │  (Browser)  │  │  (Browser)  │  │   Admin     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼────────────────────┘
          │ (HTTPS/REST)   │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER (AWS ELB)                      │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
┌───────────────────────────────────┴─────────────────────────────┐
│                    DJANGO BACKEND (API GATEWAY)                  │
│         (Tenant Middleware -> Auth -> View -> Serializer)       │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   PostgreSQL      │     │      Redis        │     │  Celery Workers   │
│ (Tenant Schemas)  │     │   (Cache/Queue)   │     │ (Background Jobs) │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

---

## 4. Multi-Tenancy Strategy & Data Isolation

To ensure a robust SaaS offering, the application will implement a **Shared Database, Separate Schema** approach (using libraries like `django-tenants`).

### 4.1 Tenant Resolution
*   **Mechanism:** Tenants are identified via subdomain (e.g., `acme.smallorg.com`) or URL path (e.g., `smallorg.com/acme`).
*   **Middleware:** A Django middleware intercepts every request, extracts the tenant identifier, and switches the PostgreSQL `search_path` to the tenant's specific schema before the view processes the request.

### 4.2 Data Isolation Features
*   **Schema Separation:** Each tenant gets a dedicated Postgres schema (e.g., `tenant_acme`, `tenant_bizco`).
*   **File Isolation:** User uploads are stored in AWS S3 using prefixes like `s3://bucket/tenant_id/uploads/file.pdf`.
*   **Cache Isolation:** Redis keys are namespaced (e.g., `tenant_acme:user_1:profile`) to prevent cache bleeding.
*   **Development Note:** While **PostgreSQL** supports schemas natively, **SQLite** (used for local dev) will simulate multi-tenancy using a shared database with `tenant_id` foreign keys on all models to allow developers to run the system without installing Postgres locally.

---

## 5. Core Module Specifications (Django Apps)

The backend is organized into reusable Django Apps.

### 5.1 Human Resources (App: `hr`)
*   **Models:** `Employee`, `Department`, `LeaveType`, `LeaveRequest`, `Attendance`.
*   **Features:** 
    *   Geofenced Clock-in/out via API endpoints.
    *   Automated leave balance calculations (Django Signals).
*   **API Endpoints:** `/api/v1/hr/employees/`, `/api/v1/hr/leave/request/`.

### 5.2 Financial Suite (App: `finance`)
*   **Models:** `Account`, `JournalEntry`, `Transaction`, `Invoice`, `Budget`.
*   **Features:**
    *   Double-entry bookkeeping enforced at the Model layer (`save()` method).
    *   Multi-currency support via `django-money`.
*   **API Endpoints:** `/api/v1/finance/invoices/`, `/api/v1/finance/ledger/`.

### 5.3 Operations (App: `operations`)
*   **Models:** `Customer` (CRM), `Lead`, `Product`, `Order`, `Project`.
*   **Features:**
    *   Inventory levels updated automatically upon Sales Order creation.
    *   Kanban board data serialized for React Frontend.
*   **API Endpoints:** `/api/v1/crm/leads/`, `/api/v1/inventory/stock/`.

### 5.4 Document Management (App: `dms`)
*   **Models:** `Document`, `Folder`, `Version`.
*   **Features:**
    *   Integration with AWS S3 for actual file storage.
    *   OCR integration (Celery task) upon file upload.

---

## 6. Data Integration & Workflow Logic

### 6.1 Automation via Django Signals & Celery
The system leverages Django's signal dispatcher for decoupled automation.

**Scenario: Automated "Hire-to-Pay" Workflow**
1.  **HR Action:** Admin creates `Employee` record in Django Admin.
2.  **Signal:** `post_save` signal triggers on `Employee` model.
3.  **IT Provisioning:** Signal calls a task to create a `User` account and send a "Welcome" email via Celery.
4.  **Payroll Update:** Cron job (Celery Beat) runs monthly, querying `Employee` and `Attendance` records to generate `Payslip` objects.
5.  **Accounting Post:** Once `Payslip` is approved, a signal posts a `JournalEntry` to the `finance` app:
    *   `Debit: Salary Expense`
    *   `Credit: Payable Liability`

### 6.2 React State Synchronization
*   React uses **RTK Query** to poll endpoints or utilize WebSockets (Django Channels) for real-time dashboard updates (e.g., Inventory levels dropping).

---

## 7. Security, Compliance & Governance

### 7.1 Authentication & Authorization
*   **Auth:** JWT (JSON Web Tokens) via `SimpleJWT` or `Auth0`. Stateless authentication for the React SPA.
*   **Permissions:** Django REST Framework permissions (`IsAuthenticated`, `IsAdminUser`, `DjangoModelPermissions`).
*   **Custom RBAC:** Decorators to check roles (e.g., `@role_required('accountant')`).

### 7.2 Data Security
*   **Encryption:** `django-encryption` for sensitive fields (SSN/Tax IDs) at rest.
*   **HTTPS:** Enforced SSL/TLS via Nginx.
*   **SQL Injection Prevention:** Django ORM automatically parameterizes queries, mitigating SQLi risks.

---

## 8. Implementation Strategy & Roadmap

### 8.1 Development Environment Setup
*   **Localhost:** Developers run `docker-compose up` to spin up Django API, React UI, and PostgreSQL.
*   **Fallback:** If Docker is unavailable, developers can use `python manage.py runserver` with the local **SQLite** database for quick logic testing.

### 8.2 Phased Rollout Plan

| Phase | Duration | Tech Focus | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1: Skeleton** | Weeks 1-4 | Django Setup, Multi-tenancy, React Auth | Tenant provisioning works; Login page live. |
| **Phase 2: Core ERP** | Weeks 5-12 | HR & Accounting Apps + React UI | Employees can be added; Invoices created. |
| **Phase 3: Operations** | Weeks 13-20 | CRM, Inventory, API Integration | Sales pipeline visible; Stock tracking live. |
| **Phase 4: Intelligence** | Weeks 21-28 | Celery Tasks, Dashboards, BI | Payroll automation; PDF Reporting. |
| **Phase 5: Hardening** | Weeks 29+ | Optimization, Security Audit | Production deployment to AWS. |

---

## 9. Financial Analysis & Cost Estimation

*Analysis based on 2026 projected rates for a specialized Django/React team.*

### 9.1 Development Resource Costs (Monthly Estimates)
| Resource | Skill Level | Monthly Cost (MWK) |
| :--- | :--- | :--- |
| **Senior Backend Dev (Django)** | Senior | 1,800,000 - 2,500,000 |
| **Senior Frontend Dev (React)** | Senior | 1,600,000 - 2,300,000 |
| **DevOps / DBA (Postgres/AWS)** | Mid-Senior | 1,200,000 - 1,800,000 |
| **UI/UX Designer** | Mid-Level | 600,000 - 900,000 |
| **QA Engineer** | Mid-Level | 500,000 - 800,000 |

### 9.2 Total Investment Estimate (MVP Build)
*Assumes a 3-person core team (Back, Front, DevOps) over 6 months.*

| Cost Category | Calculation | Estimate (MWK) |
| :--- | :--- | :--- |
| **Personnel** | 3 pers × MWK 1.8M avg × 6 months | 32,400,000 |
| **Cloud Infrastructure** | AWS (Dev/Staging/Prod 1yr) | 2,000,000 |
| **Software/APIs** | Sentry, Stripe, S3, SMS Gateway | 1,200,000 |
| **Contingency** | 15% of total | 5,190,000 |
| **TOTAL PROJECT COST** | | **~40,790,000** |
| **USD Equivalent** | @ Rate 1,685 MWK | **~$24,200** |

---

## 10. Future-Proofing: AI & Advanced Features

### 10.1 Machine Learning Integration
*   **Tech:** Integration of Python libraries (Scikit-learn, TensorFlow) directly into the Django backend or as separate microservices.
*   **Use Case:** `django-ai` module for predicting inventory stockouts based on historical sales data.

### 10.2 Advanced Frontend Capabilities
*   **PWA (Progressive Web App):** Convert React app to PWA for offline capabilities (critical for low-bandwidth areas).
*   **Real-time Collaboration:** Integration of `django-channels` to allow multiple users to edit spreadsheets/reports simultaneously in React.

---

## 11. Conclusion

The **SmallOrg Central** rewrite leverages the stability and security of **Django** combined with the interactivity of **React**. By adhering to a robust multi-tenancy architecture and modern DevOps practices (Docker/AWS), this system will provide a scalable, low-cost ERP solution specifically tailored for the SADC market's dynamic needs.

**Next Steps:**
1.  Initialize Django project with `django-tenants` architecture.
2.  Set up React repository with Vite and Authentication boilerplate.
3.  Design PostgreSQL Schema for Core Modules.

Based on `orgsysdoc (1).md`, the implementation should be a Django/DRF backend with a React/Vite frontend, multi-tenant isolation, modular ERP apps, Celery-based automation, S3-backed documents, and AWS-ready deployment.

## 1. Architectural Baseline

### Core stack

| Layer | Technology |
|---|---|
| Backend | Django 5.x, Django REST Framework |
| Multi-tenancy | `django-tenants` with PostgreSQL schemas |
| Local DB | SQLite with `tenant_id` simulation |
| Frontend | React + Vite |
| State/API | Redux Toolkit + RTK Query |
| Async | Celery + Redis |
| Auth | JWT via `djangorestframework-simplejwt` |
| Storage | AWS S3 with tenant-prefixed object keys |
| Deployment | Docker, Docker Compose, Gunicorn, Nginx, AWS |
| Region | AWS Africa, Cape Town |

### Non-negotiable implementation rules

1. Every tenant-facing model must be tenant-scoped.
2. Production uses PostgreSQL schema isolation.
3. Local development uses SQLite with `tenant_id` on tenant-aware models.
4. File storage keys must include `tenant_id`.
5. Redis keys must include tenant namespace.
6. All APIs must resolve tenant from subdomain or URL path.
7. Finance must enforce double-entry accounting invariants.
8. Payroll, invoice, OCR, and reporting workflows must be Celery tasks.
9. Sensitive fields must be encrypted at rest.
10. All create/update/delete/posting operations must emit audit events.

---

## 2. Recommended Monorepo Structure

```text
smallorg-central/
├── README.md
├── docker-compose.yml
├── docker-compose.local.yml
├── .env.example
├── .gitignore
├── Makefile
├── backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── pyproject.toml
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── local.txt
│   │   └── production.txt
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── wsgi.py
│   │   ├── celery.py
│   │   ├── urls.py
│   │   └── settings/
│   │       ├── __init__.py
│   │       ├── base.py
│   │       ├── local.py
│   │       └── production.py
│   ├── apps/
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── exceptions.py
│   │   │   ├── mixins.py
│   │   │   ├── models.py
│   │   │   ├── pagination.py
│   │   │   ├── permissions.py
│   │   │   ├── serializers.py
│   │   │   ├── signals.py
│   │   │   ├── utils.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── tenants/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── users/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── authz/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── models.py
│   │   │   ├── permissions.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── audit/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── middleware.py
│   │   │   ├── signals.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── hr/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── employee.py
│   │   │   │   ├── department.py
│   │   │   │   ├── leave.py
│   │   │   │   └── attendance.py
│   │   │   ├── serializers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── employee.py
│   │   │   │   ├── department.py
│   │   │   │   ├── leave.py
│   │   │   │   └── attendance.py
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── leave_balance.py
│   │   │   │   └── attendance.py
│   │   │   ├── signals.py
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── finance/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── exceptions.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── account.py
│   │   │   │   ├── journal.py
│   │   │   │   ├── invoice.py
│   │   │   │   ├── transaction.py
│   │   │   │   └── budget.py
│   │   │   ├── serializers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── account.py
│   │   │   │   ├── journal.py
│   │   │   │   ├── invoice.py
│   │   │   │   └── budget.py
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── journal_validator.py
│   │   │   │   ├── invoice_workflow.py
│   │   │   │   └── ledger.py
│   │   │   ├── signals.py
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── operations/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── customer.py
│   │   │   │   ├── lead.py
│   │   │   │   ├── product.py
│   │   │   │   ├── order.py
│   │   │   │   ├── inventory.py
│   │   │   │   └── project.py
│   │   │   ├── serializers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── customer.py
│   │   │   │   ├── lead.py
│   │   │   │   ├── product.py
│   │   │   │   ├── order.py
│   │   │   │   └── project.py
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── inventory.py
│   │   │   │   └── order_workflow.py
│   │   │   ├── signals.py
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── dms/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── document.py
│   │   │   │   ├── folder.py
│   │   │   │   └── version.py
│   │   │   ├── serializers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── document.py
│   │   │   │   └── folder.py
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── storage.py
│   │   │   │   └── ocr.py
│   │   │   ├── tasks.py
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   ├── notifications/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── services.py
│   │   │   ├── tasks.py
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests/
│   │   │
│   │   └── reports/
│   │       ├── __init__.py
│   │       ├── apps.py
│   │       ├── serializers.py
│   │       ├── services.py
│   │       ├── tasks.py
│   │       ├── urls.py
│   │       ├── views.py
│   │       └── tests/
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── urls.py
│   │   │   ├── auth.py
│   │   │   ├── tenants.py
│   │   │   └── schemas.py
│   │   └── permissions.py
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── tenant.py
│   │   └── audit.py
│   │
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── payroll.py
│   │   ├── invoices.py
│   │   ├── ocr.py
│   │   └── reporting.py
│   │
│   ├── storage/
│   │   ├── __init__.py
│   │   └── s3.py
│   │
│   └── pytest.ini
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── app/
│       │   ├── store.ts
│       │   ├── router.tsx
│       │   └── providers.tsx
│       ├── api/
│       │   ├── client.ts
│       │   ├── authApi.ts
│       │   ├── tenantApi.ts
│       │   ├── hrApi.ts
│       │   ├── financeApi.ts
│       │   ├── operationsApi.ts
│       │   └── dmsApi.ts
│       ├── features/
│       │   ├── auth/
│       │   ├── tenants/
│       │   ├── hr/
│       │   ├── finance/
│       │   ├── operations/
│       │   ├── dms/
│       │   └── reports/
│       ├── components/
│       │   ├── layout/
│       │   ├── forms/
│       │   ├── tables/
│       │   ├── modals/
│       │   └── notifications/
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useTenant.ts
│       │   └── usePermissions.ts
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   └── NotFound.tsx
│       ├── types/
│       │   ├── auth.ts
│       │   ├── tenant.ts
│       │   ├── hr.ts
│       │   ├── finance.ts
│       │   ├── operations.ts
│       │   └── dms.ts
│       ├── utils/
│       │   ├── currency.ts
│       │   ├── dates.ts
│       │   └── validation.ts
│       ├── styles/
│       │   └── globals.css
│       └── tests/
│
├── infra/
│   ├── docker/
│   │   ├── backend/
│   │   ├── frontend/
│   │   └── nginx/
│   │       └── nginx.conf
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   └── secrets.yaml
│   └── aws/
│       ├── s3-policy.json
│       └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── multi-tenancy.md
│   ├── security.md
│   └── deployment.md
│
└── scripts/
    ├── bootstrap-dev.sh
    ├── bootstrap-dev.ps1
    ├── makemigrations.sh
    ├── migrate.sh
    ├── run-tests.sh
    └── seed-demo-data.py
```

---

## 3. Backend Component Roadmap

### 3.1 Platform foundation

Components:

- `core`
- `tenants`
- `users`
- `authz`
- `audit`
- `notifications`

Responsibilities:

- Tenant provisioning.
- Tenant resolution by subdomain or path.
- JWT authentication.
- Role-based access control.
- Audit logging.
- Notification dispatch.
- Shared pagination, errors, serializers, mixins.

Tenant model concept:

```text
Tenant
- id
- name
- slug
- schema_name
- is_active
- plan
- created_at
- updated_at
```

Tenant-scoped model base:

```text
TenantScopedModel
- tenant
- created_by
- updated_by
- created_at
- updated_at
```

### 3.2 HR app

Models:

- `Employee`
- `Department`
- `LeaveType`
- `LeaveRequest`
- `Attendance`

Core workflows:

- Employee creation.
- Department assignment.
- Leave request approval.
- Automated leave balance recalculation.
- Attendance clock-in/out.
- Geofence validation.
- Hire-to-pay event trigger.

Key endpoints:

```text
POST   /api/v1/hr/employees/
GET    /api/v1/hr/employees/
GET    /api/v1/hr/employees/{id}/
PATCH  /api/v1/hr/employees/{id}/

POST   /api/v1/hr/leave/request/
GET    /api/v1/hr/leave/request/
PATCH  /api/v1/hr/leave/request/{id}/

POST   /api/v1/hr/attendance/clock-in/
POST   /api/v1/hr/attendance/clock-out/
GET    /api/v1/hr/attendance/
```

### 3.3 Finance app

Models:

- `Account`
- `JournalEntry`
- `JournalEntryLine`
- `Transaction`
- `Invoice`
- `Budget`

Core rules:

- Double-entry accounting must be enforced.
- Every posted journal entry must balance.
- Posted journal entries must be immutable.
- Locked accounting periods cannot be edited.
- Multi-currency support must be explicit.
- Payroll and invoice posting should create journal entries.

Key endpoints:

```text
POST   /api/v1/finance/accounts/
GET    /api/v1/finance/accounts/
GET    /api/v1/finance/accounts/{id}/

POST   /api/v1/finance/journal-entries/
POST   /api/v1/finance/journal-entries/{id}/post/
GET    /api/v1/finance/ledger/

POST   /api/v1/finance/invoices/
GET    /api/v1/finance/invoices/
POST   /api/v1/finance/invoices/{id}/approve/
POST   /api/v1/finance/invoices/{id}/post/

POST   /api/v1/finance/budgets/
GET    /api/v1/finance/budgets/
```

### 3.4 Operations app

Models:

- `Customer`
- `Lead`
- `Product`
- `Order`
- `OrderLine`
- `InventoryItem`
- `InventoryMovement`
- `Project`

Core workflows:

- CRM lead tracking.
- Customer management.
- Product catalog.
- Inventory stock adjustment.
- Sales order creation.
- Inventory deduction on order confirmation.
- Project task/Kanban state.

Key endpoints:

```text
POST   /api/v1/crm/leads/
GET    /api/v1/crm/leads/
PATCH  /api/v1/crm/leads/{id}/

POST   /api/v1/operations/customers/
GET    /api/v1/operations/customers/

POST   /api/v1/operations/products/
GET    /api/v1/operations/products/

POST   /api/v1/operations/orders/
POST   /api/v1/operations/orders/{id}/confirm/
GET    /api/v1/operations/orders/

GET    /api/v1/inventory/stock/
POST   /api/v1/inventory/adjustments/

POST   /api/v1/operations/projects/
GET    /api/v1/operations/projects/
PATCH  /api/v1/operations/projects/{id}/
```

### 3.5 Document Management System

Models:

- `Document`
- `Folder`
- `DocumentVersion`

Core workflows:

- Tenant-scoped folder hierarchy.
- S3-backed file storage.
- Pre-signed upload/download URLs.
- Document versioning.
- OCR Celery task after upload.
- Metadata extraction.

Key endpoints:

```text
POST   /api/v1/dms/folders/
GET    /api/v1/dms/folders/
GET    /api/v1/dms/folders/{id}/

POST   /api/v1/dms/documents/upload-url/
POST   /api/v1/dms/documents/
GET    /api/v1/dms/documents/
GET    /api/v1/dms/documents/{id}/
GET    /api/v1/dms/documents/{id}/download-url/
```

---

## 4. Frontend Component Roadmap

### 4.1 Shell

Features:

- Login/logout.
- Tenant-aware routing.
- Sidebar navigation.
- Role-based menu visibility.
- RTK Query API integration.
- Toast notifications.
- Loading and error states.

Routes:

```text
/login
/dashboard
/hr/employees
/hr/leave
/hr/attendance

/finance/accounts
/finance/invoices
/finance/journal
/finance/budgets

/crm/leads
/crm/customers
/operations/products
/operations/orders
/inventory/stock
/operations/projects

/dms/documents
/reports
/settings
```

### 4.2 Feature folders

Each feature should own:

```text
featureName/
├── api.ts
├── types.ts
├── hooks.ts
├── components/
├── pages/
└── utils.ts
```

Example:

```text
features/finance/
├── api.ts
├── types.ts
├── hooks.ts
├── components/
│   ├── InvoiceForm.tsx
│   ├── JournalEntryTable.tsx
│   └── LedgerChart.tsx
├── pages/
│   ├── InvoicesPage.tsx
│   ├── JournalPage.tsx
│   └── LedgerPage.tsx
└── utils.ts
```

---

## 5. Phased Implementation Plan

### Phase 0: Repository and DevOps Foundation

**Duration:** Week 0-1

Deliverables:

- Monorepo created.
- Docker Compose for backend, frontend, Postgres, Redis.
- Django settings split into local/production.
- React/Vite app bootstrapped.
- Tailwind or Material UI configured.
- CI lint/test/build pipeline created.

Acceptance criteria:

- Backend starts locally.
- Frontend starts locally.
- Postgres and Redis start through Compose.
- Basic health endpoint returns 200.
- Frontend can call backend health endpoint.

---

### Phase 1: Tenant, Auth, RBAC, Audit

**Duration:** Weeks 1-4

Backend deliverables:

- Tenant model and tenant resolution middleware.
- PostgreSQL schema support with `django-tenants`.
- SQLite fallback using `tenant_id`.
- JWT login/refresh/logout.
- User model integration.
- Role and permission model.
- Audit log middleware.
- Tenant-aware base serializer/viewset.

Frontend deliverables:

- Login page.
- Auth token storage.
- Tenant context provider.
- Protected routes.
- Role-based navigation.

Acceptance criteria:

- Tenant A cannot access Tenant B data.
- Unauthenticated users cannot access protected APIs.
- Users without permissions receive 403.
- All mutations create audit records.

---

### Phase 2: Core Shared Services

**Duration:** Weeks 5-8

Backend deliverables:

- Shared tenant-scoped model mixin.
- Shared pagination, validation, exception handling.
- Notification service.
- Celery configuration.
- Redis task broker integration.
- S3 storage backend.
- OpenAPI schema generation.

Frontend deliverables:

- Shared API client.
- Shared table, form, modal, and notification components.
- Dashboard shell.

Acceptance criteria:

- Celery worker processes a sample task.
- S3 upload/download works with tenant-prefixed keys.
- API docs are generated.
- Shared frontend API client handles auth and tenant headers.

---

### Phase 3: HR Module

**Duration:** Weeks 9-12

Backend deliverables:

- Employee, Department, LeaveType, LeaveRequest, Attendance models.
- HR serializers, views, permissions.
- Leave balance service.
- Attendance geofence validation.
- HR signals for hire workflow.
- Celery task for welcome email/user provisioning.

Frontend deliverables:

- Employee list/create/edit pages.
- Leave request page.
- Attendance clock-in/out page.
- Department management page.

Acceptance criteria:

- Leave balances update after approval.
- Attendance records require valid tenant/user context.
- Employee creation triggers provisioning workflow.
- HR UI works through RTK Query.

---

### Phase 4: Finance Module

**Duration:** Weeks 13-18

Backend deliverables:

- Chart of accounts.
- Journal entry and journal line models.
- Double-entry validation.
- Invoice model and workflow.
- Budget model.
- Ledger query service.
- Finance posting signals.
- Immutable posted journal entries.

Frontend deliverables:

- Account management.
- Invoice create/edit/approve/post.
- Journal entry creation.
- Ledger dashboard.
- Budget management.

Acceptance criteria:

- Non-balancing journal entries are rejected.
- Posted journal entries cannot be edited.
- Invoice posting creates valid accounting entries.
- Ledger queries are tenant-scoped.

---

### Phase 5: Operations Module

**Duration:** Weeks 19-24

Backend deliverables:

- CRM customers and leads.
- Product catalog.
- Inventory items and stock movements.
- Sales orders and order lines.
- Inventory deduction on order confirmation.
- Project and Kanban state models.
- Operations signals.

Frontend deliverables:

- Lead pipeline.
- Customer management.
- Product catalog.
- Sales order creation.
- Inventory stock page.
- Project/Kanban board.

Acceptance criteria:

- Confirming an order reduces stock.
- Stock cannot go negative unless business rules allow it.
- Leads can move through pipeline stages.
- Projects expose Kanban-ready serialized state.

---

### Phase 6: DMS and Automation

**Duration:** Weeks 25-28

Backend deliverables:

- Folder, Document, DocumentVersion models.
- S3 pre-signed upload/download.
- OCR Celery task.
- Document metadata extraction.
- DMS permissions.

Frontend deliverables:

- Document library.
- Folder navigation.
- Upload flow.
- Document detail/version view.

Acceptance criteria:

- Uploaded files are stored under tenant-specific S3 prefixes.
- OCR task runs asynchronously.
- Users cannot access documents outside their tenant.
- Document versions are tracked.

---

### Phase 7: Reporting, BI, Hardening

**Duration:** Weeks 29+

Backend deliverables:

- Dashboard report services.
- PDF/export tasks.
- Finance, HR, inventory, and CRM report APIs.
- Security hardening.
- Performance indexes.
- Production deployment configuration.
- Monitoring and logging.

Frontend deliverables:

- Executive dashboard.
- Finance dashboard.
- HR dashboard.
- Inventory dashboard.
- CRM dashboard.
- Export buttons.

Acceptance criteria:

- Reports are tenant-scoped.
- Heavy reports run through Celery.
- Production Docker image builds.
- Nginx/Gunicorn deployment works.
- HTTPS, S3, Redis, Postgres, and Celery are production-ready.

---

## 6. Recommended Development Order

1. Repository, Docker, Django settings, React shell.
2. Tenant model, tenant middleware, auth, RBAC, audit.
3. Shared tenant-scoped model mixin and API base classes.
4. HR module.
5. Finance module.
6. Operations module.
7. DMS module.
8. Celery workflows.
9. React feature pages.
10. Reporting dashboards.
11. Production hardening and deployment.

---

## 7. Key Technical Decisions

### Multi-tenancy

Production:

```text
public schema:
- Tenant
- User
- global auth/RBAC metadata

tenant schema:
- HR models
- Finance models
- Operations models
- DMS models
- tenant-specific audit/events
```

Local SQLite:

```text
single database:
- all tenant-scoped models include tenant_id
- tenant middleware sets request.tenant
- queries filter by tenant_id
```

### Finance integrity

Finance should use a service layer:

```text
FinancePostingService
- validate_account_permissions()
- validate_journal_balances()
- validate_accounting_period()
- create_journal_entry()
- post_journal_entry()
- create_ledger_lines()
```

### Workflow automation

Use Django signals sparingly and Celery for side effects:

```text
Employee created
    -> create user task
    -> send welcome email task

Invoice approved
    -> post accounting journal task

Document uploaded
    -> OCR task
    -> metadata extraction task

Sales order confirmed
    -> inventory deduction task
```

---

## 8. Definition of Done for the Core System

The core SaaS platform is complete when:

1. Tenant isolation is proven by automated tests.
2. JWT authentication and RBAC are enforced across APIs.
3. HR, Finance, Operations, and DMS modules have tenant-scoped CRUD APIs.
4. Finance double-entry rules are enforced.
5. Celery tasks process payroll, invoice posting, OCR, and reporting.
6. React frontend consumes APIs through RTK Query.
7. S3 storage uses tenant prefixes.
8. Redis cache keys use tenant namespace.
9. Docker Compose runs the full local stack.
10. Production deployment supports Postgres, Redis, Celery, Gunicorn, Nginx, and S3.