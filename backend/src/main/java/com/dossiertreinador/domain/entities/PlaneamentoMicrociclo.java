package com.dossiertreinador.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Representa um microciclo de treino (normalmente uma semana),
 * permitindo associar um número de Microciclo e um número de Morfociclo
 * a um intervalo de datas para uma equipa específica.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"equipa_id", "data_inicio"}),
    @UniqueConstraint(columnNames = {"equipa_id", "numero_microciclo"})
})
public class PlaneamentoMicrociclo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "A data de início do microciclo é obrigatória.")
    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio; // Geralmente a segunda-feira da semana

    @NotNull(message = "A data de fim do microciclo é obrigatória.")
    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim; // Geralmente o domingo da semana

    @NotNull(message = "O número do microciclo é obrigatório.")
    @Column(name = "numero_microciclo", nullable = false)
    private Integer numeroMicrociclo;

    @NotNull(message = "O número do morfociclo é obrigatório.")
    @Column(name = "numero_morfociclo", nullable = false)
    private Integer numeroMorfociclo;

    @NotNull(message = "O microciclo tem de estar associado a uma equipa.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipa_id", nullable = false)
    private Equipa equipa;
}
