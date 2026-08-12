package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.SessaoTreinoRequestDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.mappers.SessaoTreinoMapper;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.security.JwtAuthenticationFilter;
import com.dossiertreinador.service.SessaoTreinoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SessaoTreinoController.class)
@Import({com.dossiertreinador.security.SecurityConfig.class, JwtAuthenticationFilter.class, com.dossiertreinador.security.JwtAuthenticationEntryPoint.class})
class SessaoTreinoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessaoTreinoService sessaoTreinoService;

    @MockBean
    private SessaoTreinoMapper sessaoTreinoMapper;

    @MockBean
    private EquipaRepository equipaRepository;

    @MockBean
    private com.dossiertreinador.security.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "treinador@equipa.pt", roles = {"TREINADOR"})
    void testCriarSessao() throws Exception {
        UUID equipaId = UUID.randomUUID();
        
        SessaoTreinoRequestDTO request = new SessaoTreinoRequestDTO();
        request.setData(LocalDate.now());
        request.setEquipaId(equipaId);
        
        SessaoTreinoResponseDTO response = SessaoTreinoResponseDTO.builder()
                .equipaId(equipaId)
                .duracaoTotalMinutos(0)
                .build();

        when(equipaRepository.findById(equipaId)).thenReturn(Optional.of(new Equipa()));
        when(sessaoTreinoService.criarSessao(any())).thenReturn(new SessaoTreino());
        when(sessaoTreinoMapper.toResponseDTO(any())).thenReturn(response);

        mockMvc.perform(post("/api/treinos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipaId").value(equipaId.toString()));
    }
}
