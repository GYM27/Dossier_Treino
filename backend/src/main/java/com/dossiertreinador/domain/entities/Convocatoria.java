package com.dossiertreinador.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Representa a Convocatória oficial para um Jogo (EventoCalendario).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Convocatoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relação 1-para-1: Cada jogo tem apenas UMA convocatória oficial
    @NotNull(message = "A convocatória tem de estar associada a um evento.")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false, unique = true)
    private EventoCalendario eventoCalendario;

    @NotNull(message = "O limite de convocados é obrigatório.")
    @Column(nullable = false)
    private Integer limiteConvocados; // Configurável: 18 (oficial), 22 (amigável)

    @Column(nullable = false)
    private LocalDateTime dataPublicacao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    // Relacionamento bi-direcional para facilitar leituras
    @OneToMany(mappedBy = "convocatoria", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ConvocatoriaAtleta> atletasConvocados = new ArrayList<>();
}
