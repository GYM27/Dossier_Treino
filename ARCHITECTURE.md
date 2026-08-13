# Arquitetura e DecisÃµes TÃ©cnicas: Dossier do Treinador

Este documento Ã© o nosso "diÃ¡rio de bordo" de Engenharia de Software. Aqui registamos a evoluÃ§Ã£o da arquitetura e as justificaÃ§Ãµes tÃ©cnicas do projeto, escrito numa Ã³tica de aprendizagem passo-a-passo.

---

## Fase 1: Scaffolding e Assiduidade

### Etapa 1: Scaffolding (ConfiguraÃ§Ã£o Inicial)

#### O Ficheiro pom.xml
- **O que Ã©:** O coraÃ§Ã£o do nosso projeto Maven, responsÃ¡vel por gerir as bibliotecas (dependÃªncias) que usamos.
- **Java 21:** Escolhemos usar Java 21 por ser a versÃ£o LTS (Long Term Support) mais recente e robusta.
- **Starters do Spring Boot:** Usamos os `spring-boot-starter-*` para importar mÃ³dulos inteiros (como `Web`, `Data JPA` e `Validation`) de forma fÃ¡cil, sem nos preocuparmos com incompatibilidades entre as centenas de sub-bibliotecas que os compÃµem.
- **Lombok:** Adicionado para remover cÃ³digo repetitivo e maÃ§udo ("boilerplate") como getters, setters e construtores. MantÃ©m os ficheiros pequenos e fÃ¡ceis de ler.
- **Bases de Dados MÃºltiplas:** 
  - `postgresql`: Para correr a aplicaÃ§Ã£o em ambiente de desenvolvimento real e produÃ§Ã£o.
  - `h2`: Base de dados em memÃ³ria configurada com `scope="test"`. Isto significa que a H2 sÃ³ "nasce" e "morre" quando corremos os nossos testes (TDD), permitindo testar o acesso a dados numa fraÃ§Ã£o de segundo, sem afetar os dados reais.

### PadrÃ£o de Arquitetura em Camadas (Clean Architecture Simplificada)
Durante a Fase 1, implementÃ¡mos o padrÃ£o industrial para aplicaÃ§Ãµes Java Spring Boot:
1. **Entidades (`entities/`)**: Classes que mapeiam 1-para-1 com as tabelas da BD atravÃ©s do Hibernate. TÃªm restriÃ§Ãµes nativas do Java (`@Past`, `@Max`) para garantir integridade.
2. **RepositÃ³rios (`repository/`)**: Interfaces MÃ¡gicas do Spring Data JPA. Com uma simples assinatura de mÃ©todo (`findByEquipaId`), o Spring gera o SQL. Para queries complexas, usamos JPQL (`@Query`).
3. **ServiÃ§os (`service/` e `impl/`)**: Ã‰ o cÃ©rebro da aplicaÃ§Ã£o. SeparÃ¡mos as Interfaces das ImplementaÃ§Ãµes para desacoplar a lÃ³gica (O "Menu" vs a "Cozinha"). Ã‰ aqui que agrupamos aÃ§Ãµes como `registarEventoEGerarGrelha` e as protegemos com `@Transactional` para evitar dados corrompidos.
4. **DTOs (`dtos/`) e Mappers (`mappers/`)**: Nunca expomos as Entidades Ã  Internet. Usamos Mappers (`@Component`) para converter os pesados objetos de Base de Dados em leves "Envelopes Seguros" (DTOs) com campos calculados (como a Idade).
5. **Controladores (`controller/`)**: A "Porta da Rua". Usam `@RestController` para apanhar os pedidos HTTP (JSON) e passÃ¡-los aos ServiÃ§os.
6. **ExceÃ§Ãµes Globais (`exceptions/`)**: O `@ControllerAdvice` atua como um pÃ¡ra-quedas geral, intercetando todos os erros atirados pelos repositÃ³rios e serviÃ§os, e formatando-os num `ErrorResponse` em JSON (cÃ³digo HTTP 400).

### EstratÃ©gia de Testes (TDD Rigoroso)
- **RepositÃ³rios (`@DataJpaTest`)**: Testados contra a H2. Provou que regras como a nÃ£o duplicaÃ§Ã£o de assiduidades (graÃ§as Ã  `@UniqueConstraint`) bloqueiam efetivamente falhas no SQL.
- **ServiÃ§os (Mockito)**: Testados com `@Mock` e `@InjectMocks` sem base de dados. O uso do `ArgumentCaptor` permitiu testar a complexa lÃ³gica do Batch Insert interceptando a lista em pleno voo.
- **Controladores (`@WebMvcTest`)**: Testados simulando chamadas HTTP `POST` sem levantar um servidor de verdade, com a ferramenta fantÃ¡stica do `MockMvc`.

### Etapa 12: Segurança - Autenticação & Autorização
- **Design Pattern / Arquitetura**: Separação de Contextos de Segurança (Security Config, Filters e JWT Service).
- **Decisão**: Extraímos a criação de beans (PasswordEncoder, UserDetailsService, AuthenticationManager) para uma ApplicationConfig para evitar ciclos de dependência (UnsatisfiedDependencyException), uma vez que SecurityConfig dependia do filtro, e o filtro de beans que seriam instanciados no próprio SecurityConfig.
- **Segurança Stateless**: Não usamos sessões de servidor (Cookies tradicionais JSESSIONID). Em vez disso usamos SessionCreationPolicy.STATELESS com JWT intercetado a cada pedido.
- **Testabilidade**: Os testes unitários de Controller excluem a stack de segurança (usando @AutoConfigureMockMvc(addFilters = false)) para isolar os componentes. Apenas os Testes de Integração (SecurityIntegrationTest.java) levantam o contexto de Segurança completo.

### Etapa 12.1: Revisão de Cibersegurança
- **XSS Prevention (Cookies)**: O JWT deixou de ser enviado no corpo da resposta (JSON) e passou a ser injetado diretamente num cookie HTTPOnly, Secure e SameSite=Strict.
- **Role-Based Access Control (RBAC)**: O endpoint de registo foi removido da whitelist e requer agora autenticação com papel de ADMINISTRADOR ou TREINADOR.
- **Tratamento de Exceções de Segurança**: O Spring Security foi configurado com um JwtAuthenticationEntryPoint para devolver corretamente 401 Unauthorized em vez de 403 Forbidden em acessos não autenticados, enquanto o GlobalExceptionHandler captura credenciais incorretas.
- **Testes Unitários com Segurança**: O @AutoConfigureMockMvc(addFilters = false) foi removido. Os filtros de segurança são ativados nos testes de Controller e a autenticação é simulada via @WithMockUser, forçando a verificação real das anotações @PreAuthorize.

### Etapa 13: Integração Frontend ↔ Backend
- **CORS Seguro**: Foi configurado o CorsConfigurationSource no Spring Security para permitir chamadas do localhost:3000 suportando a flag llowCredentials=true, o que possibilita o tráfego do JWT HttpOnly Cookie.
- **Segurança no Next.js**: Foi criado o utilitário estrito pi.ts que força a flag credentials: 'include' em todos os pedidos e processa eventuais 401 Unauthorized.
- **Proteção de Rotas**: Adicionado o middleware.ts do Next.js. O sistema agora avalia de imediato a presença do cookie jwt na rota e protege o dashboard (Client-side & Server-side protection).
- **Data Fetching (Plantel)**: O componente 
oster-view.tsx foi migrado para ler do backend os Atletas criados na Base de Dados, substituindo os dados mock.

### Etapa 14: Gestão do Plano de Treino
- **Arquitetura Relacional com Catálogo**: Em vez de se escrever o nome do exercício em cada sessão, criou-se a entidade Exercicio (Catálogo global) e a entidade SessaoTreino.
- **Associação Rica (SessaoTreinoExercicio)**: A ligação @OneToMany foi enriquecida para conter atributos específicos do contexto do treino, como ordem, duracaoMinutos e observacoesDoTreinador.
- **Auditoria e RGPD**: O catálogo de exercícios e as sessões estão auditados pelo AuditingEntityListener.

### Etapa 15: O Padrão "Container/Presenter" e Fetching no Dashboard
- **Separação de Preocupações**: A comunicação com a API (fetch, cabeçalhos, tratamento de erros HTTP) foi encapsulada no ficheiro estrito `api.ts`. O componente UI (`dashboard-view.tsx`) agora age apenas como consumidor, mantendo-se agnóstico à lógica de rede.
- **Tipagem Estrita**: Os DTOs do backend são espelhados em TypeScript Interfaces no frontend, ativando early-catch de bugs durante a transpilação em vez de causar erros de runtime no browser.
- **Processamento no Cliente vs Servidor**: Em vez de pedir ao backend a "contagem de defesas", pedimos a lista de atletas inteira (um só pedido REST) e fazemos cálculos de filtragem in-memory no frontend usando `.filter()`. É um *trade-off* adequado para listas pequenas (como plantéis de 25-30 pessoas) reduzindo a carga do servidor de base de dados.

### Etapa 15.1: Clean Code no Frontend (Nomenclatura Descritiva)
- **Conven��es de Nomes:** Adot�mos uma abordagem rigorosa onde os componentes de layout partilhados usam ingl�s estrutural t�cnico (sidebar, 	op-header), enquanto que os ecr�s que representam dom�nios de neg�cio s�o nomeados de forma identificativa e clara (squad, dashboard, ttendance).
- **Remo��o de Sufixos:** Foram removidos sufixos de contexto gen�ricos (como -view) gerados automaticamente, promovendo a simplicidade e evitando ru�do visual no c�digo.
