package com.dossiertreinador.domain.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SessaoTreinoExercicioDTO {
    private UUID id;
    private UUID exercicioId;
    private String exercicioNome; // Desnormalizado para facilidade do frontend
    private Integer ordem;
    private Integer duracaoMinutos;
    private String observacoesDoTreinador;
}
