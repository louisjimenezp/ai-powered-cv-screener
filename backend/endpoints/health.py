"""
Endpoints de salud y estado del sistema
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

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
        # Aquí podrías verificar conexiones a Pinecone, OpenAI, etc.
        return {
            "status": "healthy",
            "components": {
                "api": "operational",
                "pinecone": "operational",  # Verificar conexión real
                "openai": "operational"     # Verificar conexión real
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")
