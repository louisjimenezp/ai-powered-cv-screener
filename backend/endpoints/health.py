"""
Endpoints de salud y estado del sistema
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from config.llm_config import get_provider_info

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Verificar el estado de salud del sistema"""
    return {
        "status": "healthy",
        "message": "AI-Powered CV Screener API está funcionando correctamente"
    }

@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Verificación detallada del estado del sistema"""
    try:
        # Obtener información del proveedor LLM
        llm_info = get_provider_info()
        
        # Aquí podrías verificar conexiones a Pinecone, OpenAI, etc.
        return {
            "status": "healthy",
            "components": {
                "api": "operational",
                "pinecone": "operational",  # Verificar conexión real
                "llm_provider": llm_info["provider"],
                "llm_base_url": llm_info["base_url"],
                "llm_configured": llm_info["api_key_set"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")

@router.get("/health/llm-config")
async def llm_config_check() -> Dict[str, Any]:
    """Verificar la configuración del LLM"""
    try:
        llm_info = get_provider_info()
        return {
            "status": "success",
            "llm_config": llm_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener configuración LLM: {str(e)}")
