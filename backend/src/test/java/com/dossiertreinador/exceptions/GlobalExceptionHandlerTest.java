package com.dossiertreinador.exceptions;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Deve converter AccessDeniedException em HTTP 403 Forbidden estruturado")
    void deveConverterAccessDeniedExceptionPara403() {
        AccessDeniedException ex = new AccessDeniedException("Permissão negada para esta operação");

        ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("Acesso Negado", response.getBody().getError());
        assertEquals("Permissão negada para esta operação", response.getBody().getMessage());
    }
}
