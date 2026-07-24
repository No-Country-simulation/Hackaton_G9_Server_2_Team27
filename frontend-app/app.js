document.addEventListener("DOMContentLoaded", () => {

    // ─────────────────────────────────────────────
    // Referencias DOM
    // ─────────────────────────────────────────────
    const form = document.getElementById("energiaForm");
    const submitBtn = document.getElementById("submitBtn");

    // Paneles de vista
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const resultsContent = document.getElementById("resultsContent");
    const errorContent = document.getElementById("errorContent");

    // Resultado – categoría
    const categoriaBadge = document.getElementById("categoriaBadge");
    const categoriaIcon = document.getElementById("categoriaIcon");
    const categoriaText = document.getElementById("categoriaText");

    // Resultado – costo
    const costoText = document.getElementById("costoText");

    // Resultado – probabilidad
    const probabilityBar = document.getElementById("probabilityBar");
    const probabilityText = document.getElementById("probabilityText");

    // Resultado – recomendaciones y error
    const recommendationsList = document.getElementById("recommendationsList");
    const errorText = document.getElementById("errorText");

    // Referencias DOM adicionales para el ensamble
    const voteXGB = document.getElementById("voteXGB");
    const accXGB = document.getElementById("accXGB");
    const latXGB = document.getElementById("latXGB");

    const voteLog = document.getElementById("voteLog");
    const accLog = document.getElementById("accLog");
    const latLog = document.getElementById("latLog");

    const voteKNN = document.getElementById("voteKNN");
    const accKNN = document.getElementById("accKNN");
    const latKNN = document.getElementById("latKNN");

    const decisionText = document.getElementById("decisionText");
    const desempateBadge = document.getElementById("desempateBadge");

    // Sliders
    const consumoKwh = document.getElementById("consumoKwh");
    const consumoKwhRange = document.getElementById("consumoKwhRange");
    const horasAltoConsumo = document.getElementById("horasAltoConsumo");
    const horasAltoConsumoRange = document.getElementById("horasAltoConsumoRange");
    const metrosCuadrados = document.getElementById("metrosCuadrados");
    const metrosCuadradosRange = document.getElementById("metrosCuadradosRange");

    function syncInputRange(inputEl, rangeEl) {
        if (!inputEl || !rangeEl) return;
        
        const updateRange = () => { if(inputEl.value) rangeEl.value = inputEl.value; };
        const updateInput = () => { inputEl.value = rangeEl.value; };
        
        inputEl.addEventListener("input", updateRange);
        inputEl.addEventListener("change", updateRange);
        
        rangeEl.addEventListener("input", updateInput);
        rangeEl.addEventListener("change", updateInput);
    }
    syncInputRange(consumoKwh, consumoKwhRange);
    syncInputRange(horasAltoConsumo, horasAltoConsumoRange);
    syncInputRange(metrosCuadrados, metrosCuadradosRange);

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
            consumoKwh: parseFloat(document.getElementById("consumoKwh").value),
            usoHorarioPico: document.getElementById("usoHorarioPico").value === "true",
            cantidadEquipos: parseInt(document.getElementById("cantidadEquipos").value, 10),
            tipoInmueble: document.getElementById("tipoInmueble").value,
            horasAltoConsumo: parseInt(document.getElementById("horasAltoConsumo").value, 10),
            metrosCuadrados: parseFloat(document.getElementById("metrosCuadrados").value),
            cantidadPersonas: parseInt(document.getElementById("cantidadPersonas").value, 10)
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
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
            submitBtn.disabled = false;
        }
    });

    // ─────────────────────────────────────────────
    // setView – gestión de paneles
    // ─────────────────────────────────────────────
    function setView(state) {
        emptyState.classList.add("d-none");
        if (loadingState) loadingState.classList.add("d-none");
        resultsContent.classList.add("d-none");
        errorContent.classList.add("d-none");

        if (state === "loading") {
            if (loadingState) loadingState.classList.remove("d-none");
            probabilityBar.style.width = "0%";
            probabilityText.textContent = "0%";
        } else if (state === "results") {
            resultsContent.classList.remove("d-none");
        } else if (state === "error") {
            errorContent.classList.remove("d-none");
        }
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

        // Regla de UI: Si el motor indica votos, usar el ratio para la barra visual
        if (data.metodoDecision && data.metodoDecision.includes("3/3")) {
            prob = 100;
        } else if (data.metodoDecision && data.metodoDecision.includes("2/3")) {
            prob = 67;
        } else {
            if (prob > 0 && prob <= 1) { prob = prob * 100; }
            prob = Math.min(100, Math.round(prob));
        }

        probabilityText.textContent = `${prob}%`;
        // Timeout para que la animación CSS se dispare después de mostrar el contenedor
        setTimeout(() => {
            probabilityBar.style.width = `${prob}%`;
        }, 50);

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

        // ── 5. MOTOR DE ENSAMBLE ML ───────────────────────────────────────
        if (data.votosDetallados) {
            updateModelCard(voteXGB, accXGB, latXGB, data.votosDetallados["XGBoost"], data.precisionHistorica?.xgboost, data.latenciaMs?.xgboost_ms);
            updateModelCard(voteLog, accLog, latLog, data.votosDetallados["Regresion Logistica"], data.precisionHistorica?.regresion_logistica, data.latenciaMs?.regresion_logistica_ms);
            updateModelCard(voteKNN, accKNN, latKNN, data.votosDetallados["KNN"], data.precisionHistorica?.knn, data.latenciaMs?.knn_ms);
        }

        if (data.metodoDecision) {
            decisionText.textContent = `Método de decisión: ${data.metodoDecision}`;
        } else {
            decisionText.textContent = `Método de decisión: —`;
        }

        if (data.desempateAplicado) {
            desempateBadge.style.display = "inline-block";
        } else {
            desempateBadge.style.display = "none";
        }
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
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    function updateModelCard(voteEl, accEl, latEl, voteVal, accVal, latVal) {
        voteEl.textContent = voteVal || "—";
        voteEl.className = "model-card-vote"; // Reset classes
        if (voteVal) {
            const lower = voteVal.toLowerCase();
            if (lower.includes("eficiente") && !lower.includes("in")) voteEl.classList.add("eficiente");
            else if (lower.includes("moderado")) voteEl.classList.add("moderado");
            else if (lower.includes("ineficiente")) voteEl.classList.add("ineficiente");
        }

        accEl.textContent = accVal || "—";
        latEl.textContent = latVal !== undefined ? `${latVal}ms` : "—";
    }

    // Event listener para exportar
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", () => {
            alert("La funcionalidad de exportación a PDF estará disponible en la próxima versión.");
        });
    }

});
