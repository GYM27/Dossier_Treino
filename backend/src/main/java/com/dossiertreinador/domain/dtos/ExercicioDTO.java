package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.CategoriaExercicio;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ExercicioDTO {
    private UUID id;
    private String nome;
    private String descricao;
    private CategoriaExercicio categoria;
    private Integer nivelDificuldade;
}
