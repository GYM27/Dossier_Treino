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

### Etapa 15: Integração Real do Dashboard (Frontend)
Nesta fase fechámos o ciclo, pegando no ecrã de Dashboard (que tinha dados fixos falsos/mock) e ligando-o à base de dados.
1. **Interfaces TypeScript**: Adicionámos a `interface Atleta` que funciona como um "contrato" espelho do `AtletaResponseDTO` do Java, dando-nos auto-complete e segurança (evitando erros de digitação de propriedades).
2. **State e Effect (Memória e Controlo)**: Usámos o `useState` para criar um "cofre" (gaveta) local no ecrã e o `useEffect` para garantir que o pedido à API (`apiFetch("/atletas")`) ocorre apenas **uma vez** quando o ecrã carrega.
3. **Distribuição do Plantel (Matemática)**: No ecrã da Distribuição, apagámos os números fixos e usámos funções JavaScript de Arrays (`.filter(a => a.posicaoPrincipal === "DEFESA").length`) para recalcular a distribuição dinamicamente com base nos dados que vieram do servidor, inclusive precavendo divisão por zero no cálculo da largura das barras.

### Etapa 15.1: Limpeza de Nomenclatura (Clean Code Frontend)
Nesta etapa, refator�mos os ficheiros gerados pelo v0 para respeitarem as regras de Clean Code e a sem�ntica da linguagem. Apesar de mantermos o ingl�s para componentes estruturais (sidebar, 	op-header), os nomes gen�ricos como oster-view foram alterados para squad (jarg�o de futebol) e os sufixos desnecess�rios (-view) foram removidos. O pp/page.tsx foi limpo para usar <Squad />, <Dashboard />, e <Attendance /> diretamente.

---
## Atualização: O Meu Perfil (Frontend e Backend)

**O que fizemos:** 
Criámos a funcionalidade para o utilizador alterar o próprio nome e password.

**Por detrás dos panos (Backend - Spring Boot):**
- Usámos a anotação `@AuthenticationPrincipal` no `UtilizadorController`. Isto é crucial! Em vez de recebermos o ID do utilizador pela rota (ex: `/api/utilizadores/1`), o Spring injeta o utilizador que está associado ao Token JWT enviado no cabeçalho da resposta. Isto impede vulnerabilidades do tipo IDOR (Insecure Direct Object Reference) onde o utilizador "A" tenta alterar os dados do utilizador "B" manipulando o URL.
- No `UtilizadorService`, verificámos se a password nova vinha vazia. Se vier, apenas alteramos o nome. Caso contrário, usamos o `PasswordEncoder` (BCrypt) para fazer o *hash* antes de guardar na BD. O TDD garantiu este comportamento com precisão cirúrgica.

**Por detrás dos panos (Frontend - Next.js/React):**
- Refatorámos a página de Configurações (`settings.tsx`) para usar **Abas (Tabs)**. Usámos um simples estado React `const [activeTab, setActiveTab] = useState("perfil")`. O React encarrega-se de mostrar apenas o componente condicionalmente: se `perfil`, mostra `ProfileForm`; se `equipa`, mostra `StaffList` e `StaffForm`.
- Criámos um Dropdown no cabeçalho (`top-header.tsx`). O truque mágico foi usar o gancho `useRef` para detetar cliques *fora* do menu. Se o utilizador clica em qualquer sítio que não o menu (`!profileRef.current.contains(e.target)`), fechamos o dropdown (`setProfileOpen(false)`).


### Como a API lida com as Assiduidades (Grelha Semanal)
Quando abres a p�gina de Assiduidade, o frontend faz 3 pedidos em paralelo:
1. GET /api/atletas/equipa/{id} -> Todos os atletas (Y-Axis).
2. GET /api/eventos/equipa/{id}/semana?start=X&end=Y -> Todos os eventos (X-Axis).
3. GET /api/assiduidade/equipa/{id}/semana?start=X&end=Y -> Todos os registos.

No backend, o m�todo indByEquipaAndDateRange cruza as tabelas usando JPQL (.evento.equipa.id = :id) para ir buscar rapidamente todas as presen�as dos eventos da semana.

No frontend (Attendance.tsx), a grelha cruza tleta.id com evento.id. Se o registo existir (que � criado automaticamente no EventoCalendarioServiceImpl.registarEventoEGerarGrelha sempre que crias um evento), a c�lula � preenchida com o �cone do estado (PRESENTE, AUSENTE, etc). Ao clicares na c�lula, a UI envia um pedido PUT /api/assiduidade/{registoId} para atualizar apenas o TipoAssiduidade desse jogador naquele evento espec�fico.


### Sincronização de Calendário (iCal) - Fix de Segurança e Conectividade
**O que foi feito:**
Adicionámos o endpoint /api/eventos/equipa/*/ical às exceções de segurança no SecurityConfig.java.
**Por detrás dos panos:**
A maioria dos serviços de calendário (como o Google Calendar ou Apple Calendar) não envia cabeçalhos de autenticação ao subscrever a um calendário. Se o endpoint estiver protegido, recebem 401 Unauthorized e a sincronização falha. Ao adicionarmos este endpoint ao .permitAll(), a subscrição passa a funcionar. A segurança mantém-se pois o ID da equipa (UUID) atua como chave de acesso secreta.
**Problema do Localhost:**
Servidores externos (Google) não acedem a localhost. Para testes locais, é preciso usar ferramentas como o 
grok para obter um link público.

### Sincronização de Calendário (iCal) - Fix de Segurança e Conectividade
**O que foi feito:**
Adicionámos o endpoint /api/eventos/equipa/*/ical às exceções de segurança no SecurityConfig.java.
**Por detrás dos panos:**
A maioria dos serviços de calendário (como o Google Calendar ou Apple Calendar) não envia cabeçalhos de autenticação ao subscrever a um calendário. Se o endpoint estiver protegido, recebem 401 Unauthorized e a sincronização falha. Ao adicionarmos este endpoint ao .permitAll(), a subscrição passa a funcionar. A segurança mantém-se pois o ID da equipa (UUID) atua como chave de acesso secreta.
**Problema do Localhost:**
Servidores externos (Google) não acedem a localhost. Para testes locais, é preciso usar ferramentas como o 
grok para obter um link público.

### Correção de Registo de Assiduidade (Upsert)
**O que foi feito:**
Alterado o sistema de assiduidade para usar o padrão UPSERT (Update or Insert) por Evento e Atleta.
**Por detrás dos panos:**
Quando um jogador novo é adicionado ao plantel, ele não tem registos de assiduidade passados. A grelha de presenças falhava ao tentar atualizar um ID que não existia. A solução foi criar um novo endpoint PUT /api/assiduidade/evento/{id}/atleta/{id} que procura se existe o registo. Se não existir, cria-o no momento, de forma transparente.

### Adicionar Fotografia ao Atleta
**O que foi feito:**
Adicionado o campo `fotoUrl` à entidade Atleta, passando pelos DTOs e Mapper, até ao Frontend, permitindo inserir um URL de imagem.
**Por detrás dos panos:**
Em vez de montar um sistema complexo de armazenamento de ficheiros (S3, disco local), guardamos apenas o link (URL) da imagem. Na grelha de plantel e assiduidade, usamos o condicional JSX `{atleta.fotoUrl ? <img src... /> : <div... />}` para mostrar a foto ou um avatar com iniciais/número como fallback.


## M�dulo de Treinos e Cat�logo - Integra��o Stitch e Periodiza��o T�tica
Nesta fase, recebemos um layout HTML em Dark Mode gerado pelo Google Stitch (Tactical Dossier - Training Session Builder). Para integrar este design complexo, ajust�mos o Backend (SessaoTreino e Exercicio) para acomodar as nomenclaturas da Periodiza��o T�tica: Morfociclo, Microciclo, Fase, e outros detalhes operacionais como N�mero de Jogadores e Espa�o. No Frontend, cri�mos o componente base TreinosOrchestrator que encaminha o utilizador para o TreinoBuilderStitch.tsx. Este �ltimo � uma reprodu��o rigorosa do design em React (Tailwind classes arbitr�rias como g-[#181A20]), que orquestra tamb�m a listagem do Cat�logo atrav�s do CatalogoExerciciosModal. A n�vel de dados, conect�mos o modal � API piFetch('/exercicios') para ser poss�vel selecionar exerc�cios globalmente criados.


## Padroniza��o T�tica no Calend�rio
Para garantir consist�ncia em toda a aplica��o, o termo 'Mesociclo' foi substitu�do por 'Morfociclo' no componente do Calend�rio (\PlaneamentoSemanal.tsx\), bem como em toda a cadeia de backend (Entidade \PlaneamentoMicrociclo\, DTOs, Mappers, Services e Controllers). Isto garante que a Periodiza��o T�tica � a linguagem base de toda a plataforma.


## Associa��o do N�mero do Treino aos Eventos de Calend�rio
Removido o controlo do Microciclo do topo do Calend�rio e transferida a responsabilidade do N�mero do Treino diretamente para a Entidade \EventoCalendario\. Agora, ao criar ou editar um evento do tipo TREINO, � poss�vel introduzir o 'N� do Treino (Microciclo)', que passa a ser gravado com o evento e � apresentado nas etiquetas renderizadas no Calend�rio.


## Incremento Autom�tico do N�mero do Treino
Para facilitar a vida ao utilizador, o backend passou a ter um endpoint (\/equipa/{equipaId}/ultimo-numero-treino\) que vai � base de dados buscar o �ltimo n�mero de treino registado. O frontend chama este endpoint sempre que se clica para adicionar um novo evento e, se for do tipo Treino, incrementa esse valor automaticamente (N+1) no formul�rio.
# #   I n t e g r a � � o   d a   P r a n c h e t a   T � t i c a 
 O   c o m p o n e n t e   T a c t i c a l B o a r d   f o i   i n t e g r a d o   n a   p � g i n a   d e   T r e i n o s . 
 -   A d i c i o n a d o   u m   b o t � o   N O V O   E X E R C � C I O   q u e   a b r e   u m   m o d a l   f u l l s c r e e n   c o m   a   p r a n c h e t a . 
 -   O   c o m p o n e n t e   T a c t i c a l B o a r d   d e v o l v e   u m   o b j e t o   J S O N   q u e   �   g r a v a d o   n o   b a c k e n d   ( d a d o s T a t i c o s ) . 
 -   O s   c a m p o s   O b j e t i v o s   e   M a t e r i a l   p a s s a r a m   a   s e r   e d i t � v e i s   l o c a l m e n t e   e   s � o   g u a r d a d o s   n o   b a c k e n d   ( P U T   / a p i / t r e i n o s / { i d } ) .  
 


## Evolução da Prancheta Tática: Floating Toolbar, Redimensionamento, Aura Neon e Bola 3D

Nesta etapa, a Prancheta Tática (*Tactical Board*) sofreu uma evolução de engenharia profunda, transformando-se num estúdio tático profissional, intuitivo e com gráficos de alta fidelidade.

### 1. Arquitetura Modular Baseada em Funcionalidades (Feature-based)
- **TacticalBoard.tsx**: Componente orquestrador central.
  - **Loop a 60 FPS com equestAnimationFrame**: Para garantir desempenho de topo sem sobrecarregar o ciclo de vida do React com re-renders excessivos, o estado vivo da prancheta reside num useRef<TacticalState>.
  - **Sincronização de Estado Reactivo**: Criada a referência selectedDrawingIdxRef e selectedElementIdRef emparelhadas com selectedDrawingIdx e selectedElementId do React. Isto resolve o problema clássico de *stale closure* no canvas loop, garantindo que o render loop lê em tempo real os objetos selecionados.
  - **Hit-Testing Geométrico**: Algoritmos de colisão por raio euclidiano para jogadores/círculos, teste de pertença a *bounding box* para retângulos/triângulos/polígonos, e projeção ortogonal a segmentos de reta para linhas contínuas e tracejadas.
- **TacticalBottomBar.tsx**: Barra de ferramentas inferior horizontal com seletores rápidos de modo (select, ect, circle, 	riangle, un, pass, pen), jogadores equipa A/B, cones, bola e botão de reposição inteligente.
- **TacticalSidebar.tsx**: Painel lateral direito minimizável com suporte a metadados estruturados do exercício (Tempo, Número de Jogadores, Espaço, Objetivos Específicos e Descrição Metodológica) e controlos de Undo/Redo/Gravação.
- **TacticalShapeFloatingBar.tsx**: Barra flutuante contextual padronizada (largura fixa de 380px) posicionada dinamicamente acima do objeto selecionado.

### 2. Floating Toolbar Contextual com Dimensões Padronizadas
Em vez de um modal central intrusivo, a edição foi transferida para o próprio relvado através de um *popover* flutuante no topo do objeto:
- **Tamanho Fixo e Sem Saltos**: A barra mantém sempre 380px de largura e uma estrutura consistente de duas linhas quer se selecione um retângulo, círculo, triângulo, pentágono, hexágono ou linha de passe/corrida.
- **Linha 1**: Tipo de Forma / Tipo de Linha, Linha Contínua vs Tracejada, e Seletor de Cor.
- **Linha 2**: Dropdown de Espessura (1 a 10px), Seletor de Fundo, Dropdown de Opacidade (0% a 100%) e Botão de Eliminar.

### 3. Aura Luminosa Neon e Pegas de Redimensionamento
- **Para Linhas**: Renderização de uma aura neon ciano (#00e5ff com shadowBlur: 20 e globalAlpha: 0.55) ao longo de toda a extensão do segmento, acompanhada de pegas circulares azuis com anel branco nas extremidades.
- **Para Formas**: Renderização de caixa delimitadora tracejada neon ciano (shadowBlur: 18), marcador central translúcido e 4 pegas circulares azuis nos cantos.
- **Para Jogadores e Bola**: Anel circular tracejado neon ciano ao redor da peça.

### 4. Bola de Futebol 3D Vetorial Realista
A primitiva esfera branca com ponto preto foi substituída por um desenho vetorial 3D profissional:
- **Gradiente Radial Esférico**: Iluminação no quadrante superior esquerdo (0% #ffffff a 100% #64748b) para criar volume e curvatura realista.
- **Sombra de Contacto**: Elipse sombreada suave sob a bola projetada no relvado.
- **Painéis e Costuras Geométricas**: Pentágono central escuro (#0f172a), 5 costuras radiais e 5 gomos curvos externos.
- **Reflexo Glossy Especular**: Ponto de luz superior que confere o acabamento de couro sintético de futebol profissional.

### 5. Reposicionamento Inteligente no Caixote do Lixo
Ao acionar o botão de limpar campo (caixote do lixo na barra inferior):
- Limpa todos os desenhos, linhas, setas e cones.
- Reposiciona os 11 jogadores Amarelos atrás da baliza esquerda e os 11 jogadores Azuis atrás da baliza direita, com a bola de futebol no centro do relvado, deixando o campo pronto para iniciar um novo exercício.
- Regista automaticamente um ponto de restauro no Histórico (*Undo*).

### 6. Atalhos de Teclado (Delete / Backspace)
- Listener global no teclado para apagar formas, linhas, jogadores ou cones selecionados.
- Filtro inteligente que impede a eliminação se o utilizador estiver a escrever em caixas de texto (input, 	extarea, select).

**Por detrás dos panos:**
O canvas HTML5 desenha a 60fps através do equestAnimationFrame. As posições calculadas em percentagem relativas à resolução base 1000x625 garantem que a barra flutuante em HTML overlay acompanha exatamente o topo da forma selecionada, mesmo quando o ecrã se redimensiona.


## Reorganização Ergonómica da Barra de Ferramentas Inferior (TacticalBottomBar)

Organização dos controlos em dois blocos lógicos:
1. **Bloco de Criação e Edição (Esquerda)**:
   - Ferramentas de Seleção e Caneta Livre.
   - Formas Geométricas (Retângulo, Círculo, Triângulo).
   - Linhas Táticas (Contínua/Deslocamento e Tracejada/Passe).
   - Controlos de Estilo (Cor da Linha, Espessura, Cor de Fundo e Opacidade).
2. **Bloco de Peças e Gestão do Campo (Direita)**:
   - Botões para adicionar Jogador Amarelo (Equipa A), Jogador Azul (Equipa B), Cone e Bola.
   - Botão de Limpeza Inteligente que devolve os 22 jogadores para trás das balizas e a bola para o círculo central.


## Otimização de Espaço e Design Modular na Barra Inferior (TacticalBottomBar)

Para eliminar o espaço morto e tornar a interface harmoniosa e equilibrada:
- A barra inferior foi decomposta em **4 cápsulas/módulos visuais segmentados** (g-slate-900/80 border border-slate-800/90 rounded-xl):
  1. **Módulo de Criação & Formas (Esquerda)**: Ferramentas de seleção, caneta, formas geométricas e estilos de linha.
  2. **Módulo de Estilos & Cores (Centro)**: Controlo centralizado de cor de traço, espessura, cor de preenchimento e opacidade.
  3. **Módulo de Peças Táticas (Direita)**: Jogadores A/B, cones e bola com identificadores visuais.
  4. **Módulo de Ações Rápidas (Extremo Direito)**: Botão de limpeza com etiqueta e ícone de destaque.


## Atalhos de Teclado Universais: Desfazer (Ctrl+Z) e Refazer (Ctrl+Y / Ctrl+Shift+Z)

### 1. Implementação Técnica
- Adicionado intercetor de eventos de teclado no TacticalBoard.tsx:
  - (e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey: Executa undo(), revertendo para o snapshot de estado anterior na pilha de histórico.
  - (e.ctrlKey || e.metaKey) && e.key === "y" ou Ctrl+Shift+Z: Executa edo(), avançando para o estado seguinte na pilha.
  - Proteção contextual: Se o foco estiver num input, 	extarea, select ou campo editável, os atalhos não interferem com a edição nativa de texto.


## Atalhos de Teclado Universais: Copiar (Ctrl+C) e Colar (Ctrl+V) de Desenhos e Elementos

### 1. Implementação Técnica do Clipboard
- Adicionada a referência em memória clipboardRef no TacticalBoard.tsx.
- **Copiar (Ctrl+C / Cmd+C)**:
  - Se estiver selecionada uma forma ou linha (selectedDrawingIdxRef.current), clona em profundidade as propriedades geométricas e de estilo (points, color, illColor, size, opacity, lineStyle).
  - Se estiver selecionado um jogador, cone ou bola (selectedElementIdRef.current), clona as propriedades do elemento.
- **Colar (Ctrl+V / Cmd+V)**:
  - **Para Desenhos/Formas**: Aplica um ligeiro deslocamento (*offset*) de +25px nas coordenadas X e Y (para que a cópia não fique perfeitamente sobreposta e seja imediatamente visível), insere na lista de desenhos, seleciona a nova cópia e grava no histórico (*Undo*).
  - **Para Jogadores/Peças**: Cria um novo identificador único (id), atribui o próximo dorsal vago (se for jogador da Equipa A ou B), aplica o deslocamento de +25px, insere no quadro e seleciona a nova peça.
## Módulos Avançados de Balizas, Jogadores e Otimização do Canvas

### O Que Acontece por Detrás dos Panos:

1. **Renderização de Balizas Vetoriais e Rotação Trigonométrica**:
   - As balizas são desenhadas através de primitivas Canvas (linhas de travessão com espessuras de 3.5 a 4.5px, arcos para postes e malha de rede com ciclos 'for').
   - A rotação aplica ctx.translate(el.x, el.y) e ctx.rotate(el.rotation), permitindo que toda a geometria (incluindo a sombra elíptica) gire com precisão de matriz 2D.

2. **Pointer Capture e Continuidade de Eventos do Rato**:
   - Quando um elemento é clicado, o browser executa setPointerCapture(e.pointerId). Isto faz com que os eventos de movimento continuem a ser encaminhados para o canvas, mesmo quando o ponteiro passa por cima das caixas de diálogo flutuantes ou sai do ecrã, garantindo arrasto 100% contínuo e sem bloqueios.

3. **Cálculo de Tipografia Dinâmica e Contraste**:
   - A função de renderização analisa o comprimento da sigla (ex: 'GR' vs '10' vs 'DC') e a escala do jogador ('sm', 'md', 'lg'), ajustando dinamicamente o tamanho da fonte entre 7px e 15px.
   - O contraste entre o texto interior e o fundo do colete é calculado dinamicamente com base no valor hexadecimal da cor, garantindo legibilidade absoluta.

 # #   F u n c i o n a l i d a d e :   O c u l t a r   B a r r a s   d e   E d i � � o   d u r a n t e   A r r a s t a m e n t o 
 P a r a   g a r a n t i r   q u e   a   e x p e r i � n c i a   d e   u s o   d a   p r a n c h e t a   �   f l u � d a   e   q u e   a s   b a r r a s   f l u t u a n t e s   d e   e d i � � o   ( S h a p e ,   G o a l ,   P l a y e r )   n � o   i n t e r f e r e m   v i s u a l m e n t e   n e m   b l o q u e i a m   o s   m o v i m e n t o s   d e   " D r a g   &   D r o p " ,   o   s i s t e m a   f o i   m e l h o r a d o : 
 -   * * C o m o   F u n c i o n a * * :   A g o r a ,   a s   b a r r a s   d e   e d i � � o   d e s a p a r e c e m   c o m p l e t a m e n t e   ( f i c a m   o c u l t a s   c o m   o p a c i t y - 0   e   p o i n t e r - e v e n t s - n o n e )   n o   p r e c i s o   m o m e n t o   e m   q u e   o   u t i l i z a d o r   c l i c a   e   c o m e � a   a   a r r a s t a r   u m   e l e m e n t o   n a   t e l a . 
 -   * * P o r q u � * * :   A n t e r i o r m e n t e   a s   b a r r a s   f i c a v a m   a p e n a s   p a r c i a l m e n t e   o p a c a s ,   o   q u e   p o r   v e z e s   d i f i c u l t a v a   a   p e r c e � � o   v i s u a l   d o   u t i l i z a d o r .   C o m   e s t a   a l t e r a � � o   a s   b a r r a s   o c u l t a m - s e   c o m   u m a   a n i m a � � o   s u a v e   d e   2 0 0 m s   ( 	 r a n s i t i o n - o p a c i t y   d u r a t i o n - 2 0 0 )   g a r a n t i n d o   t o t a l   f o c a g e m   n o   r e p o s i c i o n a m e n t o   d o   e l e m e n t o .   A s s i m   q u e   o   b o t � o   d o   r a t o   �   l i b e r t a d o ,   a   b a r r a   d e   e d i � � o   v o l t a   a   a p a r e c e r   n o   l o c a l   c o r r e t o   d o   e l e m e n t o   s e l e c i o n a d o .  
 
# # Funcionalidade: Seleção de Formas Geométricas (Bounding Box) e Foco Automático
Para garantir que as formas geométricas (com ou sem preenchimento) sejam facilmente selecionadas e que a edição de jogadores seja imediata, foram feitas duas alterações na prancheta:
- **Como Funciona (Formas)**: A lógica de colisão (hit test) no TacticalBoard.tsx agora avalia explicitamente a área interior (isInside) e a proximidade da borda (isNearBorder). Se o clique for dentro da caixa delimitadora ou perto da linha limite, a forma é selecionada.
- **Como Funciona (Jogador)**: No TacticalPlayerFloatingBar.tsx, adicionou-se a propriedade React utoFocus ao campo de input. Mal o componente é montado aquando da seleção de um jogador, o campo de texto fica focado no browser.
- **Porquê**: Melhorar significativamente a experiência de utilizador (UX) na edição contínua, poupando ao treinador cliques extra e frustração a selecionar áreas.

## Rotação Livre em Desenhos e Balizas
- **O Problema**: Rodar livremente figuras bidimensionais num Canvas (ex: retângulos e círculos) implica que as suas caixas de colisão (*Bounding Boxes*) deixam de ser perfeitamente alinhadas aos eixos (AABB - Axis-Aligned Bounding Box) e passam a ser orientadas (OBB - Oriented Bounding Box).
- **A Solução "Matriz Inversa"**: Em vez de fazermos matemática complexa de interseção de OBBs com o ponto do rato, aplicamos o conceito matemático do vetor inverso. Quando clicamos na prancheta, rodamos virtualmente a coordenada X e Y do rato "para trás" usando o ângulo exato do desenho, tendo como pivô o centro. Isto coloca o rato no "Eixo Local" do desenho. A partir daí, o código que já tínhamos para testar caixas não-rodadas funciona a 100%!
- **UI de Controlo**: Injetámos um novo otate_shape nas Shapes e otate_element nas Balizas. O ângulo é calculado com Math.atan2 entre o rato e o pivô, adicionando Math.PI / 2 para manter o manípulo perfeitamente ao norte (Topo) por defeito.

## Reorganização do Módulo de Treinos (Estúdio de Treinador)
- **O Desafio**: Anteriormente, a interface abria diretamente o construtor sem permitir consultar o histórico cronológico de sessões nem escolher facilmente entre sessões passadas.
- **A Solução Modular**:
  - TreinosSidebarList: Carrega a lista de sessões da equipa ativa, permitindo filtragem por pesquisa de objetivos e seleção rápida.
  - NovoTreinoModal: Cria o evento de calendário e a sessão de treino de forma transparente num único formulário amigável.
  - TreinoDetailStudio: Área de trabalho onde o treinador ajusta os metadados (jogadores, intensidade, material) e gere a timeline de exercícios.
  - NovoExercicioPranchetaModal: Permite abrir a prancheta interativa em modo de desenho de exercício, criando e anexando o exercício à sessão num único clique.

## Biblioteca de Exercícios Inteligente (Edição e Duplicação)
- **O Desafio**: O treinador quer reutilizar exercícios existentes fazendo pequenas variantes táticas sem perder o exercício original de referência.
- **A Solução Implementada**:
  - CatalogoExerciciosModal: Ganhou botões diretos de ação por exercício (Editar com lápis e Eliminar com caixote do lixo), além de filtros por categoria.
  - NovoExercicioPranchetaModal: Agora aceita um initialExercicio opcional. Ao carregar um exercício existente, a Prancheta Tática e todos os parâmetros (jogadores, espaço, dificuldade) são pré-preenchidos.
  - Se mudar o nome do exercício, o sistema ativa automaticamente o modo de cópia ("Gravar como Novo"), gerando um novo exercício independente no catálogo.

### P�gina de Treinos e Biblioteca
- **TreinoDetailStudio.tsx**: Implementado toggle de 'Modo Leitura' e 'Modo Edi��o'. O 'Modo Leitura' converte todos os inputs em texto est�tico e esconde bot�es desnecess�rios, enquanto o 'Modo Edi��o' mostra o formul�rio e permite altera��es de metadados e exerc�cios.
- **CatalogoExerciciosModal.tsx** e **NovoExercicioPranchetaModal.tsx**: Melhorada a biblioteca para permitir editar exerc�cios usando a Prancheta. Caso o nome seja alterado durante a edi��o, o exerc�cio � guardado como um NOVO exerc�cio em vez de sobrescrever o original.
- **SessaoTreinoController.java**: Adicionada a anota��o @Transactional � classe. Isto resolveu o erro 500 (LazyInitializationException) no mapper, que tentava aceder a entidades Lazy (EventoCalendario) fora da transa��o de grava��o.


## Fase 1: Padronização Visual & Componentes UI (Design System)

### 1. O Problema da Duplicação de UI
- **Sintoma**: Em vários componentes (NovoTreinoModal, TreinoDetailStudio, AtletaFormModal, EventoFormModal), existiam elementos nativos button e input com longas cadeias de classes Tailwind repetidas.
- **Consequências**: 
  1. Qualquer alteração de design exigia editar dezenas de ficheiros.
  2. Inconsistência visual (espaçamentos, tamanhos de letra, cores de foco e estados disabled diferentes).
  3. Dificuldade de manutenção e risco de bugs.

### 2. A Solução: Componentes Reutilizáveis em components/ui/
- **Button (components/ui/button.tsx)**:
  - Utiliza class-variance-authority (cva) para gerir variantes (default, outline, secondary, ghost, destructive, cyan, emerald, amber, dark) e tamanhos (default, xs, sm, lg, icon).
  - Garante automaticamente estados de foco acessíveis (focus-visible:ring-3), estados desativados (disabled:opacity-50) e animações de clique (active:scale-95).
- **Input (components/ui/input.tsx)**:
  - Encapsula o estilo base moderno com bordas dinâmicas, suporte a temas claros e escuros, e foco estilizado.
- **Badge (components/ui/badge.tsx)**:
  - Componente padronizado para etiquetas de microciclo, tempo de exercício, estatuto de jogador e categorias.
- **Textarea (components/ui/textarea.tsx)**:
  - Área de texto estilizada e padronizada para observações de treino e notas táticas.

### 3. O que acontece Por Detrás dos Panos
- **Class Variance Authority (CVA)**: O CVA compila dinamicamente as classes de Tailwind baseadas nas propriedades passadas ao componente.
- **Função cn() (clsx + tailwind-merge)**: Ao combinar as classes do componente base com qualquer className adicional passada via props, o tailwind-merge resolve conflitos de classes de forma inteligente.

---

# Fase 2: Camada de Serviços API (A Fundação)

## 1. O Problema da Mistura de Responsabilidades (SoC)
Antes desta fase, os componentes React chamavam diretamente a função de baixo nível piFetch(" /endpoint\, { method: \POST\, body: ... }) dentro de handlers de eventos como handleSubmit ou onClick.

### Por que razão isto era uma má prática?
1. **Acoplamento Forte**: Se a rota de um endpoint mudasse no backend (ex: de /exercicios para /api/v1/exercicios), tínhamos de procurar e alterar dezenas de ficheiros de componentes UI.
2. **Duplicação de Lógica**: A formatação de payloads e tratamento de erros repetia-se em múltiplos ecrãs.
3. **Dificuldade em Testar e Manter**: Componentes React devem focar-se exclusivamente na apresentação visual (serem \dumb components\), enquanto a comunicação com a API pertence a uma camada de serviços isolada.

## 2. A Nova Arquitetura de Serviços (rontend/services/)
Criámos uma pasta centralizada rontend/services/ com ficheiros dedicados por domínio:
- reinoService.ts: Obter treinos da equipa, criar sessões, gerir metadados e adicionar/remover/atualizar exercícios.
- exercicioService.ts: Gestão do catálogo tático (criação, edição e eliminação).
- tletaService.ts: CRUD de atletas e consulta do plantel por equipa.
- calendarioService.ts: Gestão de eventos, microciclos e sincronização de datas.
- ssiduidadeService.ts: Matriz semanal e mensal de assiduidade de jogadores.
- index.ts: Barrel export que permite importar qualquer serviço via @/services.

## 3. O que Acontece \Por Detrás dos Panos\?
Quando o utilizador clica em \Guardar Treino\:
1. O componente React invoca reinoService.criarTreino(payload).
2. O reinoService encapsula a rota /treinos, o método HTTP POST e a serialização JSON.
3. A função piFetch anexa os cabeçalhos de segurança e o cookie de autenticação HttpOnly.
4. A resposta tipada (Promise<SessaoTreino>) é devolvida ao componente de forma limpa e assíncrona.

---

# Fase 3: Extração de Lógica para Custom Hooks (O Motor)

## 1. O Princípio de Separação de Responsabilidades (UI vs Lógica de Estado)
Nesta fase, aplicámos o padrão de **Custom Hooks** para libertar os componentes gráficos de todo o estado complexo, cálculos de datas e submissões à API.

### Ficheiros Monolíticos Refatorados:
1. **Módulo de Calendário**:
   - usePlaneamentoSemanal.ts: Gere o estado das vistas (month, week, day), a data base, os cálculos de intervalos de datas, e as ações CRUD via calendarioService.
   - Subdivisão em componentes atómicos:
     - CalendarioHeader.tsx: Controlos de navegação, troca de vista e morfociclos.
     - CalendarioWeekView.tsx: Renderização da grelha de 7 dias com cards de eventos.
     - CalendarioMonthView.tsx: Renderização mensal de 42 dias com scroll customizado.
     - CalendarioDayView.tsx: Vista diária detalhada com horários.
     - PlaneamentoSemanal.tsx: Componente orquestrador que reduziu de 628 linhas para ~120 linhas.

2. **Módulo de Treinos**:
   - useTreinoDetailStudio.ts: Absorveu o formulário de metadados, sincronização de estado, modais e ações na timeline de exercícios.
   - TreinoStudioHeader.tsx e TreinoStudioMetadataForm.tsx: Subcomponentes visuais limpos e modulares.
   - useNovoExercicioPrancheta.ts: Gere o formulário de criação/duplicação e integração com a prancheta tática.

3. **Módulo de Assiduidade**:
   - useAttendance.ts: Absorveu o cálculo de semanas, sincronização otimista e matriz de presenças.
   - AttendanceHeader.tsx e AttendanceModal.tsx: Componentes especializados para o topo e modal em portal.
## 2. O que Acontece " Por Detrás dos Panos\?

1. **Memoização com useCallback e useMemo**:
 - As funções de manipulação de dados e os arrays de dias visíveis são memoizados para evitar re-renderizações desnecessárias da árvore DOM quando o utilizador digita texto nos inputs.
2. **Encapsulamento de Ciclo de Vida (useEffect)**:
 - O carregamento assíncrono é gerido de forma segura dentro dos hooks customizados, garantindo que os componentes visuais apenas recebem os dados prontos para renderizar (eventos, loading, diasDaVista).

---

# Fase 5: Refatoramento da Prancheta Tática (O Desafio Final)

## 1. Objetivo
O `TacticalBoard.tsx` concentraria a renderização da Canvas, o histórico de ações e a gestão de atalhos de teclado num único local. O objetivo era separar essas responsabilidades em hooks independentes para melhorar a manutenibilidade e testabilidade.

## 2. Hooks Criados

### `useTacticalCanvasRenderer.ts`
Hook responsável por conter toda a lógica de renderização da Canvas API:
- `drawField()`: Renderiza o campo de jogo (full/half pitch markings)
- `drawSingleDrawing()`: Renderiza desenhos individuais (retângulos, círculos, triângulos, setas, lápis)
- `getDrawingBounds()`: Calcula os bounds e handles de seleção para um drawing
- Gerencia o contexto `ctx` e transformações de rotação

### `useTacticalActions.ts`
Hook responsável pela gestão de estado, histórico, atalhos de teclado e eventos de ponteiro:
- **Gestão de Histórico**: `saveStateToHistory()`, `undo()`, `redo()`, `restoreSnapshot()`
- **Atalhos de Teclado**: Ctrl+Z (Undo), Ctrl+Y/Ctrl+Shift+Z (Redo), Ctrl+C (Copy), Ctrl+V (Paste), Delete/Backspace (Delete), tecla 'R' (Rotate)
- **Events de Ponteiro**: `getCanvasCoords()` - converte coordenadas do mouse para coordenadas do canvas
- **Área de Transferência (Clipboard)**: `clipboardRef` para Ctrl+C/Ctrl+V

### `useTacticalHistory.ts`
Hook simplificado para gestão de histórico de estado (versão preliminar).

## 3. Desafios de Integração
A integração completa desses hooks no `TacticalBoard.tsx` enfrentou limitações com o bundler Turbopack na configuração atual. Os principais problemas foram:
- Conflitos de nomes entre variáveis do componente e do hook
- Resolução de módulos com caminhos `@/components/prancheta/...`
- O estado de renderização da Canvas precisa de gerenciamento cuidadoso dentro do ciclo `requestAnimationFrame`

## 4. Próximos Passos
Para concluir a refatoração da Fase 5, seria necessário:
- Renomear funções/variáveis para evitar conflitos de nomenclatura entre o hook e o componente
- Garantir que o `canvasRef` e o loop de renderização sejam corretamente passados do componente para o hook
- Testar a integridade visual após a extração da lógica de desenho

---

# Fase 4: Fragmentação de Componentes (Dividir para Conquistar)

## 1. Desmembramento de Modais e Isolação de Hooks Form
Aprofundámos a aplicação do princípio de responsabilidade única (SoC) na camada de modais do calendário:
- **`useEventoForm.ts`**: Extraído para absorver o estado interno do formulário de criação/edição de eventos (`formData`, `duracao`, `localOption`, `availableTeams`, seletores de equipas personalizadas).
- **`EventoFormEquipas.tsx`**: Sub-componente dedicado exclusivamente à renderização dos seletores e inputs alternativos de equipa da casa e fora no caso de eventos do tipo `JOGO`.
- **`EventoFormModal.tsx`**: Reduzido significativamente, funcionando unicamente como um contentor de apresentação (dumb modal) e orquestrador das secções do formulário.

## 2. Padrão Orquestrador / Vistas Dedicadas no Calendário
Confirmámos a arquitetura pura do `PlaneamentoSemanal.tsx`:
- **Orquestrador**: Consome apenas o `usePlaneamentoSemanal` e delega toda a renderização para sub-módulos autónomos: `<CalendarioHeader />`, `<CalendarioWeekView />`, `<CalendarioMonthView />`, `<CalendarioDayView />`, `<EventoFormModal />` e `<CalendarioSyncModal />`.
- **Manutenção e Escalabilidade**: Nenhum ficheiro da área de calendário excede os limites de complexidade, garantindo facilidade de teste unitário e prevenção de regressões visuais.

---

# Fase 6: Especialização das Áreas de Trabalho (Exercícios vs Planos de Treino vs Calendário)

## 1. O Problema da Mistura e Duplicação de Fluxos
- **Sintoma Anterior**: O utilizador podia criar treinos tanto no Calendário como na aba Treinos através de modais com campos duplicados (Data, Hora, Local, Duração, etc.).
- **Problema de Engenharia**: Duplicação de código, divergência de estado entre o evento de calendário e a sessão de treino, e falta de um espaço dedicado para o desenho livre e gestão do catálogo de exercícios táticos.

## 2. A Nova Arquitetura de 3 Especialistas (SoC - Separation of Concerns)
Dividimos o sistema em 3 pilares perfeitamente especializados:

### Pilar 1: 📅 Calendário (Agendamento & Logística)
- **Papel**: Define **quando** e **onde** a equipa treina (`dataHoraInicio`, `dataHoraFim`, `local`, `numeroTreino`).
- **O que acontece por detrás dos panos**:
  - O `EventoCalendarioServiceImpl.registarEventoEGerarGrelha` grava o evento e cria automaticamente uma `SessaoTreino` vinculada (relação 1-para-1).
  - No cartão do evento (vistas Semanal, Mensal e Diária), surge um atalho **"Planear Treino"** com o ícone de haltere que aciona `onPlanTreino(evento)`.
  - O estado central em `app/page.tsx` comuta o separador ativo para `"treinos"` e pré-seleciona a sessão correspondente via `initialTreinoId`.

### Pilar 2: 📋 Planos de Treino (Estúdio de Treinos)
- **Papel**: O treinador constrói a sessão pedagógica com base no agendamento do calendário.
- **O que acontece por detrás dos panos**:
  - A `SessaoTreinoResponseDTO` agora transporta o campo `local` mapeado diretamente do evento de calendário associado via `SessaoTreinoMapper`.
  - O cabeçalho (`TreinoStudioHeader`) e a lista lateral (`TreinosSidebarList`) mostram imediatamente a Data, Hora, Microciclo e o Local (`MapPin`).
  - O treinador foca-se exclusivamente na montagem desportiva: definir o **Objetivo Principal**, **Nº de Jogadores**, **Intensidade Geral**, **Material** e importar os exercícios do catálogo ou desenhá-los na prancheta.

### Pilar 3: 🎨 Página Dedicada da Prancheta Tática (`PranchetaStudio.tsx`)
- **Papel**: Laboratório de criação e gestão de todo o repertório de exercícios do clube.
- **Estrutura**:
  - **Menu Lateral Esquerdo**: Galeria com catálogo completo de exercícios guardados no PostgreSQL, pesquisa em tempo real e filtros rápidos por categoria (*Aquecimento, Técnico, Tático, Físico, Guarda-Redes, Lúdico*).
  - **Área Central/Direita**: A Prancheta Tática interativa (`TacticalBoard`), sincronizada com a Ficha Técnica do Exercício (Nome, Categoria, Espaço, Nº Jogadores, Nível de Dificuldade 1-5, Objetivos e Instruções).
  - **Operações**: "+ Novo", "Guardar Exercício", "Duplicar", "Eliminar" e visualização da ficha técnica colapsável.
  - Todos os exercícios gravados aqui ficam instantaneamente disponíveis para serem importados em qualquer sessão de treino!

## 3. Dissecação Linha-a-Linha do Transporte do `Local` (Backend & Frontend)
1. **DTO de Resposta (`SessaoTreinoResponseDTO.java`)**:
   ```java
   private String local;
   ```
2. **Mapper (`SessaoTreinoMapper.java`)**:
   ```java
   .local(entity.getEventoCalendario() != null ? entity.getEventoCalendario().getLocal() : null)
   ```
3. **Modelo TypeScript (`models/sessao-treino.ts`)**:
   ```typescript
   export interface SessaoTreino {
     id: string;
     eventoId?: string;
     data: string;
     hora?: string;
     local?: string;
     ...
   }
   ```
4. **Renderização Visual no Card (`TreinosSidebarList.tsx`)**:
   ```tsx
   {t.local && (
     <div className="flex items-center gap-1">
       <MapPin className="w-3 h-3 text-cyan-400/80" />
       <span className="truncate max-w-[110px]">{t.local}</span>
     </div>
   )}
   ```

