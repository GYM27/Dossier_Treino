package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.TipoEvento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa um bloco de tempo no calendário da Equipa (ex: um treino, um jogo).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoCalendario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "O tipo de evento é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEvento tipoEvento;

    // LocalDateTime é usado porque precisamos não só do dia (LocalDate) 
    // mas também da HORA a que começa o evento.
    @NotNull(message = "A data e hora de início são obrigatórias.")
    @Column(nullable = false)
    private LocalDateTime dataHoraInicio;

    @NotNull(message = "A data e hora de fim são obrigatórias.")
    @Column(nullable = false)
    private LocalDateTime dataHoraFim;

    @Column
    private String descricao; // Ex: "Treino tático de transições ofensivas"

    @Column
    private String local; // Ex: "Campo Sintético 2"

    @Column(name = "numero_treino")
    private Integer numeroTreino; // Usado apenas quando tipoEvento = TREINO

    @Column(name = "equipa_casa")
    private String equipaCasa; // Usado apenas quando tipoEvento = JOGO

    @Column(name = "equipa_fora")
    private String equipaFora; // Usado apenas quando tipoEvento = JOGO

    // O evento pertence a uma Equipa inteira (ex: é o Treino dos Seniores, não dos Sub-19)
    @NotNull(message = "O evento tem de estar associado a uma equipa.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipa_id", nullable = false)
    private Equipa equipa;
}
