import { useEffect, useState } from 'react'
import { formatarData, lerAgendamentos, lerTransferencias, limparTudo, type Agendamento, type Transferencia } from './store'
import { emIngles, locale, nomeServico, tr } from './idioma'

export default function Painel() {
  const [ag, setAg] = useState<Agendamento[]>([])
  const [pend, setTr] = useState<Transferencia[]>([])

  const carregar = () => {
    setAg(lerAgendamentos().sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)))
    setTr(lerTransferencias().reverse())
  }
  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 3000)
    return () => clearInterval(t)
  }, [])

  const hora = (iso: string) => new Date(iso).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="painel">
      <header className="painel-topo">
        <div>
          <p className="sobretitulo">Sorriso Claro · {tr('Recepção', 'Front desk')}</p>
          <h1>{tr('Painel do atendimento', 'Front-desk dashboard')}</h1>
          <p className="lead">{tr('O que a assistente fez no chat aparece aqui. Nesta demo os dados ficam só no seu navegador.', 'Everything the assistant did in the chat shows up here. In this demo the data stays in your browser only.')}</p>
        </div>
        <div className="painel-acoes">
          <a className="btn fantasma" href={emIngles ? '/?lang=en' : '/'}>{tr('Voltar ao site', 'Back to the site')}</a>
          <button className="btn fantasma" onClick={() => { limparTudo(); carregar() }}>{tr('Limpar demo', 'Clear demo')}</button>
        </div>
      </header>

      <div className="painel-resumo">
        <div><strong>{ag.length}</strong><span>{tr('consultas marcadas pela IA', 'appointments booked by the AI')}</span></div>
        <div><strong>{pend.length}</strong><span>{tr('conversas passadas à recepção', 'chats handed to the front desk')}</span></div>
      </div>

      <section className="painel-bloco">
        <h2>{tr('Consultas marcadas', 'Booked appointments')}</h2>
        {ag.length === 0 ? (
          <p className="vazio">{tr('Nenhuma ainda.', 'None yet.')} <a href={emIngles ? '/?lang=en#agendar' : '/#agendar'}>{tr('Abra o chat', 'Open the chat')}</a> {tr('e peça para marcar uma avaliação.', 'and ask to book a check-up.')}</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead><tr><th>{tr('Dia', 'Day')}</th><th>{tr('Hora', 'Time')}</th><th>{tr('Paciente', 'Patient')}</th><th>{tr('Serviço', 'Service')}</th><th>{tr('Protocolo', 'Reference')}</th></tr></thead>
              <tbody>
                {ag.map((a) => (
                  <tr key={a.protocolo}><td>{formatarData(a.data)}</td><td>{a.hora}</td><td>{a.nome}</td><td>{nomeServico(a.servico)}</td><td><code>{a.protocolo}</code></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="painel-bloco">
        <h2>{tr('Para a recepção responder', 'For the front desk to answer')}</h2>
        {pend.length === 0 ? (
          <p className="vazio">{tr('Nada pendente. Peça "quero falar com um atendente" no chat para ver como chega.', 'Nothing pending. Ask "I want to talk to a person" in the chat to see how it arrives.')}</p>
        ) : (
          <ul className="lista-tr">
            {pend.map((t, i) => (
              <li key={i}><span className="quando">{hora(t.criadoEm)}</span><strong>{t.motivo}</strong><p>{t.resumo}</p></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
