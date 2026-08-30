package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.service.impl.EquipaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EquipaServiceTest {

    @Mock
    private EquipaRepository equipaRepository;

    @Mock
    private com.dossiertreinador.repository.EpocaRepository epocaRepository;

    @InjectMocks
    private EquipaServiceImpl equipaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deveCriarEquipaComSucesso_SeForTreinadorPrincipal() {
        // Arrange: Preparamos o cenário
        Utilizador treinadorPrincipal = Utilizador.builder()
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();
        
        Equipa novaEquipa = Equipa.builder()
                .nome("Seniores")
                .escalao("A")
                .build();
                
        com.dossiertreinador.domain.entities.Epoca mockEpoca = com.dossiertreinador.domain.entities.Epoca.builder()
                .designacao("2024/2025")
                .build();

        when(epocaRepository.findAll()).thenReturn(java.util.List.of(mockEpoca));
        when(equipaRepository.save(any(Equipa.class))).thenReturn(novaEquipa);

        // Act: Executamos a ação
        Equipa equipaGuardada = equipaService.criarEquipa(novaEquipa, "2024/2025", treinadorPrincipal);

        // Assert: Verificamos o resultado
        assertNotNull(equipaGuardada);
        assertEquals("Seniores", equipaGuardada.getNome());
        verify(equipaRepository, times(1)).save(any(Equipa.class));
    }

    @Test
    void deveDarErro403_SeNaoForTreinadorPrincipal() {
        // Arrange: Preparamos um utilizador que NÃO é Treinador Principal
        Utilizador treinadorAdjunto = Utilizador.builder()
                .cargo(Cargo.TREINADOR_ADJUNTO)
                .build();
        
        Equipa novaEquipa = Equipa.builder()
                .nome("Seniores")
                .build();

        // Act & Assert: Garantimos que o sistema atira a exceção correta e NUNCA grava!
        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            equipaService.criarEquipa(novaEquipa, "2024/2025", treinadorAdjunto);
        });
        
        assertEquals("Apenas o Treinador Principal pode criar equipas.", exception.getMessage());
        verify(equipaRepository, never()).save(any(Equipa.class));
    }

    @Test
    void deveAtualizarEquipaComSucesso() {
        // Arrange
        java.util.UUID equipaId = java.util.UUID.randomUUID();
        Equipa equipaExistente = Equipa.builder()
                .id(equipaId)
                .nome("União")
                .escalao("Sub-17")
                .modalidade("Futebol")
                .duracaoJogo("40' + 40'")
                .numeroJogadores("Futebol 11")
                .emblemaUrl("https://example.com/old.png")
                .build();

        Equipa dadosAtualizados = Equipa.builder()
                .nome("União 1919")
                .escalao("Sub-19")
                .modalidade("Futebol 11")
                .duracaoJogo("45' + 45'")
                .numeroJogadores("Futebol 11")
                .emblemaUrl("https://example.com/new.png")
                .build();

        when(equipaRepository.findById(equipaId)).thenReturn(java.util.Optional.of(equipaExistente));
        when(equipaRepository.save(any(Equipa.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Equipa resultado = equipaService.atualizarEquipa(equipaId, dadosAtualizados);

        // Assert
        assertNotNull(resultado);
        assertEquals("União 1919", resultado.getNome());
        assertEquals("Sub-19", resultado.getEscalao());
        assertEquals("Futebol 11", resultado.getModalidade());
        assertEquals("45' + 45'", resultado.getDuracaoJogo());
        assertEquals("https://example.com/new.png", resultado.getEmblemaUrl());
        verify(equipaRepository, times(1)).save(equipaExistente);
    }
}
