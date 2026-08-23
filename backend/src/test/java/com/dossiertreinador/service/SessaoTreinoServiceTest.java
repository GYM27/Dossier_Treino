package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.entities.SessaoTreinoExercicio;
import com.dossiertreinador.repository.SessaoTreinoExercicioRepository;
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
    private SessaoTreinoExercicioRepository sessaoTreinoExercicioRepository;

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

    @Test
    void atualizarSessao_DeveAtualizarPeriodizacaoEMetadados() {
        // Arrange
        when(sessaoTreinoRepository.findById(sessaoId)).thenReturn(Optional.of(sessao));
        when(sessaoTreinoRepository.save(any(SessaoTreino.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        SessaoTreino atualizada = sessaoTreinoService.atualizarSessao(
                sessaoId,
                "Pressão Bloco Alto",
                "20 Bolas, 10 Cones",
                22,
                4,
                2, // Mesociclo #2
                3, // Microciclo #3
                8  // Unidade de Treino #8
        );

        // Assert
        assertThat(atualizada.getObjetivo()).isEqualTo("Pressão Bloco Alto");
        assertThat(atualizada.getMaterial()).isEqualTo("20 Bolas, 10 Cones");
        assertThat(atualizada.getNumeroJogadores()).isEqualTo(22);
        assertThat(atualizada.getIntensidadeGeral()).isEqualTo(4);
        assertThat(atualizada.getMesociclo()).isEqualTo(2);
        assertThat(atualizada.getMicrociclo()).isEqualTo(3);
        assertThat(atualizada.getUnidadeTreino()).isEqualTo(8);
        verify(sessaoTreinoRepository, times(1)).save(atualizada);
    }

    @Test
    void atualizarExercicioNaSessao_DevePermitirReassociarNovoExercicio() {
        // Arrange
        UUID assocId = UUID.randomUUID();
        SessaoTreinoExercicio assoc = SessaoTreinoExercicio.builder()
                .id(assocId)
                .sessaoTreino(sessao)
                .exercicio(exercicio)
                .ordem(1)
                .duracaoMinutos(15)
                .build();
        sessao.getExercicios().add(assoc);

        UUID novoExercicioId = UUID.randomUUID();
        Exercicio novoExercicio = Exercicio.builder()
                .id(novoExercicioId)
                .nome("Meinho Variante 2")
                .build();

        when(sessaoTreinoRepository.findById(sessaoId)).thenReturn(Optional.of(sessao));
        when(exercicioService.buscarPorId(novoExercicioId)).thenReturn(novoExercicio);
        when(sessaoTreinoRepository.save(any(SessaoTreino.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        SessaoTreino atualizada = sessaoTreinoService.atualizarExercicioNaSessao(
                sessaoId,
                assocId,
                novoExercicioId,
                2,
                20,
                "Nova variante tática com 2 toques"
        );

        // Assert
        assertThat(atualizada.getExercicios()).hasSize(1);
        SessaoTreinoExercicio assocAtualizada = atualizada.getExercicios().get(0);
        assertThat(assocAtualizada.getExercicio().getId()).isEqualTo(novoExercicioId);
        assertThat(assocAtualizada.getExercicio().getNome()).isEqualTo("Meinho Variante 2");
        assertThat(assocAtualizada.getOrdem()).isEqualTo(2);
        assertThat(assocAtualizada.getDuracaoMinutos()).isEqualTo(20);
        assertThat(assocAtualizada.getObservacoesDoTreinador()).isEqualTo("Nova variante tática com 2 toques");
        verify(sessaoTreinoExercicioRepository, times(1)).save(assocAtualizada);
        verify(sessaoTreinoRepository, times(1)).save(atualizada);
    }

    @Test
    void reordenarExercicios_DeveAtualizarOrdemDeTodosOsExerciciosCorretamente() {
        // Arrange
        UUID assocId1 = UUID.randomUUID();
        UUID assocId2 = UUID.randomUUID();
        UUID assocId3 = UUID.randomUUID();

        SessaoTreinoExercicio assoc1 = SessaoTreinoExercicio.builder()
                .id(assocId1)
                .sessaoTreino(sessao)
                .ordem(1)
                .duracaoMinutos(10)
                .build();
        SessaoTreinoExercicio assoc2 = SessaoTreinoExercicio.builder()
                .id(assocId2)
                .sessaoTreino(sessao)
                .ordem(2)
                .duracaoMinutos(15)
                .build();
        SessaoTreinoExercicio assoc3 = SessaoTreinoExercicio.builder()
                .id(assocId3)
                .sessaoTreino(sessao)
                .ordem(3)
                .duracaoMinutos(20)
                .build();

        sessao.getExercicios().add(assoc1);
        sessao.getExercicios().add(assoc2);
        sessao.getExercicios().add(assoc3);

        when(sessaoTreinoRepository.findById(sessaoId)).thenReturn(Optional.of(sessao));
        when(sessaoTreinoRepository.save(any(SessaoTreino.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act: Reordenar para: 3º -> 1º, 1º -> 2º, 2º -> 3º
        java.util.List<UUID> novaOrdemIds = java.util.List.of(assocId3, assocId1, assocId2);
        SessaoTreino atualizada = sessaoTreinoService.reordenarExercicios(sessaoId, novaOrdemIds);

        // Assert
        assertThat(assoc3.getOrdem()).isEqualTo(1);
        assertThat(assoc1.getOrdem()).isEqualTo(2);
        assertThat(assoc2.getOrdem()).isEqualTo(3);
        verify(sessaoTreinoRepository, times(1)).save(atualizada);
    }
}
