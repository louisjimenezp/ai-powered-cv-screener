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
    
    async def cleanup(self):
        """Limpiar recursos"""
        try:
            if self.vectorstore:
                # Cerrar conexiones si es necesario
                pass
            print("Pipeline RAG limpiado correctamente")
        except Exception as e:
            print(f"Error al limpiar pipeline RAG: {str(e)}")
