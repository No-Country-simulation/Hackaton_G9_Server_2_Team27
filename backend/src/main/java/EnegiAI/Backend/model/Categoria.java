package EnegiAI.Backend.model;

/**
 * Define las categorías posibles de eficiencia energética asignadas
 * durante el proceso de análisis.
 *
 * Este enumerado centraliza las clasificaciones utilizadas por el dominio
 * y proporciona utilidades para convertir representaciones externas
 * provenientes del cliente en valores del modelo interno.
 */
public enum Categoria {
    Eficiente("Eficiente"),
    Moderado("Moderado"),
    Ineficiente("Ineficiente");

    private String categoria;

    Categoria(String text) {
        this.categoria = text;
    }

    /**
     * Convierte la representación textual enviada por el cliente en la
     * categoría correspondiente del modelo de dominio.
     *
     * La comparación se realiza ignorando diferencias entre mayúsculas y
     * minúsculas.
     *
     * @param text Nombre de la categoría recibido desde el cliente.
     * @return Categoría equivalente dentro del dominio.
     * @throws IllegalArgumentException Si el texto no corresponde a ninguna categoría válida.
     */
    public static Categoria fromFront(String text) {
        for (Categoria categoria : Categoria.values()) {
            if (categoria.categoria.equalsIgnoreCase(text)) {
                return categoria;
            }
        }
        throw new IllegalArgumentException("Ninguna categoria encontrada: " + text);
    }
}
