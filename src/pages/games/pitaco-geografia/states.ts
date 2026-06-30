// src/pages/games/pitaco-geografia/states.ts
//
// 27 estados brasileiros (26 estados + DF) com coordenadas centroidais aproximadas
// e informacoes basicas para o PITACO Geografia.
//
// As coordenadas sao aproximadas (centro geografico ou proximo a capital) e foram
// escolhidas para o calculo de distancia/bearing do jogo. Nao sao rigorosamente
// o centroide oficial do estado, mas sao suficientes para fornecer feedback
// confiavel de "perto/longe" e direcao (N/S/L/O/NE/NO/SE/SO).
//
// A silhueta (silhouette) e um placeholder textual — o MVP nao usa SVG real
// das fronteiras dos estados. O placeholder e uma string "uf:{UF}|name:{Nome}"
// para permitir evolucao futura sem refactor de dados. Renderizacao atual: nome
// grande + emoji 🗺️ no board.
//
// TODO(iteracao futura): substituir o placeholder por paths SVG simplificados
// das silhuetas de cada estado para o feedback visual principal do Worldle.

export type RegionCode = 'N' | 'NE' | 'CO' | 'SE' | 'S'

export interface BrazilianState {
  uf: string
  name: string
  capital: string
  lat: number
  lng: number
  region: RegionCode
  silhouette: string
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  {
    uf: 'AC',
    name: 'Acre',
    capital: 'Rio Branco',
    lat: -9.0238,
    lng: -70.812,
    region: 'N',
    silhouette: 'uf:AC|name:Acre',
  },
  {
    uf: 'AL',
    name: 'Alagoas',
    capital: 'Maceio',
    lat: -9.5713,
    lng: -36.782,
    region: 'NE',
    silhouette: 'uf:AL|name:Alagoas',
  },
  {
    uf: 'AP',
    name: 'Amapa',
    capital: 'Macapa',
    lat: 0.902,
    lng: -52.003,
    region: 'N',
    silhouette: 'uf:AP|name:Amapa',
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    capital: 'Manaus',
    lat: -3.4168,
    lng: -65.8561,
    region: 'N',
    silhouette: 'uf:AM|name:Amazonas',
  },
  {
    uf: 'BA',
    name: 'Bahia',
    capital: 'Salvador',
    lat: -12.9714,
    lng: -38.5014,
    region: 'NE',
    silhouette: 'uf:BA|name:Bahia',
  },
  {
    uf: 'CE',
    name: 'Ceara',
    capital: 'Fortaleza',
    lat: -3.7172,
    lng: -38.5433,
    region: 'NE',
    silhouette: 'uf:CE|name:Ceara',
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    capital: 'Brasilia',
    lat: -15.8267,
    lng: -47.9218,
    region: 'CO',
    silhouette: 'uf:DF|name:Distrito Federal',
  },
  {
    uf: 'ES',
    name: 'Espirito Santo',
    capital: 'Vitoria',
    lat: -20.3155,
    lng: -40.3128,
    region: 'SE',
    silhouette: 'uf:ES|name:Espirito Santo',
  },
  {
    uf: 'GO',
    name: 'Goias',
    capital: 'Goiania',
    lat: -16.6864,
    lng: -49.2643,
    region: 'CO',
    silhouette: 'uf:GO|name:Goias',
  },
  {
    uf: 'MA',
    name: 'Maranhao',
    capital: 'Sao Luis',
    lat: -2.5297,
    lng: -44.3028,
    region: 'NE',
    silhouette: 'uf:MA|name:Maranhao',
  },
  {
    uf: 'MT',
    name: 'Mato Grosso',
    capital: 'Cuiaba',
    lat: -15.5989,
    lng: -56.0949,
    region: 'CO',
    silhouette: 'uf:MT|name:Mato Grosso',
  },
  {
    uf: 'MS',
    name: 'Mato Grosso do Sul',
    capital: 'Campo Grande',
    lat: -20.4697,
    lng: -54.6201,
    region: 'CO',
    silhouette: 'uf:MS|name:Mato Grosso do Sul',
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    capital: 'Belo Horizonte',
    lat: -19.9167,
    lng: -43.9345,
    region: 'SE',
    silhouette: 'uf:MG|name:Minas Gerais',
  },
  {
    uf: 'PA',
    name: 'Para',
    capital: 'Belem',
    lat: -1.4558,
    lng: -48.5039,
    region: 'N',
    silhouette: 'uf:PA|name:Para',
  },
  {
    uf: 'PB',
    name: 'Paraiba',
    capital: 'Joao Pessoa',
    lat: -7.1195,
    lng: -34.845,
    region: 'NE',
    silhouette: 'uf:PB|name:Paraiba',
  },
  {
    uf: 'PR',
    name: 'Parana',
    capital: 'Curitiba',
    lat: -25.4284,
    lng: -49.2733,
    region: 'S',
    silhouette: 'uf:PR|name:Parana',
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    capital: 'Recife',
    lat: -8.0476,
    lng: -34.877,
    region: 'NE',
    silhouette: 'uf:PE|name:Pernambuco',
  },
  {
    uf: 'PI',
    name: 'Piaui',
    capital: 'Teresina',
    lat: -5.0892,
    lng: -42.8019,
    region: 'NE',
    silhouette: 'uf:PI|name:Piaui',
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    capital: 'Rio de Janeiro',
    lat: -22.9068,
    lng: -43.1729,
    region: 'SE',
    silhouette: 'uf:RJ|name:Rio de Janeiro',
  },
  {
    uf: 'RN',
    name: 'Rio Grande do Norte',
    capital: 'Natal',
    lat: -5.7945,
    lng: -35.211,
    region: 'NE',
    silhouette: 'uf:RN|name:Rio Grande do Norte',
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    capital: 'Porto Alegre',
    lat: -30.0346,
    lng: -51.2177,
    region: 'S',
    silhouette: 'uf:RS|name:Rio Grande do Sul',
  },
  {
    uf: 'RO',
    name: 'Rondonia',
    capital: 'Porto Velho',
    lat: -8.7619,
    lng: -63.9039,
    region: 'N',
    silhouette: 'uf:RO|name:Rondonia',
  },
  {
    uf: 'RR',
    name: 'Roraima',
    capital: 'Boa Vista',
    lat: 2.8235,
    lng: -60.6753,
    region: 'N',
    silhouette: 'uf:RR|name:Roraima',
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    capital: 'Florianopolis',
    lat: -27.5949,
    lng: -48.548,
    region: 'S',
    silhouette: 'uf:SC|name:Santa Catarina',
  },
  {
    uf: 'SP',
    name: 'Sao Paulo',
    capital: 'Sao Paulo',
    lat: -23.5505,
    lng: -46.6333,
    region: 'SE',
    silhouette: 'uf:SP|name:Sao Paulo',
  },
  {
    uf: 'SE',
    name: 'Sergipe',
    capital: 'Aracaju',
    lat: -10.9472,
    lng: -37.0731,
    region: 'NE',
    silhouette: 'uf:SE|name:Sergipe',
  },
  {
    uf: 'TO',
    name: 'Tocantins',
    capital: 'Palmas',
    lat: -10.167,
    lng: -48.3277,
    region: 'N',
    silhouette: 'uf:TO|name:Tocantins',
  },
]

export const REGION_LABELS: Record<RegionCode, string> = {
  N: 'Norte',
  NE: 'Nordeste',
  CO: 'Centro-Oeste',
  SE: 'Sudeste',
  S: 'Sul',
}

export function findStateByUf(uf: string): BrazilianState | undefined {
  const normalized = uf.trim().toUpperCase()
  return BRAZILIAN_STATES.find((s) => s.uf === normalized)
}

export function findStateByQuery(query: string): BrazilianState | undefined {
  const normalized = query
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

  if (!normalized) return undefined

  return BRAZILIAN_STATES.find((s) => {
    const ufLower = s.uf.toLowerCase()
    const nameLower = s.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
    const capitalLower = s.capital
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
    return (
      ufLower === normalized ||
      nameLower.includes(normalized) ||
      capitalLower.includes(normalized) ||
      normalized.includes(nameLower.split(' ')[0]!)
    )
  })
}
