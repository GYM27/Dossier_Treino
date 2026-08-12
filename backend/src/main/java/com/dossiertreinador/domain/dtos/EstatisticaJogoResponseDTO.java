package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.TipoEstatistica;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticaJogoResponseDTO {
    private UUID id;
    private UUID eventoId;
    
    private AtletaResponseDTO atleta;
    
    private TipoEstatistica tipoEstatistica;
    private Integer valor;
    private String minuto;
    private String notas;
}
