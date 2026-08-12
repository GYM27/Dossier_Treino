package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.*;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.ConvocatoriaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.LesaoRepository;
import com.dossiertreinador.service.ConvocatoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConvocatoriaServiceImpl implements ConvocatoriaService {

    private final ConvocatoriaRepository convocatoriaRepository;
    private final EventoCalendarioRepository eventoRepository;
    private final AtletaRepository atletaRepository;
    private final LesaoRepository lesaoRepository;

    @Override
    @Transactional
    public Convocatoria criarConvocatoria(UUID eventoId, List<UUID> atletaIds, int limiteConvocados, String observacoes, boolean forcarConvocatoria) {
        
        if (atletaIds.size() > limiteConvocados) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "O número de atletas excede o limite configurado (" + limiteConvocados + ").");
        }

        EventoCalendario evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));
                
        // Validar se o evento já tem convocatória (relação 1:1)
        if (convocatoriaRepository.findByEventoCalendarioId(eventoId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O evento já possui uma convocatória oficial.");
        }

        List<Atleta> atletas = atletaRepository.findAllById(atletaIds);
        
        if (atletas.size() != atletaIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Um ou mais atletas indicados não foram encontrados.");
        }

        Convocatoria convocatoria = Convocatoria.builder()
                .eventoCalendario(evento)
                .limiteConvocados(limiteConvocados)
                .observacoes(observacoes)
                .dataPublicacao(LocalDateTime.now())
                .build();

        for (Atleta atleta : atletas) {
            // 🔐 VALIDAÇÃO IDOR: Garantir que o treinador não tenta convocar 
            // atletas de outras equipas da BD.
            if (!atleta.getEquipa().getId().equals(evento.getEquipa().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "O atleta " + atleta.getNome() + " não pertence à equipa do evento.");
            }

            // 🔐 VALIDAÇÃO MÉDICA: Verificar se o atleta tem lesões ativas
            if (!forcarConvocatoria) {
                List<Lesao> historico = lesaoRepository.findByAtletaId(atleta.getId());
                boolean temLesaoAtiva = historico.stream()
                        .anyMatch(l -> l.getEstadoLesao() != EstadoLesao.RECUPERADO);

                if (temLesaoAtiva) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                            "O atleta " + atleta.getNome() + " está inapto por lesão (não RECUPERADO).");
                }
            }

            ConvocatoriaAtleta ca = ConvocatoriaAtleta.builder()
                    .convocatoria(convocatoria)
                    .atleta(atleta)
                    // Por defeito, não temos o nº da camisola preenchido aqui, pode ser nulo
                    .build();

            convocatoria.getAtletasConvocados().add(ca);
        }

        return convocatoriaRepository.save(convocatoria);
    }

    @Override
    @Transactional(readOnly = true)
    public Convocatoria obterConvocatoriaPorEvento(UUID eventoId) {
        return convocatoriaRepository.findByEventoCalendarioId(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convocatória não encontrada para o evento."));
    }
}
