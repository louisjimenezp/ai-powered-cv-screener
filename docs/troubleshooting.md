# Troubleshooting

## 🚨 Problemas Comunes

### Backend no inicia

**Síntoma:** Error al ejecutar `poetry run uvicorn main:app`

**Posibles causas:**
- Variables de entorno no configuradas
- Dependencias no instaladas
- Puerto 8000 ocupado

**Solución:**
```bash
# 1. Verificar variables de entorno
cd backend
cat .env

# 2. Instalar dependencias
poetry install

# 3. Verificar puerto
lsof -i :8000

# 4. Iniciar con logs detallados
poetry run uvicorn main:app --reload --log-level debug
```

### Frontend no conecta con Backend

**Síntoma:** Error 404 o "Network Error" en llamadas API

**Posibles causas:**
- Backend no está ejecutándose
- URL incorrecta en configuración
- CORS mal configurado

**Solución:**
```bash
# 1. Verificar que backend esté ejecutándose
curl http://localhost:8000/api/v1/health

# 2. Verificar configuración frontend
cd frontend
cat .env

# 3. Verificar proxy en vite.config.ts
# Debe tener: server: { proxy: { '/api': 'http://localhost:8000' } }

# 4. Reiniciar ambos servicios
```

### Pinecone no funciona

**Síntoma:** Error al inicializar vectorstore o consultas

**Posibles causas:**
- API key incorrecta
- Índice no existe
- Configuración incorrecta

**Solución:**
```bash
# 1. Verificar API key
echo $PINECONE_API_KEY

# 2. Verificar índice
# El sistema crea automáticamente el índice si no existe

# 3. Verificar logs del backend
# Buscar mensajes de error de Pinecone

# 4. Probar conexión manual
python -c "
from pinecone import Pinecone
pc = Pinecone(api_key='tu_api_key')
print(pc.list_indexes())
"
```

### OpenAI/OpenRouter no funciona

**Síntoma:** Error en consultas de chat o generación de embeddings

**Posibles causas:**
- API key incorrecta
- Límites de rate limit
- Configuración incorrecta

**Solución:**
```bash
# 1. Verificar API keys
echo $OPENAI_API_KEY
echo $OPENROUTER_API_KEY

# 2. Verificar configuración en llm_config.py
cd backend
python -c "from config.llm_config import get_provider_info; print(get_provider_info())"

# 3. Probar conexión manual
python -c "
from openai import OpenAI
client = OpenAI(api_key='tu_api_key')
print(client.models.list())
"
```

### Error de pypdf no definido

**Síntoma:** `Error al extraer texto del PDF: name 'pypdf' is not defined`

**Causa:** La librería `pypdf` no está instalada o no está importada correctamente

**Solución:**
```bash
# 1. Verificar que pypdf esté en pyproject.toml
cd backend
grep "pypdf" pyproject.toml

# 2. Instalar dependencias
poetry install

# 3. Verificar importación en rag_pipeline.py
grep "import pypdf" services/rag_pipeline.py

# 4. Si falta la importación, agregar:
# import pypdf
```

**Archivos afectados:**
- `backend/pyproject.toml` - Agregar `pypdf = "^4.0.0"`
- `backend/services/rag_pipeline.py` - Agregar `import pypdf`

### Archivos no se procesan

**Síntoma:** PDFs se suben pero no aparecen en Pinecone

**Posibles causas:**
- Error en extracción de texto (pypdf no definido)
- Error en chunking
- Error en generación de embeddings
- Error en guardado en Pinecone

**Solución:**
```bash
# 1. Verificar logs del backend
# Buscar mensajes de error específicos

# 2. Verificar archivos en data/
ls -la data/cvs/
ls -la data/json/

# 3. Verificar Pinecone
# Revisar si aparecen vectores con prefix cv_

# 4. Probar procesamiento manual
python -c "
import asyncio
from services.rag_pipeline import RAGPipeline
from services.file_manager import FileManager

async def test():
    pipeline = RAGPipeline()
    await pipeline.initialize()
    # Probar procesamiento manual
"
```

### Chat no devuelve respuestas

**Síntoma:** Chat no responde o devuelve errores

**Posibles causas:**
- No hay archivos procesados en Pinecone
- Error en consulta RAG
- Error en LLM

**Solución:**
```bash
# 1. Verificar que hay archivos en Pinecone
# Revisar dashboard de Pinecone

# 2. Verificar logs del backend
# Buscar errores en consultas

# 3. Probar consulta manual
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# 4. Verificar que RAGPipeline esté inicializado
```

## 🔍 Debugging Avanzado

### Verificar Estado del Sistema

**Script de verificación:**
```python
# backend/debug_system.py
import asyncio
from services.rag_pipeline import RAGPipeline
from services.file_manager import FileManager

async def debug_system():
    print("=== DEBUG SISTEMA ===")
    
    # 1. Verificar FileManager
    fm = FileManager()
    files = await fm.list_processed_files()
    print(f"Archivos procesados: {len(files)}")
    
    # 2. Verificar RAGPipeline
    pipeline = RAGPipeline()
    await pipeline.initialize()
    print("RAGPipeline inicializado")
    
    # 3. Probar consulta
    try:
        result = await pipeline.query("test")
        print(f"Consulta exitosa: {result[:100]}...")
    except Exception as e:
        print(f"Error en consulta: {e}")

if __name__ == "__main__":
    asyncio.run(debug_system())
```

### Verificar Pinecone

**Script de verificación Pinecone:**
```python
# backend/debug_pinecone.py
import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

def debug_pinecone():
    print("=== DEBUG PINECONE ===")
    
    # 1. Conectar
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    print("Conexión exitosa")
    
    # 2. Listar índices
    indexes = pc.list_indexes()
    print(f"Índices disponibles: {[idx.name for idx in indexes]}")
    
    # 3. Conectar al índice
    index_name = os.getenv("PINECONE_INDEX_NAME", "cv-screener")
    index = pc.Index(index_name)
    print(f"Conectado al índice: {index_name}")
    
    # 4. Verificar estadísticas
    stats = index.describe_index_stats()
    print(f"Total vectores: {stats.total_vector_count}")
    print(f"Dimensiones: {stats.dimension}")

if __name__ == "__main__":
    debug_pinecone()
```

### Verificar Archivos

**Script de verificación archivos:**
```bash
# Verificar estructura de archivos
find data/ -type f -name "*.pdf" | wc -l  # PDFs
find data/ -type f -name "*.json" | wc -l  # Metadatos

# Verificar contenido de metadatos
ls data/json/ | head -1 | xargs -I {} cat data/json/{}

# Verificar tamaño de archivos
du -sh data/cvs/
du -sh data/json/
```

## 🛠️ Herramientas de Debug

### Logs del Backend

**Ver logs en tiempo real:**
```bash
cd backend
poetry run uvicorn main:app --reload --log-level debug
```

**Ver logs específicos:**
```bash
# Buscar errores de Pinecone
grep -i "pinecone" logs/app.log

# Buscar errores de OpenAI
grep -i "openai" logs/app.log

# Buscar errores de procesamiento
grep -i "error" logs/app.log
```

### Logs del Frontend

**Ver logs en DevTools:**
1. Abrir DevTools (F12)
2. Ir a Console
3. Buscar errores de API
4. Verificar Network tab para requests fallidos

### Verificar Red

**Verificar conectividad:**
```bash
# Backend
curl -v http://localhost:8000/api/v1/health

# Frontend
curl -v http://localhost:3000

# Verificar CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/v1/chat
```

## 📋 Checklist de Verificación

### Antes de empezar
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Puertos disponibles (3000, 8000)
- [ ] Conexión a internet

### Durante desarrollo
- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Health check responde
- [ ] Upload funciona
- [ ] Chat funciona
- [ ] Eliminación funciona

### Después de cambios
- [ ] Tests pasan
- [ ] No hay errores en logs
- [ ] Funcionalidad completa
- [ ] Performance aceptable

---

*Si encuentras un problema no listado aquí, revisa los logs y usa los scripts de debug.*
