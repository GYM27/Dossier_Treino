package com.dossiertreinador.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * Entidade Relacional que liga uma Sessão de Treino a um Exercício do Catálogo.
 * Permite definir a ordem do exercício no treino e a sua duração.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessaoTreinoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Tem de estar associado a uma Sessão de Treino.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sessao_treino_id", nullable = false)
    private SessaoTreino sessaoTreino;

    @NotNull(message = "Tem de estar associado a um Exercício.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercicio_id", nullable = false)
    private Exercicio exercicio;

    @Min(value = 1, message = "A ordem tem de ser positiva.")
    @Column(nullable = false)
    private Integer ordem;

    @Min(value = 1, message = "A duração mínima é de 1 minuto.")
    @Column(nullable = false)
    private Integer duracaoMinutos;

    @Column(columnDefinition = "TEXT")
    private String observacoesDoTreinador; // Ex: "Focar na perna esquerda hoje"
}
