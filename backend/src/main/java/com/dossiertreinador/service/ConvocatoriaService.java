package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Convocatoria;

import java.util.List;
import java.util.UUID;

public interface ConvocatoriaService {

    Convocatoria criarConvocatoria(UUID eventoId, List<UUID> atletaIds, int limiteConvocados, String observacoes, boolean forcarConvocatoria);

    Convocatoria obterConvocatoriaPorEvento(UUID eventoId);
}
