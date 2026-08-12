package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.entities.SessaoTreinoExercicio;
import com.dossiertreinador.repository.SessaoTreinoRepository;
import com.dossiertreinador.service.impl.SessaoTreinoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessaoTreinoServiceTest {

    @Mock
    private SessaoTreinoRepository sessaoTreinoRepository;

    @Mock
    private ExercicioService exercicioService;

    @InjectMocks
    private SessaoTreinoServiceImpl sessaoTreinoService;

    private SessaoTreino sessao;
    private Exercicio exercicio;
    private UUID sessaoId;
    private UUID exercicioId;

    @BeforeEach
    void setUp() {
        sessaoId = UUID.randomUUID();
        exercicioId = UUID.randomUUID();

        sessao = SessaoTreino.builder()
                .id(sessaoId)
                .duracaoTotalMinutos(0)
                .exercicios(new ArrayList<>())
                .build();

        exercicio = Exercicio.builder()
                .id(exercicioId)
                .nome("Meinho")
                .build();
    }

    @Test
    void adicionarExercicio_DeveRecalcularDuracaoTotal() {
        // Arrange
        when(sessaoTreinoRepository.findById(sessaoId)).thenReturn(Optional.of(sessao));
        when(exercicioService.buscarPorId(exercicioId)).thenReturn(exercicio);
        when(sessaoTreinoRepository.save(any(SessaoTreino.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        SessaoTreino atualizada = sessaoTreinoService.adicionarExercicio(sessaoId, exercicioId, 1, 15, "Foco passes curtos");

        // Assert
        assertThat(atualizada.getExercicios()).hasSize(1);
        assertThat(atualizada.getDuracaoTotalMinutos()).isEqualTo(15);
        verify(sessaoTreinoRepository, times(1)).save(atualizada);
    }
}
