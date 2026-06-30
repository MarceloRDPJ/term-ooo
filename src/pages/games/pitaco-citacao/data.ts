// src/pages/games/pitaco-citacao/data.ts
//
// Banco de citacoes ficticias do chat do escritorio PITACO. Cada
// citacao tem um autor (id do auditor) e o texto curto que ele
// mandou no chat. Tom: corporativo + humor de escritorio.
//
// Reaproveita o cadastro de auditores do PITACO Emoji (mesmo banco)
// para manter a consistencia de "quem fala o que".

import type { Citacao } from './types'
import { EMOJI_AUDITORES, findAuditorById } from '../pitaco-emoji/data'

export const CITACOES: Citacao[] = [
  { id: 'c01', authorId: 'joana-pautas', text: 'vamos abrir uma pauta sobre isso amanha as 10', context: 'reuniao de status' },
  { id: 'c02', authorId: 'pedro-homologa', text: 'bora homologar essa tela antes de sexta', context: 'fechamento de sprint' },
  { id: 'c03', authorId: 'marina-cracha', text: 'cracha novo? vem na minha sala que eu assino', context: 'onboarding' },
  { id: 'c04', authorId: 'rafael-relatorio', text: 'fechei o relatorio, ta em cima da mesa', context: 'fechamento mensal' },
  { id: 'c05', authorId: 'camila-pitaco', text: 'so um pitaco: acho que faltou um botao aqui', context: 'revisao de tela' },
  { id: 'c06', authorId: 'bruno-cheffe', text: 'me adiciona na thread que eu preciso ver isso', context: 'email' },
  { id: 'c07', authorId: 'leticia-reuniao', text: 'reuniao das 3 foi pro dia 22, ja ta na agenda', context: 'reagendamento' },
  { id: 'c08', authorId: 'tiago-cafe', text: 'cafe no filtro novo ta uma delicia, alguem prova?', context: 'cafe da tarde' },
  { id: 'c09', authorId: 'ana-design', text: 'esse azul nao conversa com o resto do sistema, viu?', context: 'revisao de design' },
  { id: 'c10', authorId: 'lucas-rh', text: 'one-on-one de quinta pode ser as 14?', context: 'agendamento' },
  { id: 'c11', authorId: 'sofia-financeiro', text: 'centro de custo errado, me passa a planilha certa', context: 'rateio' },
  { id: 'c12', authorId: 'diego-juridico', text: 'a clausula 3.2 precisa de um olho antes de assinar', context: 'contrato' },
  { id: 'c13', authorId: 'patricia-marketing', text: 'campanha vai pra rua quinta, me ajuda a revisar o texto', context: 'campanha' },
  { id: 'c14', authorId: 'renan-vendas', text: 'fechei o cliente, manda o contrato pra mim', context: 'fechamento' },
  { id: 'c15', authorId: 'juliana-suporte', text: 'ticket do joao e prioridade vermelha, ja entendi', context: 'suporte' },
  { id: 'c16', authorId: 'marcos-infra', text: 'servidor caiu, ja to reiniciando, calma', context: 'incidente' },
  { id: 'c17', authorId: 'carolina-mobile', text: 'o build do ios demora, paciencia, nao e bug', context: 'build' },
  { id: 'c18', authorId: 'felipe-android', text: 'no android funciona, isso e problema da apple mesmo', context: 'bug' },
  { id: 'c19', authorId: 'isabela-qa', text: 'achei um bug que ninguem achou, dia feliz', context: 'qa' },
  { id: 'c20', authorId: 'gustavo-seguranca', text: 'troca a senha do e-mail corporativo, nao custa nada', context: 'seguranca' },
  { id: 'c21', authorId: 'paula-produto', text: 'esse item vai pra proxima sprint, priorizei no backlog', context: 'planejamento' },
  { id: 'c22', authorId: 'helen-ux', text: 'pesquisa com 5 usuarios, deu um insight maneiro', context: 'descoberta' },
  { id: 'c23', authorId: 'andre-backend', text: 'a query ta com N+1, vou refatorar hoje a noite', context: 'code review' },
  { id: 'c24', authorId: 'natalia-frontend', text: 'tailwind salvou minha vida, so isso', context: 'refactor' },
  { id: 'c25', authorId: 'rodrigo-estrategia', text: 'esse trimestre a meta e crescer 20%, alinhamos?', context: 'okr' },
  { id: 'c26', authorId: 'vivian-financeira', text: 'pix nao caiu ainda, me passa o comprovante', context: 'pagamento' },
  { id: 'c27', authorId: 'caio-compras', text: 'cotacao 4 venceu, dispara a ordem de compra', context: 'cotacao' },
  { id: 'c28', authorId: 'beatriz-facilites', text: 'cafeteira do 3 andar ta de novo quebrada', context: 'manutencao' },
  { id: 'c29', authorId: 'thiago-logistica', text: 'transportadora sumiu com a NF, to rastreando', context: 'entrega' },
  { id: 'c30', authorId: 'priscila-treinamento', text: 'onboarding da carol comeca as 9, vem junto', context: 'treinamento' },
  { id: 'c31', authorId: 'lucas-devops', text: 'pipeline verde, sobe pra produ com confianca', context: 'deploy' },
  { id: 'c32', authorId: 'vanessa-bi', text: 'dashboard atualizado, quem quiser o link e so pedir', context: 'relatorio' },
  { id: 'c33', authorId: 'joana-pautas', text: 'ata da ultima reuniao ta no drive, da uma olhada', context: 'ata' },
  { id: 'c34', authorId: 'bruno-cheffe', text: 'parabens ao time, meta batida no trimestre', context: 'celebracao' },
  { id: 'c35', authorId: 'camila-pitaco', text: 'mais um pitaco: o botao de salvar ta escondido', context: 'revisao' },
  { id: 'c36', authorId: 'pedro-homologa', text: 'cracha homologado, posso subir pra produ?', context: 'homologacao' },
  { id: 'c37', authorId: 'rafael-relatorio', text: 'metrica do dia: caimos 8% no engajamento', context: 'analise' },
  { id: 'c38', authorId: 'tiago-cafe', text: 'quem trouxe o cafe? to devendo um pao de queijo', context: 'cafe' },
  { id: 'c39', authorId: 'lucas-rh', text: 'bem-vindo ao time, pega o cracha na recepcao', context: 'onboarding' },
  { id: 'c40', authorId: 'isabela-qa', text: 'passei 3 horas achando o bug, era um espaco', context: 'qa' },
  { id: 'c41', authorId: 'paula-produto', text: 'roadmap do proximo trimestre ta no notion', context: 'planejamento' },
  { id: 'c42', authorId: 'marina-cracha', text: 'meta do mes e entregar 3 crachas por time', context: 'meta' },
]

export function findCitacaoById(id: string): Citacao | undefined {
  return CITACOES.find((c) => c.id === id)
}

export function pickCitacaoForDay(dayNumber: number): Citacao {
  const index = ((dayNumber % CITACOES.length) + CITACOES.length) % CITACOES.length
  return CITACOES[index]
}

export function citacaoAuthorName(citacao: Citacao): string {
  return findAuditorById(citacao.authorId)?.nickname ?? 'desconhecido'
}

export { EMOJI_AUDITORES, findAuditorById }
