package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.TipoEstatistica;
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
class EstatisticaJogoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EstatisticaJogoRepository repository;

    private Atleta ronaldo;
    private Epoca epoca;

    @BeforeEach
    void setUp() {
        epoca = Epoca.builder().designacao("25/26").dataInicio(LocalDate.now()).dataFim(LocalDate.now().plusMonths(10)).isAtiva(true).build();
        entityManager.persist(epoca);

        Equipa equipa = Equipa.builder().nome("Sub-17").escalao("S17").epoca(epoca).build();
        entityManager.persist(equipa);

        ronaldo = Atleta.builder()
                .nome("Ronaldo")
                .dataNascimento(LocalDate.of(2008, 2, 5))
                .posicaoPrincipal(com.dossiertreinador.domain.enums.Posicao.AVANCADO_CENTRO)
                .pePreferido(com.dossiertreinador.domain.enums.PePreferido.DESTRO)
                .equipa(equipa)
                .build();
        entityManager.persist(ronaldo);

        EventoCalendario jogo1 = EventoCalendario.builder()
                .tipoEvento(TipoEvento.JOGO).dataHoraInicio(LocalDateTime.now())
                .dataHoraFim(LocalDateTime.now().plusHours(2)).equipa(equipa).build();
        entityManager.persist(jogo1);

        EventoCalendario jogo2 = EventoCalendario.builder()
                .tipoEvento(TipoEvento.JOGO).dataHoraInicio(LocalDateTime.now().plusDays(7))
                .dataHoraFim(LocalDateTime.now().plusDays(7).plusHours(2)).equipa(equipa).build();
        entityManager.persist(jogo2);

        // Ronaldo marca 1 golo no Jogo 1
        EstatisticaJogo stat1 = EstatisticaJogo.builder()
                .eventoCalendario(jogo1).atleta(ronaldo).tipoEstatistica(TipoEstatistica.GOLO).valor(1).build();
        entityManager.persist(stat1);

        // Ronaldo marca 2 golos no Jogo 2
        EstatisticaJogo stat2 = EstatisticaJogo.builder()
                .eventoCalendario(jogo2).atleta(ronaldo).tipoEstatistica(TipoEstatistica.GOLO).valor(2).build();
        entityManager.persist(stat2);
        
        // Ronaldo leva 1 amarelo no Jogo 2
        EstatisticaJogo stat3 = EstatisticaJogo.builder()
                .eventoCalendario(jogo2).atleta(ronaldo).tipoEstatistica(TipoEstatistica.CARTAO_AMARELO).valor(1).build();
        entityManager.persist(stat3);

        entityManager.flush();
    }

    @Test
    void deveSomarGolosNaEpocaCorretamente() {
        // Act
        Integer totalGolos = repository.somarEstatisticaPorAtletaEEpoca(ronaldo.getId(), TipoEstatistica.GOLO, epoca.getId());
        
        // Assert
        assertThat(totalGolos).isEqualTo(3); // 1 + 2 = 3 golos
    }
    
    @Test
    void deveRetornarZeroSeNaoTiverEstatistica() {
        // Act
        Integer cartoesVermelhos = repository.somarEstatisticaPorAtletaEEpoca(ronaldo.getId(), TipoEstatistica.CARTAO_VERMELHO, epoca.getId());
        
        // Assert
        assertThat(cartoesVermelhos).isEqualTo(0);
    }
}
