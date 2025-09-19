# Diagrama de Arquitectura - AI-Powered CV Screener

## Flujo Principal

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   N8N Workflow  │    │   Frontend      │    │   Backend       │
│   (Generación)  │    │   (React)       │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Genera CVs PDF     │ 2. Sube CVs          │ 3. Procesa PDFs
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   data/cvs/     │    │   Dashboard     │    │   RAG Pipeline  │
│   (PDFs)        │    │   Chat IA       │    │   (LangChain)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Pinecone      │
                                              │   (Vectores)    │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   OpenAI        │
                                              │   (Embeddings)  │
                                              └─────────────────┘
```

## Componentes del Sistema

### 1. N8N Workflow
- Genera CVs de prueba en formato PDF
- Almacena archivos en `data/cvs/`
- Workflow exportable en JSON

### 2. Frontend (React + Vite)
- **Dashboard**: Estadísticas y resumen
- **Upload CVs**: Subida de archivos PDF
- **Chat IA**: Interfaz conversacional
- **Layout**: Navegación y estructura

### 3. Backend (FastAPI + Python)
- **Endpoints**: API REST para todas las operaciones
- **RAG Pipeline**: Procesamiento con LangChain
- **Store**: Cliente de Pinecone
- **Services**: Lógica de negocio

### 4. Almacenamiento
- **Pinecone**: Base de datos vectorial para embeddings
- **OpenAI**: Generación de embeddings y análisis
- **File System**: Almacenamiento de PDFs

## Flujo de Datos

1. **Generación**: N8N crea CVs PDF → `data/cvs/`
2. **Subida**: Frontend sube PDFs → Backend
3. **Procesamiento**: Backend extrae texto → Genera embeddings
4. **Almacenamiento**: Embeddings → Pinecone
5. **Análisis**: Consultas → RAG Pipeline → Respuestas IA
6. **Visualización**: Resultados → Frontend Dashboard

## Tecnologías por Capa

- **Presentación**: React, TypeScript, Tailwind CSS
- **API**: FastAPI, Python, Poetry
- **IA/ML**: OpenAI, LangChain, Pinecone
- **Automatización**: N8N
- **Almacenamiento**: Pinecone, File System
