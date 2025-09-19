"""
Cliente para interacción con Pinecone
"""
import os
from typing import List, Dict, Any, Optional
import pinecone
from dotenv import load_dotenv

load_dotenv()

class PineconeClient:
    """Cliente para operaciones con Pinecone"""
    
    def __init__(self):
        self.index = None
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "cv-screener")
        
    async def initialize(self):
        """Inicializar conexión con Pinecone"""
        try:
            pinecone.init(
                api_key=os.getenv("PINECONE_API_KEY"),
                environment=os.getenv("PINECONE_ENVIRONMENT")
            )
            
            # Obtener o crear índice
            if self.index_name not in pinecone.list_indexes():
                pinecone.create_index(
                    name=self.index_name,
                    dimension=1536,  # Dimensión de OpenAI embeddings
                    metric="cosine"
                )
            
            self.index = pinecone.Index(self.index_name)
            print(f"Conectado al índice Pinecone: {self.index_name}")
            
        except Exception as e:
            print(f"Error al conectar con Pinecone: {str(e)}")
            raise
    
    async def upsert_vectors(self, vectors: List[Dict[str, Any]]) -> None:
        """Insertar o actualizar vectores en Pinecone"""
        try:
            if not self.index:
                await self.initialize()
            
            self.index.upsert(vectors=vectors)
            print(f"Insertados {len(vectors)} vectores en Pinecone")
            
        except Exception as e:
            print(f"Error al insertar vectores: {str(e)}")
            raise
    
    async def query_vectors(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Consultar vectores similares"""
        try:
            if not self.index:
                await self.initialize()
            
            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True
            )
            
            return results['matches']
            
        except Exception as e:
            print(f"Error al consultar vectores: {str(e)}")
            raise
    
    async def delete_vectors(self, ids: List[str]) -> None:
        """Eliminar vectores por IDs"""
        try:
            if not self.index:
                await self.initialize()
            
            self.index.delete(ids=ids)
            print(f"Eliminados {len(ids)} vectores de Pinecone")
            
        except Exception as e:
            print(f"Error al eliminar vectores: {str(e)}")
            raise
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del índice"""
        try:
            if not self.index:
                await self.initialize()
            
            stats = self.index.describe_index_stats()
            return stats
            
        except Exception as e:
            print(f"Error al obtener estadísticas: {str(e)}")
            raise
