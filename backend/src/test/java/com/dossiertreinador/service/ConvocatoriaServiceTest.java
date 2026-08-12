package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.*;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.repository.AtletaRepository;
import com.dossiertreinador.repository.ConvocatoriaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.LesaoRepository;
import com.dossiertreinador.service.impl.ConvocatoriaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConvocatoriaServiceTest {

    @Mock
    private ConvocatoriaRepository convocatoriaRepository;
    @Mock
    private EventoCalendarioRepository eventoRepository;
    @Mock
    private AtletaRepository atletaRepository;
    @Mock
    private LesaoRepository lesaoRepository;

    @InjectMocks
    private ConvocatoriaServiceImpl convocatoriaService;

    private UUID eventoId;
    private UUID atletaAId;
    private UUID atletaBId;
    
    private Equipa equipa;
    private EventoCalendario jogo;
    private Atleta atletaA; // Saudável
    private Atleta atletaB; // Lesionado
    
    private Lesao lesaoAtiva;

    @BeforeEach
    void setUp() {
        eventoId = UUID.randomUUID();
        atletaAId = UUID.randomUUID();
        atletaBId = UUID.randomUUID();
        
        equipa = Equipa.builder().id(UUID.randomUUID()).nome("Sub-17").build();
        
        jogo = EventoCalendario.builder().id(eventoId).equipa(equipa).build();
        
        atletaA = Atleta.builder().id(atletaAId).nome("João").equipa(equipa).build();
        atletaB = Atleta.builder().id(atletaBId).nome("Pedro").equipa(equipa).build();
        
        lesaoAtiva = Lesao.builder().estadoLesao(EstadoLesao.EM_TRATAMENTO).build();
    }

    @Test
    void criarConvocatoria_ComSucesso() {
        // Arrange
        when(eventoRepository.findById(eventoId)).thenReturn(Optional.of(jogo));
        when(atletaRepository.findAllById(List.of(atletaAId))).thenReturn(List.of(atletaA));
        // O João não tem lesões ativas
        when(lesaoRepository.findByAtletaId(atletaAId)).thenReturn(List.of());
        
        when(convocatoriaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Convocatoria resultado = convocatoriaService.criarConvocatoria(eventoId, List.of(atletaAId), 18, "Levar caneleiras", false);

        // Assert
        assertThat(resultado.getAtletasConvocados()).hasSize(1);
        assertThat(resultado.getLimiteConvocados()).isEqualTo(18);
        verify(convocatoriaRepository, times(1)).save(any(Convocatoria.class));
    }

    @Test
    void criarConvocatoria_RejeitaAtletaLesionado_LancaExcecao() {
        // Arrange
        when(eventoRepository.findById(eventoId)).thenReturn(Optional.of(jogo));
        when(atletaRepository.findAllById(List.of(atletaBId))).thenReturn(List.of(atletaB));
        
        // O Pedro tem uma lesão ativa!
        when(lesaoRepository.findByAtletaId(atletaBId)).thenReturn(List.of(lesaoAtiva));

        // Act & Assert
        assertThatThrownBy(() -> convocatoriaService.criarConvocatoria(eventoId, List.of(atletaBId), 18, "", false))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("inapto por lesão");

        verify(convocatoriaRepository, never()).save(any());
    }
    
    @Test
    void criarConvocatoria_AceitaAtletaLesionadoSeForcado_ComSucesso() {
        // Arrange
        when(eventoRepository.findById(eventoId)).thenReturn(Optional.of(jogo));
        when(atletaRepository.findAllById(List.of(atletaBId))).thenReturn(List.of(atletaB));
        // Nota: Não é preciso mockar o lesaoRepository, porque o if (!forcarConvocatoria) salta a query
        
        when(convocatoriaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Act (Passar 'true' na flag)
        Convocatoria resultado = convocatoriaService.criarConvocatoria(eventoId, List.of(atletaBId), 18, "", true);

        // Assert
        assertThat(resultado.getAtletasConvocados()).hasSize(1);
        verify(convocatoriaRepository, times(1)).save(any(Convocatoria.class));
    }

    @Test
    void criarConvocatoria_ExcedeLimite_LancaExcecao() {
        // Arrange
        // Não é preciso fazer mock de repositórios porque a validação do tamanho
        // da lista acontece na primeira linha do método, antes de ir à base de dados.
        
        // Act & Assert (limite de 1, mas mandamos 2)
        assertThatThrownBy(() -> convocatoriaService.criarConvocatoria(eventoId, List.of(atletaAId, atletaBId), 1, "", false))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("excede o limite configurado");
                
        verify(convocatoriaRepository, never()).save(any());
    }

    @Test
    void criarConvocatoria_IdorAtletaDeOutraEquipa_LancaExcecao() {
        // Arrange
        Equipa equipaRival = Equipa.builder().id(UUID.randomUUID()).nome("Rival").build();
        Atleta intruso = Atleta.builder().id(UUID.randomUUID()).nome("Intruso").equipa(equipaRival).build();
        
        when(eventoRepository.findById(eventoId)).thenReturn(Optional.of(jogo));
        when(atletaRepository.findAllById(List.of(intruso.getId()))).thenReturn(List.of(intruso));

        // Act & Assert
        assertThatThrownBy(() -> convocatoriaService.criarConvocatoria(eventoId, List.of(intruso.getId()), 18, "", false))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("não pertence à equipa do evento"); // Bloqueio IDOR!
                
        verify(convocatoriaRepository, never()).save(any());
    }
}
