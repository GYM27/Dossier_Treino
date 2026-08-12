package com.dossiertreinador.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * Tabela de junção entre a Convocatória e o Atleta.
 * Permite guardar metadados específicos para aquele jogo (ex: número da camisola).
 * 
 * 🔐 A anotação @Table(uniqueConstraints...) impede que o mesmo atleta 
 * seja convocado duas vezes para o mesmo jogo.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"convocatoria_id", "atleta_id"})
})
public class ConvocatoriaAtleta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "A ligação à convocatória é obrigatória.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convocatoria_id", nullable = false)
    private Convocatoria convocatoria;

    @NotNull(message = "O atleta é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_id", nullable = false)
    private Atleta atleta;

    // Pode ser diferente do número habitual num jogo de seleção, por exemplo
    @Column
    private Integer numeroCamisola;
}
