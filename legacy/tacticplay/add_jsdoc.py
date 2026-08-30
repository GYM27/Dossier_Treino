import glob
import re

docs = {
    'drawField': '/**\n * Desenha o campo de futebol e as suas marcações principais (linhas, áreas, meio campo).\n * Adapta-se ao estilo de campo selecionado (completo, meio campo, etc.).\n */',
    'drawArrowhead': '/**\n * Desenha a ponta de uma seta no fim de uma linha de percurso.\n * @param {CanvasRenderingContext2D} context - O contexto 2D do canvas.\n * @param {number} x - Posição X da ponta da seta.\n * @param {number} y - Posição Y da ponta da seta.\n * @param {number} angle - O ângulo de rotação da seta em radianos.\n */',
    'drawTacticalDrawings': '/**\n * Renderiza todos os desenhos livres feitos pelo utilizador por cima do campo tático.\n */',
    'drawLoop': '/**\n * O ciclo principal de renderização da aplicação.\n * Limpa o canvas e redesenha o campo, elementos táticos (jogadores, bolas), trajetórias e desenhos.\n */',
    'propagateMovement': '/**\n * Propaga o movimento de um elemento tático para os frames seguintes na árvore de jogadas.\n * @param {string} nodeId - O ID do nó (frame) atual.\n * @param {string} elementId - O ID do elemento a mover.\n * @param {number} dx - A diferença de movimento no eixo X.\n * @param {number} dy - A diferença de movimento no eixo Y.\n */',
    'addPlayer': '/**\n * Adiciona um novo jogador ao campo.\n * @param {string} team - A equipa do jogador ("home" ou "away").\n */',
    'addBall': '/**\n * Adiciona uma bola ao campo.\n */',
    'addCone': '/**\n * Adiciona um cone de treino ao campo.\n */',
    'loadTacticalPreset': '/**\n * Carrega uma predefinição tática (ex: 4-3-3, 4-4-2) no campo atual.\n * @param {string} preset - O identificador da tática.\n */',
    'getActiveFrameId': '/**\n * Obtém o ID do frame (nó) ativo na linha do tempo tática.\n * @returns {string} O ID do frame atual.\n */',
    'getActiveElements': '/**\n * Obtém a lista de elementos táticos (jogadores, bolas, cones) do frame ativo.\n * @returns {Array} Array de elementos.\n */',
    'getActiveNode': '/**\n * Retorna o objeto do nó (frame) atualmente ativo com base no estado.\n * @returns {Object} O nó da árvore de táticas.\n */',
    'getFullPath': '/**\n * Constrói o caminho completo da raiz até a um nó específico.\n * @param {string} startNodeId - O ID do nó final do caminho.\n * @returns {Array<string>} Um array de IDs representando o caminho.\n */',
    'buildActivePath': '/**\n * Reconstrói o caminho ativo da linha do tempo com base no nó final.\n * @param {string} endNodeId - O nó onde o caminho atual termina.\n */',
    'setupInteractionListeners': '/**\n * Configura os event listeners para interação com o rato/toque no canvas.\n */',
    'handlePointerDown': '/**\n * Lida com o evento de início de toque/clique no canvas.\n * Inicia o arraste de elementos ou o desenho livre.\n * @param {Event} e - O evento de pointer.\n */',
    'handlePointerMove': '/**\n * Lida com o movimento do ponteiro sobre o canvas.\n * Atualiza a posição da peça arrastada ou desenha a linha livre.\n * @param {Event} e - O evento de pointer.\n */',
    'handlePointerUp': '/**\n * Lida com o fim do evento de toque/clique no canvas.\n * Finaliza o arraste de elementos ou o desenho.\n * @param {Event} e - O evento de pointer.\n */',
    'handleDoubleClick': '/**\n * Lida com o clique duplo sobre um elemento no canvas, abrindo o modal de edição.\n * @param {Event} e - O evento de pointer.\n */',
    'triggerVideoExport': '/**\n * Inicia o processo de gravação da animação para exportar um ficheiro de vídeo (MP4/WebM).\n */',
    'stopVideoRecording': '/**\n * Finaliza a gravação do vídeo e desencadeia o download do ficheiro resultante.\n */',
    'saveStateToHistory': '/**\n * Guarda o estado atual da tática no histórico para permitir ações de Undo.\n */',
    'undo': '/**\n * Reverte a prancheta para o estado anterior guardado no histórico.\n */',
    'redo': '/**\n * Refaz a última alteração revertida pelo Undo.\n */',
    'restoreSnapshot': '/**\n * Restaura a aplicação inteira com base num estado (snapshot) específico do histórico.\n * @param {Object} snapshot - O estado a ser restaurado.\n */',
    'saveTacticToStorage': '/**\n * Guarda a tática atual no LocalStorage do navegador.\n */',
    'loadSavedTacticsList': '/**\n * Carrega e atualiza a interface com a lista de táticas guardadas no LocalStorage.\n */',
    'loadSavedTactic': '/**\n * Carrega uma tática guardada para o canvas principal.\n * @param {number} idx - O índice da tática no LocalStorage.\n */',
    'deleteSavedTactic': '/**\n * Apaga permanentemente uma tática guardada do LocalStorage.\n * @param {number} idx - O índice da tática.\n */',
    'shareTactic': '/**\n * Gera um URL de partilha contendo os dados comprimidos da tática atual.\n */',
    'closeShareModal': '/**\n * Fecha a janela (modal) de partilha da tática.\n */',
    'copyShareUrl': '/**\n * Copia o URL de partilha gerado para a área de transferência do utilizador.\n */',
    'checkSharedUrl': '/**\n * Verifica se existe uma tática partilhada no URL atual e, se sim, carrega-a.\n */',
    'clearActiveLoadedTactic': '/**\n * Limpa o estado da tática atualmente carregada, permitindo iniciar uma nova de rascunho.\n */',
    'updateUndoRedoUI': '/**\n * Atualiza o estado visual (ativo/inativo) dos botões de Undo e Redo.\n */',
    'toggleEditMode': '/**\n * Alterna entre o modo de Edição (criar tática) e o modo de Animação/Visualização.\n */',
    'setDrawingMode': '/**\n * Define a ferramenta atual do cursor (selecionar, desenhar linha plana, tracejada, etc.).\n * @param {string} mode - O modo da ferramenta (ex: "select", "line").\n */',
    'clearDrawings': '/**\n * Limpa todos os desenhos livres e marcações desenhadas no canvas.\n */',
    'changePitchStyle': '/**\n * Altera a visualização gráfica do campo (completo, meio campo ofensivo, etc.).\n */',
    'showInteractiveOverlay': '/**\n * Exibe a janela sobreposta quando a animação atinge um ponto de decisão (ramificação tática).\n */',
    'hideInteractiveOverlay': '/**\n * Oculta a janela de decisão interativa.\n */',
    'renameFrame': '/**\n * Permite alterar o nome do frame (jogada) atual através de um input na interface.\n */',
    'updateTimelineUI': '/**\n * Reconstrói a interface da linha do tempo (timeline) na zona inferior da app,\n * refletindo a árvore de jogadas e nós ativos.\n */',
    'switchBranch': '/**\n * Muda o caminho ativo da jogada para seguir por uma ramificação alternativa da árvore.\n * @param {string} nodeId - O nó para o qual mudar.\n */',
    'addAnimationFrame': '/**\n * Adiciona um novo frame sequencial na mesma linha tática (avança a jogada).\n */',
    'addAlternativeFrame': '/**\n * Adiciona uma alternativa (ramificação) a partir do frame atual.\n */',
    'deleteCurrentFrame': '/**\n * Apaga o frame atual e todos os seus descendentes, recuando para o frame pai.\n */',
    'selectFrame': '/**\n * Seleciona e carrega diretamente um frame através do seu índice na linha do tempo atual.\n * @param {number} idx - O índice do frame a carregar.\n */',
    'prevFrame': '/**\n * Recua para a jogada/frame anterior.\n */',
    'nextFrame': '/**\n * Avança para a próxima jogada/frame, ou exibe as opções caso existam alternativas.\n */',
    'togglePlayback': '/**\n * Alterna o estado de reprodução automática da animação tática (Play/Pause).\n */',
    'updateTransitionSpeed': '/**\n * Atualiza a velocidade de transição das animações com base no controlo da interface.\n * @param {number} value - O novo valor da velocidade em ms.\n */',
    'resetBoard': '/**\n * Limpa completamente a prancheta tática e apaga o histórico não guardado.\n */',
    'openEditModal': '/**\n * Abre a janela (modal) de edição das propriedades de uma peça do campo.\n * @param {Object} element - O elemento tático a editar.\n */',
    'selectEditColor': '/**\n * Seleciona uma cor no modal de edição de peça.\n * @param {HTMLElement} btn - O botão de cor clicado.\n * @param {string} color - A cor hexadecimal.\n */',
    'closeEditModal': '/**\n * Fecha a janela (modal) de edição de peça e descarta alterações não salvas.\n */',
    'savePieceChanges': '/**\n * Guarda as alterações (número, cor, label) aplicadas à peça no modal de edição.\n */',
    'deleteSelectedPiece': '/**\n * Apaga definitivamente a peça selecionada no modal do campo tático.\n */',
    'getCanvasCoords': '/**\n * Converte as coordenadas do rato ou toque na janela para as coordenadas internas escaladas do canvas.\n * @param {Event} e - O evento disparado.\n * @returns {Object} Um objeto com {x, y} no espaço 2D do canvas.\n */'
}

for filepath in glob.glob('js/*.js'):
    if 'legacy' in filepath:
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        match = re.search(r'^function\s+([a-zA-Z0-9_]+)\s*\(', line.strip())
        if match:
            func_name = match.group(1)
            # check if previous line already has a comment
            has_comment = False
            if len(new_lines) > 0 and '*/' in new_lines[-1]:
                has_comment = True
            
            if not has_comment and func_name in docs:
                new_lines.append(docs[func_name])
                
        new_lines.append(line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

print("JSDoc comments added successfully!")
