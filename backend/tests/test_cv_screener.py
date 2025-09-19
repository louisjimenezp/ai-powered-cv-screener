"""
Tests para los endpoints de screening de CVs
"""
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_get_screening_criteria(client):
    """Test para obtener criterios de screening"""
    response = client.get("/api/v1/screening/criteria")
    assert response.status_code == 200
    data = response.json()
    assert "technical_skills" in data
    assert "soft_skills" in data
    assert "experience_levels" in data
    assert isinstance(data["technical_skills"], list)
    assert isinstance(data["soft_skills"], list)
    assert isinstance(data["experience_levels"], list)

def test_analyze_cv(client):
    """Test para análisis de CV"""
    test_data = {
        "job_description": "Desarrollador Python con experiencia en FastAPI",
        "cv_text": "Desarrollador con 5 años de experiencia en Python y FastAPI",
        "screening_criteria": ["Python", "FastAPI"]
    }
    
    response = client.post("/api/v1/screening/analyze", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "match_percentage" in data
    assert "strengths" in data
    assert "weaknesses" in data
    assert "recommendations" in data
    assert "detailed_analysis" in data

def test_upload_cv_invalid_file(client):
    """Test para subida de archivo inválido"""
    # Crear un archivo de texto en lugar de PDF
    files = {"file": ("test.txt", b"test content", "text/plain")}
    response = client.post("/api/v1/screening/upload", files=files)
    assert response.status_code == 400
    assert "Solo se permiten archivos PDF" in response.json()["detail"]
