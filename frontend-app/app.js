document.addEventListener("DOMContentLoaded", () => {

    // ─────────────────────────────────────────────
    // Referencias DOM
    // ─────────────────────────────────────────────
    const form               = document.getElementById("energiaForm");
    const submitBtn          = document.getElementById("submitBtn");

    // Paneles de vista
    const emptyState         = document.getElementById("emptyState");
    const resultsContent     = document.getElementById("resultsContent");
    const errorContent       = document.getElementById("errorContent");

    // Resultado – categoría
    const categoriaBadge     = document.getElementById("categoriaBadge");
    const categoriaIcon      = document.getElementById("categoriaIcon");
    const categoriaText      = document.getElementById("categoriaText");

    // Resultado – costo
    const costoText          = document.getElementById("costoText");

    // Resultado – probabilidad
    const probabilityBar     = document.getElementById("probabilityBar");
    const probabilityText    = document.getElementById("probabilityText");

    // Resultado – recomendaciones y error
    const recommendationsList = document.getElementById("recommendationsList");
    const errorText           = document.getElementById("errorText");

    // ─────────────────────────────────────────────
    // Configuración de la API
    // ─────────────────────────────────────────────
    const API_URL = "http://localhost:8080/analisis-energetico";

    // ─────────────────────────────────────────────
    // Submit handler
    // ─────────────────────────────────────────────
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Estado de carga
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' +
            'Analizando consumo con IA...';
        submitBtn.disabled = true;

        // Ocultar paneles previos
        setView("loading");

        // ── Construcción del payload ──────────────────────────────────────
        // El contrato del backend (AnalisisRequestDTO.java) usa camelCase.
        // Los 7 campos son los que acepta la validación @Valid del servidor.
        const payload = {
            consumoKwh:       parseFloat(document.getElementById("consumoKwh").value),
            usoHorarioPico:   document.getElementById("usoHorarioPico").value === "true",
            cantidadEquipos:  parseInt(document.getElementById("cantidadEquipos").value, 10),
            tipoInmueble:     document.getElementById("tipoInmueble").value,
            horasAltoConsumo: parseInt(document.getElementById("horasAltoConsumo").value, 10),
            metrosCuadrados:  parseFloat(document.getElementById("metrosCuadrados").value),
            cantidadPersonas: parseInt(document.getElementById("cantidadPersonas").value, 10)
        };

        try {
            const response = await fetch(API_URL, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload)
            });

            // Manejo de errores HTTP (400, 500, etc.) sin alert() nativo
            if (!response.ok) {
                let errorMsg = `El servidor respondió con código HTTP ${response.status}.`;
                try {
                    const errData = await response.json();
                    // El GlobalExceptionHandler devuelve un campo 'error' o 'erroresCampos'
                    if (errData.error) {
                        errorMsg = errData.error;
                    }
                    if (errData.erroresCampos) {
                        const campos = Object.entries(errData.erroresCampos)
                            .map(([k, v]) => `• ${k}: ${v}`)
                            .join("\n");
                        errorMsg += `\n\nCampos inválidos:\n${campos}`;
                    }
                } catch (_) { /* la respuesta no era JSON */ }
                throw new Error(errorMsg);
            }

            // ── Respuesta exitosa – AnalisisResponseDTO ───────────────────
            // Campos esperados: categoria, probabilidad, costoEstimadoMensual, recomendaciones
            const data = await response.json();
            renderResults(data);
            setView("results");

        } catch (error) {
            console.error("[EnergiAI] Error al procesar el análisis:", error);
            errorText.textContent = error.message ||
                "No se pudo conectar con el servidor en localhost:8080. " +
                "Verifica que el backend esté en ejecución y que CORS esté habilitado.";
            setView("error");
        } finally {
            submitBtn.innerHTML = originalHtml;
            submitBtn.disabled  = false;
        }
    });

    // ─────────────────────────────────────────────
    // setView – gestión de paneles
    // ─────────────────────────────────────────────
    function setView(state) {
        emptyState.classList.add("d-none");
        resultsContent.classList.add("d-none");
        errorContent.classList.add("d-none");

        if (state === "results") { resultsContent.classList.remove("d-none"); }
        if (state === "error")   { errorContent.classList.remove("d-none");   }
        // "loading" deja los tres ocultos (el botón ya muestra el spinner)
    }

    // ─────────────────────────────────────────────
    // renderResults – mapea AnalisisResponseDTO → DOM
    // ─────────────────────────────────────────────
    function renderResults(data) {

        // ── 1. CATEGORÍA ─────────────────────────────────────────────────
        // Campo del DTO: "categoria" (String: "Eficiente" | "Moderado" | "Ineficiente")
        const categoria = (data.categoria || "Indeterminado").trim();
        categoriaText.textContent = categoria;

        // Limpiar clases semánticas anteriores del badge
        categoriaBadge.classList.remove("eficiente", "moderado", "ineficiente");
        categoriaIcon.className = "fa-solid";

        const catLower = categoria.toLowerCase();
        if (catLower.includes("ineficiente")) {
            categoriaBadge.classList.add("ineficiente");
            categoriaIcon.classList.add("fa-circle-xmark");
        } else if (catLower.includes("moderado")) {
            categoriaBadge.classList.add("moderado");
            categoriaIcon.classList.add("fa-circle-minus");
        } else if (catLower.includes("eficiente")) {
            categoriaBadge.classList.add("eficiente");
            categoriaIcon.classList.add("fa-circle-check");
        } else {
            categoriaBadge.classList.add("moderado"); // fallback
            categoriaIcon.classList.add("fa-circle-question");
        }

        // ── 2. COSTO ESTIMADO MENSUAL ─────────────────────────────────────
        // Campo del DTO: "costoEstimadoMensual" (Double)
        const costo = data.costoEstimadoMensual ?? 0;
        costoText.textContent = formatCurrency(costo);

        // ── 3. PROBABILIDAD ───────────────────────────────────────────────
        // Campo del DTO: "probabilidad" (Double, puede ser 0.0–1.0 o 0–100)
        let prob = data.probabilidad ?? 0;
        // Normalizar a porcentaje si llega en rango 0–1
        if (prob > 0 && prob <= 1) { prob = prob * 100; }
        prob = Math.min(100, Math.round(prob));

        probabilityText.textContent = `${prob}%`;
        probabilityBar.style.width  = `${prob}%`;

        // Color semántico de la barra
        probabilityBar.className = "prob-fill";
        if (prob < 35) {
            probabilityBar.style.background = "linear-gradient(90deg, #1a6b4a, #2ecc71)";
        } else if (prob < 70) {
            probabilityBar.style.background = "linear-gradient(90deg, #e07b00, #f39c12)";
        } else {
            probabilityBar.style.background = "linear-gradient(90deg, #c0392b, #e74c3c)";
        }

        // ── 4. RECOMENDACIONES ────────────────────────────────────────────
        // Campo del DTO: "recomendaciones" (List<String>)
        recommendationsList.innerHTML = "";
        const recs = Array.isArray(data.recomendaciones) && data.recomendaciones.length > 0
            ? data.recomendaciones
            : ["Realiza un monitoreo continuo de tu consumo para detectar variaciones."];

        recs.forEach((rec) => {
            const li = document.createElement("li");
            li.className = "rec-item";
            li.innerHTML =
                `<i class="fa-solid fa-circle-check rec-icon"></i>` +
                `<span>${rec}</span>`;
            recommendationsList.appendChild(li);
        });
    }

    // ─────────────────────────────────────────────
    // Utilidades de formato
    // ─────────────────────────────────────────────

    /**
     * Formatea un número como moneda en USD (ej: 315.00 → "$315.00").
     * Ajusta el locale/moneda según el contexto del hackathon si es necesario.
     */
    function formatCurrency(value) {
        return new Intl.NumberFormat("es-AR", {
            style:                 "currency",
            currency:              "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

});
