package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.AuthenticationRequest;
import com.dossiertreinador.domain.dtos.AuthenticationResponse;
import com.dossiertreinador.domain.dtos.RegisterRequest;
import com.dossiertreinador.security.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
// ... (imports existentes)

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationService authenticationService;
    
    @Value("${security.cookie.secure:false}")
    private boolean isSecureCookie;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/registar")
    @PreAuthorize("hasRole('TREINADOR') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<AuthenticationResponse> registar(@RequestBody RegisterRequest request) {
        var authResult = authenticationService.register(request);
        return construirRespostaComCookie(authResult);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        var authResult = authenticationService.authenticate(request);
        return construirRespostaComCookie(authResult);
    }

    private ResponseEntity<AuthenticationResponse> construirRespostaComCookie(AuthenticationService.AuthResult authResult) {
        ResponseCookie cookie = ResponseCookie.from("jwt", authResult.token())
                .httpOnly(true)
                .secure(isSecureCookie)
                .path("/")
                .maxAge(24 * 60 * 60) // 1 dia
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(authResult.response());
    }
}
