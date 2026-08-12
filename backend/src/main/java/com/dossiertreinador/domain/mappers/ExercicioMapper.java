package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.ExercicioDTO;
import com.dossiertreinador.domain.entities.Exercicio;
import org.springframework.stereotype.Component;

@Component
public class ExercicioMapper {
    
    public Exercicio toEntity(ExercicioDTO dto) {
        if (dto == null) return null;
        
        return Exercicio.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .categoria(dto.getCategoria())
                .nivelDificuldade(dto.getNivelDificuldade())
                .build();
    }
    
    public ExercicioDTO toDTO(Exercicio entity) {
        if (entity == null) return null;
        
        return ExercicioDTO.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .categoria(entity.getCategoria())
                .nivelDificuldade(entity.getNivelDificuldade())
                .build();
    }
}
