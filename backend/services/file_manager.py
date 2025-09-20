"""
Sistema de gestión de archivos con UUIDs
Maneja la subida, almacenamiento y metadatos de archivos PDF
"""
import uuid
import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile
import asyncio

class FileManager:
    """Gestor de archivos con UUIDs únicos"""
    
    def __init__(self):
        # Rutas relativas al directorio raíz del proyecto
        project_root = Path(__file__).parent.parent.parent
        self.cvs_dir = project_root / "data" / "cvs"
        self.json_dir = project_root / "data" / "json"
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Crear directorios necesarios si no existen"""
        self.cvs_dir.mkdir(parents=True, exist_ok=True)
        self.json_dir.mkdir(parents=True, exist_ok=True)
    
    async def save_file_with_metadata(self, file: UploadFile) -> str:
        """
        Guarda archivo PDF y genera metadatos JSON
        
        Args:
            file: Archivo PDF subido
            
        Returns:
            str: UUID del archivo guardado
        """
        try:
            # Generar UUID único
            file_uuid = str(uuid.uuid4())
            
            # Guardar archivo como {uuid}.pdf
            file_path = self.cvs_dir / f"{file_uuid}.pdf"
            
            # Leer contenido del archivo
            content = await file.read()
            
            # Guardar archivo
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            # Crear metadatos
            metadata = {
                "uuid": file_uuid,
                "original_filename": file.filename,
                "upload_date": datetime.utcnow().isoformat() + "Z",
                "file_size": len(content),
                "status": "uploaded",
                "chunks_count": 0,
                "pinecone_prefix": f"cv_{file_uuid}",
                "processing_errors": [],
                "last_accessed": datetime.utcnow().isoformat() + "Z"
            }
            
            # Guardar metadatos
            await self._save_metadata(file_uuid, metadata)
            
            print(f"Archivo guardado: {file_uuid} ({file.filename})")
            return file_uuid
            
        except Exception as e:
            print(f"Error al guardar archivo: {str(e)}")
            raise
    
    async def get_file_metadata(self, file_uuid: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene metadatos de un archivo
        
        Args:
            file_uuid: UUID del archivo
            
        Returns:
            Dict con metadatos o None si no existe
        """
        try:
            metadata_path = self.json_dir / f"{file_uuid}.json"
            
            if not metadata_path.exists():
                return None
            
            with open(metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
                
        except Exception as e:
            print(f"Error al leer metadatos de {file_uuid}: {str(e)}")
            return None
    
    async def update_file_metadata(self, file_uuid: str, updates: Dict[str, Any]) -> bool:
        """
        Actualiza metadatos de un archivo
        
        Args:
            file_uuid: UUID del archivo
            updates: Diccionario con campos a actualizar
            
        Returns:
            bool: True si se actualizó correctamente
        """
        try:
            metadata = await self.get_file_metadata(file_uuid)
            if not metadata:
                return False
            
            # Actualizar campos
            metadata.update(updates)
            metadata["last_accessed"] = datetime.utcnow().isoformat() + "Z"
            
            # Guardar metadatos actualizados
            await self._save_metadata(file_uuid, metadata)
            return True
            
        except Exception as e:
            print(f"Error al actualizar metadatos de {file_uuid}: {str(e)}")
            return False
    
    async def delete_file_and_metadata(self, file_uuid: str) -> bool:
        """
        Elimina archivo físico y metadatos
        
        Args:
            file_uuid: UUID del archivo
            
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            # Eliminar archivo físico
            file_path = self.cvs_dir / f"{file_uuid}.pdf"
            if file_path.exists():
                file_path.unlink()
            
            # Eliminar metadatos
            metadata_path = self.json_dir / f"{file_uuid}.json"
            if metadata_path.exists():
                metadata_path.unlink()
            
            print(f"Archivo eliminado: {file_uuid}")
            return True
            
        except Exception as e:
            print(f"Error al eliminar archivo {file_uuid}: {str(e)}")
            return False
    
    async def list_processed_files(self) -> List[Dict[str, Any]]:
        """
        Lista todos los archivos procesados con sus metadatos
        
        Returns:
            Lista de diccionarios con metadatos
        """
        try:
            files = []
            
            # Buscar todos los archivos JSON de metadatos
            for json_file in self.json_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                        files.append(metadata)
                except Exception as e:
                    print(f"Error al leer {json_file}: {str(e)}")
                    continue
            
            # Ordenar por fecha de subida (más reciente primero)
            files.sort(key=lambda x: x.get("upload_date", ""), reverse=True)
            
            return files
            
        except Exception as e:
            print(f"Error al listar archivos: {str(e)}")
            return []
    
    async def get_file_path(self, file_uuid: str) -> Optional[Path]:
        """
        Obtiene la ruta del archivo físico
        
        Args:
            file_uuid: UUID del archivo
            
        Returns:
            Path del archivo o None si no existe
        """
        file_path = self.cvs_dir / f"{file_uuid}.pdf"
        return file_path if file_path.exists() else None
    
    async def file_exists(self, file_uuid: str) -> bool:
        """
        Verifica si un archivo existe
        
        Args:
            file_uuid: UUID del archivo
            
        Returns:
            bool: True si existe
        """
        file_path = self.cvs_dir / f"{file_uuid}.pdf"
        metadata_path = self.json_dir / f"{file_uuid}.json"
        return file_path.exists() and metadata_path.exists()
    
    async def _save_metadata(self, file_uuid: str, metadata: Dict[str, Any]) -> None:
        """
        Guarda metadatos en archivo JSON
        
        Args:
            file_uuid: UUID del archivo
            metadata: Diccionario con metadatos
        """
        metadata_path = self.json_dir / f"{file_uuid}.json"
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del sistema de archivos
        
        Returns:
            Dict con estadísticas
        """
        try:
            # Contar archivos PDF
            pdf_count = len(list(self.cvs_dir.glob("*.pdf")))
            
            # Contar metadatos
            json_count = len(list(self.json_dir.glob("*.json")))
            
            # Calcular tamaño total
            total_size = sum(f.stat().st_size for f in self.cvs_dir.glob("*.pdf"))
            
            return {
                "total_files": pdf_count,
                "metadata_files": json_count,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "cvs_directory": str(self.cvs_dir),
                "json_directory": str(self.json_dir)
            }
            
        except Exception as e:
            print(f"Error al obtener estadísticas: {str(e)}")
            return {
                "total_files": 0,
                "metadata_files": 0,
                "total_size_bytes": 0,
                "total_size_mb": 0,
                "error": str(e)
            }
