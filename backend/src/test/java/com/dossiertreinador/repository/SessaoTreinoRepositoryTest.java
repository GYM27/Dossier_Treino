package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.entities.SessaoTreinoExercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;
import com.dossiertreinador.domain.enums.TipoEvento;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class SessaoTreinoRepositoryTest {

    @Autowired
    private SessaoTreinoRepository sessaoTreinoRepository;

    @Autowired
    private EquipaRepository equipaRepository;

    @Autowired
    private ExercicioRepository exercicioRepository;

    @Autowired
    private EpocaRepository epocaRepository;

    @Autowired
    private EventoCalendarioRepository eventoCalendarioRepository;

    private Equipa equipa;
    private Epoca epoca;

    @BeforeEach
    void setUp() {
        epoca = Epoca.builder()
                .designacao("2024/2025")
                .dataInicio(LocalDate.of(2024, 8, 1))
                .dataFim(LocalDate.of(2025, 6, 30))
                .build();
        epocaRepository.save(epoca);
        
        equipa = Equipa.builder()
                .nome("Sub-17")
                .escalao("Formação")
                .epoca(epoca)
                .build();
        equipaRepository.save(equipa);
    }

    @Test
    void testSalvarSessaoComExercicios() {
        // Arrange
        EventoCalendario evento = EventoCalendario.builder()
                .equipa(equipa)
                .tipoEvento(TipoEvento.TREINO)
                .dataHoraInicio(LocalDateTime.now())
                .dataHoraFim(LocalDateTime.now().plusHours(2))
                .descricao("Treino Tático")
                .build();
        eventoCalendarioRepository.save(evento);

        Exercicio ex = Exercicio.builder()
                .nome("Remates")
                .categoria(CategoriaExercicio.TECNICO)
                .build();
        exercicioRepository.save(ex);

        SessaoTreino sessao = SessaoTreino.builder()
                .eventoCalendario(evento)
                .objetivo("Finalização")
                .mesociclo(1)
                .microciclo(1)
                .unidadeTreino(1)
                .periodo("COMPETITIVO")
                .equipa(equipa)
                .build();

        SessaoTreinoExercicio assoc = SessaoTreinoExercicio.builder()
                .sessaoTreino(sessao)
                .exercicio(ex)
                .ordem(1)
                .duracaoMinutos(20)
                .build();

        sessao.getExercicios().add(assoc);
        sessao.setDuracaoTotalMinutos(20);

        // Act
        SessaoTreino savedSessao = sessaoTreinoRepository.save(sessao);
        
        // Assert
        assertThat(savedSessao.getId()).isNotNull();
        assertThat(savedSessao.getPeriodo()).isEqualTo("COMPETITIVO");
        assertThat(savedSessao.getExercicios()).hasSize(1);
        assertThat(savedSessao.getExercicios().get(0).getExercicio().getNome()).isEqualTo("Remates");
        
        List<SessaoTreino> treinos = sessaoTreinoRepository.findByEquipaIdOrderByEventoCalendario_DataHoraInicioDesc(equipa.getId());
        assertThat(treinos).hasSize(1);
    }
}
