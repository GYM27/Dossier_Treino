package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.entities.SessaoTreinoExercicio;
import com.dossiertreinador.repository.SessaoTreinoRepository;
import com.dossiertreinador.service.ExercicioService;
import com.dossiertreinador.service.SessaoTreinoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessaoTreinoServiceImpl implements SessaoTreinoService {

    private final SessaoTreinoRepository sessaoTreinoRepository;
    private final ExercicioService exercicioService;

    @Override
    @Transactional
    public SessaoTreino criarSessao(SessaoTreino sessao) {
        // Garantir que a duração inicial é 0 ou calculada com base na lista de exercícios se vier preenchida
        int duracaoTotal = sessao.getExercicios().stream()
                .mapToInt(SessaoTreinoExercicio::getDuracaoMinutos)
                .sum();
        sessao.setDuracaoTotalMinutos(duracaoTotal);
        
        // Garante que cada associação conhece a sua sessão (caso venha preenchida de raiz)
        sessao.getExercicios().forEach(assoc -> assoc.setSessaoTreino(sessao));
        
        return sessaoTreinoRepository.save(sessao);
    }

    @Override
    @Transactional
    public SessaoTreino adicionarExercicio(UUID sessaoId, UUID exercicioId, Integer ordem, Integer duracaoMinutos, String observacoes) {
        SessaoTreino sessao = buscarPorId(sessaoId);
        Exercicio exercicio = exercicioService.buscarPorId(exercicioId);

        SessaoTreinoExercicio assoc = SessaoTreinoExercicio.builder()
                .sessaoTreino(sessao)
                .exercicio(exercicio)
                .ordem(ordem)
                .duracaoMinutos(duracaoMinutos)
                .observacoesDoTreinador(observacoes)
                .build();

        sessao.getExercicios().add(assoc);
        
        // Recalcular duração total
        int duracaoTotal = sessao.getExercicios().stream()
                .mapToInt(SessaoTreinoExercicio::getDuracaoMinutos)
                .sum();
        sessao.setDuracaoTotalMinutos(duracaoTotal);

        return sessaoTreinoRepository.save(sessao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessaoTreino> listarPorEquipa(UUID equipaId) {
        return sessaoTreinoRepository.findByEquipaIdOrderByDataDesc(equipaId);
    }

    @Override
    @Transactional(readOnly = true)
    public SessaoTreino buscarPorId(UUID id) {
        return sessaoTreinoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sessão de Treino não encontrada."));
    }
}
