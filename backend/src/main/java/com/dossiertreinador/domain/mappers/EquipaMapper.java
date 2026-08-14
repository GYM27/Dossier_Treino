package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.EquipaResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import org.springframework.stereotype.Component;

@Component
public class EquipaMapper {

    public EquipaResponseDTO toResponseDTO(Equipa equipa) {
        if (equipa == null) return null;

        return EquipaResponseDTO.builder()
                .id(equipa.getId())
                .nome(equipa.getNome())
                .escalao(equipa.getEscalao())
                .epocaNome(equipa.getEpoca() != null ? equipa.getEpoca().getDesignacao() : null)
                .modalidade(equipa.getModalidade())
                .duracaoJogo(equipa.getDuracaoJogo())
                .numeroJogadores(equipa.getNumeroJogadores())
                .emblemaUrl(equipa.getEmblemaUrl())
                .build();
    }
}
