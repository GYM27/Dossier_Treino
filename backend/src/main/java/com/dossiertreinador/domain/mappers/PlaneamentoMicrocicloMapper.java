package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.PlaneamentoMicrocicloResponseDTO;
import com.dossiertreinador.domain.entities.PlaneamentoMicrociclo;
import org.springframework.stereotype.Component;

@Component
public class PlaneamentoMicrocicloMapper {

    public PlaneamentoMicrocicloResponseDTO toResponseDTO(PlaneamentoMicrociclo planeamento) {
        if (planeamento == null) {
            return null;
        }

        return PlaneamentoMicrocicloResponseDTO.builder()
                .id(planeamento.getId())
                .dataInicio(planeamento.getDataInicio())
                .dataFim(planeamento.getDataFim())
                .numeroMicrociclo(planeamento.getNumeroMicrociclo())
                .numeroMorfociclo(planeamento.getNumeroMorfociclo())
                .build();
    }
}
