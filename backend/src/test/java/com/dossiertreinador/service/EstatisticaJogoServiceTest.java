package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.TipoEstatistica;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.EstatisticaJogoRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.service.impl.EstatisticaJogoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EstatisticaJogoServiceTest {

    @Mock
    private EstatisticaJogoRepository estatisticaRepository;
    @Mock
    private EventoCalendarioRepository eventoRepository;
    @Mock
    private AtletaRepository atletaRepository;

    @InjectMocks
    private EstatisticaJogoServiceImpl estatisticaService;

    private UUID eventoId;
    private UUID atletaId;
    
    private Equipa equipa;
    private EventoCalendario jogo;
    private Atleta atleta;

    @BeforeEach
    void setUp() {
        eventoId = UUID.randomUUID();
        atletaId = UUID.randomUUID();
        
        equipa = Equipa.builder().id(UUID.randomUUID()).nome("Sub-17").build();
        
        jogo = EventoCalendario.builder().id(eventoId).equipa(equipa).build();
        atleta = Atleta.builder().id(atletaId).nome("João").equipa(equipa).build();
    }

    @Test
    void registarEstatistica_ComSucesso() {
        // Arrange
        when(eventoRepository.findById(eventoId)).thenReturn(Optional.of(jogo));
        when(atletaRepository.findById(atletaId)).thenReturn(Optional.of(atleta));
        when(estatisticaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Act
        EstatisticaJogo resultado = estatisticaService.registarEstatistica(
                eventoId, atletaId, TipoEstatistica.GOLO, 1, "45", "Golo de penálti");

        // Assert
        assertThat(resultado.getTipoEstatistica()).isEqualTo(TipoEstatistica.GOLO);
        assertThat(resultado.getValor()).isEqualTo(1);
        assertThat(resultado.getMinuto()).isEqualTo("45");
        verify(estatisticaRepository, times(1)).save(any(EstatisticaJogo.class));
    }

    @Test
    void registarEstatistica_IdorBloqueado_AtletaDeOutraEquipa() {
        // Arrange
        Equipa rival = Equipa.builder().id(UUID.randomUUID()).nome("Rival").build();
        Atleta intruso = Atleta.builder().id(UUID.randomUUID()).nome("Intruso").equipa(rival).build();
        
        when(eventoRepository.findById(eventoId)).thenReturn(Optional.of(jogo));
        when(atletaRepository.findById(intruso.getId())).thenReturn(Optional.of(intruso));

        // Act & Assert
        assertThatThrownBy(() -> estatisticaService.registarEstatistica(
                eventoId, intruso.getId(), TipoEstatistica.GOLO, 1, null, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("não pertence à equipa");

        verify(estatisticaRepository, never()).save(any());
    }
}
