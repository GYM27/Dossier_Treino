package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Epoca;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Classe de testes para garantir que a gravação das Épocas na Base de Dados
 * obedece a todas as nossas regras de negócio rigorosas.
 */
@DataJpaTest // Magia do Spring: levanta a base de dados H2 e prepara o ambiente para testes JPA.
class EpocaRepositoryTest {

    // Ferramenta que nos permite comunicar com o H2 diretamente para testar os nossos repositórios
    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EpocaRepository epocaRepository;

    @Test
    void deveSalvarEpocaComDadosValidos() {
        // 1. Arrange (Ato de Preparar) - Criamos os nossos dados de teste usando o Padrão Builder
        Epoca novaEpoca = Epoca.builder()
                .designacao("2025/2026")
                .dataInicio(LocalDate.of(2025, 7, 1))
                .dataFim(LocalDate.of(2026, 6, 30))
                // Repara que não definimos o id (será o Postgres/H2 a gerar) nem o isAtiva (deve ser true por defeito)
                .build();

        // 2. Act (Agir) - Ação central do teste: mandar gravar!
        Epoca epocaGuardada = epocaRepository.save(novaEpoca);

        // 3. Assert (Verificar) - Afirmamos o resultado esperado usando o AssertJ (assertThat)
        assertThat(epocaGuardada.getId()).isNotNull(); // A base de dados tem de gerar o ID
        assertThat(epocaGuardada.getDesignacao()).isEqualTo("2025/2026");
        assertThat(epocaGuardada.getIsAtiva()).isTrue(); // Testar se o valor por defeito funcionou!
    }

    @Test
    void deveFalharAoSalvarEpocaSemDesignacao() {
        // 1. Arrange - Criar uma Época inválda (falta a designação)
        Epoca epocaInvalida = Epoca.builder()
                .dataInicio(LocalDate.of(2025, 7, 1))
                .dataFim(LocalDate.of(2026, 6, 30))
                .build();

        // 2 & 3. Act & Assert - Vamos tentar forçar o Hibernate a gravar isto.
        // A nossa anotação @NotBlank na Entidade Epoca deverá intercetar isto e lançar uma exceção de Violação de Regra.
        assertThatThrownBy(() -> entityManager.persistAndFlush(epocaInvalida))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("A designação da época não pode estar vazia");
    }
}
