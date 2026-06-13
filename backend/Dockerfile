# Dockerfile - Optional for production deployment
# For local development, use: python manage.py runserver
FROM python:3.12-slim
WORKDIR /app
COPY requirements/base.txt .
RUN pip install --no-cache-dir -r requirements/base.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]