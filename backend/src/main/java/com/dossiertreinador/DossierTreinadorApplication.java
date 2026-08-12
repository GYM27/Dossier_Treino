package com.dossiertreinador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

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

}
