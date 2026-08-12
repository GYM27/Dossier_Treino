package com.dossiertreinador.domain.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SessaoTreinoResponseDTO {
    private UUID id;
    private LocalDate data;
    private String objetivo;
    private Integer intensidadeGeral;
    private Integer duracaoTotalMinutos;
    private UUID equipaId;
    
    // Lista de exercícios para detalhe da sessão
    private List<SessaoTreinoExercicioDTO> exercicios;
}
