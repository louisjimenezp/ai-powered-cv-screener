"""
Aplicación principal FastAPI para el AI-Powered CV Screener
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from endpoints import cv_screener, health
from services.rag_pipeline import RAGPipeline

# Cargar variables de entorno
load_dotenv()

# Inicializar el pipeline RAG
rag_pipeline = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    global rag_pipeline
    # Inicializar el pipeline RAG al arrancar
    rag_pipeline = RAGPipeline()
    await rag_pipeline.initialize()
    yield
    # Cleanup al cerrar
    if rag_pipeline:
        await rag_pipeline.cleanup()

# Crear la aplicación FastAPI
app = FastAPI(
    title="AI-Powered CV Screener API",
    description="API para el screening inteligente de CVs usando RAG y Pinecone",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(cv_screener.router, prefix="/api/v1", tags=["cv-screener"])

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "AI-Powered CV Screener API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
