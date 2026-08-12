package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.LesaoRepository;
import com.dossiertreinador.service.impl.LesaoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LesaoServiceTest {

    @Mock
    private LesaoRepository lesaoRepository;

    @Mock
    private AtletaRepository atletaRepository;

    @InjectMocks
    private LesaoServiceImpl lesaoService;

    private Atleta atleta;
    private Lesao lesao;
    private UUID atletaId;
    private UUID lesaoId;

    @BeforeEach
    void setUp() {
        atletaId = UUID.randomUUID();
        lesaoId = UUID.randomUUID();

        atleta = Atleta.builder()
                .id(atletaId)
                .nome("João")
                .build();

        lesao = Lesao.builder()
                .id(lesaoId)
                .atleta(atleta)
                .descricao("Rotura")
                .dataOcorrencia(LocalDate.now())
                .estadoLesao(EstadoLesao.EM_TRATAMENTO)
                .build();
    }

    @Test
    void registarLesao_ComSucesso() {
        // Arrange
        when(atletaRepository.findById(atletaId)).thenReturn(Optional.of(atleta));
        when(lesaoRepository.save(any(Lesao.class))).thenReturn(lesao);

        // Act
        Lesao novaLesao = lesaoService.registarLesao(atletaId, lesao);

        // Assert
        assertThat(novaLesao).isNotNull();
        assertThat(novaLesao.getAtleta()).isEqualTo(atleta);
        verify(lesaoRepository, times(1)).save(any(Lesao.class));
    }

    @Test
    void registarLesao_AtletaNaoEncontrado_LancaExcecao() {
        // Arrange
        when(atletaRepository.findById(atletaId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> lesaoService.registarLesao(atletaId, lesao))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Atleta não encontrado");

        verify(lesaoRepository, never()).save(any(Lesao.class));
    }

    @Test
    void atualizarEstado_ComSucesso() {
        // Arrange
        when(lesaoRepository.findById(lesaoId)).thenReturn(Optional.of(lesao));
        when(lesaoRepository.save(any(Lesao.class))).thenReturn(lesao);

        // Act
        Lesao lesaoAtualizada = lesaoService.atualizarEstado(lesaoId, EstadoLesao.RECUPERADO);

        // Assert
        assertThat(lesaoAtualizada.getEstadoLesao()).isEqualTo(EstadoLesao.RECUPERADO);
        verify(lesaoRepository, times(1)).save(lesao);
    }
}
