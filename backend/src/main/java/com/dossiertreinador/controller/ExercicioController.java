package com.dossiertreinador.controller;

import com.dossiertreinador.domain.dtos.ExercicioDTO;
import com.dossiertreinador.domain.entities.Exercicio;
import com.dossiertreinador.domain.enums.CategoriaExercicio;
import com.dossiertreinador.domain.mappers.ExercicioMapper;
import com.dossiertreinador.service.ExercicioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercicios")
@RequiredArgsConstructor
public class ExercicioController {

    private final ExercicioService exercicioService;
    private final ExercicioMapper exercicioMapper;

    @PostMapping
    public ResponseEntity<ExercicioDTO> criarExercicio(@Valid @RequestBody ExercicioDTO dto) {
        Exercicio entidade = exercicioMapper.toEntity(dto);
        Exercicio salvo = exercicioService.criarExercicio(entidade);
        return new ResponseEntity<>(exercicioMapper.toDTO(salvo), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExercicioDTO>> listarTodos(@RequestParam(required = false) CategoriaExercicio categoria) {
        List<Exercicio> exercicios;
        if (categoria != null) {
            exercicios = exercicioService.listarPorCategoria(categoria);
        } else {
            exercicios = exercicioService.listarTodos();
        }
        
        List<ExercicioDTO> resposta = exercicios.stream()
                .map(exercicioMapper::toDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(resposta);
    }
}
