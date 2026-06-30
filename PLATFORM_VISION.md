# 🎮 PITACO — Visão de Plataforma

> Documento vivo. Atualizar a cada marco. Última revisão: Junho/2026.

## 1. Conceito

PITACO é um **hub de mini-games de escritório**. Cada jogo é um "pitaco" diferente: adivinhar palavras, equações, atributos, geografia, citações. O Hall é a entrada; o usuário escolhe o que quer jogar.

Vocabulário PITACO:
- **pauta** = sala de jogo (multiplayer)
- **pitaco** = palpite ou jogo individual
- **homologado** = vitória
- **pauta sem consenso** = derrota
- **relatório** = leaderboard/ranking
- **crachá** = profile
- **estagiário / auditor / chefe** = papéis do usuário
- **sala de entrada** = `/` (Hall)
- **protocolar** = registrar (stat, score, log)
- **convocar** = abrir (sala, partida)

## 2. Pilares

1. **Acolhimento antes de desafio.** Hall visual, cards de jogo, dicas inline, tutorial não-invasivo.
2. **Identidade corporativa.** Sabiá Auditor como mascote, brutalismo, humor de escritório. Cores PITACO: Noite `#1A2C40`, Ciano `#00B2A9`, Amarelo `#E3C275`, Alerta RH `#E25F38`.
3. **Stats compartilhados.** XP global, achievements, ranking — sem precisar logar em cada jogo.
4. **Multiplayer onde faz sentido.** Pauta por jogo (cada jogo tem sua sala). Sem forçar social em single-player.
5. **Mobile-first.** A maioria dos usuários joga no transporte. Stack já é responsivo (Tailwind, sem libs desktop-only).

## 3. Estado atual (Junho/2026)

- **Jogo solo**: PITACO (palavras 5 letras, modo Termo / Dueto / Quarteto) — `enabled: true`.
- **Multiplayer**: salas (pauta) com chat, sugestões, votos, submit — `enabled: true`.
- **Auth**: Supabase Auth (signInWithPassword + magic link + reset) — `enabled: true`.
- **Admin**: painel `/admin` com lista de usuários, salas, fechar/excluir — `enabled: true`.
- **Profile**: crachá no Hall (avatar Dicebear, nickname, cargo) — `enabled: true`.
- **Hall de entrada**: NÃO EXISTE. Hoje `/` cai direto no jogo solo. Esta task cria o Hall.

## 4. Roadmap de jogos (proposto)

| Slug | Título | Categoria | Inspiração | Status |
|---|---|---|---|---|
| `pitaco` | PITACO | palavras (PT-BR, 5 letras) | Term.ooo | ✅ em produção |
| `pitaco-cruzado` | PITACO Cruzado | palavras (multi-grid) | Quordle | 📋 próximo |
| `pitaco-nerdle` | PITACO Nerdle | lógica (equação 8 chars) | Nerdle | 📋 próximo |
| `pitaco-tematico` | PITACO Temático | palavras (frutas, filmes) | (já tem themes no engine) | 📋 próximo |
| `pitaco-geografia` | PITACO Geografia | geografia (estados BR) | Worldle | 💭 ideia |
| `pitaco-atributos` | PITACO Atributos | atributos categóricos | Poeltl | 💭 ideia |
| `pitaco-emoji` | PITACO Emoji | pistas por emoji | Loldle Emoji | 💭 ideia |
| `pitaco-citacao` | PITACO Citação | áudio/voz | Heardle | 💭 ideia |
| `pitaco-naruto` | PITACO Naruto | atributos (conhecimento de franquia) | **Narutodle** (https://narutodle.net/, 8 modos: clássico, silhueta, jutsu, citação, clã, vila, etc) | 💭 ideia |
| `pitaco-nautico` | PITACO Náutico | atributos (náutica) | ideia original nossa (sem referência pública) | 💭 ideia |

## 5. Decisões validadas pela pesquisa

| Decisão | Justificativa (fonte) |
|---|---|
| Padrão shell + games plugáveis | PuzzleForge (repo validado) |
| Zustand com persist para state local | PuzzleForge (validado) |
| RLS obrigatória em qualquer tabela exposta | Supabase docs (validação literal) |
| Engine por jogo plugável (não monolítica) | "Add More Games: 1. Create component, 2. Add route, 3. Add card" — PuzzleForge |
| Leaderboard via Postgres + Supabase Realtime | Supabase docs (validação do produto) |
| 1 review por (user, game) | itch.io pattern (validação) |
| Daily challenge com seed determinístico (`hash(date)`) | Wordle / Loldle (validação) |
| Hints progressivos (custa XP) | Worldle, Semantle (validação) |

## 6. Pendências

- [ ] Catálogo de jogos no DB (`games` table) — esta task
- [ ] Hall de entrada (`/` → grid de `GameCard`s) — esta task
- [ ] Página `/perfil` global (XP, achievements, stats por jogo)
- [ ] Página `/ranking` (hoje/semana/sempre, Realtime)
- [ ] Página `/docs` (regras + atalhos + FAQ)
- [ ] Sistema de reviews (1 por user/jogo, RLS)
- [ ] Hints progressivos por jogo
- [ ] Daily challenge (seed determinístico, pg_cron reset)
- [ ] Nerdle PT (matemática)
- [ ] PITACO Cruzado (multi-grid)
- [ ] PITACO Temático (múltiplos dicionários)
- [ ] SFX (Howler.js) para feedback auditivo
- [ ] Onboarding modal no primeiro acesso

## 7. Como contribuir

Cada jogo novo segue o template:

```
src/pages/games/<slug>/
├── <Slug>Game.tsx          # componente principal
├── engine.ts               # regras puras (sem React)
├── types.ts                # tipos do jogo
└── stats.ts                # funções de score/achievement
```

E três mudanças: `src/lib/games.ts` (registrar), `src/components/GameCard.tsx` (já existe), `src/App.tsx` (rota).
