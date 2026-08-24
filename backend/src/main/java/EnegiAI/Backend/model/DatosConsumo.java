package EnegiAI.Backend.model;


import EnegiAI.Backend.dto.ConsumoRequest;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Embeddable
public class DatosConsumo {

    private Double consumoKwh;
    private Boolean usoHorarioPico;
    private Integer cantidadEquipos;
    private String tipoInmueble;
    private Integer horasAltoConsumo;

    public DatosConsumo(ConsumoRequest consumoRequest) {
        this.consumoKwh = consumoRequest.consumo_kwh();
        this.usoHorarioPico = consumoRequest.uso_horario_pico();
        this.cantidadEquipos = consumoRequest.cantidad_equipos();
        this.tipoInmueble = consumoRequest.tipo_inmueble();
        this.horasAltoConsumo = consumoRequest.horas_alto_consumo();
    }
}
