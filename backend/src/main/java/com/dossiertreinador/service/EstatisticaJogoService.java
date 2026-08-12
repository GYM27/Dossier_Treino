package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.enums.TipoEstatistica;

import java.util.List;
import java.util.UUID;

public interface EstatisticaJogoService {
    
    EstatisticaJogo registarEstatistica(UUID eventoId, UUID atletaId, TipoEstatistica tipo, Integer valor, String minuto, String notas);
    
    List<EstatisticaJogo> listarPorEvento(UUID eventoId);
    
    void removerEstatistica(UUID estatisticaId);
    
    Integer obterTotalNaEpoca(UUID atletaId, TipoEstatistica tipo, UUID epocaId);
}
