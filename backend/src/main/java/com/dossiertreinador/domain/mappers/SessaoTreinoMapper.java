package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.SessaoTreinoExercicioDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoRequestDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.entities.SessaoTreinoExercicio;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class SessaoTreinoMapper {

    public SessaoTreino toEntity(SessaoTreinoRequestDTO dto, Equipa equipa) {
        return toEntity(dto, equipa, null);
    }

    public SessaoTreino toEntity(SessaoTreinoRequestDTO dto, Equipa equipa, EventoCalendario evento) {
        if (dto == null) return null;
        
        return SessaoTreino.builder()
                .eventoCalendario(evento)
                .numeroJogadores(dto.getNumeroJogadores())
                .material(dto.getMaterial())
                .objetivo(dto.getObjetivo())
                .intensidadeGeral(dto.getIntensidadeGeral())
                .mesociclo(dto.getMesociclo())
                .microciclo(dto.getMicrociclo())
                .unidadeTreino(dto.getUnidadeTreino() != null ? dto.getUnidadeTreino() : (evento != null ? evento.getNumeroTreino() : null))
                .equipa(equipa)
                .build();
    }

    public SessaoTreinoResponseDTO toResponseDTO(SessaoTreino entity) {
        if (entity == null) return null;
        
        Integer micro = entity.getMicrociclo();
        Integer ut = entity.getUnidadeTreino() != null ? entity.getUnidadeTreino() : (entity.getEventoCalendario() != null ? entity.getEventoCalendario().getNumeroTreino() : 1);
        Integer meso = entity.getMesociclo();

        return SessaoTreinoResponseDTO.builder()
                .id(entity.getId())
                .eventoId(entity.getEventoCalendario() != null ? entity.getEventoCalendario().getId() : null)
                .data(entity.getEventoCalendario() != null ? entity.getEventoCalendario().getDataHoraInicio().toLocalDate() : null)
                .hora(entity.getEventoCalendario() != null ? entity.getEventoCalendario().getDataHoraInicio().toLocalTime() : null)
                .local(entity.getEventoCalendario() != null ? entity.getEventoCalendario().getLocal() : null)
                .morfociclo(meso)
                .mesociclo(meso != null ? meso : 1)
                .microciclo(micro != null ? micro : 1)
                .unidadeTreino(ut != null ? ut : 1)
                .fase(null)
                .numeroJogadores(entity.getNumeroJogadores())
                .material(entity.getMaterial())
                .objetivo(entity.getObjetivo())
                .intensidadeGeral(entity.getIntensidadeGeral())
                .duracaoTotalMinutos(entity.getDuracaoTotalMinutos())
                .equipaId(entity.getEquipa() != null ? entity.getEquipa().getId() : null)
                .exercicios(entity.getExercicios().stream()
                        .sorted(java.util.Comparator.comparing(SessaoTreinoExercicio::getOrdem, java.util.Comparator.nullsLast(Integer::compareTo)))
                        .map(this::toExercicioDTO)
                        .collect(Collectors.toList()))
                .build();
    }
    
    private SessaoTreinoExercicioDTO toExercicioDTO(SessaoTreinoExercicio assoc) {
        return SessaoTreinoExercicioDTO.builder()
                .id(assoc.getId())
                .exercicioId(assoc.getExercicio().getId())
                .exercicioNome(assoc.getExercicio().getNome())
                .descricao(assoc.getExercicio().getDescricao())
                .objetivosEspecificos(assoc.getExercicio().getObjetivosEspecificos())
                .carga(assoc.getExercicio().getCarga())
                .categoria(assoc.getExercicio().getCategoria() != null ? assoc.getExercicio().getCategoria().name() : null)
                .nivelDificuldade(assoc.getExercicio().getNivelDificuldade())
                .espaco(assoc.getExercicio().getEspaco())
                .jogadoresEnvolvidos(assoc.getExercicio().getJogadoresEnvolvidos())
                .ordem(assoc.getOrdem())
                .duracaoMinutos(assoc.getDuracaoMinutos())
                .observacoesDoTreinador(assoc.getObservacoesDoTreinador())
                .dadosTaticos(assoc.getExercicio().getDadosTaticos())
                .build();
    }
}
