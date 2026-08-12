package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Testes (TDD) para validar a gravação e as regras do Utilizador.
 */
@DataJpaTest
class UtilizadorRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Test
    void deveSalvarUtilizadorComDadosValidos() {
        // Arrange
        Utilizador treinador = Utilizador.builder()
                .nomeCompleto("José Mourinho")
                .email("jose@clube.pt")
                .passwordHash("12345")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        // Act
        Utilizador treinadorGuardado = utilizadorRepository.save(treinador);

        // Assert
        assertThat(treinadorGuardado.getId()).isNotNull();
        assertThat(treinadorGuardado.getNomeCompleto()).isEqualTo("José Mourinho");
        assertThat(treinadorGuardado.getCargo()).isEqualTo(Cargo.TREINADOR_PRINCIPAL);
    }

    @Test
    void deveFalharAoSalvarUtilizadorSemEmail() {
        // Arrange (esquecemo-nos do email de propósito)
        Utilizador invalido = Utilizador.builder()
                .nomeCompleto("Mourinho")
                .passwordHash("12345")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        // Act & Assert
        // A nossa anotação @NotBlank no email deve atuar e rebentar!
        assertThatThrownBy(() -> entityManager.persistAndFlush(invalido))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("O email é obrigatório");
    }

    @Test
    void deveFalharAoSalvarUtilizadorComEmailInvalido() {
        // Arrange (email mal escrito, sem o '@')
        Utilizador invalido = Utilizador.builder()
                .nomeCompleto("Mourinho")
                .email("jose-clube-pt")
                .passwordHash("12345")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        // Act & Assert
        // A nossa anotação @Email da framework Validation tem de apanhar isto!
        assertThatThrownBy(() -> entityManager.persistAndFlush(invalido))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("Formato de email inválido");
    }

    @Test
    void deveFalharAoSalvarEmailsDuplicados() {
        // Arrange - Criamos Dois users e tentamos atribuir-lhes O MESMO EMAIL
        Utilizador user1 = Utilizador.builder()
                .nomeCompleto("Mourinho")
                .email("geral@clube.pt")
                .passwordHash("12345")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();
        entityManager.persistAndFlush(user1); // Gravamos o primeiro e a BD aceita.

        Utilizador user2 = Utilizador.builder()
                .nomeCompleto("Rui")
                .email("geral@clube.pt") // O mesmo email!
                .passwordHash("12345")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_ADJUNTO)
                .build();

        // Act & Assert
        // O H2 tem de gritar devido ao "unique = true" que metemos no @Column da entidade.
        // Ao usar o repositório diretamente (saveAndFlush), o Spring traduz o erro 
        // de base de dados (Postgres/H2) para uma DataIntegrityViolationException amigável.
        assertThatThrownBy(() -> utilizadorRepository.saveAndFlush(user2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
