package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.AtletaResponseDTO;
import com.dossiertreinador.domain.dtos.EstatisticaJogoRequestDTO;
import com.dossiertreinador.domain.dtos.EstatisticaJogoResponseDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.EstatisticaJogo;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.enums.TipoEstatistica;
import com.dossiertreinador.mappers.EstatisticaJogoMapper;
import com.dossiertreinador.service.EstatisticaJogoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import com.dossiertreinador.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Import;
import com.dossiertreinador.security.SecurityConfig;
import com.dossiertreinador.security.JwtAuthenticationEntryPoint;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.dossiertreinador.security.JwtService;

@WebMvcTest(EstatisticaJogoController.class)
@AutoConfigureMockMvc
@WithMockUser(roles = "TREINADOR")
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, JwtAuthenticationFilter.class})
class EstatisticaJogoControllerTest {

    @MockBean
    private JwtService jwtService;
    
    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EstatisticaJogoService estatisticaService;

    @MockBean
    private EstatisticaJogoMapper estatisticaMapper;

    private UUID eventoId;
    private UUID atletaId;
    private EstatisticaJogoRequestDTO requestDTO;
    private EstatisticaJogoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        eventoId = UUID.randomUUID();
        atletaId = UUID.randomUUID();
        UUID estatisticaId = UUID.randomUUID();

        requestDTO = EstatisticaJogoRequestDTO.builder()
                .atletaId(atletaId)
                .tipoEstatistica(TipoEstatistica.GOLO)
                .valor(1)
                .minuto("45")
                .notas("Canto")
                .build();

        AtletaResponseDTO atletaResponse = AtletaResponseDTO.builder().id(atletaId).nome("João").build();

        responseDTO = EstatisticaJogoResponseDTO.builder()
                .id(estatisticaId)
                .eventoId(eventoId)
                .atleta(atletaResponse)
                .tipoEstatistica(TipoEstatistica.GOLO)
                .valor(1)
                .minuto("45")
                .notas("Canto")
                .build();
    }

    @Test
    void registarEstatistica_Retorna201() throws Exception {
        when(estatisticaService.registarEstatistica(
                eq(eventoId), eq(atletaId), eq(TipoEstatistica.GOLO), eq(1), eq("45"), eq("Canto")))
                .thenReturn(new EstatisticaJogo()); // mock simples

        when(estatisticaMapper.toDTO(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/eventos/{eventoId}/estatisticas", eventoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(responseDTO.getId().toString()))
                .andExpect(jsonPath("$.tipoEstatistica").value("GOLO"));
    }

    @Test
    void listarEstatisticas_Retorna200() throws Exception {
        when(estatisticaService.listarPorEvento(eventoId)).thenReturn(List.of(new EstatisticaJogo()));
        when(estatisticaMapper.toDTO(any())).thenReturn(responseDTO);

        mockMvc.perform(get("/api/eventos/{eventoId}/estatisticas", eventoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void removerEstatistica_Retorna204() throws Exception {
        mockMvc.perform(delete("/api/eventos/{eventoId}/estatisticas/{estatisticaId}", eventoId, UUID.randomUUID()))
                .andExpect(status().isNoContent());
    }
}
