package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;

import java.util.List;
import java.util.UUID;

public interface LesaoService {

    Lesao registarLesao(UUID atletaId, Lesao lesao);

    Lesao atualizarEstado(UUID lesaoId, EstadoLesao novoEstado);

    List<Lesao> listarHistoricoPorAtleta(UUID atletaId);

    List<Lesao> listarLesionadosAtivosPorEquipa(UUID equipaId);
}
