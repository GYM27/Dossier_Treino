package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "O nome completo é obrigatório")
    private String nomeCompleto;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Formato de email inválido")
    private String email;

    @NotBlank(message = "A password é obrigatória")
    @Size(min = 6, message = "A password deve ter pelo menos 6 caracteres")
    private String password;

    @NotNull(message = "O papel do utilizador é obrigatório")
    private Papel papel;

    @NotNull(message = "O cargo do utilizador é obrigatório")
    private Cargo cargo;
}
