# Loldle Classic

Jogo de adivinhacao de campeao de League of Legends, inspirado em
[loldle.net](https://loldle.net/) (Classic mode). O jogador tem 8 tentativas
para adivinhar o campeao-alvo do dia recebendo feedback de 6 atributos
categoricos / numericos.

## Estrutura

```
src/pages/games/loldle/
├── LoldleGame.tsx   # Tela principal (autocomplete + board 8x6 + feedback)
├── engine.ts        # pickChampionForDate, computeFeedback, processLoldleGuess
├── types.ts         # LoldleChampion, LoldleState, LoldleGuess, LoldleFeedback
├── champions.ts     # 40 campeoes (id, name, region, classe, recurso, alcance, genero, ano)
├── storage.ts       # Persistencia localStorage (chave loldle:state:${dateKey})
└── README.md        # Este arquivo
```

## Fluxo do jogo

1. **Campeao-alvo do dia**: selecionado deterministicamente pelo
   `pickChampionForDate(dateKey)` (hash FNV-1a 32-bit sobre o dateKey,
   `% CHAMPIONS.length`). Todos os jogadores do mesmo dia recebem o mesmo alvo.
2. **Chute**: input com autocomplete nos 40 campeoes (filtra por nome ou id,
   accent/case insensitive, prioriza match exato > prefixo > substring).
3. **Feedback por chute** (6 atributos):
   - **regiao**: verde se exato, senao cinza (sem amarelo — padrao loldle.net)
   - **classe**: idem
   - **recurso**: idem
   - **alcance**: idem
   - **genero**: idem
   - **ano**:
     - verde se exato
     - amarelo se `|delta| <= 2` (configuravel via `LOLDLE_YEAR_NEAR_BAND`)
     - cinza senao
     - seta `↑` / `↓` indicando se o ano do chute e menor/maior que o alvo
4. **Vitoria**: todos os 6 atributos corretos.
5. **Game over**: vitoria OU 8 tentativas esgotadas.
6. **Persistencia**: estado salvo em `localStorage` na chave
   `loldle:state:${dateKey}`. Reseta automaticamente no dia seguinte (dateKey muda).

## Atributos

| Atributo | Valores | Notas |
|----------|---------|-------|
| region   | Demacia, Noxus, Ionia, Freljord, Piltover, Zaun, Bandle, Shadow Isles, Targon, Shurima, Bilgewater, Ixtal, Void, Runeterra | regiao canonica da lore |
| classe   | Lutador, Mago, Assassino, Atirador, Suporte, Tanque | role primaria (campeoes com classe dupla vao pela principal) |
| recurso  | Mana, Energia, Furia, Vida, Sem custo, Calor | sistema de recurso docampeao |
| alcance  | Corpo-a-corpo, A distancia | tipo de ataque basico |
| genero   | Masculino, Feminino, Outro | genero do campeao |
| ano      | 2009..2024 | ano de release oficial |

## API publica

### `engine.ts`

```ts
pickChampionForDate(dateKey: string): LoldleChampion
resolveChampionGuess(rawGuess: string): LoldleChampion | undefined
computeFeedback(guess, target): LoldleFeedback
createInitialLoldleState(dateKey): LoldleState
processLoldleGuess(state, rawGuess): LoldleProcessResult
isLoldleWon(feedback): boolean
yearArrow(guess, target): 'up' | 'down' | null
```

### `champions.ts`

```ts
CHAMPIONS: LoldleChampion[]         // 40 campeoes hardcoded
findChampionById(id): LoldleChampion | undefined
searchChampions(query, limit=8): LoldleChampion[]
```

### `storage.ts`

```ts
loldleStorageKey(dateKey): string
loadLoldleState(dateKey): LoldleState | null
saveLoldleState(dateKey, state): void
clearLoldleState(dateKey): void
```

### `types.ts`

```ts
LOLDLE_MAX_ATTEMPTS = 8
LOLDLE_YEAR_NEAR_BAND = 2
type LoldleRegion, LoldleClasse, LoldleRecurso, LoldleAlcance, LoldleGenero
type LoldleFeedbackStatus = 'correct' | 'partial' | 'near' | 'far' | 'wrong'
interface LoldleChampion, LoldleFeedback, LoldleGuess, LoldleState, LoldleProcessResult
```

## UI

- **Board**: 8 rows. Cada row tem o nome do campeao chutado no topo + 6
  tiles coloridos (regiao/classe/recurso/alcance/genero/ano) em grid
  3-cols (mobile) / 6-cols (desktop).
- **Cores**:
  - verde (`emerald-500/20`) = correto
  - amarelo (`yellow-500/20`) = ano proximo
  - cinza (`slate`) = errado
  - vermelho Alerta RH (`#E25F38`) = reservado para feedback de "longe" (extensibilidade)
- **Header**: voltar ao hall + titulo + dateKey do dia.
- **Game over card**: aparece quando `isGameOver`. Mostra o campeao que era
  + atributos completos + botao "voltar ao hall".

## Pendencias (proximas iteracoes)

- [ ] Adicionar icones de classe do LoL (imagens reais via Data Dragon CDN).
- [ ] Adicionar modo "archive" (jogar dias anteriores).
- [ ] Adicionar compartilhamento (estilo PITACO principal).
- [ ] Stats globais (vitorias, sequencia, distribuicao de tentativas).
- [ ] Animacao de flip nos tiles (estilo PITACO principal).
- [ ] Adicionar outros modos: Ability, Emoji, Quote, Splash Art (todos
      tematicos do loldle.net).
- [ ] Pool dinamico via Data Dragon (https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/champion.json).
