package com.dossiertreinador.domain.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SessaoTreinoResponseDTO {
    private UUID id;
    private UUID eventoId;
    
    // Dados que vêm do calendário (Read-only no Treino Builder, ou atualizados via evento)
    private LocalDate data;
    private LocalTime hora;
    private String local;
    private Integer morfociclo;
    private Integer mesociclo;
    private Integer microciclo;
    private Integer unidadeTreino;
    private String fase;
    
    private Integer numeroJogadores;
    private String material;
    private String objetivo;
    private Integer intensidadeGeral;
    private Integer duracaoTotalMinutos;
    private UUID equipaId;
    
    // Lista de exercícios para detalhe da sessão
    private List<SessaoTreinoExercicioDTO> exercicios;
}
