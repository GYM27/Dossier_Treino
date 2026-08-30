package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.repository.EpocaRepository;
import com.dossiertreinador.service.EquipaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.dossiertreinador.domain.enums.Cargo;

@Service
@RequiredArgsConstructor
public class EquipaServiceImpl implements EquipaService {

    private final EquipaRepository equipaRepository;
    private final EpocaRepository epocaRepository;

    @Override
    public Equipa criarEquipa(Equipa equipa, String designacaoEpoca, Utilizador utilizador) {
        if (utilizador != null && utilizador.getCargo() != null && utilizador.getCargo() != Cargo.TREINADOR_PRINCIPAL) {
            throw new AccessDeniedException("Apenas o Treinador Principal pode criar equipas.");
        }
        
        // Procurar uma época existente com este nome, se não existir, cria!
        Epoca epocaCorrente = epocaRepository.findAll().stream()
                .filter(e -> e.getDesignacao().equals(designacaoEpoca))
                .findFirst()
                .orElseGet(() -> {
            Epoca novaEpoca = Epoca.builder()
                    .designacao(designacaoEpoca)
                    .dataInicio(java.time.LocalDate.now())
                    .dataFim(java.time.LocalDate.now().plusYears(1))
                    .build();
            return epocaRepository.save(novaEpoca);
        });
        
        equipa.setEpoca(epocaCorrente);
        
        return equipaRepository.save(equipa);
    }

    @Override
    public Equipa atualizarEquipa(java.util.UUID id, Equipa equipaAtualizada) {
        Equipa equipa = equipaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipa não encontrada."));
        
        if (equipaAtualizada.getNome() != null && !equipaAtualizada.getNome().isBlank()) {
            equipa.setNome(equipaAtualizada.getNome());
        }
        if (equipaAtualizada.getEscalao() != null && !equipaAtualizada.getEscalao().isBlank()) {
            equipa.setEscalao(equipaAtualizada.getEscalao());
        }
        if (equipaAtualizada.getDuracaoJogo() != null) {
            equipa.setDuracaoJogo(equipaAtualizada.getDuracaoJogo());
        }
        if (equipaAtualizada.getNumeroJogadores() != null) {
            equipa.setNumeroJogadores(equipaAtualizada.getNumeroJogadores());
        }
        if (equipaAtualizada.getModalidade() != null) {
            equipa.setModalidade(equipaAtualizada.getModalidade());
        }
        if (equipaAtualizada.getEmblemaUrl() != null) {
            equipa.setEmblemaUrl(equipaAtualizada.getEmblemaUrl());
        }

        return equipaRepository.save(equipa);
    }
}
