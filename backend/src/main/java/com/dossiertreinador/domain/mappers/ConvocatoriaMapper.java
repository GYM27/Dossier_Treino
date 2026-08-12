package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.ConvocatoriaAtletaDTO;
import com.dossiertreinador.domain.dtos.ConvocatoriaResponseDTO;
import com.dossiertreinador.domain.entities.Convocatoria;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ConvocatoriaMapper {

    public ConvocatoriaResponseDTO toDTO(Convocatoria entity) {
        if (entity == null) {
            return null;
        }

        return ConvocatoriaResponseDTO.builder()
                .id(entity.getId())
                .eventoId(entity.getEventoCalendario().getId())
                .limiteConvocados(entity.getLimiteConvocados())
                .dataPublicacao(entity.getDataPublicacao())
                .observacoes(entity.getObservacoes())
                .atletas(entity.getAtletasConvocados().stream()
                        .map(ca -> ConvocatoriaAtletaDTO.builder()
                                .atletaId(ca.getAtleta().getId())
                                .nome(ca.getAtleta().getNome())
                                .posicaoPrincipal(ca.getAtleta().getPosicaoPrincipal() != null ? ca.getAtleta().getPosicaoPrincipal().name() : null)
                                .numeroCamisola(ca.getNumeroCamisola())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
