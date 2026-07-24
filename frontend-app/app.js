document.addEventListener("DOMContentLoaded", () => {

    // ─────────────────────────────────────────────
    // Referencias DOM
    // ─────────────────────────────────────────────
    const form = document.getElementById("energiaForm");
    const submitBtn = document.getElementById("submitBtn");

    // Paneles de vista
    const emptyState = document.getElementById("emptyState");
    const skeletonState = document.getElementById("skeletonState");
    const resultsContent = document.getElementById("resultsContent");
    const errorContent = document.getElementById("errorContent");

    // Resultado – categoría
    const categoriaBadge = document.getElementById("categoriaBadge");
    const categoriaIcon = document.getElementById("categoriaIcon");
    const categoriaText = document.getElementById("categoriaText");

    // Resultado – costo y métricas adicionales
    const costoText = document.getElementById("costoText");
    const valConsumoEspecifico = document.getElementById("val-consumo-especifico");
    const valIntensidadDiaria = document.getElementById("val-intensidad-diaria");

    // Resultado – probabilidad
    const probabilityBar = document.getElementById("probabilityBar");
    const probabilityText = document.getElementById("probabilityText");

    // Resultado – recomendaciones y error
    const recommendationsList = document.getElementById("recommendationsList");
    const errorText = document.getElementById("errorText");

    // Referencias DOM para el ensamble
    const voteXGB = document.getElementById("voteXGB");
    const latXGB = document.getElementById("latXGB");

    const voteLog = document.getElementById("voteLog");
    const latLog = document.getElementById("latLog");

    const voteKNN = document.getElementById("voteKNN");
    const latKNN = document.getElementById("latKNN");

    const decisionText = document.getElementById("decisionText");
    const desempateBadge = document.getElementById("desempateBadge");

    // Controles de Sliders & Badges de Valor
    const sliderConsumo = document.getElementById("consumoKwhRange");
    const valConsumo = document.getElementById("val-consumo");
    const inputConsumo = document.getElementById("consumoKwh");

    const sliderMetros = document.getElementById("metrosCuadradosRange");
    const valMetros = document.getElementById("val-metros");
    const inputMetros = document.getElementById("metrosCuadrados");

    const sliderHoras = document.getElementById("horasAltoConsumoRange");
    const valHoras = document.getElementById("val-horas");
    const inputHoras = document.getElementById("horasAltoConsumo");

    const selectTipo = document.getElementById("tipoInmueble");
    const inputPersonas = document.getElementById("cantidadPersonas");
    const inputEquipos = document.getElementById("cantidadEquipos");
    const switchPico = document.getElementById("usoHorarioPico");

    // ─────────────────────────────────────────────
    // Configuración de Sincronización de Sliders
    // ─────────────────────────────────────────────
    function setupSlider(sliderEl, valueEl, inputEl) {
        if (!sliderEl || !inputEl) return;
        const update = () => {
            inputEl.value = sliderEl.value;
            if (valueEl) valueEl.textContent = sliderEl.value;
        };
        sliderEl.addEventListener("input", update);
        sliderEl.addEventListener("change", update);
        // Inicializar
        update();
    }

    setupSlider(sliderConsumo, valConsumo, inputConsumo);
    setupSlider(sliderMetros, valMetros, inputMetros);
    setupSlider(sliderHoras, valHoras, inputHoras);

    // ─────────────────────────────────────────────
    // Configuración de la API
    // ─────────────────────────────────────────────
    const API_URL = "http://localhost:8080/analisis-energetico";

    // ─────────────────────────────────────────────
    // Submit handler
    // ─────────────────────────────────────────────
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Estado de carga en botón
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>ANALIZANDO CON IA...';
        submitBtn.disabled = true;

        // Ocultar paneles previos y mostrar Skeleton
        setView("loading");

        // Valores de entrada
        const consumoVal = parseFloat(inputConsumo.value);
        const metrosVal = parseFloat(inputMetros.value);
        const horasVal = parseInt(inputHoras.value, 10);
        const personasVal = parseInt(inputPersonas.value, 10);
        const equiposVal = parseInt(inputEquipos.value, 10);
        const picoVal = switchPico.checked;
        const tipoVal = selectTipo.value;

        // payload dual compatible (camelCase y snake_case integrados)
        const payload = {
            consumoKwh: consumoVal,
            consumo_kwh: consumoVal,
            usoHorarioPico: picoVal,
            uso_horario_pico: picoVal,
            cantidadEquipos: equiposVal,
            cantidad_equipos: equiposVal,
            tipoInmueble: tipoVal,
            tipo_inmueble: tipoVal,
            horasAltoConsumo: horasVal,
            horas_alto_consumo: horasVal,
            metrosCuadrados: metrosVal,
            metros_cuadrados: metrosVal,
            cantidadPersonas: personasVal,
            cantidad_personas: personasVal
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = `El servidor API respondió con código HTTP ${response.status}.`;
                try {
                    const errData = await response.json();
                    if (errData.error) {
                        errorMsg = errData.error;
                    }
                    if (errData.erroresCampos) {
                        const campos = Object.entries(errData.erroresCampos)
                            .map(([k, v]) => `• ${k}: ${v}`)
                            .join("\n");
                        errorMsg += `\n\nCampos inválidos:\n${campos}`;
                    }
                } catch (_) {}
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            // Simular un pequeño delay de 750ms para que la transición del Skeleton sea suave y visible
            setTimeout(() => {
                renderResults(data, consumoVal, metrosVal, horasVal);
                setView("results");
                submitBtn.innerHTML = originalHtml;
                submitBtn.disabled = false;
            }, 750);

        } catch (error) {
            console.error("[EnergiAI] Error al procesar el análisis:", error);
            errorText.textContent = error.message || "No se pudo establecer comunicación con el microservicio de diagnóstico. Verifique que el backend esté encendido.";
            setView("error");
            submitBtn.innerHTML = originalHtml;
            submitBtn.disabled = false;
        }
    });

    // ─────────────────────────────────────────────
    // setView – gestión de transiciones de paneles
    // ─────────────────────────────────────────────
    function setView(state) {
        emptyState.classList.add("d-none");
        skeletonState.classList.add("d-none");
        resultsContent.classList.add("d-none");
        errorContent.classList.add("d-none");

        if (state === "loading") {
            skeletonState.classList.remove("d-none");
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
    function renderResults(data, consumoVal, metrosVal, horasVal) {

        // ── 1. CATEGORÍA BADGE ───────────────────────────────────────────
        const categoria = (data.categoria || "Indeterminado").trim();
        categoriaText.textContent = categoria;

        categoriaBadge.className = "diagnostic-badge-premium";
        categoriaIcon.className = "fa-solid me-1";

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
            categoriaBadge.classList.add("moderado");
            categoriaIcon.classList.add("fa-circle-question");
        }

        // ── 2. COSTO ESTIMADO ─────────────────────────────────────────────
        const costo = data.costo_estimado_mensual ?? 0;
        costoText.textContent = formatCurrency(costo);

        // ── 3. METRICAS DINAMICAS EXTRAS ──────────────────────────────────
        // Consumo específico: kWh por m2
        const consumoEsp = metrosVal > 0 ? (consumoVal / metrosVal).toFixed(1) : "0.0";
        valConsumoEspecifico.textContent = `${consumoEsp} kWh/m²`;

        // Intensidad diaria: horas de alto consumo sobre 24h
        const intensidad = ((horasVal / 24) * 100).toFixed(1);
        valIntensidadDiaria.textContent = `${intensidad}%`;

        // ── 4. CONFIANZA Y BARRA DE PROGRESO ──────────────────────────────
        let prob = data.probabilidad ?? 0;
        const metodoDecision = data.detalles?.metodo_decision;

        if (metodoDecision && metodoDecision.includes("3/3")) {
            prob = 100;
        } else if (metodoDecision && metodoDecision.includes("2/3")) {
            prob = 67;
        } else {
            if (prob > 0 && prob <= 1) { prob = prob * 100; }
            prob = Math.min(100, Math.round(prob));
        }

        probabilityText.textContent = `${prob}%`;
        setTimeout(() => {
            probabilityBar.style.width = `${prob}%`;
        }, 50);

        // ── 5. RECOMENDACIONES PLAN DE ACCION ─────────────────────────────
        recommendationsList.innerHTML = "";
        const recs = Array.isArray(data.recomendaciones) && data.recomendaciones.length > 0
            ? data.recomendaciones
            : ["Revise y programe el uso eficiente de los electrodomésticos en horas fuera de pico."];

        recs.forEach((rec) => {
            const div = document.createElement("div");
            div.className = "rec-item-dashboard";
            div.innerHTML = `<i class="fa-solid fa-circle-check mt-1"></i><span>${rec}</span>`;
            recommendationsList.appendChild(div);
        });

        // ── 6. MOTOR DE ENSAMBLE VOTOS Y LATENCIAS ───────────────────────
        if (data.detalles?.votos_detallados) {
            const votos = data.detalles.votos_detallados;
            const latencias = data.detalles?.latencias_ms;

            const formatVote = (val) => val || "—";
            const formatLat = (val) => val !== undefined ? `${val.toFixed(1)}ms` : "—";

            voteXGB.textContent = formatVote(votos["XGBoost"]);
            voteXGB.className = "model-vote " + (votos["XGBoost"] ? votos["XGBoost"].toLowerCase() : "");
            document.getElementById("latXGB").textContent = formatLat(latencias?.xgboost_ms);

            voteLog.textContent = formatVote(votos["Regresion Logistica"]);
            voteLog.className = "model-vote " + (votos["Regresion Logistica"] ? votos["Regresion Logistica"].toLowerCase() : "");
            document.getElementById("latLog").textContent = formatLat(latencias?.regresion_logistica_ms);

            voteKNN.textContent = formatVote(votos["KNN"]);
            voteKNN.className = "model-vote " + (votos["KNN"] ? votos["KNN"].toLowerCase() : "");
            document.getElementById("latKNN").textContent = formatLat(latencias?.knn_ms);
        }

        if (metodoDecision) {
            decisionText.textContent = `Método: ${metodoDecision}`;
        } else {
            decisionText.textContent = `Método: Hard Voting Consensus`;
        }

        if (data.desempateAplicado) {
            desempateBadge.style.display = "inline-block";
        } else {
            desempateBadge.style.display = "none";
        }
    }

    // ─────────────────────────────────────────────
    // Utilidades
    // ─────────────────────────────────────────────
    function formatCurrency(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(value);
    }

    // PDF Auditoría Event
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", () => {
            alert("La descarga del informe de auditoría completo PDF estará disponible con el despliegue en OCI.");
        });
    }

    // ─────────────────────────────────────────────
    // PRESETS ORGÁNICOS Y REALISTAS DEL HACKATHON
    // ─────────────────────────────────────────────
    const PRESETS = {
        eficiente: {
            consumoKwh: 120,
            metrosCuadrados: 60,
            cantidadPersonas: 2,
            cantidadEquipos: 3,
            horasAltoConsumo: 2,
            usoHorarioPico: false,
            tipoInmueble: "Residencial"
        },
        moderado: {
            consumoKwh: 320,
            metrosCuadrados: 90,
            cantidadPersonas: 3,
            cantidadEquipos: 7,
            horasAltoConsumo: 5,
            usoHorarioPico: true,
            tipoInmueble: "Residencial"
        },
        ineficiente: {
            consumoKwh: 850,
            metrosCuadrados: 70,
            cantidadPersonas: 3,
            cantidadEquipos: 15,
            horasAltoConsumo: 10,
            usoHorarioPico: true,
            tipoInmueble: "Residencial"
        }
    };

    function cargarPreset(presetKey) {
        const data = PRESETS[presetKey];
        if (!data) return;

        // Remover active de todos
        document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
        // Agregar active al seleccionado
        const activeCard = document.getElementById(`btn-preset-${presetKey}`);
        if (activeCard) activeCard.classList.add("active");

        // Asignar y disparar eventos
        const setValAndSync = (sliderEl, inputEl, valEl, val) => {
            if (sliderEl) {
                sliderEl.value = val;
                if (inputEl) inputEl.value = val;
                if (valEl) valEl.textContent = val;
            }
        };

        setValAndSync(sliderConsumo, inputConsumo, valConsumo, data.consumoKwh);
        setValAndSync(sliderMetros, inputMetros, valMetros, data.metrosCuadrados);
        setValAndSync(sliderHoras, inputHoras, valHoras, data.horasAltoConsumo);

        if (selectTipo) selectTipo.value = data.tipoInmueble;
        if (inputPersonas) inputPersonas.value = data.cantidadPersonas;
        if (inputEquipos) inputEquipos.value = data.cantidadEquipos;
        if (switchPico) switchPico.checked = data.usoHorarioPico;
    }

    const btnEf = document.getElementById("btn-preset-eficiente");
    const btnMod = document.getElementById("btn-preset-moderado");
    const btnIne = document.getElementById("btn-preset-ineficiente");

    if (btnEf) btnEf.addEventListener("click", () => cargarPreset("eficiente"));
    if (btnMod) btnMod.addEventListener("click", () => cargarPreset("moderado"));
    if (btnIne) btnIne.addEventListener("click", () => cargarPreset("ineficiente"));

});
