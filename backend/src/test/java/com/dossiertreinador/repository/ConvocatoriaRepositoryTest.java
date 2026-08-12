package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Convocatoria;
import com.dossiertreinador.domain.entities.ConvocatoriaAtleta;
import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import com.dossiertreinador.domain.enums.TipoEvento;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class ConvocatoriaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ConvocatoriaRepository convocatoriaRepository;

    private EventoCalendario jogo;
    private Atleta ronaldo;

    @BeforeEach
    void setUp() {
        Epoca epoca = Epoca.builder()
                .designacao("25/26").dataInicio(LocalDate.now()).dataFim(LocalDate.now().plusMonths(10)).isAtiva(true).build();
        entityManager.persist(epoca);

        Equipa equipa = Equipa.builder().nome("Sub-17").escalao("S17").epoca(epoca).build();
        entityManager.persist(equipa);

        ronaldo = Atleta.builder()
                .nome("Cristiano").dataNascimento(LocalDate.of(2008, 2, 5))
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO).pePreferido(PePreferido.DESTRO)
                .equipa(equipa).build();
        entityManager.persist(ronaldo);

        jogo = EventoCalendario.builder()
                .tipoEvento(TipoEvento.JOGO).dataHoraInicio(LocalDateTime.now())
                .dataHoraFim(LocalDateTime.now().plusHours(2)).equipa(equipa).build();
        entityManager.persist(jogo);
        
        entityManager.flush();
    }

    @Test
    void deveSalvarConvocatoriaComAtletas() {
        // Arrange
        Convocatoria convocatoria = Convocatoria.builder()
                .eventoCalendario(jogo)
                .limiteConvocados(18)
                .dataPublicacao(LocalDateTime.now())
                .build();
                
        ConvocatoriaAtleta convAtleta = ConvocatoriaAtleta.builder()
                .convocatoria(convocatoria)
                .atleta(ronaldo)
                .numeroCamisola(7)
                .build();
                
        convocatoria.getAtletasConvocados().add(convAtleta);

        // Act
        Convocatoria salva = convocatoriaRepository.save(convocatoria);
        entityManager.flush();
        entityManager.clear();

        // Assert
        Optional<Convocatoria> encontrada = convocatoriaRepository.findById(salva.getId());
        assertThat(encontrada).isPresent();
        assertThat(encontrada.get().getAtletasConvocados()).hasSize(1);
        assertThat(encontrada.get().getAtletasConvocados().get(0).getAtleta().getNome()).isEqualTo("Cristiano");
    }

    @Test
    void naoDevePermitirOMesmoAtletaDuasVezes() {
        // Arrange
        Convocatoria convocatoria = Convocatoria.builder()
                .eventoCalendario(jogo)
                .limiteConvocados(18)
                .dataPublicacao(LocalDateTime.now())
                .build();
                
        ConvocatoriaAtleta c1 = ConvocatoriaAtleta.builder().convocatoria(convocatoria).atleta(ronaldo).build();
        ConvocatoriaAtleta c2 = ConvocatoriaAtleta.builder().convocatoria(convocatoria).atleta(ronaldo).build();
                
        convocatoria.getAtletasConvocados().add(c1);
        convocatoria.getAtletasConvocados().add(c2);

        // Act & Assert
        assertThatThrownBy(() -> {
            convocatoriaRepository.saveAndFlush(convocatoria);
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
