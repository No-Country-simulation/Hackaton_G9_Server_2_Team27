package EnegiAI.Backend.dto;

import EnegiAI.Backend.model.AnalisisEnergetico;
import EnegiAI.Backend.model.DatosConsumo;
import EnegiAI.Backend.model.AnalisisEnergeticoEntity;

import java.time.LocalDateTime;
import java.util.List;

public record AnalisisEntityDTO(
         Long id,
         Boolean activo,
         AnalisisEnergetico analisisEnergetico,
         DatosConsumo datosConsumo,
         List<String>recomendaciones,
         LocalDateTime fechaConsulta)
{

    public AnalisisEntityDTO(AnalisisEnergeticoEntity analisis){
        this(
                analisis.getId(),
                analisis.getActivo(),
                analisis.getAnalisisEnergetico(),
                analisis.getDatosConsumo(),
                analisis.getRecomendaciones(),
                analisis.getFechaConsulta()
        );
    }
}
