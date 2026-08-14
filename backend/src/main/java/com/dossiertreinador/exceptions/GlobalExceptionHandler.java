package com.dossiertreinador.exceptions;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

/**
 * O POLÍCIA GERAL DA APLICAÇÃO.
 * A anotação @ControllerAdvice diz ao Spring: "Fica à escuta! Se algum Serviço
 * ou Controlador rebentar com um erro em qualquer parte do sistema, apanha o erro
 * aqui e converte-o para o nosso ErrorResponse bonitinho".
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    // Lembras-te dos testes onde forçámos erros de Email e Data no Futuro?
    // Aquilo gerava uma ConstraintViolationException. Aqui nós intercetamos isso!
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(ConstraintViolationException ex) {
        
        ErrorResponse erroFormatado = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value()) // Código 400
                .error("Erro de Validação de Dados")
                // O getMessage() vai extrair as tuas mensagens ("O nome é obrigatório", etc.)
                .message(ex.getMessage()) 
                .build();
                
        // Devolvemos o erro com um formato que os telemóveis e páginas web adoram ler (JSON)
        return new ResponseEntity<>(erroFormatado, HttpStatus.BAD_REQUEST);
    }
    
    // No futuro, se tentarmos procurar um Atleta pelo ID e ele não existir na BD,
    // podemos criar aqui um método para apanhar EntityNotFoundException e devolver um erro 404.

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        ErrorResponse erroFormatado = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value()) // Código 401
                .error("Unauthorized")
                .message("Email ou password incorretos")
                .build();
        return new ResponseEntity<>(erroFormatado, HttpStatus.UNAUTHORIZED);
    }

    // Apanha erros de validação nos DTOs (como @NotNull, @NotBlank no AtletaRequestDTO)
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(org.springframework.validation.FieldError::getDefaultMessage)
                .collect(java.util.stream.Collectors.joining(". "));

        ErrorResponse erroFormatado = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value()) // Código 400
                .error("Erro de Validação de Dados (DTO)")
                .message(errorMessage) 
                .build();
                
        return new ResponseEntity<>(erroFormatado, HttpStatus.BAD_REQUEST);
    }
}
