package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String nomeCompleto;
    private String email;
    private String password;
    private Papel papel;
    private Cargo cargo;
}
