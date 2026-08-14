package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.RegistoAssiduidadeResponseDTO;
import com.dossiertreinador.domain.entities.RegistoAssiduidade;
import org.springframework.stereotype.Component;

@Component
public class RegistoAssiduidadeMapper {

    public RegistoAssiduidadeResponseDTO toResponseDTO(RegistoAssiduidade registo) {
        if (registo == null) {
            return null;
        }

        return RegistoAssiduidadeResponseDTO.builder()
                .id(registo.getId())
                .eventoId(registo.getEvento().getId())
                .atletaId(registo.getAtleta().getId())
                .tipoAssiduidade(registo.getTipoAssiduidade())
                .minutosAtraso(registo.getMinutosAtraso())
                .justificacao(registo.getJustificacao())
                .build();
    }
}
