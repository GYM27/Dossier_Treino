package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.EventoCalendarioResponseDTO;
import com.dossiertreinador.domain.entities.EventoCalendario;
import org.springframework.stereotype.Component;

@Component
public class EventoCalendarioMapper {

    public EventoCalendarioResponseDTO toResponseDTO(EventoCalendario evento) {
        if (evento == null) {
            return null;
        }

        return EventoCalendarioResponseDTO.builder()
                .id(evento.getId())
                .tipoEvento(evento.getTipoEvento())
                .dataHoraInicio(evento.getDataHoraInicio())
                .dataHoraFim(evento.getDataHoraFim())
                .descricao(evento.getDescricao())
                .local(evento.getLocal())
                .numeroTreino(evento.getNumeroTreino())
                .equipaCasa(evento.getEquipaCasa())
                .equipaFora(evento.getEquipaFora())
                .build();
    }
}
