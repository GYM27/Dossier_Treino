package com.dossiertreinador.service.impl;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;
import com.dossiertreinador.repository.ExercicioRepository;
import com.dossiertreinador.service.ExercicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExercicioServiceImpl implements ExercicioService {

    private final ExercicioRepository exercicioRepository;

    @Override
    @Transactional
    public Exercicio criarExercicio(Exercicio exercicio) {
        return exercicioRepository.save(exercicio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Exercicio> listarTodos() {
        return exercicioRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Exercicio> listarPorCategoria(CategoriaExercicio categoria) {
        return exercicioRepository.findByCategoria(categoria);
    }

    @Override
    @Transactional(readOnly = true)
    public Exercicio buscarPorId(UUID id) {
        return exercicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercício não encontrado."));
    }
}
