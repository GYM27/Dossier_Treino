package com.dossiertreinador.domain.mappers;

import com.dossiertreinador.domain.dtos.AtletaRequestDTO;
import com.dossiertreinador.domain.dtos.AtletaResponseDTO;
import com.dossiertreinador.domain.entities.Atleta;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.enums.PePreferido;
import com.dossiertreinador.domain.enums.Posicao;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Este é um TESTE UNITÁRIO PURO!
 * Repara que não temos as anotações @DataJpaTest nem @ExtendWith(MockitoExtension.class).
 * Porquê? Porque o Mapper é apenas uma classe matemática simples. Não fala com BDs nem Serviços.
 * Executa em 0.0001 segundos!
 */
class AtletaMapperTest {

    // Criamos o nosso tradutor manualmente para o testar
    private final AtletaMapper mapper = new AtletaMapper();

    @Test
    void deveConverterRequestDTOParaEntidade() {
        // Arrange
        UUID equipaId = UUID.randomUUID();
        Equipa equipa = Equipa.builder().id(equipaId).nome("Seniores").build();
        
        AtletaRequestDTO dto = AtletaRequestDTO.builder()
                .nome("Ronaldo")
                .dataNascimento(LocalDate.of(1985, 2, 5))
                .posicaoPrincipal(Posicao.AVANCADO_CENTRO)
                .pePreferido(PePreferido.DESTRO)
                .equipaId(equipaId)
                .build();

        // Act - Tradução
        Atleta entidade = mapper.toEntity(dto, equipa);

        // Assert - Validamos se não se perdeu informação na tradução
        assertThat(entidade.getNome()).isEqualTo("Ronaldo");
        assertThat(entidade.getEquipa().getNome()).isEqualTo("Seniores");
        
        // A entidade acabada de criar não deve ter ID (o ID só nasce ao gravar na BD)
        assertThat(entidade.getId()).isNull(); 
    }

    @Test
    void deveConverterEntidadeParaResponseDTOECalcularIdade() {
        // Arrange
        Equipa equipa = Equipa.builder().nome("Veteranos").build();
        
        // Truque de testes: Vamos criar um nascimento há EXATAMENTE 30 anos atrás (seja qual for o dia de hoje)
        LocalDate trintaAnosAtras = LocalDate.now().minusYears(30);
        
        Atleta atleta = Atleta.builder()
                .id(UUID.randomUUID())
                .nome("Figo")
                .dataNascimento(trintaAnosAtras)
                .posicaoPrincipal(Posicao.EXTREMO_DIREITO)
                .equipa(equipa)
                .build();

        // Act - Tradução para Saída (onde a matemática acontece)
        AtletaResponseDTO dto = mapper.toResponseDTO(atleta);

        // Assert
        assertThat(dto.getNome()).isEqualTo("Figo");
        
        // TESTE CRÍTICO: Garantimos que o cálculo da idade não tem falhas!
        assertThat(dto.getIdade()).isEqualTo(30); 
        
        // Apenas a String foi passada para o DTO, não o objeto
        assertThat(dto.getNomeEquipa()).isEqualTo("Veteranos"); 
    }
}
