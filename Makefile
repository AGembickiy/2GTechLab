# 2GTechLab Makefile (Frontend only)

.PHONY: install frontend lint clean

install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

frontend:
	@echo "Starting Nuxt frontend..."
	cd frontend && npm run dev

lint:
	@echo "Running linters..."
	npx eslint frontend/

format:
	@echo "Formatting code..."
	npx prettier --write frontend/

clean:
	@echo "Cleaning up..."
	rm -rf frontend/node_modules frontend/.nuxt frontend/dist 2>/dev/null || true
