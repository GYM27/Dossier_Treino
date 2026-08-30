package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.EstatisticaJogoResponseDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import com.dossiertreinador.domain.enums.TipoEstatistica;
import com.dossiertreinador.domain.enums.TipoEvento;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste unitário para EstatisticaJogoMapper.
 * Valida a conversão pura da entidade EstatisticaJogo para EstatisticaJogoResponseDTO.
 */
class EstatisticaJogoMapperTest {

    private final AtletaMapper atletaMapper = new AtletaMapper();
    private final EstatisticaJogoMapper mapper = new EstatisticaJogoMapper(atletaMapper);

    @Test
    void deveConverterEntidadeParaResponseDTO() {
        // Arrange
        UUID equipaId = UUID.randomUUID();
        Equipa equipa = Equipa.builder().id(equipaId).nome("Seniores").build();

        Atleta atleta = Atleta.builder()
                .id(UUID.randomUUID())
                .nome("Cristiano")
                .dataNascimento(LocalDate.of(1995, 2, 5))
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO)
                .pePreferido(PePreferido.DESTRO)
                .equipa(equipa)
                .build();

        EventoCalendario evento = EventoCalendario.builder()
                .id(UUID.randomUUID())
                .equipa(equipa)
                .tipoEvento(TipoEvento.JOGO)
                .dataHoraInicio(LocalDateTime.now())
                .dataHoraFim(LocalDateTime.now().plusHours(2))
                .descricao("Jogo vs Rival")
                .build();

        EstatisticaJogo estatistica = EstatisticaJogo.builder()
                .id(UUID.randomUUID())
                .eventoCalendario(evento)
                .atleta(atleta)
                .tipoEstatistica(TipoEstatistica.GOLO)
                .valor(1)
                .minuto("45")
                .notas("Remate de cabeça")
                .build();

        // Act
        EstatisticaJogoResponseDTO dto = mapper.toDTO(estatistica);

        // Assert
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(estatistica.getId());
        assertThat(dto.getEventoId()).isEqualTo(evento.getId());
        assertThat(dto.getAtleta().getNome()).isEqualTo("Cristiano");
        assertThat(dto.getTipoEstatistica()).isEqualTo(TipoEstatistica.GOLO);
        assertThat(dto.getValor()).isEqualTo(1);
        assertThat(dto.getMinuto()).isEqualTo("45");
        assertThat(dto.getNotas()).isEqualTo("Remate de cabeça");
    }

    @Test
    void deveRetornarNullQuandoEntidadeForNull() {
        // Act
        EstatisticaJogoResponseDTO dto = mapper.toDTO(null);

        // Assert
        assertThat(dto).isNull();
    }
}
