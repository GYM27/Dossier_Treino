package com.dossiertreinador.controller;

import com.dossiertreinador.domain.entities.Adversario;
import com.dossiertreinador.service.AdversarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/adversarios")
public class AdversarioController {

    @Autowired
    private AdversarioService service;

    @PostMapping
    public ResponseEntity<Adversario> criar(@Valid @RequestBody Adversario adversario) {
        Adversario criado = service.salvar(adversario);
        return ResponseEntity.ok(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Adversario> atualizar(@PathVariable UUID id, @Valid @RequestBody Adversario adversario) {
        adversario.setId(id);
        Adversario atualizado = service.atualizar(adversario);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Adversario> findById(@PathVariable UUID id) {
        Adversario adversario = service.findById(id);
        return ResponseEntity.ok(adversario);
    }

    @GetMapping
    public ResponseEntity<List<Adversario>> listarTodos() {
        List<Adversario> lista = service.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<Adversario>> findByEventoCalendarioId(@PathVariable UUID eventoId) {
        List<Adversario> lista = service.findByEventoCalendarioId(eventoId);
        return ResponseEntity.ok(lista);
    }
}