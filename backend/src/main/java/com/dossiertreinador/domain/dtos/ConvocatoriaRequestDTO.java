package com.dossiertreinador.domain.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvocatoriaRequestDTO {

    @NotEmpty(message = "A lista de atletas não pode estar vazia.")
    private List<UUID> atletaIds;

    @NotNull(message = "O limite de convocados é obrigatório.")
    private Integer limiteConvocados;

    private String observacoes;

    private Boolean forcarConvocatoria;
}
