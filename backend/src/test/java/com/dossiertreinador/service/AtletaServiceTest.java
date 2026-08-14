package com.dossiertreinador.service;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.repository.AtletaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
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

    @Test
    void deveAtualizarAtletaComSucesso() {
        // ARRANGE
        UUID atletaId = UUID.randomUUID();
        Atleta atletaNaBaseDeDados = Atleta.builder()
                .id(atletaId)
                .nome("Pepe")
                .numeroCamisola(3)
                .pesoKg(80.0)
                .build();
                
        Atleta atletaAtualizado = Atleta.builder()
                .nome("Pepe Atualizado")
                .numeroCamisola(4)
                .pesoKg(79.0)
                .build();

        when(atletaRepository.findById(atletaId)).thenReturn(Optional.of(atletaNaBaseDeDados));
        when(atletaRepository.save(any(Atleta.class))).thenAnswer(i -> i.getArguments()[0]);

        // ACT
        Atleta resultado = atletaService.atualizarAtleta(atletaId, atletaAtualizado);

        // ASSERT
        assertThat(resultado.getNome()).isEqualTo("Pepe Atualizado");
        assertThat(resultado.getNumeroCamisola()).isEqualTo(4);
        assertThat(resultado.getPesoKg()).isEqualTo(79.0);
        verify(atletaRepository, times(1)).findById(atletaId);
        verify(atletaRepository, times(1)).save(atletaNaBaseDeDados); // A instância da BD é alterada e guardada
    }

    @Test
    void deveLancarExcecaoAoAtualizarAtletaNaoExistente() {
        UUID atletaId = UUID.randomUUID();
        Atleta atletaAtualizado = Atleta.builder().nome("Pepe").build();

        when(atletaRepository.findById(atletaId)).thenReturn(Optional.empty());

        try {
            atletaService.atualizarAtleta(atletaId, atletaAtualizado);
        } catch (IllegalArgumentException e) {
            assertThat(e.getMessage()).isEqualTo("Atleta não encontrado!");
        }

        verify(atletaRepository, never()).save(any(Atleta.class));
    }
}
