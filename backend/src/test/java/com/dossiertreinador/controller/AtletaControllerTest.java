package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.AtletaRequestDTO;
import com.dossiertreinador.domain.dtos.AtletaResponseDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import com.dossiertreinador.domain.mappers.AtletaMapper;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.service.AtletaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * @WebMvcTest é mágico! Ele arranca a aplicação Web do Spring de forma muito leve.
 * Não carrega base de dados, carrega APENAS os Controladores para podermos simular 
 * pedidos de Telemóveis ou Browsers.
 */
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import com.dossiertreinador.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Import;
import com.dossiertreinador.security.SecurityConfig;
import com.dossiertreinador.security.JwtAuthenticationEntryPoint;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.dossiertreinador.security.JwtService;

@WebMvcTest(AtletaController.class)
@AutoConfigureMockMvc
@WithMockUser(roles = "TREINADOR")
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, JwtAuthenticationFilter.class})
class AtletaControllerTest {

    @MockBean
    private JwtService jwtService;
    
    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private MockMvc mockMvc; // O nosso "Carteiro Falso". Permite atirar pedidos HTTP.

    @Autowired
    private ObjectMapper objectMapper; // Ferramenta que converte Java <-> JSON.

    // Como não há base de dados, substituímos as peças internas por Mocks.
    @MockBean
    private AtletaService atletaService;

    @MockBean
    private AtletaMapper atletaMapper;

    @MockBean
    private EquipaRepository equipaRepository;

    @Test
    void deveCriarAtletaComSucessoEDevolver201Created() throws Exception {
        // --- 1. ARRANGE ---
        UUID equipaId = UUID.randomUUID();
        Equipa equipa = Equipa.builder().id(equipaId).nome("Seniores").build();
        
        AtletaRequestDTO request = AtletaRequestDTO.builder()
                .nome("Ronaldo")
                .dataNascimento(LocalDate.of(1985, 2, 5))
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO)
                .pePreferido(PePreferido.DESTRO)
                .equipaId(equipaId)
                .build();

        Atleta atletaSimulado = Atleta.builder().id(UUID.randomUUID()).nome("Ronaldo").build();
        
        AtletaResponseDTO responseEsperada = AtletaResponseDTO.builder()
                .id(atletaSimulado.getId())
                .nome("Ronaldo")
                .idade(41)
                .nomeEquipa("Seniores")
                .build();

        // Dizemos aos nossos Bonecos para devolverem respostas certas:
        Mockito.when(equipaRepository.findById(equipaId)).thenReturn(Optional.of(equipa));
        Mockito.when(atletaMapper.toEntity(any(AtletaRequestDTO.class), any(Equipa.class))).thenReturn(atletaSimulado);
        Mockito.when(atletaService.registarNovoAtleta(any(Atleta.class))).thenReturn(atletaSimulado);
        Mockito.when(atletaMapper.toResponseDTO(any(Atleta.class))).thenReturn(responseEsperada);

        // --- 2. ACT & 3. ASSERT ---
        // Disparamos um pedido POST como se fôssemos o Frontend!
        mockMvc.perform(post("/api/atletas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                
                // Assert 1: Validamos que a resposta tem código 201 CREATED
                .andExpect(status().isCreated()) 
                
                // Assert 2: Validamos que o JSON de saída tem a informação correta
                .andExpect(jsonPath("$.nome").value("Ronaldo"))
                .andExpect(jsonPath("$.idade").value(41));
    }

    @Test
    void deveListarAtletasPorEquipaPathComSucesso() throws Exception {
        UUID equipaId = UUID.randomUUID();
        Atleta atleta = Atleta.builder().id(UUID.randomUUID()).nome("Messi").build();
        AtletaResponseDTO dto = AtletaResponseDTO.builder().id(atleta.getId()).nome("Messi").build();

        Mockito.when(atletaService.listarPorEquipa(equipaId)).thenReturn(java.util.List.of(atleta));
        Mockito.when(atletaMapper.toResponseDTO(atleta)).thenReturn(dto);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/atletas/equipa/" + equipaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Messi"));
    }
}
