package com.dossiertreinador.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvocatoriaResponseDTO {
    private UUID id;
    private UUID eventoId;
    private Integer limiteConvocados;
    private LocalDateTime dataPublicacao;
    private String observacoes;
    private List<ConvocatoriaAtletaDTO> atletas;
}
