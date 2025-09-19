"""
Script de inicialización del pipeline RAG
Ejecutar una sola vez para ingerir datos iniciales en Pinecone
"""
import asyncio
import os
from pathlib import Path
from typing import List
from langchain.schema import Document
from langchain.document_loaders import PyPDFLoader
from services.rag_pipeline import RAGPipeline

async def load_cv_documents(data_path: str) -> List[Document]:
    """Cargar documentos CV desde la carpeta de datos"""
    documents = []
    cv_path = Path(data_path) / "cvs"
    
    if not cv_path.exists():
        print(f"La carpeta {cv_path} no existe. Creándola...")
        cv_path.mkdir(parents=True, exist_ok=True)
        return documents
    
    # Buscar archivos PDF
    pdf_files = list(cv_path.glob("*.pdf"))
    
    if not pdf_files:
        print(f"No se encontraron archivos PDF en {cv_path}")
        return documents
    
    print(f"Encontrados {len(pdf_files)} archivos PDF")
    
    for pdf_file in pdf_files:
        try:
            print(f"Procesando: {pdf_file.name}")
            loader = PyPDFLoader(str(pdf_file))
            pages = loader.load()
            
            # Agregar metadatos
            for page in pages:
                page.metadata.update({
                    "source": str(pdf_file),
                    "filename": pdf_file.name,
                    "type": "cv"
                })
            
            documents.extend(pages)
            print(f"  - {len(pages)} páginas procesadas")
            
        except Exception as e:
            print(f"Error al procesar {pdf_file.name}: {str(e)}")
            continue
    
    return documents

async def main():
    """Función principal de inicialización"""
    print("Iniciando pipeline RAG...")
    
    # Obtener ruta de datos
    data_path = os.path.join(os.path.dirname(__file__), "..", "data")
    
    # Cargar documentos
    print("Cargando documentos CV...")
    documents = await load_cv_documents(data_path)
    
    if not documents:
        print("No hay documentos para procesar. Saliendo...")
        return
    
    # Inicializar pipeline RAG
    print("Inicializando pipeline RAG...")
    rag_pipeline = RAGPipeline()
    await rag_pipeline.initialize()
    
    # Agregar documentos al vectorstore
    print(f"Agregando {len(documents)} documentos al vectorstore...")
    await rag_pipeline.add_documents(documents)
    
    print("Pipeline RAG inicializado correctamente!")
    print(f"Total de documentos procesados: {len(documents)}")
    
    # Cleanup
    await rag_pipeline.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
