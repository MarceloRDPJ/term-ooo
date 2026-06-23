# Arquitetura Multiplayer, Salas e Modos Tematicos

## 1. Objetivo

Este documento define a arquitetura completa para evoluir o projeto atual de um jogo client-side individual para uma plataforma com salas multiplayer, jogo cooperativo, modos Multi Brain e Mega Brain, chat global, chat de grupo, compartilhamento por codigo/link e modos tematicos.

A meta e evitar uma implementacao quebrada ou improvisada. O multiplayer precisa ter estado autoritativo, regras de negocio centralizadas, protocolo claro, persistencia minima, reconexao segura e fluxo testavel como usuario real.

## 2. Estado Atual Do Projeto

O projeto atual e um frontend React/TypeScript com Vite, publicado no GitHub Pages. A logica do jogo roda no cliente, usando dicionarios locais e persistencia via localStorage.

Principais arquivos atuais:

- `src/App.tsx`: orquestracao principal de UI, jogo, dialogs, chat e input.
- `src/game/engine.ts`: motor de jogo, validacao de palavras, avaliacao de palpites, criacao de estado inicial.
- `src/game/mode-config.ts`: configuracao dos modos Termo, Dueto e Quarteto.
- `src/game/storage.ts`: persistencia local via localStorage.
- `src/hooks/usePersistentGameState.ts`: carrega/cria/salva estado local do jogo.
- `src/hooks/useChatWebSocket.ts`: composicao do chat WebSocket atual.
- `src/hooks/useChatConnection.ts`: conexao WebSocket, reconexao e heartbeat.
- `src/hooks/useChatAuth.ts`: nickname e userId persistidos localmente.
- `src/hooks/useChatMessages.ts`: mensagens e contador de nao lidas.
- `src/lib/chat-config.ts`: URL e limites do chat.

Limitacoes atuais:

- Nao existe backend proprio no repositorio.
- GitHub Pages hospeda apenas arquivos estaticos.
- O estado do jogo e local e nao pode ser compartilhado de forma confiavel.
- O chat atual e global e simples; nao ha conceito de sala, partida, dono, lobby ou permissao.
- Nao existe protocolo para sincronizar palpites, votos, jogadores, status de sala ou configuracoes.
- Nao existe armazenamento autoritativo para salas.

Conclusao: salas multiplayer reais exigem backend. Implementar apenas no frontend geraria divergencia de estado, trapaça facil, bugs de reconexao e regras inconsistentes.

## 3. Visao Macro Da Solucao

A arquitetura proposta mantem o frontend no GitHub Pages e adiciona um backend realtime responsavel por salas, presenca, chats e estado autoritativo do jogo multiplayer.

Componentes macro:

- Frontend React: UI, renderizacao do tabuleiro, lobby, chats, formularios e experiencia do usuario.
- Backend Realtime: WebSocket, criacao de salas, presenca, validacao de comandos e broadcast de eventos.
- Estado autoritativo por sala: cada sala tem um estado unico mantido no backend.
- Datasets tematicos: listas versionadas de palavras validas por tema.
- Protocolo tipado: mensagens cliente-servidor e servidor-cliente com `type`, `requestId`, payload e erros padronizados.
- Testes de usuario: validacao com multiplas abas, rotas diretas, reconexao e fluxo completo.

Recomendacao de backend:

- Cloudflare Workers + Durable Objects.

Justificativa:

- GitHub Pages continua servindo o frontend.
- Durable Objects sao adequados para estado isolado por sala.
- WebSocket e suportado.
- Baixa latencia e facil deploy global.
- Cada sala pode ser roteada para um Durable Object especifico pelo `roomCode`.

Alternativas possiveis:

- PartyKit: otimo DX para salas WebSocket, baseado em Cloudflare.
- Supabase Realtime: bom se o projeto tambem precisar de banco relacional e auth.
- Firebase Realtime/Firestore: rapido para prototipo, mas regras e custos precisam de cuidado.
- Node + Socket.IO em VPS/Fly.io/Render: flexivel, mas exige infraestrutura propria.

Decisao recomendada: Cloudflare Durable Objects por ser o encaixe mais robusto para salas isoladas com WebSocket.

## 4. Principios De Arquitetura

1. Servidor autoritativo.

O cliente nunca decide sozinho se um palpite e valido, se o jogo acabou, quem venceu ou qual e o estado final. O cliente pode prevalidar para UX, mas o backend confirma.

2. Compatibilidade com jogo solo.

Os modos diarios atuais devem continuar funcionando sem backend. Multiplayer e um caminho paralelo.

3. Separacao entre engine pura e transporte.

A logica de avaliacao de palavras deve ser reaproveitavel tanto no frontend quanto no backend. WebSocket nao deve estar acoplado ao motor do jogo.

4. Estado de sala imutavel por evento.

Cada comando aceito gera um novo `stateVersion`. Clientes aplicam snapshots/eventos apenas se a versao for coerente.

5. Reconexao previsivel.

Ao reconectar, cliente envia `userId`, `sessionId` e `roomCode`; servidor reanexa o jogador e envia snapshot completo.

6. Falha segura.

Comando invalido nao altera estado. O servidor retorna erro tipado.

7. Moderacao minima.

Sala e chat precisam ter dono, expulsao, mute local/por sala e sanitizacao de nickname/mensagem.

8. Datasets validados.

Temas precisam passar por validacao automatica: 5 letras no modo Wordle-like, normalizacao, duplicatas e compatibilidade com dicionario permitido.

## 5. Dominios Do Sistema

### 5.1 Usuario

Representa uma pessoa usando o jogo. Inicialmente nao precisa de login real.

Campos:

- `userId`: ID persistido no localStorage.
- `sessionId`: ID efemero por aba/conexao.
- `nickname`: nome visivel.
- `avatar`: opcional.
- `createdAt`: primeira vez visto.
- `lastSeenAt`: ultima atividade.

Regra:

- `userId` identifica o usuario entre reconexoes.
- `sessionId` diferencia abas simultaneas.
- Nickname deve ser sanitizado e limitado.

### 5.2 Sala

Ambiente privado ou publico onde jogadores se encontram antes/durante uma partida.

Estados:

- `lobby`: sala criada, aguardando jogadores/configuracao.
- `playing`: partida em andamento.
- `finished`: partida concluida.
- `abandoned`: sala sem atividade ou encerrada.

### 5.3 Partida

Instancia de jogo dentro de uma sala.

Pode existir uma partida por sala no MVP. No futuro, uma sala pode ter historico de rodadas.

### 5.4 Chat

Dois escopos:

- `global`: chat geral da plataforma.
- `room`: chat isolado da sala.

### 5.5 Tema

Conjunto de palavras/solucoes por categoria.

Temas planejados:

- `classic`: dicionario atual.
- `frutas`.
- `objetos`.
- `filmes`.
- `series`.
- `animes`.

Observacao importante: filmes, series e animes normalmente possuem titulos com mais de 5 letras ou multiplas palavras. Para manter o jogo Wordle-like, a fase inicial deve usar palavras-chave/titulos de 5 letras. Modo de titulo livre deve ser outro modo futuro.

## 6. Modelo De Dados

### 6.1 RoomState

```ts
type RoomStatus = 'lobby' | 'playing' | 'finished' | 'abandoned'
type RoomVisibility = 'private' | 'public'

interface RoomState {
  roomId: string
  roomCode: string
  ownerUserId: string
  status: RoomStatus
  visibility: RoomVisibility
  createdAt: number
  updatedAt: number
  expiresAt: number
  lastActivityAt: number
  stateVersion: number
  settings: RoomSettings
  players: RoomPlayer[]
  spectators: RoomSpectator[]
  game: RoomGameState | null
  chat: RoomChatState
  moderation: RoomModerationState
}
```

### 6.2 RoomSettings

```ts
type RoomGameKind = 'daily-team' | 'theme-team' | 'multi-brain' | 'mega-brain'
type GameMode = 'termo' | 'dueto' | 'quarteto'
type ThemeId = 'classic' | 'frutas' | 'objetos' | 'filmes' | 'series' | 'animes'

interface RoomSettings {
  kind: RoomGameKind
  mode: GameMode
  theme: ThemeId
  maxPlayers: number
  allowSpectators: boolean
  hardMode: boolean
  highContrastAllowed: boolean
  turnTimerSeconds: number | null
  autoSubmitMajorityVote: boolean
  majorityThreshold: 'simple' | 'absolute' | 'owner'
  allowOwnerSubmit: boolean
  allowCustomWords: boolean
  customWords: string[]
  rounds: number
  language: 'pt-BR'
}
```

### 6.3 RoomPlayer

```ts
type PlayerRole = 'owner' | 'moderator' | 'player'
type PlayerConnectionStatus = 'online' | 'offline'

interface RoomPlayer {
  userId: string
  sessionId: string | null
  nickname: string
  role: PlayerRole
  status: PlayerConnectionStatus
  joinedAt: number
  lastSeenAt: number
  isReady: boolean
  isMuted: boolean
  score: number
  stats: PlayerRoomStats
}

interface PlayerRoomStats {
  suggestionsMade: number
  votesCast: number
  guessesSubmitted: number
  invalidAttempts: number
}
```

### 6.4 RoomGameState

```ts
interface RoomGameState {
  gameId: string
  roundIndex: number
  seed: string
  dayNumber: number | null
  dateKey: string | null
  startedAt: number
  finishedAt: number | null
  currentRow: number
  maxAttempts: number
  boards: RoomBoard[]
  currentGuess: string[]
  keyStates: Record<string, KeyState[]>
  isGameOver: boolean
  isWin: boolean
  suggestions: GuessSuggestion[]
  submittedGuesses: SubmittedGuess[]
  score: RoomScoreState
}
```

### 6.5 GuessSuggestion

```ts
interface GuessSuggestion {
  suggestionId: string
  word: string
  normalizedWord: string
  createdByUserId: string
  createdAt: number
  votes: GuessVote[]
  status: 'active' | 'submitted' | 'rejected' | 'expired'
}

interface GuessVote {
  userId: string
  votedAt: number
}
```

### 6.6 RoomChatState

```ts
interface RoomChatState {
  messages: ChatMessage[]
  maxMessages: number
}

interface ChatMessage {
  id: string
  scope: 'global' | 'room'
  roomCode?: string
  type: 'message' | 'system' | 'join' | 'leave' | 'guess' | 'vote' | 'error'
  userId?: string
  nickname?: string
  text: string
  createdAt: number
}
```

## 7. Protocolo WebSocket

Todas as mensagens devem ter envelope padrao.

### 7.1 Envelope Cliente Para Servidor

```ts
interface ClientMessage<TType extends string, TPayload> {
  type: TType
  requestId: string
  sentAt: number
  payload: TPayload
}
```

### 7.2 Envelope Servidor Para Cliente

```ts
interface ServerMessage<TType extends string, TPayload> {
  type: TType
  requestId?: string
  sentAt: number
  stateVersion?: number
  payload: TPayload
}
```

### 7.3 Erro Padrao

```ts
interface ServerErrorPayload {
  code:
    | 'ROOM_NOT_FOUND'
    | 'ROOM_FULL'
    | 'ROOM_EXPIRED'
    | 'NOT_ROOM_OWNER'
    | 'INVALID_NICKNAME'
    | 'INVALID_MESSAGE'
    | 'INVALID_WORD'
    | 'GAME_NOT_STARTED'
    | 'GAME_ALREADY_STARTED'
    | 'GAME_ALREADY_FINISHED'
    | 'RATE_LIMITED'
    | 'UNKNOWN_ERROR'
  message: string
  details?: unknown
}
```

### 7.4 Mensagens De Sala

Cliente para servidor:

- `room:create`: cria sala com configuracoes iniciais.
- `room:join`: entra em sala existente por codigo.
- `room:leave`: sai da sala.
- `room:get-state`: solicita snapshot completo.
- `room:update-settings`: dono altera configuracoes no lobby.
- `room:set-ready`: jogador marca/desmarca pronto.
- `room:transfer-owner`: dono transfere propriedade.
- `room:kick-player`: dono/moderador remove jogador.
- `room:mute-player`: dono/moderador silencia jogador.

Servidor para cliente:

- `room:created`: sala criada.
- `room:joined`: entrada confirmada.
- `room:snapshot`: estado completo.
- `room:presence-updated`: jogador entrou/saiu/reconectou.
- `room:settings-updated`: configuracoes alteradas.
- `room:closed`: sala encerrada/expirada.

### 7.5 Mensagens De Jogo

Cliente para servidor:

- `game:start`: dono inicia partida.
- `game:suggest-guess`: jogador sugere palavra.
- `game:vote-guess`: jogador vota em sugestao.
- `game:unvote-guess`: remove voto.
- `game:submit-guess`: dono/capitiao envia palpite.
- `game:next-round`: inicia proxima rodada no Mega Brain.

Servidor para cliente:

- `game:started`: partida iniciada.
- `game:suggestion-added`: nova sugestao.
- `game:suggestion-updated`: votos/status alterados.
- `game:guess-submitted`: palpite aceito e avaliado.
- `game:invalid-guess`: palpite rejeitado.
- `game:finished`: partida finalizada.
- `game:score-updated`: placar atualizado.

### 7.6 Mensagens De Chat

Cliente para servidor:

- `chat:send`: envia mensagem para `global` ou `room`.

Servidor para cliente:

- `chat:message`: mensagem entregue.
- `chat:history`: historico recente.

## 8. Regras De Negocio

### 8.1 Criacao De Sala

Fluxo:

1. Usuario informa nickname ou usa nickname salvo.
2. Usuario escolhe modo: Diario Em Equipe, Tema Em Equipe, Multi Brain ou Mega Brain.
3. Usuario escolhe modo de tabuleiro: Termo, Dueto ou Quarteto.
4. Usuario escolhe tema quando aplicavel.
5. Frontend envia `room:create`.
6. Backend gera `roomCode` unico.
7. Backend cria estado inicial em `lobby`.
8. Backend retorna link compartilhavel.

Regras:

- `roomCode` deve ser curto, legivel e nao ambiguo.
- Codigo deve evitar caracteres confusos: `0/O`, `1/I/L`.
- Sala privada nao aparece em listagem publica.
- Sala expira apos periodo sem atividade.

Formato recomendado:

- Humano: `BODE-42`, `LIMA-73`.
- Simples: `K7X9Q`.

Recomendacao MVP: `K7X9Q`, por simplicidade e menor colisao.

### 8.2 Entrada Na Sala

Fluxo:

1. Usuario abre `/sala/:roomCode` ou digita codigo.
2. Frontend abre WebSocket da sala.
3. Cliente envia `room:join` com `userId`, `sessionId`, `nickname`.
4. Backend valida sala, limite, ban/mute e status.
5. Backend responde com `room:snapshot`.

Regras:

- Se `userId` ja existe e esta offline, reconectar o mesmo jogador.
- Se `userId` ja existe online em outra aba, permitir multipla sessao apenas se configurado; caso contrario substituir sessao.
- Se a sala estiver `playing`, permitir entrada como jogador apenas se a configuracao permitir late join; senao entrar como espectador.

### 8.3 Inicio De Partida

Somente dono/moderador pode iniciar, salvo configuracao de voto para iniciar.

Validacoes:

- Sala em `lobby`.
- Pelo menos 1 jogador.
- Tema possui quantidade minima de palavras.
- Configuracoes validas.
- Todos prontos, se `requireReady` for adicionado.

### 8.4 Submissao De Palpite

No multiplayer, palpite aceito apenas pelo backend.

Validacoes:

- Sala existe.
- Sala esta `playing`.
- Jogo nao terminou.
- Palavra tem 5 letras normalizadas.
- Palavra existe no dicionario permitido do modo/tema.
- Hard mode respeitado quando ativado.
- Usuario tem permissao para submeter.
- Linha atual ainda nao foi enviada.

Resultado:

- Backend chama engine pura.
- Atualiza boards, currentRow, keyStates, isGameOver, isWin.
- Incrementa `stateVersion`.
- Broadcast `game:guess-submitted`.
- Se acabou, broadcast `game:finished`.

### 8.5 Multi Brain

Modelo cooperativo por sugestao e voto.

Regras:

- Qualquer jogador ativo pode sugerir uma palavra.
- Cada jogador pode votar em uma sugestao ativa por rodada.
- O mesmo jogador pode trocar voto.
- Sugestoes duplicadas sao mescladas ou rejeitadas com erro amigavel.
- Se `autoSubmitMajorityVote` estiver ativo, sugestao com maioria e enviada automaticamente.
- Se `allowOwnerSubmit` estiver ativo, dono pode enviar a sugestao escolhida.

Maioria:

- `simple`: maior numero de votos apos timer.
- `absolute`: mais de 50% dos jogadores online.
- `owner`: dono decide.

### 8.6 Mega Brain

Modo avancado com rodadas e pontuacao.

Configuracoes especificas:

- `rounds`: quantidade de rodadas.
- `themeRotation`: tema fixo ou alternado.
- `turnTimerSeconds`: timer por palpite.
- `scoringMode`: coletivo, individual por contribuicao ou hibrido.

Pontuacao recomendada:

- Vitoria: `100 - (attempts - 1) * 10`.
- Dueto/Quarteto: multiplicar por boards concluidos.
- Bonus de consenso: +5 se palpite enviado teve mais de 75% dos votos.
- Bonus first try: +25.
- Penalidade palavra invalida: opcional, -5 para quem sugeriu.

## 9. Temas E Datasets

### 9.1 Regra De Compatibilidade

O jogo atual trabalha com palavras de 5 letras. Portanto, todo tema Wordle-like precisa obedecer:

- Palavra normalizada com exatamente 5 letras.
- Letras de `a-z` apos normalizacao.
- Sem espacos, hifens ou numeros.
- Sem duplicatas apos normalizacao.
- Solucoes tambem devem estar em palavras permitidas, ou o tema deve definir seu proprio conjunto permitido.

### 9.2 Estrutura De Arquivos

```txt
src/game/themes/
  index.ts
  types.ts
  classic.ts
  frutas.ts
  objetos.ts
  filmes.ts
  series.ts
  animes.ts
  validate-theme.ts
```

### 9.3 ThemeDictionary

```ts
interface ThemeDictionary {
  id: ThemeId
  label: string
  description: string
  solutions: string[]
  allowed: string[]
  source: 'manual' | 'curated-public-source' | 'generated'
  version: string
}
```

### 9.4 Politica Para Filmes, Series E Animes

Nao usar APIs em runtime no MVP, porque:

- APIs exigem chave.
- Titulos mudam.
- Muitos resultados nao tem 5 letras.
- GitHub Pages exporia chaves se usadas no frontend.

Caminho recomendado:

- Curadoria offline.
- Gerar lista candidata a partir de fontes publicas quando permitido.
- Filtrar para 5 letras.
- Revisar manualmente.
- Versionar no repositorio.

Exemplos de abordagem:

- Filmes: palavras-chave de titulos/personagens com 5 letras.
- Series: nomes/personagens/lugares com 5 letras.
- Animes: personagens/titulos/termos com 5 letras.
- Frutas e objetos: listas manuais sao mais confiaveis.

## 10. Backend Detalhado

### 10.1 Estrutura Recomendada

```txt
worker/
  package.json
  wrangler.toml
  src/
    index.ts
    protocol.ts
    room-code.ts
    validation.ts
    durable-objects/
      RoomDurableObject.ts
      GlobalChatDurableObject.ts
    game/
      engine.ts
      themes.ts
```

Observacao: a engine pode ser compartilhada via workspace no futuro. Para MVP, pode haver copia controlada ou extracao para pacote comum.

### 10.2 Rotas HTTP

- `GET /health`: status do backend.
- `POST /rooms`: cria sala.
- `GET /rooms/:roomCode`: retorna metadados publicos da sala.
- `GET /rooms/:roomCode/ws`: upgrade WebSocket da sala.
- `GET /global/ws`: upgrade WebSocket do chat global.

### 10.3 Durable Object Por Sala

Responsabilidades:

- Armazenar `RoomState`.
- Gerenciar WebSockets conectados.
- Aplicar comandos.
- Validar permissoes.
- Broadcast de eventos.
- Persistir snapshot em storage do Durable Object.
- Expirar sala sem atividade.

### 10.4 Persistencia

MVP:

- Storage interno do Durable Object.
- Historico limitado de chat.
- Estado atual da partida.

Futuro:

- D1 ou KV para historico, ranking global e salas publicas.

## 11. Frontend Detalhado

### 11.1 Novas Rotas

```tsx
<Route path="/salas" element={<RoomsHome />} />
<Route path="/sala/:roomCode" element={<RoomPage />} />
<Route path="/multi" element={<MultiBrainLanding />} />
<Route path="/mega" element={<MegaBrainLanding />} />
```

### 11.2 Novos Hooks

```txt
src/hooks/multiplayer/
  useRoomConnection.ts
  useRoomState.ts
  useRoomChat.ts
  useRoomActions.ts
  useRoomInvite.ts
  useRoomPresence.ts
```

Responsabilidades:

- `useRoomConnection`: WebSocket, reconnect, heartbeat, requestId.
- `useRoomState`: snapshot e eventos de estado.
- `useRoomChat`: mensagens de sala.
- `useRoomActions`: comandos tipados para criar, entrar, iniciar, sugerir, votar.
- `useRoomInvite`: copiar link/codigo.
- `useRoomPresence`: jogadores online/offline.

### 11.3 Componentes

```txt
src/components/Rooms/
  RoomsHome.tsx
  CreateRoomDialog.tsx
  JoinRoomForm.tsx
  RoomLobby.tsx
  RoomPage.tsx
  RoomHeader.tsx
  RoomPlayersList.tsx
  RoomSettingsPanel.tsx
  RoomInviteCard.tsx
  RoomChatPanel.tsx
  GuessSuggestionsPanel.tsx
  VoteBar.tsx
  MultiplayerGameLayout.tsx
  Scoreboard.tsx
```

### 11.4 Integracao Com Jogo Atual

Separar dois caminhos:

- Solo: usa `usePersistentGameState` e localStorage.
- Multiplayer: usa `useRoomState` e backend.

O componente visual `GameLayout`, `GameBoard`, `Keyboard` podem ser reaproveitados. A diferenca esta na origem do estado e nos handlers.

No solo:

- `handleSubmitGuess` chama `processGuess` local.

No multiplayer:

- `handleSubmitGuess` envia `game:submit-guess`.
- UI aguarda confirmacao do servidor.
- O estado local e atualizado por `game:guess-submitted` ou `room:snapshot`.

## 12. UX Principal

### 12.1 Criar Sala

Tela deve conter:

- Nome/nickname.
- Tipo de jogo.
- Modo: Termo/Dueto/Quarteto.
- Tema.
- Maximo de jogadores.
- Timer opcional.
- Toggle de votacao automatica.
- Botao criar.

Resultado:

- Redireciona para `/sala/:roomCode`.
- Mostra card com codigo e link.

### 12.2 Lobby

Elementos:

- Codigo da sala grande e copiavel.
- Botao compartilhar.
- Lista de jogadores.
- Status pronto.
- Configuracoes editaveis pelo dono.
- Chat da sala.
- Botao iniciar para dono.

### 12.3 Durante O Jogo

Layout:

- Tabuleiro principal no centro.
- Painel de jogadores/placar.
- Painel de sugestoes e votos.
- Chat de grupo.
- Indicador de conexao.

Estados visuais:

- Aguardando sugestoes.
- Votacao aberta.
- Palpite sendo enviado.
- Resultado revelado.
- Fim de jogo/rodada.

### 12.4 Compartilhamento

Texto recomendado:

```txt
Vem jogar Jogo.Work comigo!
Sala: K7X9Q
Modo: Multi Brain - Quarteto
Tema: Frutas
https://marcelordpj.github.io/term-ooo/sala/K7X9Q
```

## 13. Seguranca E Moderacao

Validacoes backend:

- Tamanho maximo de nickname.
- Tamanho maximo de mensagem.
- Rate limit por conexao/userId.
- Bloqueio de comandos fora de ordem.
- Palavras normalizadas.
- Permissoes por role.

Moderacao MVP:

- Dono pode expulsar jogador.
- Dono pode mutar jogador.
- Usuario pode sair da sala.
- Mensagens de sistema para join/leave/kick.

Futuro:

- Report.
- Ban temporario por sala.
- Lista de palavras ofensivas.
- Moderação global.

## 14. Observabilidade

Eventos importantes:

- Sala criada.
- Jogador entrou/saiu/reconectou.
- Partida iniciada/finalizada.
- Palpite enviado.
- Erro de validacao.
- Sala expirada.

Logs devem evitar dados sensiveis e limitar mensagens de chat.

Metricas uteis:

- Salas criadas por dia.
- Usuarios simultaneos.
- Duracao media de sala.
- Erros por tipo.
- Reconexoes.
- Tempo medio de resposta WebSocket.

## 15. Testes Como Usuario

Antes de commit de implementacao multiplayer, executar no minimo:

### 15.1 Solo Nao Pode Quebrar

- Abrir `/term-ooo/`.
- Jogar Termo diario.
- Trocar para Dueto.
- Trocar para Quarteto.
- Abrir arquivo de dia anterior.
- Recarregar pagina e confirmar persistencia.

### 15.2 Criacao E Entrada Em Sala

- Criar sala em aba A.
- Copiar link.
- Abrir link em aba B.
- Entrar com outro nickname.
- Ver ambos na lista de jogadores.
- Recarregar aba B e confirmar reconexao.

### 15.3 Chat

- Enviar mensagem no chat global.
- Enviar mensagem no chat da sala.
- Confirmar que chat da sala nao aparece em outra sala.
- Testar limite de mensagem.
- Testar nickname invalido.

### 15.4 Jogo Em Equipe

- Iniciar sala.
- Sugerir palpite na aba A.
- Votar na aba B.
- Submeter palpite.
- Confirmar tabuleiro sincronizado nas duas abas.
- Finalizar jogo e validar placar.

### 15.5 Multi Brain

- Duas sugestoes concorrentes.
- Troca de voto.
- Maioria automatica.
- Palavra invalida.
- Timer expirado.

### 15.6 Rotas E GitHub Pages

- Acessar diretamente `/term-ooo/sala/CODIGO`.
- Acessar sala inexistente.
- Acessar `/term-ooo/2` e `/term-ooo/4`.
- Hard refresh em rota profunda.

### 15.7 Mobile

- Criar sala no mobile.
- Entrar por link.
- Abrir/fechar chat.
- Votar e sugerir palavra.
- Conferir teclado virtual.

## 16. Plano De Implementacao Em Fases

### Fase 0: Preparacao

- Corrigir lint existente ou separar baseline conhecido.
- Extrair tipos compartilhaveis.
- Documentar variaveis de ambiente.
- Criar scripts de validacao de temas.

### Fase 1: Temas Locais

- Criar estrutura `src/game/themes`.
- Implementar tema `classic` usando dicionario atual.
- Criar `frutas` e `objetos` curados manualmente.
- Adaptar engine para receber `theme` sem quebrar diario.
- Criar UI simples de escolha de tema para jogo solo tematico.

### Fase 2: Backend De Salas

- Criar Worker.
- Criar Durable Object de sala.
- Implementar `room:create`, `room:join`, `room:snapshot`.
- Implementar presenca e reconexao.
- Deploy em Cloudflare.

### Fase 3: Lobby No Frontend

- Criar rotas `/salas` e `/sala/:roomCode`.
- Criar lobby, lista de jogadores, configuracoes e convite.
- Testar duas abas.

### Fase 4: Chat De Sala

- Implementar `chat:send` com escopo `room`.
- Separar visualmente chat global e chat da sala.
- Adicionar historico limitado.

### Fase 5: Jogo Em Equipe

- Backend cria e controla `RoomGameState`.
- Frontend renderiza estado do servidor.
- Submissao de palpite autoritativa.
- Sincronizacao em multiplas abas.

### Fase 6: Multi Brain

- Sugestoes.
- Votos.
- Maioria.
- Envio manual/automatico.
- UI de painel de votacao.

### Fase 7: Mega Brain

- Rodadas.
- Pontuacao.
- Ranking.
- Card final compartilhavel.

### Fase 8: Temas Avancados

- Filmes, series e animes curados.
- Scripts para validar listas.
- Opcional: pipeline offline com fontes externas permitidas.

## 17. Criterios De Aceite

Para considerar a feature pronta:

- Usuario cria sala e recebe codigo/link.
- Outro usuario entra pelo link.
- Ambos veem a mesma lista de jogadores.
- Chat global e chat de sala funcionam separadamente.
- Dono inicia partida.
- Palpites sao sincronizados.
- Regras do jogo sao aplicadas pelo backend.
- Recarregar a pagina nao perde sala se ela ainda existir.
- Rota direta no GitHub Pages funciona.
- Tema selecionado realmente altera o conjunto de solucoes.
- Multi Brain permite sugestao, voto e submissao sem conflito.
- Build passa.
- Teste manual com duas abas passa.

## 18. Decisoes Pendentes

- Confirmar plataforma backend: Cloudflare Durable Objects ou PartyKit.
- Confirmar se `jogo.work` sera dominio oficial ou se o GitHub Pages sera o dominio principal.
- Definir se filmes/series/animes serao palavras de 5 letras ou modo de titulo variavel.
- Definir limite de jogadores por sala no MVP.
- Definir se late join entra como jogador ou espectador.
- Definir se sera necessario ranking global persistente.

## 19. Recomendacao Final

Implementar primeiro a fundacao: temas locais e salas com lobby/presenca/chat. Depois adicionar jogo em equipe com estado autoritativo. Multi Brain e Mega Brain devem vir apenas apos a sincronizacao basica estar testada com multiplas abas.

Essa ordem reduz risco, evita regra de negocio quebrada e garante que cada camada seja validavel antes de adicionar complexidade.
