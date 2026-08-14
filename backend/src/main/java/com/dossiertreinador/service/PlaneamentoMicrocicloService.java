package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.PlaneamentoMicrociclo;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PlaneamentoMicrocicloService {
    
    List<PlaneamentoMicrociclo> listarPlaneamentos(UUID equipaId);

    PlaneamentoMicrociclo obterPlaneamentoSemana(UUID equipaId, LocalDate dataInicio);

    PlaneamentoMicrociclo guardarPlaneamento(PlaneamentoMicrociclo planeamento);
}
