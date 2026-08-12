package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.EventoCalendario;

public interface EventoCalendarioService {
    
    /**
     * Regista um novo evento no calendário da equipa e, imediatamente a seguir,
     * constrói a grelha de assiduidade (colocando todos os atletas da equipa
     * com estado "PRESENTE" por defeito).
     */
    EventoCalendario registarEventoEGerarGrelha(EventoCalendario evento);
    
}
