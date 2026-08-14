package com.dossiertreinador.service;

import com.dossiertreinador.domain.dtos.RegistoAssiduidadeUpdateDTO;
import com.dossiertreinador.domain.entities.RegistoAssiduidade;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RegistoAssiduidadeService {
    
    /**
     * Retorna todos os registos de assiduidade de uma equipa num determinado intervalo de tempo (semana).
     */
    List<RegistoAssiduidade> listarAssiduidadeDaSemana(UUID equipaId, LocalDateTime start, LocalDateTime end);
    
    /**
     * Atualiza um registo de assiduidade específico.
     */
    RegistoAssiduidade atualizarRegisto(UUID registoId, RegistoAssiduidadeUpdateDTO updateDTO);

    /**
     * Atualiza ou cria um novo registo de assiduidade para o atleta no evento.
     */
    RegistoAssiduidade upsertRegisto(UUID eventoId, UUID atletaId, RegistoAssiduidadeUpdateDTO updateDTO);
}
