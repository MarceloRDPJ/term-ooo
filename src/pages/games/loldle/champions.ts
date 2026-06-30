// src/pages/games/loldle/champions.ts
//
// Dataset hardcoded de 40 campeoes classicos de League of Legends
// para o Loldle (Classic mode). Atributos estaveis e publicos:
//
//   - region:  regiao canonica da lore (Runeterra)
//   - classe:  role primaria do campeao
//   - recurso: sistema de recurso (Mana, Energia, Furia, Vida, Sem custo, Calor)
//   - alcance: tipo de ataque basico (Corpo-a-corpo vs A distancia)
//   - genero:  genero do campeao
//   - ano:     ano de release oficial
//
// Os dados foram compilados a partir de fontes publicas (leagueoflegends.com,
// wiki do LoL, Data Dragon). Campeoes com classe dupla (ex: Kayle = Lutador +
// Mago, Senna = Atirador + Suporte) estao classificados pela role primaria
// (Fiora = Lutador, Senna = Atirador, Kayle = Lutador).
//
// Caso algum atributo esteja incerto/duvidoso, o campeao NAO foi incluido
// (regra do brief: "se nao souber, omita o campeao"). Lista atual: 40.

import type { LoldleChampion } from './types'

export const CHAMPIONS: LoldleChampion[] = [
  {
    id: 'aatrox',
    name: 'Aatrox',
    region: 'Noxus',
    classe: 'Lutador',
    recurso: 'Vida',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2013,
  },
  {
    id: 'ahri',
    name: 'Ahri',
    region: 'Ionia',
    classe: 'Mago',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2011,
  },
  {
    id: 'akali',
    name: 'Akali',
    region: 'Ionia',
    classe: 'Assassino',
    recurso: 'Energia',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2010,
  },
  {
    id: 'ashe',
    name: 'Ashe',
    region: 'Freljord',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2009,
  },
  {
    id: 'caitlyn',
    name: 'Caitlyn',
    region: 'Piltover',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2011,
  },
  {
    id: 'darius',
    name: 'Darius',
    region: 'Noxus',
    classe: 'Lutador',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2012,
  },
  {
    id: 'diana',
    name: 'Diana',
    region: 'Targon',
    classe: 'Lutador',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2012,
  },
  {
    id: 'ekko',
    name: 'Ekko',
    region: 'Zaun',
    classe: 'Assassino',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2015,
  },
  {
    id: 'ezreal',
    name: 'Ezreal',
    region: 'Piltover',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Masculino',
    ano: 2010,
  },
  {
    id: 'fiora',
    name: 'Fiora',
    region: 'Demacia',
    classe: 'Lutador',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2012,
  },
  {
    id: 'garen',
    name: 'Garen',
    region: 'Demacia',
    classe: 'Tanque',
    recurso: 'Sem custo',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2010,
  },
  {
    id: 'gwen',
    name: 'Gwen',
    region: 'Shadow Isles',
    classe: 'Lutador',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2021,
  },
  {
    id: 'jinx',
    name: 'Jinx',
    region: 'Zaun',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2013,
  },
  {
    id: 'kai_sa',
    name: 'KaiSa',
    region: 'Void',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2018,
  },
  {
    id: 'katarina',
    name: 'Katarina',
    region: 'Noxus',
    classe: 'Assassino',
    recurso: 'Sem custo',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2009,
  },
  {
    id: 'kayle',
    name: 'Kayle',
    region: 'Demacia',
    classe: 'Lutador',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2009,
  },
  {
    id: 'kha_zix',
    name: 'KhaZix',
    region: 'Void',
    classe: 'Assassino',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2012,
  },
  {
    id: 'lee_sin',
    name: 'Lee Sin',
    region: 'Ionia',
    classe: 'Lutador',
    recurso: 'Energia',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2011,
  },
  {
    id: 'leona',
    name: 'Leona',
    region: 'Targon',
    classe: 'Tanque',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2011,
  },
  {
    id: 'lucian',
    name: 'Lucian',
    region: 'Demacia',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Masculino',
    ano: 2013,
  },
  {
    id: 'lulu',
    name: 'Lulu',
    region: 'Bandle',
    classe: 'Suporte',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2012,
  },
  {
    id: 'lux',
    name: 'Lux',
    region: 'Demacia',
    classe: 'Mago',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2010,
  },
  {
    id: 'malphite',
    name: 'Malphite',
    region: 'Ixtal',
    classe: 'Tanque',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2009,
  },
  {
    id: 'master_yi',
    name: 'Master Yi',
    region: 'Ionia',
    classe: 'Assassino',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2009,
  },
  {
    id: 'miss_fortune',
    name: 'Miss Fortune',
    region: 'Bilgewater',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2010,
  },
  {
    id: 'morgana',
    name: 'Morgana',
    region: 'Demacia',
    classe: 'Mago',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2009,
  },
  {
    id: 'nasus',
    name: 'Nasus',
    region: 'Shurima',
    classe: 'Tanque',
    recurso: 'Mana',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2009,
  },
  {
    id: 'orianna',
    name: 'Orianna',
    region: 'Piltover',
    classe: 'Mago',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2011,
  },
  {
    id: 'riven',
    name: 'Riven',
    region: 'Noxus',
    classe: 'Lutador',
    recurso: 'Sem custo',
    alcance: 'Corpo-a-corpo',
    genero: 'Feminino',
    ano: 2011,
  },
  {
    id: 'senna',
    name: 'Senna',
    region: 'Shadow Isles',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2019,
  },
  {
    id: 'sett',
    name: 'Sett',
    region: 'Ionia',
    classe: 'Lutador',
    recurso: 'Furia',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2020,
  },
  {
    id: 'shen',
    name: 'Shen',
    region: 'Ionia',
    classe: 'Tanque',
    recurso: 'Energia',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2010,
  },
  {
    id: 'sivir',
    name: 'Sivir',
    region: 'Shurima',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2009,
  },
  {
    id: 'soraka',
    name: 'Soraka',
    region: 'Targon',
    classe: 'Suporte',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2009,
  },
  {
    id: 'teemo',
    name: 'Teemo',
    region: 'Bandle',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Masculino',
    ano: 2009,
  },
  {
    id: 'thresh',
    name: 'Thresh',
    region: 'Shadow Isles',
    classe: 'Suporte',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Masculino',
    ano: 2013,
  },
  {
    id: 'vayne',
    name: 'Vayne',
    region: 'Demacia',
    classe: 'Atirador',
    recurso: 'Mana',
    alcance: 'A distancia',
    genero: 'Feminino',
    ano: 2011,
  },
  {
    id: 'yasuo',
    name: 'Yasuo',
    region: 'Ionia',
    classe: 'Lutador',
    recurso: 'Sem custo',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2013,
  },
  {
    id: 'yone',
    name: 'Yone',
    region: 'Ionia',
    classe: 'Assassino',
    recurso: 'Sem custo',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2020,
  },
  {
    id: 'zed',
    name: 'Zed',
    region: 'Ionia',
    classe: 'Assassino',
    recurso: 'Energia',
    alcance: 'Corpo-a-corpo',
    genero: 'Masculino',
    ano: 2012,
  },
]

/**
 * Retorna um campeao pelo id.
 */
export function findChampionById(id: string): LoldleChampion | undefined {
  return CHAMPIONS.find((c) => c.id === id)
}

/**
 * Busca campeoes por nome (case + accent insensitive) ou id exato.
 * Usado pelo autocomplete do input.
 */
export function searchChampions(rawQuery: string, limit = 8): LoldleChampion[] {
  const q = rawQuery
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  if (!q) return []

  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  // Priorizar prefixo no nome; depois substring; depois id.
  const exact: LoldleChampion[] = []
  const prefix: LoldleChampion[] = []
  const substring: LoldleChampion[] = []

  for (const c of CHAMPIONS) {
    const nameN = norm(c.name)
    const idN = norm(c.id.replace(/_/g, ' '))
    if (nameN === q || norm(c.id) === q) {
      exact.push(c)
    } else if (nameN.startsWith(q) || idN.startsWith(q)) {
      prefix.push(c)
    } else if (nameN.includes(q) || idN.includes(q)) {
      substring.push(c)
    }
  }

  return [...exact, ...prefix, ...substring].slice(0, limit)
}
