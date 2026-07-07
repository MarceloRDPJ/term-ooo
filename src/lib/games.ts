// src/lib/games.ts
//
// Registry of games shipped by PITACO. Code-first: the catalog in
// src/lib/platform-types.ts and this file drives the Hall UI.
// The Supabase `games` table is the runtime mirror (admins can
// disable a broken game without a deploy via that table).
//
// Add a new game: append a GameDefinition here and create the
// component at src/pages/games/<slug>/<Slug>Game.tsx. The path
// must match the route in src/App.tsx.

import type { GameDefinition } from './platform-types'

export const GAMES: GameDefinition[] = [
  {
    slug: 'pitaco',
    title: 'PITACO',
    description: 'Adivinhe a palavra de 5 letras em 6 tentativas. O classico do escritorio.',
    category: 'palavras',
    difficulty: 1,
    thumbnail: '🐤',
    enabled: true,
    path: '/play/pitaco',
    hint: 'A mesma engine do Term.ooo, mas com vocabulario corporativo.',
  },
  {
    slug: 'pitaco-cruzado',
    title: 'PITACO Cruzado',
    description: 'Resolva 4 palavras em paralelo, no mesmo turno. Inspirado em Quordle.',
    category: 'palavras',
    difficulty: 3,
    thumbnail: '🧩',
    enabled: true,
    path: '/play/pitaco-cruzado',
    hint: 'Cada palpite vai pros 4 tabuleiros. Estrategia > velocidade.',
  },
  {
    slug: 'pitaco-nerdle',
    title: 'PITACO Nerdle',
    description: 'Adivinhe a equacao matematica de 8 caracteres em 6 tentativas.',
    category: 'logica',
    difficulty: 3,
    thumbnail: '🧮',
    enabled: true,
    path: '/play/pitaco-nerdle',
    hint: 'Alfabeto e digitos + operacoes. Equacao aritmeticamente valida.',
  },
  {
    slug: 'pitaco-tematico',
    title: 'PITACO Tematico',
    description: 'Mesmo jogo, mas o dicionario muda: frutas, filmes, series, objetos.',
    category: 'palavras',
    difficulty: 2,
    thumbnail: '🍇',
    enabled: true,
    path: '/play/pitaco-tematico',
    hint: 'Escolha o tema antes de comecar. Frutas, Objetos, Filmes, Series, Animes.',
  },
  {
    slug: 'pitaco-geografia',
    title: 'PITACO Geografia',
    description: 'Adivinhe o estado brasileiro pela silhueta. Feedback por distancia em km.',
    category: 'geografia',
    difficulty: 2,
    thumbnail: '🗺️',
    enabled: true,
    path: '/play/pitaco-geografia',
    hint: 'Inspirado em Worldle. Verde = perto, vermelho = longe.',
  },
  {
    slug: 'pitaco-atributos',
    title: 'PITACO Atributos',
    description: 'Adivinhe o auditor pelo cargo, equipe e senioridade. Inspirado em Poeltl.',
    category: 'atributos',
    difficulty: 3,
    thumbnail: '🏷️',
    enabled: true,
    path: '/play/pitaco-atributos',
    hint: 'Feedback colorido por atributo (verde/amarelo/cinza), sem ser palavras.',
  },
  {
    slug: 'pitaco-emoji',
    title: 'PITACO Emoji',
    description: 'Decifre o auditor pela combinacao de emojis. Inspirado em Loldle Emoji.',
    category: 'atributos',
    difficulty: 2,
    thumbnail: '😀',
    enabled: true,
    path: '/play/pitaco-emoji',
    hint: 'Cada emoji e uma pista. 3-5 emojis = 1 auditor.',
  },
  {
    slug: 'pitaco-citacao',
    title: 'PITACO Citacao',
    description: 'Adivinhe o auditor pela citacao que ele mandou no chat.',
    category: 'auditivo',
    difficulty: 3,
    thumbnail: '💬',
    enabled: false,
    path: '/play/pitaco-citacao',
    hint: 'As citacoes sao do proprio chat do PITACO. Inspirado em Loldle Quote.',
  },
  {
    slug: 'loldle',
    title: 'Loldle',
    description: 'Adivinhe o campeao de League of Legends pelos atributos (regiao, classe, recurso, alcance, genero, ano).',
    category: 'atributos',
    difficulty: 2,
    thumbnail: '⚔️',
    enabled: true,
    path: '/play/loldle',
    hint: 'Inspirado em Loldle Classic. 8 tentativas, 6 atributos, 1 campeao.',
  },
  {
    slug: 'narutodle',
    title: 'Narutodle',
    description: 'Adivinhe o ninja de Naruto pelos atributos (genero, afiliacoes, tipos de jutsu, kekkei genkai, naturezas, atributos e arco de estreia).',
    category: 'atributos',
    difficulty: 3,
    thumbnail: '🍥',
    enabled: true,
    path: '/play/narutodle',
    hint: 'Jogo diario estilo Narutodle. 8 tentativas, 7 categorias, 1 personagem.',
  },
  {
    slug: 'loldle-quote',
    title: 'PITACO Quote (Loldle)',
    description: 'Adivinhe o campeao de League of Legends pela frase que ele fala. Inspirado em Loldle Quote.',
    category: 'atributos',
    difficulty: 2,
    thumbnail: '💬',
    enabled: true,
    path: '/play/loldle-quote',
    hint: 'Recebe uma frase e tenta descobrir de qual campeao e. 8 tentativas.',
  },
  {
    slug: 'loldle-splash',
    title: 'PITACO Splash (Loldle)',
    description: 'Adivinhe o campeao de League of Legends pela splash art. Em breve.',
    category: 'atributos',
    difficulty: 2,
    thumbnail: '🎨',
    enabled: false,
    path: '/play/loldle-splash',
    hint: 'Visual do campeao. Requer splash art. Em breve.',
  },
  {
    slug: 'loldle-emoji',
    title: 'PITACO Emoji (Loldle)',
    description: 'Adivinhe o campeao de League of Legends pela combinacao de emojis. Em breve.',
    category: 'atributos',
    difficulty: 2,
    thumbnail: '😀',
    enabled: false,
    path: '/play/loldle-emoji',
    hint: 'Cada emoji e uma pista sobre o campeao. Em breve.',
  },
  {
    slug: 'loldle-ability',
    title: 'PITACO Ability (Loldle)',
    description: 'Adivinhe o campeao de League of Legends pelo kit de habilidades (Q/W/E/R/P). Em breve.',
    category: 'atributos',
    difficulty: 3,
    thumbnail: '🛠️',
    enabled: false,
    path: '/play/loldle-ability',
    hint: 'Recebe as 5 abilities e adivinha o campeao. Em breve.',
  },
  {
    slug: 'narutodle-silhouette',
    title: 'PITACO Narutodle Silhueta',
    description: 'Adivinhe o ninja de Naruto por uma pista visual de olho.',
    category: 'atributos',
    difficulty: 3,
    thumbnail: '🖼️',
    enabled: true,
    path: '/play/narutodle-silhouette',
    hint: 'A pista visual fica mais clara a cada tentativa.',
  },
  {
    slug: 'narutodle-jutsu',
    title: 'PITACO Narutodle Jutsu',
    description: 'Adivinhe o ninja de Naruto pelo jutsu que ele usa.',
    category: 'atributos',
    difficulty: 3,
    thumbnail: '✨',
    enabled: true,
    path: '/play/narutodle-jutsu',
    hint: 'Recebe um jutsu e adivinha o personagem em 8 tentativas.',
  },
]

export function getGameBySlug(slug: string): GameDefinition | undefined {
  return GAMES.find((g) => g.slug === slug)
}

export function getEnabledGames(): GameDefinition[] {
  return GAMES.filter((g) => g.enabled)
}

export function getComingSoonGames(): GameDefinition[] {
  return GAMES.filter((g) => !g.enabled)
}
