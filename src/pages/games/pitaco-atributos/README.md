# PITACO Atributos

Jogo de atributos categoricos inspirado em [Poeltl](https://en.wikipedia.org/wiki/Jakob_P%C3%B6ltl) (NBA Wordle).
O jogador deve adivinhar um "auditor" do escritorio PITACO em ate 8 tentativas,
recebendo feedback colorido por atributo:

- **verde** (`#00B2A9`): atributo exato
- **amarelo** (`#E3C275`): parcial (ex: senioridade proxima, equipe existe em outro auditor)
- **vermelho** (`#E25F38`): "longe" (apenas senioridade com diff >= 2)
- **cinza** (`#94A3B8`): atributo errado

## Estrutura

```
src/pages/games/pitaco-atributos/
├── PitacoAtributosGame.tsx  # Tela principal
├── engine.ts                # Logica pura: createInitial, processGuess, evaluateGuess
├── types.ts                 # AtributosState, AtributosGuess, AtributosFeedback
├── auditors.ts              # Banco de 40 auditores ficticios
├── storage.ts               # Persistencia localStorage
└── README.md                # Este arquivo
```

## Fluxo do jogo

1. **Estado-alvo do dia**: selecionado deterministicamente pelo `dayNumber`
   usando `dayNumber % auditors.length`. Todos os jogadores do escritorio
   recebem o mesmo auditor no mesmo dia.
2. **Atributos** (6 colunas): cargo, equipe, senioridade, turno, cidade, hobby.
3. **Chute**: input com autocomplete (40 auditores, busca por nome ou apelido).
4. **Feedback por chute** (cores por atributo):
   - **cargo**: verde se exato, senao cinza
   - **equipe**: verde se exato; amarelo se existe outro auditor com essa equipe; senao cinza
   - **senioridade**: verde se exato; amarelo se `|diff| <= 1`; vermelho se `|diff| >= 2`
   - **turno / cidade / hobby**: verde se exato, senao cinza
5. **Vitoria**: acertar o auditor (todos os 6 atributos corretos). Persiste
   o resultado no localStorage na chave `pitaco:atributos:state:${dateKey}`.

## API publica

### `engine.ts`

```ts
pickAtributosTargetForDay(dayNumber): Auditor
createInitialAtributosState(dateKey, dayNumber): AtributosState
evaluateAtributosGuess(guess, target, historyIds): AtributosFeedback
processAtributosGuess(state, rawGuess): AtributosProcessResult
isAtributosWon(state, guess): boolean
```

### `auditors.ts`

```ts
AUDITORES                                  // 40 auditores ficticios
findAuditorById(id): Auditor | undefined
findAuditorByQuery(query): Auditor | undefined
```

### `storage.ts`

```ts
atributosStorageKey(dateKey): string
loadAtributosState(dateKey): AtributosState | null
saveAtributosState(dateKey, state): void
clearAtributosState(dateKey): void
```

## Pendencias (proximas iteracoes)

- [ ] Adicionar modo "archive" (jogar dias anteriores).
- [ ] Adicionar compartilhamento (estilo PITACO principal).
- [ ] Stats globais (vitorias, sequencia, distribuicao de tentativas).
- [ ] Filtro por equipe/turno no autocomplete.
- [ ] Modo multiplayer (todos chutam o mesmo auditor do dia, mesmo feedback).
