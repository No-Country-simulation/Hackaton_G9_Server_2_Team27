# Frontend - EnergiAI (React + Vite)

Cliente web desarrollado con **React** y **Vite**, estructurado de forma modular con soporte para alias de rutas (`@/`) e integración directa con la API REST en Spring Boot.

> **IMPORTANTE PARA EL EQUIPO DE BACKEND:**  
> Asegúrense de habilitar CORS en sus controladores de Java agregando la anotación `@CrossOrigin` (o en la configuración global de Spring Boot). Este frontend se ejecuta por defecto en el puerto **`http://localhost:5173`**.

---

## Inicio Rápido (Resumen)

1. **Instalar Node.js:**  
   Descargar e instalar [Node.js (v18+)](https://nodejs.org/es/download/current) -> Elegir versión para Windows (`.msi`). No es necesario descargar las herramientas.

2. **Al clonar o bajar cambios de GitHub:**  
   Abrir la terminal en la carpeta `frontend` e instalar las dependencias con:

   ```bash
   npm install
   ```

   Para iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Acceder a la aplicación en: http://localhost:5173

## Requisitos Previos
Node.js (versión 18.x o superior)

npm (incluido automáticamente con Node.js)

Backend de Spring Boot en ejecución (puerto 8080 por defecto)

## Dependencias Principales Incluidas
Al ejecutar `npm install` se instalarán automáticamente las librerías necesarias del proyecto:

* **react-router-dom**: Manejo de rutas y navegación.
* **lucide-react**: Iconografía moderna de la interfaz de usuario.
* **recharts**: Renderizado de gráficos interactivos para el dashboard y la comparativa de consumos.
* **tailwindcss + @tailwindcss/vite**: Framework de estilos y utilidades CSS.

## Estructura del Proyecto

```plaintext
frontend/
├── public/             # Archivos estáticos públicos
├── src/
│   ├── assets/         # Imágenes, logos e isotipos SVG
│   ├── components/     # Componentes UI reutilizables (Navbar, Sidebar, etc.)
│   ├── layouts/        # Estructuras contenedoras de páginas
│   ├── pages/          # Vistas principales (NuevoAnalisis, Dashboard, etc.)
│   ├── services/       # Servicios de llamadas API (fetch/axios hacia Spring Boot)
│   ├── styles/         # Estilos globales y temas
│   ├── App.jsx         # Configuración raíz y rutas de la app
│   ├── main.jsx        # Punto de entrada de React
│   └── index.css       # Estilos globales y Tailwind CSS
├── jsconfig.json       # Configuración del alias @/ para VS Code
├── vite.config.js      # Configuración de compilación Vite y alias @/
└── .env                # Variables de entorno (URL del Backend)
```

---

### ¿Por qué esta versión es mejor?
* Corrigió la mención a Laravel por **Spring Boot**.
* Explicó que `npm install` lee el `package.json` e instala las dependencias de una sola vez.
* Agregó la carpeta `src/services/`, que es donde tienes tu `analisisService.js` con los llamadas `fetch` al backend