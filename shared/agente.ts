import { CLINICA, horariosLivres, textoClinica } from './clinica.js'

// Assistente virtual da clínica fictícia. A IA (Google Gemini) só interpreta e redige;
// horários e agendamentos são consultados e validados aqui no servidor.

export type Msg = { role: 'user' | 'assistente'; texto: string }
export type Canal = 'site' | 'whatsapp'
export type Idioma = 'pt' | 'en'
export type Acao =
  | { tipo: 'agendamento'; protocolo: string; servico: string; data: string; hora: string; nome: string }
  | { tipo: 'transferencia'; motivo: string; resumo: string }

// Usa a API do Google direto. No Netlify, o AI Gateway também pode injetar GOOGLE_GEMINI_BASE_URL.
const BASE = (process.env.GOOGLE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '')
// Modelos tentados em ordem; o primeiro aceito fica guardado enquanto a função estiver quente.
// O "lite" vem primeiro: no plano grátis do Google é o que responde rápido e sem limite apertado.
const CANDIDATOS = [process.env.GEMINI_MODEL, 'gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3-flash-preview'].filter(Boolean) as string[]
let modeloOk: string | null = null
const MAX_MSGS = 30
const MAX_CHARS = 600

// Limite simples por IP (por instância da função) para a demo pública não ser abusada.
const uso = new Map<string, number[]>()
export function limitado(ip: string, max = 40) {
  const agora = Date.now()
  const janela = (uso.get(ip) || []).filter((t) => agora - t < 10 * 60_000)
  janela.push(agora)
  uso.set(ip, janela)
  return janela.length > max
}

function hojeSP() {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())
}

function instrucoes(canal: Canal, idioma: Idioma = 'pt') {
  const onde = canal === 'whatsapp' ? 'pelo WhatsApp da clínica' : 'pelo chat do site'
  const formato = canal === 'whatsapp'
    ? '- É WhatsApp: escreva como numa conversa de celular. Para destacar, use *um asterisco* (nunca dois). Sem links e sem títulos.'
    : '- Pode usar **negrito** para destacar valores e horários. Não use títulos.'
  return `Você é a Clara, assistente virtual da ${CLINICA.nome}. Atenda pacientes ${onde}, em português do Brasil, com simpatia e objetividade.

Agora é ${hojeSP()} (horário de Brasília).

INFORMAÇÕES DA CLÍNICA (a única fonte que você pode usar):
${textoClinica()}

REGRAS:
- Responda sempre no idioma em que o paciente escreveu por último (português, inglês, espanhol...).${idioma === 'en' ? ' O visitante está na versão em inglês do site: se a mensagem for ambígua, use inglês. Traduza nomes de serviços e regras para o inglês e mantenha os preços em reais (R$).' : ''}
- Responda de forma curta: no máximo 3 frases, ou uma lista curta. Sem textos longos.
- Use SOMENTE as informações acima. Se não souber, diga que vai confirmar com a recepção e ofereça transferir. Nunca invente preço, convênio, profissional, prazo ou horário.
- Para falar de horários disponíveis, SEMPRE chame a ferramenta ver_horarios. Ofereça no máximo 4 opções.
- Para agendar: confirme serviço, dia e hora e peça só o primeiro nome. Depois chame agendar_consulta. Não peça CPF, telefone, e-mail nem outros dados pessoais (é uma demonstração).
- Se a ferramenta disser que o horário não está livre, peça desculpas e ofereça outros.
- Não dê diagnóstico nem receite remédios. Em dor forte, inchaço ou sangramento, explique o encaixe de urgência e ofereça o horário livre mais próximo.
- Se a pessoa pedir atendente humano, reclamar, ou o assunto fugir do que você sabe, chame transferir_para_recepcao.
- Se perguntarem se você é uma IA ou se a clínica é real: diga que é uma assistente de IA de demonstração e que a clínica é fictícia, criada por Alan Souza para mostrar como funciona um atendimento com IA.
- Assuntos sem relação com a clínica: responda com educação que só pode ajudar com a clínica.
${formato}`
}

const FERRAMENTAS = [
  {
    functionDeclarations: [
      {
        name: 'ver_horarios',
        description: 'Lista horários livres na agenda da clínica. Use antes de oferecer qualquer horário.',
        parameters: {
          type: 'OBJECT',
          properties: {
            data: { type: 'STRING', description: 'Data desejada no formato AAAA-MM-DD (opcional).' },
            periodo: { type: 'STRING', enum: ['manha', 'tarde', 'qualquer'], description: 'Período do dia (opcional).' },
          },
        },
      },
      {
        name: 'agendar_consulta',
        description: 'Agenda uma consulta num horário livre, depois que o paciente confirmou serviço, dia, hora e nome.',
        parameters: {
          type: 'OBJECT',
          properties: {
            servico_id: { type: 'STRING', enum: CLINICA.servicos.map((s) => s.id) },
            data: { type: 'STRING', description: 'AAAA-MM-DD' },
            hora: { type: 'STRING', description: 'HH:MM' },
            nome: { type: 'STRING', description: 'Primeiro nome do paciente' },
          },
          required: ['servico_id', 'data', 'hora', 'nome'],
        },
      },
      {
        name: 'transferir_para_recepcao',
        description: 'Encaminha a conversa para uma pessoa da recepção.',
        parameters: {
          type: 'OBJECT',
          properties: {
            motivo: { type: 'STRING' },
            resumo: { type: 'STRING', description: 'Resumo curto do que o paciente quer' },
          },
          required: ['motivo', 'resumo'],
        },
      },
    ],
  },
]

function executar(nome: string, args: any, ocupados: string[], acoes: Acao[]) {
  if (nome === 'ver_horarios') {
    let lista = horariosLivres(new Date(), 7, ocupados)
    if (args?.data) lista = lista.filter((h) => h.data === args.data)
    if (args?.periodo === 'manha') lista = lista.filter((h) => h.hora < '12:00')
    if (args?.periodo === 'tarde') lista = lista.filter((h) => h.hora >= '13:00')
    return { horarios: lista.slice(0, 8), observacao: lista.length ? undefined : 'Nenhum horário livre com esse filtro.' }
  }
  if (nome === 'agendar_consulta') {
    const servico = CLINICA.servicos.find((s) => s.id === args?.servico_id)
    const hora = String(args?.hora || '').slice(0, 5)
    const livre = horariosLivres(new Date(), 7, ocupados).some((h) => h.data === args?.data && h.hora === hora)
    if (!servico) return { ok: false, erro: 'Serviço inválido.' }
    if (!livre) return { ok: false, erro: 'Esse horário não está livre. Consulte ver_horarios de novo.' }
    const nomePaciente = String(args?.nome || '').trim().split(/\s+/)[0]?.slice(0, 30) || 'Paciente'
    const protocolo = 'SC' + Math.random().toString(36).slice(2, 7).toUpperCase()
    ocupados.push(`${args.data} ${hora}`)
    acoes.push({ tipo: 'agendamento', protocolo, servico: servico.nome, data: args.data, hora, nome: nomePaciente })
    return { ok: true, protocolo, servico: servico.nome, data: args.data, hora, nome: nomePaciente }
  }
  if (nome === 'transferir_para_recepcao') {
    acoes.push({ tipo: 'transferencia', motivo: String(args?.motivo || '').slice(0, 200), resumo: String(args?.resumo || '').slice(0, 300) })
    return { ok: true, mensagem: 'Conversa enviada para a recepção. Em horário comercial, alguém responde em poucos minutos.' }
  }
  return { ok: false, erro: 'Ferramenta desconhecida.' }
}

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json; charset=utf-8' } })
}

// Núcleo da Clara, usado pelo chat do site e pelo WhatsApp.
export async function responder(mensagens: Msg[], ocupados: string[], canal: Canal = 'site', idioma: Idioma = 'pt'): Promise<{ resposta: string; acoes: Acao[]; status?: number }> {
  const chave = process.env.GEMINI_API_KEY
  if (!chave) return { resposta: 'A assistente está em manutenção no momento. Tente de novo mais tarde.', acoes: [] }
  const contents: any[] = mensagens.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.texto.slice(0, MAX_CHARS) }] }))
  const acoes: Acao[] = []

  for (let passo = 0; passo < 5; passo++) {
    const corpoReq = JSON.stringify({
      systemInstruction: { parts: [{ text: instrucoes(canal, idioma) }] },
      contents,
      tools: FERRAMENTAS,
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    })
    const fila = modeloOk ? [modeloOk, ...CANDIDATOS.filter((m) => m !== modeloOk)] : CANDIDATOS
    const chamar = async (modelo: string, ms: number, cancelar?: AbortSignal): Promise<Response> => {
      try {
        const sinais = [AbortSignal.timeout(ms), ...(cancelar ? [cancelar] : [])]
        const resp = await fetch(`${BASE}/v1beta/models/${modelo}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': chave },
          body: corpoReq,
          signal: AbortSignal.any(sinais),
        })
        if (!resp.ok) console.log('MODELO_FALHOU ' + modelo + ' ' + resp.status + ' ' + (await resp.clone().text()).slice(0, 160).replace(/\s+/g, ' '))
        return resp
      } catch {
        return new Response('{}', { status: 504 })
      }
    }

    // Um modelo por vez (chamadas em paralelo gastam o dobro da cota grátis do Google).
    // Se um estiver sobrecarregado, sem cota ou travado, passa para o próximo.
    let r: Response = new Response('{}', { status: 504 })
    for (const modelo of fila) {
      r = await chamar(modelo, 8000)
      if (r.ok) {
        modeloOk = modelo
        break
      }
      if (r.status >= 500 || r.status === 429) continue
      const txt = await r.clone().text()
      if (!/unknown_model|not found|suitable provider|not supported|no longer available/i.test(txt)) break
    }
    if (!r.ok) {
      console.log('ERRO_GEMINI status=' + r.status + ' corpo=' + (await r.text()).slice(0, 300).replace(/\s+/g, ' '))
      const msg = r.status === 429 ? 'A demonstração atingiu o limite de uso por agora. Tente de novo em alguns minutos.' : 'Tive um problema para responder agora. Pode tentar de novo?'
      return { resposta: msg, acoes, status: r.status }
    }
    const dados: any = await r.json()
    const partes: any[] = dados?.candidates?.[0]?.content?.parts || []
    const chamadas = partes.filter((p) => p.functionCall)
    if (!chamadas.length) {
      const texto = partes.map((p) => p.text || '').join('').trim()
      return { resposta: texto || 'Desculpe, não entendi. Pode reformular?', acoes }
    }
    contents.push({ role: 'model', parts: partes })
    contents.push({
      role: 'user',
      parts: chamadas.map((p) => ({
        functionResponse: { name: p.functionCall.name, response: executar(p.functionCall.name, p.functionCall.args, ocupados, acoes) },
      })),
    })
  }
  return { resposta: 'Desculpe, me enrolei aqui. Pode repetir o que precisa?', acoes }
}

export async function atender(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ erro: 'Use POST.' }, 405)
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  if (limitado(ip)) return json({ resposta: 'Muitas mensagens em pouco tempo. Aguarde alguns minutos e tente de novo.', acoes: [] }, 429)

  let corpo: { mensagens?: Msg[]; agendados?: string[]; idioma?: string }
  try {
    corpo = await req.json()
  } catch {
    return json({ erro: 'JSON inválido.' }, 400)
  }
  const mensagens = (corpo.mensagens || []).slice(-MAX_MSGS).filter((m) => m && typeof m.texto === 'string' && (m.role === 'user' || m.role === 'assistente'))
  if (!mensagens.length || mensagens[mensagens.length - 1].role !== 'user') return json({ erro: 'Envie a mensagem do usuário.' }, 400)
  const ocupados = (corpo.agendados || []).filter((s) => typeof s === 'string').slice(0, 50)
  const { resposta, acoes } = await responder(mensagens, ocupados, 'site', corpo.idioma === 'en' ? 'en' : 'pt')
  return json({ resposta, acoes })
}
