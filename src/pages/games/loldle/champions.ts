// src/pages/games/loldle/champions.ts
//
// Dataset hardcoded de TODOS os campeoes de League of Legends para o
// Loldle (Classic mode). Pool atual: 170+ campees unicos.
//
// Convencoes:
//  - id: lowercase no-separator (formato Data Dragon). Apostrofos removidos.
//  - region: kebab-case, lowercase (ex: 'bandle-city', 'mount-targon')
//  - classe: TitleCase (Fighter, Tank, Mage, Assassin, Marksman, Support)
//  - recurso: TitleCase (Mana, Energy, Fury, Ferocity, Flow, Blood Well,
//                       Courage, Crimson Rush, Grit, Heat, Rage, Shield, None)
//  - alcance: 'close' | 'range'
//  - genero:  'male' | 'female' | 'divers'  (divers = sem genero binario)
//  - ano:     2009..2025
//
// Os dados foram compilados a partir de fontes publicas (leagueoflegends.com,
// wiki do LoL, Data Dragon). Campeoes com classe dupla (ex: Kayle = Fighter
// + Mage, Senna = Marksman + Support) estao classificados pela role primaria.
// Campeoes com mais de uma regiao na lore (ex: Poppy, Riven, Senna) estao
// classificados pela regiao canonica primaria usada no loldle.net.

import type { LoldleChampion } from './types'

export const CHAMPIONS: LoldleChampion[] = [
  // BANDLE CITY
  { id: 'corki', name: 'Corki', region: 'bandle-city', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'heimerdinger', name: 'Heimerdinger', region: 'bandle-city', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'kennen', name: 'Kennen', region: 'bandle-city', classe: 'Mage', recurso: 'Energy', alcance: 'range', genero: 'male', ano: 2010 },
  { id: 'kled', name: 'Kled', region: 'bandle-city', classe: 'Fighter', recurso: 'Courage', alcance: 'close', genero: 'male', ano: 2016 },
  { id: 'lulu', name: 'Lulu', region: 'bandle-city', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2012 },
  { id: 'nunu', name: 'Nunu & Willump', region: 'bandle-city', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'poppy', name: 'Poppy', region: 'bandle-city', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2010 },
  { id: 'rammus', name: 'Rammus', region: 'bandle-city', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'rumble', name: 'Rumble', region: 'bandle-city', classe: 'Fighter', recurso: 'Heat', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'teemo', name: 'Teemo', region: 'bandle-city', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'tristana', name: 'Tristana', region: 'bandle-city', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'veigar', name: 'Veigar', region: 'bandle-city', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'gnar', name: 'Gnar', region: 'bandle-city', classe: 'Fighter', recurso: 'Rage', alcance: 'range', genero: 'male', ano: 2014 },
  { id: 'yuumi', name: 'Yuumi', region: 'bandle-city', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2019 },
  // BILGEWATER
  { id: 'missfortune', name: 'Miss Fortune', region: 'bilgewater', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2010 },
  { id: 'graves', name: 'Graves', region: 'bilgewater', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2011 },
  { id: 'gangplank', name: 'Gangplank', region: 'bilgewater', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'nautilus', name: 'Nautilus', region: 'bilgewater', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2012 },
  { id: 'illaoi', name: 'Illaoi', region: 'bilgewater', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2015 },
  { id: 'pyke', name: 'Pyke', region: 'bilgewater', classe: 'Support', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2018 },
  { id: 'tahmkench', name: 'Tahm Kench', region: 'bilgewater', classe: 'Support', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2015 },
  { id: 'nilah', name: 'Nilah', region: 'bilgewater', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2022 },
  { id: 'fizz', name: 'Fizz', region: 'bilgewater', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'twistedfate', name: 'Twisted Fate', region: 'bilgewater', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  // DEMACIA
  { id: 'garen', name: 'Garen', region: 'demacia', classe: 'Fighter', recurso: 'None', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'lux', name: 'Lux', region: 'demacia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2010 },
  { id: 'jarvaniv', name: 'Jarvan IV', region: 'demacia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'xinzhao', name: 'Xin Zhao', region: 'demacia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'vayne', name: 'Vayne', region: 'demacia', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2011 },
  { id: 'fiora', name: 'Fiora', region: 'demacia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2012 },
  { id: 'galio', name: 'Galio', region: 'demacia', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'sona', name: 'Sona', region: 'demacia', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2010 },
  { id: 'kayle', name: 'Kayle', region: 'demacia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2009 },
  { id: 'morgana', name: 'Morgana', region: 'demacia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'lucian', name: 'Lucian', region: 'demacia', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2013 },
  { id: 'quinn', name: 'Quinn', region: 'demacia', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2013 },
  { id: 'shyvana', name: 'Shyvana', region: 'demacia', classe: 'Fighter', recurso: 'Fury', alcance: 'close', genero: 'female', ano: 2011 },
  { id: 'sylas', name: 'Sylas', region: 'demacia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2019 },
  { id: 'senna', name: 'Senna', region: 'demacia', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2019 },
  // FRELJORD
  { id: 'ashe', name: 'Ashe', region: 'freljord', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'anivia', name: 'Anivia', region: 'freljord', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'sejuani', name: 'Sejuani', region: 'freljord', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2012 },
  { id: 'udyr', name: 'Udyr', region: 'freljord', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'trundle', name: 'Trundle', region: 'freljord', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'volibear', name: 'Volibear', region: 'freljord', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'lissandra', name: 'Lissandra', region: 'freljord', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2013 },
  { id: 'braum', name: 'Braum', region: 'freljord', classe: 'Support', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2014 },
  { id: 'olaf', name: 'Olaf', region: 'freljord', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'tryndamere', name: 'Tryndamere', region: 'freljord', classe: 'Fighter', recurso: 'Fury', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'gragas', name: 'Gragas', region: 'freljord', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'ornn', name: 'Ornn', region: 'freljord', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2017 },
  { id: 'aurora', name: 'Aurora', region: 'freljord', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2024 },
  // IONIA
  { id: 'ahri', name: 'Ahri', region: 'ionia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2011 },
  { id: 'akali', name: 'Akali', region: 'ionia', classe: 'Assassin', recurso: 'Energy', alcance: 'close', genero: 'female', ano: 2010 },
  { id: 'leesin', name: 'Lee Sin', region: 'ionia', classe: 'Fighter', recurso: 'Energy', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'shen', name: 'Shen', region: 'ionia', classe: 'Tank', recurso: 'Energy', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'zed', name: 'Zed', region: 'ionia', classe: 'Assassin', recurso: 'Energy', alcance: 'close', genero: 'male', ano: 2012 },
  { id: 'irelia', name: 'Irelia', region: 'ionia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2010 },
  { id: 'karma', name: 'Karma', region: 'ionia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2011 },
  { id: 'masteryi', name: 'Master Yi', region: 'ionia', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'yasuo', name: 'Yasuo', region: 'ionia', classe: 'Fighter', recurso: 'Flow', alcance: 'close', genero: 'male', ano: 2013 },
  { id: 'yone', name: 'Yone', region: 'ionia', classe: 'Assassin', recurso: 'None', alcance: 'close', genero: 'male', ano: 2020 },
  { id: 'sett', name: 'Sett', region: 'ionia', classe: 'Fighter', recurso: 'Grit', alcance: 'close', genero: 'male', ano: 2020 },
  { id: 'varus', name: 'Varus', region: 'ionia', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2012 },
  { id: 'xayah', name: 'Xayah', region: 'ionia', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2017 },
  { id: 'rakan', name: 'Rakan', region: 'ionia', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2017 },
  { id: 'wukong', name: 'Wukong', region: 'ionia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'syndra', name: 'Syndra', region: 'ionia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2012 },
  { id: 'lillia', name: 'Lillia', region: 'ionia', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2020 },
  { id: 'hwei', name: 'Hwei', region: 'ionia', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2023 },
  // IXTAL
  { id: 'malphite', name: 'Malphite', region: 'ixtal', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'rengar', name: 'Rengar', region: 'ixtal', classe: 'Assassin', recurso: 'Ferocity', alcance: 'close', genero: 'male', ano: 2012 },
  { id: 'nidalee', name: 'Nidalee', region: 'ixtal', classe: 'Assassin', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'qiyana', name: 'Qiyana', region: 'ixtal', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2019 },
  { id: 'neeko', name: 'Neeko', region: 'ixtal', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2018 },
  { id: 'zyra', name: 'Zyra', region: 'ixtal', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2012 },
  { id: 'ivern', name: 'Ivern', region: 'ixtal', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2016 },
  { id: 'milio', name: 'Milio', region: 'ixtal', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2023 },
  // MOUNT TARGON
  { id: 'aurelionsol', name: 'Aurelion Sol', region: 'mount-targon', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'divers', ano: 2016 },
  { id: 'diana', name: 'Diana', region: 'mount-targon', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2012 },
  { id: 'leona', name: 'Leona', region: 'mount-targon', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2011 },
  { id: 'pantheon', name: 'Pantheon', region: 'mount-targon', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'zoe', name: 'Zoe', region: 'mount-targon', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2017 },
  { id: 'taric', name: 'Taric', region: 'mount-targon', classe: 'Support', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'soraka', name: 'Soraka', region: 'mount-targon', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'aphelios', name: 'Aphelios', region: 'mount-targon', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2019 },
  // NOXUS
  { id: 'darius', name: 'Darius', region: 'noxus', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2012 },
  { id: 'draven', name: 'Draven', region: 'noxus', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2012 },
  { id: 'swain', name: 'Swain', region: 'noxus', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2015 },
  { id: 'vladimir', name: 'Vladimir', region: 'noxus', classe: 'Mage', recurso: 'Crimson Rush', alcance: 'range', genero: 'male', ano: 2010 },
  { id: 'katarina', name: 'Katarina', region: 'noxus', classe: 'Assassin', recurso: 'None', alcance: 'close', genero: 'female', ano: 2009 },
  { id: 'cassiopeia', name: 'Cassiopeia', region: 'noxus', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2010 },
  { id: 'sion', name: 'Sion', region: 'noxus', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'talon', name: 'Talon', region: 'noxus', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'mordekaiser', name: 'Mordekaiser', region: 'noxus', classe: 'Fighter', recurso: 'Shield', alcance: 'close', genero: 'male', ano: 2010 },
  { id: 'samira', name: 'Samira', region: 'noxus', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2020 },
  { id: 'briar', name: 'Briar', region: 'noxus', classe: 'Fighter', recurso: 'Fury', alcance: 'close', genero: 'female', ano: 2023 },
  { id: 'ambessa', name: 'Ambessa', region: 'noxus', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2024 },
  { id: 'riven', name: 'Riven', region: 'noxus', classe: 'Fighter', recurso: 'None', alcance: 'close', genero: 'female', ano: 2011 },
  { id: 'leblanc', name: 'LeBlanc', region: 'noxus', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2010 },
  { id: 'smolder', name: 'Smolder', region: 'noxus', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2024 },
  { id: 'ksante', name: "K'Sante", region: 'noxus', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2022 },
  { id: 'kayn', name: 'Kayn', region: 'noxus', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2017 },
  { id: 'rell', name: 'Rell', region: 'noxus', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2020 },
  { id: 'aatrox', name: 'Aatrox', region: 'noxus', classe: 'Fighter', recurso: 'Blood Well', alcance: 'close', genero: 'male', ano: 2013 },
  { id: 'annie', name: 'Annie', region: 'noxus', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  // PILTOVER
  { id: 'caitlyn', name: 'Caitlyn', region: 'piltover', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2011 },
  { id: 'vi', name: 'Vi', region: 'piltover', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2012 },
  { id: 'jayce', name: 'Jayce', region: 'piltover', classe: 'Fighter', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2012 },
  { id: 'ezreal', name: 'Ezreal', region: 'piltover', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2010 },
  { id: 'orianna', name: 'Orianna', region: 'piltover', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2011 },
  { id: 'seraphine', name: 'Seraphine', region: 'piltover', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2020 },
  { id: 'camille', name: 'Camille', region: 'piltover', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2016 },
  { id: 'viktor', name: 'Viktor', region: 'piltover', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2011 },
  { id: 'renata', name: 'Renata Glasc', region: 'piltover', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2022 },
  // RUNETERRA
  { id: 'kindred', name: 'Kindred', region: 'runeterra', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'divers', ano: 2015 },
  { id: 'jhin', name: 'Jhin', region: 'runeterra', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2016 },
  { id: 'bard', name: 'Bard', region: 'runeterra', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'divers', ano: 2015 },
  { id: 'alistar', name: 'Alistar', region: 'runeterra', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'evelynn', name: 'Evelynn', region: 'runeterra', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2009 },
  { id: 'fiddlesticks', name: 'Fiddlesticks', region: 'runeterra', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'divers', ano: 2009 },
  { id: 'jax', name: 'Jax', region: 'runeterra', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'ryze', name: 'Ryze', region: 'runeterra', classe: 'Mage', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'shaco', name: 'Shaco', region: 'runeterra', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'divers', ano: 2009 },
  { id: 'zilean', name: 'Zilean', region: 'runeterra', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'nami', name: 'Nami', region: 'runeterra', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2012 },
  { id: 'nocturne', name: 'Nocturne', region: 'runeterra', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'divers', ano: 2011 },
  { id: 'brand', name: 'Brand', region: 'runeterra', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2011 },
  // SHADOW ISLES
  { id: 'thresh', name: 'Thresh', region: 'shadow-isles', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2013 },
  { id: 'yorick', name: 'Yorick', region: 'shadow-isles', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'hecarim', name: 'Hecarim', region: 'shadow-isles', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2012 },
  { id: 'kalista', name: 'Kalista', region: 'shadow-isles', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2014 },
  { id: 'karthus', name: 'Karthus', region: 'shadow-isles', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'viego', name: 'Viego', region: 'shadow-isles', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2021 },
  { id: 'gwen', name: 'Gwen', region: 'shadow-isles', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2021 },
  { id: 'vex', name: 'Vex', region: 'shadow-isles', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2021 },
  { id: 'elise', name: 'Elise', region: 'shadow-isles', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2013 },
  { id: 'maokai', name: 'Maokai', region: 'shadow-isles', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  // SHURIMA
  { id: 'nasus', name: 'Nasus', region: 'shurima', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'sivir', name: 'Sivir', region: 'shurima', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'renekton', name: 'Renekton', region: 'shurima', classe: 'Fighter', recurso: 'Ferocity', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'azir', name: 'Azir', region: 'shurima', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2014 },
  { id: 'amumu', name: 'Amumu', region: 'shurima', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'skarner', name: 'Skarner', region: 'shurima', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2011 },
  { id: 'taliyah', name: 'Taliyah', region: 'shurima', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2016 },
  { id: 'akshan', name: 'Akshan', region: 'shurima', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2021 },
  { id: 'xerath', name: 'Xerath', region: 'shurima', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2011 },
  { id: 'naafiri', name: 'Naafiri', region: 'shurima', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'divers', ano: 2023 },
  // VOID
  { id: 'kassadin', name: 'Kassadin', region: 'void', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'kogmaw', name: "Kog'Maw", region: 'void', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'divers', ano: 2010 },
  { id: 'chogath', name: "Cho'Gath", region: 'void', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'khazix', name: "Kha'Zix", region: 'void', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2012 },
  { id: 'reksai', name: "Rek'Sai", region: 'void', classe: 'Fighter', recurso: 'Fury', alcance: 'close', genero: 'female', ano: 2014 },
  { id: 'velkoz', name: "Vel'Koz", region: 'void', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'divers', ano: 2014 },
  { id: 'malzahar', name: 'Malzahar', region: 'void', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2010 },
  { id: 'kaisa', name: "Kai'Sa", region: 'void', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2018 },
  { id: 'belveth', name: "Bel'Veth", region: 'void', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'female', ano: 2022 },
  // ZAUN
  { id: 'jinx', name: 'Jinx', region: 'zaun', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2013 },
  { id: 'ekko', name: 'Ekko', region: 'zaun', classe: 'Assassin', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2015 },
  { id: 'ziggs', name: 'Ziggs', region: 'zaun', classe: 'Mage', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2012 },
  { id: 'zac', name: 'Zac', region: 'zaun', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2013 },
  { id: 'drmundo', name: 'Dr. Mundo', region: 'zaun', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'singed', name: 'Singed', region: 'zaun', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'twitch', name: 'Twitch', region: 'zaun', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'blitzcrank', name: 'Blitzcrank', region: 'zaun', classe: 'Tank', recurso: 'Mana', alcance: 'close', genero: 'divers', ano: 2009 },
  { id: 'urgot', name: 'Urgot', region: 'zaun', classe: 'Fighter', recurso: 'Mana', alcance: 'range', genero: 'male', ano: 2009 },
  { id: 'janna', name: 'Janna', region: 'zaun', classe: 'Support', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2009 },
  { id: 'warwick', name: 'Warwick', region: 'zaun', classe: 'Fighter', recurso: 'Mana', alcance: 'close', genero: 'male', ano: 2009 },
  { id: 'zeri', name: 'Zeri', region: 'zaun', classe: 'Marksman', recurso: 'Mana', alcance: 'range', genero: 'female', ano: 2022 },
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
