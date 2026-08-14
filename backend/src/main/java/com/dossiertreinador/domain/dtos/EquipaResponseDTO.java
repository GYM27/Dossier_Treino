package com.dossiertreinador.domain.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EquipaResponseDTO {
    private UUID id;
    private String nome;
    private String escalao;
    private String epocaNome;
    private String modalidade;
    private String duracaoJogo;
    private String numeroJogadores;
    private String emblemaUrl;
}
