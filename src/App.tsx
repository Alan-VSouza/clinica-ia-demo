import { useEffect, useMemo } from 'react'
import Chat from './Chat'
import { iniciarPolimento } from './polimento'
import { CLINICA, horariosLivres } from '../shared/clinica'

const KIT = ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js']

function usarKit() {
  useEffect(() => {
    if (document.querySelector('script[data-kit]')) return
    for (const src of KIT) {
      const el = document.createElement('script')
      el.type = 'module'
      el.src = src
      el.dataset.kit = ''
      document.head.appendChild(el)
    }
  }, [])
}

function proximoHorario() {
  const h = horariosLivres()[0]
  if (!h) return null
  const fmt = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d)
  const dia = h.data === fmt(new Date()) ? 'Hoje' : h.data === fmt(new Date(Date.now() + 86400000)) ? 'Amanhã' : h.diaSemana[0].toUpperCase() + h.diaSemana.slice(1)
  return { dia, hora: String(Number(h.hora.slice(0, 2))) + 'h' }
}

const TRATAMENTOS: [string, string][] = [
  ['Limpeza e flúor', 'Placa e tártaro, polimento, 60 minutos'],
  ['Clareamento dental', 'De consultório ou caseiro, com moldeira'],
  ['Restauração em resina', 'Cárie e pequenas fraturas'],
  ['Tratamento de canal', 'Valor definido na avaliação'],
  ['Aparelho ortodôntico', 'Fixo ou alinhador, com manutenção mensal'],
  ['Implante dentário', 'Planejado com exame de imagem'],
]


const PREVIA: [string, string, string, string][] = [
  ['22:41', 'Ana P.', 'Avaliação, Amil Dental', 'Seg 9h'],
  ['23:15', 'Rafael M.', 'Limpeza, particular', 'Seg 14h'],
  ['06:52', 'Júlia S.', 'Clareamento, particular', 'Ter 10h'],
]

function PainelPrevia() {
  return (
    <div className="previa span-6 start-7" data-visual aria-label="Exemplo do painel da recepção">
      <div className="previa__barra"><span className="previa__pontos" aria-hidden="true"><i /><i /><i /></span><span>Painel da recepção, exemplo</span></div>
      <div className="previa__corpo">
        <div className="previa__resumo">
          <div><strong>3</strong><span>consultas marcadas fora do horário</span></div>
          <div><strong>1</strong><span>conversa para a recepção</span></div>
        </div>
        <p className="previa__titulo">Marcadas pela Clara esta noite</p>
        <ul className="previa__lista">
          {PREVIA.map(([quando, nome, servico, dia]) => (
            <li key={nome}><span className="previa__hora">{quando}</span><span className="previa__nome">{nome}<small>{servico}</small></span><span className="previa__dia">{dia}</span></li>
          ))}
        </ul>
        <p className="previa__titulo">Para a recepção responder</p>
        <div className="previa__pedido"><strong>Dor forte desde ontem</strong><span>Pediu encaixe hoje. A Clara não deu diagnóstico e avisou a recepção.</span></div>
      </div>
    </div>
  )
}

export default function App() {
  usarKit()
  useEffect(() => iniciarPolimento(), [])
  const proximo = useMemo(proximoHorario, [])

  return (
    <>
      <header className="nav">
        <div className="wrap nav__bar">
          <a className="skip-link" href="#top">Pular para o conteúdo</a>
          <a className="nav__logo" href="#top">Sorriso Claro</a>
          <nav className="nav__links" aria-label="Principal">
            <div className="nav__item">
              <a className="nav__link" href="#tratamentos">Tratamentos <svg className="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
              <div className="nav__menu">
                <div className="wrap grid">
                  <div className="menu-col span-3">
                    <p className="t-label">Prevenção</p>
                    <a href="#tratamentos">Limpeza<span>Placa e tártaro, 60 min</span></a>
                    <a href="#tratamentos">Clareamento<span>Consultório ou caseiro</span></a>
                  </div>
                  <div className="menu-col span-3">
                    <p className="t-label">Tratamento</p>
                    <a href="#tratamentos">Canal e restauração<span>Valor na avaliação</span></a>
                    <a href="#tratamentos">Implante<span>Com exame de imagem</span></a>
                  </div>
                  <a className="menu-card span-3 start-10" href="#primeira-consulta">
                    <div className="panel"><img className="frame__img" src="/img/implante.jpg" alt="Modelo de implante dentário entre dentes de resina" /></div>
                    <span className="t-card">Avaliação sem custo</span>
                    <span className="t-small muted">30 minutos, com plano por escrito</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="nav__item"><a className="nav__link" href="#primeira-consulta">Consulta</a></div>
            <div className="nav__item"><a className="nav__link" href="#visite">Convênios</a></div>
            <div className="nav__item"><a className="nav__link" href="#para-empresas">Empresas</a></div>
          </nav>
          <div className="nav__actions">
            <a className="btn btn--primary" href="#agendar">Marcar consulta com a Clara</a>
          </div>
          <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero hero--split" data-enter aria-labelledby="hero-h">
          <div className="wrap"><div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <p className="hero__kicker"><span className="dot" aria-hidden="true" />Demonstração: clínica fictícia, assistente real</p>
              <h1 id="hero-h">Clínica odontológica no Centro de São Carlos</h1>
              <p className="hero__lead">A Clara tira dúvidas, confere seu convênio e marca a consulta. Avaliação inicial sem custo.</p>
              <div className="btn-row">
                <a className="btn btn--primary" href="#agendar">Marcar consulta com a Clara</a>
                <a className="btn btn--secondary" href="#tratamentos">Ver tratamentos</a>
              </div>
            </div>
            <div className="hero__media span-6 start-7">
              <img src="/img/conversa.jpg" alt="Dentista conversando com uma paciente sentada na cadeira do consultório" style={{ ['--ly-pos' as string]: '45% 50%' }} {...{ fetchpriority: 'high' }} />
              {proximo && (
                <div className="ly-float">
                  <div className="ly-float__row"><span className="ly-live">{proximo.dia}</span><span>{proximo.hora}</span></div>
                  <div className="ly-float__title">Próximo horário livre para avaliação</div>
                </div>
              )}
            </div>
          </div></div>
        </section>

        <section className="section" id="agendar" aria-labelledby="agendar-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid fill">
              <div className="span-5 stack-4">
                <h2 id="agendar-h">Consulta marcada pelo chat da Clara</h2>
                <p className="t-lead">Pergunte como falaria com a recepção: se o convênio cobre limpeza, quanto custa um clareamento ou o primeiro horário de sábado.</p>
                <p>Dor forte, inchaço ou sangramento têm encaixe no mesmo dia em horário comercial. A Clara não dá diagnóstico: ela marca a consulta.</p>
              </div>
              <div className="span-6 start-7 chat-frame" id="atendimento" data-visual data-ui="clara">
                <Chat />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="tratamentos" aria-labelledby="tratamentos-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid grid--top fill">
              <div className="span-5 stack-4">
                <h2 id="tratamentos-h">Tratamentos da clínica</h2>
                <p>Valores na avaliação, que é sem custo. Pagamento em até 6x sem juros acima de R$ 600.</p>
                <ul className="rows">
                  {TRATAMENTOS.map(([nome, linha]) => (
                    <li key={nome}><span className="rows__name">{nome}<small>{linha}</small></span></li>
                  ))}
                </ul>
              </div>
              <div className="frame frame--photo frame--fill span-6 start-7 foto-trat">
                <img className="frame__img" src="/img/exame.jpg" alt="Dentista examinando os dentes de um paciente com espelho" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="primeira-consulta" aria-labelledby="primeira-consulta-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="section-head"><h2 id="primeira-consulta-h">Primeira consulta em 3 etapas</h2></div>
            <div className="grid">
              <article className="card card--row span-4">
                <span className="step-num">1</span>
                <h3>Avaliação de 30 minutos</h3>
                <p>Exame clínico e, quando precisa, radiografia. Sem custo e sem compromisso.</p>
                <div className="panel"><img className="frame__img" src="/img/raio-x.jpg" alt="Dentista analisando radiografias num painel de luz" loading="lazy" /></div>
              </article>
              <article className="card card--row span-4">
                <span className="step-num">2</span>
                <h3>Plano da clínica por escrito</h3>
                <p>Cada procedimento, o número de sessões e o valor, antes de começar.</p>
                <div className="panel"><img className="frame__img" src="/img/tomografia.jpg" alt="Mão de luva apontando uma tomografia dentária num tablet" loading="lazy" /></div>
              </article>
              <article className="card card--row span-4">
                <span className="step-num">3</span>
                <h3>Tratamento com lembrete</h3>
                <p>A Clara confirma cada sessão pelo WhatsApp um dia antes.</p>
                <div className="panel"><img className="frame__img" src="/img/cadeira.jpg" alt="Cadeira odontológica branca num consultório claro" loading="lazy" /></div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="visite" aria-labelledby="visite-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid grid--top fill">
              <div className="span-5 stack-4">
                <h2 id="visite-h">Endereço, horários e convênios</h2>
                <address className="visit__address">Centro<br />São Carlos</address>
                <a className="link" href="https://www.openstreetmap.org/search?query=Centro%20S%C3%A3o%20Carlos">Ver a região no mapa</a>
                <dl className="hours" data-tz="America/Sao_Paulo" data-assumed="">
                  <dt data-days="mon-fri">Segunda a sexta</dt><dd>8h às 18h</dd>
                  <dt data-days="sat">Sábado</dt><dd>8h às 12h</dd>
                  <dt data-days="sun">Domingo e feriados</dt><dd>Fechado</dd>
                </dl>
                <p>Convênios: {CLINICA.convenios.join(', ')}.</p>
                <p>{CLINICA.estacionamento}</p>
              </div>
              <figure className="develop span-6 start-7" data-moment="picture-develops"><img src="/img/recepcao.jpg" alt="Sala de espera clara com cadeiras pretas e uma oliveira" width="1600" height="1872" loading="lazy" /></figure>
            </div>
          </div>
        </section>

        <section className="section" id="para-empresas" aria-labelledby="para-empresas-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap grid grid--top">
            <div className="span-6 stack-4">
              <p className="t-label">Para dentistas e clínicas</p>
              <h2 id="para-empresas-h">Uma Clara para a sua clínica</h2>
              <p>A Sorriso Claro é fictícia; a Clara, não. Ela atende no site e no WhatsApp com os seus tratamentos, convênios e horários.</p>
              <ul className="rows">
                <li><span className="rows__name">Paciente atendido na hora</span><p>Quem escreve às 22h já sai com a avaliação marcada.</p></li>
                <li><span className="rows__name">Só o que está no cadastro</span><p>Se não souber, ela passa para a recepção. Não inventa preço.</p></li>
                <li><span className="rows__name">Painel para a recepção</span><p>Consultas marcadas e pedidos de atendimento num só lugar. <a className="link" href="/painel">Abrir o painel desta demo</a></p></li>
              </ul>
              <div className="btn-row">
                <a className="btn btn--primary" href="https://alansouza.netlify.app" target="_blank" rel="noreferrer">Quero uma Clara na minha clínica</a>
              </div>
              <p className="t-small muted">Projeto de Alan Souza, desenvolvedor de IA em São Carlos.</p>
            </div>
            <PainelPrevia />
          </div>
        </section>
      </main>

      <footer className="footer closing" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--photo">
            <div className="section-head--split">
              <div><h2 id="close-h">Avaliação inicial sem custo</h2><p className="t-lead">Segunda a sexta, 8h às 18h. Sábado, 8h às 12h.</p></div>
              <a className="btn btn--primary" href="#agendar">Marcar consulta com a Clara</a>
            </div>
            <div className="close__media"><img src="/img/consultorio.jpg" alt="Consultório odontológico claro com cadeira e bancada" loading="lazy" /></div>
          </div>
          <div className="closing__links">
            <div className="grid">
              <div className="span-4 stack-4">
                <a className="nav__logo" href="#top">Sorriso Claro</a>
                <p className="footer__lede">Clínica odontológica fictícia, criada para demonstrar uma assistente de IA.</p>
              </div>
              <div className="span-2 footer__col"><h3>Clínica</h3><ul><li><a href="#tratamentos">Tratamentos</a></li><li><a href="#primeira-consulta">Consulta</a></li></ul></div>
              <div className="span-2 footer__col"><h3>Visite</h3><ul><li><a href="#visite">Convênios</a></li></ul></div>
              <div className="span-2 footer__col"><h3>Agenda</h3><ul><li><a href="#atendimento">Chat com a Clara</a></li><li><a href="/painel">Painel</a></li></ul></div>
              <div className="span-2 footer__col"><h3>Empresas</h3><ul><li><a href="#para-empresas">Como funciona</a></li></ul></div>
            </div>
            <div className="footer__legal">
              <span>&copy; 2026 Clínica Sorriso Claro, negócio fictício</span>
              <div className="socials" />
              <span className="credits">Fotos via Unsplash</span>
            </div>
          </div>
        </div>
      </footer>

      <nav className="actionbar" aria-label="Ações rápidas">
        <a className="btn btn--primary" href="#agendar">Marcar consulta com a Clara</a>
      </nav>
    </>
  )
}
