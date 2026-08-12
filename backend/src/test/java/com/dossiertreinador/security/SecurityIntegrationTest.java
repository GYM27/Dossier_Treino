package com.dossiertreinador.security;

import com.dossiertreinador.domain.dtos.AuthenticationRequest;
import com.dossiertreinador.domain.dtos.RegisterRequest;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Dá rollback à BD depois de cada teste (H2 limpa-se sozinho)
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void deveRegistarEAutenticarComSucesso() throws Exception {
        // 1. Criar Registo
        RegisterRequest registerReq = RegisterRequest.builder()
                .nomeCompleto("Treinador de Teste")
                .email("teste@seguranca.pt")
                .password("senha_forte123")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        mockMvc.perform(post("/api/auth/registar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"));

        // 2. Tentar Fazer Login com os mesmos dados
        AuthenticationRequest authReq = new AuthenticationRequest("teste@seguranca.pt", "senha_forte123");
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authReq)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void deveFalharLoginComPasswordInvalida() throws Exception {
        // Registar
        RegisterRequest registerReq = RegisterRequest.builder()
                .nomeCompleto("Treinador 2")
                .email("t2@seguranca.pt")
                .password("senha_certa")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        mockMvc.perform(post("/api/auth/registar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // Tentar Login com pass errada
        AuthenticationRequest authReq = new AuthenticationRequest("t2@seguranca.pt", "senha_errada");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authReq)))
                .andExpect(status().isUnauthorized()); // O Spring Security atira 401 para credenciais inválidas.
    }

    @Test
    void naoDevePermitirAcessoAEndpointProtegidoSemToken() throws Exception {
        // Tentar aceder a um endpoint protegido (ex: listar equipas, atletas, etc)
        // Se a segurança estiver bem configurada, atira 401 Unauthorized
        mockMvc.perform(get("/api/atletas/equipa/123e4567-e89b-12d3-a456-426614174000")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void naoDevePermitirRegistoSemToken() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .nomeCompleto("Invasor")
                .email("hack@hack.com")
                .password("senha123")
                .papel(Papel.TREINADOR)
                .cargo(Cargo.TREINADOR_PRINCIPAL)
                .build();

        mockMvc.perform(post("/api/auth/registar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isUnauthorized()); // Protegido!
    }
}
