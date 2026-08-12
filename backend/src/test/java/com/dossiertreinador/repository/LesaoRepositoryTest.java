package com.dossiertreinador.repository;

import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import com.dossiertreinador.domain.enums.TipoLesao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import com.dossiertreinador.config.JpaAuditConfig;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes TDD para o LesaoRepository.
 * Usamos a BD em memória H2 para testar as queries.
 *
 * @BeforeEach: Antes de CADA teste, montamos o cenário completo na BD:
 * Uma Época → Uma Equipa → Dois Atletas → Lesões com estados diferentes.
 */
@DataJpaTest
@Import(JpaAuditConfig.class) // Garante que a configuração de auditoria é carregada no teste
class LesaoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LesaoRepository lesaoRepository;

    // Variáveis de cenário (montadas no @BeforeEach)
    private Atleta atletaLesionado;
    private Atleta atletaSaudavel;
    private Equipa equipa;

    @BeforeEach
    void montarCenario() {
        // 1. Criamos a hierarquia completa: Época → Equipa → 2 Atletas
        Epoca epoca = Epoca.builder()
                .designacao("2025/2026")
                .dataInicio(LocalDate.of(2025, 7, 1))
                .dataFim(LocalDate.of(2026, 6, 30))
                .isAtiva(true)
                .build();
        entityManager.persist(epoca);

        equipa = Equipa.builder()
                .nome("Sub-17").escalao("Sub-17").epoca(epoca)
                .build();
        entityManager.persist(equipa);

        atletaLesionado = Atleta.builder()
                .nome("João Silva")
                .dataNascimento(LocalDate.of(2008, 3, 15))
                .posicaoPrincipal(Posicao.DEFESA_CENTRAL)
                .pePreferido(PePreferido.DESTRO)
                .equipa(equipa)
                .build();
        entityManager.persist(atletaLesionado);

        atletaSaudavel = Atleta.builder()
                .nome("Pedro Santos")
                .dataNascimento(LocalDate.of(2008, 7, 22))
                .posicaoPrincipal(Posicao.MEDIO_CENTRO)
                .pePreferido(PePreferido.CANHOTO)
                .equipa(equipa)
                .build();
        entityManager.persist(atletaSaudavel);

        // 2. Criamos 2 lesões para o João: uma ativa e outra já recuperada
        // NOTA IMPORTANTE: Usamos lesaoRepository.save() em vez de entityManager.persist()
        // porque a auditoria (@CreatedBy, @CreatedDate) SÓ funciona quando
        // a entidade passa pelo Spring Data JPA (que ativa o AuditingEntityListener).
        Lesao lesaoAtiva = Lesao.builder()
                .atleta(atletaLesionado)
                .tipoLesao(TipoLesao.MUSCULAR)
                .descricao("Rotura de fibras no adutor direito")
                .dataOcorrencia(LocalDate.of(2025, 10, 5))
                .dataRetornoPrevista(LocalDate.of(2025, 11, 1))
                .estadoLesao(EstadoLesao.EM_TRATAMENTO) // ATIVO!
                .build();
        lesaoRepository.save(lesaoAtiva);

        Lesao lesaoAntiga = Lesao.builder()
                .atleta(atletaLesionado)
                .tipoLesao(TipoLesao.ARTICULAR)
                .descricao("Entorse do tornozelo esquerdo")
                .dataOcorrencia(LocalDate.of(2025, 8, 10))
                .estadoLesao(EstadoLesao.RECUPERADO) // JÁ CURADO!
                .build();
        lesaoRepository.save(lesaoAntiga);

        entityManager.flush(); // Força a gravação na BD H2
    }

    @Test
    void deveRetornarHistoricoCompletoDeLesoesDoAtleta() {
        // Act - Pedimos TODAS as lesões do João (ativas e recuperadas)
        List<Lesao> historico = lesaoRepository.findByAtletaId(atletaLesionado.getId());

        // Assert - O João tem 2 registos no histórico clínico
        assertThat(historico).hasSize(2);
    }

    @Test
    void deveRetornarApenasLesionadosAtivosDaEquipa() {
        // Act - Pedimos os lesionados da equipa que NÃO estão RECUPERADOS
        List<Lesao> lesionadosAtivos = lesaoRepository
                .findByAtletaEquipaIdAndEstadoLesaoNot(equipa.getId(), EstadoLesao.RECUPERADO);

        // Assert - Só o João tem uma lesão ativa (EM_TRATAMENTO)
        // A lesão antiga dele (RECUPERADO) é filtrada pelo "Not"
        // O Pedro (saudável) nem aparece porque não tem lesões
        assertThat(lesionadosAtivos).hasSize(1);
        assertThat(lesionadosAtivos.get(0).getAtleta().getNome()).isEqualTo("João Silva");
        assertThat(lesionadosAtivos.get(0).getEstadoLesao()).isEqualTo(EstadoLesao.EM_TRATAMENTO);
    }

    @Test
    void deveRetornarListaVaziaQuandoNinguemEstaLesionado() {
        // Arrange - Vamos "curar" a lesão ativa do João
        List<Lesao> lesoes = lesaoRepository.findByAtletaId(atletaLesionado.getId());
        lesoes.forEach(l -> l.setEstadoLesao(EstadoLesao.RECUPERADO));
        lesaoRepository.saveAll(lesoes);

        // Act - Procuramos lesionados ativos
        List<Lesao> lesionadosAtivos = lesaoRepository
                .findByAtletaEquipaIdAndEstadoLesaoNot(equipa.getId(), EstadoLesao.RECUPERADO);

        // Assert - Ninguém está lesionado! Lista vazia
        assertThat(lesionadosAtivos).isEmpty();
    }

    @Test
    void devePreencherCamposDeAuditoriaAutomaticamente() {
        // Act - Buscamos a lesão gravada no @BeforeEach
        List<Lesao> lesoes = lesaoRepository.findByAtletaId(atletaLesionado.getId());

        // Assert - Os campos de auditoria devem ter sido preenchidos pelo Spring
        // O @CreatedDate coloca a data/hora atual automaticamente
        assertThat(lesoes.get(0).getDataCriacao()).isNotNull();
        
        // O @CreatedBy coloca "SISTEMA" porque é o que o nosso JpaAuditConfig devolve
        assertThat(lesoes.get(0).getRegistadoPor()).isEqualTo("SISTEMA");
    }
}
