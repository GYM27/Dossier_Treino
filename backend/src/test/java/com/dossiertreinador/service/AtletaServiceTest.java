package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.repository.AtletaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * A anotação @ExtendWith(MockitoExtension.class) é o que liga o "Fingimento" ao JUnit.
 * Ela diz ao motor de testes que não vamos usar bases de dados, vamos usar ilusões (Mocks).
 */
@ExtendWith(MockitoExtension.class)
class AtletaServiceTest {

    // 1. @Mock: Estamos a criar uma marioneta. O Spring NÃO vai usar o verdadeiro AtletaRepository.
    // Vai usar um boneco vazio que nós vamos controlar no teste.
    @Mock
    private AtletaRepository atletaRepository;

    // 2. @InjectMocks: O Cérebro! Estamos a dizer: "Cria a verdadeira classe de implementação,
    // mas lá dentro, injeta o nosso boneco falso (o Mock do repositório) em vez do verdadeiro".
    @InjectMocks
    private com.dossiertreinador.service.impl.AtletaServiceImpl atletaService;

    @Test
    void deveRegistarNovoAtletaComSucesso() {
        // --- 1. ARRANGE (Ato de Preparar) ---
        Atleta novoAtleta = Atleta.builder().nome("Pepe").build();
        
        Atleta atletaFalsoDevolvidoPelaBD = Atleta.builder()
                .id(UUID.randomUUID()) // A BD geraria o ID, então fingimos que tem um.
                .nome("Pepe")
                .build();

        // Ensinamos o boneco (Mock) a falar!
        // "Quando chamarem o teu método .save() com qualquer Atleta, devolve o atletaFalsoDevolvidoPelaBD"
        when(atletaRepository.save(any(Atleta.class))).thenReturn(atletaFalsoDevolvidoPelaBD);

        // --- 2. ACT (Agir) ---
        // O nosso Service vai fazer o seu trabalho, sem saber que o Repositório lá dentro é falso.
        Atleta resultado = atletaService.registarNovoAtleta(novoAtleta);

        // --- 3. ASSERT (Verificar) ---
        assertThat(resultado.getId()).isNotNull();
        assertThat(resultado.getNome()).isEqualTo("Pepe");

        // VERIFICAÇÃO CRÍTICA DO MOCKITO:
        // Perguntamos ao boneco: "O Service chamou-te 1 vez usando o método save()?"
        // Isto garante que a lógica do Cérebro (Service) não se esqueceu de mandar gravar na BD.
        verify(atletaRepository, times(1)).save(novoAtleta);
    }
}
