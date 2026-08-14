package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.TipoEvento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoCalendarioRequestDTO {
    private TipoEvento tipoEvento;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String descricao;
    private String local;
    private Integer numeroTreino;
    private String equipaCasa;
    private String equipaFora;
}
