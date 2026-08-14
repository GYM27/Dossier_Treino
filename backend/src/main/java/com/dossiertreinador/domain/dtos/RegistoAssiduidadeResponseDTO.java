package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.TipoAssiduidade;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistoAssiduidadeResponseDTO {
    private UUID id;
    private UUID eventoId;
    private UUID atletaId;
    private TipoAssiduidade tipoAssiduidade;
    private Integer minutosAtraso;
    private String justificacao;
}
