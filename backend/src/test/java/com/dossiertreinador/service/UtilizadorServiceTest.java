package com.dossiertreinador.service;

import com.dossiertreinador.domain.dtos.UtilizadorUpdateDTO;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.repository.UtilizadorRepository;
import com.dossiertreinador.service.impl.UtilizadorServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UtilizadorServiceTest {

    @Mock
    private UtilizadorRepository utilizadorRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UtilizadorServiceImpl utilizadorService;

    @Test
    @DisplayName("Deve atualizar o nome do utilizador com sucesso")
    void deveAtualizarNomeComSucesso() {
        Utilizador utilizadorLogado = Utilizador.builder()
                .nomeCompleto("João Antigo")
                .passwordHash("hash_antiga")
                .build();

        UtilizadorUpdateDTO dto = UtilizadorUpdateDTO.builder()
                .nomeCompleto("João Novo")
                .build();

        when(utilizadorRepository.save(any(Utilizador.class))).thenAnswer(i -> i.getArguments()[0]);

        Utilizador resultado = utilizadorService.atualizarPerfil(utilizadorLogado, dto);

        assertEquals("João Novo", resultado.getNomeCompleto());
        assertEquals("hash_antiga", resultado.getPasswordHash()); // Password não alterada
        verify(utilizadorRepository, times(1)).save(any(Utilizador.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Deve atualizar nome e password se password for fornecida")
    void deveAtualizarNomeEPasswordComSucesso() {
        Utilizador utilizadorLogado = Utilizador.builder()
                .nomeCompleto("João Antigo")
                .passwordHash("hash_antiga")
                .build();

        UtilizadorUpdateDTO dto = UtilizadorUpdateDTO.builder()
                .nomeCompleto("João Novo")
                .novaPassword("passwordNova123")
                .build();

        when(passwordEncoder.encode("passwordNova123")).thenReturn("nova_hash_criptografada");
        when(utilizadorRepository.save(any(Utilizador.class))).thenAnswer(i -> i.getArguments()[0]);

        Utilizador resultado = utilizadorService.atualizarPerfil(utilizadorLogado, dto);

        assertEquals("João Novo", resultado.getNomeCompleto());
        assertEquals("nova_hash_criptografada", resultado.getPasswordHash());
        verify(passwordEncoder, times(1)).encode("passwordNova123");
    }
}
