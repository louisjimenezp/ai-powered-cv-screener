"""
Endpoints para el screening de CVs
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any
from pydantic import BaseModel
import os
from services.file_manager import FileManager
from services.rag_pipeline import RAGPipeline

router = APIRouter()

class CVScreeningRequest(BaseModel):
    """Modelo para solicitud de screening de CV"""
    job_description: str
    cv_text: str
    screening_criteria: List[str] = []

class CVScreeningResponse(BaseModel):
    """Modelo para respuesta de screening de CV"""
    score: float
    match_percentage: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    detailed_analysis: Dict[str, Any]

@router.post("/screening/analyze", response_model=CVScreeningResponse)
async def analyze_cv(request: CVScreeningRequest) -> CVScreeningResponse:
    """
    Analizar un CV contra una descripción de trabajo específica
    """
    try:
        # Aquí se implementaría la lógica de análisis usando el pipeline RAG
        # Por ahora, devolvemos una respuesta de ejemplo
        return CVScreeningResponse(
            score=8.5,
            match_percentage=85.0,
            strengths=[
                "Experiencia relevante en Python y FastAPI",
                "Conocimientos sólidos en machine learning",
                "Experiencia en proyectos de IA"
            ],
            weaknesses=[
                "Falta de experiencia en Docker",
                "No menciona experiencia con bases de datos vectoriales"
            ],
            recommendations=[
                "Considerar agregar experiencia con contenedores",
                "Destacar proyectos específicos de IA/ML"
            ],
            detailed_analysis={
                "technical_skills_match": 0.9,
                "experience_relevance": 0.8,
                "education_match": 0.7
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al analizar CV: {str(e)}")

@router.post("/screening/upload")
async def upload_cv(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Subir un archivo CV para procesamiento con UUID
    """
    # Verificar que sea un archivo PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
    
    try:
        # Inicializar FileManager
        file_manager = FileManager()
        
        # Guardar archivo y generar UUID
        file_uuid = await file_manager.save_file_with_metadata(file)
        
        # Obtener pipeline RAG (asumiendo que está inicializado globalmente)
        # En una implementación real, esto vendría del contexto de la aplicación
        from main import rag_pipeline
        
        if not rag_pipeline:
            # Si no está inicializado, actualizar estado de error
            await file_manager.update_file_metadata(file_uuid, {
                "status": "error",
                "processing_errors": ["Pipeline RAG no inicializado"]
            })
            raise HTTPException(status_code=500, detail="Pipeline RAG no disponible")
        
        # Actualizar estado a procesando
        await file_manager.update_file_metadata(file_uuid, {
            "status": "processing"
        })
        
        # Obtener ruta del archivo
        file_path = await file_manager.get_file_path(file_uuid)
        if not file_path:
            raise HTTPException(status_code=500, detail="Archivo no encontrado")
        
        # Procesar con RAG
        success = await rag_pipeline.process_pdf_with_uuid(file_uuid, str(file_path))
        
        if success:
            # Obtener metadatos actualizados para contar chunks
            metadata = await file_manager.get_file_metadata(file_uuid)
            chunks_count = metadata.get("chunks_count", 0)
            
            # Actualizar estado a procesado
            await file_manager.update_file_metadata(file_uuid, {
                "status": "processed",
                "chunks_count": chunks_count
            })
            
            return {
                "message": "CV subido y procesado exitosamente",
                "uuid": file_uuid,
                "filename": file.filename,
                "status": "processed",
                "chunks_count": chunks_count
            }
        else:
            # Actualizar estado a error
            await file_manager.update_file_metadata(file_uuid, {
                "status": "error",
                "processing_errors": ["Error en procesamiento RAG"]
            })
            
            return {
                "message": "CV subido pero error en procesamiento",
                "uuid": file_uuid,
                "filename": file.filename,
                "status": "error"
            }
            
    except Exception as e:
        print(f"Error en upload_cv: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al subir CV: {str(e)}")

@router.delete("/screening/upload/{uuid}")
async def delete_cv(uuid: str) -> Dict[str, str]:
    """
    Eliminar un archivo CV y sus vectores de Pinecone
    """
    try:
        # Inicializar FileManager
        file_manager = FileManager()
        
        # Verificar que el archivo existe
        if not await file_manager.file_exists(uuid):
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        # Obtener pipeline RAG
        from main import rag_pipeline
        
        if not rag_pipeline:
            raise HTTPException(status_code=500, detail="Pipeline RAG no disponible")
        
        # Eliminar vectores de Pinecone
        pinecone_success = await rag_pipeline.delete_by_uuid(uuid)
        
        # Eliminar archivo físico y metadatos
        file_success = await file_manager.delete_file_and_metadata(uuid)
        
        if pinecone_success and file_success:
            return {
                "message": "Archivo eliminado exitosamente",
                "uuid": uuid,
                "status": "deleted"
            }
        else:
            return {
                "message": "Archivo eliminado con advertencias",
                "uuid": uuid,
                "status": "partial_deletion",
                "pinecone_deleted": str(pinecone_success),
                "file_deleted": str(file_success)
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en delete_cv: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al eliminar CV: {str(e)}")

@router.get("/screening/upload/{uuid}")
async def get_cv_metadata(uuid: str) -> Dict[str, Any]:
    """
    Obtener metadatos de un archivo CV incluyendo estadísticas de vectores
    """
    try:
        # Inicializar FileManager
        file_manager = FileManager()
        
        # Obtener metadatos
        metadata = await file_manager.get_file_metadata(uuid)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        # Obtener estadísticas de vectores si el pipeline está disponible
        try:
            from main import rag_pipeline
            if rag_pipeline:
                vector_stats = await rag_pipeline.get_uuid_stats(uuid)
                metadata["vector_stats"] = vector_stats
        except Exception as e:
            print(f"Error al obtener estadísticas de vectores: {str(e)}")
            metadata["vector_stats"] = {"error": "No disponible"}
        
        return metadata
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en get_cv_metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener metadatos: {str(e)}")

@router.get("/screening/upload")
async def list_cvs() -> Dict[str, Any]:
    """
    Listar todos los archivos CV procesados
    """
    try:
        # Inicializar FileManager
        file_manager = FileManager()
        
        # Obtener lista de archivos
        files = await file_manager.list_processed_files()
        
        # Obtener estadísticas
        stats = file_manager.get_stats()
        
        return {
            "files": files,
            "stats": stats,
            "total": len(files)
        }
        
    except Exception as e:
        print(f"Error en list_cvs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al listar CVs: {str(e)}")

@router.get("/screening/criteria")
async def get_screening_criteria() -> Dict[str, List[str]]:
    """
    Obtener criterios de screening disponibles
    """
    return {
        "technical_skills": [
            "Python", "JavaScript", "React", "Node.js", "Docker", "Kubernetes",
            "AWS", "Azure", "Machine Learning", "Data Science", "SQL", "NoSQL"
        ],
        "soft_skills": [
            "Liderazgo", "Comunicación", "Trabajo en equipo", "Resolución de problemas",
            "Adaptabilidad", "Creatividad", "Gestión de tiempo"
        ],
        "experience_levels": [
            "Junior (0-2 años)", "Mid-level (2-5 años)", "Senior (5+ años)",
            "Lead/Principal (8+ años)", "Staff/Architect (10+ años)"
        ]
    }
