package com.dossiertreinador.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvocatoriaAtletaDTO {
    private UUID atletaId;
    private String nome;
    private String posicaoPrincipal;
    private Integer numeroCamisola;
}
