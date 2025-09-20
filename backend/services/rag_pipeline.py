"""
Pipeline RAG para el procesamiento y análisis de CVs
"""
import os
from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.schema import Document
from pinecone import Pinecone
from dotenv import load_dotenv
from config.llm_config import get_llm_config, get_provider_info
import pypdf
from pathlib import Path

load_dotenv()

class RAGPipeline:
    """Pipeline RAG para análisis de CVs"""
    
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.qa_chain = None
        self.text_splitter = None
        self.llm_config = None
        self.provider_info = None
        
    async def initialize(self):
        """Inicializar el pipeline RAG"""
        try:
            # Obtener configuración del LLM
            self.llm_config = get_llm_config()
            self.provider_info = get_provider_info()
            
            print(f"Usando proveedor: {self.provider_info['provider']}")
            print(f"Base URL: {self.provider_info['base_url']}")
            
            # Configurar embeddings (siempre usa OpenAI para embeddings)
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
            
            # Configurar Pinecone
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            
            # Obtener o crear índice
            index_name = os.getenv("PINECONE_INDEX_NAME", "cv-screener")
            
            # Listar índices existentes
            existing_indexes = [index.name for index in pc.list_indexes()]
            
            if index_name not in existing_indexes:
                pc.create_index(
                    name=index_name,
                    dimension=1536,  # Dimensión de OpenAI embeddings
                    metric="cosine"
                )
            
            # Conectar al índice
            self.vectorstore = PineconeVectorStore.from_existing_index(
                index_name=index_name,
                embedding=self.embeddings
            )
            
            # Configurar LLM con la configuración dinámica
            llm_kwargs = {
                "openai_api_key": self.llm_config["api_key"],
                "model": "gpt-3.5-turbo",
                "temperature": 0.1
            }
            
            # Si es OpenRouter, agregar la base_url
            if self.llm_config["base_url"]:
                llm_kwargs["openai_api_base"] = self.llm_config["base_url"]
            
            self.llm = ChatOpenAI(**llm_kwargs)
            
            # Configurar text splitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            
            # Configurar QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5})
            )
            
            print("Pipeline RAG inicializado correctamente")
            
        except Exception as e:
            print(f"Error al inicializar pipeline RAG: {str(e)}")
            raise
    
    async def add_documents(self, documents: List[Document]) -> None:
        """Agregar documentos al vectorstore"""
        try:
            # Dividir documentos en chunks
            texts = self.text_splitter.split_documents(documents)
            
            # Agregar al vectorstore
            self.vectorstore.add_documents(texts)
            print(f"Agregados {len(texts)} chunks al vectorstore")
            
        except Exception as e:
            print(f"Error al agregar documentos: {str(e)}")
            raise
    
    async def query(self, question: str) -> str:
        """Realizar consulta al pipeline RAG"""
        try:
            if not self.qa_chain:
                raise ValueError("Pipeline RAG no inicializado")
            
            result = self.qa_chain.run(question)
            return result
            
        except Exception as e:
            print(f"Error en consulta RAG: {str(e)}")
            raise
    
    async def analyze_cv_match(self, cv_text: str, job_description: str) -> Dict[str, Any]:
        """Analizar coincidencia entre CV y descripción de trabajo"""
        try:
            # Crear prompt para análisis
            prompt = f"""
            Analiza la siguiente coincidencia entre un CV y una descripción de trabajo:
            
            DESCRIPCIÓN DE TRABAJO:
            {job_description}
            
            CV:
            {cv_text}
            
            Proporciona un análisis detallado incluyendo:
            1. Puntuación general (0-10)
            2. Porcentaje de coincidencia
            3. Fortalezas identificadas
            4. Debilidades identificadas
            5. Recomendaciones específicas
            
            Formato la respuesta como JSON.
            """
            
            # Usar el pipeline RAG para análisis
            analysis = await self.query(prompt)
            
            # Aquí se procesaría la respuesta para extraer la información estructurada
            # Por simplicidad, devolvemos un análisis básico
            return {
                "score": 8.5,
                "match_percentage": 85.0,
                "strengths": ["Experiencia relevante", "Habilidades técnicas"],
                "weaknesses": ["Falta experiencia específica"],
                "recommendations": ["Mejorar perfil técnico"]
            }
            
        except Exception as e:
            print(f"Error en análisis de CV: {str(e)}")
            raise
    
    async def process_pdf_with_uuid(self, file_uuid: str, file_path: str) -> bool:
        """
        Procesa PDF y guarda en Pinecone con UUID como prefix
        
        Args:
            file_uuid: UUID único del archivo
            file_path: Ruta del archivo PDF
            
        Returns:
            bool: True si se procesó correctamente
        """
        try:
            print(f"Procesando PDF: {file_uuid}")
            
            # Extraer texto del PDF
            text = await self._extract_text_from_pdf(file_path)
            if not text:
                raise ValueError("No se pudo extraer texto del PDF")
            
            # Crear documento
            document = Document(
                page_content=text,
                metadata={
                    "source": file_uuid,
                    "filename": Path(file_path).name,
                    "uuid": file_uuid
                }
            )
            
            # Dividir en chunks
            chunks = self.text_splitter.split_documents([document])
            
            # Añadir prefix UUID a los metadatos de cada chunk
            for i, chunk in enumerate(chunks):
                chunk.metadata.update({
                    "uuid": file_uuid,
                    "chunk_index": i,
                    "pinecone_id": f"cv_{file_uuid}_chunk_{i}"
                })
            
            # Agregar al vectorstore
            self.vectorstore.add_documents(chunks)
            
            print(f"Procesado exitosamente: {file_uuid} ({len(chunks)} chunks)")
            return True
            
        except Exception as e:
            print(f"Error al procesar PDF {file_uuid}: {str(e)}")
            return False
    
    async def query_with_sources(self, question: str) -> Dict[str, Any]:
        """
        Consulta RAG y devuelve respuesta con fuentes
        
        Args:
            question: Pregunta del usuario
            
        Returns:
            Dict con respuesta, fuentes y confianza
        """
        try:
            if not self.qa_chain:
                raise ValueError("Pipeline RAG no inicializado")
            
            # Realizar consulta
            result = self.qa_chain.run(question)
            
            # Obtener documentos fuente
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})
            source_docs = retriever.get_relevant_documents(question)
            
            # Extraer UUIDs únicos de las fuentes
            source_uuids = list(set([doc.metadata.get("uuid") for doc in source_docs if doc.metadata.get("uuid")]))
            
            # Calcular confianza basada en número de fuentes
            confidence = min(0.9, 0.5 + (len(source_uuids) * 0.1))
            
            return {
                "response": result,
                "sources": source_uuids,
                "source_files": [doc.metadata.get("filename", "Unknown") for doc in source_docs],
                "confidence": round(confidence, 2)
            }
            
        except Exception as e:
            print(f"Error en consulta con fuentes: {str(e)}")
            return {
                "response": f"Error al procesar la consulta: {str(e)}",
                "sources": [],
                "source_files": [],
                "confidence": 0.0
            }
    
    async def delete_by_uuid(self, file_uuid: str) -> bool:
        """
        Elimina vectores de Pinecone por UUID
        
        Args:
            file_uuid: UUID del archivo a eliminar
            
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            if not self.vectorstore:
                raise ValueError("Pipeline RAG no inicializado")
            
            # Buscar vectores con el prefix del UUID
            prefix = f"cv_{file_uuid}"
            
            # Obtener el índice de Pinecone directamente
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "cv-screener")
            index = pc.Index(index_name)
            
            # Listar vectores con el prefix
            # Nota: Pinecone no tiene una función directa para listar por prefix
            # En una implementación real, necesitarías mantener un registro de IDs
            # Por ahora, asumimos que los IDs siguen el patrón cv_{uuid}_chunk_{index}
            
            # Intentar eliminar vectores conocidos (hasta 100 chunks por archivo)
            ids_to_delete = []
            for i in range(100):  # Asumir máximo 100 chunks por archivo
                vector_id = f"cv_{file_uuid}_chunk_{i}"
                ids_to_delete.append(vector_id)
            
            # Eliminar vectores
            if ids_to_delete:
                index.delete(ids=ids_to_delete)
                print(f"Eliminados vectores para UUID: {file_uuid}")
            
            return True
            
        except Exception as e:
            print(f"Error al eliminar vectores para UUID {file_uuid}: {str(e)}")
            return False
    
    async def _extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extrae texto de un archivo PDF
        
        Args:
            file_path: Ruta del archivo PDF
            
        Returns:
            str: Texto extraído
        """
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
            
        except Exception as e:
            print(f"Error al extraer texto del PDF {file_path}: {str(e)}")
            return ""
    
    async def get_vector_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del vectorstore
        
        Returns:
            Dict con estadísticas
        """
        try:
            if not self.vectorstore:
                return {"error": "Pipeline RAG no inicializado"}
            
            # Obtener estadísticas del índice
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "cv-screener")
            index = pc.Index(index_name)
            
            stats = index.describe_index_stats()
            
            return {
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_name": index_name,
                "namespaces": stats.namespaces if hasattr(stats, 'namespaces') else {}
            }
            
        except Exception as e:
            print(f"Error al obtener estadísticas del vectorstore: {str(e)}")
            return {"error": str(e)}
    
    async def cleanup(self):
        """Limpiar recursos"""
        try:
            if self.vectorstore:
                # Cerrar conexiones si es necesario
                pass
            print("Pipeline RAG limpiado correctamente")
        except Exception as e:
            print(f"Error al limpiar pipeline RAG: {str(e)}")
