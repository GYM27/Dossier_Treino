package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.TipoEvento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoCalendarioResponseDTO {
    private UUID id;
    private TipoEvento tipoEvento;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String descricao;
    private String local;
    private Integer numeroTreino;
    private String equipaCasa;
    private String equipaFora;
}
