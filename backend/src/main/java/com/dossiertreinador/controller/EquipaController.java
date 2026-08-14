package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.EquipaResponseDTO;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.mappers.EquipaMapper;
import com.dossiertreinador.repository.EquipaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dossiertreinador.domain.dtos.EquipaRequestDTO;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.service.EquipaService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/equipas")
@RequiredArgsConstructor
public class EquipaController {

    private final EquipaRepository equipaRepository;
    private final EquipaMapper equipaMapper;
    private final EquipaService equipaService;

    @GetMapping
    public ResponseEntity<List<EquipaResponseDTO>> listarTodasAsEquipas() {
        List<Equipa> equipas = equipaRepository.findAll();
        
        List<EquipaResponseDTO> resposta = equipas.stream()
                .map(equipaMapper::toResponseDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(resposta);
    }

    @PostMapping
    public ResponseEntity<EquipaResponseDTO> criarEquipa(
            @Valid @RequestBody EquipaRequestDTO requestDTO,
            @AuthenticationPrincipal Utilizador utilizador
    ) {
        Equipa novaEquipa = Equipa.builder()
                .nome(requestDTO.getNome())
                .escalao(requestDTO.getEscalao())
                .modalidade(requestDTO.getModalidade())
                .duracaoJogo(requestDTO.getDuracaoJogo())
                .numeroJogadores(requestDTO.getNumeroJogadores())
                .emblemaUrl(requestDTO.getEmblemaUrl())
                .build();
                
        Equipa equipaGuardada = equipaService.criarEquipa(novaEquipa, requestDTO.getDesignacaoEpoca(), utilizador);
        
        return ResponseEntity.ok(equipaMapper.toResponseDTO(equipaGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipaResponseDTO> atualizarEquipa(
            @PathVariable java.util.UUID id,
            @RequestBody EquipaRequestDTO requestDTO
    ) {
        Equipa equipaAtualizada = Equipa.builder()
                .modalidade(requestDTO.getModalidade())
                .duracaoJogo(requestDTO.getDuracaoJogo())
                .numeroJogadores(requestDTO.getNumeroJogadores())
                .emblemaUrl(requestDTO.getEmblemaUrl())
                .build();
                
        Equipa equipaGuardada = equipaService.atualizarEquipa(id, equipaAtualizada);
        return ResponseEntity.ok(equipaMapper.toResponseDTO(equipaGuardada));
    }
}
