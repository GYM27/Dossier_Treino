package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.TipoEstatistica;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * Entidade para registar as ações individuais de um atleta durante um jogo.
 * Pode ser um golo, um cartão, ou apenas o somatório dos minutos que jogou.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstatisticaJogo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "O evento (jogo) é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private EventoCalendario eventoCalendario;

    @NotNull(message = "O atleta é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_id", nullable = false)
    private Atleta atleta;

    @NotNull(message = "O tipo de estatística é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEstatistica tipoEstatistica;

    // Pode representar os minutos jogados (ex: 90) ou a quantidade de golos (ex: 2) num só registo,
    // ou podermos registar um a um no minuto em que aconteceu. Vamos usar 'valor' como inteiro genérico.
    @Column(nullable = false)
    @Builder.Default
    private Integer valor = 1;

    // Opcional: Minuto de jogo em que aconteceu (ex: 45, 90+2)
    @Column
    private String minuto;
    
    // Opcional: Notas extras ("Golo de livre direto")
    @Column
    private String notas;
}
