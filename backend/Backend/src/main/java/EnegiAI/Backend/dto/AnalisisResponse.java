package EnegiAI.Backend.dto;

import EnegiAI.Backend.model.AnalisisEnergetico;

/**
 * DTO raíz que representa la respuesta completa del análisis energético.
 *
 * Agrupa los distintos componentes del resultado (clasificación,
 * recomendaciones y estimación financiera) en una única estructura
 * que será serializada y enviada al consumidor de la API.
 *
 * Esta clase desacopla el modelo de dominio de la representación pública,
 * permitiendo evolucionar la API sin afectar la lógica de negocio.
 */
public record AnalisisResponse(
        CategoriaResponse categoria,
        RecomendacionesResponse recomendaciones,
        EstimacionFinancieraResponse estimacionFinanciera
) {

    /**
     * Construye la respuesta de la API a partir del modelo de dominio
     * del análisis energético.
     *
     * Cada sección del análisis es transformada en su correspondiente
     * DTO de respuesta, separando la representación pública de la
     * estructura interna utilizada por el dominio.
     *
     * @param analisisEnergetico Resultado completo del análisis energético.
     */
    public AnalisisResponse(AnalisisEnergetico  analisisEnergetico) {
        this(
                new CategoriaResponse(
                        analisisEnergetico.getCategoria().name(),
                        analisisEnergetico.getProbabilidad()
                ),
                new RecomendacionesResponse(
                        analisisEnergetico.getRecomendaciones()
                ),
                new EstimacionFinancieraResponse(
                        analisisEnergetico.getCostoEstimadoMensual()
                )
        );
    }
}
