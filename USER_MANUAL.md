# Manual do Utilizador: Dossier do Treinador

Bem-vindo Ã  tua plataforma profissional de gestÃ£o desportiva.

## IntroduÃ§Ã£o

Esta aplicaÃ§Ã£o foi pensada de raiz para facilitar o dia a dia do treinador de futebol. O objetivo Ã© permitir que tenhas todo o histÃ³rico da tua equipa â€” desde as fichas detalhadas dos atletas atÃ© Ã  assiduidade, lesÃµes e planeamento de treinos â€” num Ãºnico local.

## 1. GestÃ£o de Pessoal e Plantel

### 1.1 ConfiguraÃ§Ã£o da Equipa

Antes de adicionar jogadores, o sistema requer a criaÃ§Ã£o de uma **Ã‰poca** (ex: 2025/2026) e de uma **Equipa** (ex: Seniores). Isto garante que o teu histÃ³rico nunca se perde quando mudas de Ã©poca. O sistema nÃ£o permite jogadores "Ã³rfÃ£os".

### 1.2 Ficha do Atleta

Quando inserires um novo jogador no plantel, terÃ¡s de preencher dados cruciais:

- **Dados FÃ­sicos:** Altura e Peso (o sistema bloqueia automaticamente valores absurdos, como alturas de 3 metros, garantindo que a base de dados nÃ£o fica poluÃ­da com erros de digitaÃ§Ã£o).
- **Dados TÃ©cnicos:** PosiÃ§Ã£o Principal (ex: AvanÃ§ado Centro) e PÃ© Preferido.
- **Idade AutomÃ¡tica:** Apenas precisas de introduzir a data de nascimento. O sistema calcula a idade real do jogador no momento da consulta. E se tentares introduzir uma data de nascimento no futuro, o sistema irÃ¡ avisar-te do erro imediatamente.

## 2. CalendÃ¡rio e Assiduidade

### 2.1 CriaÃ§Ã£o de Eventos

Podes agendar **Treinos, Jogos, ReuniÃµes ou Folgas**. Cada evento tem uma Data e Hora de inÃ­cio e de fim.

### 2.2 Grelha AutomÃ¡tica de PresenÃ§as

**A Funcionalidade Estrela!**
Esquece as folhas de Excel onde tinhas de escrever o nome dos 25 jogadores todos os dias. No "Dossier do Treinador", no exato momento em que crias um Treino, o sistema vai Ã  tua Equipa, copia a lista de todos os atletas e gera automaticamente a grelha de presenÃ§as do dia. Por defeito, coloca todos como **Presentes**. O teu Ãºnico trabalho serÃ¡ marcar quem faltou ou chegou atrasado!

### Autenticação e Segurança

### Autenticação e Segurança

- **Registo**: Novos utilizadores podem ser registados na plataforma. As passwords são guardadas de forma totalmente segura (encriptada com Hash BCrypt) e invisível na base de dados.
- **Login**: O utilizador efetua login com o seu email e password, recebendo um passe virtual (Token JWT) invisível que permite navegar de forma segura pelo sistema sem precisar de voltar a inserir a palavra-passe a cada ecrã.
- **Acesso Restrito**: Qualquer pessoa não autenticada que tente consultar perfis de atletas ou relatórios de jogo é instantaneamente bloqueada pelo sistema.

### Atualização de Segurança e Permissões

- **Registo Privado**: O sistema já não permite que "qualquer pessoa" crie uma conta livremente na internet. A funcionalidade de registar novos utilizadores (Adjuntos, Equipa Técnica, etc.) requer agora que o Treinador ou Administrador já tenha feito login na aplicação.

### 🔐 Acesso e Login (Novo)

- **Login Inicial**: Ao tentar aceder ao Dossier, será agora recebido por um ecrã de Login interativo.
- A sua sessão estará segura. A inatividade prolongada ou logout invalidarão a chave e redirecionarão novamente para este ecrã.

# Manual do Utilizador: Dossier do Treinador

Bem-vindo Ã  tua plataforma profissional de gestÃ£o desportiva.

## IntroduÃ§Ã£o

Esta aplicaÃ§Ã£o foi pensada de raiz para facilitar o dia a dia do treinador de futebol. O objetivo Ã© permitir que tenhas todo o histÃ³rico da tua equipa â€” desde as fichas detalhadas dos atletas atÃ© Ã  assiduidade, lesÃµes e planeamento de treinos â€” num Ãºnico local.

## 1. GestÃ£o de Pessoal e Plantel

### 1.1 ConfiguraÃ§Ã£o da Equipa

Antes de adicionar jogadores, o sistema requer a criaÃ§Ã£o de uma **Ã‰poca** (ex: 2025/2026) e de uma **Equipa** (ex: Seniores). Isto garante que o teu histÃ³rico nunca se perde quando mudas de Ã©poca. O sistema nÃ£o permite jogadores "Ã³rfÃ£os".

### 1.2 Ficha do Atleta

Quando inserires um novo jogador no plantel, terÃ¡s de preencher dados cruciais:

- **Dados FÃ­sicos:** Altura e Peso (o sistema bloqueia automaticamente valores absurdos, como alturas de 3 metros, garantindo que a base de dados nÃ£o fica poluÃ­da com erros de digitaÃ§Ã£o).
- **Dados TÃ©cnicos:** PosiÃ§Ã£o Principal (ex: AvanÃ§ado Centro) e PÃ© Preferido.
- **Idade AutomÃ¡tica:** Apenas precisas de introduzir a data de nascimento. O sistema calcula a idade real do jogador no momento da consulta. E se tentares introduzir uma data de nascimento no futuro, o sistema irÃ¡ avisar-te do erro imediatamente.

## 2. CalendÃ¡rio e Assiduidade

### 2.1 CriaÃ§Ã£o de Eventos

Podes agendar **Treinos, Jogos, ReuniÃµes ou Folgas**. Cada evento tem uma Data e Hora de inÃ­cio e de fim.

### 2.2 Grelha AutomÃ¡tica de PresenÃ§as

**A Funcionalidade Estrela!**
Esquece as folhas de Excel onde tinhas de escrever o nome dos 25 jogadores todos os dias. No "Dossier do Treinador", no exato momento em que crias um Treino, o sistema vai Ã  tua Equipa, copia a lista de todos os atletas e gera automaticamente a grelha de presenÃ§as do dia. Por defeito, coloca todos como **Presentes**. O teu Ãºnico trabalho serÃ¡ marcar quem faltou ou chegou atrasado!

### Autenticação e Segurança

### Autenticação e Segurança

- **Registo**: Novos utilizadores podem ser registados na plataforma. As passwords são guardadas de forma totalmente segura (encriptada com Hash BCrypt) e invisível na base de dados.
- **Login**: O utilizador efetua login com o seu email e password, recebendo um passe virtual (Token JWT) invisível que permite navegar de forma segura pelo sistema sem precisar de voltar a inserir a palavra-passe a cada ecrã.
- **Acesso Restrito**: Qualquer pessoa não autenticada que tente consultar perfis de atletas ou relatórios de jogo é instantaneamente bloqueada pelo sistema.

### Atualização de Segurança e Permissões

- **Registo Privado**: O sistema já não permite que "qualquer pessoa" crie uma conta livremente na internet. A funcionalidade de registar novos utilizadores (Adjuntos, Equipa Técnica, etc.) requer agora que o Treinador ou Administrador já tenha feito login na aplicação.

### 🔐 Acesso e Login (Novo)

- **Login Inicial**: Ao tentar aceder ao Dossier, será agora recebido por um ecrã de Login interativo.
- A sua sessão estará segura. A inatividade prolongada ou logout invalidarão a chave e redirecionarão novamente para este ecrã.
- O Plantel agora mostra exatamente os dados que estão inseridos na Base de Dados e na Área Clínica (Lesões/Convocatórias dependem diretamente destes dados).

### 📝 Gestão do Plano de Treino (Novo)

- **Catálogo de Exercícios**: Pode criar exercícios base com categorias (Tático, Físico, etc.) e níveis de dificuldade.
- **Sessões de Treino**: Para cada dia de treino, crie uma "Sessão" e adicione exercícios do catálogo. O sistema calculará automaticamente a duração total da sessão somando a duração que atribuiu a cada exercício para aquele dia!

### 3.3. Planeamento Semanal (Calendário)

Aceda ao **Calendário** através da barra lateral. Esta secção serve como o "Centro de Comando" do Treinador:

- **Visualização Glassmorphism:** O layout apresenta uma grelha de 7 dias (Segunda a Domingo).
- **Navegação Temporal:** O _Período de Referência_ permite navegar pelas diferentes semanas (clicando no ícone do calendário para abrir o DatePicker, útil para planear a pré-época ou épocas passadas).
- **Eventos:** Os eventos da semana são automaticamente distribuídos.
- **Microciclo e Mesociclo:** Pode ajustar e visualizar os números da periodização diretamente no cabeçalho.
- **Criar Novo Evento:**
  - Clique em **+ Adicionar** (num dia vazio) ou **+ Novo** para planear um Treino, Jogo, ou Folga.
  - Selecione o Tipo, Início, Fim, Descrição (ex: "Pressão Alta") e Local.
  - O evento será injetado em tempo real no seu calendário.

### 🔧 Melhorias Técnicas Internas (Arquitetura Modular)

- **Modais Isolados e Reutilizáveis**: O formulário de eventos foi totalmente refatorizado para separar a lógica de negócio num hook dedicado (`useEventoForm.ts`) e o sub-componente de seleção de equipas (`EventoFormEquipas.tsx`), tornando a manutenção mais limpa e organizada.
- **Vistas Independentes**: As vistas de Calendário (`WeekView`, `MonthView`, `DayView`) operam de forma isolada, garantindo escalabilidade e alta manutenibilidade do código.

## 3.4. Assiduidade (Modo Tabela de Controlo)

### 📊 Dashboard Profissional em Tempo Real

- O Painel de Controlo principal ("Bem-vindo") deixou de mostrar dados exemplificativos.
- **Total de Atletas**: Sincronizado automaticamente com os jogadores que inserir no plantel.
- **Distribuição Tática**: O gráfico de barras que mostra quantos Defesas, Médios, etc. tem na equipa é atualizado no exato milissegundo em que um atleta entra ou sai da equipa. A percentagem visual ajusta-se inteligentemente ao tamanho do plantel, nunca excedendo o limite.

---

### Como Atualizar o Meu Perfil

O Treinador pode agora atualizar as suas próprias informações pessoais!

1. Navega até ao canto superior direito do ecrã principal (onde aparecem as tuas iniciais e cargo).
2. Clica sobre o teu nome para abrir um pequeno menu suspenso.
3. (Opcional) A partir desse menu, também podes **Terminar Sessão** em segurança de forma mais rápida.
4. Para alterar os dados, clica no ícone da Engrenagem (Configurações) na barra lateral esquerda.
5. Seleciona a aba **"O Meu Perfil"**.
6. Atualiza o teu nome ou define uma nova password.
7. Clica em "Guardar Alterações" e os teus dados serão atualizados em tempo real!

## 5. M�dulo Assiduidade (Centro de Controlo)

A funcionalidade de **Assiduidade** baseia-se numa Matriz / Grelha Semanal.

- **Navega��o**: No topo da grelha pode escolher qual a semana que pretende visualizar, usando as setas do calend�rio.
- **Visualiza��o**: � esquerda visualiza o plantel completo da sua equipa e no cabe�alho encontra os eventos da semana. Uma c�lula vazia com '?' significa que a presen�a n�o foi alterada, e um �cone de 'Cama' significa que � um dia de 'Folga' sem evento.
- **Registar Presen�as**: Basta colocar o rato por cima do �cone (cruzamento do Jogador com o Treino) e vai aparecer um pequeno menu flutuante. Clicando numa das op��es (Presente, Ausente, Atrasado, Les�o, Sele��o) a altera��o fica **logo gravada**!
- **Painel de Estat�sticas**: No cabe�alho visualiza a m�dia de disponibilidade da semana, o n�mero de lesionados e de jogadores ao servi�o da sele��o.

### Sincronização com o Google Calendar / Apple Calendar

Podes sincronizar os teus eventos planeados no Dossier do Treinador diretamente com o teu calendário pessoal!

1. Acede à página de \*\*Planeamento.
2. Clica no botão **"Sincronizar"** no canto superior direito.
3. Copia o link fornecido.
4. Vai ao Google Calendar > Adicionar Calendário > "A partir do URL" e cola o link.

**⚠️ Testes Locais:** Se o link tiver localhost, o Google não consegue aceder. Precisas de usar o
grok (ex:
grok http 8080) para criar um link público e usar esse link na subscrição.

### Marcar Assiduidade para Novos Jogadores

Se adicionares um jogador novo ao plantel a meio da epoca, ele aparecera imediatamente na tua grelha de assiduidade com o estado '?' (Nao Definido). Podes clicar na celula dele em qualquer treino ou jogo e marcar a presenca, e o sistema criara o registo automaticamente sem dar erro.

### Adicionar Fotografia ao Jogador

1. Acede a pagina de Plantel e clica num jogador para Editar (ou cria um novo).
2. No formulario, veras um novo campo 'URL da Fotografia'.
3. Cola o link (URL) de uma imagem (ex: do Google Imagens, clicando com o botao direito em 'Copiar Endereco da Imagem').
4. Guarda o atleta. A foto passara a aparecer em miniatura na grelha do Plantel e tambem na Assiduidade!

## Construtor de Treinos e Cat�logo de Exerc�cios

No menu lateral esquerdo ir�s reparar num novo �cone com um Haltere chamado **Treinos**. Ao clicares nele, e depois em **Novo Treino**, abres o ecr� do Construtor de Sess�es de Treino.
Neste ecr� t�tico de fundo escuro, podes ver no topo todos os dados estruturais do teu treino segundo a Periodiza��o T�tica (Morfociclo, Microciclo, Fase).
Se desceres a p�gina, v�s o separador 'Exercise Flow'. Ao clicares em **IMPORT LIBRARY**, ir�s abrir a tua biblioteca global de Exerc�cios, onde podes escolher qualquer um que tenhas criado para o incorporar imediatamente na sess�o que est�s a construir!

 # #   P r a n c h e t a   T � t i c a 
 N a   p � g i n a   d e   c o n s t r u � � o   d e   u m   T r e i n o ,   p o d e s   a g o r a   e d i t a r   o s   * * O b j e t i v o s   G e r a i s * *   ( c l i c a n d o   e m   +   A d i c i o n a r )   e   o   * * M a t e r i a l * * .   C l i c a   e m   * * G R A V A R   T R E I N O * *   p a r a   g u a r d a r e s   e s t a s   a l t e r a � � e s . 
 M a i s   i m p o r t a n t e ,   a o   c l i c a r e s   e m   * * N O V O   E X E R C � C I O * * ,   a b r i r - s e - �   a   * * P r a n c h e t a   T � t i c a * * .   A q u i   p o d e s   d e s e n h a r   a   t u a   j o g a d a ,   a r r a s t a n d o   j o g a d o r e s ,   d e s e n h a n d o   l i n h a s   d e   p a s s e   o u   c o r r i d a ,   e   i n s e r i n d o   n o t a s   p a r a   c a d a   q u a d r o .   Q u a n d o   t e r m i n a r e s ,   p r e e n c h e   o   N o m e   e   c l i c a   e m   * * G r a v a r   T � t i c a * *   ( n o   m e n u   d a   p r a n c h e t a ) .   A   t � t i c a   f i c a r �   a s s o c i a d a   a o   t r e i n o   e   a p a r e c e r �   u m a   m i n i a t u r a   i n t e r a t i v a   n a   l i s t a g e m   d o   t e u   T r e i n o ! 
 
 

## Guia do Treinador - Prancheta Tática Avançada

### Como Utilizar a Prancheta Tática

1. **Desenhar Formas e Linhas**:
   - Na barra inferior, escolhe a forma desejada (**Retângulo**, **Círculo**, **Triângulo**) ou linha (**Passe/Tracejada**, **Corrida/Contínua**, **Caneta Livre**).
   - Clica e arrasta no relvado para traçar a forma ou seta.

2. **Selecionar, Mover e Redimensionar**:
   - Com o cursor de **Seleção** ativo, clica sobre qualquer objeto no campo:
     - **Jogadores, Cones e Bola**: Exibem um anel luminoso ciano tracejado à volta da peça.
     - **Formas**: Exibem uma moldura delimitadora luminosa com pegas circulares azuis nos cantos. Clica dentro para arrastar ou puxa as pegas para aumentar/diminuir.
     - **Linhas**: Exibem uma aura neon brilhante ao longo da linha com pegas azuis nas pontas para mudar a direção e comprimento.

3. **Barra Flutuante de Edição Rápida (Floating Toolbar)**:
   - Ao selecionares qualquer forma ou linha, surge uma barra escura diretamente por cima dela com tamanho padronizado:
     - **Mudar Tipo**: Transforma um quadrado num círculo, triângulo, pentágono ou hexágono, ou uma linha contínua em tracejada com 1 só clique.
     - **Cores & Linha**: Ajusta a cor do contorno, a cor de preenchimento e o tipo de linha (sólida/tracejada).
     - **Espessura & Opacidade**: Define a espessura do traço e a transparência do interior da forma (0% a 100%).

4. **Eliminar Objetos com a Tecla Delete ou Backspace**:
   - Clica no objeto e prime a tecla **Delete** ou **Backspace** no teclado do teu computador para o remover instantaneamente. Podes também usar o ícone do lixo na barra flutuante.

5. **Limpar Campo e Reposicionar Jogadores**:
   - Clica no ícone do **caixote do lixo** na barra inferior:
     - Todos os desenhos, setas, linhas e cones são limpos do relvado.
     - Os 11 jogadores Amarelos voltam alinhados atrás da baliza esquerda e os 11 jogadores Azuis voltam alinhados atrás da baliza direita.
     - A bola 3D regressa ao círculo central, pronta para começares a desenhar um novo exercício!

### Atalhos de Teclado no Quadro Tático

- **Desfazer (Undo)**: Prime **Ctrl + Z** (ou Cmd + Z no Mac) para anular a última ação, linha desenhada, movimento de jogador ou limpeza.
- **Refazer (Redo)**: Prime **Ctrl + Y** ou **Ctrl + Shift + Z** para recuperar uma ação anulada.
- **Eliminar Elemento**: Prime **Delete** ou **Backspace** para remover a forma, linha ou jogador selecionado.

- **Copiar e Colar (Copy & Paste)**:
  - Clica em qualquer jogador, cone, bola, linha ou forma geométrica para selecionar.
  - Prime **Ctrl + C** (ou Cmd + C no Mac) para copiar para a área de transferência.
  - Prime **Ctrl + V** (ou Cmd + V no Mac) para colar uma cópia duplicada com deslocamento imediato no campo.

## Guia das Novas Funcionalidades da Prancheta Tática

### 1. Seleção de Campo (Full / Half / Free)

- No topo da prancheta, o Treinador pode alternar entre:
  - **Full**: Campo completo com 2 balizas.
  - **Half**: Meio-campo com grande área e linha de meio-campo.
  - **Free**: Relvado livre sem linhas interiores, ideal para criar exercícios do zero.

### 2. Balizas Móveis (Mini, Fut 7, Fut 11)

- Na barra inferior de peças, clica no ícone da baliza (ao lado do cone) para adicionar uma baliza móvel.
- Clica na baliza para abrir a barra de controlo:
  - Escolhe a dimensão: **Mini**, **Fut 7** ou **Fut 11**.
  - Roda a baliza com o botão **+90°**, botões direcionais ou premindo **R** no teclado.

### 3. Personalização de Jogadores e Coringas

- Clica em qualquer jogador com o cursor:
  - **Dimensão**: Escolhe entre **Pequeno**, **Médio** ou **Grande**.
  - **Nome / Sigla**: Escreve 'GR', 'C' (Coringa), '10', 'MC', etc.
  - **Cores**: Escolhe entre as 7 cores de coletes (amarelo, azul, vermelho, verde, laranja, branco, preto) ou escolhe uma cor livre no gradiente.

### 5. Usabilidade e Edição Rápida

- **Seleção de Áreas e Zonas**: Ao desenhar Quadrados ou Círculos, agora pode arrastá-los clicando diretamente no seu interior ou confortavelmente sobre a linha, tornando o reposicionamento da tática mais orgânico.
- **Edição Imediata de Jogador**: Ao selecionar qualquer Jogador, a barra de opções surge e o campo do Nome/Número fica automaticamente ativo para começar logo a digitar.

### Ajuste de Cursor no Tactical Builder

- **Cursor Contextual**: Na prancheta tática, o rato agora apresenta uma seta normal (cursor-default) sempre que o modo ativo for "Selecionar", revertendo para a mira (cursor-crosshair) apenas durante ações de desenho de formas ou linhas.

### Rotação Universal

Agora pode rodar livremente **todas as Formas Geométricas** (Quadrados, Círculos, etc.) e as **Balizas**, tal como fazia com as linhas!

1. Selecione a forma ou a baliza.
2. Vai notar um **Ponto Azul** luminoso no topo da caixa de seleção.
3. Clique e arraste esse ponto para inclinar o objeto como preferir.

- _Nota:_ Mesmo depois de inclinar um objeto, pode continuar a usar os quatro cantos para o esticar ou encolher, e a física acompanhará perfeitamente a inclinação!

### Gestão e Criação de Treinos (Novo Estúdio de Treinos)

1. **Navegar pelo Histórico**: Na barra lateral esquerda encontra todos os treinos registados para a equipa ativa, ordenados por microciclo/data, com contagem de exercícios e duração.
2. **Criar Novo Treino**: Clique no botão **"+ Novo"** no topo da barra lateral para abrir o assistente. Preencha a data, hora, local e objetivo. O treino será agendado automaticamente no Calendário!
3. **Adicionar Exercícios por Pastas (Momentos do Jogo)**:
   - Clique em **"Biblioteca"** para abrir o catálogo. Pode navegar pelas 5 pastas principais (`Organização Ofensiva`, `Organização Defensiva`, `Transições`, etc.) ou pelas suas subpastas, alternar para a vista de todos os exercícios ou usar a pesquisa rápida.
   - Clique em qualquer exercício para o adicionar de imediato à sessão de treino.
4. **Editar e Ajustar Tempos em Tempo Real**:
   - Clique em **"Modo Edição"** (botão com ícone de lápis) para ajustar o tempo (`tempo`) de qualquer exercício. Ao alterar o valor (ex: de 10 para 20 min) e sair do campo ou premir Enter, o tempo total do plano de treino no cabeçalho atualiza-se de imediato e grava automaticamente na base de dados.
   - Altere o número de jogadores, o material ou os objetivos e clique em **"Guardar"**.
5. **Reordenar Exercícios no Plano (Arrastar e Largar / Botões Direcionais)**:
   - **Arrastar e Largar (Drag & Drop)**: Clique no puxador vertical (`⋮⋮`) no cabeçalho de qualquer cartão de exercício e arraste-o para a posição desejada na lista. O cartão de destino acenderá a ciano para indicar onde o exercício será inserido. Ao largar, a ordem da sessão atualiza-se de imediato e grava automaticamente na base de dados.
   - **Botões Subir / Descer**: Pode também usar os botões **`[▲]` (Mover para Cima)** e **`[▼]` (Mover para Baixo)** no canto superior direito de cada cartão para reposicionar o exercício um lugar de cada vez. A alteração é persistida atomicamente sem qualquer retorno à posição original.
6. **Substituir Exercício no Mesmo Lugar (`[🔄]`)**:
   - Clique no ícone **`[🔄]` (Substituir)** no topo de qualquer cartão de exercício. A biblioteca abrirá em modo de substituição, permitindo escolher o novo exercício que assumirá imediatamente aquela posição na sessão de treino.

### Gerir, Editar e Duplicar Exercícios na Biblioteca

1. **Abrir a Biblioteca**: No ecrã de treino, clique em **"Biblioteca"**.
2. **Editar / Clonar um Exercício**:
   - Clique no ícone de **Lápis** no cartão do exercício pretendido.
   - A Prancheta Tática abrirá com o desenho e os dados desse exercício pré-carregados.
   - Se alterar o nome (ex: de "Rondo 4v4" para "Rondo 4v4 + 2 Apoios"), o botão muda para **"Gravar como Novo"**. Ao gravar, o sistema cria o novo exercício e mantém o original!
   - Se quiser apenas corrigir o exercício original, mantenha o nome e clique em **"Atualizar Original"**.
3. **Eliminar Exercício**: Clique no ícone do **Caixote do Lixo** para remover o exercício da biblioteca.

### Como Utilizar a Nova P�gina de Treinos e Biblioteca

1. **P�gina de Treinos:**
   - A p�gina apresenta, do lado esquerdo, uma lista (sidebar) de todos os teus treinos e, do lado direito, o detalhe do treino selecionado.
   - Ao abrir um treino, este apresenta-se em **Modo de Leitura**. Neste modo, as informa��es est�o preparadas para uma leitura f�cil (por exemplo, num tablet no campo).
   - Para fazer modifica��es, clica no bot�o **'Modo Edi��o'** (�cone do l�pis) no topo. Podes ent�o modificar o objetivo, a data, o n�mero de jogadores, e tamb�m adicionar, editar ou remover os exerc�cios do treino. No final, clica em \*\*'Guardar Altera��es'.

2. **Biblioteca de Exerc�cios:**
   - Ao clicares em 'Biblioteca' podes agora ver os teus exerc�cios listados com uma pequena pr�-visualiza��o (miniatura).
   - Em cada cart�o de exerc�cio, encontras bot�es r�pidos para **Editar** ou **Eliminar**.
   - **Funcionalidade M�gica:** Se estiveres a editar um exerc�cio (por exemplo: 'Rondo 4x4') e lhe mudares o nome para 'Rondo 5x5' ao gravar, o Dossier Treinador percebe imediatamente a inten��o e **duplica o exerc�cio**, gravando-o como um novo no cat�logo, mantendo o original intacto!

## Interface Padronizada e Consistente (Fase 1)

### Experiência de Utilização Uniforme

- **Botões e Controlos**: Todos os botões de ação principal (Criar Treino, Guardar, Modos Leitura/Edição, Exportar PDF) agora possuem feedback tátil consistente (animações de clique e foco visível).
- **Campos de Formulário**: Os campos numéricos, seletores de data/hora e caixas de texto mantêm a mesma tipografia e contraste, quer esteja a agendar um treino, a desenhar uma prancheta ou a registar um atleta no plantel.
- **Etiquetas e Badges**: Indicadores visuais de microciclo, duração em minutos e categorias de exercícios destacam-se com cores semânticas (ciano para microciclos, âmbar para intensidade e verde para confirmações).

### Funcionalidade: Linhas Simples e Rota��o Pelo Centro

- **Linha Sem Seta**: Adicionada a op��o de desenhar uma 'Linha Simples' na barra de ferramentas inferior (e no menu de edi��o flutuante), permitindo criar tra�os diretos sem a seta direcional (ideal para delimitar espa�os ou desenhar obst�culos planos).
- **Handle de Rota��o C�ntrica**: Ao selecionar qualquer tipo de linha (Simples, Deslocamento, ou Passe), agora surge um terceiro ponto de controlo (ponto azul) posicionado ligeiramente acima do meio da linha. Ao clicar e arrastar este ponto, a linha roda perfeitamente em torno do seu eixo central sem alterar o seu comprimento.

## Fiabilidade e Robustez de Operações (Fase 2)

### Sincronização e Resiliência

- **Gravação Instantânea**: Todas as operações de criação de treinos, adição de exercícios da prancheta e marcação de faltas/presenças comunicam através de serviços otimizados com feedback imediato.
- **Tratamento de Falhas**: Se ocorrer uma quebra de ligação durante a gravação de um exercício ou edição do plantel, o sistema apresenta mensagens de estado claras sem bloquear o ecrã do treinador.

## Fluidez Visual e Performance do Estúdio (Fase 3)

### Navegação Ultrarrápida e Sem Bloqueios

- **Vistas do Calendário**: Transição instantânea e fluida entre vista de Mês, Semana e Dia sem atrasos de renderização.
- **Estúdio de Treinos**: Edição rápida de objetivos e materiais com sincronização visual imediata entre os blocos de exercícios.
- **Painel de Assiduidade**: Marcação de presenças com resposta tátil e salvaguarda automática de registos.

---

## Otimização de Fluxos de Treino e Prancheta Tática (Fase 6)

### 1. Como Agendar e Planear um Treino

1. **No Calendário**:
   - Clique em **"+ Novo"** no dia pretendido (ex: Terça-feira).
   - Escolha o tipo **Treino**, defina a hora de início, duração (minutos), local (ex: _Arregaça_) e o número do treino (ex: _#12_).
   - Clique em **"Guardar Evento"**.
2. **Abrir o Estúdio de Treino**:
   - No cartão do treino criado no calendário, clique no botão **"Planear Treino"** (ícone de haltere).
   - É imediatamente redirecionado para a página **"Planos de Treino"** com essa sessão de treino aberta.
   - Todos os dados (Data, Hora, Microciclo e Local) já surgem preenchidos!
3. **Construir a Sessão de Treino e Estrutura dos Exercícios**:
   - Clique em **"Editar"** no topo da sessão para definir a **Hierarquia de Periodização**:
     - **Período da Época**: Escolha entre 🟢 **Preparatório (Pré-Época)**, 🔵 **Competitivo (Época Regular)** ou 🟡 **Transição (Pós-Época / Regeneração)**.
     - **Mesociclo**: Número ordinal do bloco da época (ex: `Mesociclo #1`, `#2`).
     - **Microciclo (Semana)**: Número da semana de trabalho (ex: `Microciclo #3`).
     - **Unidade de Treino (UT)**: Número da sessão de treino individual (ex: `UT #8`).
     - **Metadados Adicionais**: **Objetivo Geral**, **Nº de Atletas**, **Intensidade (1-5)** e **Material Necessário**.
   - **Cabeçalho Visual da Sessão**:
     - Badge do **Período** com destaque de cor semântica (ex: `🟢 PREPARATÓRIO`).
     - `MESO #X` (Bloco temático da época).
     - `MICRO #X` (Semana de trabalho).
     - `UT #X` (Número da sessão de treino individual).
   - **Cartão do Exercício no Estúdio (3 Secções)**:
     1. *Esquerda*: Relvado tático em miniatura com botão **[ECRÃ INTEIRO]** para abrir a prancheta completa.
     2. *Centro (Metodologia Tripartida Integral)*:
        - 🎯 **Objetivo(s) específico(s)**: Comportamentos e princípios táticos trabalhados (exibição integral).
        - 📄 **Descrição e Organização Metodológica**: Regras, movimentações e rotações da tarefa (exibição integral).
        - 📝 **Notas do Treino**: Observações contextuais específicas para a sessão.
     3. *Direita*: Badges verticais de **tempo** (minutos), **número** (atletas), **espaço** (dimensões) e **⚡ carga** (séries e pausas).
   - **Folha Oficial em PDF / Impressão A4 Limpa**:
     - Ao clicar no botão **"PDF"** no topo da sessão de treino, abre-se a folha oficial perfeitamente formatada para impressão A4 ou geração de PDF no navegador.
     - **Isolamento Absoluto**: Toda a interface da aplicação (menus laterais, botões de ação e painéis) é 100% ocultada pelo sistema, sendo impressa **exclusivamente a folha oficial**.
     - **Layout Idêntico à Ficha Técnica**:
        - *Cabeçalho Tabular*: Identificação do Clube e Escalão (ex: `PLANO DE TREINO — UNIÃO 1919 • SUB-17`), Badge do Período, matriz de 5 métricas de periodização (`MESOCICLO`, `MICROCICLO`, `UNIDADE TREINO`, `Nº JOGADORES`, `VOLUME TOTAL`), `Data & Hora`, `Local`, `Material` e `Objetivos Gerais`.
       - *Cartões dos Exercícios*: Numeração circular em preto `( 1 )`, `( 2 )`, `( 3 )`, relvado tático de alta definição sem botões sobrepostos, metodologia completa e métricas verticais (`TEMPO`, `NÚMERO`, `ESPAÇO`, `CARGA`).

### 2. Como Criar e Gerir Exercícios na Prancheta Tática
 
 1. No menu principal ou no topo, aceda a **"Prancheta Tática"**.
 2. **Área Máxima de Desenho**: O relvado de jogo ocupa o centro do ecrã para posicionar atletas, balizas e trajetórias.
 3. **Menu Hambúrguer & Árvore de Pastas (Momentos do Jogo e Bolas Paradas)**:
    - Clique no botão `[☰ Exercícios (X)]` no canto superior esquerdo para **abrir e fechar a biblioteca com 1 clique** no mesmo símbolo (alterna para `[✕]` quando aberta).
    - **Pastas Principais Padrão**:
      - 📁 **Organização Ofensiva**
      - 📁 **Organização Defensiva**
      - 📁 **Transição Ofensiva**
      - 📁 **Transição Defensiva**
      - 📁 **Bolas Paradas**
    - **Criar Pastas e Subpastas ("Pastas dentro de Pastas")**:
      - **Criar Subpasta Imediata**: No cabeçalho de qualquer pasta no acordeão, clique no botão **`[+]`** para abrir o formulário inline já focado para criar uma subpasta diretamente dentro dessa pasta (ex: criar *"Construção / 1ª Fase"* dentro de *"Organização Ofensiva"*).
      - **Criar Nova Pasta Principal**: Clique em **`[+ Pasta]`** no topo da gaveta para criar uma nova pasta raiz.
      - **Contadores de Exercícios**: Cada pasta exibe o número de exercícios diretos e, quando tem subpastas, o total agregado de exercícios (`diretos (total)`).
 4. **Ficha Técnica Horizontal e Atribuição de Pasta**:
    - Configure de forma independente: **Nome do Exercício**, 📁 **Pasta** (com dropdown hierárquico formatado `└─ Subpasta`), **Categoria**, **Espaço** (ex: _50x40m_), ⏱️ **Tempo** (ex: _15 min_), **Nº Atletas**, **Dificuldade (1 a 5)**, ⚡ **Carga** (séries e pausas), 🎯 **Objetivos Específicos** (comportamentos alvo) e 📄 **Descrição e Organização Metodológica**.
 5. **Desenhar, Guardar e Gerir Variantes**:
    - Os jogadores começam pré-configurados em **tamanho pequeno (P)**, ideal para a escala de campo e colocação tática precisa.
    - Utilize a barra de ferramentas inferior da prancheta para alternar entre seleção, linhas de passe/condução, jogadores de equipa da casa/fora, balizas móveis e cones.
    - **Janela de Gravação Inteligente**: Ao clicar em **"Guardar"** num exercício existente, surge o modal com duas opções:
      - **"Atualizar Original"**: Altera o exercício base em toda a biblioteca e permite escolher/mudar a pasta de destino.
      - **"Gravar Nova Variante"**: Permite indicar um novo nome e pasta de destino, criando um novo exercício independente. Se abriu o exercício a partir de um plano de treino, apenas essa posição do treino é vinculada à nova variante, mantendo os restantes exercícios do treino 100% inalterados!
    - Utilize o botão **[← Voltar ao Treino]** no topo para regressar diretamente ao estúdio do plano de treino.
  6. **Edição Contextual na Barra Lateral Esquerda**:
     - **Arrastar para Mover Livremente**: Toque e arraste qualquer jogador, cone, baliza ou linha pelo campo. O elemento move-se com fluidez total e a **barra lateral NÃO abre**, mantendo o relvado completamente livre para desenhar e posicionar as suas tarefas táticas.
     - **Clique Estático para Editar (com Sombreado *Glow*)**: Se der um clique simples (sem arrastar) num elemento, este fica instantaneamente iluminado com uma aura ciano neon e abre-se automaticamente a **Barra Lateral de Edição no lado esquerdo da prancheta**.
     - **Edição de Linhas e Formas**:
       - Alterne o tipo de traço entre **Simples**, **Passe (Tracejado)**, **Corrida (Seta)** e **Livre**.
       - Ajuste a espessura em grelha rápida de 1px a 12px, o estilo de traço contínuo/tracejado, a cor da linha e o preenchimento/opacidade (0% a 100%).
     - **Edição de Jogadores**:
       - Introduza o **Nº da Camisola** ou **Sigla tática** (ex: `7`, `10`, `GR`, `C`, `PL`).
       - Alterne o tamanho do marcador (**Pequeno**, **Médio**, **Grande**) e a cor do equipamento/colete com 1 clique.
     - **Edição de Balizas**:
       - Escolha o tipo de baliza (**Mini**, **Fut 7**, **Fut 11**).
       - Alterne a orientação com o botão **`[+90° (R)]`** ou através dos 4 botões direcionais (⬆️, ⬇️, ⬅️, ➡️).
     - **Duplicação e Eliminação Ágeis**:
       - Duplique qualquer elemento clicando no botão **"Duplicar"** (ou premindo `Ctrl+V`).
       - Elimine o elemento no botão **"Apagar"** (ou premindo a tecla `Delete`/`Backspace`).
     - **Desmarcar e Fechar**: Clique no botão **`[✕]`** no topo da barra lateral esquerda ou clique numa área vazia do relvado para fechar o painel e manter o campo completamente desimpedido.

### 3. Como Criar e Gerir Equipas e Consultar o Clube

1. **Criar Nova Equipa / Escalão**:
   - No menu lateral, aceda a **"Clube"** e clique no botão verde **`[+ Criar Nova Equipa]`** (ou no seletor de equipas no cabeçalho superior).
   - Preencha os campos da nova equipa:
     - **Nome da Equipa / Clube** (ex: *União 1919*, *SC Braga*).
     - **Escalão**: *Seniores*, *Sub-22*, *Sub-19*, *Sub-18*, *Sub-17*, *Sub-16*, *Sub-15*, *Sub-14*, *Sub-13*, *Sub-12*, *Sub-11*, *Sub-10*, *Traquinas*, *Petizes*.
     - **Modalidade / Formato** (ex: *Futebol 11*, *Futebol 9*, *Futebol 7*, *Futsal*).
     - **Época Desportiva** (ex: *2025/2026*).
     - **Duração Padrão do Jogo** (ex: *45' + 45'* ou *40' + 40'*).
     - **Logótipo / Emblema (URL)**.
   - Clique em **"Criar Equipa"**. A equipa é guardada e passa a ser imediatamente a sua equipa ativa em toda a plataforma.

2. **Editar Ficha Técnica da Equipa & Logótipo**:
   - No separador **"Detalhes do Clube & Plantéis"**, clique em **`[Editar Ficha]`** para alterar nome, escalão, formato de jogo e introduzir/colar o **URL do Logótipo / Emblema** (com pré-visualização instantânea e botão Limpar).
   - Clique em **"Guardar Alterações"** para sincronizar com a base de dados.

3. **Alternar de Equipa com 1 Clique**:
   - No separador do clube ou no menu suspenso do topo da página, clique sobre qualquer outro escalão registado para alternar instantaneamente todo o dossier para esse plantel.

### 8. Estúdio da Prancheta Tática e Catálogo de Pastas (Sprint 5)

1. **Biblioteca e Pastas Hierárquicas**:
   - **Organização por Escalão e Fase do Jogo**: Organize exercícios em pastas temáticas (*Organização Ofensiva*, *Transição Defensiva*, *Bolas Paradas*, etc.) e crie subpastas ilimitadas através do botão `[+]`.
   - **Pesquisa Rápida e Filtros**: Encontre qualquer exercício em tempo real pelo nome, objetivos ou categoria técnica.

2. **Ficha Técnica e Ações Rápidas**:
   - **Ficha Técnica Retrátil**: Exiba ou oculte a barra de propriedades (nome, categoria, espaço, duração e número de atletas) com 1 clique.
   - **Duplicação e Variantes**: Crie variantes de exercícios mantendo a estrutura base sem alterar o exercício original.







