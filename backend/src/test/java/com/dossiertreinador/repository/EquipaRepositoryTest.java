package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class EquipaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EquipaRepository equipaRepository;

    @Test
    void deveSalvarEquipaAssociadaAEpoca() {
        // Arrange
        // 1º Como temos um relacionamento (@ManyToOne), não podemos ter uma Equipa sem uma Epoca!
        // Portanto, primeiro criamos a Época e guardamo-la na BD.
        Epoca epoca = Epoca.builder()
                .designacao("2025/2026")
                .dataInicio(LocalDate.of(2025, 7, 1))
                .dataFim(LocalDate.of(2026, 6, 30))
                .build();
        entityManager.persistAndFlush(epoca);

        // 2º Criamos a equipa e colamos a época nela através do construtor
        Equipa equipa = Equipa.builder()
                .nome("Equipa Principal")
                .escalao("Seniores")
                .epoca(epoca)
                .build();

        // Act
        Equipa equipaGuardada = equipaRepository.save(equipa);

        // Assert
        assertThat(equipaGuardada.getId()).isNotNull();
        // Garantimos que a equipa guardada sabe responder qual é o nome da sua época
        assertThat(equipaGuardada.getEpoca().getDesignacao()).isEqualTo("2025/2026");
    }

    @Test
    void deveFalharAoSalvarEquipaSemEpoca() {
        // Arrange (esquecemo-nos da época propositadamente)
        Equipa equipaInvalida = Equipa.builder()
                .nome("Equipa Principal")
                .escalao("Seniores")
                // Sem "epoca"
                .build();

        // Act & Assert
        // O Hibernate não pode deixar gravar uma equipa "órfã". 
        // A nossa regra @NotNull na propriedade 'epoca' da Entidade bloqueia isto com segurança.
        assertThatThrownBy(() -> entityManager.persistAndFlush(equipaInvalida))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("Uma equipa tem de estar associada a uma época");
    }
}
