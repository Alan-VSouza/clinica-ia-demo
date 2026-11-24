import { useEffect, useMemo } from 'react'
import Chat from './Chat'
import { iniciarPolimento } from './polimento'
import { CLINICA, horariosLivres } from '../shared/clinica'
import { emIngles, linkOutroIdioma, locale, tr } from './idioma'

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
  const semana = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(new Date(h.data + 'T12:00:00Z'))
  const dia = h.data === fmt(new Date()) ? tr('Hoje', 'Today') : h.data === fmt(new Date(Date.now() + 86400000)) ? tr('Amanhã', 'Tomorrow') : semana[0].toUpperCase() + semana.slice(1).replace('-feira', '')
  const n = Number(h.hora.slice(0, 2))
  return { dia, hora: emIngles ? `${n > 12 ? n - 12 : n} ${n >= 12 ? 'PM' : 'AM'}` : n + 'h' }
}

const TRATAMENTOS: [string, string][] = emIngles
  ? [
      ['Cleaning and fluoride', 'Plaque and tartar, polishing, 60 minutes'],
      ['Teeth whitening', 'In-office or at home with a custom tray'],
      ['Composite filling', 'Cavities and small fractures'],
      ['Root canal', 'Price set at the check-up'],
      ['Orthodontic braces', 'Fixed braces or aligners, monthly follow-up'],
      ['Dental implant', 'Planned with imaging exams'],
    ]
  : [
      ['Limpeza e flúor', 'Placa e tártaro, polimento, 60 minutos'],
      ['Clareamento dental', 'De consultório ou caseiro, com moldeira'],
      ['Restauração em resina', 'Cárie e pequenas fraturas'],
      ['Tratamento de canal', 'Valor definido na avaliação'],
      ['Aparelho ortodôntico', 'Fixo ou alinhador, com manutenção mensal'],
      ['Implante dentário', 'Planejado com exame de imagem'],
    ]


const PREVIA: [string, string, string, string][] = emIngles
  ? [
      ['10:41 PM', 'Ana P.', 'Check-up, Amil Dental', 'Mon 9 AM'],
      ['11:15 PM', 'Rafael M.', 'Cleaning, private', 'Mon 2 PM'],
      ['6:52 AM', 'Júlia S.', 'Whitening, private', 'Tue 10 AM'],
    ]
  : [
      ['22:41', 'Ana P.', 'Avaliação, Amil Dental', 'Seg 9h'],
      ['23:15', 'Rafael M.', 'Limpeza, particular', 'Seg 14h'],
      ['06:52', 'Júlia S.', 'Clareamento, particular', 'Ter 10h'],
    ]

function PainelPrevia() {
  return (
    <div className="previa span-6 start-7" data-visual aria-label={tr('Exemplo do painel da recepção', 'Example of the front-desk dashboard')}>
      <div className="previa__barra"><span className="previa__pontos" aria-hidden="true"><i /><i /><i /></span><span>{tr('Painel da recepção, exemplo', 'Front-desk dashboard, example')}</span></div>
      <div className="previa__corpo">
        <div className="previa__resumo">
          <div><strong>3</strong><span>{tr('consultas marcadas fora do horário', 'appointments booked after hours')}</span></div>
          <div><strong>1</strong><span>{tr('conversa para a recepção', 'chat handed to the front desk')}</span></div>
        </div>
        <p className="previa__titulo">{tr('Marcadas pela Clara esta noite', 'Booked by Clara tonight')}</p>
        <ul className="previa__lista">
          {PREVIA.map(([quando, nome, servico, dia]) => (
            <li key={nome}><span className="previa__hora">{quando}</span><span className="previa__nome">{nome}<small>{servico}</small></span><span className="previa__dia">{dia}</span></li>
          ))}
        </ul>
        <p className="previa__titulo">{tr('Para a recepção responder', 'For the front desk to answer')}</p>
        <div className="previa__pedido"><strong>{tr('Dor forte desde ontem', 'Severe pain since yesterday')}</strong><span>{tr('Pediu encaixe hoje. A Clara não deu diagnóstico e avisou a recepção.', 'Asked to be seen today. Clara gave no diagnosis and alerted the front desk.')}</span></div>
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
          <a className="skip-link" href="#top">{tr('Pular para o conteúdo', 'Skip to content')}</a>
          <a className="nav__logo" href="#top">Sorriso Claro</a>
          <nav className="nav__links" aria-label={tr('Principal', 'Main')}>
            <div className="nav__item">
              <a className="nav__link" href="#tratamentos">{tr('Tratamentos', 'Treatments')} <svg className="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
              <div className="nav__menu">
                <div className="wrap grid">
                  <div className="menu-col span-3">
                    <p className="t-label">{tr('Prevenção', 'Prevention')}</p>
                    <a href="#tratamentos">{tr('Limpeza', 'Cleaning')}<span>{tr('Placa e tártaro, 60 min', 'Plaque and tartar, 60 min')}</span></a>
                    <a href="#tratamentos">{tr('Clareamento', 'Whitening')}<span>{tr('Consultório ou caseiro', 'In-office or at home')}</span></a>
                  </div>
                  <div className="menu-col span-3">
                    <p className="t-label">{tr('Tratamento', 'Treatment')}</p>
                    <a href="#tratamentos">{tr('Canal e restauração', 'Root canal and fillings')}<span>{tr('Valor na avaliação', 'Price at the check-up')}</span></a>
                    <a href="#tratamentos">{tr('Implante', 'Implants')}<span>{tr('Com exame de imagem', 'With imaging exams')}</span></a>
                  </div>
                  <a className="menu-card span-3 start-10" href="#primeira-consulta">
                    <div className="panel"><img className="frame__img" src="/img/implante.jpg" alt={tr('Modelo de implante dentário entre dentes de resina', 'Dental implant model between resin teeth')} /></div>
                    <span className="t-card">{tr('Avaliação sem custo', 'Free check-up')}</span>
                    <span className="t-small muted">{tr('30 minutos, com plano por escrito', '30 minutes, with a written plan')}</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="nav__item"><a className="nav__link" href="#primeira-consulta">{tr('Consulta', 'Check-up')}</a></div>
            <div className="nav__item"><a className="nav__link" href="#visite">{tr('Convênios', 'Dental plans')}</a></div>
            <div className="nav__item"><a className="nav__link" href="#para-empresas">{tr('Empresas', 'For businesses')}</a></div>
          </nav>
          <div className="nav__actions">
            <a className="btn btn--primary" href="#agendar">{tr('Marcar consulta com a Clara', 'Book with Clara')}</a>
            <a className="nav__lang" href={linkOutroIdioma()} hrefLang={emIngles ? 'pt-BR' : 'en'} aria-label={emIngles ? 'Ver em português' : 'View in English'}>{emIngles ? 'PT' : 'EN'}</a>
          </div>
          <a className="nav__lang nav__lang--phone" href={linkOutroIdioma()} hrefLang={emIngles ? 'pt-BR' : 'en'} aria-label={emIngles ? 'Ver em português' : 'View in English'}>{emIngles ? 'PT' : 'EN'}</a>
          <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero hero--split" data-enter aria-labelledby="hero-h">
          <div className="wrap"><div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <p className="hero__kicker"><span className="dot" aria-hidden="true" />{tr('Demonstração: clínica fictícia, assistente real', 'Demo: fictional clinic, real AI assistant')}</p>
              <h1 id="hero-h">{tr('Clínica odontológica no Centro de São Carlos', 'Dental clinic in downtown São Carlos, Brazil')}</h1>
              <p className="hero__lead">{tr('A Clara tira dúvidas, confere seu convênio e marca a consulta. Avaliação inicial sem custo.', 'Clara answers questions, checks your dental plan and books the appointment. The first check-up is free.')}</p>
              <div className="btn-row">
                <a className="btn btn--primary" href="#agendar">{tr('Marcar consulta com a Clara', 'Book with Clara')}</a>
                <a className="btn btn--secondary" href="#tratamentos">{tr('Ver tratamentos', 'See treatments')}</a>
              </div>
            </div>
            <div className="hero__media span-6 start-7">
              <img src="/img/conversa.jpg" alt={tr('Dentista conversando com uma paciente sentada na cadeira do consultório', 'Dentist talking with a patient seated in the dental chair')} style={{ ['--ly-pos' as string]: '45% 50%' }} {...{ fetchpriority: 'high' }} />
              {proximo && (
                <div className="ly-float">
                  <div className="ly-float__row"><span className="ly-live">{proximo.dia}</span><span>{proximo.hora}</span></div>
                  <div className="ly-float__title">{tr('Próximo horário livre para avaliação', 'Next free check-up slot')}</div>
                </div>
              )}
            </div>
          </div></div>
        </section>

        <section className="section" id="agendar" aria-labelledby="agendar-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid fill">
              <div className="span-5 stack-4">
                <h2 id="agendar-h">{tr('Consulta marcada pelo chat da Clara', 'Appointments booked in a chat with Clara')}</h2>
                <p className="t-lead">{tr('Pergunte como falaria com a recepção: se o convênio cobre limpeza, quanto custa um clareamento ou o primeiro horário de sábado.', 'Ask the way you would ask the front desk: whether your plan covers a cleaning, what whitening costs, or the first slot on Saturday.')}</p>
                <p>{tr('Dor forte, inchaço ou sangramento têm encaixe no mesmo dia em horário comercial. A Clara não dá diagnóstico: ela marca a consulta.', 'Severe pain, swelling or bleeding get a same-day slot during office hours. Clara never gives a diagnosis: she books the visit.')}</p>
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
                <h2 id="tratamentos-h">{tr('Tratamentos da clínica', 'Treatments at the clinic')}</h2>
                <p>{tr('Valores na avaliação, que é sem custo. Pagamento em até 6x sem juros acima de R$ 600.', 'Prices are set at the check-up, which is free. Up to 6 interest-free installments on treatments over R$ 600.')}</p>
                <ul className="rows">
                  {TRATAMENTOS.map(([nome, linha]) => (
                    <li key={nome}><span className="rows__name">{nome}<small>{linha}</small></span></li>
                  ))}
                </ul>
              </div>
              <div className="frame frame--photo frame--fill span-6 start-7 foto-trat">
                <img className="frame__img" src="/img/exame.jpg" alt={tr('Dentista examinando os dentes de um paciente com espelho', "Dentist examining a patient's teeth with a mirror")} loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="primeira-consulta" aria-labelledby="primeira-consulta-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="section-head"><h2 id="primeira-consulta-h">{tr('Primeira consulta em 3 etapas', 'The first visit in 3 steps')}</h2></div>
            <div className="grid">
              <article className="card card--row span-4">
                <span className="step-num">1</span>
                <h3>{tr('Avaliação de 30 minutos', 'A 30-minute check-up')}</h3>
                <p>{tr('Exame clínico e, quando precisa, radiografia. Sem custo e sem compromisso.', 'A clinical exam and, when needed, an X-ray. Free, with no commitment.')}</p>
                <div className="panel"><img className="frame__img" src="/img/raio-x.jpg" alt={tr('Dentista analisando radiografias num painel de luz', 'Dentist reviewing X-rays on a light panel')} loading="lazy" /></div>
              </article>
              <article className="card card--row span-4">
                <span className="step-num">2</span>
                <h3>{tr('Plano da clínica por escrito', 'A written treatment plan')}</h3>
                <p>{tr('Cada procedimento, o número de sessões e o valor, antes de começar.', 'Every procedure, the number of sessions and the price, before anything starts.')}</p>
                <div className="panel"><img className="frame__img" src="/img/tomografia.jpg" alt={tr('Mão de luva apontando uma tomografia dentária num tablet', 'Gloved hand pointing at a dental scan on a tablet')} loading="lazy" /></div>
              </article>
              <article className="card card--row span-4">
                <span className="step-num">3</span>
                <h3>{tr('Tratamento com lembrete', 'Treatment with reminders')}</h3>
                <p>{tr('A Clara confirma cada sessão pelo WhatsApp um dia antes.', 'Clara confirms every session on WhatsApp the day before.')}</p>
                <div className="panel"><img className="frame__img" src="/img/cadeira.jpg" alt={tr('Cadeira odontológica branca num consultório claro', 'White dental chair in a bright treatment room')} loading="lazy" /></div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="visite" aria-labelledby="visite-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid grid--top fill">
              <div className="span-5 stack-4">
                <h2 id="visite-h">{tr('Endereço, horários e convênios', 'Address, hours and dental plans')}</h2>
                <address className="visit__address">{tr('Centro', 'Downtown')}<br />São Carlos</address>
                <a className="link" href="https://www.openstreetmap.org/search?query=Centro%20S%C3%A3o%20Carlos">{tr('Ver a região no mapa', 'See the area on a map')}</a>
                <dl className="hours" data-tz="America/Sao_Paulo" data-assumed="">
                  <dt data-days="mon-fri">{tr('Segunda a sexta', 'Monday to Friday')}</dt><dd>{tr('8h às 18h', '8 AM to 6 PM')}</dd>
                  <dt data-days="sat">{tr('Sábado', 'Saturday')}</dt><dd>{tr('8h às 12h', '8 AM to noon')}</dd>
                  <dt data-days="sun">{tr('Domingo e feriados', 'Sundays and holidays')}</dt><dd>{tr('Fechado', 'Closed')}</dd>
                </dl>
                <p>{tr('Convênios', 'Dental plans')}: {CLINICA.convenios.join(', ')}.</p>
                <p>{tr(CLINICA.estacionamento, 'Partner parking on the street behind, with the first hour free for patients.')}</p>
              </div>
              <figure className="develop span-6 start-7" data-moment="picture-develops"><img src="/img/recepcao.jpg" alt={tr('Sala de espera clara com cadeiras pretas e uma oliveira', 'Bright waiting room with black chairs and an olive tree')} width="1600" height="1872" loading="lazy" /></figure>
            </div>
          </div>
        </section>

        <section className="section" id="para-empresas" aria-labelledby="para-empresas-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap grid grid--top">
            <div className="span-6 stack-4">
              <p className="t-label">{tr('Para dentistas e clínicas', 'For clinics and businesses')}</p>
              <h2 id="para-empresas-h">{tr('Uma Clara para a sua clínica', 'A Clara for your business')}</h2>
              <p>{tr('A Sorriso Claro é fictícia; a Clara, não. Ela atende no site e no WhatsApp com os seus tratamentos, convênios e horários.', 'Sorriso Claro is fictional; Clara is not. She answers on the website and on WhatsApp, using your own services, prices and hours.')}</p>
              <ul className="rows">
                <li><span className="rows__name">{tr('Paciente atendido na hora', 'Answered right away')}</span><p>{tr('Quem escreve às 22h já sai com a avaliação marcada.', 'Someone who writes at 10 PM leaves with the appointment booked.')}</p></li>
                <li><span className="rows__name">{tr('Só o que está no cadastro', 'Only what is on record')}</span><p>{tr('Se não souber, ela passa para a recepção. Não inventa preço.', 'If she does not know, she hands over to a person. She never makes up a price.')}</p></li>
                <li><span className="rows__name">{tr('Painel para a recepção', 'A dashboard for the front desk')}</span><p>{tr('Consultas marcadas e pedidos de atendimento num só lugar.', 'Bookings and handover requests in one place.')} <a className="link" href={'/painel' + (emIngles ? '?lang=en' : '')}>{tr('Abrir o painel desta demo', "Open this demo's dashboard")}</a></p></li>
              </ul>
              <div className="btn-row">
                <a className="btn btn--primary" href={tr('https://wa.me/5519994450160?text=Oi%2C%20Alan%21%20Vi%20a%20demonstra%C3%A7%C3%A3o%20da%20Clara%20e%20quero%20uma%20assistente%20assim%20para%20a%20minha%20cl%C3%ADnica.', 'https://wa.me/5519994450160?text=Hi%20Alan%2C%20I%20saw%20the%20Clara%20demo%20and%20would%20like%20to%20talk%20about%20an%20AI%20assistant.')} target="_blank" rel="noreferrer">{tr('Quero uma Clara na minha clínica', 'Talk to Alan on WhatsApp')}</a>
              </div>
              <p className="t-small">{tr('Fala direto com o Alan Souza, desenvolvedor de IA em São Carlos, pelo WhatsApp.', 'Built by Alan Souza, a full-stack and AI developer in Brazil.')} <a className="link" href="https://alansouza.netlify.app" target="_blank" rel="noreferrer">{tr('Ver o portfólio', 'See the portfolio')}</a>{emIngles && <> · <a className="link" href="https://github.com/Alan-VSouza/clinica-ia-demo" target="_blank" rel="noreferrer">GitHub</a></>}</p>
            </div>
            <PainelPrevia />
          </div>
        </section>
      </main>

      <footer className="footer closing" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--photo">
            <div className="section-head--split">
              <div><h2 id="close-h">{tr('Avaliação inicial sem custo', 'The first check-up is free')}</h2><p className="t-lead">{tr('Segunda a sexta, 8h às 18h. Sábado, 8h às 12h.', 'Monday to Friday, 8 AM to 6 PM. Saturday, 8 AM to noon.')}</p></div>
              <a className="btn btn--primary" href="#agendar">{tr('Marcar consulta com a Clara', 'Book with Clara')}</a>
            </div>
            <div className="close__media"><img src="/img/consultorio.jpg" alt={tr('Consultório odontológico claro com cadeira e bancada', 'Bright dental office with a chair and counter')} loading="lazy" /></div>
          </div>
          <div className="closing__links">
            <div className="grid">
              <div className="span-4 stack-4">
                <a className="nav__logo" href="#top">Sorriso Claro</a>
                <p className="footer__lede">{tr('Clínica odontológica fictícia, criada para demonstrar uma assistente de IA.', 'A fictional dental clinic, made to demonstrate an AI assistant.')}</p>
              </div>
              <div className="span-2 footer__col"><h3>{tr('Clínica', 'Clinic')}</h3><ul><li><a href="#tratamentos">{tr('Tratamentos', 'Treatments')}</a></li><li><a href="#primeira-consulta">{tr('Consulta', 'Check-up')}</a></li></ul></div>
              <div className="span-2 footer__col"><h3>{tr('Visite', 'Visit')}</h3><ul><li><a href="#visite">{tr('Convênios', 'Dental plans')}</a></li></ul></div>
              <div className="span-2 footer__col"><h3>{tr('Agenda', 'Booking')}</h3><ul><li><a href="#atendimento">{tr('Chat com a Clara', 'Chat with Clara')}</a></li><li><a href={'/painel' + (emIngles ? '?lang=en' : '')}>{tr('Painel', 'Dashboard')}</a></li></ul></div>
              <div className="span-2 footer__col"><h3>{tr('Empresas', 'For businesses')}</h3><ul><li><a href="#para-empresas">{tr('Como funciona', 'How it works')}</a></li><li><a href={linkOutroIdioma()} hrefLang={emIngles ? 'pt-BR' : 'en'}>{emIngles ? 'Versão em português' : 'English version'}</a></li></ul></div>
            </div>
            <div className="footer__legal">
              <span>&copy; 2026 {tr('Clínica Sorriso Claro, negócio fictício', 'Sorriso Claro dental clinic, a fictional business')}</span>
              <div className="socials" />
              <span className="credits">{tr('Fotos via Unsplash', 'Photos via Unsplash')}</span>
            </div>
          </div>
        </div>
      </footer>

      <nav className="actionbar" aria-label={tr('Ações rápidas', 'Quick actions')}>
        <a className="btn btn--primary" href="#agendar">{tr('Marcar consulta com a Clara', 'Book with Clara')}</a>
      </nav>
    </>
  )
}
