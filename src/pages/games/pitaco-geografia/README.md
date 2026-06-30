# PITACO Geografia

Jogo de geografia inspirado em [Worldle](https://en.wikipedia.org/wiki/Worldle).
O jogador deve adivinhar um dos 27 estados brasileiros (26 + DF) em ate 6 tentativas,
recebendo feedback de distancia em km, direcao cardinal (N/NE/L/SE/S/SO/O/NO) e
percentual de proximidade para cada chute.

## Estrutura

```
src/pages/games/pitaco-geografia/
├── PitacoGeografiaGame.tsx  # Tela principal (autocomplete + board + feedback)
├── engine.ts                # Distancia (Haversine), bearing, direcao, proximidade
├── types.ts                 # GeoState, GeoGuess, GeoFeedback
├── states.ts                # 27 estados (UF, nome, capital, lat, lng, regiao)
├── storage.ts               # Persistencia localStorage
└── README.md                # Este arquivo
```

## Fluxo do jogo

1. **Estado-alvo do dia**: selecionado deterministicamente pelo `dayNumber`
   (igual ao PITACO principal) usando `(dayNumber % 27)`. Todos os jogadores
   recebem o mesmo estado no mesmo dia.
2. **Silhueta (placeholder)**: por enquanto, um card cinza com o nome do estado
   e emoji 🗺️. SVG real das silhuetas fica para iteracao futura.
3. **Chute**: input com autocomplete (27 estados + filtro por UF, nome ou capital).
4. **Feedback por chute**:
   - **distancia** em km (Haversine, R = 6371 km)
   - **direcao** cardinal em portugues + seta visual
   - **proximidade** % (formula: 100 * (1 - dist/5000), clamp 0-100)
5. **Cor do feedback**:
   - **ciano** = perto (≤ 500 km)
   - **amarelo** = medio (500-1500 km)
   - **Alerta RH / vermelho** = longe (> 1500 km)
6. **Vitoria**: acertar a UF ou o nome do estado. Persiste o resultado no
   localStorage na chave `pitaco:geografia:state:${dateKey}`.

## API publica

### `engine.ts`

```ts
distance(lat1, lon1, lat2, lon2): number                          // km (Haversine)
bearing(lat1, lon1, lat2, lon2): number                          // 0-360
bearingToDirection(bearing: number): DirectionCode                // 'Norte' | ...
calculateProximity(distanceKm: number): number                    // 0-100
pickTargetForDay(dayNumber: number): BrazilianState
createInitialGeoState(dateKey, dayNumber): GeoState
processGeoGuess(state, rawGuess): GeoProcessResult
isGeoWon(state, guessUf): boolean
proximityBand(distanceKm): 'perto' | 'medio' | 'longe'
```

### `states.ts`

```ts
BRAZILIAN_STATES                          // 27 estados (26 + DF)
REGION_LABELS                              // N | NE | CO | SE | S -> 'Norte' | ...
findStateByUf(uf): BrazilianState | undefined
findStateByQuery(query): BrazilianState | undefined
```

### `storage.ts`

```ts
geoStorageKey(dateKey): string
loadGeoState(dateKey): GeoState | null
saveGeoState(dateKey, state): void
clearGeoState(dateKey): void
```

## Pendencias (proximas iteracoes)

- [ ] Substituir o placeholder de silhueta por SVG real das fronteiras dos 27 estados.
- [ ] Adicionar modo "archive" (jogar dias anteriores).
- [ ] Adicionar compartilhamento (estilo PITACO principal).
- [ ] Stats globais (vitorias, sequencia, distribuicao de tentativas).
- [ ] Animacoes de "pulse" quando o chute esta muito perto.

## Coordenadas

As coordenadas em `states.ts` sao aproximadas (centroidais ou proximas a capital).
Sao suficientes para o feedback de distancia/direcao do jogo, mas nao sao
rigorosamente o centroide oficial do estado.
