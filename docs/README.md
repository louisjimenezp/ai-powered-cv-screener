# AI-Powered CV Screener - Documentación

## 🎯 Estado Actual del Proyecto

### ✅ Completado (100%)
- **Backend FastAPI** - API completa con endpoints funcionales
- **Frontend React** - UI moderna con componentes de subida y chat
- **Pipeline RAG** - Integración completa con Pinecone y Gemini 2.5 Flash
- **Sistema de archivos** - Gestión con UUIDs y metadatos
- **Chat funcional** - Consultas RAG con indicación de fuentes
- **CV Creator** - Workflow N8N para generación automatizada de CVs
- **Configuración** - Variables de entorno y dependencias
- **CORS** - Configurado para desarrollo local

## 🚀 Próximos Pasos para Demo

1. **Generar CVs con N8N** - Ejecutar workflow CV Creator
2. **Descargar PDFs** - Desde Google Drive a carpeta local
3. **Subir CVs** - A través de la interfaz web
4. **Probar chat** - Hacer consultas sobre los CVs
5. **Crear presentación** - Screenshots y video demo

## 📚 Documentación Disponible

- **[Arquitectura](architecture.md)** - Decisiones técnicas y diseño del sistema
- **[Implementación](implementation.md)** - Pasos específicos para completar el proyecto
- **[Troubleshooting](troubleshooting.md)** - Problemas comunes y soluciones

## 🛠️ Quick Start

### Backend
```bash
cd backend
poetry install
cp env.example .env
# Configurar variables de entorno en .env
poetry run uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Verificar Estado
- Backend: http://localhost:8000/api/v1/health
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## 📊 Arquitectura General

```
Frontend (React) ←→ Backend (FastAPI) ←→ Pinecone + OpenAI/OpenRouter
     ↓                    ↓
  UI Components      RAG Pipeline
  - UploadCVs        - File Manager (UUID)
  - ChatInterface    - Vector Store
  - Dashboard        - LLM Integration
```

## 🎯 Objetivos del Proyecto

**Objetivo Principal:** Sistema de screening inteligente de CVs usando RAG

**Funcionalidades Clave:**
- Subir PDFs de CVs con procesamiento automático
- Chat inteligente con consultas sobre los CVs
- Gestión completa de archivos (subir/eliminar)
- Respuestas contextuales con fuentes identificables

**Tecnologías:**
- **Backend:** FastAPI + Python + Poetry
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **RAG:** Pinecone + Gemini 2.5 Flash + LangChain
- **Generación:** N8N + DALL-E 3 + PDFEndpoint
- **Gestión:** UUIDs + JSON metadata

---

*Última actualización: $(date)*
