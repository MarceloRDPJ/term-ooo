// src/pages/games/loldle/lol-assets.ts

import type { LoldleChampion } from './types'

export const DDRAGON_VERSION = '16.13.1'
export const DDRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn'

const CHAMPION_ALIAS_BY_ID: Record<string, string> = {
  aurelionsol: 'AurelionSol',
  chogath: 'Chogath',
  drmundo: 'DrMundo',
  fiddlesticks: 'Fiddlesticks',
  jarvaniv: 'JarvanIV',
  kaisa: 'Kaisa',
  khazix: 'Khazix',
  kogmaw: 'KogMaw',
  ksante: 'KSante',
  leblanc: 'Leblanc',
  leesin: 'LeeSin',
  masteryi: 'MasterYi',
  missfortune: 'MissFortune',
  monkeyking: 'MonkeyKing',
  nunu: 'Nunu',
  reksai: 'RekSai',
  renata: 'Renata',
  tahmkench: 'TahmKench',
  twistedfate: 'TwistedFate',
  velkoz: 'Velkoz',
  wukong: 'MonkeyKing',
  xinzhao: 'XinZhao',
}

export function getChampionAlias(champion: LoldleChampion | string): string {
  const id = typeof champion === 'string' ? champion : champion.id
  const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, '')
  return CHAMPION_ALIAS_BY_ID[normalized] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function getChampionIconUrl(champion: LoldleChampion | string): string {
  return `${DDRAGON_CDN}/${DDRAGON_VERSION}/img/champion/${getChampionAlias(champion)}.png`
}

export function getChampionSplashUrl(champion: LoldleChampion | string, skin = 0): string {
  return `${DDRAGON_CDN}/img/champion/splash/${getChampionAlias(champion)}_${skin}.jpg`
}

export function getChampionLoadingUrl(champion: LoldleChampion | string, skin = 0): string {
  return `${DDRAGON_CDN}/img/champion/loading/${getChampionAlias(champion)}_${skin}.jpg`
}

export function getSpellIconUrl(imageFull: string): string {
  return `${DDRAGON_CDN}/${DDRAGON_VERSION}/img/spell/${imageFull}`
}
