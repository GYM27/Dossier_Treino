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

### 📊 Dashboard Profissional em Tempo Real
- O Painel de Controlo principal ("Bem-vindo") deixou de mostrar dados exemplificativos.
- **Total de Atletas**: Sincronizado automaticamente com os jogadores que inserir no plantel.
- **Distribuição Tática**: O gráfico de barras que mostra quantos Defesas, Médios, etc. tem na equipa é atualizado no exato milissegundo em que um atleta entra ou sai da equipa. A percentagem visual ajusta-se inteligentemente ao tamanho do plantel, nunca excedendo o limite.
