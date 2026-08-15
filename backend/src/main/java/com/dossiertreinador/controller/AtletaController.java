package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.AtletaRequestDTO;
import com.dossiertreinador.domain.dtos.AtletaResponseDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.mappers.AtletaMapper;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.service.AtletaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.List;

@RestController // Diz ao Spring: "Esta classe atende o telefone (Internet) e devolve tudo em formato JSON"
@RequestMapping("/api/atletas") // Define o endereço do nosso "Empregado de Mesa"
@RequiredArgsConstructor
public class AtletaController {

    private final AtletaService atletaService;
    private final AtletaMapper atletaMapper;
    private final EquipaRepository equipaRepository; // Usado temporariamente para validar o ID enviado no DTO

    // O método HTTP POST é a convenção universal da Internet para "CRIAR" algo
    // A anotação @Valid é crucial: ela liga as validações do nosso DTO (@Past, @NotNull)!
    // Endpoint POST: Criar
    @PostMapping
    public ResponseEntity<AtletaResponseDTO> registarAtleta(@Valid @RequestBody AtletaRequestDTO dto) {
        Equipa equipa = equipaRepository.findById(dto.getEquipaId())
                .orElseThrow(() -> new IllegalArgumentException("Equipa não encontrada!"));

        Atleta atletaParaGravar = atletaMapper.toEntity(dto, equipa);
        Atleta atletaGravado = atletaService.registarNovoAtleta(atletaParaGravar);
        
        AtletaResponseDTO resposta = atletaMapper.toResponseDTO(atletaGravado);
        return new ResponseEntity<>(resposta, HttpStatus.CREATED);
    }

    // Endpoint GET: Listar por equipa (via query param)
    @GetMapping
    public ResponseEntity<List<AtletaResponseDTO>> listarAtletas(@RequestParam UUID equipaId) {
        List<Atleta> atletas = atletaService.listarPorEquipa(equipaId);
        List<AtletaResponseDTO> resposta = atletas.stream()
                .map(atletaMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(resposta);
    }

    // Endpoint GET: Listar por equipa (via path variable)
    @GetMapping("/equipa/{equipaId}")
    public ResponseEntity<List<AtletaResponseDTO>> listarAtletasPorEquipaPath(@PathVariable UUID equipaId) {
        List<Atleta> atletas = atletaService.listarPorEquipa(equipaId);
        List<AtletaResponseDTO> resposta = atletas.stream()
                .map(atletaMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(resposta);
    }

    // Endpoint PUT: Atualizar
    @PutMapping("/{id}")
    public ResponseEntity<AtletaResponseDTO> atualizarAtleta(
            @PathVariable UUID id, 
            @Valid @RequestBody AtletaRequestDTO dto) {
            
        Equipa equipa = equipaRepository.findById(dto.getEquipaId())
                .orElseThrow(() -> new IllegalArgumentException("Equipa não encontrada!"));

        Atleta atletaParaAtualizar = atletaMapper.toEntity(dto, equipa);
        Atleta atletaGravado = atletaService.atualizarAtleta(id, atletaParaAtualizar);
        
        AtletaResponseDTO resposta = atletaMapper.toResponseDTO(atletaGravado);
        return ResponseEntity.ok(resposta);
    }
}
