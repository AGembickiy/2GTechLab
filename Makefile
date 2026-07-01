# 2GTechLab Makefile

.PHONY: install migrate backend frontend worker test lint clean

install:
	@echo "Installing dependencies..."
	pip install -r requirements/dev.txt
	cd frontend && npm install

migrate:
	@echo "Running migrations..."
	python manage.py makemigrations
	python manage.py migrate
	python manage.py collectstatic --noinput

backend:
	@echo "Starting Django backend..."
	python manage.py runserver 0.0.0.0:8000

frontend:
	@echo "Starting Nuxt frontend..."
	cd frontend && npm run dev

worker:
	@echo "Starting Celery worker..."
	celery -A backend worker -l info

beat:
	@echo "Starting Celery beat..."
	celery -A backend beat -l info

test:
	@echo "Running tests..."
	pytest

lint:
	@echo "Running linters..."
	ruff check .
	black --check .

format:
	@echo "Formatting code..."
	black .
	ruff format .

docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "Building Docker images..."
	docker-compose build

clean:
	@echo "Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	rm -rf .pytest_cache .coverage htmlcov
	rm -rf backend/__pycache__ backend/**/*.pyc backend/**/*.pyo 2>/dev/null || true
	rm -rf frontend/node_modules frontend/.nuxt frontend/dist 2>/dev/null || true
