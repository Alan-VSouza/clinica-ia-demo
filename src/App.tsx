import { useEffect } from 'react'
import Chat, { focarChat } from './Chat'
import { CLINICA } from '../shared/clinica'

function irParaChat(e?: React.MouseEvent) {
  e?.preventDefault()
  document.getElementById('atendimento')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setTimeout(focarChat, 450)
}

const servico = (id: string) => CLINICA.servicos.find((s) => s.id === id)!

const DESTAQUES = [
  { id: 'limpeza', foto: '/img/exame.jpg', alt: 'Dentista examinando os dentes de uma paciente com espelho clínico' },
  { id: 'clareamento', foto: '/img/sorriso.jpg', alt: 'Sorriso com dentes claros, de perfil' },
  { id: 'implante', foto: '/img/implante.jpg', alt: 'Modelo de implante dentário ao lado de dentes naturais' },
]
const OUTROS = ['restauracao', 'canal', 'ortodontia']

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
        Site de demonstração: a Clínica Sorriso Claro não existe. A assistente de IA é real. <a href="#para-empresas">Entenda</a>
      </p>

      <header className="topo">
        <a className="marca" href="/" aria-label="Sorriso Claro, início">
          <span className="selo" aria-hidden="true">sc</span>
          <span className="marca-nome">
            sorriso claro<small>Odontologia · São Carlos</small>
          </span>
        </a>
        <nav aria-label="Seções">
          <a href="#tratamentos">Tratamentos</a>
          <a href="#primeira-consulta">Primeira consulta</a>
          <a href="#convenios">Convênios</a>
          <a href="#visite">Como chegar</a>
        </nav>
        <a className="btn" href="#atendimento" onClick={irParaChat}>Agendar avaliação</a>
      </header>

      <section className="hero">
        <img className="hero-foto" src="/img/consultorio.jpg" alt="" width="1600" height="1070" />
        <div className="hero-dentro">
          <div className="hero-texto">
            <p className="rotulo claro">Odontologia no Centro de São Carlos</p>
            <h1>
              Seu sorriso.
              <br />
              Seu tempo.
              <br />
              <em>Nossa atenção.</em>
            </h1>
            <p className="lead">
              Tire dúvidas e marque sua avaliação agora com a Clara, nossa assistente. Ela conhece os tratamentos, os convênios e a agenda dos dentistas, e responde a qualquer hora.
            </p>
            <div className="hero-acoes">
              <a className="btn claro" href="#atendimento" onClick={irParaChat}>Conversar com a Clara</a>
              <a className="btn contorno" href="#tratamentos">Ver tratamentos</a>
            </div>
          </div>
          <div className="hero-chat" id="atendimento">
            <Chat />
          </div>
        </div>
      </section>

      <ul className="faixa" aria-label="Diferenciais">
        <li><strong>Atendimento sem pressa</strong><span>Consultas com hora marcada e tempo para conversar</span></li>
        <li><strong>Plano de tratamento claro</strong><span>Você entende cada etapa antes de começar</span></li>
        <li><strong>{CLINICA.convenios.length} convênios aceitos</strong><span>E atendimento particular com parcelamento</span></li>
      </ul>

      <main>
        <section id="tratamentos" className="bloco">
          <div className="cabeca">
            <div>
              <p className="rotulo">Tratamentos</p>
              <h2>Cuidado completo,<br />do jeito certo.</h2>
            </div>
            <p className="cabeca-texto">Da prevenção aos implantes, com um plano feito para você. Valores e convênios: pergunte à Clara, ela responde na hora.</p>
          </div>

          <div className="tratamentos">
            <article className="trat-grande">
              <img src="/img/consultorio.jpg" alt="Consultório com cadeira odontológica e janela ampla" loading="lazy" />
              <div>
                <h3>{servico('avaliacao').nome}</h3>
                <p>{servico('avaliacao').descricao} É o primeiro passo de qualquer tratamento.</p>
                <a className="link-seta" href="#atendimento" onClick={irParaChat}>Agendar avaliação</a>
              </div>
            </article>
            <div className="trat-lista">
              {DESTAQUES.map((d) => (
                <article key={d.id} className="trat-item">
                  <img src={d.foto} alt={d.alt} loading="lazy" />
                  <div>
                    <h3>{servico(d.id).nome}</h3>
                    <p>{servico(d.id).descricao}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <ul className="outros">
            {OUTROS.map((id) => (
              <li key={id}>
                <strong>{servico(id).nome}</strong>
                <span>{servico(id).descricao}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <section id="primeira-consulta" className="escuro">
        <div className="escuro-dentro">
          <p className="rotulo dourado">Primeira consulta</p>
          <h2>Começa com uma conversa.</h2>
          <ol className="passos">
            <li><span>1</span><strong>Você agenda</strong><p>Pelo chat com a Clara, a qualquer hora, ou pela recepção em horário comercial.</p></li>
            <li><span>2</span><strong>Avaliação</strong><p>O dentista examina, tira suas dúvidas e explica as opções, sem pressa.</p></li>
            <li><span>3</span><strong>Plano de tratamento</strong><p>Você recebe as etapas, prazos e formas de pagamento por escrito antes de decidir.</p></li>
          </ol>
          <a className="btn claro" href="#atendimento" onClick={irParaChat}>Agendar minha avaliação</a>
        </div>
      </section>

      <main>
        <section id="convenios" className="bloco duas">
          <div>
            <p className="rotulo">Convênios e pagamento</p>
            <h2>Cuidado com possibilidades.</h2>
            <ul className="convenios">
              {CLINICA.convenios.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <p className="nota">{CLINICA.pagamento}</p>
          </div>
          <div>
            <p className="rotulo">Equipe</p>
            <h2>Quem cuida de você.</h2>
            <ul className="equipe">
              {CLINICA.equipe.map((e) => (
                <li key={e.nome}><strong>{e.nome}</strong><span>{e.area}</span></li>
              ))}
            </ul>
            <p className="nota">Profissionais fictícios desta demonstração.</p>
          </div>
        </section>

        <section id="visite" className="bloco visite">
          <img src="/img/recepcao.jpg" alt="Sala de espera clara com cadeiras pretas e uma oliveira" loading="lazy" />
          <div>
            <p className="rotulo">Como chegar</p>
            <h2>Venha conhecer.</h2>
            <p className="endereco">{CLINICA.endereco}</p>
            <p className="nota">{CLINICA.estacionamento}</p>
            <dl className="horas">
              <div><dt>Segunda a sexta</dt><dd>8h às 18h</dd></div>
              <div><dt>Sábado</dt><dd>8h às 12h</dd></div>
              <div><dt>Domingo e feriados</dt><dd>Fechado</dd></div>
            </dl>
            <p className="nota"><strong>Urgência:</strong> {CLINICA.urgencia}</p>
            <a className="btn" href="#atendimento" onClick={irParaChat}>Ver horários livres</a>
          </div>
        </section>
      </main>

      <section id="para-empresas" className="empresas">
        <div className="empresas-dentro">
          <p className="rotulo dourado">Para donos de clínicas, consultórios e comércios</p>
          <h2>Esta clínica não existe.<br /><em>O atendimento, sim.</em></h2>
          <p className="lead">
            A Clara é uma assistente de IA feita sob medida. Ela atende no site e no WhatsApp, responde só com as informações do seu negócio e marca horários conferindo a agenda de verdade.
          </p>
          <ul className="empresas-lista">
            <li><strong>Não inventa.</strong>Preço, convênio e horário vêm do seu cadastro. Se não souber, passa para a recepção em vez de chutar.</li>
            <li><strong>Agenda conferida.</strong>O sistema valida cada horário antes de confirmar. Nada de consulta marcada em cima de outra.</li>
            <li><strong>Sua equipe no controle.</strong>Consultas marcadas e pedidos de atendimento humano chegam num painel. <a href="/painel">Veja o painel desta demo</a>.</li>
          </ul>
          <a className="btn claro" href="https://alansouza.netlify.app" target="_blank" rel="noreferrer">Quero um atendimento assim</a>
          <p className="assinatura">Projeto de Alan Souza, desenvolvedor de IA em São Carlos.</p>
        </div>
      </section>

      <footer className="rodape">
        Clínica Sorriso Claro é um negócio fictício criado para demonstração. Fotos: Unsplash.
      </footer>

      <a className="flutuante" href="#atendimento" onClick={irParaChat}>Conversar com a Clara</a>
    </>
  )
}
