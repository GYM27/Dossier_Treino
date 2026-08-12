package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.TipoEstatistica;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticaJogoRequestDTO {

    @NotNull(message = "O ID do atleta é obrigatório.")
    private UUID atletaId;

    @NotNull(message = "O tipo de estatística é obrigatório.")
    private TipoEstatistica tipoEstatistica;

    // Pode ser nulo no pedido, o serviço assume 1 por defeito
    private Integer valor;

    private String minuto;
    private String notas;
}
