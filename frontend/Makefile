# Makefile para el frontend del AI-Powered CV Screener

.PHONY: help install test lint format clean dev build preview

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependencias
	npm install

test: ## Ejecutar pruebas
	npm run test

test-ui: ## Ejecutar pruebas con interfaz gráfica
	npm run test:ui

test-cov: ## Ejecutar pruebas con cobertura
	npm run test:coverage

lint: ## Ejecutar linting
	npm run lint

lint-fix: ## Corregir problemas de linting automáticamente
	npm run lint:fix

format: lint-fix ## Formatear código (alias para lint-fix)

format-check: lint ## Verificar formato sin aplicar cambios

clean: ## Limpiar archivos temporales
	rm -rf node_modules
	rm -rf dist
	rm -rf .vite
	rm -rf coverage

dev: ## Ejecutar en modo desarrollo
	npm run dev

build: ## Construir para producción
	npm run build

preview: ## Previsualizar build de producción
	npm run preview

all-checks: format-check test ## Ejecutar todas las verificaciones
