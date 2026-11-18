// Dados da clínica FICTÍCIA usada na demonstração.
// Tudo o que a IA pode dizer sobre a clínica sai daqui.

export const CLINICA = {
  nome: 'Clínica Sorriso Claro',
  cidade: 'São Carlos - SP',
  endereco: 'Rua Exemplo, 123, Centro, São Carlos - SP (endereço fictício)',
  horarios: 'Segunda a sexta, das 8h às 18h. Sábado, das 8h às 12h. Domingo e feriados fechado.',
  pagamento: 'Pix, dinheiro, cartão de débito e crédito (até 6x sem juros em tratamentos acima de R$ 600).',
  convenios: ['OdontoPrev', 'Amil Dental', 'SulAmérica Odonto', 'Bradesco Dental'],
  urgencia:
    'Para dor forte, inchaço ou sangramento, há encaixe no mesmo dia em horário comercial. Fora do horário, procure um pronto-atendimento odontológico.',
  estacionamento: 'Estacionamento conveniado na rua de trás, com 1 hora grátis para pacientes.',
  servicos: [
    { id: 'avaliacao', nome: 'Avaliação inicial', preco: 'gratuita', duracao: 30, descricao: 'Consulta com exame clínico e plano de tratamento.' },
    { id: 'limpeza', nome: 'Limpeza (profilaxia)', preco: 'R$ 180', duracao: 60, descricao: 'Remoção de placa e tártaro, polimento e aplicação de flúor.' },
    { id: 'clareamento', nome: 'Clareamento dental', preco: 'a partir de R$ 890', duracao: 60, descricao: 'Clareamento de consultório ou caseiro com moldeira, após avaliação.' },
    { id: 'restauracao', nome: 'Restauração em resina', preco: 'a partir de R$ 220 por dente', duracao: 60, descricao: 'Tratamento de cáries e pequenas fraturas.' },
    { id: 'canal', nome: 'Tratamento de canal', preco: 'a partir de R$ 750', duracao: 60, descricao: 'Valor final depende do dente; definido na avaliação.' },
    { id: 'ortodontia', nome: 'Aparelho ortodôntico', preco: 'manutenção a partir de R$ 160 por mês', duracao: 30, descricao: 'Aparelho fixo ou alinhadores; documentação ortodôntica à parte.' },
    { id: 'implante', nome: 'Implante dentário', preco: 'a partir de R$ 2.900', duracao: 60, descricao: 'Valor depende de exames de imagem; definido na avaliação.' },
  ],
  equipe: [
    { nome: 'Dra. Helena Prado', area: 'Clínica geral e estética' },
    { nome: 'Dr. Marcos Tavares', area: 'Ortodontia' },
    { nome: 'Dra. Júlia Campos', area: 'Implantes e endodontia' },
  ],
} as const

export type ServicoId = (typeof CLINICA.servicos)[number]['id']

const TZ = 'America/Sao_Paulo'

function partes(d: Date) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', hourCycle: 'h23' })
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]))
  return { data: `${p.year}-${p.month}-${p.day}`, semana: p.weekday as string, hora: Number(p.hour) }
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) % 100
}

export type Horario = { data: string; diaSemana: string; hora: string }

const NOMES_DIA: Record<string, string> = { Mon: 'segunda', Tue: 'terça', Wed: 'quarta', Thu: 'quinta', Fri: 'sexta', Sat: 'sábado', Sun: 'domingo' }

/** Horários livres nos próximos dias úteis. Parte deles aparece ocupada para parecer uma agenda real. */
export function horariosLivres(agora = new Date(), dias = 7, ocupados: string[] = []): Horario[] {
  const out: Horario[] = []
  const hoje = partes(agora)
  for (let i = 0; i < dias + 3 && out.length < 400; i++) {
    const d = new Date(agora.getTime() + i * 86400000)
    const { data, semana } = partes(d)
    if (semana === 'Sun') continue
    const fim = semana === 'Sat' ? 12 : 18
    for (let h = 8; h < fim; h++) {
      if (h === 12) continue // almoço
      if (data === hoje.data && h <= hoje.hora + 1) continue
      const hora = `${String(h).padStart(2, '0')}:00`
      const chave = `${data} ${hora}`
      if (hash(chave) < 45 || ocupados.includes(chave)) continue
      out.push({ data, diaSemana: NOMES_DIA[semana] ?? semana, hora })
    }
  }
  return out
}

export function textoClinica(): string {
  const c = CLINICA
  return [
    `Nome: ${c.nome} (clínica fictícia de demonstração) - ${c.cidade}`,
    `Endereço: ${c.endereco}`,
    `Horário de funcionamento: ${c.horarios}`,
    `Formas de pagamento: ${c.pagamento}`,
    `Convênios aceitos: ${c.convenios.join(', ')}. Outros convênios: não atendemos, mas fazemos preço particular.`,
    `Urgência: ${c.urgencia}`,
    `Estacionamento: ${c.estacionamento}`,
    'Serviços e preços:',
    ...c.servicos.map((s) => `- ${s.nome} (id: ${s.id}): ${s.preco}. ${s.descricao}`),
    'Equipe:',
    ...c.equipe.map((e) => `- ${e.nome}: ${e.area}`),
  ].join('\n')
}
