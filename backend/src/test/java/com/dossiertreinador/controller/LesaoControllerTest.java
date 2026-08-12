package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.LesaoRequestDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Lesao;
import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.enums.TipoLesao;
import com.dossiertreinador.domain.mappers.LesaoMapper;
import com.dossiertreinador.service.LesaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
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

@WebMvcTest(LesaoController.class)
@AutoConfigureMockMvc
@WithMockUser(roles = "TREINADOR")
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, JwtAuthenticationFilter.class})
class LesaoControllerTest {

    @MockBean
    private JwtService jwtService;
    
    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LesaoService lesaoService;

    @MockBean
    private LesaoMapper lesaoMapper;

    private UUID atletaId;
    private UUID lesaoId;
    private UUID equipaId;
    private LesaoRequestDTO requestDTO;
    private Lesao lesao;
    private Atleta atleta;

    @BeforeEach
    void setUp() {
        atletaId = UUID.randomUUID();
        lesaoId = UUID.randomUUID();
        equipaId = UUID.randomUUID();

        requestDTO = LesaoRequestDTO.builder()
                .tipoLesao(TipoLesao.MUSCULAR)
                .descricao("Contratura")
                .dataOcorrencia(LocalDate.now())
                .estadoLesao(EstadoLesao.EM_TRATAMENTO)
                .build();

        atleta = Atleta.builder().id(atletaId).nome("Ronaldo").build();

        lesao = Lesao.builder()
                .id(lesaoId)
                .atleta(atleta)
                .tipoLesao(TipoLesao.MUSCULAR)
                .estadoLesao(EstadoLesao.EM_TRATAMENTO)
                .build();
    }

    @Test
    void registarLesao_ComSucesso_Retorna201() throws Exception {
        when(lesaoMapper.toEntity(any(LesaoRequestDTO.class))).thenReturn(lesao);
        when(lesaoService.registarLesao(eq(atletaId), any(Lesao.class))).thenReturn(lesao);

        mockMvc.perform(post("/api/lesoes/atleta/{atletaId}", atletaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated());
    }

    @Test
    void atualizarEstado_ComSucesso_Retorna200() throws Exception {
        when(lesaoService.atualizarEstado(eq(lesaoId), eq(EstadoLesao.RECUPERADO))).thenReturn(lesao);

        mockMvc.perform(patch("/api/lesoes/{lesaoId}/estado", lesaoId)
                        .param("novoEstado", "RECUPERADO"))
                .andExpect(status().isOk());
    }

    @Test
    void listarHistoricoPorAtleta_Retorna200() throws Exception {
        when(lesaoService.listarHistoricoPorAtleta(atletaId)).thenReturn(List.of(lesao));

        mockMvc.perform(get("/api/lesoes/atleta/{atletaId}/historico", atletaId))
                .andExpect(status().isOk());
    }

    @Test
    void listarLesionadosDaEquipa_Retorna200() throws Exception {
        when(lesaoService.listarLesionadosAtivosPorEquipa(equipaId)).thenReturn(List.of(lesao));

        mockMvc.perform(get("/api/lesoes/equipa/{equipaId}/ativos", equipaId))
                .andExpect(status().isOk());
    }
}
