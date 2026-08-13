package com.dossiertreinador.domain.dtos;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UtilizadorResponseDTO {
    private UUID id;
    private String nomeCompleto;
    private String email;
    private String cargo;
}
