package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.LesaoRepository;
import com.dossiertreinador.service.LesaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LesaoServiceImpl implements LesaoService {

    private final LesaoRepository lesaoRepository;
    private final AtletaRepository atletaRepository;

    @Override
    @Transactional
    public Lesao registarLesao(UUID atletaId, Lesao lesao) {
        Atleta atleta = atletaRepository.findById(atletaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atleta não encontrado com ID: " + atletaId));

        lesao.setAtleta(atleta);
        return lesaoRepository.save(lesao);
    }

    @Override
    @Transactional
    public Lesao atualizarEstado(UUID lesaoId, EstadoLesao novoEstado) {
        Lesao lesao = lesaoRepository.findById(lesaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesão não encontrada com ID: " + lesaoId));

        lesao.setEstadoLesao(novoEstado);
        return lesaoRepository.save(lesao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Lesao> listarHistoricoPorAtleta(UUID atletaId) {
        if (!atletaRepository.existsById(atletaId)) {
             throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atleta não encontrado com ID: " + atletaId);
        }
        return lesaoRepository.findByAtletaId(atletaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Lesao> listarLesionadosAtivosPorEquipa(UUID equipaId) {
        return lesaoRepository.findByAtletaEquipaIdAndEstadoLesaoNot(equipaId, EstadoLesao.RECUPERADO);
    }
}
