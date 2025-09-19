"""
Endpoints para el screening de CVs
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any
from pydantic import BaseModel
import os

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
async def upload_cv(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Subir un archivo CV para procesamiento
    """
    # Verificar que sea un archivo PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
    
    try:
        # Guardar el archivo en la carpeta de datos
        upload_path = os.path.join("../../data/cvs", file.filename)
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "message": "CV subido exitosamente",
            "filename": file.filename,
            "path": upload_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir CV: {str(e)}")

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
