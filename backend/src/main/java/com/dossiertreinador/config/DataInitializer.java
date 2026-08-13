package com.dossiertreinador.config;

import com.dossiertreinador.domain.entities.Epoca;
import com.dossiertreinador.domain.entities.Equipa;
import com.dossiertreinador.domain.entities.Utilizador;
import com.dossiertreinador.domain.enums.Cargo;
import com.dossiertreinador.domain.enums.Papel;
import com.dossiertreinador.repository.EpocaRepository;
import com.dossiertreinador.repository.EquipaRepository;
import com.dossiertreinador.repository.UtilizadorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@Slf4j
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            UtilizadorRepository utilizadorRepository, 
            EpocaRepository epocaRepository,
            EquipaRepository equipaRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se a base de dados já tem utilizadores
            if (utilizadorRepository.count() == 0) {
                log.info("Base de dados de utilizadores vazia. A semear o Administrador Principal...");

                Utilizador admin = Utilizador.builder()
                        .nomeCompleto("Administrador do Clube")
                        .email("admin@clube.pt")
                        // O BCrypt vai encriptar a password antes de gravar!
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .papel(Papel.ADMINISTRADOR)
                        .cargo(Cargo.DIRETOR_DESPORTIVO)
                        .build();

                utilizadorRepository.save(admin);
                log.info("=========================================================");
                log.info("CONTA DE ADMINISTRAÇÃO CRIADA COM SUCESSO!");
                log.info("Email: admin@clube.pt");
                log.info("Password: admin123");
                log.info("=========================================================");
                
                log.info("A semear a Época e Equipa inicial...");
                Epoca epoca = Epoca.builder()
                        .designacao("Época 2025/2026")
                        .dataInicio(LocalDate.of(2025, 7, 1))
                        .dataFim(LocalDate.of(2026, 6, 30))
                        .isAtiva(true)
                        .build();
                epocaRepository.save(epoca);
                
                Equipa equipaPrincipal = Equipa.builder()
                        .nome("Plantel Principal")
                        .escalao("Seniores")
                        .epoca(epoca)
                        .build();
                equipaRepository.save(equipaPrincipal);
                
                log.info("Equipa 'Plantel Principal' semeada com sucesso! 0 Atletas inseridos (começo do zero).");
            }
        };
    }
}
