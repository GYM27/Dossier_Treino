package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.ExercicioDTO;
import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;
import com.dossiertreinador.domain.mappers.ExercicioMapper;
import com.dossiertreinador.security.JwtAuthenticationFilter;
import com.dossiertreinador.service.ExercicioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExercicioController.class)
@Import({com.dossiertreinador.security.SecurityConfig.class, JwtAuthenticationFilter.class, com.dossiertreinador.security.JwtAuthenticationEntryPoint.class})
class ExercicioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExercicioService exercicioService;

    @MockBean
    private ExercicioMapper exercicioMapper;

    @MockBean
    private com.dossiertreinador.security.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "treinador@equipa.pt", roles = {"TREINADOR"})
    void testCriarExercicio() throws Exception {
        ExercicioDTO request = ExercicioDTO.builder()
                .nome("Sprints")
                .categoria(CategoriaExercicio.FISICO)
                .build();

        Exercicio entidade = Exercicio.builder().nome("Sprints").build();

        when(exercicioMapper.toEntity(any())).thenReturn(entidade);
        when(exercicioService.criarExercicio(any())).thenReturn(entidade);
        when(exercicioMapper.toDTO(any())).thenReturn(request);

        mockMvc.perform(post("/api/exercicios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Sprints"));
    }

    @Test
    @WithMockUser(username = "treinador@equipa.pt", roles = {"TREINADOR"})
    void testAtualizarExercicio() throws Exception {
        java.util.UUID id = java.util.UUID.randomUUID();
        ExercicioDTO request = ExercicioDTO.builder()
                .id(id)
                .nome("Rondo 4v4 + 3")
                .categoria(CategoriaExercicio.TATICO)
                .build();

        Exercicio entidade = Exercicio.builder().id(id).nome("Rondo 4v4 + 3").build();

        when(exercicioMapper.toEntity(any())).thenReturn(entidade);
        when(exercicioService.atualizarExercicio(any(), any())).thenReturn(entidade);
        when(exercicioMapper.toDTO(any())).thenReturn(request);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/exercicios/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Rondo 4v4 + 3"));
    }

    @Test
    @WithMockUser(username = "treinador@equipa.pt", roles = {"TREINADOR"})
    void testEliminarExercicio() throws Exception {
        java.util.UUID id = java.util.UUID.randomUUID();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/exercicios/" + id))
                .andExpect(status().isNoContent());
    }
}
