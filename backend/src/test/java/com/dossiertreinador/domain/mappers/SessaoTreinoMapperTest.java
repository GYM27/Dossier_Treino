package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.enums.TipoEvento;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SessaoTreinoMapperTest {

    private final SessaoTreinoMapper mapper = new SessaoTreinoMapper();

    @Test
    void deveMapearEventoCalendarioComLocalParaResponseDTO() {
        // Arrange
        UUID equipaId = UUID.randomUUID();
        Equipa equipa = Equipa.builder().id(equipaId).nome("Seniores").build();

        LocalDateTime inicio = LocalDateTime.of(2026, 8, 25, 19, 30);
        LocalDateTime fim = LocalDateTime.of(2026, 8, 25, 21, 0);

        EventoCalendario evento = EventoCalendario.builder()
                .id(UUID.randomUUID())
                .tipoEvento(TipoEvento.TREINO)
                .dataHoraInicio(inicio)
                .dataHoraFim(fim)
                .local("Campo Sintético Arregaça")
                .numeroTreino(12)
                .equipa(equipa)
                .build();

        SessaoTreino sessao = SessaoTreino.builder()
                .id(UUID.randomUUID())
                .eventoCalendario(evento)
                .equipa(equipa)
                .objetivo("Transição Ofensiva Rápida")
                .numeroJogadores(18)
                .intensidadeGeral(4)
                .material("Bolas, Cones, Coletes")
                .duracaoTotalMinutos(90)
                .exercicios(new ArrayList<>())
                .build();

        // Act
        SessaoTreinoResponseDTO dto = mapper.toResponseDTO(sessao);

        // Assert
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(sessao.getId());
        assertThat(dto.getEventoId()).isEqualTo(evento.getId());
        assertThat(dto.getLocal()).isEqualTo("Campo Sintético Arregaça");
        assertThat(dto.getData()).isEqualTo(inicio.toLocalDate());
        assertThat(dto.getHora()).isEqualTo(inicio.toLocalTime());
        assertThat(dto.getUnidadeTreino()).isEqualTo(12);
        assertThat(dto.getMicrociclo()).isEqualTo(1);
        assertThat(dto.getMesociclo()).isEqualTo(1);
        assertThat(dto.getObjetivo()).isEqualTo("Transição Ofensiva Rápida");
        assertThat(dto.getNumeroJogadores()).isEqualTo(18);
        assertThat(dto.getIntensidadeGeral()).isEqualTo(4);
    }
}
