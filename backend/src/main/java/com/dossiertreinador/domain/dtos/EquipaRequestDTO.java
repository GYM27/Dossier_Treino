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
public class EquipaRequestDTO {
    
    @NotBlank(message = "O nome da equipa é obrigatório (ex: Seniores)")
    private String nome;
    
    @NotBlank(message = "O escalão é obrigatório (ex: A, B, Sub-19)")
    private String escalao;
    
    @NotBlank(message = "A época é obrigatória (ex: 2024/2025)")
    private String designacaoEpoca;
}
