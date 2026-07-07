// src/pages/games/narutodle/naruto-assets.ts

import type { NarutodleCharacter } from './types'

const NARUTO_CHARACTER_IMAGE_URLS: Record<string, string> = {
  naruto: 'https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png',
  sasuke: 'https://static.wikia.nocookie.net/naruto/images/2/21/Sasuke_Part_1.png',
  sakura: 'https://static.wikia.nocookie.net/naruto/images/6/64/Sakura_Part_1.png',
  kakashi: 'https://static.wikia.nocookie.net/naruto/images/2/27/Kakashi_Hatake.png',
  itachi: 'https://static.wikia.nocookie.net/naruto/images/b/bb/Itachi.png',
  madara: 'https://static.wikia.nocookie.net/naruto/images/f/fd/Madara.png',
  obito: 'https://static.wikia.nocookie.net/naruto/images/4/4a/Obito_Uchiha.png',
  hinata: 'https://static.wikia.nocookie.net/naruto/images/9/97/Hinata.png',
  shikamaru: 'https://static.wikia.nocookie.net/naruto/images/4/44/Shikamaru_Part_I.png',
  gaara: 'https://static.wikia.nocookie.net/naruto/images/2/20/Gaara_in_Part_I.png',
  'rock-lee': 'https://static.wikia.nocookie.net/naruto/images/9/97/Rock_Lee_Part_I.png',
  neji: 'https://static.wikia.nocookie.net/naruto/images/7/7e/Neji_Part_I.png',
  jiraiya: 'https://static.wikia.nocookie.net/naruto/images/2/21/Profile_Jiraiya.png',
  tsunade: 'https://static.wikia.nocookie.net/naruto/images/b/b3/Tsunade_infobox2.png',
  orochimaru: 'https://static.wikia.nocookie.net/naruto/images/1/14/Orochimaru_Infobox.png',
  minato: 'https://static.wikia.nocookie.net/naruto/images/7/71/Minato_Namikaze.png',
  hashirama: 'https://static.wikia.nocookie.net/naruto/images/7/7e/Hashirama_Senju.png',
  tobirama: 'https://static.wikia.nocookie.net/naruto/images/b/be/Tobirama_Senju.png',
  deidara: 'https://static.wikia.nocookie.net/naruto/images/0/06/Deidara.png',
  sasori: 'https://static.wikia.nocookie.net/naruto/images/f/f7/Sasori.png',
  hidan: 'https://static.wikia.nocookie.net/naruto/images/e/e3/Hidan.png',
  kakuzu: 'https://static.wikia.nocookie.net/naruto/images/5/57/Kakuzu.png',
  pain: 'https://static.wikia.nocookie.net/naruto/images/4/46/Nagato.png',
  konan: 'https://static.wikia.nocookie.net/naruto/images/5/58/Konan_Infobox.png',
  kisame: 'https://static.wikia.nocookie.net/naruto/images/2/25/Kisame.png',
  'killer-b': 'https://static.wikia.nocookie.net/naruto/images/6/63/Killer_B.png',
  mei: 'https://static.wikia.nocookie.net/naruto/images/6/6f/Mei.png',
  onoki: 'https://static.wikia.nocookie.net/naruto/images/6/67/%C5%8Cnoki.png',
  kaguya: 'https://static.wikia.nocookie.net/naruto/images/6/6c/Kaguya_%C5%8Ctsutsuki.png',
  kurama: 'https://static.wikia.nocookie.net/naruto/images/7/7b/Kurama2.png/revision/latest/scale-to-width-down/320?cb=20140818171718',
}

export function getNarutoCharacterImageUrl(character: NarutodleCharacter | string): string | undefined {
  const id = typeof character === 'string' ? character : character.id
  return NARUTO_CHARACTER_IMAGE_URLS[id]
}

export function getNarutoCharacterInitials(character: Pick<NarutodleCharacter, 'name'> | string): string {
  const name = typeof character === 'string' ? character : character.name
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
