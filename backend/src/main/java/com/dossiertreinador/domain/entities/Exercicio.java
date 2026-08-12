package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.CategoriaExercicio;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Catálogo Global de Exercícios.
 * O treinador pode reutilizar estes exercícios em várias Sessões de Treino.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class) // Magia do RGPD / Autoria
public class Exercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "O nome do exercício é obrigatório.")
    @Column(nullable = false, unique = true) // Assumimos que o nome do exercício é único no catálogo global
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @NotNull(message = "A categoria é obrigatória.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaExercicio categoria;

    @Min(value = 1, message = "O nível de dificuldade mínimo é 1.")
    @Max(value = 5, message = "O nível de dificuldade máximo é 5.")
    @Column
    private Integer nivelDificuldade;

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
