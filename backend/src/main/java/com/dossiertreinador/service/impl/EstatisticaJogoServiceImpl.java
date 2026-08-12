package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.TipoEstatistica;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.EstatisticaJogoRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.service.EstatisticaJogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EstatisticaJogoServiceImpl implements EstatisticaJogoService {

    private final EstatisticaJogoRepository estatisticaRepository;
    private final EventoCalendarioRepository eventoRepository;
    private final AtletaRepository atletaRepository;

    @Override
    @Transactional
    public EstatisticaJogo registarEstatistica(UUID eventoId, UUID atletaId, TipoEstatistica tipo, Integer valor, String minuto, String notas) {
        
        EventoCalendario evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado."));
                
        Atleta atleta = atletaRepository.findById(atletaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atleta não encontrado."));
                
        // 🔐 VALIDAÇÃO IDOR: Garantir que o treinador não regista golos de atletas que não sejam da sua equipa
        if (!atleta.getEquipa().getId().equals(evento.getEquipa().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Atleta não pertence à equipa deste evento.");
        }
        
        EstatisticaJogo estatistica = EstatisticaJogo.builder()
                .eventoCalendario(evento)
                .atleta(atleta)
                .tipoEstatistica(tipo)
                .valor(valor != null ? valor : 1) // Por defeito, 1 (ex: 1 golo, 1 amarelo)
                .minuto(minuto)
                .notas(notas)
                .build();
                
        return estatisticaRepository.save(estatistica);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstatisticaJogo> listarPorEvento(UUID eventoId) {
        if (!eventoRepository.existsById(eventoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado.");
        }
        return estatisticaRepository.findByEventoCalendarioId(eventoId);
    }

    @Override
    @Transactional
    public void removerEstatistica(UUID estatisticaId) {
        if (!estatisticaRepository.existsById(estatisticaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Estatística não encontrada.");
        }
        estatisticaRepository.deleteById(estatisticaId);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer obterTotalNaEpoca(UUID atletaId, TipoEstatistica tipo, UUID epocaId) {
        return estatisticaRepository.somarEstatisticaPorAtletaEEpoca(atletaId, tipo, epocaId);
    }
}
