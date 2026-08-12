package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.TipoEvento;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class EventoCalendarioRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EventoCalendarioRepository eventoRepository;

    private Equipa equipa;

    @BeforeEach
    void setup() {
        Epoca epoca = Epoca.builder()
                .designacao("25/26")
                .dataInicio(LocalDate.now())
                .dataFim(LocalDate.now().plusYears(1))
                .build();
        entityManager.persistAndFlush(epoca);

        equipa = Equipa.builder()
                .nome("Equipa Principal")
                .escalao("Seniores")
                .epoca(epoca)
                .build();
        entityManager.persistAndFlush(equipa);
    }

    @Test
    void deveSalvarEventoValido() {
        // Arrange
        EventoCalendario evento = EventoCalendario.builder()
                .tipoEvento(TipoEvento.TREINO)
                // Utilizamos LocalDateTime para gravar ano, mes, dia, HORA e MINUTO.
                .dataHoraInicio(LocalDateTime.of(2025, 10, 15, 10, 0))
                .dataHoraFim(LocalDateTime.of(2025, 10, 15, 11, 30))
                .descricao("Treino de Recuperação")
                .local("Campo 1")
                .equipa(equipa)
                .build();

        // Act
        EventoCalendario salvo = eventoRepository.save(evento);

        // Assert
        assertThat(salvo.getId()).isNotNull();
        assertThat(salvo.getTipoEvento()).isEqualTo(TipoEvento.TREINO);
        assertThat(salvo.getDescricao()).isEqualTo("Treino de Recuperação");
    }
}
