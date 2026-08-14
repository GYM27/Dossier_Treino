package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.TipoAssiduidade;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistoAssiduidadeUpdateDTO {
    @NotNull(message = "O tipo de assiduidade é obrigatório.")
    private TipoAssiduidade tipoAssiduidade;
    
    private Integer minutosAtraso;
    private String justificacao;
}
