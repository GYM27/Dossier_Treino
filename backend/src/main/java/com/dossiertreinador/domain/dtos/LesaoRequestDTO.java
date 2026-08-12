package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.enums.TipoLesao;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LesaoRequestDTO {

    @NotNull(message = "O tipo de lesão é obrigatório")
    private TipoLesao tipoLesao;

    // A descrição é opcional no momento do registo
    private String descricao;

    @NotNull(message = "A data da ocorrência é obrigatória")
    private LocalDate dataOcorrencia;

    private LocalDate dataRetornoPrevista;

    @NotNull(message = "O estado da lesão é obrigatório")
    private EstadoLesao estadoLesao;

    private String observacoes;
}
