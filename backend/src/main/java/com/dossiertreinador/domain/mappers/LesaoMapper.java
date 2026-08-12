package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.LesaoDetalhadaDTO;
import com.dossiertreinador.domain.dtos.LesaoRequestDTO;
import com.dossiertreinador.domain.dtos.LesaoResumidaDTO;
import com.dossiertreinador.domain.entities.Lesao;
import org.springframework.stereotype.Component;

@Component
public class LesaoMapper {

    public Lesao toEntity(LesaoRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Lesao.builder()
                .tipoLesao(dto.getTipoLesao())
                .descricao(dto.getDescricao())
                .dataOcorrencia(dto.getDataOcorrencia())
                .dataRetornoPrevista(dto.getDataRetornoPrevista())
                .estadoLesao(dto.getEstadoLesao())
                .observacoes(dto.getObservacoes())
                .build();
    }

    public LesaoDetalhadaDTO toDetalhadaDTO(Lesao entity) {
        if (entity == null) {
            return null;
        }

        return LesaoDetalhadaDTO.builder()
                .id(entity.getId())
                .atletaId(entity.getAtleta().getId())
                .nomeAtleta(entity.getAtleta().getNome())
                .tipoLesao(entity.getTipoLesao())
                .descricao(entity.getDescricao())
                .dataOcorrencia(entity.getDataOcorrencia())
                .dataRetornoPrevista(entity.getDataRetornoPrevista())
                .estadoLesao(entity.getEstadoLesao())
                .observacoes(entity.getObservacoes())
                .registadoPor(entity.getRegistadoPor())
                .alteradoPor(entity.getAlteradoPor())
                .dataCriacao(entity.getDataCriacao())
                .dataAlteracao(entity.getDataAlteracao())
                .build();
    }

    public LesaoResumidaDTO toResumidaDTO(Lesao entity) {
        if (entity == null) {
            return null;
        }

        return LesaoResumidaDTO.builder()
                .id(entity.getId())
                .atletaId(entity.getAtleta().getId())
                .nomeAtleta(entity.getAtleta().getNome())
                .tipoLesao(entity.getTipoLesao())
                .estadoLesao(entity.getEstadoLesao())
                .dataOcorrencia(entity.getDataOcorrencia())
                .dataRetornoPrevista(entity.getDataRetornoPrevista())
                // NOTA 🔐: A 'descricao' médica não é copiada para este DTO propositadamente!
                .build();
    }
}
