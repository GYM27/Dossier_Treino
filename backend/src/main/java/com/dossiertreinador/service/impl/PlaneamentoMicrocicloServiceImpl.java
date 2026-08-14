package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.PlaneamentoMicrociclo;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.repository.PlaneamentoMicrocicloRepository;
import com.dossiertreinador.service.PlaneamentoMicrocicloService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlaneamentoMicrocicloServiceImpl implements PlaneamentoMicrocicloService {

    private final PlaneamentoMicrocicloRepository planeamentoRepository;
    private final EquipaRepository equipaRepository;

    @Override
    public List<PlaneamentoMicrociclo> listarPlaneamentos(UUID equipaId) {
        return planeamentoRepository.findByEquipaIdOrderByDataInicioAsc(equipaId);
    }

    @Override
    public PlaneamentoMicrociclo obterPlaneamentoSemana(UUID equipaId, LocalDate dataInicio) {
        return planeamentoRepository.findByEquipaIdAndDataInicio(equipaId, dataInicio)
                .orElse(null); // Retorna null se ainda não houver configuração para a semana
    }

    @Override
    public PlaneamentoMicrociclo guardarPlaneamento(PlaneamentoMicrociclo planeamento) {
        // Valida a equipa
        Equipa equipa = equipaRepository.findById(planeamento.getEquipa().getId())
                .orElseThrow(() -> new RuntimeException("Equipa não encontrada."));
        planeamento.setEquipa(equipa);

        // Verifica se já existe para a mesma semana e atualiza, ou cria novo
        Optional<PlaneamentoMicrociclo> existente = planeamentoRepository.findByEquipaIdAndDataInicio(equipa.getId(), planeamento.getDataInicio());
        
        if (existente.isPresent()) {
            PlaneamentoMicrociclo atualizar = existente.get();
            atualizar.setNumeroMicrociclo(planeamento.getNumeroMicrociclo());
            atualizar.setNumeroMorfociclo(planeamento.getNumeroMorfociclo());
            return planeamentoRepository.save(atualizar);
        }

        return planeamentoRepository.save(planeamento);
    }
}
