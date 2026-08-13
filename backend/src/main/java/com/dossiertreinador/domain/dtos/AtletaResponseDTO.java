package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.Posicao;
import lombok.Builder;
import lombok.Data;

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
    // Nós não queremos enviar a data de nascimento crua e obrigar o 
    // telemóvel a calcular a idade. Nós calculamos no servidor e 
    // enviamos a idade já mastigadinha!
    private Integer idade; 
    
    private String nacionalidade;
    
    private Posicao posicaoPrincipal;
    private Integer numeroCamisola;
    
    private String pePreferido;
    
    // MAGIA 2:
    // Nós não enviamos a Entidade "Equipa" toda (com escalão, ID, época, etc).
    // Para mostrar na lista, o telemóvel só precisa do Nome da Equipa!
    private String nomeEquipa; 
}
