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
}
