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
- **Navegação Temporal:** O *Período de Referência* permite navegar pelas diferentes semanas (clicando no ícone do calendário para abrir o DatePicker, útil para planear a pré-época ou épocas passadas).
- **Eventos:** Os eventos da semana são automaticamente distribuídos.
- **Microciclo e Mesociclo:** Pode ajustar e visualizar os números da periodização diretamente no cabeçalho.
- **Criar Novo Evento:**
  - Clique em **+ Adicionar** (num dia vazio) ou **+ Novo** para planear um Treino, Jogo, ou Folga.
  - Selecione o Tipo, Início, Fim, Descrição (ex: "Pressão Alta") e Local.
  - O evento será injetado em tempo real no seu calendário.

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
1. Acede à página de **Planeamento.
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
 M a i s   i m p o r t a n t e ,   a o   c l i c a r e s   e m   * * N O V O   E X E R C � C I O * * ,   a b r i r - s e - �   a   * * P r a n c h e t a   T � t i c a * * .   A q u i   p o d e s   d e s e n h a r   a   t u a   j o g a d a ,   a r r a s t a n d o   j o g a d o r e s ,   d e s e n h a n d o   l i n h a s   d e   p a s s e   o u   c o r r i d a ,   e   i n s e r i n d o   n o t a s   p a r a   c a d a   q u a d r o .   Q u a n d o   t e r m i n a r e s ,   p r e e n c h e   o   N o m e   e   c l i c a   e m   * * G r a v a r   T � t i c a * *   ( n o   m e n u   d a   p r a n c h e t a ) .   A   t � t i c a   f i c a r �   a s s o c i a d a   a o   t r e i n o   e   a p a r e c e r �   u m a   m i n i a t u r a   i n t e r a t i v a   n a   l i s t a g e m   d o   t e u   T r e i n o !  
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
