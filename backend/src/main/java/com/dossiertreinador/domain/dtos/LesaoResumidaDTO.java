package com.dossiertreinador.domain.dtos;

import com.dossiertreinador.domain.enums.EstadoLesao;
import com.dossiertreinador.domain.enums.TipoLesao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * 🔐 DTO Resumido (Para VISUALIZADOR).
 * Oculta completamente a 'descricao' médica, 'observacoes' e auditoria.
 * Apenas diz: "Este jogador tem um problema (tipo) e o seu estado é X".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LesaoResumidaDTO {
    
    private UUID id;
    private UUID atletaId;
    private String nomeAtleta;
    
    private TipoLesao tipoLesao;
    private EstadoLesao estadoLesao;
    
    private LocalDate dataOcorrencia;
    private LocalDate dataRetornoPrevista;
}
