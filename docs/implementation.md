# Guía de Implementación

## 🎯 Plan de Implementación

### Fase 1: Backend - Sistema de UUIDs (2 horas)
### Fase 2: Backend - Integración RAG (1.5 horas)
### Fase 3: Backend - Endpoint Chat (1 hora)
### Fase 4: Frontend - Integración Real (1.5 horas)
### Fase 5: Testing - Verificación (30 min)

**Total estimado: 6 horas**

---

## 🔧 FASE 1: Backend - Sistema de UUIDs

### 1.1 Actualizar Dependencias

**Archivo:** `backend/pyproject.toml`

**Cambios necesarios:**
```toml
# Cambiar pypdf2 por pypdf (más moderno)
pypdf = "^4.0.0"  # Reemplazar pypdf2

# Añadir dependencias faltantes
tiktoken = "^0.5.1"  # Para conteo de tokens
```

**Comando:**
```bash
cd backend
poetry install
```

### 1.2 Crear FileManager

**Archivo:** `backend/services/file_manager.py` (nuevo)

**Funcionalidad:**
```python
import uuid
import json
import os
from typing import Dict, Any, List
from pathlib import Path

class FileManager:
    def __init__(self):
        self.cvs_dir = Path("../../data/cvs")
        self.json_dir = Path("../../data/json")
        self._ensure_directories()
    
    async def save_file_with_metadata(self, file: UploadFile) -> str:
        """Guarda archivo y genera metadatos"""
        # 1. Generar UUID
        # 2. Guardar archivo como {uuid}.pdf
        # 3. Crear metadatos JSON
        # 4. Devolver UUID
    
    async def get_file_metadata(self, uuid: str) -> Dict[str, Any]:
        """Obtiene metadatos de archivo"""
    
    async def delete_file_and_metadata(self, uuid: str) -> bool:
        """Elimina archivo y metadatos"""
    
    async def list_processed_files(self) -> List[Dict[str, Any]]:
        """Lista archivos procesados"""
```

### 1.3 Actualizar RAGPipeline

**Archivo:** `backend/services/rag_pipeline.py`

**Nuevas funciones:**
```python
async def process_pdf_with_uuid(self, uuid: str, file_path: str) -> bool:
    """Procesa PDF y guarda en Pinecone con UUID como prefix"""
    # 1. Extraer texto del PDF
    # 2. Chunking del texto
    # 3. Generar embeddings
    # 4. Guardar en Pinecone con prefix cv_{uuid}
    # 5. Actualizar metadatos

async def query_with_sources(self, question: str) -> Dict[str, Any]:
    """Consulta RAG y devuelve fuentes"""
    # 1. Consultar Pinecone
    # 2. Identificar UUIDs de archivos fuente
    # 3. Resolver nombres originales
    # 4. Construir respuesta con fuentes

async def delete_by_uuid(self, uuid: str) -> bool:
    """Elimina vectores por UUID"""
    # 1. Buscar vectores con prefix cv_{uuid}
    # 2. Eliminar de Pinecone
    # 3. Confirmar eliminación
```

### 1.4 Modificar Upload Endpoint

**Archivo:** `backend/endpoints/cv_screener.py`

**Cambios en `upload_cv`:**
```python
@router.post("/screening/upload")
async def upload_cv(file: UploadFile = File(...)) -> Dict[str, str]:
    # 1. Validar archivo PDF
    # 2. Usar FileManager para guardar
    # 3. Procesar con RAGPipeline
    # 4. Devolver UUID y estado
```

**Nuevo endpoint:**
```python
@router.delete("/screening/upload/{uuid}")
async def delete_cv(uuid: str) -> Dict[str, str]:
    # 1. Eliminar de Pinecone
    # 2. Eliminar archivo físico
    # 3. Eliminar metadatos
    # 4. Confirmar eliminación
```

---

## 🔧 FASE 2: Backend - Integración RAG

### 2.1 Crear Endpoint de Chat

**Archivo:** `backend/endpoints/chat.py` (nuevo)

**Funcionalidad:**
```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: List[str]  # UUIDs de archivos
    source_files: List[str]  # Nombres originales
    confidence: float

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # 1. Usar RAGPipeline.query_with_sources
    # 2. Devolver respuesta con fuentes
```

### 2.2 Integrar en main.py

**Archivo:** `backend/main.py`

**Cambios:**
```python
from endpoints import cv_screener, health, chat

# Incluir router de chat
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
```

---

## 🔧 FASE 3: Frontend - Integración Real

### 3.1 Actualizar Tipos TypeScript

**Archivo:** `frontend/src/types/index.ts`

**Nuevos tipos:**
```typescript
export interface FileMetadata {
  uuid: string
  original_filename: string
  upload_date: string
  file_size: number
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  chunks_count?: number
  processing_errors?: string[]
}

export interface ChatResponse {
  response: string
  sources: string[]  // UUIDs
  source_files: string[]  // Nombres originales
  confidence: number
}

export interface ChatRequest {
  message: string
}
```

### 3.2 Actualizar API Service

**Archivo:** `frontend/src/services/api.ts`

**Nuevas funciones:**
```typescript
export const cvScreenerAPI = {
  // ... funciones existentes ...
  
  // Chat
  async sendChatMessage(message: string): Promise<ChatResponse> {
    const response = await api.post(API_ENDPOINTS.CHAT, { message })
    return response.data
  },
  
  // Gestión de archivos
  async deleteCV(uuid: string): Promise<{ message: string }> {
    const response = await api.delete(`/screening/upload/${uuid}`)
    return response.data
  },
  
  async getFileMetadata(uuid: string): Promise<FileMetadata> {
    const response = await api.get(`/screening/upload/${uuid}`)
    return response.data
  }
}
```

### 3.3 Conectar ChatInterface

**Archivo:** `frontend/src/components/ChatInterface.tsx`

**Cambios principales:**
```typescript
const handleSendMessage = async () => {
  // 1. Usar cvScreenerAPI.sendChatMessage
  // 2. Mostrar respuesta real
  // 3. Mostrar fuentes con nombres de archivos
  // 4. Manejar errores reales
}
```

### 3.4 Mejorar UploadCVs

**Archivo:** `frontend/src/components/UploadCVs.tsx`

**Mejoras:**
```typescript
// 1. Mostrar UUIDs en la lista
// 2. Botón de eliminación por archivo
// 3. Estado real de procesamiento
// 4. Mostrar metadatos (tamaño, fecha, chunks)
// 5. Usar cvScreenerAPI.deleteCV
```

---

## 🧪 FASE 4: Testing y Verificación

### 4.1 Verificar Backend

**Comandos de prueba:**
```bash
# 1. Iniciar backend
cd backend
poetry run uvicorn main:app --reload

# 2. Verificar health
curl http://localhost:8000/api/v1/health

# 3. Probar upload (usar Postman o curl)
curl -X POST "http://localhost:8000/api/v1/screening/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.pdf"

# 4. Probar chat
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué candidatos tienen experiencia en Python?"}'
```

### 4.2 Verificar Frontend

**Comandos:**
```bash
# 1. Iniciar frontend
cd frontend
npm run dev

# 2. Abrir http://localhost:3000
# 3. Probar subida de PDF
# 4. Probar chat
# 5. Verificar eliminación de archivos
```

### 4.3 Verificar Pinecone

**Verificaciones:**
- Archivos aparecen en Pinecone con prefix correcto
- Chat devuelve respuestas contextuales
- Fuentes se muestran correctamente
- Eliminación borra vectores de Pinecone

---

## 🚀 Comandos de Desarrollo

### Backend
```bash
cd backend
poetry install                    # Instalar dependencias
poetry run uvicorn main:app --reload  # Desarrollo
poetry run pytest                # Tests
poetry run black . && poetry run isort .  # Formato
```

### Frontend
```bash
cd frontend
npm install                      # Instalar dependencias
npm run dev                      # Desarrollo
npm run build                    # Build producción
npm run test                     # Tests
npm run lint                     # Linting
```

### Ambos
```bash
# Desde raíz del proyecto
make dev                         # Iniciar ambos servicios
make test                        # Ejecutar todos los tests
make lint                        # Linting completo
```

---

## 📋 Checklist de Implementación

### Backend
- [ ] Actualizar `pyproject.toml`
- [ ] Crear `FileManager` con UUIDs
- [ ] Extender `RAGPipeline` con nuevas funciones
- [ ] Modificar endpoint upload
- [ ] Crear endpoint chat
- [ ] Crear endpoint delete
- [ ] Integrar en `main.py`

### Frontend
- [ ] Actualizar tipos TypeScript
- [ ] Extender API service
- [ ] Conectar ChatInterface real
- [ ] Mejorar UploadCVs con UUIDs
- [ ] Añadir funcionalidad de eliminación

### Testing
- [ ] Probar upload con UUIDs
- [ ] Probar chat con fuentes
- [ ] Probar eliminación
- [ ] Verificar Pinecone
- [ ] Testing integral frontend-backend

---

*Esta guía te llevará paso a paso para completar la implementación.*
