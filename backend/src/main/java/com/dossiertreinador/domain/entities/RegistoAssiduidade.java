package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.TipoAssiduidade;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * Representa o Registo de Presença (Assiduidade) de UM Atleta num UM Evento Específico.
 * Em termos de Base de Dados, isto resolve uma relação Muitos-para-Muitos entre Atleta e EventoCalendario
 * adicionando "peso/informação" a essa ligação (o Tipo de Assiduidade).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// CONSTRANGIMENTO CRÍTICO (Table uniqueConstraints):
// Diz à base de dados para NUNCA deixar criar dois registos para a MESMA dupla (evento_id + atleta_id).
// Um atleta não pode estar "PRESENTE" e "AUSENTE" no mesmo treino!
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"evento_id", "atleta_id"}))
public class RegistoAssiduidade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "O evento é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private EventoCalendario evento;

    @NotNull(message = "O atleta é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_id", nullable = false)
    private Atleta atleta;

    @NotNull(message = "O estado da assiduidade é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAssiduidade tipoAssiduidade;

    // Campos opcionais de anotações do treinador
    @Column
    private Integer minutosAtraso; // Útil se o tipoAssiduidade for ATRASADO

    @Column
    private String justificacao; // Útil se o tipoAssiduidade for AUSENTE (ex: "Furo no pneu")
}
