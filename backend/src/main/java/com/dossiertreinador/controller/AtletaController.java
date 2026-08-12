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
import org.springframework.web.bind.annotation.*;

@RestController // Diz ao Spring: "Esta classe atende o telefone (Internet) e devolve tudo em formato JSON"
@RequestMapping("/api/atletas") // Define o endereço do nosso "Empregado de Mesa"
@RequiredArgsConstructor
public class AtletaController {

    private final AtletaService atletaService;
    private final AtletaMapper atletaMapper;
    private final EquipaRepository equipaRepository; // Usado temporariamente para validar o ID enviado no DTO

    // O método HTTP POST é a convenção universal da Internet para "CRIAR" algo
    // A anotação @Valid é crucial: ela liga as validações do nosso DTO (@Past, @NotNull)!
    @PostMapping
    public ResponseEntity<AtletaResponseDTO> registarAtleta(@Valid @RequestBody AtletaRequestDTO dto) {
        
        // 1. Procuramos a equipa. Se não existir, atiramos um erro (apanhado pelo GlobalExceptionHandler!)
        Equipa equipa = equipaRepository.findById(dto.getEquipaId())
                .orElseThrow(() -> new IllegalArgumentException("Equipa não encontrada!"));

        // 2. O Tradutor converte a encomenda JSON na nossa Entidade Java verdadeira
        Atleta atletaParaGravar = atletaMapper.toEntity(dto, equipa);

        // 3. Mandamos para a Cozinha (A nossa Lógica de Negócio nos Services)
        Atleta atletaGravado = atletaService.registarNovoAtleta(atletaParaGravar);

        // 4. O Tradutor converte a Entidade gravada no nosso "Envelope Seguro" de saída (ResponseDTO)
        AtletaResponseDTO resposta = atletaMapper.toResponseDTO(atletaGravado);

        // 5. Devolvemos a resposta à Internet com o carimbo oficial HTTP 201 (CREATED)
        return new ResponseEntity<>(resposta, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<java.util.List<AtletaResponseDTO>> listarTodosAtletas() {
        java.util.List<com.dossiertreinador.domain.entities.Atleta> atletas = atletaService.listarTodos();
        
        java.util.List<AtletaResponseDTO> resposta = atletas.stream()
                .map(atletaMapper::toResponseDTO)
                .toList();
                
        return ResponseEntity.ok(resposta);
    }
}
