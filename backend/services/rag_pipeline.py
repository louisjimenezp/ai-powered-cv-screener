"""
Pipeline RAG para el procesamiento y análisis de CVs
"""
import os
from typing import List, Dict, Any, Optional
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.schema import Document
import pinecone
from dotenv import load_dotenv

load_dotenv()

class RAGPipeline:
    """Pipeline RAG para análisis de CVs"""
    
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.qa_chain = None
        self.text_splitter = None
        
    async def initialize(self):
        """Inicializar el pipeline RAG"""
        try:
            # Configurar embeddings
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
            
            # Configurar Pinecone
            pinecone.init(
                api_key=os.getenv("PINECONE_API_KEY"),
                environment=os.getenv("PINECONE_ENVIRONMENT")
            )
            
            # Obtener o crear índice
            index_name = os.getenv("PINECONE_INDEX_NAME", "cv-screener")
            if index_name not in pinecone.list_indexes():
                pinecone.create_index(
                    name=index_name,
                    dimension=1536,  # Dimensión de OpenAI embeddings
                    metric="cosine"
                )
            
            # Conectar al índice
            self.vectorstore = Pinecone.from_existing_index(
                index_name=index_name,
                embedding=self.embeddings
            )
            
            # Configurar LLM
            self.llm = ChatOpenAI(
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                model_name="gpt-3.5-turbo",
                temperature=0.1
            )
            
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
