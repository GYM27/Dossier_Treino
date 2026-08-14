package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.dtos.RegistoAssiduidadeUpdateDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.RegistoAssiduidade;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.RegistoAssiduidadeRepository;
import com.dossiertreinador.service.RegistoAssiduidadeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistoAssiduidadeServiceImpl implements RegistoAssiduidadeService {

    private final RegistoAssiduidadeRepository registoRepository;
    private final EventoCalendarioRepository eventoRepository;
    private final AtletaRepository atletaRepository;

    @Override
    public List<RegistoAssiduidade> listarAssiduidadeDaSemana(UUID equipaId, LocalDateTime start, LocalDateTime end) {
        return registoRepository.findByEquipaAndDateRange(equipaId, start, end);
    }

    @Override
    @Transactional
    public RegistoAssiduidade atualizarRegisto(UUID registoId, RegistoAssiduidadeUpdateDTO updateDTO) {
        RegistoAssiduidade registo = registoRepository.findById(registoId)
                .orElseThrow(() -> new EntityNotFoundException("Registo de assiduidade não encontrado"));

        registo.setTipoAssiduidade(updateDTO.getTipoAssiduidade());
        registo.setMinutosAtraso(updateDTO.getMinutosAtraso());
        registo.setJustificacao(updateDTO.getJustificacao());

        return registoRepository.save(registo);
    }

    @Override
    @Transactional
    public RegistoAssiduidade upsertRegisto(UUID eventoId, UUID atletaId, RegistoAssiduidadeUpdateDTO updateDTO) {
        return registoRepository.findByEventoIdAndAtletaId(eventoId, atletaId)
                .map(registo -> {
                    registo.setTipoAssiduidade(updateDTO.getTipoAssiduidade());
                    registo.setMinutosAtraso(updateDTO.getMinutosAtraso());
                    registo.setJustificacao(updateDTO.getJustificacao());
                    return registoRepository.save(registo);
                })
                .orElseGet(() -> {
                    EventoCalendario evento = eventoRepository.findById(eventoId)
                            .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
                    Atleta atleta = atletaRepository.findById(atletaId)
                            .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado"));
                    
                    RegistoAssiduidade novo = new RegistoAssiduidade();
                    novo.setEvento(evento);
                    novo.setAtleta(atleta);
                    novo.setTipoAssiduidade(updateDTO.getTipoAssiduidade());
                    novo.setMinutosAtraso(updateDTO.getMinutosAtraso());
                    novo.setJustificacao(updateDTO.getJustificacao());
                    return registoRepository.save(novo);
                });
    }
}
