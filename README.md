# SmallOrg Central - Local Development Setup

## Backend (Django)

### Prerequisites
- Python 3.12+
- pip

### Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements/base.txt
pip install python-dotenv  # For .env file support
```

2. Configure environment variables:
```bash
# .env file is already created with defaults
# You can edit backend/.env if needed
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser:
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## Frontend (React + Vite)

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
# Copy .env.example to .env
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Optional: Celery/Redis for Background Tasks

If you want to use background tasks (Celery), you'll need Redis:

1. Install Redis locally or use Docker:
```bash
docker run -d -p 6379:6379 redis
```

2. Update backend/.env to include:
```
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

3. Run Celery worker:
```bash
cd backend
celery -A config worker -l info
```

## Database

- **Development**: SQLite (default, no setup required)
- **Production**: PostgreSQL (requires configuration)

## API Endpoints

- API Base URL: `http://localhost:8000/api/v1`
- Admin: `http://localhost:8000/admin`
- Health Check: `http://localhost:8000/health/`

## Modules

- **HR**: `/api/v1/hr/` - Employees, Departments, Leave, Attendance
- **Finance**: `/api/v1/finance/` - Accounts, Invoices, Budgets
- **Operations**: `/api/v1/operations/` - Customers, Leads, Products, Orders
- **DMS**: `/api/v1/dms/` - Documents, Folders
- **Auth**: `/api/v1/auth/` - Authentication
- **Notifications**: `/api/v1/notifications/` - Notifications
- **Reports**: `/api/v1/reports/` - Report generation
