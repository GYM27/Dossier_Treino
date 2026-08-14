package com.dossiertreinador.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Representa um dia de treino (Cabeçalho).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SessaoTreino {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDate data;

    @Column
    private LocalTime hora;

    @Column
    private Integer morfociclo; // Semana do treino

    @Column
    private Integer microciclo; // Número da unidade de treino

    @Column
    private String fase; // Ex: Pré-Época, Competitivo

    @Column
    private Integer numeroJogadores;

    @Column
    private String material;

    @Column
    private String objetivo;

    @Min(value = 1, message = "A intensidade mínima é 1.")
    @Max(value = 5, message = "A intensidade máxima é 5.")
    @Column
    private Integer intensidadeGeral;

    @Column(nullable = false)
    @Builder.Default
    private Integer duracaoTotalMinutos = 0; // Calculado automaticamente pela soma dos exercícios

    @NotNull(message = "O treino tem de estar associado a uma equipa.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipa_id", nullable = false)
    private Equipa equipa;

    // Relacionamento com os exercícios do treino
    @OneToMany(mappedBy = "sessaoTreino", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SessaoTreinoExercicio> exercicios = new ArrayList<>();

    // --- AUDITORIA ---
    @CreatedBy
    @Column(updatable = false)
    private String criadoPor;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    @LastModifiedDate
    private LocalDateTime dataUltimaAtualizacao;
}
