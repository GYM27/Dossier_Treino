package com.dossiertreinador.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaneamentoMicrocicloResponseDTO {
    private UUID id;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Integer numeroMicrociclo;
    private Integer numeroMorfociclo;
    private UUID equipaId;
}
