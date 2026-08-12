package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;

import java.util.List;
import java.util.UUID;

public interface ExercicioService {
    Exercicio criarExercicio(Exercicio exercicio);
    List<Exercicio> listarTodos();
    List<Exercicio> listarPorCategoria(CategoriaExercicio categoria);
    Exercicio buscarPorId(UUID id);
}
