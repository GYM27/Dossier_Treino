package com.dossiertreinador.domain.entities;

import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Ficha do Atleta.
 * Uma das entidades mais completas e críticas do sistema.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Atleta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // --- DADOS PESSOAIS ---
    @NotBlank(message = "O nome do atleta é obrigatório.")
    @Column(nullable = false)
    private String nome;

    @NotNull(message = "A data de nascimento é obrigatória.")
    // @Past é uma validação incrível do Java que nos proíbe de criar alguém que 
    // supostamente ainda vai nascer no futuro.
    @Past(message = "A data de nascimento tem de estar no passado.") 
    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column
    private String nacionalidade;

    @Column(length = 1000)
    private String fotoUrl;

    // --- DADOS TÉCNICOS / DESPORTIVOS ---
    @NotNull(message = "A posição principal é obrigatória.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Posicao posicaoPrincipal;

    // Um jogador pode ou não ter uma posição secundária, por isso não tem @NotNull
    @Enumerated(EnumType.STRING)
    @Column
    private Posicao posicaoSecundaria;

    @NotNull(message = "O pé preferido é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PePreferido pePreferido;

    // --- DADOS FÍSICOS ---
    // Usamos a classe "Integer" e "Double" (em vez dos primitivos "int" e "double")
    // para permitir que estes campos fiquem a "null" caso o treinador ainda não
    // tenha pesado ou medido o atleta. (Os tipos primitivos colocariam 0 por defeito, o que seria irreal).
    
    @Min(value = 100, message = "Altura mínima irreal (em cm).")
    @Max(value = 250, message = "Altura máxima irreal (em cm).")
    @Column
    private Integer alturaCm; 

    @Min(value = 30, message = "Peso mínimo irreal (em kg).")
    @Max(value = 150, message = "Peso máximo irreal (em kg).")
    @Column
    private Double pesoKg;

    @Column
    private Integer numeroCamisola;

    // --- RELACIONAMENTOS ---
    // Cada atleta tem de estar inscrito num plantel (Equipa) daquela época.
    @NotNull(message = "O atleta tem de estar associado a uma equipa.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipa_id", nullable = false)
    private Equipa equipa;
}
