package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class AtletaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AtletaRepository atletaRepository;

    private Equipa equipaDeTeste;

    // A anotação @BeforeEach faz com que este bloco de código corra ANTES de cada teste.
    // Assim, não temos de andar a criar uma Epoca e Equipa em todos os métodos!
    // Mantemos o nosso código de testes limpo e sem duplicação (Regra DRY - Don't Repeat Yourself).
    @BeforeEach
    void setup() {
        Epoca epoca = Epoca.builder()
                .designacao("25/26")
                .dataInicio(LocalDate.now())
                .dataFim(LocalDate.now().plusYears(1))
                .build();
        entityManager.persistAndFlush(epoca);

        equipaDeTeste = Equipa.builder()
                .nome("Equipa de Teste")
                .escalao("Seniores")
                .epoca(epoca)
                .build();
        entityManager.persistAndFlush(equipaDeTeste);
    }

    @Test
    void deveSalvarAtletaValido() {
        // Arrange
        Atleta ronaldo = Atleta.builder()
                .nome("Cristiano Ronaldo")
                .dataNascimento(LocalDate.of(1985, 2, 5))
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO)
                .pePreferido(PePreferido.DESTRO)
                .alturaCm(187)
                .pesoKg(83.0)
                .equipa(equipaDeTeste) // Usamos a equipa criada no setup!
                .build();

        // Act
        Atleta salvo = atletaRepository.save(ronaldo);

        // Assert
        assertThat(salvo.getId()).isNotNull();
        assertThat(salvo.getNome()).isEqualTo("Cristiano Ronaldo");
    }

    @Test
    void deveFalharSeDataNascimentoNoFuturo() {
        // Arrange
        Atleta viajanteNoTempo = Atleta.builder()
                .nome("John Connor")
                .dataNascimento(LocalDate.now().plusDays(1)) // Oops! Nasce amanhã.
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO)
                .pePreferido(PePreferido.DESTRO)
                .equipa(equipaDeTeste)
                .build();

        // Act & Assert
        // A nossa anotação @Past na Entidade tem de bloquear a entrada.
        assertThatThrownBy(() -> entityManager.persistAndFlush(viajanteNoTempo))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("A data de nascimento tem de estar no passado");
    }

    @Test
    void deveFalharSeAlturaInvalida() {
        // Arrange
        Atleta gigante = Atleta.builder()
                .nome("Golias")
                .dataNascimento(LocalDate.of(1990, 1, 1))
                .posicaoPrincipal(Posicao.DEFESA_CENTRAL)
                .pePreferido(PePreferido.DESTRO)
                .alturaCm(300) // 3 metros! O nosso limite @Max é 250cm.
                .equipa(equipaDeTeste)
                .build();

        // Act & Assert
        // A nossa anotação @Max tem de atuar aqui e proteger a integridade dos dados
        assertThatThrownBy(() -> entityManager.persistAndFlush(gigante))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("Altura máxima irreal");
    }
}
