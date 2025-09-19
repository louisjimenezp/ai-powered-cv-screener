# Makefile principal para el AI-Powered CV Screener

.PHONY: help install test lint format clean dev build all-checks

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependencias de ambos proyectos
	@echo "Instalando dependencias del backend..."
	cd backend && poetry install
	@echo "Instalando dependencias del frontend..."
	cd frontend && npm install

test: ## Ejecutar todas las pruebas
	@echo "Ejecutando pruebas del backend..."
	cd backend && poetry run pytest
	@echo "Ejecutando pruebas del frontend..."
	cd frontend && npm run test

test-cov: ## Ejecutar pruebas con cobertura
	@echo "Ejecutando pruebas con cobertura del backend..."
	cd backend && poetry run pytest --cov=backend --cov-report=html --cov-report=term
	@echo "Ejecutando pruebas con cobertura del frontend..."
	cd frontend && npm run test:coverage

lint: ## Ejecutar linting en ambos proyectos
	@echo "Ejecutando linting del backend..."
	cd backend && poetry run flake8 backend/ && poetry run mypy backend/
	@echo "Ejecutando linting del frontend..."
	cd frontend && npm run lint

format: ## Formatear código en ambos proyectos
	@echo "Formateando código del backend..."
	cd backend && poetry run black backend/ && poetry run isort backend/
	@echo "Formateando código del frontend..."
	cd frontend && npm run lint:fix

clean: ## Limpiar archivos temporales
	@echo "Limpiando backend..."
	cd backend && find . -type f -name "*.pyc" -delete && find . -type d -name "__pycache__" -delete
	@echo "Limpiando frontend..."
	cd frontend && rm -rf node_modules dist .vite coverage

dev: ## Ejecutar ambos proyectos en modo desarrollo
	@echo "Iniciando backend y frontend en modo desarrollo..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "Usa Ctrl+C para detener ambos servicios"
	@trap 'kill %1 %2' INT; \
	cd backend && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000 & \
	cd frontend && npm run dev & \
	wait

build: ## Construir ambos proyectos para producción
	@echo "Construyendo backend..."
	cd backend && poetry install --only=main
	@echo "Construyendo frontend..."
	cd frontend && npm run build

all-checks: lint test ## Ejecutar todas las verificaciones (lint + test)

setup: install ## Configuración inicial completa
	@echo "Configuración inicial completada!"
	@echo "Recuerda configurar las variables de entorno:"
	@echo "- backend/.env (desde backend/env.example)"
	@echo "- frontend/.env (desde frontend/env.example)"
