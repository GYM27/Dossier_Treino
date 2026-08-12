package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.AtletaRequestDTO;
import com.dossiertreinador.domain.dtos.AtletaResponseDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Equipa;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

/**
 * A classe Mapper atua como o nosso "Tradutor" oficial.
 * @Component diz ao Spring para manter uma cópia deste tradutor na memória
 * para podermos usá-lo em qualquer parte do sistema.
 */
@Component
public class AtletaMapper {

    // 1. Recebe o DTO (vindos da Internet) e o objeto Equipa já validado pela Base de Dados
    public Atleta toEntity(AtletaRequestDTO dto, Equipa equipa) {
        if (dto == null) return null;
        
        return Atleta.builder()
                // Nós não mapeamos o ID aqui porque é a Base de Dados que o gera (nova inserção)!
                .nome(dto.getNome())
                .dataNascimento(dto.getDataNascimento())
                .alturaCm(dto.getAlturaCm())
                .pesoKg(dto.getPesoKg())
                .nacionalidade(dto.getNacionalidade())
                .posicaoPrincipal(dto.getPosicaoPrincipal())
                .posicaoSecundaria(dto.getPosicaoSecundaria())
                .pePreferido(dto.getPePreferido())
                // A grande conversão: O DTO trazia um simples UUID, mas nós
                // injetamos na entidade Atleta o objeto Equipa verdadeiro e completo.
                .equipa(equipa)
                .build();
    }

    // 2. Transforma a Entidade Atleta num ResponseDTO para enviarmos de volta à Internet
    public AtletaResponseDTO toResponseDTO(Atleta atleta) {
        if (atleta == null) return null;
        
        // Magia do Java 8+ para calcular a idade exata (Anos entre a Data Nascimento e Hoje)
        int idadeCalculada = Period.between(atleta.getDataNascimento(), LocalDate.now()).getYears();
        
        // Proteção extra: Caso o atleta por algum motivo bizarro não tenha equipa
        String nomeEquipa = (atleta.getEquipa() != null) ? atleta.getEquipa().getNome() : "Sem Equipa";

        return AtletaResponseDTO.builder()
                .id(atleta.getId())
                .nome(atleta.getNome())
                .idade(idadeCalculada) // A idade é injetada já calculada!
                .nacionalidade(atleta.getNacionalidade())
                .posicaoPrincipal(atleta.getPosicaoPrincipal())
                .pePreferido(atleta.getPePreferido() != null ? atleta.getPePreferido().name() : null)
                .nomeEquipa(nomeEquipa) // O telemóvel recebe apenas o nome, e não a equipa inteira
                .build();
    }
}
