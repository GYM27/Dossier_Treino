package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.ConvocatoriaRequestDTO;
import com.dossiertreinador.domain.entities.Convocatoria;
import com.dossiertreinador.domain.entities.ConvocatoriaAtleta;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.mappers.ConvocatoriaMapper;
import com.dossiertreinador.service.ConvocatoriaService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import com.dossiertreinador.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Import;
import com.dossiertreinador.security.SecurityConfig;
import com.dossiertreinador.security.JwtAuthenticationEntryPoint;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.dossiertreinador.security.JwtService;

@WebMvcTest(ConvocatoriaController.class)
@AutoConfigureMockMvc
@WithMockUser(roles = "TREINADOR")
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, JwtAuthenticationFilter.class})
class ConvocatoriaControllerTest {

    @MockBean
    private JwtService jwtService;
    
    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ConvocatoriaService convocatoriaService;

    @MockBean
    private ConvocatoriaMapper convocatoriaMapper;

    private UUID eventoId;
    private ConvocatoriaRequestDTO requestDTO;
    private Convocatoria convocatoria;

    @BeforeEach
    void setUp() {
        eventoId = UUID.randomUUID();
        
        requestDTO = ConvocatoriaRequestDTO.builder()
                .atletaIds(List.of(UUID.randomUUID()))
                .limiteConvocados(18)
                .observacoes("Trazer equipamento principal")
                .build();
                
        EventoCalendario evento = EventoCalendario.builder().id(eventoId).build();
        
        convocatoria = Convocatoria.builder()
                .id(UUID.randomUUID())
                .eventoCalendario(evento)
                .limiteConvocados(18)
                .build();
    }

    @Test
    void criarConvocatoria_Retorna201() throws Exception {
        when(convocatoriaService.criarConvocatoria(eq(eventoId), any(), eq(18), any(), org.mockito.ArgumentMatchers.anyBoolean()))
                .thenReturn(convocatoria);
                
        // Mock do mapper é opcional se não formos validar o JSON de resposta ao detalhe
        
        mockMvc.perform(post("/api/convocatorias/evento/{eventoId}", eventoId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated());
    }

    @Test
    void obterConvocatoria_Retorna200() throws Exception {
        when(convocatoriaService.obterConvocatoriaPorEvento(eventoId)).thenReturn(convocatoria);

        mockMvc.perform(get("/api/convocatorias/evento/{eventoId}", eventoId))
                .andExpect(status().isOk());
    }
}
