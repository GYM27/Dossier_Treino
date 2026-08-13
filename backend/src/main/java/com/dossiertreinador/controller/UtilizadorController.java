package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.UtilizadorResponseDTO;
import com.dossiertreinador.domain.dtos.UtilizadorUpdateDTO;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.repository.UtilizadorRepository;
import com.dossiertreinador.service.UtilizadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilizadores")
@RequiredArgsConstructor
public class UtilizadorController {

    private final UtilizadorRepository utilizadorRepository;
    private final UtilizadorService utilizadorService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('TREINADOR')")
    public ResponseEntity<List<UtilizadorResponseDTO>> listarEquipaTecnica() {
        // 1. Vai à BD buscar toda a gente
        List<Utilizador> todosOsUtilizadores = utilizadorRepository.findAll();

        // 2. Filtra e transforma cada Utilizador num DTO seguro (sem passwords!)
        List<UtilizadorResponseDTO> resposta = todosOsUtilizadores.stream()
                .map(utilizador -> UtilizadorResponseDTO.builder()
                        .id(utilizador.getId())
                        .nomeCompleto(utilizador.getNomeCompleto())
                        .email(utilizador.getEmail())
                        .cargo(utilizador.getCargo() != null ? utilizador.getCargo().name() : "N/A")
                        .build())
                .collect(Collectors.toList());

        // 3. Devolve a lista limpa ao Frontend
        return ResponseEntity.ok(resposta);
    }

    @PutMapping("/me")
    public ResponseEntity<UtilizadorResponseDTO> atualizarPerfil(
            @Valid @RequestBody UtilizadorUpdateDTO dto,
            @AuthenticationPrincipal Utilizador utilizadorLogado
    ) {
        Utilizador utilizadorAtualizado = utilizadorService.atualizarPerfil(utilizadorLogado, dto);

        UtilizadorResponseDTO resposta = UtilizadorResponseDTO.builder()
                .id(utilizadorAtualizado.getId())
                .nomeCompleto(utilizadorAtualizado.getNomeCompleto())
                .email(utilizadorAtualizado.getEmail())
                .cargo(utilizadorAtualizado.getCargo() != null ? utilizadorAtualizado.getCargo().name() : "N/A")
                .build();

        return ResponseEntity.ok(resposta);
    }
}
