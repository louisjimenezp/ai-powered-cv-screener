# Makefile para el backend del AI-Powered CV Screener

.PHONY: help install test lint format clean run dev

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependencias
	poetry install

test: ## Ejecutar pruebas
	poetry run pytest

test-cov: ## Ejecutar pruebas con cobertura
	poetry run pytest --cov=backend --cov-report=html --cov-report=term

lint: ## Ejecutar linting
	poetry run flake8 backend/
	poetry run mypy backend/

format: ## Formatear código
	poetry run black backend/
	poetry run isort backend/

format-check: ## Verificar formato sin aplicar cambios
	poetry run black --check backend/
	poetry run isort --check-only backend/

clean: ## Limpiar archivos temporales
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov/

run: ## Ejecutar aplicación
	poetry run python main.py

dev: ## Ejecutar en modo desarrollo
	poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

init-rag: ## Inicializar pipeline RAG
	poetry run python rag_pipeline_init.py

all-checks: format-check lint test ## Ejecutar todas las verificaciones
