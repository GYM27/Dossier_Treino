package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO (Data Transfer Object) de ENTRADA.
 * É isto que o Frontend (Telemóvel/Página Web) nos envia em formato JSON
 * quando o treinador clica no botão "Salvar Novo Atleta".
 * Repara que em vez do objeto "Equipa" inteiro, ele só nos manda o "equipaId".
 */
@Data
@Builder
public class AtletaRequestDTO {
    
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotNull(message = "A data de nascimento é obrigatória")
    @Past(message = "A data de nascimento tem de ser no passado")
    private LocalDate dataNascimento;

    @Min(100) @Max(250)
    private Integer alturaCm;

    @Min(30) @Max(150)
    private Double pesoKg;

    private String nacionalidade;

    private String fotoUrl;

    @Min(1) @Max(99)
    private Integer numeroCamisola;
    
    @NotNull(message = "A posição principal é obrigatória")
    private Posicao posicaoPrincipal;
    
    private Posicao posicaoSecundaria;
    
    @NotNull(message = "O pé preferido é obrigatório")
    private PePreferido pePreferido;
    
    @NotNull(message = "O atleta tem de estar associado a uma equipa")
    private UUID equipaId; // O frontend só sabe o ID da equipa, não tem a equipa toda!
}
