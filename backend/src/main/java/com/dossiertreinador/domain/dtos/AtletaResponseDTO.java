package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.Posicao;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

import java.util.UUID;

/**
 * DTO (Data Transfer Object) de SAÍDA.
 * É este "envelope" seguro que nós enviamos de volta para o Telemóvel.
 * Repara na diferença monumental para a Entidade Atleta.java!
 */
@Data
@Builder
public class AtletaResponseDTO {
    
    private UUID id;
    private String nome;
    
    // MAGIA DOS DTOs: 
    // Nós calculamos a idade no servidor e enviamos já mastigadinha,
    // mas também enviamos a data de nascimento crua para pré-preencher o formulário de edição!
    private Integer idade; 
    private LocalDate dataNascimento;
    
    private Integer alturaCm;
    private Double pesoKg; 
    
    private String nacionalidade;
    private String fotoUrl;
    
    private Posicao posicaoPrincipal;
    private Integer numeroCamisola;
    
    private String pePreferido;
    
    // MAGIA 2:
    // Nós não enviamos a Entidade "Equipa" toda (com escalão, ID, época, etc).
    // Para mostrar na lista, o telemóvel só precisa do Nome da Equipa!
    private String nomeEquipa; 
}
