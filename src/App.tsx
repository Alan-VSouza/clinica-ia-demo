import { useEffect } from 'react'
import Chat, { focarChat } from './Chat'
import { CLINICA } from '../shared/clinica'

function irParaChat(e?: React.MouseEvent) {
  e?.preventDefault()
  document.getElementById('atendimento')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setTimeout(focarChat, 450)
}

const DURACAO: Record<string, string> = {}
CLINICA.servicos.forEach((s) => (DURACAO[s.id] = s.duracao >= 60 ? '1 h' : `${s.duracao} min`))

export default function App() {
  useEffect(() => {
    const alvo = document.getElementById('atendimento')
    if (!alvo || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(([e]) => document.body.classList.toggle('chat-visivel', e.isIntersecting), { threshold: 0.15 })
    obs.observe(alvo)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <p className="aviso-demo">
        Site de demonstração: a Clínica Sorriso Claro não existe. A assistente de IA é real.{' '}
        <a href="#para-empresas">Entenda</a>
      </p>

      <header className="topo">
        <a className="marca" href="/" aria-label="Sorriso Claro, início">
          <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
            <rect width="40" height="40" rx="12" fill="var(--turquesa)" />
            <path d="M12.5 14.5c2.6-2.8 6-2 7.5-.2 1.5-1.8 4.9-2.6 7.5.2 2.4 2.7 1.1 8-1.2 13.2-.8 1.8-2.6 1.6-3-.2l-1.3-4.4c-.5-1.5-3.5-1.5-4 0l-1.3 4.4c-.4 1.8-2.2 2-3 .2-2.3-5.2-3.6-10.5-1.2-13.2z" fill="#fff" />
          </svg>
          <span>Sorriso Claro<small>Odontologia</small></span>
        </a>
        <nav aria-label="Seções">
          <a href="#valores">Valores</a>
          <a href="#convenios">Convênios</a>
          <a href="#visite">Como chegar</a>
        </nav>
        <a className="btn" href="#atendimento" onClick={irParaChat}>Marcar consulta</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-texto">
            <p className="rotulo">Odontologia no Centro de São Carlos</p>
            <h1>
              Pergunte o preço.
              <br />
              Marque o horário.
              <br />
              <em>Agora mesmo.</em>
            </h1>
            <p className="lead">
              A Clara, nossa assistente, conhece a tabela de valores, os convênios e a agenda dos dentistas. Ela responde em segundos, até de madrugada, e passa para a recepção quando você preferir falar com uma pessoa.
            </p>
            <dl className="fatos">
              <div><dt>Avaliação</dt><dd>gratuita</dd></div>
              <div><dt>Convênios</dt><dd>{CLINICA.convenios.length} aceitos</dd></div>
              <div><dt>Sábado</dt><dd>8h às 12h</dd></div>
            </dl>
          </div>

          <div className="hero-chat" id="atendimento">
            <Chat />
          </div>
        </section>

        <figure className="foto-larga">
          <img src="/img/consultorio.jpg" alt="Consultório claro com cadeira odontológica turquesa, bancada branca e janela ampla" width="1600" height="1070" />
          <figcaption>Consultórios com raio-x digital, esterilização em autoclave e atendimento com hora marcada.</figcaption>
        </figure>

        <section id="valores" className="bloco">
          <div className="bloco-cabeca">
            <h2>Tabela de valores</h2>
            <p>Preços particulares. O valor final de tratamentos maiores é definido na avaliação, que é gratuita.</p>
          </div>
          <table className="tabela-valores">
            <thead>
              <tr><th scope="col">Tratamento</th><th scope="col" className="so-largo">Tempo</th><th scope="col">Valor</th></tr>
            </thead>
            <tbody>
              {CLINICA.servicos.map((s) => (
                <tr key={s.id}>
                  <th scope="row">
                    {s.nome}
                    <span>{s.descricao}</span>
                  </th>
                  <td className="so-largo mono">{DURACAO[s.id]}</td>
                  <td className="mono valor">{s.preco}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="link-seta" href="#atendimento" onClick={irParaChat}>Tirar uma dúvida sobre valores com a Clara</a>
        </section>

        <section id="convenios" className="bloco duas-colunas">
          <div>
            <h2>Convênios</h2>
            <ul className="convenios">
              {CLINICA.convenios.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <p className="nota">Não achou o seu? Atendemos como particular, com parcelamento.</p>
          </div>
          <div>
            <h2>Pagamento</h2>
            <p>{CLINICA.pagamento}</p>
            <h2 className="espaco">Quem atende</h2>
            <ul className="equipe">
              {CLINICA.equipe.map((e) => (
                <li key={e.nome}><strong>{e.nome}</strong><span>{e.area}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section id="visite" className="bloco visite">
          <img src="/img/recepcao.jpg" alt="Sala de espera clara com cadeiras pretas e uma oliveira" loading="lazy" width="1600" height="1872" />
          <div>
            <h2>Venha conhecer</h2>
            <p className="endereco">{CLINICA.endereco}</p>
            <p>{CLINICA.estacionamento}</p>
            <dl className="horas">
              <div><dt>Segunda a sexta</dt><dd className="mono">08:00 – 18:00</dd></div>
              <div><dt>Sábado</dt><dd className="mono">08:00 – 12:00</dd></div>
              <div><dt>Domingo e feriados</dt><dd className="mono">fechado</dd></div>
            </dl>
            <p className="nota"><strong>Urgência:</strong> {CLINICA.urgencia}</p>
            <a className="btn" href="#atendimento" onClick={irParaChat}>Ver horários livres</a>
          </div>
        </section>
      </main>

      <section id="para-empresas" className="empresas">
        <div className="empresas-dentro">
          <p className="rotulo">Para donos de clínicas, consultórios e comércios</p>
          <h2>Esta clínica não existe.<br />O atendimento, sim.</h2>
          <p className="lead">
            A Clara é uma assistente de IA feita sob medida. Ela atende no site e no WhatsApp, responde só com as informações do seu negócio e marca horários conferindo a agenda de verdade.
          </p>
          <ul className="empresas-lista">
            <li><strong>Não inventa.</strong> Preço, convênio e horário vêm do seu cadastro. Se não souber, ela passa para a recepção em vez de chutar.</li>
            <li><strong>Agenda conferida.</strong> O sistema valida cada horário antes de confirmar. Não existe consulta marcada em cima de outra.</li>
            <li><strong>Sua equipe no controle.</strong> Consultas marcadas e pedidos de atendimento humano chegam num painel. <a href="/painel">Veja o painel desta demo</a>.</li>
          </ul>
          <a className="btn claro" href="https://alansouza.netlify.app" target="_blank" rel="noreferrer">Quero um atendimento assim</a>
          <p className="assinatura">Projeto de Alan Souza, desenvolvedor de IA em São Carlos.</p>
        </div>
      </section>

      <footer className="rodape">
        Clínica Sorriso Claro é um negócio fictício criado para demonstração. Fotos: Unsplash.
      </footer>

      <a className="flutuante" href="#atendimento" onClick={irParaChat}>Falar com a Clara</a>
    </>
  )
}
