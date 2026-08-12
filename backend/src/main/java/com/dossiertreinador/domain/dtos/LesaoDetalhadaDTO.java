package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.enums.TipoLesao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 🔐 DTO Detalhado (Para TREINADOR_PRINCIPAL, FISIOTERAPEUTA, ADMIN).
 * Inclui os campos sensíveis como 'descricao' clínica e observações completas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LesaoDetalhadaDTO {
    
    private UUID id;
    private UUID atletaId;
    private String nomeAtleta;
    
    private TipoLesao tipoLesao;
    private String descricao; // Dado clínico sensível
    
    private LocalDate dataOcorrencia;
    private LocalDate dataRetornoPrevista;
    private EstadoLesao estadoLesao;
    private String observacoes;
    
    // Auditoria
    private String registadoPor;
    private String alteradoPor;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
}
