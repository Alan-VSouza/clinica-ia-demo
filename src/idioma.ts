// Idioma da página: ?lang=en ou ?lang=pt no endereço; depois a última escolha; senão, o idioma do navegador.
// Quem não tem o navegador em português vê a versão em inglês.

export type Idioma = 'pt' | 'en'

function descobrir(): Idioma {
  const daUrl = new URLSearchParams(window.location.search).get('lang')
  if (daUrl === 'en' || daUrl === 'pt') {
    try { localStorage.setItem('demo-clinica:lang', daUrl) } catch { /* modo privado */ }
    return daUrl
  }
  try {
    const salvo = localStorage.getItem('demo-clinica:lang')
    if (salvo === 'en' || salvo === 'pt') return salvo
  } catch { /* modo privado */ }
  return (navigator.languages?.[0] || navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export const idioma: Idioma = descobrir()
export const emIngles = idioma === 'en'
export const locale = emIngles ? 'en-US' : 'pt-BR'

/** O texto em português e, ao lado, o mesmo em inglês. */
export const tr = (pt: string, en: string) => (emIngles ? en : pt)

// Nomes dos serviços em inglês (os dados da clínica estão em português).
const SERVICOS_EN: Record<string, string> = {
  'Avaliação inicial': 'Initial check-up',
  'Limpeza (profilaxia)': 'Cleaning',
  'Clareamento dental': 'Teeth whitening',
  'Restauração em resina': 'Composite filling',
  'Tratamento de canal': 'Root canal',
  'Aparelho ortodôntico': 'Orthodontic braces',
  'Implante dentário': 'Dental implant',
}
export const nomeServico = (pt: string) => (emIngles ? SERVICOS_EN[pt] || pt : pt)

/** Endereço da mesma página no outro idioma (mantém a âncora). */
export function linkOutroIdioma() {
  const u = new URL(window.location.href)
  u.searchParams.set('lang', emIngles ? 'pt' : 'en')
  return u.pathname + u.search + u.hash
}

export function aplicarIdiomaNoDocumento(titulo: [string, string], descricao: [string, string]) {
  document.documentElement.lang = emIngles ? 'en' : 'pt-BR'
  document.title = tr(...titulo)
  document.querySelector('meta[name="description"]')?.setAttribute('content', tr(...descricao))
}
