"""
Endpoints para el chat con IA
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from services.rag_pipeline import RAGPipeline
from services.file_manager import FileManager

router = APIRouter()

class ChatRequest(BaseModel):
    """Modelo para solicitud de chat"""
    message: str

class ChatResponse(BaseModel):
    """Modelo para respuesta de chat"""
    response: str
    sources: List[str]  # UUIDs de archivos
    source_files: List[str]  # Nombres originales
    confidence: float

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Realizar consulta de chat con el sistema RAG
    """
    try:
        # Obtener pipeline RAG
        from main import rag_pipeline
        
        if not rag_pipeline:
            raise HTTPException(status_code=500, detail="Pipeline RAG no disponible")
        
        # Realizar consulta con fuentes
        result = await rag_pipeline.query_with_sources(request.message)
        
        # Resolver nombres de archivos originales desde UUIDs
        source_files = []
        if result["sources"]:
            file_manager = FileManager()
            for uuid in result["sources"]:
                metadata = await file_manager.get_file_metadata(uuid)
                if metadata:
                    source_files.append(metadata.get("original_filename", f"Archivo {uuid[:8]}"))
                else:
                    source_files.append(f"Archivo {uuid[:8]}")
        
        return ChatResponse(
            response=result["response"],
            sources=result["sources"],
            source_files=source_files,
            confidence=result["confidence"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en consulta de chat: {str(e)}")

@router.get("/chat/stats")
async def get_chat_stats() -> Dict[str, Any]:
    """
    Obtener estadísticas del sistema de chat
    """
    try:
        # Obtener pipeline RAG
        from main import rag_pipeline
        
        if not rag_pipeline:
            raise HTTPException(status_code=500, detail="Pipeline RAG no disponible")
        
        # Obtener estadísticas del vectorstore
        vector_stats = await rag_pipeline.get_vector_stats()
        
        # Obtener estadísticas de archivos
        file_manager = FileManager()
        file_stats = file_manager.get_stats()
        
        return {
            "vectorstore": vector_stats,
            "files": file_stats,
            "status": "operational"
        }
        
    except Exception as e:
        print(f"Error en get_chat_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")

@router.post("/chat/test")
async def test_chat() -> Dict[str, str]:
    """
    Endpoint de prueba para verificar que el chat funciona
    """
    try:
        # Obtener pipeline RAG
        from main import rag_pipeline
        
        if not rag_pipeline:
            return {"status": "error", "message": "Pipeline RAG no disponible"}
        
        # Realizar consulta de prueba
        result = await rag_pipeline.query("¿Cuántos archivos hay procesados?")
        
        return {
            "status": "success",
            "message": "Chat funcionando correctamente",
            "test_response": result[:100] + "..." if len(result) > 100 else result
        }
        
    except Exception as e:
        print(f"Error en test_chat: {str(e)}")
        return {
            "status": "error",
            "message": f"Error en prueba de chat: {str(e)}"
        }
