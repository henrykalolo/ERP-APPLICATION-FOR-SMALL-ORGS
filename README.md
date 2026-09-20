# SmallOrg Central

A modular enterprise resource planning platform for small organizations, combining a Django REST backend with a React/Vite frontend.

## Modules

- Human resources: employees, departments, leave, and attendance
- Finance: accounts, invoices, and budgets
- Operations: customers, leads, products, and orders
- Document management
- Authentication and notifications
- Reporting and administrative workflows

## Technology

- Python 3.12+
- Django
- React with Vite
- SQLite for local development
- PostgreSQL recommended for production
- Redis and Celery for optional background tasks

## Local installation

```bash
git clone https://github.com/henrykalolo/ERP-APPLICATION-FOR-SMALL-ORGS.git
cd ERP-APPLICATION-FOR-SMALL-ORGS
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\\Scripts\\activate
pip install -r requirements/base.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://localhost:8000` and the admin interface at `http://localhost:8000/admin`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend is available at `http://localhost:5173`.

### Optional background workers

```bash
docker run -d --name smallorg-redis -p 6379:6379 redis
cd backend
celery -A config worker -l info
```

## Development notes

Keep credentials in environment variables, not source control. Use SQLite only for local development; configure PostgreSQL and restricted hosts/CORS settings for production.

## Documentation

See [orgsysdoc (1).md](orgsysdoc%20(1).md) for the detailed system specification.

## Contributing

Use focused branches, include tests for changes, and document API or database changes in pull requests.

## License

License terms will be added when finalized.
