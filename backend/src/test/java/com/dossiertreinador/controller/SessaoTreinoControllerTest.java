package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.SessaoTreinoRequestDTO;
import com.dossiertreinador.domain.dtos.SessaoTreinoResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.EventoCalendario;
import com.dossiertreinador.domain.entities.SessaoTreino;
import com.dossiertreinador.domain.mappers.SessaoTreinoMapper;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.repository.EventoCalendarioRepository;
import com.dossiertreinador.repository.SessaoTreinoRepository;
import com.dossiertreinador.security.JwtAuthenticationEntryPoint;
import com.dossiertreinador.security.JwtAuthenticationFilter;
import com.dossiertreinador.security.JwtService;
import com.dossiertreinador.security.SecurityConfig;
import com.dossiertreinador.service.SessaoTreinoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
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
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtAuthenticationEntryPoint.class})
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
    private EventoCalendarioRepository eventoCalendarioRepository;

    @MockBean
    private SessaoTreinoRepository sessaoTreinoRepository;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "treinador@equipa.pt", roles = {"TREINADOR"})
    void testCriarSessao() throws Exception {
        UUID equipaId = UUID.randomUUID();
        UUID eventoId = UUID.randomUUID();
        
        SessaoTreinoRequestDTO request = new SessaoTreinoRequestDTO();
        request.setEventoId(eventoId);
        request.setEquipaId(equipaId);
        
        SessaoTreinoResponseDTO response = SessaoTreinoResponseDTO.builder()
                .equipaId(equipaId)
                .duracaoTotalMinutos(0)
                .build();

        when(equipaRepository.findById(equipaId)).thenReturn(Optional.of(new Equipa()));
        when(eventoCalendarioRepository.findById(eventoId)).thenReturn(Optional.of(new com.dossiertreinador.domain.entities.EventoCalendario()));
        when(sessaoTreinoService.criarSessao(any())).thenReturn(new SessaoTreino());
        when(sessaoTreinoMapper.toEntity(any(), any(), any())).thenReturn(new SessaoTreino());
        when(sessaoTreinoMapper.toResponseDTO(any())).thenReturn(response);

        mockMvc.perform(post("/api/treinos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipaId").value(equipaId.toString()));
    }
    @Test
    @WithMockUser(username = "treinador@equipa.pt", roles = {"TREINADOR"})
    void testAtualizarExercicioNaSessao() throws Exception {
        UUID sessaoId = UUID.randomUUID();
        UUID assocId = UUID.randomUUID();
        
        com.dossiertreinador.domain.dtos.SessaoTreinoExercicioDTO request = com.dossiertreinador.domain.dtos.SessaoTreinoExercicioDTO.builder()
                .duracaoMinutos(20)
                .ordem(1)
                .observacoesDoTreinador("Foco no passe rápido")
                .build();
                
        SessaoTreinoResponseDTO response = SessaoTreinoResponseDTO.builder()
                .id(sessaoId)
                .duracaoTotalMinutos(20)
                .build();

        when(sessaoTreinoService.atualizarExercicioNaSessao(any(), any(), any(), any(), any())).thenReturn(new SessaoTreino());
        when(sessaoTreinoMapper.toResponseDTO(any())).thenReturn(response);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/treinos/{sessaoId}/exercicios/{assocId}", sessaoId, assocId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duracaoTotalMinutos").value(20));
    }
}
