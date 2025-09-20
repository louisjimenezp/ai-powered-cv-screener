# AGENTS.md - Guía para Agentes de IA

Este documento proporciona instrucciones detalladas para que CHATCOPILOT, CURSOR y otros agentes de IA puedan interactuar correctamente con el proyecto AI-Powered CV Screener.

## 📋 Índice

1. [Información General del Proyecto](#información-general-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Backend - FastAPI](#backend---fastapi)
4. [Frontend - React + TypeScript](#frontend---react--typescript)
5. [Comandos y Procedimientos](#comandos-y-procedimientos)
6. [Estructura de Archivos](#estructura-de-archivos)
7. [Variables de Entorno](#variables-de-entorno)
8. [Testing y Debugging](#testing-y-debugging)
9. [Despliegue](#despliegue)
10. [Troubleshooting](#troubleshooting)

## 📊 Información General del Proyecto

**Nombre:** AI-Powered CV Screener  
**Tipo:** Aplicación full-stack para screening inteligente de CVs  
**Tecnologías:** FastAPI (Backend) + React/TypeScript (Frontend)  
**Base de datos:** Pinecone (vectorial) + OpenAI (LLM)  

### URLs del Sistema
- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/v1/health

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Services      │
│   Port: 3000    │    │   Port: 8000    │    │   (Pinecone,    │
│                 │    │                 │    │    OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Backend - FastAPI

### Estructura Principal
```
backend/
├── main.py                 # Aplicación principal FastAPI
├── pyproject.toml          # Dependencias con Poetry
├── endpoints/              # Endpoints de la API
│   ├── cv_screener.py     # Endpoints de screening
│   └── health.py          # Endpoints de salud
├── services/               # Servicios de negocio
│   └── rag_pipeline.py    # Pipeline RAG
├── store/                  # Clientes de almacenamiento
│   └── pinecone_client.py # Cliente Pinecone
└── tests/                  # Pruebas unitarias
```

### Endpoints Disponibles

#### 1. Health Check
```http
GET /api/v1/health
GET /api/v1/health/detailed
GET /api/v1/health/llm-config
```

#### 2. CV Screening
```http
POST /api/v1/screening/analyze
Content-Type: application/json

{
  "job_description": "string",
  "cv_text": "string", 
  "screening_criteria": ["string"]
}
```

```http
POST /api/v1/screening/upload
Content-Type: multipart/form-data

file: [archivo PDF]
```

```http
GET /api/v1/screening/criteria
```

### Comandos Backend

```bash
# Instalar dependencias
cd backend && poetry install

# Ejecutar en desarrollo
cd backend && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ejecutar pruebas
cd backend && poetry run pytest

# Linting y formato
cd backend && poetry run black backend/ && poetry run isort backend/
cd backend && poetry run flake8 backend/ && poetry run mypy backend/

# Usar Makefile
cd backend && make dev
cd backend && make test
cd backend && make lint
cd backend && make format
```

## ⚛️ Frontend - React + TypeScript

### Estructura Principal
```
frontend/
├── src/
│   ├── components/         # Componentes React
│   │   ├── ChatInterface.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Layout.tsx
│   │   └── UploadCVs.tsx
│   ├── services/          # Servicios de API
│   │   └── api.ts
│   ├── config/            # Configuración
│   │   └── api.ts
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   ├── hooks/             # Custom hooks
│   └── contexts/          # Contextos React
├── package.json           # Dependencias NPM
└── vite.config.ts         # Configuración Vite
```

### Componentes Principales

1. **Layout.tsx** - Layout principal de la aplicación
2. **Dashboard.tsx** - Panel principal con métricas
3. **ChatInterface.tsx** - Interfaz de chat para consultas
4. **UploadCVs.tsx** - Componente para subir CVs
5. **ApiDebugInfo.tsx** - Información de debug de la API

### Servicios de API

- **api.ts** - Cliente principal de la API con interceptores
- **config/api.ts** - Configuración centralizada de endpoints

### Comandos Frontend

```bash
# Instalar dependencias
cd frontend && npm install

# Ejecutar en desarrollo
cd frontend && npm run dev

# Construir para producción
cd frontend && npm run build

# Ejecutar pruebas
cd frontend && npm run test

# Linting
cd frontend && npm run lint
cd frontend && npm run lint:fix

# Usar Makefile
cd frontend && make dev
cd frontend && make test
cd frontend && make lint
cd frontend && make build
```

## 🚀 Comandos y Procedimientos

### Inicio Rápido

```bash
# 1. Instalar dependencias de ambos proyectos
make install

# 2. Configurar variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 3. Ejecutar ambos servicios
make dev
```

### Comandos Principales

| Comando | Descripción | Ubicación |
|---------|-------------|-----------|
| `make install` | Instalar todas las dependencias | Raíz |
| `make dev` | Ejecutar ambos servicios | Raíz |
| `make test` | Ejecutar todas las pruebas | Raíz |
| `make lint` | Linting completo | Raíz |
| `make format` | Formatear código | Raíz |
| `make clean` | Limpiar archivos temporales | Raíz |

### Comandos Individuales

#### Backend
```bash
cd backend
make dev          # Desarrollo
make test         # Pruebas
make lint         # Linting
make format       # Formato
make clean        # Limpiar
```

#### Frontend
```bash
cd frontend
make dev          # Desarrollo
make test         # Pruebas
make lint         # Linting
make format       # Formato
make clean        # Limpiar
```

## 📁 Estructura de Archivos

### Archivos de Configuración Importantes

```
├── Makefile                    # Comandos principales
├── backend/
│   ├── main.py                # Aplicación FastAPI
│   ├── pyproject.toml         # Dependencias Python
│   ├── env.example            # Variables de entorno ejemplo
│   └── Makefile               # Comandos backend
├── frontend/
│   ├── package.json           # Dependencias Node.js
│   ├── vite.config.ts         # Configuración Vite
│   ├── env.example            # Variables de entorno ejemplo
│   └── Makefile               # Comandos frontend
└── data/
    └── cvs/                   # Directorio para CVs subidos
```

## 🔐 Variables de Entorno

### Backend (.env)
```bash
# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# OpenAI (fallback)
OPENAI_API_KEY=your_openai_api_key

# OpenRouter (opcional - si no se define, usa OpenAI)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_HTTP_REFERER=http://localhost:3000
OPENROUTER_X_TITLE=AI-Powered CV Screener

# Configuración de la aplicación
DEBUG=True
LOG_LEVEL=INFO
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEBUG_MODE=true
```

## 🧪 Testing y Debugging

### Backend Testing
```bash
cd backend
poetry run pytest                    # Ejecutar pruebas
poetry run pytest --cov=backend     # Con cobertura
poetry run pytest -v                # Verbose
```

### Frontend Testing
```bash
cd frontend
npm run test                        # Ejecutar pruebas
npm run test:ui                     # Interfaz gráfica
npm run test:coverage               # Con cobertura
```

### Debugging

#### Backend
- Logs automáticos en consola
- Endpoint `/api/v1/health/detailed` para estado del sistema
- Uso de `uvicorn --reload` para hot reload

#### Frontend
- DevTools del navegador
- Componente `ApiDebugInfo` para información de API
- Logs de red en DevTools
- Proxy de Vite para desarrollo

## 🚀 Despliegue

### Desarrollo Local
1. Clonar repositorio
2. `make install` - Instalar dependencias
3. Configurar variables de entorno
4. `make dev` - Ejecutar servicios

### Producción
1. `make build` - Construir ambos proyectos
2. Configurar variables de entorno de producción
3. Ejecutar servicios con PM2/Docker/etc.

## 🔧 Troubleshooting

### Problemas Comunes

#### Backend no inicia
```bash
# Verificar dependencias
cd backend && poetry install

# Verificar puerto
lsof -i :8000

# Verificar variables de entorno
cat backend/.env
```

#### Frontend no conecta con Backend
```bash
# Verificar que backend esté ejecutándose
curl http://localhost:8000/api/v1/health

# Verificar configuración de proxy en vite.config.ts
# Verificar VITE_API_BASE_URL en frontend/.env
```

#### Errores de CORS
- Verificar configuración en `main.py` líneas 40-46
- Asegurar que frontend esté en `http://localhost:3000`

#### Errores de Pinecone/OpenAI
- Verificar API keys en `backend/.env`
- Verificar conectividad a internet
- Revisar logs del backend

### Logs y Debugging

#### Backend
```bash
# Ejecutar con logs detallados
cd backend && poetry run uvicorn main:app --reload --log-level debug
```

#### Frontend
```bash
# Ejecutar con debug de API
cd frontend && VITE_DEBUG_MODE=true npm run dev
```

## 📝 Notas Importantes para Agentes

1. **Siempre usar los Makefiles** - Contienen comandos optimizados
2. **Verificar variables de entorno** - Especialmente API keys
3. **Backend debe ejecutarse antes que frontend** - Para evitar errores de conexión
4. **Usar puertos correctos** - Backend: 8000, Frontend: 3000
5. **Revisar logs** - Tanto backend como frontend tienen logging detallado
6. **Probar endpoints** - Usar `/api/v1/health` para verificar estado
7. **CORS configurado** - Para `http://localhost:3000` y `http://localhost:5173`

## 🔄 Flujo de Trabajo Recomendado

1. **Iniciar Backend:** `cd backend && make dev`
2. **Verificar Backend:** `curl http://localhost:8000/api/v1/health`
3. **Iniciar Frontend:** `cd frontend && make dev`
4. **Verificar Frontend:** Abrir `http://localhost:3000`
5. **Debug si es necesario:** Revisar logs y usar herramientas de debug

---

**Última actualización:** $(date)  
**Versión del proyecto:** 1.0.0  
**Mantenido por:** Equipo de desarrollo AI-Powered CV Screener
