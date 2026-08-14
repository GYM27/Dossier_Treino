package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.SessaoTreinoExercicioDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoRequestDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.entities.SessaoTreinoExercicio;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class SessaoTreinoMapper {

    public SessaoTreino toEntity(SessaoTreinoRequestDTO dto, Equipa equipa) {
        if (dto == null) return null;
        
        return SessaoTreino.builder()
                .data(dto.getData())
                .hora(dto.getHora())
                .morfociclo(dto.getMorfociclo())
                .microciclo(dto.getMicrociclo())
                .fase(dto.getFase())
                .numeroJogadores(dto.getNumeroJogadores())
                .material(dto.getMaterial())
                .objetivo(dto.getObjetivo())
                .intensidadeGeral(dto.getIntensidadeGeral())
                .equipa(equipa)
                .build();
    }

    public SessaoTreinoResponseDTO toResponseDTO(SessaoTreino entity) {
        if (entity == null) return null;
        
        return SessaoTreinoResponseDTO.builder()
                .id(entity.getId())
                .data(entity.getData())
                .hora(entity.getHora())
                .morfociclo(entity.getMorfociclo())
                .microciclo(entity.getMicrociclo())
                .fase(entity.getFase())
                .numeroJogadores(entity.getNumeroJogadores())
                .material(entity.getMaterial())
                .objetivo(entity.getObjetivo())
                .intensidadeGeral(entity.getIntensidadeGeral())
                .duracaoTotalMinutos(entity.getDuracaoTotalMinutos())
                .equipaId(entity.getEquipa() != null ? entity.getEquipa().getId() : null)
                .exercicios(entity.getExercicios().stream()
                        .map(this::toExercicioDTO)
                        .collect(Collectors.toList()))
                .build();
    }
    
    private SessaoTreinoExercicioDTO toExercicioDTO(SessaoTreinoExercicio assoc) {
        return SessaoTreinoExercicioDTO.builder()
                .id(assoc.getId())
                .exercicioId(assoc.getExercicio().getId())
                .exercicioNome(assoc.getExercicio().getNome())
                .ordem(assoc.getOrdem())
                .duracaoMinutos(assoc.getDuracaoMinutos())
                .observacoesDoTreinador(assoc.getObservacoesDoTreinador())
                .build();
    }
}
