package com.dossiertreinador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * A classe principal do Dossier do Treinador.
 * É aqui que a magia do Spring Boot começa.
 */
@SpringBootApplication
public class DossierTreinadorApplication {

    /**
     * O método main é o ponto de entrada tradicional de qualquer programa Java.
     * 
     * @param args argumentos de linha de comando que possamos passar ao iniciar.
     */
    public static void main(String[] args) {
        // Ao chamar o SpringApplication.run, o Spring Boot assume o controlo.
        // Ele varre todo o nosso projeto em busca de componentes (Serviços, Controladores, Repositórios)
        // e inicia o servidor web embutido (Tomcat) para escutar na porta 8080.
        SpringApplication.run(DossierTreinadorApplication.class, args);
    }

    @Bean
    public CommandLineRunner fixDbConstraints(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE registo_assiduidade DROP CONSTRAINT IF EXISTS registo_assiduidade_tipo_assiduidade_check");
                jdbcTemplate.execute("ALTER TABLE sessao_treino DROP COLUMN IF EXISTS data");
                jdbcTemplate.execute("ALTER TABLE sessao_treino DROP COLUMN IF EXISTS hora");
                jdbcTemplate.execute("ALTER TABLE sessao_treino DROP COLUMN IF EXISTS microciclo");
                jdbcTemplate.execute("ALTER TABLE sessao_treino DROP COLUMN IF EXISTS morfociclo");
                jdbcTemplate.execute("ALTER TABLE sessao_treino DROP COLUMN IF EXISTS fase");
                System.out.println("✅ Constraint de TipoAssiduidade e colunas antigas limpas com sucesso!");
            } catch (Exception e) {
                System.out.println("Aviso ao limpar DB: " + e.getMessage());
            }
        };
    }
}
