package com.dossiertreinador.mappers;

import com.dossiertreinador.domain.dtos.EstatisticaJogoResponseDTO;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import org.springframework.stereotype.Component;

import com.dossiertreinador.domain.mappers.AtletaMapper;

@Component
public class EstatisticaJogoMapper {

    private final AtletaMapper atletaMapper;

    public EstatisticaJogoMapper(AtletaMapper atletaMapper) {
        this.atletaMapper = atletaMapper;
    }

    public EstatisticaJogoResponseDTO toDTO(EstatisticaJogo estatistica) {
        if (estatistica == null) {
            return null;
        }

        return EstatisticaJogoResponseDTO.builder()
                .id(estatistica.getId())
                .eventoId(estatistica.getEventoCalendario().getId())
                .atleta(atletaMapper.toResponseDTO(estatistica.getAtleta()))
                .tipoEstatistica(estatistica.getTipoEstatistica())
                .valor(estatistica.getValor())
                .minuto(estatistica.getMinuto())
                .notas(estatistica.getNotas())
                .build();
    }
}
