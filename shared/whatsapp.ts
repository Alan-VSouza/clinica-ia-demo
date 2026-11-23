import { createHmac, timingSafeEqual } from 'node:crypto'
import { limitado, responder, type Acao, type Msg } from './agente.js'

// Clara no WhatsApp pela API oficial da Meta (WhatsApp Cloud API).
// Variáveis no Vercel:
//   WHATSAPP_TOKEN            token de acesso do app da Meta (obrigatória)
//   WHATSAPP_PHONE_NUMBER_ID  id do número que envia (obrigatória)
//   WHATSAPP_VERIFY_TOKEN     frase qualquer, igual à digitada no painel da Meta (obrigatória)
//   WHATSAPP_APP_SECRET       chave secreta do app; confere que a mensagem veio mesmo da Meta (recomendada)
//   WHATSAPP_RECEPCAO         número que recebe os avisos de agendamento e de transferência (opcional, ex. 5519999999999)
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  guardam as conversas entre execuções (opcional)

const VERSAO = process.env.WHATSAPP_API_VERSION || 'v23.0'
const MAX_HIST = 20
const VIDA_CONVERSA = 6 * 60 * 60 // segundos: depois de 6h sem falar, a conversa recomeça

type Conversa = { mensagens: Msg[]; ocupados: string[] }

// ---------- memória das conversas ----------
// Sem Redis, fica na memória da função: funciona enquanto ela está quente (bom para demonstração).
const memoria = new Map<string, { c: Conversa; ate: number }>()
const vistas = new Map<string, number>()
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisTok = process.env.UPSTASH_REDIS_REST_TOKEN

async function redis(...cmd: (string | number)[]): Promise<any> {
  const r = await fetch(redisUrl!, { method: 'POST', headers: { authorization: `Bearer ${redisTok}` }, body: JSON.stringify(cmd) })
  return (await r.json())?.result
}

async function lerConversa(numero: string): Promise<Conversa> {
  if (redisUrl && redisTok) {
    try {
      const v = await redis('GET', `wa:${numero}`)
      if (v) return JSON.parse(v)
    } catch (e) {
      console.log('REDIS_FALHOU leitura', String(e))
    }
  }
  const m = memoria.get(numero)
  return m && m.ate > Date.now() ? m.c : { mensagens: [], ocupados: [] }
}

async function salvarConversa(numero: string, c: Conversa) {
  c.mensagens = c.mensagens.slice(-MAX_HIST)
  memoria.set(numero, { c, ate: Date.now() + VIDA_CONVERSA * 1000 })
  if (redisUrl && redisTok) {
    try {
      await redis('SET', `wa:${numero}`, JSON.stringify(c), 'EX', VIDA_CONVERSA)
    } catch (e) {
      console.log('REDIS_FALHOU escrita', String(e))
    }
  }
}

// A Meta reenvia o aviso se demorarmos; cada mensagem é respondida uma vez só.
async function jaVista(id: string): Promise<boolean> {
  const agora = Date.now()
  for (const [k, t] of vistas) if (agora - t > 60 * 60_000) vistas.delete(k)
  if (vistas.has(id)) return true
  vistas.set(id, agora)
  if (redisUrl && redisTok) {
    try {
      return (await redis('SET', `wa:msg:${id}`, 1, 'NX', 'EX', 86400)) === null
    } catch {
      /* sem Redis, vale a memória */
    }
  }
  return false
}

// ---------- envio ----------
// Celular brasileiro às vezes chega sem o 9 (55 19 9xxxx-xxxx vira 55 19 xxxx-xxxx).
function com9(numero: string) {
  return /^55\d{10}$/.test(numero) && /[6-9]/.test(numero[4]) ? numero.slice(0, 4) + '9' + numero.slice(4) : null
}

export async function enviarTexto(para: string, texto: string): Promise<boolean> {
  const tentar = (n: string) =>
    fetch(`https://graph.facebook.com/${VERSAO}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: n, type: 'text', text: { preview_url: false, body: texto.slice(0, 4000) } }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => new Response('{"error":{"message":"rede"}}', { status: 599 }))
  let r = await tentar(para)
  if (!r.ok) {
    const erro = await r.text()
    const alt = com9(para)
    if (alt && /131030|allowed list|not a valid/i.test(erro)) {
      r = await tentar(alt)
      if (r.ok) return true
    }
    console.log('WHATSAPP_ENVIO_FALHOU ' + r.status + ' ' + erro.slice(0, 300).replace(/\s+/g, ' '))
    return false
  }
  return true
}

function marcarLida(id: string) {
  return fetch(`https://graph.facebook.com/${VERSAO}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', status: 'read', message_id: id }),
    signal: AbortSignal.timeout(4000),
  }).catch(() => null)
}

// O modelo às vezes escreve **assim**; no WhatsApp o negrito é *assim*.
export function paraWhatsapp(texto: string) {
  return texto.replace(/\*\*(.+?)\*\*/g, '*$1*').replace(/^#+\s*/gm, '').trim()
}

function dataBR(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function avisoRecepcao(a: Acao, numero: string, nomeContato: string) {
  const quem = `${nomeContato || 'Paciente'} (+${numero})`
  if (a.tipo === 'agendamento') return `📅 *Novo agendamento pela Clara*\n${a.servico}\n${dataBR(a.data)} às ${a.hora}\nNome: ${a.nome}\nWhatsApp: ${quem}\nProtocolo: ${a.protocolo}`
  return `🙋 *Paciente pediu a recepção*\nMotivo: ${a.motivo}\nResumo: ${a.resumo}\nWhatsApp: ${quem}`
}

// ---------- uma mensagem recebida ----------
async function tratar(msg: any, nomeContato: string) {
  const numero = String(msg.from || '')
  if (!numero || !msg.id || (await jaVista(msg.id))) return
  void marcarLida(msg.id)

  if (limitado('wa:' + numero, 30)) return void (await enviarTexto(numero, 'Recebi muitas mensagens seguidas. Me dá uns minutinhos e escreve de novo, por favor.'))

  let texto = ''
  if (msg.type === 'text') texto = String(msg.text?.body || '')
  else if (msg.type === 'interactive') texto = String(msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '')
  else if (msg.type === 'button') texto = String(msg.button?.text || '')
  if (!texto.trim()) {
    await enviarTexto(numero, 'Por enquanto eu só consigo ler mensagens de texto. Pode me escrever o que precisa? 🙂')
    return
  }

  if (/^\s*(reiniciar|recomeçar|recomecar|reset)\s*$/i.test(texto)) {
    await salvarConversa(numero, { mensagens: [], ocupados: [] })
    await enviarTexto(numero, 'Pronto, conversa reiniciada. Oi! Sou a Clara, da Clínica Sorriso Claro. Como posso ajudar?')
    return
  }

  const conversa = await lerConversa(numero)
  conversa.mensagens.push({ role: 'user', texto: texto.slice(0, 600) })
  const { resposta, acoes, status } = await responder(conversa.mensagens, conversa.ocupados, 'whatsapp')
  const final = paraWhatsapp(resposta)
  // falha do Gemini não entra no histórico, para a próxima tentativa sair limpa
  if (status) conversa.mensagens.pop()
  else conversa.mensagens.push({ role: 'assistente', texto: final })
  await salvarConversa(numero, conversa)
  await enviarTexto(numero, final)

  const recepcao = (process.env.WHATSAPP_RECEPCAO || '').replace(/\D/g, '')
  if (recepcao && recepcao !== numero) for (const a of acoes) await enviarTexto(recepcao, avisoRecepcao(a, numero, nomeContato))
}

// ---------- assinatura da Meta ----------
function assinaturaOk(bruto: string, cabecalho: string | null) {
  const segredo = process.env.WHATSAPP_APP_SECRET
  if (!segredo) return true
  if (!cabecalho?.startsWith('sha256=')) return false
  const esperado = Buffer.from('sha256=' + createHmac('sha256', segredo).update(bruto, 'utf8').digest('hex'))
  const recebido = Buffer.from(cabecalho)
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido)
}

export async function webhook(req: Request): Promise<Response> {
  // 1) a Meta confere o endereço uma vez, quando você salva o webhook no painel
  if (req.method === 'GET') {
    const u = new URL(req.url)
    const ok = u.searchParams.get('hub.mode') === 'subscribe' && !!process.env.WHATSAPP_VERIFY_TOKEN && u.searchParams.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN
    return ok ? new Response(u.searchParams.get('hub.challenge') || '', { status: 200 }) : new Response('Token de verificação não confere.', { status: 403 })
  }
  if (req.method !== 'POST') return new Response('Use POST.', { status: 405 })

  // 2) mensagens chegando
  const bruto = await req.text()
  if (!assinaturaOk(bruto, req.headers.get('x-hub-signature-256'))) return new Response('Assinatura inválida.', { status: 401 })
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log('WHATSAPP sem WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID configurados')
    return new Response('ok')
  }
  let corpo: any
  try {
    corpo = JSON.parse(bruto)
  } catch {
    return new Response('JSON inválido.', { status: 400 })
  }
  const tarefas: Promise<void>[] = []
  for (const entrada of corpo?.entry || []) {
    for (const mud of entrada?.changes || []) {
      const v = mud?.value
      if (!v?.messages) continue // avisos de "entregue/lida" não precisam de resposta
      const nomes = new Map<string, string>((v.contacts || []).map((c: any) => [c.wa_id, c.profile?.name || '']))
      for (const m of v.messages) tarefas.push(tratar(m, nomes.get(m.from) || '').catch((e) => console.log('WHATSAPP_ERRO', String(e))))
    }
  }
  await Promise.all(tarefas)
  return new Response('ok')
}
