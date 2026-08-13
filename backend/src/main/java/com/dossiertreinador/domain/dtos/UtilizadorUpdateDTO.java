package com.dossiertreinador.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UtilizadorUpdateDTO {
    
    @NotBlank(message = "O nome completo não pode estar vazio")
    private String nomeCompleto;
    
    // A password é opcional na atualização do perfil
    private String novaPassword;
}
