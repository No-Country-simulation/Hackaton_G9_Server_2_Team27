> **Tech Lead Review** · Análisis completo del repositorio `Hackaton_G9_Server_2` · Julio 2026

---

## 1. 📋 Resumen Ejecutivo del Proyecto
- **Descripción general:** **EnegiAI** es una plataforma basada en microservicios (actualmente un monolito en Spring Boot) diseñada para analizar el consumo eléctrico de inmuebles. Su propuesta de valor central es recibir métricas de uso energético de un usuario, clasificar su nivel de eficiencia, generar recomendaciones personalizadas para la reducción del consumo y estimar el impacto financiero de dicho gasto. La lógica predictiva del negocio se está desarrollando en paralelo mediante modelos de Machine Learning (ciencia de datos).

- **Arquitectura General:**

| Capa | Rol | Tecnología Principal |
| :--- | :--- | :--- |
| **Backend API** | Exposición de endpoints REST y validación | Java 17, Spring Boot 3.x, Spring Web |
| **Reglas de Negocio** | Lógica de cálculo, recomendación y estimación | Java 17, Servicios Spring (@Service) |
| **Persistencia** | Almacenamiento relacional en memoria (Dev) | H2 Database, Spring Data JPA, Hibernate |
| **Ciencia de Datos** | Análisis exploratorio y entrenamiento de modelos ML | Python, Jupyter Notebooks |

- **Ensamble/Componentes Core:** (Dado que el modelo ML no está acoplado todavía, evaluamos los componentes backend actuales)

| Componente | Rol en el Dominio | Estado Actual |
| :--- | :--- | :--- |
| `AnalisisEnergeticoController` | Punto de entrada `/analisis-energetico` | Activo, recibe payloads válidos. |
| `ClasificacionService` | Clasifica la eficiencia energética del usuario | **Mockeado** (A la espera del modelo de datos de 'Carlos'). |
| `EstimacionFinancieraService` | Calcula el coste mensual en base al consumo | Activo, pero con tarifas hardcodeadas. |
| `RecomendacionService` | Genera tips de ahorro en base a reglas booleanas | Activo, basado en condicionales lógicos. |

- **Componentes Visuales/Interfaces:**

| Componente UI | Origen de Datos | Rol / Estado |
| :--- | :--- | :--- |
| **Frontend Web/Mobile** | N/A | **Inexistente** en la rama actual. El repositorio es puramente Backend (API) y scripts de Data Science. |
| **Swagger UI** | `springdoc-openapi` | Interfaz autogenerada en `/swagger-ui.html` para probar la API. |
| **H2 Console** | Base de Datos | Interfaz de administración en `/h2-console` para inspeccionar la DB en memoria. |

---

## 2. 🗺️ Mapa de Arquitectura y Flujo de Datos

```ascii
                                +---------------------------+
                                |  Cliente (Postman / App)  |
                                +-------------+-------------+
                                              |
                                              | 1. POST /analisis-energetico (JSON: ConsumoRequest)
                                              v
+-----------------------------------------------------------------------------------------+
|                                 CONTENEDOR BACKEND / APP                                |
|                                                                                         |
|  +--------------------------------+       +------------------------------------------+  |
|  | AnalisisEnergeticoController   |------>|       AnalisisEnergeticoService          |  |
|  | (Validación Bean @Valid)       |       | (Orquestador de lógica de negocio)       |  |
|  +--------------------------------+       +----+------------------+------------------+  |
|                                                |                  |                  |
|                                                v                  v                  v
|                                    +--------------------+ +---------------+ +-----------------+
|                                    |ClasificacionService| |Recomendacion..| |EstimacionFin... |
|                                    | (Mock IF / ML API) | | (Reglas Fijas)| | (Tarifa KWh)    |
|                                    +--------------------+ +---------------+ +-----------------+
|                                                                                         |
|  +--------------------------------+                                                     |
|  | H2 In-Memory Database          | <---- (Mapeo JPA / Sin implementar persistencia aún)|
|  +--------------------------------+                                                     |
+-----------------------------------------------------------------------------------------+
                                              |
                                              | 2. 200 OK (JSON: AnalisisResponse)
                                              v
                                     [Respuesta al Cliente]
```

- **Tabla de Puertos:**

| Servicio | Tecnología | Puerto Host | Puerto Contenedor | Red Docker |
| :--- | :--- | :--- | :--- | :--- |
| Backend API | Spring Boot Tomcat | `8080` (Defecto) | `8080` | `host` (No hay `docker-compose` aún) |
| H2 Console | H2 Database | N/A (Web UI) | `8080/h2-console` | Interna Spring |
| ML API | Python / FastAPI (Estimado)| N/A | N/A | Ausente en la red actual |

*(Nota: Actualmente no existen configuraciones de Docker (`Dockerfile` o `docker-compose.yml`) en el repositorio. La aplicación se ejecuta de forma nativa vía Maven).*

---

## 3. 📁 Diccionario de Archivos Clave

### ☕ Backend Dominio
| Archivo | Responsabilidad |
| :--- | :--- |
| `pom.xml` | Gestor de dependencias Maven. Incluye Spring Web, JPA, H2, Lombok, Validation y DevTools. |
| `application.properties` | Configuración del servidor (puerto 8080), conexión H2, dialecto Hibernate y rutas Swagger. |
| `AnalisisEnergeticoController.java` | Controlador REST. Expone `/analisis-energetico` y `/health`. Aplica validaciones a la request. |
| `AnalisisEnergeticoService.java` | Fachada/Orquestador que inyecta los servicios de clasificación, recomendación y finanzas para armar el DTO final. |
| `ClasificacionService.java` | Servicio de negocio encargado de clasificar la eficiencia. Actualmente no está integrado con ML. |
| `ConsumoRequest.java` | DTO (Record) de entrada. Utiliza anotaciones `jakarta.validation` para asegurar calidad de datos. |
| `AnalisisEnergetico.java` | Modelo de Dominio central (DTO/Entity conceptual). |

### 🐍 Ciencia de Datos / ML Dominio
| Archivo | Responsabilidad |
| :--- | :--- |
| `EDA_consumo_energetico_17_07_26.ipynb` | Jupyter Notebook utilizado para el Análisis Exploratorio de Datos (EDA) del consumo energético. |
| `datos_true.ipynb` | Script de procesamiento de los datasets para entrenamiento del modelo. |
| `dataset_consumo_energetico*.csv` | Datasets estáticos en la carpeta `/data` usados por los Notebooks. |

---

## 4. 🔬 Diagnóstico de Integración — Estado Actual

🔴 **CRÍTICO - Ausencia de Integración con el Modelo de Machine Learning**
- **Síntoma:** En `ClasificacionService.java`, la integración con el API de Ciencia de Datos está comentada y sustituida por una lógica temporal basada en `if-else` (`if (kWh < 150) { categoria = Categoria.Eficiente; }`). Hay un comentario explícito: `"// IDEA PARA CUANDO CARLOS ENTREGUE SU PARTE:"`.
- **Impacto:** En producción, el sistema no tiene inteligencia predictiva, devolviendo siempre una precisión ("probabilidad") inventada de `0.88` y categorizando basándose puramente en un umbral estático de consumo, perdiendo todo el valor de Machine Learning.
- **Bloque de código Diff:**
````diff
-    // Por mientras (Temporal):
-    public ResultadoClasificacion obtenerClasificacion(ConsumoRequest request) {
-        double kWh = request.consumo_kwh() != null ? request.consumo_kwh() : 0.0;
-        Categoria categoria;
-        if (kWh < 150) { categoria = Categoria.Eficiente; }
-        // ... (código harcodeado)
-        return new ResultadoClasificacion(categoria, 0.88);
-    }
+    private final DataScienceClient dataScienceClient;
+
+    public ClasificacionService(DataScienceClient dataScienceClient) {
+        this.dataScienceClient = dataScienceClient;
+    }
+
+    public ResultadoClasificacion obtenerClasificacion(ConsumoRequest request) {
+        var respuesta = dataScienceClient.obtenerPrediccion(request);
+        Categoria categoria = Categoria.fromFront(respuesta.categoria());
+        return new ResultadoClasificacion(categoria, respuesta.probabilidad());
+    }
````

🟠 **ALTO - Ausencia de Persistencia de Datos y Respuesta Incorrecta**
- **Síntoma:** `AnalisisEnergeticoController.java` recibe el análisis, llama al servicio, e imprime por consola `"FUNCIONA!"`, pero posteriormente retorna el mismo objeto de la petición (`consumoRequestJson`) en lugar del resultado (`AnalisisResponse`). Además, la persistencia en DB no existe.
- **Impacto:** El cliente envía sus datos y recibe exactamente los mismos datos de vuelta. Nunca recibe las recomendaciones, la categoría ni los precios. La base de datos H2 se inicializa en vano ya que no hay entidades JPA ni repositorios `@Repository`.
- **Bloque de código Diff:**
````diff
         @PostMapping("/analisis-energetico")
         public ResponseEntity<?> realizarAnalisis(@RequestBody @Valid ConsumoRequest consumoRequestJson){
-            analisisEnergeticoService.procesarAnalisis(consumoRequestJson);
-            System.out.println("FUNCIONA!");
-            return ResponseEntity.ok(consumoRequestJson);
-            //Retorna 200 OK no un 201 CREATED, dado que el análisis no persiste en ninguna BD aún
+            AnalisisResponse response = analisisEnergeticoService.procesarAnalisis(consumoRequestJson);
+            // TODO: Persistir 'response' o 'consumoRequestJson' en base de datos
+            return ResponseEntity.ok(response); 
         }
````

🟡 **MEDIO - Valores Mágicos / Configuración de Tarifas Hardcodeada**
- **Síntoma:** En `EstimacionFinancieraService.java`, el precio del kWh está definido como constante absoluta: `private static final double TARIFA_KWH = 0.75;`.
- **Impacto:** Si la tarifa cambia o varía por región/moneda, es necesario recompilar toda la aplicación Java para cambiar el precio de la energía.
- **Bloque de código Diff:**
````diff
 @Service
 public class EstimacionFinancieraService {
 
-    private static final double TARIFA_KWH = 0.75;
+    @Value("${energia.tarifa.kwh:0.75}")
+    private double tarifaKwh;
 
     public double calcularCostoMensual(ConsumoRequest request) {
         if (request.consumo_kwh() == null) return 0.0;
-        return request.consumo_kwh() * TARIFA_KWH;
+        return request.consumo_kwh() * tarifaKwh;
     }
 }
````

🟡 **MEDIO - Falta de Contenerización y Despliegue**
- **Síntoma:** No existen archivos `Dockerfile` ni `docker-compose.yml` en la raíz del proyecto.
- **Impacto:** Problemas de "en mi máquina sí funciona". Dificulta el despliegue a la nube y orquestar el backend Java junto al hipotético microservicio de Machine Learning en Python.

---
### ✅ Integración Exitosa — Capas Verificadas
| Componente / Capa | Estado | Descripción de Validación |
| :--- | :--- | :--- |
| **Validaciones del DTO de entrada** | ✅ Verificado | `ConsumoRequest` usa excelentes reglas de `jakarta.validation` (`@Positive`, `@Min`, `@Max`, `@NotBlank`), bloqueando payloads corruptos a nivel de Controller. |
| **Arquitectura de Inyección de Dependencias** | ✅ Verificado | El `AnalisisEnergeticoService` inyecta las dependencias limpiamente mediante su constructor, facilitando el testing y cumpliendo buenas prácticas Spring. |
| **Modularidad de Servicios de Negocio** | ✅ Verificado | Las responsabilidades están bien segregadas (Clasificación, Finanzas y Recomendaciones tienen su propio servicio). |

---

## 5. ✅ Checklist Final de MVP

| Requisito | Estado (✅, ⚠️, ❌) | Detalle |
| :--- | :--- | :--- |
| Endpoint Análisis Funcional | ⚠️ | Compila y valida, pero retorna el Request body en lugar de la respuesta. |
| Integración de Inteligencia Artificial | ❌ | Lógica mockeada ("Esperando a Carlos"). No hay cliente HTTP hacia ML. |
| Persistencia de Datos | ❌ | Dependencias H2 añadidas, pero no hay `@Entity` ni repositorios activos. |
| Reglas de Negocio/Finanzas | ✅ | Implementadas (Recomendaciones múltiples y cálculo financiero base). |
| Dockerización y Despliegue | ❌ | Ausente. |

### ⚡ Acciones Pendientes — Orden de Prioridad

1. **Reparar el Retorno del Controller (Bloqueante):** Modificar `AnalisisEnergeticoController.java` para que retorne la variable `AnalisisResponse` generada por el servicio y no el input del usuario.
2. **Definir el Contrato de la API de Data Science (Crítico):** Hablar con "Carlos" (área Ciencia de Datos) para establecer los endpoints, modelo de request/response y levantar el microservicio de Python (ej. FastAPI/Flask).
3. **Implementar DataScienceClient (Crítico):** Descomentar el código en `ClasificacionService.java`, crear un cliente `RestTemplate` o `WebClient` para conectar el ecosistema Java con el modelo Python.
4. **Implementar Repositorios JPA (Alto):** Si se requiere persistencia histórica (como sugiere el comentario del Controller), crear una entidad JPA (`@Entity`) para `AnalisisEnergetico` e implementar `JpaRepository`.
5. **Aislar Variables de Configuración (Medio):** Mover `TARIFA_KWH` y parámetros similares al archivo `application.properties` e inyectarlos con `@Value`.
6. **Crear Perfiles de Properties (Medio):** Añadir `application-dev.properties` (H2 en memoria) y `application-prod.properties` (PostgreSQL/MySQL) para entornos reales.
7. **Dockerizar Aplicaciones (Medio):** Escribir un `Dockerfile` para el empaquetado del `Backend.jar` y un `docker-compose.yml` que orqueste la base de datos, la API Java y la API Python.
8. **Manejo Global de Excepciones (Leve):** Implementar un `@ControllerAdvice` para capturar los errores de validación de los DTOs y retornar JSONs limpios en lugar de stacktraces de Tomcat.
9. **Creación de Tests Unitarios (Deuda Técnica):** Escribir tests en `BackendApplicationTests.java` para verificar que la generación de recomendaciones aplique correctamente las reglas según los inputs.
10. **Diseño e Implementación UI (Futuro):** Desarrollar un cliente Frontend web o mobile para consumir la API de forma interactiva (actualmente sólo testeable por Postman/Swagger).
