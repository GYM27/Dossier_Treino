# Caderno de Apontamentos: Dossier do Treinador

Este documento guarda as explicaÃ§Ãµes passo a passo (o "por detrÃ¡s dos panos") de cada linha de cÃ³digo implementada ao longo do projeto. Serve como o teu caderno de estudo pessoal.

---

## Fase 1: Scaffolding (ConfiguraÃ§Ã£o Inicial)

### 1. `pom.xml` (O Gestor de DependÃªncias)
*(O ficheiro `pom.xml` estÃ¡ detalhado no `ARCHITECTURE.md` a nÃ­vel arquitetural, mas em resumo, Ã© ele que faz o download automÃ¡tico de bibliotecas como o Spring Web, Hibernate, Lombok e Drivers de Base de Dados, poupando-nos de configurar JARs e *classpaths* manualmente).*

### 2. `application.properties` (A nossa ligaÃ§Ã£o ao Postgres)
*Ficheiro: `backend/src/main/resources/application.properties`*

No Spring Boot, em vez de termos o nosso cÃ³digo Java cheio de senhas de bases de dados ou portas espalhadas, centralizamos todas as configuraÃ§Ãµes "externas" aqui.
- Defini a porta para `8080` (assim que a app arrancar, vamos poder aceder a `http://localhost:8080`).
- Coloquei o URL do nosso Postgres (`jdbc:postgresql://localhost:5432/dossier_treinador`) e as credenciais (`postgres`).
- Liguei o **`hibernate.ddl-auto=update`**. O Hibernate Ã© a ferramenta mÃ¡gica que lÃª as nossas classes Java e escreve SQL por nÃ³s. O modo `update` significa: *"Sempre que eu criar uma nova classe Java (ex: Atleta), olha para ela e vai ao Postgres criar a tabela correspondente. Se eu adicionar um campo, cria a coluna nova"*. Em produÃ§Ã£o nunca usamos isto para evitar acidentes, mas para desenvolvimento Ã© fantÃ¡stico e acelera imenso.

### 3. `application-test.properties` (A configuraÃ§Ã£o isolada para o TDD)
*Ficheiro: `backend/src/test/resources/application-test.properties`*

Este ficheiro existe dentro da pasta `test/`. Quando nÃ³s formos correr os nossos testes TDD, o Spring Ã© inteligente o suficiente para ignorar as credenciais do Postgres e carregar *este* ficheiro em vez do principal.
- Aqui, dizemos-lhe para se ligar Ã  nossa base de dados H2 (na RAM).
- Usamos **`ddl-auto=create-drop`**. Ou seja, "cria o esquema do zero antes do teste, e destrÃ³i tudo no fim". Assim garantimos que o teste nÂº 2 nunca serÃ¡ afetado pelo "lixo" deixado pelo teste nÂº 1.

### 4. A Classe Main (`DossierTreinadorApplication.java`)
*Ficheiro: `backend/src/main/java/com/dossiertreinador/DossierTreinadorApplication.java`*

- **A anotaÃ§Ã£o `@SpringBootApplication`:** Ã‰ ela que faz a magia acontecer. Esta anotaÃ§Ã£o diz ao Java: *"Isto Ã© um projeto Spring. Vai vasculhar todos os pacotes Ã  procura de cÃ³digo e arranca o servidor web embutido"*.
- **O `public static void main`:** Tal como nos primÃ³rdios em que aprendeste Java a escrever "Hello World", o ponto de entrada de qualquer aplicaÃ§Ã£o Ã© sempre um `main`. A Ãºnica coisa que ele faz Ã© chamar o motor do Spring (`SpringApplication.run`), passando o controlo da execuÃ§Ã£o para a framework.

### Resumo: O que acontece "por detrÃ¡s dos panos" no arranque?
Se abrirmos um terminal agora e corrermos o projeto (usando o comando Maven `mvn spring-boot:run`), a aplicaÃ§Ã£o vai:
1. Ler o `pom.xml` para saber as bibliotecas que tem.
2. Iniciar o mÃ©todo `main`.
3. Ler o `application.properties` para descobrir onde estÃ¡ a base de dados.
4. Ligar-se ao Postgres (se estiver ligado e a base de dados `dossier_treinador` existir).
5. Iniciar o Tomcat (servidor web embutido) e ficar, infinitamente, Ã  espera de pedidos na porta 8080.

---

## Fase 1: Etapa 2 - Entidades Base (Epoca)

### 1. A Entidade `Epoca.java`
*Ficheiro: `backend/src/main/java/com/dossiertreinador/domain/entities/Epoca.java`*
Aqui desenhamos o molde da tabela. Usamos as anotaÃ§Ãµes do **Lombok** (`@Getter`, `@Setter`, `@Builder`) que nos poupam a ter de escrever centenas de linhas de mÃ©todos inÃºteis (getters e setters). AlÃ©m disso, adicionÃ¡mos as validaÃ§Ãµes rigorosas a nÃ­vel do Java (`@NotBlank`, `@NotNull`) para garantir que dados incorretos ou em falta nunca chegam Ã  base de dados. A anotaÃ§Ã£o `@Entity` avisa o Hibernate para transformar esta classe numa tabela.

### 2. O RepositÃ³rio `EpocaRepository.java`
*Ficheiro: `backend/src/main/java/com/dossiertreinador/repository/EpocaRepository.java`*
Ã‰ uma interface vazia que herda de `JpaRepository`. Isto Ã© o pinÃ¡culo do Spring Data: ao herdar desta classe, a nossa `EpocaRepository` ganha instantaneamente dezenas de mÃ©todos prontos a usar (como `.save()`, `.findById()`, `.delete()`), sem termos de escrever uma Ãºnica linha de SQL!

### 3. O Teste `EpocaRepositoryTest.java` (TDD)
*Ficheiro: `backend/src/test/java/com/dossiertreinador/repository/EpocaRepositoryTest.java`*
Aqui aplicÃ¡mos o **TDD real**. A anotaÃ§Ã£o `@DataJpaTest` levanta uma base de dados H2 virtual especificamente para este teste.
- Num teste, pegÃ¡mos numa Ã‰poca perfeita, mandÃ¡mos guardar e fomos verificar (`assertThat()`) se a base de dados lhe atribuiu um ID e se o campo `isAtiva` ficou a `true` por defeito.
- Noutro teste, testÃ¡mos o **caminho negativo**: tentÃ¡mos propositadamente gravar uma Ã‰poca sem designaÃ§Ã£o, e afirmÃ¡mos que o Spring **tem** de lanÃ§ar uma exceÃ§Ã£o (`ConstraintViolationException`) e mostrar a mensagem de erro que nÃ³s escrevemos no `@NotBlank` da Entidade.

---

## Fase 1: Etapa 2 (ContinuaÃ§Ã£o) - Utilizador e Equipa

### 1. O Enum `Cargo.java`
*Ficheiro: `backend/src/main/java/com/dossiertreinador/domain/enums/Cargo.java`*
Em vez de deixarmos os cargos serem strings livres (o que daria aso a erros como "TREINADOR" vs "Treinador"), criÃ¡mos um **Enum**. Isto blinda o cÃ³digo. AdicionÃ¡mos o `@Getter` do Lombok para podermos ler a `descricao` amigÃ¡vel de cada cargo ("Treinador Principal").

### 2. A Entidade `Utilizador.java`
*Ficheiro: `backend/src/main/java/com/dossiertreinador/domain/entities/Utilizador.java`*
Introduzimos aqui duas grandes novidades na validaÃ§Ã£o e mapeamento:
- **`@Email` e `unique = true`**: Garantimos que o formato tem de ser vÃ¡lido e que a base de dados SQL vai proibir dois utilizadores com o mesmo email.
- **`@Enumerated(EnumType.STRING)`**: Como as bases de dados nÃ£o compreendem nativamente Enums de Java, esta anotaÃ§Ã£o forÃ§a o Hibernate a gravar a palavra literal (ex: "FISIOTERAPEUTA") na tabela, o que facilita imenso a leitura direta na base de dados.

### 3. A Entidade `Equipa.java` e Relacionamentos
*Ficheiro: `backend/src/main/java/com/dossiertreinador/domain/entities/Equipa.java`*
O coraÃ§Ã£o relacional do nosso sistema. Aqui introduzimos o `@ManyToOne`, que ensina o Java que "Muitas equipas podem pertencer a uma mesma Ã‰poca".
- **`FetchType.LAZY`**: Este Ã© um dos conceitos de performance mais importantes no Hibernate. Por defeito, um `@ManyToOne` faria o sistema ir Ã  base de dados buscar a `Epoca` inteira sempre que quisÃ©ssemos saber apenas o nome da equipa. Com o `LAZY`, a `Epoca` sÃ³ Ã© carregada se explicitamente chamarmos `equipa.getEpoca()`. Isto previne problemas graves de performance.

### 4. Os Testes (TDD)
- No `UtilizadorRepositoryTest.java`, tentÃ¡mos propositadamente gravar dois utilizadores com o mesmo email e validÃ¡mos que o H2 atirou a exceÃ§Ã£o de violaÃ§Ã£o de integridade.
- No `EquipaRepositoryTest.java`, validÃ¡mos que o Hibernate nÃ£o deixa, de todo, gravar uma equipa "Ã³rfÃ£" (sem lhe associar previamente uma `Epoca`).

---

## Fase 1: Etapa 3 - Entidade Atleta

A entidade `Atleta` Ã© um dos pilares do sistema, e por isso usÃ¡mos tipos de dados mais ricos e restriÃ§Ãµes complexas para garantir a integridade da ficha do jogador.

### 1. Enums TÃ¡ticos (`Posicao.java` e `PePreferido.java`)
Tal como fizemos no `Cargo`, criÃ¡mos Enums para padronizar as posiÃ§Ãµes no campo (ex: `GUARDA_REDES`, `AVANCADO_CENTRO`) e o pÃ© (ex: `DESTRO`). Isto significa que nunca haverÃ¡ um atleta gravado na base de dados com a posiÃ§Ã£o "Grda redes" escrita Ã  mÃ£o.

### 2. A Entidade `Atleta.java` e ValidaÃ§Ãµes AvanÃ§adas
*Ficheiro: `backend/src/main/java/com/dossiertreinador/domain/entities/Atleta.java`*
Aqui introduzimos anotaÃ§Ãµes de validaÃ§Ã£o muito poderosas e nativas do Java:
- **`@Past`**: Aplicado Ã  `dataNascimento`. O Spring intercepta e proÃ­be o sistema de guardar um atleta com uma data de nascimento no futuro (evitando erros de preenchimento do utilizador).
- **`@Min` e `@Max`**: Aplicados ao peso e altura. Por exemplo, impusemos `@Max(250)` para a altura. Se alguÃ©m tentar gravar um atleta com 300cm, o cÃ³digo atira uma `ConstraintViolationException`.
- **`Integer` e `Double` vs primitivos**: Em vez de usarmos `int` para a altura, usÃ¡mos a classe `Integer`. PorquÃª? Porque os tipos primitivos em Java assumem automaticamente o valor `0` (zero) se nÃ£o forem preenchidos. Ter um atleta gravado com "0 cm de altura" e "0 kg" seria absurdo. Usando `Integer` e `Double`, os campos ficam a `NULL` na base de dados, significando corretamente "Ainda nÃ£o pesÃ¡mos/medimos o atleta".

### 3. Os Testes TDD (`AtletaRepositoryTest.java`)
- **O poder do `@BeforeEach`**: Introduzimos esta anotaÃ§Ã£o do JUnit. Como um Atleta tem de estar associado a uma Equipa (e a Equipa a uma Ã‰poca), terÃ­amos de escrever 20 linhas de cÃ³digo para criar uma Ã‰poca e uma Equipa *dentro de cada um dos testes*. Ao colocar isso num mÃ©todo anotado com `@BeforeEach`, esse bloco de cÃ³digo corre automaticamente antes de cada teste comeÃ§ar. MantÃ©m o cÃ³digo limpo, profissional e sem duplicaÃ§Ãµes (princÃ­pio DRY - Don't Repeat Yourself).
- TestÃ¡mos com sucesso o bloqueio do `@Past` (tentando salvar um jogador que nascia amanhÃ£) e do `@Max` (tentando salvar um gigante de 3 metros).

---

## Fase 1: Etapa 4 - Eventos, Assiduidade e JPQL

Nesta etapa criÃ¡mos o coraÃ§Ã£o operacional do dia-a-dia de um treinador: o calendÃ¡rio e as presenÃ§as.

### 1. Entidade `EventoCalendario.java`
Aqui registamos treinos, jogos ou reuniÃµes.
- UsÃ¡mos a classe `LocalDateTime` (em vez de `LocalDate`) porque para um evento importa o dia e tambÃ©m a **hora** a que comeÃ§a e acaba.

### 2. A Tabela de JunÃ§Ã£o `RegistoAssiduidade.java`
Esta entidade Ã© fantÃ¡stica porque faz a ponte (relacionamento *Many-to-Many* com informaÃ§Ã£o extra) entre o Atleta e o Evento. Ela diz-nos: "O Atleta X esteve no Evento Y e o seu estado foi PRESENTE".
- **O Constrangimento Absoluto (`@Table(uniqueConstraints...)`)**: ColocÃ¡mos uma regra inviolÃ¡vel na base de dados que diz: *A combinaÃ§Ã£o de Evento e Atleta tem de ser Ãºnica*. Ou seja, o motor SQL recusa categoricamente que o "Ronaldo" tenha dois registos diferentes no mesmo treino de terÃ§a-feira. (Isto foi validado no teste `deveFalharSeGravarMesmoAtletaNoMesmoEvento`).

### 3. A Magia do JPQL (`RegistoAssiduidadeRepository.java`)
ChegÃ¡mos ao nÃ­vel de acesso a dados avanÃ§ado. A interface `JpaRepository` dÃ¡-nos o CRUD bÃ¡sico grÃ¡tis (save, delete, findById), mas para pesquisas complexas usamos **JPQL (Java Persistence Query Language)**.
- **O que Ã©?** Ã‰ uma linguagem quase igual ao SQL, mas em vez de escrevermos nomes de tabelas, escrevemos os nomes das **nossas classes Java**. O Hibernate lÃª o nosso JPQL e traduz automaticamente para o SQL da base de dados (Postgres ou H2).
- **A Query Mensal**: CriÃ¡mos o mÃ©todo `@Query("SELECT r FROM RegistoAssiduidade r WHERE r.atleta.id = :atletaId AND r.evento.dataHoraInicio >= :inicioMes AND r.evento.dataHoraInicio <= :fimMes")`. No ficheiro de testes (`deveProcurarAssiduidadeMensalDoAtletaComJPQL`) comprovÃ¡mos que, ao passar as datas do mÃªs atual, o motor da BD filtra a grelha na perfeiÃ§Ã£o!

---

## Fase 1: Etapa 5 - Camada de ServiÃ§o (LÃ³gica de NegÃ³cio e Mockito)

Separamos o cÃ³digo em `Interface` e `Impl` (ImplementaÃ§Ã£o) para garantir que a lÃ³gica do negÃ³cio estÃ¡ **desacoplada**.
Aqui, a estrela do espetÃ¡culo Ã© o `EventoCalendarioServiceImpl.java`.

### 1. A LÃ³gica de NegÃ³cio (Batch Insert)
NÃ£o queremos que o treinador tenha de adicionar um a um os 25 jogadores sempre que cria um treino. 
No mÃ©todo `registarEventoEGerarGrelha`, orquestrÃ¡mos 3 RepositÃ³rios de uma vez sÃ³:
- Mandamos gravar o Evento.
- Pedimos ao `AtletaRepository` a lista completa de atletas daquela Equipa.
- Percorremos a lista toda com Java `Streams` e criamos um `RegistoAssiduidade` (com estado `PRESENTE`) para cada um.
- Gravamos todos os registos de uma vez sÃ³ usando o `saveAll` (Batch Insert, altamente performante).

### 2. A AnotaÃ§Ã£o `@Transactional`
ColocÃ¡mos `@Transactional` em cima deste mÃ©todo gigante. Se a gravaÃ§Ã£o do Evento funcionar, mas a base de dados for abaixo no exato milissegundo em que estamos a gravar as presenÃ§as, o Spring cancela **tudo**! O Evento tambÃ©m Ã© apagado. Isto garante que a base de dados nunca fica num estado "meio-feito".

### 3. TDD com Mockito (`EventoCalendarioServiceTest.java`)
Este foi o teste mais complexo atÃ© agora:
- UsÃ¡mos `@Mock` para as trÃªs bases de dados. Elas nÃ£o existem no teste.
- UsÃ¡mos o **`ArgumentCaptor`**. O nosso CÃ©rebro (Service) fez as continhas e mandou a lista de presenÃ§as para a base de dados falsa. Como Ã© que testamos se ele fez as contas bem? Usamos o Captor (espiÃ£o). Ele interceta a lista mesmo antes de ela bater no repositÃ³rio falso, e no nosso `Assert` validamos que a lista tinha o nÃºmero certo de atletas e que estavam todos marcados como `PRESENTE`.

---

## Fase 1: Etapa 6 - DTOs, Mappers e ExceÃ§Ãµes Globais

Para proteger a nossa Base de Dados e poupar processamento aos TelemÃ³veis, aplicÃ¡mos o PadrÃ£o DTO (Data Transfer Object).

### 1. DTOs de Request e Response
- **`AtletaRequestDTO`**: Ã‰ a embalagem de entrada. Quando o telemÃ³vel cria um atleta, nÃ£o nos envia a Ã¡rvore de dados gigante. Envia apenas as Strings e o `equipaId`. Tem as suas prÃ³prias validaÃ§Ãµes de seguranÃ§a (como o `@Past`).
- **`AtletaResponseDTO`**: Ã‰ a embalagem de saÃ­da. Quando o telemÃ³vel pede a lista de atletas, Ã© isto que recebe. NÃ£o enviamos a `dataNascimento`, enviamos jÃ¡ a `idade` mastigada. NÃ£o enviamos a entidade `Equipa`, enviamos apenas o texto `nomeEquipa`. 

### 2. O `AtletaMapper` e o Teste UnitÃ¡rio Puro
- A conversÃ£o entre o DTO e a Entidade Ã© feita no Mapper (`@Component`). Ã‰ aqui que escrevemos a lÃ³gica matemÃ¡tica (ex: calcular os anos entre a data de nascimento e o dia de hoje com `Period.between`).
- **Testes UnitÃ¡rios sem Frameworks:** No ficheiro `AtletaMapperTest` NÃƒO usÃ¡mos base de dados nem Mockitos! Como o Mapper Ã© apenas uma classe que soma e subtrai coisas em memÃ³ria, testÃ¡mos com instÃ¢ncias Java puras, tornando este teste o mais rÃ¡pido de todo o sistema.

### 3. ExceÃ§Ãµes Globais (`@ControllerAdvice`)
Se um utilizador tentar gravar um atleta com data de nascimento no futuro, a nossa Entidade atira uma `ConstraintViolationException`. Se nÃ£o tratarmos isto, o Spring devolve um erro 500 enorme ao telemÃ³vel (HTML gigante com a *stack trace* do Java).
Para resolver isto, criÃ¡mos o **`GlobalExceptionHandler`**:
- A anotaÃ§Ã£o `@ControllerAdvice` coloca este ficheiro Ã  escuta de todos os erros que ocorram no sistema.
- Quando ele apanha o erro de validaÃ§Ã£o, converte-o no nosso `ErrorResponse` (um cartÃ£o limpo e arrumado) e devolve um erro HTTP 400 (Bad Request) em JSON. Desta forma, a equipa que estiver a construir a aplicaÃ§Ã£o de telemÃ³vel sÃ³ precisa de ler o campo `"message"` e mostrar um alerta vermelho no ecrÃ£ do utilizador!

---

## Fase 1: Etapa 7 - Controladores (REST e MockMvc)

Esta Ã© a linha da frente do nosso Backend. Ã‰ a porta que estÃ¡ aberta para a Internet.

### 1. `AtletaController` (@RestController)
AnotÃ¡mos a classe com `@RestController` e `@RequestMapping("/api/atletas")`. Isto significa que o nosso servidor atende chamadas neste endereÃ§o.
Quando o telemÃ³vel faz um `POST` com os dados JSON de um atleta:
1. A anotaÃ§Ã£o `@Valid` verifica as regras do nosso DTO.
2. O Controlador pede ao RepositÃ³rio para confirmar se a Equipa existe.
3. Passa os dados ao `AtletaMapper` para converter o JSON numa Entidade.
4. Passa a Entidade ao `AtletaService` (o nosso CÃ©rebro) para gravar.
5. Usa o `AtletaMapper` novamente para embrulhar a resposta no `AtletaResponseDTO` e devolve um glorioso HTTP `201 CREATED`.

### 2. O Teste de Internet Falsa (`MockMvc`)
No ficheiro `AtletaControllerTest` testÃ¡mos o Controlador SEM ligar um servidor de verdade. 
A anotaÃ§Ã£o `@WebMvcTest` cria um mini-servidor invisÃ­vel e super leve. 
UsÃ¡mos o `mockMvc.perform(post(...))` para "disparar" um JSON fingindo ser um telemÃ³vel, e de seguida lemos a resposta do nosso servidor (`jsonPath`) para validar se a idade tinha sido bem calculada e devolvida na porta certa.

Com isto, **concluÃ­mos a Fase 1 da Arquitetura do Backend!**

---

## Fase 2: Etapa 9 - Boletim ClÃ­nico, LesÃµes e CiberseguranÃ§a (RGPD)

Nesta etapa, implementÃ¡mos o registo de lesÃµes, mas com uma camada rigorosa de auditoria mÃ©dica. Como os dados clÃ­nicos sÃ£o "Dados SensÃ­veis de Categoria Especial" perante o RGPD, injetÃ¡mos mecanismos de rastreabilidade e ocultaÃ§Ã£o.

### 1. Auditoria AutomÃ¡tica (O PadrÃ£o JPA Auditing)
Na entidade `Lesao.java`, nÃ£o adicionÃ¡mos apenas os campos normais (`tipoLesao`, `descricao`). AdicionÃ¡mos quatro campos de rastreabilidade: `@CreatedBy`, `@LastModifiedBy`, `@CreatedDate` e `@LastModifiedDate`.
- **A Magia do `@EntityListeners`**: Ao anotar a classe com `@EntityListeners(AuditingEntityListener.class)`, delegÃ¡mos no Spring a responsabilidade de preencher estes campos automaticamente. Nunca precisamos de fazer `lesao.setDataCriacao(agora)` no nosso cÃ³digo.
- **O Interruptor `JpaAuditConfig.java`**: Para que o JPA saiba QUEM estÃ¡ a fazer a alteraÃ§Ã£o, criÃ¡mos a classe `JpaAuditConfig` com a anotaÃ§Ã£o `@EnableJpaAuditing`. Por agora, o mÃ©todo `auditorProvider` devolve sempre `"SISTEMA"`. Na Etapa 12, este mÃ©todo serÃ¡ ligado ao `SecurityContext` (o cofre de seguranÃ§a) para ler o email real de quem fez o pedido (ex: "fisioterapeuta@clube.pt").

### 2. DTOs MÃºltiplos para OcultaÃ§Ã£o de Dados (SeguranÃ§a)
Para proteger o detalhe clÃ­nico (a `descricao` com o texto do mÃ©dico), nÃ£o podemos devolver o mesmo DTO a toda a gente.
- CriÃ¡mos **`LesaoDetalhadaDTO`** (tem tudo) e **`LesaoResumidaDTO`** (tem apenas o nome do atleta e o estado da lesÃ£o, omitindo a descriÃ§Ã£o clÃ­nica).
- O nosso **`LesaoMapper.java`** sabe como construir cada um deles a partir da entidade. O Controller usa a vista Resumida para listagens gerais (como a lista de indisponÃ­veis para a convocatÃ³ria) e a vista Detalhada para o ecrÃ£ do fisioterapeuta.

### 3. As Queries Inteligentes do RepositÃ³rio
No `LesaoRepository.java`, nÃ£o escrevemos SQL. Escrevemos a assinatura do mÃ©todo: `findByAtletaEquipaIdAndEstadoLesaoNot`.
O Spring Data percebeu as trÃªs relaÃ§Ãµes (`Lesao` -> `Atleta` -> `Equipa`) e gerou, no arranque da aplicaÃ§Ã£o, uma query com *LEFT JOINs* que vai Ã  base de dados procurar exatamente os atletas da equipa X que tenham lesÃµes onde o estado nÃ£o seja o Y (neste caso, `RECUPERADO`). Isto alimentarÃ¡, na Etapa 10, o filtro automÃ¡tico da ConvocatÃ³ria.

### 4. TDD Rigoroso com o Ciclo Red-Green
Nos testes do repositÃ³rio (`LesaoRepositoryTest.java`), aprendemos uma liÃ§Ã£o importante:
- **Red (Erro)**: No mÃ©todo `@BeforeEach`, ao gravar a LesÃ£o falsa para o teste usando `entityManager.persist()`, o teste falhou (o `@CreatedDate` ficou a *null*).
- **Green (SoluÃ§Ã£o)**: A auditoria do JPA sÃ³ Ã© despoletada quando usamos a framework Spring Data (o RepositÃ³rio). Ao trocar para `lesaoRepository.save()`, a magia acordou e os campos de auditoria foram devidamente preenchidos pelo Spring antes de bater na base de dados (H2).

---

## Fase 2: Etapa 10 - ConvocatÃ³ria para Jogos

Nesta etapa, criÃ¡mos a funcionalidade que permite ao treinador convocar atletas para um jogo especÃ­fico. FocÃ¡mo-nos muito na validaÃ§Ã£o rigorosa de regras de negÃ³cio e proteÃ§Ã£o de dados.

### 1. Entidades e a Tabela de JunÃ§Ã£o Inteligente
CriÃ¡mos a entidade `Convocatoria` e a tabela de junÃ§Ã£o `ConvocatoriaAtleta`. Em vez de usarmos uma simples lista de IDs de atletas, usÃ¡mos uma entidade intermÃ©dia porque, num jogo, um atleta pode usar um nÃºmero de camisola diferente do habitual (ex: nas seleÃ§Ãµes).
- **`@Table(uniqueConstraints...)`**: ColocÃ¡mos uma blindagem na base de dados (Constraint `UKo5hromgkel5iirmtfl86x370f`) para garantir que o mesmo atleta nunca pode ser convocado duas vezes para a mesma convocatÃ³ria. O teste `naoDevePermitirOMesmoAtletaDuasVezes` comprovou que o Hibernate bloqueia esta aÃ§Ã£o.

### 2. ValidaÃ§Ãµes IDOR (Insecure Direct Object Reference)
No `ConvocatoriaServiceImpl.java`, implementÃ¡mos uma barreira crÃ­tica de seguranÃ§a:
```java
if (!atleta.getEquipa().getId().equals(evento.getEquipa().getId())) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, ...);
}
```
Isto previne que um treinador mal-intencionado (ou um bug no frontend) tente enviar um ID de um atleta de uma equipa rival para a sua prÃ³pria convocatÃ³ria. O servidor aborta a operaÃ§Ã£o devolvendo `403 Forbidden`.

### 3. IntegraÃ§Ã£o com o Boletim ClÃ­nico
Aqui, as peÃ§as do puzzle comeÃ§aram a encaixar. Antes de convocar um atleta, o ServiÃ§o vai perguntar ao `LesaoRepository` se aquele atleta tem alguma lesÃ£o que **nÃ£o** esteja no estado `RECUPERADO`. Se tiver, o sistema atira um erro `400 Bad Request`, impedindo magicamente que atletas lesionados joguem.

### 4. LiÃ§Ã£o de Mockito: UnnecessaryStubbingException
Durante o TDD do Service, o Mockito atirou um erro no teste `criarConvocatoria_ExcedeLimite_LancaExcecao`. 
- **O que aconteceu?** Preparamos os *Mocks* dos repositÃ³rios (dizendo: "quando te pedirem X, devolve Y"). No entanto, como a nossa regra de validaÃ§Ã£o do limite (18 jogadores) estava logo na *primeira* linha do serviÃ§o, o cÃ³digo rebentava e lanÃ§ava exceÃ§Ã£o antes sequer de usar os repositÃ³rios falsos!
- **A correÃ§Ã£o**: O Mockito, sendo uma framework muito rigorosa, obrigou-nos a limpar o cÃ³digo e a remover os *Mocks* desse teste, garantindo que nÃ£o deixamos "lixo" no cÃ³digo de testes (Clean Code).

### 5. Flexibilidade do Treinador (Ignorar Bloqueio MÃ©dico)
Por sugestÃ£o de negÃ³cio (o treinador deve ter a palavra final), introduzimos a flag `forcarConvocatoria` no `ConvocatoriaRequestDTO`. 
Se o treinador enviar `true`, o serviÃ§o salta a verificaÃ§Ã£o mÃ©dica (`if (!forcarConvocatoria)`). Desta forma, o bloqueio mantÃ©m-se ativo por defeito para proteger a saÃºde do atleta, mas permite que a equipa tÃ©cnica assuma o risco (ex: o atleta vai apenas viajar com a equipa, ou recebeu alta Ã  Ãºltima hora). O teste `criarConvocatoria_AceitaAtletaLesionadoSeForcado_ComSucesso` garante que esta "exceÃ§Ã£o Ã  regra" funciona em seguranÃ§a.

---

## Fase 2: Etapa 11 - EstatÃ­sticas de Jogo âš½

Nesta etapa criÃ¡mos o mÃ³dulo de EstatÃ­sticas de Jogo. O objetivo Ã© registar o que acontece dentro das quatro linhas (Golos, CartÃµes, Minutos, etc.) e ligÃ¡-lo a um Atleta e a um Evento (Jogo).

### 1. Entidade e Enum (Design Simples)
CriÃ¡mos o enum `TipoEstatistica` (GOLO, ASSISTENCIA, CARTAO_AMARELO, etc.).
A entidade `EstatisticaJogo` foi desenhada para ser o mais versÃ¡til possÃ­vel. Em vez de termos campos rÃ­gidos para cada coisa (ex: `golosMarcados`, `cartoesAmarelos`), temos apenas:
- `tipoEstatistica`: o que aconteceu.
- `valor`: a quantidade (ex: 1 golo, ou 90 minutos).
Isto permite-nos criar novos tipos de estatÃ­sticas no futuro sem termos de alterar a estrutura da base de dados!

### 2. A Magia do JPQL Agregado (`@Query`)
No `EstatisticaJogoRepository`, precisÃ¡vamos de uma forma eficiente de saber, por exemplo, "Quantos golos marcou o Ronaldo nesta Ã©poca inteira?".
Em vez de trazer todas as estatÃ­sticas para o Java e somar manualmente, ensinÃ¡mos a base de dados a fazer a matemÃ¡tica pesada atravÃ©s de JPQL:
```java
@Query("SELECT COALESCE(SUM(e.valor), 0) FROM EstatisticaJogo e ...")
```
- O `COALESCE(SUM(...), 0)` Ã© um truque brilhante: se o atleta nÃ£o tiver estatÃ­sticas, em vez de devolver `null` (o que provocaria um NullPointerException no Java), devolve `0`. TestÃ¡mos isto no repositÃ³rio com TDD (`deveRetornarZeroSeNaoTiverEstatistica`).

### 3. ProteÃ§Ã£o IDOR no Registo
Tal como nas convocatÃ³rias, mantivemos a barreira de seguranÃ§a no `EstatisticaJogoServiceImpl`. Um treinador nÃ£o pode registar golos para um atleta da equipa rival. O cÃ³digo valida a `equipa_id` do atleta contra a `equipa_id` do evento antes de persistir o dado.

### 4. TDD Rigoroso e Erros Comuns (Spring Context)
Durante o desenvolvimento do `EstatisticaJogoControllerTest`, os testes falharam com um `IllegalStateException`.
- **PorquÃª?** A anotaÃ§Ã£o `@WebMvcTest` cria um contexto isolado do Spring sÃ³ para testar a camada Web. NÃ³s tÃ­nhamos injetado o `EstatisticaJogoMapper`, mas esquecemo-nos de injetar o `AtletaMapper` (do qual ele dependia internamente). 

### Etapa 12: Autenticação, Autorização e JWT
Para assegurar que apenas utilizadores legítimos acedem à aplicação, implementámos o **Spring Security com JSON Web Tokens (JWT)**.

#### O que acontece por detrás dos panos?
1. **SecurityConfig e ApplicationConfig**: Separou-se a configuração de beans (como o UserDetailsService e o PasswordEncoder) para um ficheiro ApplicationConfig para evitar referências circulares (quando o SecurityConfig tenta criar o JwtAuthenticationFilter que por sua vez precisa de beans do SecurityConfig).
2. **JwtAuthenticationFilter**: Interceta todos os pedidos HTTP. Extrai o token do cabeçalho Authorization (Bearer token) ou dos Cookies (por questões de segurança acrescida). Se for válido, regista o utilizador no SecurityContextHolder.
3. **AuthController**: Expõe endpoints públicos (/api/auth/login e /api/auth/registar) para trocar credenciais por um JWT.
4. **BCrypt**: As passwords nunca são gravadas em texto limpo. São sujeitas a hash via BCrypt antes de guardar na base de dados.

#### Testes TDD
Foram criados testes unitários para o AuthControllerTest simulando logins e registos com MockMvc. Adicionalmente, implementámos um **SecurityIntegrationTest** para testar a comunicação real com a base de dados (H2) num contexto completo, validando falhas no login e acessos restritos a endpoints sem token (HTTP 403 Forbidden). Os testes antigos de Controller foram adaptados para ignorar os filtros via @AutoConfigureMockMvc(addFilters = false) mantendo os testes modulares e focados.

### Etapa 12.1: Revisão de Cibersegurança
Após auditoria, implementaram-se defesas contra XSS e Account Takeovers:
1. **HttpOnly Cookies**: O JWT deixou de viajar no Payload do JSON para viajar escondido num Cookie, impenetrável ao JavaScript do lado do cliente.
2. **Registo Privado**: O endpoint /api/auth/registar passou a exigir a anotação @PreAuthorize("hasRole('TREINADOR') or hasRole('ADMINISTRADOR')").
3. **Códigos HTTP**: Adicionámos o JwtAuthenticationEntryPoint e atualizámos o GlobalExceptionHandler para devolverem **401 Unauthorized** em situações não autenticadas ou com password incorreta.
4. **Testes Unitários de Segurança**: Reativaram-se os filtros nos testes de Controladores importando o SecurityConfig em conjunto com a injeção do @WithMockUser, garantindo que o Controlo de Acesso (RBAC) é testado localmente.

### Etapa 13: A Ligação Frontend ↔ Backend (Magia do CORS e Next.js)
Até aqui o nosso Backend estava fechado numa "fortaleza". Quando ligámos o Next.js, criámos as pontes:
1. **CORS com Credenciais**: O Spring Security foi ensinado a aceitar pedidos do "localhost:3000". E o mais importante: ativámos o setAllowCredentials(true). Sem isto, o browser recusava-se a enviar o cookie JWT para a API!
2. **Utilitário piFetch**: Criámos um wrapper em /lib/api.ts onde a flag credentials: "include" garante que todos os requests ao servidor transportam o passaporte (JWT).
3. **Segurança de Borda (Middleware)**: O middleware.ts do Next.js é genial. Ele corre ANTES da página carregar. Se não tiveres o cookie jwt, ele nem te deixa ver a UI, reencaminhando logo para /login.
4. **Fim do "Mock"**: O nosso 
oster-view.tsx foi atualizado com um hook useEffect que contacta o nosso novo endpoint GET /api/atletas.

### Etapa 14: Gestão do Plano de Treino
Nesta etapa resolvemos o problema clássico de planeamento tático: reutilizar exercícios e construir as sessões.

1. **Catálogo Global (Exercicio)**: Criámos a entidade Exercicio que vive isolada. Pode ser um exercício de passe, um remate à baliza, etc. Todos estes têm Auditoria RGPD ligada.
2. **Cabeçalho da Sessão (SessaoTreino)**: Apenas data, objetivo, intensidade e total de minutos. Fica ligada à Equipa.
3. **A Cola Mágica (SessaoTreinoExercicio)**: Em vez de usarmos uma simples @ManyToMany, criámos uma entidade associativa de propósito. Porquê? Porque precisamos de saber a **ordem** do exercício *NAQUELE* treino específico, a sua **duração** e as **observações** do treinador para o dia.
4. **Calculadora de Minutos**: O SessaoTreinoService soma inteligentemente os minutos dos exercícios na associação e guarda o total automaticamente.
