package com.dossiertreinador.security;

import com.dossiertreinador.domain.dtos.AuthenticationRequest;
import com.dossiertreinador.domain.dtos.AuthenticationResponse;
import com.dossiertreinador.domain.dtos.RegisterRequest;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.repository.UtilizadorRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    
    private final UtilizadorRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UtilizadorRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public record AuthResult(String token, AuthenticationResponse response) {}

    public AuthResult register(RegisterRequest request) {
        var user = Utilizador.builder()
                .nomeCompleto(request.getNomeCompleto())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .papel(request.getPapel())
                .cargo(request.getCargo())
                .build();
        
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .mensagem("Registo efetuado com sucesso")
                .nome(user.getNomeCompleto())
                .cargo(user.getCargo().name())
                .build();
        return new AuthResult(jwtToken, response);
    }

    public AuthResult authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .mensagem("Login efetuado com sucesso")
                .nome(user.getNomeCompleto())
                .cargo(user.getCargo().name())
                .build();
        return new AuthResult(jwtToken, response);
    }
}
