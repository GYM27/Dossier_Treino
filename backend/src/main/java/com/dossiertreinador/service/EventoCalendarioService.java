package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.EventoCalendario;

public interface EventoCalendarioService {
    
    /**
     * Regista um novo evento no calendário da equipa e, imediatamente a seguir,
     * constrói a grelha de assiduidade (colocando todos os atletas da equipa
     * com estado "PRESENTE" por defeito).
     */
    EventoCalendario registarEventoEGerarGrelha(EventoCalendario evento);
    
    /**
     * Retorna a lista de eventos de uma equipa para uma semana específica
     */
    java.util.List<EventoCalendario> listarEventosDaSemana(java.util.UUID equipaId, java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    /**
     * Atualiza um evento existente.
     */
    EventoCalendario atualizarEvento(java.util.UUID eventoId, EventoCalendario eventoAtualizado);
    
    /**
     * Elimina um evento existente.
     */
    void eliminarEvento(java.util.UUID eventoId);
    
    /**
     * Retorna o último número de treino registado para a equipa.
     */
    Integer obterUltimoNumeroTreino(java.util.UUID equipaId);
}
