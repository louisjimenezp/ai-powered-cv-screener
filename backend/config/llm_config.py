"""
Configuración de LLM con soporte para OpenAI y OpenRouter
"""
import os
from typing import Dict, Any, Optional
from openai import OpenAI

def get_llm_config() -> Dict[str, Any]:
    """
    Obtiene la configuración del LLM basada en las variables de entorno.
    Prioriza OpenRouter si está configurado, sino usa OpenAI.
    """
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if openrouter_api_key:
        # Configuración para OpenRouter
        return {
            "api_key": openrouter_api_key,
            "base_url": os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            "default_headers": {
                "HTTP-Referer": os.getenv("OPENROUTER_HTTP_REFERER", "http://localhost:3000"),
                "X-Title": os.getenv("OPENROUTER_X_TITLE", "AI-Powered CV Screener"),
            },
            "provider": "openrouter"
        }
    elif openai_api_key:
        # Configuración para OpenAI (fallback)
        return {
            "api_key": openai_api_key,
            "base_url": None,  # Usa la URL por defecto de OpenAI
            "default_headers": {},
            "provider": "openai"
        }
    else:
        raise ValueError("No se encontró ni OPENROUTER_API_KEY ni OPENAI_API_KEY en las variables de entorno")

def create_openai_client() -> OpenAI:
    """
    Crea un cliente de OpenAI configurado para OpenRouter o OpenAI según las variables de entorno.
    """
    config = get_llm_config()
    
    client_kwargs = {
        "api_key": config["api_key"]
    }
    
    if config["base_url"]:
        client_kwargs["base_url"] = config["base_url"]
    
    if config["default_headers"]:
        client_kwargs["default_headers"] = config["default_headers"]
    
    return OpenAI(**client_kwargs)

def get_provider_info() -> Dict[str, str]:
    """
    Retorna información sobre el proveedor actualmente configurado.
    """
    config = get_llm_config()
    return {
        "provider": config["provider"],
        "base_url": config.get("base_url", "https://api.openai.com/v1"),
        "api_key_set": bool(config["api_key"])
    }
