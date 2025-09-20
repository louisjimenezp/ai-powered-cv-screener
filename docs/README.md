# AI-Powered CV Screener - Documentación

## 🎯 Estado Actual del Proyecto

### ✅ Completado
- **Backend FastAPI** - Estructura básica configurada
- **Frontend React** - UI con componentes de subida y chat
- **Pipeline RAG** - Integración con Pinecone y OpenAI/OpenRouter
- **Configuración** - Variables de entorno y dependencias
- **CORS** - Configurado para desarrollo local

### ❌ Pendiente de Implementación
- **Sistema de gestión de archivos con UUID** - Trazabilidad completa
- **Integración real upload → Pinecone** - Procesamiento automático
- **Endpoint de chat funcional** - Consultas RAG reales
- **Eliminación de archivos** - Borrar archivos y vectores
- **Frontend conectado** - Sin simulaciones, APIs reales

## 🚀 Próximos Pasos Inmediatos

1. **Implementar sistema de UUIDs** - Gestión robusta de archivos
2. **Conectar upload con RAG** - Procesamiento automático en Pinecone
3. **Crear endpoint /chat** - Consultas RAG con fuentes
4. **Integrar frontend real** - Eliminar simulaciones
5. **Testing integral** - Verificar flujo completo

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
- **Backend:** FastAPI + Python
- **Frontend:** React + TypeScript + Vite
- **RAG:** Pinecone + OpenAI/OpenRouter
- **Gestión:** UUIDs + JSON metadata

---

*Última actualización: $(date)*
