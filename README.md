# AI-Powered CV Screener

Un sistema completo de screening de CVs impulsado por inteligencia artificial que utiliza RAG (Retrieval-Augmented Generation) con Pinecone y OpenAI para analizar y evaluar candidatos de manera inteligente.

## 🏗️ Arquitectura del Proyecto

Este es un monorepo que contiene:

- **Backend**: API FastAPI con Python y Poetry
- **Frontend**: Aplicación React con Vite y TypeScript
- **N8N Workflows**: Automatización para generación de CVs
- **Data**: Almacenamiento de archivos PDF de CVs

## 🚀 Características Principales

- **Análisis Inteligente de CVs**: Utiliza IA para evaluar coincidencias entre CVs y descripciones de trabajo
- **Pipeline RAG**: Sistema de recuperación y generación aumentada con Pinecone
- **Interfaz Moderna**: Dashboard React con componentes reutilizables
- **Chat con IA**: Interfaz conversacional para consultas sobre candidatos
- **Subida de Archivos**: Procesamiento automático de PDFs
- **Workflows N8N**: Generación automatizada de CVs de prueba

## 📁 Estructura del Proyecto

```
ai-powered-cv-screener/
├── backend/                    # API FastAPI
│   ├── endpoints/             # Rutas de la API
│   ├── services/              # Lógica de negocio y pipeline RAG
│   ├── store/                 # Cliente de Pinecone
│   ├── main.py               # Aplicación principal
│   ├── rag_pipeline_init.py  # Script de inicialización
│   ├── pyproject.toml        # Configuración Poetry
│   └── env.example           # Variables de entorno
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes UI
│   │   ├── contexts/         # React Contexts
│   │   ├── hooks/           # Custom Hooks
│   │   ├── services/        # API Services
│   │   ├── types/           # TypeScript Types
│   │   └── utils/           # Utilidades
│   ├── package.json
│   └── vite.config.ts
├── n8n-workflows/            # Workflows de N8N
│   └── generate_cvs_workflow.json
├── data/                     # Datos del proyecto
│   └── cvs/                 # Archivos PDF de CVs
├── .gitignore
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido
- **Poetry**: Gestión de dependencias Python
- **Pinecone**: Base de datos vectorial
- **OpenAI**: Modelos de lenguaje
- **LangChain**: Framework para aplicaciones LLM
- **PyPDF2**: Procesamiento de archivos PDF

### Frontend
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Vite**: Herramienta de construcción
- **Tailwind CSS**: Framework CSS
- **React Router**: Enrutamiento
- **Axios**: Cliente HTTP

### Herramientas
- **N8N**: Automatización de workflows
- **Git**: Control de versiones

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- Poetry
- Cuenta de OpenAI
- Cuenta de Pinecone

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd ai-powered-cv-screener
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
poetry install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus claves API

# Inicializar pipeline RAG (ejecutar una sola vez)
poetry run python rag_pipeline_init.py

# Ejecutar servidor
poetry run python main.py
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con la URL del backend

# Ejecutar servidor de desarrollo
npm run dev
```

### 4. Configurar N8N (Opcional)

1. Instalar N8N
2. Importar el workflow desde `n8n-workflows/generate_cvs_workflow.json`
3. Configurar las credenciales necesarias

## 🔧 Variables de Entorno

### Backend (.env)
```env
OPENAI_API_KEY=tu_openai_api_key
PINECONE_API_KEY=tu_pinecone_api_key
PINECONE_ENVIRONMENT=tu_pinecone_environment
PINECONE_INDEX_NAME=cv-screener
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 📖 Uso

### 1. Subir CVs
- Navega a la sección "Subir CVs"
- Arrastra y suelta archivos PDF o haz clic para seleccionar
- Los archivos se procesan automáticamente

### 2. Analizar Candidatos
- Usa la sección "Chat IA" para hacer preguntas sobre los CVs
- Obtén análisis detallados de coincidencias
- Recibe recomendaciones personalizadas

### 3. Dashboard
- Visualiza estadísticas del sistema
- Monitorea el progreso de procesamiento
- Accede a acciones rápidas

## 🔄 Flujo de Trabajo

1. **Generación de CVs**: N8N genera CVs de prueba (opcional)
2. **Subida**: Los CVs se suben a través del frontend
3. **Procesamiento**: El backend extrae texto y genera embeddings
4. **Almacenamiento**: Los vectores se guardan en Pinecone
5. **Análisis**: La IA analiza coincidencias y genera insights
6. **Visualización**: Los resultados se muestran en el dashboard

## 🧪 API Endpoints

### Salud del Sistema
- `GET /api/v1/health` - Verificación básica
- `GET /api/v1/health/detailed` - Verificación detallada

### Screening de CVs
- `POST /api/v1/screening/analyze` - Analizar CV contra descripción de trabajo
- `POST /api/v1/screening/upload` - Subir archivo CV
- `GET /api/v1/screening/criteria` - Obtener criterios de screening

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes preguntas o problemas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔮 Roadmap

- [ ] Integración con más fuentes de datos
- [ ] Análisis de sentimientos en CVs
- [ ] Dashboard de métricas avanzadas
- [ ] API de webhooks para notificaciones
- [ ] Soporte para múltiples idiomas
- [ ] Integración con ATS populares

---

Desarrollado con ❤️ para revolucionar el proceso de screening de CVs.
