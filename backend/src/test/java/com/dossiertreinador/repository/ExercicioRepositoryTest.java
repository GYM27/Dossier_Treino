package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ExercicioRepositoryTest {

    @Autowired
    private ExercicioRepository exercicioRepository;

    @Test
    void testSalvarEBuscarPorCategoria() {
        // Arrange
        Exercicio ex = Exercicio.builder()
                .nome("Meínhos 4x1")
                .descricao("Clássico aquecimento")
                .categoria(CategoriaExercicio.AQUECIMENTO)
                .nivelDificuldade(2)
                .build();
        
        exercicioRepository.save(ex);

        // Act
        List<Exercicio> aquecimentos = exercicioRepository.findByCategoria(CategoriaExercicio.AQUECIMENTO);

        // Assert
        assertThat(aquecimentos).hasSize(1);
        assertThat(aquecimentos.get(0).getNome()).isEqualTo("Meínhos 4x1");
        // Nota: getDataCriacao() seria null aqui porque o @DataJpaTest não carrega configurações extra de Auditoria por omissão.
    }

    @Test
    void testSalvarEBuscarComJsonb() {
        // Arrange
        java.util.Map<String, Object> dadosTaticos = new java.util.HashMap<>();
        dadosTaticos.put("pitchStyle", "full");
        dadosTaticos.put("isPlaying", false);
        
        java.util.List<String> activePath = new java.util.ArrayList<>();
        activePath.add("root");
        dadosTaticos.put("activePath", activePath);

        Exercicio ex = Exercicio.builder()
                .nome("Transição Rápida")
                .descricao("Exercício de contra-ataque")
                .categoria(CategoriaExercicio.TATICO)
                .nivelDificuldade(4)
                .dadosTaticos(dadosTaticos)
                .build();
        
        ex = exercicioRepository.saveAndFlush(ex);

        // Act
        java.util.Optional<Exercicio> carregado = exercicioRepository.findById(ex.getId());

        // Assert
        assertThat(carregado).isPresent();
        assertThat(carregado.get().getDadosTaticos()).isNotNull();
        assertThat(carregado.get().getDadosTaticos().get("pitchStyle")).isEqualTo("full");
        
        // Verifica se listas internas são preservadas
        @SuppressWarnings("unchecked")
        java.util.List<String> pathRecuperado = (java.util.List<String>) carregado.get().getDadosTaticos().get("activePath");
        assertThat(pathRecuperado).contains("root");
    }
}
