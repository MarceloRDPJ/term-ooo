// src/pages/games/pitaco-emoji/data.ts
//
// Banco de 30+ auditores do escritorio PITACO. Cada um tem uma
// combinacao de 3-5 emojis que funciona como pista para identifica-lo
// (hobby, personalidade, funcao, mania de escritorio, etc).
//
// Tom: corporativo + humor de escritorio. Sem dados reais, so ficticios.

import type { EmojiAuditor } from './types'

export const EMOJI_AUDITORES: EmojiAuditor[] = [
  {
    id: 'joana-pautas',
    name: 'Joana Pautas',
    nickname: 'Joana',
    role: 'coordenadora de homologacao',
    emojis: ['📋', '✅', '🗣️', '💼'],
    emojiHint: 'a pessoa que abre pauta em qualquer reuniao',
  },
  {
    id: 'pedro-homologa',
    name: 'Pedro Homologa',
    nickname: 'Pedro',
    role: 'analista de qualidade',
    emojis: ['🧪', '🧷', '🔍', '📑'],
    emojiHint: 'sobe cracha no sistema e valida cada virgula do relatorio',
  },
  {
    id: 'marina-cracha',
    name: 'Marina Cracha',
    nickname: 'Marina',
    role: 'líder de gente & gestao',
    emojis: ['🏷️', '🪪', '🧑‍💼', '☕'],
    emojiHint: 'anda com o cracha pendurado no cordao vermelho e um cafe na mao',
  },
  {
    id: 'rafael-relatorio',
    name: 'Rafael Relatorio',
    nickname: 'Rafa',
    role: 'analista de dados pleno',
    emojis: ['📊', '📈', '💻', '☕'],
    emojiHint: 'vive exportando planilha e fazendo grafico de pizza',
  },
  {
    id: 'camila-pitaco',
    name: 'Camila Pitaco',
    nickname: 'Cami',
    role: 'estagiaria de comunicacao',
    emojis: ['🐤', '💬', '🎤', '📱'],
    emojiHint: 'manda pitaco em tudo e esta sempre no chat',
  },
  {
    id: 'bruno-cheffe',
    name: 'Bruno Cheffe',
    nickname: 'Bruno',
    role: 'gerente da area',
    emojis: ['👔', '🗂️', '📞', '🪑'],
    emojiHint: 'tem agenda lotada, sala com vista e cafe sem acucar',
  },
  {
    id: 'leticia-reuniao',
    name: 'Leticia Reuniao',
    nickname: 'Lê',
    role: 'PMO (escritorio de projetos)',
    emojis: ['🗓️', '👥', '🎯', '💼'],
    emojiHint: 'marata 7 reunioes por dia, uma atras da outra',
  },
  {
    id: 'tiago-cafe',
    name: 'Tiago Cafe',
    nickname: 'Tiago',
    role: 'dev backend',
    emojis: ['☕', '💻', '🐛', '🦉'],
    emojiHint: 'codifica de madrugada, madruga com cafe e dorme no standup',
  },
  {
    id: 'ana-design',
    name: 'Ana Design',
    nickname: 'Aninha',
    role: 'design lead',
    emojis: ['🎨', '🖌️', '🖼️', '👓'],
    emojiHint: 'critica logo em ASCII e briga por 4px de padding',
  },
  {
    id: 'lucas-rh',
    name: 'Lucas RH',
    nickname: 'Luca',
    role: 'business partner de pessoas',
    emojis: ['🤝', '📄', '💚', '🪑'],
    emojiHint: 'faz one-on-one e lembra o aniversario de todo mundo',
  },
  {
    id: 'sofia-financeiro',
    name: 'Sofia Financeiro',
    nickname: 'Sofi',
    role: 'analista fin',
    emojis: ['💰', '🧾', '📉', '🧮'],
    emojiHint: 'corta cafe gourmet do orcamento e briga por planilha',
  },
  {
    id: 'diego-juridico',
    name: 'Diego Juridico',
    nickname: 'Die',
    role: 'advogado interno',
    emojis: ['⚖️', '📜', '🖋️', '🕴️'],
    emojiHint: 'leia 200 paginas de contrato antes do almoco',
  },
  {
    id: 'patricia-marketing',
    name: 'Patricia Marketing',
    nickname: 'Pati',
    role: 'head de marketing',
    emojis: ['📣', '📸', '🎬', '🤳'],
    emojiHint: 'manda 12 stories por dia, mesmo em sabado',
  },
  {
    id: 'renan-vendas',
    name: 'Renan Vendas',
    nickname: 'Renan',
    role: 'hunter B2B',
    emojis: ['📞', '🤝', '🏆', '💼'],
    emojiHint: 'liga em horario comercial, fecha cafe em 5 minutos',
  },
  {
    id: 'juliana-suporte',
    name: 'Juliana Suporte',
    nickname: 'Ju',
    role: 'analista de suporte N1',
    emojis: ['🎧', '🛟', '🐛', '💬'],
    emojiHint: 'atende ticket, finge paciencia e ama planilha de chamados',
  },
  {
    id: 'marcos-infra',
    name: 'Marcos Infra',
    nickname: 'Marcão',
    role: 'sysadmin senior',
    emojis: ['🖥️', '🔧', '🛜', '🐧'],
    emojiHint: 'cuida do servidor e fala que reiniciar resolve tudo',
  },
  {
    id: 'carolina-mobile',
    name: 'Carolina Mobile',
    nickname: 'Carol',
    role: 'dev iOS',
    emojis: ['📱', '🍎', '🧑‍💻', '🦄'],
    emojiHint: 'so entrega no iPhone, odeia Android em silencio',
  },
  {
    id: 'felipe-android',
    name: 'Felipe Android',
    nickname: 'Fe',
    role: 'dev Android',
    emojis: ['🤖', '📱', '🧑‍💻', '🟢'],
    emojiHint: 'defende Android na hora do almoco e tem 4 modelos',
  },
  {
    id: 'isabela-qa',
    name: 'Isabela QA',
    nickname: 'Isa',
    role: 'engenheira de QA',
    emojis: ['🐛', '🔍', '🧪', '🧷'],
    emojiHint: 'abre bug que ninguem consegue reproduzir e festeja',
  },
  {
    id: 'gustavo-seguranca',
    name: 'Gustavo Seguranca',
    nickname: 'Gus',
    role: 'analista de seguranca da informacao',
    emojis: ['🛡️', '🔐', '🕵️', '🚨'],
    emojiHint: 'pede pra trocar a senha e fala de phishing',
  },
  {
    id: 'paula-produto',
    name: 'Paula Produto',
    nickname: 'Paulinha',
    role: 'product manager',
    emojis: ['🧭', '🗺️', '🎯', '🧑‍💼'],
    emojiHint: 'cria roadmap, prioriza backlog e briga por OKR',
  },
  {
    id: 'helen-ux',
    name: 'Helen UX',
    nickname: 'Hel',
    role: 'pesquisadora UX',
    emojis: ['🗣️', '🧠', '📝', '🪑'],
    emojiHint: 'faz entrevista, sobe insight e ama post-it colorido',
  },
  {
    id: 'andre-backend',
    name: 'Andre Backend',
    nickname: 'Dé',
    role: 'dev backend senior',
    emojis: ['🧱', '🗄️', '💻', '🧪'],
    emojiHint: 'mora no banco de dados, dorme sonhando com SQL',
  },
  {
    id: 'natalia-frontend',
    name: 'Natalia Frontend',
    nickname: 'Nat',
    role: 'dev frontend',
    emojis: ['🎨', '💻', '🪄', '✨'],
    emojiHint: 'faz pixel art, briga por CSS e ama tailwind',
  },
  {
    id: 'rodrigo-estrategia',
    name: 'Rodrigo Estrategia',
    nickname: 'Drigo',
    role: 'head de estrategia',
    emojis: ['🧠', '🗺️', '🪜', '♟️'],
    emojiHint: 'pensa 3 trimestres a frente e joga xadrez no almoco',
  },
  {
    id: 'vivian-financeiro',
    name: 'Vivian Tesouraria',
    nickname: 'Viv',
    role: 'tesoureira',
    emojis: ['🏦', '💸', '🧾', '🗝️'],
    emojiHint: 'cuida do caixa e pede pix antes do vencimento',
  },
  {
    id: 'caio-compras',
    name: 'Caio Compras',
    nickname: 'Caio',
    role: 'analista de compras',
    emojis: ['🛒', '📦', '🏷️', '📋'],
    emojiHint: 'cotou 7 fornecedores, fez 4 cotacoes, mandou e-mail',
  },
  {
    id: 'beatriz-facilites',
    name: 'Beatriz Facilites',
    nickname: 'Bea',
    role: 'facilities',
    emojis: ['🔑', '🧹', '☕', '🪴'],
    emojiHint: 'resolve problema da cafeteira e da sala sem ar',
  },
  {
    id: 'thiago-logistica',
    name: 'Thiago Logistica',
    nickname: 'Thi',
    role: 'analista de logistica',
    emojis: ['🚚', '📦', '🗺️', '⏱️'],
    emojiHint: 'rastreia entrega, briga com transportadora e ama planilha',
  },
  {
    id: 'priscila-treinamento',
    name: 'Priscila Treinamento',
    nickname: 'Pri',
    role: 'analista de treinamento',
    emojis: ['🎓', '🧑‍🏫', '📚', '💡'],
    emojiHint: 'monta onboarding, da boas vindas e explica o cracha',
  },
  {
    id: 'lucas-devops',
    name: 'Lucas DevOps',
    nickname: 'Lukas',
    role: 'engenheiro DevOps',
    emojis: ['🐳', '🚀', '⛓️', '🛠️'],
    emojiHint: 'sobe container, mexe em pipeline, briga com yaml',
  },
  {
    id: 'vanessa-bi',
    name: 'Vanessa BI',
    nickname: 'Van',
    role: 'analista de BI',
    emojis: ['📊', '🔎', '💡', '📚'],
    emojiHint: 'transforma dado em dashboard, ama power bi e cafe',
  },
]

export function findAuditorById(id: string): EmojiAuditor | undefined {
  return EMOJI_AUDITORES.find((a) => a.id === id)
}

export function findAuditorByQuery(query: string): EmojiAuditor | undefined {
  const norm = query
    .normalize('NFD')
    .replace(/[^\w\s]/g, '')
    .toLowerCase()
    .trim()
  if (!norm) return undefined
  return EMOJI_AUDITORES.find((a) => {
    const full = `${a.name} ${a.nickname}`.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase()
    return full.includes(norm) || norm.includes(a.nickname.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase())
  })
}
