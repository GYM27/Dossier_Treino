package com.dossiertreinador.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade que representa a análise e ficha de um adversário (próximo jogo).
 * Pode ser associada a um EventoCalendario do tipo JOGO para registo de tática,
 * pontos fortes/fracos e observações técnicas.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Adversario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "O nome do adversário é obrigatório.")
    @Column(nullable = false, unique = true)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String escudoUrl; // URL para o escudo ou imagem representativa

    @Column
    private String sistemaTaticoPref; // Ex: "4-3-3", "1-4-2-4", etc.

    @Column(columnDefinition = "TEXT")
    private String pontosFortes; // Ex: "Transição rápida, bom golpe de esquina"

    @Column(columnDefinition = "TEXT")
    private String pontosFracos; // Ex: "Fraco nas bolas paradas defensivas, baixa posse de bola"

    @Column
    private String observacoesGerais; // Observações livres do scouting

    // Associa o adversário a um evento de jogo específico no calendário
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_calendario_id")
    private EventoCalendario eventoCalendario;

    // Metadados de auditoria
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "ultima_atualizacao")
    private LocalDateTime ultimaAtualizacao;
}