package com.dossiertreinador.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessaoTreinoExercicioDTO {
    private UUID id;
    private UUID exercicioId;
    private String exercicioNome; // Desnormalizado para facilidade do frontend
    private String descricao;
    private String objetivosEspecificos;
    private String carga;
    private String categoria;
    private Integer nivelDificuldade;
    private String espaco;
    private Integer jogadoresEnvolvidos;
    private Integer ordem;
    private Integer duracaoMinutos;
    private String observacoesDoTreinador;
    private Object dadosTaticos;
}
