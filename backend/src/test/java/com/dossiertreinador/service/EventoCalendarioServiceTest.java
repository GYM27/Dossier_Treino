package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.*;
import com.dossiertreinador.domain.enums.*;
import com.dossiertreinador.repository.*;
import com.dossiertreinador.service.impl.EventoCalendarioServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventoCalendarioServiceTest {

    // PREPARAÇÃO DOS MOCKS (Os bonecos falsos)
    @Mock
    private EventoCalendarioRepository eventoRepository;

    @Mock
    private AtletaRepository atletaRepository;

    @Mock
    private RegistoAssiduidadeRepository registoRepository;

    @Mock
    private SessaoTreinoRepository sessaoTreinoRepository;

    // INJEÇÃO DOS MOCKS NO CÉREBRO
    @InjectMocks
    private EventoCalendarioServiceImpl eventoService;

    // O CAPTOR: Um "espião" do Mockito que apanha as listas que são passadas
    // aos métodos, para depois verificarmos o que está lá dentro.
    @Captor
    private ArgumentCaptor<List<RegistoAssiduidade>> captorListaRegistos;

    @Test
    void deveRegistarEventoEGerarGrelhaDeAssiduidade() {
        // --- 1. ARRANGE (Ato de Preparar) ---
        Equipa equipa = Equipa.builder().id(UUID.randomUUID()).build();
        
        EventoCalendario eventoNovo = EventoCalendario.builder()
                .tipoEvento(TipoEvento.TREINO)
                .dataHoraInicio(LocalDateTime.now())
                .dataHoraFim(LocalDateTime.now().plusHours(2))
                .equipa(equipa)
                .build();
                
        EventoCalendario eventoGravado = EventoCalendario.builder()
                .id(UUID.randomUUID()) // Fingimos que a BD devolveu com ID
                .tipoEvento(TipoEvento.TREINO)
                .equipa(equipa)
                .build();

        Atleta a1 = Atleta.builder().id(UUID.randomUUID()).nome("João").build();
        Atleta a2 = Atleta.builder().id(UUID.randomUUID()).nome("Maria").build();

        // Ensinamos os nossos bonecos:
        when(eventoRepository.save(eventoNovo)).thenReturn(eventoGravado);
        when(atletaRepository.findByEquipaId(equipa.getId())).thenReturn(List.of(a1, a2));

        // --- 2. ACT (Agir) ---
        EventoCalendario resultado = eventoService.registarEventoEGerarGrelha(eventoNovo);

        // --- 3. ASSERT (Verificar) ---
        assertThat(resultado).isNotNull();
        
        // Verificação 1: O serviço chamou o saveAll (Batch Insert) da assiduidade exatamente 1 vez?
        // E, pelo caminho, o nosso espião (captor) apanha a lista de registos que ia ser gravada!
        verify(registoRepository, times(1)).saveAll(captorListaRegistos.capture());
        
        List<RegistoAssiduidade> grelhaGerada = captorListaRegistos.getValue();
        
        // Verificação 2: A grelha tem de ter 2 registos, porque a equipa tem 2 atletas (João e Maria)
        assertThat(grelhaGerada).hasSize(2);
        
        // Verificação 3: Regra de negócio - por defeito todos os atletas começam como PRESENTE no novo treino
        assertThat(grelhaGerada.get(0).getTipoAssiduidade()).isEqualTo(TipoAssiduidade.PRESENTE);
        assertThat(grelhaGerada.get(1).getTipoAssiduidade()).isEqualTo(TipoAssiduidade.PRESENTE);
    }
}
