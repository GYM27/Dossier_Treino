package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.AuthenticationRequest;
import com.dossiertreinador.domain.dtos.AuthenticationResponse;
import com.dossiertreinador.domain.dtos.RegisterRequest;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import com.dossiertreinador.security.AuthenticationService;
import com.dossiertreinador.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;

import org.springframework.context.annotation.Import;
import com.dossiertreinador.security.SecurityConfig;
import com.dossiertreinador.security.JwtAuthenticationEntryPoint;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.dossiertreinador.security.JwtAuthenticationFilter;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authenticationService;
    
    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "TREINADOR")
    void deveRegistarComSucessoEDevolverTokenNoCookie() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .nomeCompleto("Treinador X")
                .email("x@x.com")
                .password("password123")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();
        
        AuthenticationResponse response = new AuthenticationResponse("Sucesso", "Treinador X", "TREINADOR_PRINCIPAL");
        AuthenticationService.AuthResult authResult = new AuthenticationService.AuthResult("token_falso", response);

        when(authenticationService.register(any(RegisterRequest.class))).thenReturn(authResult);

        mockMvc.perform(post("/api/auth/registar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem").value("Sucesso"))
                .andExpect(cookie().value("jwt", "token_falso"))
                .andExpect(cookie().httpOnly("jwt", true));
    }

    @Test
    void deveFazerLoginComSucessoEDevolverTokenNoCookie() throws Exception {
        AuthenticationRequest request = new AuthenticationRequest("x@x.com", "password123");
        AuthenticationResponse response = new AuthenticationResponse("Sucesso", "Treinador X", "TREINADOR_PRINCIPAL");
        AuthenticationService.AuthResult authResult = new AuthenticationService.AuthResult("token_falso_login", response);

        when(authenticationService.authenticate(any(AuthenticationRequest.class))).thenReturn(authResult);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem").value("Sucesso"))
                .andExpect(cookie().value("jwt", "token_falso_login"));
    }
}
