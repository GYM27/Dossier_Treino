package com.dossiertreinador.domain.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class SessaoTreinoRequestDTO {
    
    @NotNull(message = "O ID do evento é obrigatório.")
    private UUID eventoId;

    private Integer numeroJogadores;
    private String material;

    private String objetivo;
    
    @Min(value = 1, message = "Intensidade mínima é 1.")
    @Max(value = 5, message = "Intensidade máxima é 5.")
    private Integer intensidadeGeral;

    private Integer mesociclo;
    private Integer microciclo;
    private Integer unidadeTreino;
    private String periodo;

    @NotNull(message = "O ID da equipa é obrigatório.")
    private UUID equipaId;
}
