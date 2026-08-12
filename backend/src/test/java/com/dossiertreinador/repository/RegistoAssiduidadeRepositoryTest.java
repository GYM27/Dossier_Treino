package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.*;
import com.dossiertreinador.domain.enums.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class RegistoAssiduidadeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private RegistoAssiduidadeRepository registoRepository;

    private EventoCalendario evento;
    private Atleta atleta;

    // No @BeforeEach, vemos a verdadeira "árvore de dependências" da nossa BD:
    // Para ter um Registo, precisamos de um Evento e de um Atleta.
    // Para ter um Evento e um Atleta, precisamos de uma Equipa.
    // Para ter uma Equipa, precisamos de uma Época!
    @BeforeEach
    void setup() {
        Epoca epoca = Epoca.builder().designacao("25/26").dataInicio(LocalDate.now()).dataFim(LocalDate.now().plusYears(1)).build();
        entityManager.persistAndFlush(epoca);

        Equipa equipa = Equipa.builder().nome("Equipa Principal").escalao("Seniores").epoca(epoca).build();
        entityManager.persistAndFlush(equipa);

        atleta = Atleta.builder()
                .nome("Ronaldo")
                .dataNascimento(LocalDate.of(1985, 2, 5))
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO)
                .pePreferido(PePreferido.DESTRO)
                .equipa(equipa)
                .build();
        entityManager.persistAndFlush(atleta);

        evento = EventoCalendario.builder()
                .tipoEvento(TipoEvento.TREINO)
                .dataHoraInicio(LocalDateTime.now())
                .dataHoraFim(LocalDateTime.now().plusHours(1))
                .equipa(equipa)
                .build();
        entityManager.persistAndFlush(evento);
    }

    @Test
    void deveSalvarRegistoAssiduidade() {
        // Arrange
        RegistoAssiduidade registo = RegistoAssiduidade.builder()
                .evento(evento)
                .atleta(atleta)
                .tipoAssiduidade(TipoAssiduidade.PRESENTE)
                .build();

        // Act
        RegistoAssiduidade salvo = registoRepository.save(registo);

        // Assert
        assertThat(salvo.getId()).isNotNull();
        assertThat(salvo.getTipoAssiduidade()).isEqualTo(TipoAssiduidade.PRESENTE);
    }

    @Test
    void deveFalharSeGravarMesmoAtletaNoMesmoEvento() {
        // Arrange - Gravamos o 1º Registo (O atleta esteve presente)
        RegistoAssiduidade registo1 = RegistoAssiduidade.builder()
                .evento(evento)
                .atleta(atleta)
                .tipoAssiduidade(TipoAssiduidade.PRESENTE)
                .build();
        registoRepository.saveAndFlush(registo1);

        // Act & Assert - Tentamos gravar um 2º Registo para o mesmo atleta no mesmo evento (Ex: Dizer que também esteve AUSENTE)
        RegistoAssiduidade registoDuplicado = RegistoAssiduidade.builder()
                .evento(evento)
                .atleta(atleta)
                .tipoAssiduidade(TipoAssiduidade.AUSENTE)
                .build();

        // A base de dados tem de gritar! O nosso constrangimento @UniqueConstraint em RegistoAssiduidade.java
        // garante matematicamente que é impossível haver duplicação.
        assertThatThrownBy(() -> registoRepository.saveAndFlush(registoDuplicado))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveProcurarAssiduidadeMensalDoAtletaComJPQL() {
        // Arrange - Vamos criar um registo de assiduidade no nosso Evento do Setup (que foi definido com data de HOJE)
        RegistoAssiduidade registo = RegistoAssiduidade.builder()
                .evento(evento)
                .atleta(atleta)
                .tipoAssiduidade(TipoAssiduidade.PRESENTE)
                .build();
        registoRepository.save(registo);

        // Vamos criar a janela temporal de pesquisa (o mês atual inteiro)
        LocalDateTime inicioDoMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimDoMes = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay().minusSeconds(1);

        // Act - Disparamos a nossa Query JPQL customizada
        var listaDePresencas = registoRepository.findPresencasDoAtletaNoMes(atleta.getId(), inicioDoMes, fimDoMes);

        // Assert
        assertThat(listaDePresencas).isNotEmpty();
        assertThat(listaDePresencas).hasSize(1);
        assertThat(listaDePresencas.get(0).getAtleta().getNome()).isEqualTo("Ronaldo");
        assertThat(listaDePresencas.get(0).getTipoAssiduidade()).isEqualTo(TipoAssiduidade.PRESENTE);
    }
}
