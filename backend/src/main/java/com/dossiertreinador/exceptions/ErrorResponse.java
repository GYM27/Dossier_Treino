package com.dossiertreinador.exceptions;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Quando a nossa aplicação falhar, em vez de enviar ao telemóvel um erro
 * gigante e confuso do Java, envia este "cartão" arrumadinho com a mensagem de erro.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status; // Ex: 400, 404, 500
    private String error; // Ex: "Bad Request"
    private String message; // Ex: "A data de nascimento tem de ser no passado"
}
