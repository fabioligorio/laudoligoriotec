'use client';
import { useState } from 'react';
import PropostaDoc, { FolhasProposta } from './PropostaDoc';
import { Logo } from './Marca';
import { brl, fdate } from '@/lib/format';
import { totalProposta, validaAte, vencida, numeroProposta, WHATSAPP_EMPRESA } from '@/lib/propostas';

export default function PropostaCliente({ p: inicial, token }) {
  const [p, setP] = useState(inicial);
  const [nome, setNome] = useState('');
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const num = numeroProposta(p);
  const total = totalProposta(p);
  const venceu = vencida(p);
  const zap = (t) => `https://wa.me/55${WHATSAPP_EMPRESA}?text=${encodeURIComponent(t)}`;
  const assunto = `${p.titulo || 'proposta'}${p.cliente ? ` (${p.cliente})` : ''}`;

  async function aprovar(e) {
    e.preventDefault();
    setErro('');
    if (nome.trim().length < 3) { setErro('Digite o seu nome completo.'); return; }
    if (!aceite) { setErro('Marque a caixa confirmando que leu e aprova a proposta.'); return; }
    setEnviando(true);
    try {
      const res = await fetch('/api/proposta/aprovar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, nome }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível aprovar.');
      setP((x) => ({ ...x, status: 'aprovada', aprovacao: j.aprovacao }));
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cli-pagina prop-pagina">
      <header className="cli-topo no-print">
        <div className="cli-topo-in">
          <Logo escuro altura={32} />
          <span className="cli-assin">Tecnologia que conecta.</span>
        </div>
      </header>

      <div className="prop-barra no-print">
        <div>
          <span className="marcador">Proposta nº {num}</span>
          <b>R$ {brl(total)}</b>
          {p.status === 'aprovada' ? <small className="ok">✓ Aprovada</small>
            : venceu ? <small className="venc">Validade encerrada em {fdate(validaAte(p))}</small>
            : validaAte(p) ? <small>Válida até {fdate(validaAte(p))}</small> : null}
        </div>
        <div className="prop-barra-acoes">
          <button type="button" className="btn" onClick={() => window.print()}>Baixar PDF</button>
          {p.status !== 'aprovada' && !venceu && p.status !== 'recusada' && <a className="btn primary" href="#aprovar">Aprovar</a>}
        </div>
      </div>

      <main className="prop-main">
        <FolhasProposta><PropostaDoc p={p} /></FolhasProposta>

        <section id="aprovar" className="prop-acao no-print">
          {p.status === 'aprovada' ? (
            <div className="prop-ok">
              <span className="vis-ok-ic" aria-hidden="true">✓</span>
              <h2>Proposta aprovada!</h2>
              <p>
                Aprovada por <b>{p.aprovacao?.nome}</b> em {new Date(p.aprovacao?.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}.
                Obrigado pela confiança. Vamos falar com você para combinar os próximos passos.
              </p>
              <div className="cli-acoes">
                <a className="btn primary" href={zap(`Olá! Acabei de aprovar a proposta nº ${num} – ${assunto}.`)} target="_blank" rel="noopener">Avisar pelo WhatsApp</a>
                <button type="button" className="btn" onClick={() => window.print()}>Baixar PDF aprovado</button>
              </div>
            </div>
          ) : venceu || p.status === 'recusada' ? (
            <div className="prop-ok">
              <h2>{venceu ? 'A validade desta proposta terminou' : 'Proposta encerrada'}</h2>
              <p>Fale com a gente para atualizar os valores e as condições.</p>
              <a className="btn primary" href={zap(`Olá! Gostaria de atualizar a proposta nº ${num} – ${assunto}.`)} target="_blank" rel="noopener">Falar no WhatsApp</a>
            </div>
          ) : (
            <form className="prop-form" onSubmit={aprovar} noValidate>
              <h2>Aprovar a proposta</h2>
              <p>Confira os itens e as condições acima. Para aprovar, digite o seu nome e confirme.</p>
              <label>Seu nome completo
                <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} />
              </label>
              <label className="prop-check">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                <span>Li e aprovo a proposta nº {num}{p.cliente ? `, em nome de ${p.cliente}` : ''}, no valor de <b>R$ {brl(total)}</b>.</span>
              </label>
              {erro && <p className="estado erro" role="alert">{erro}</p>}
              <button type="submit" className="btn primary vis-enviar" disabled={enviando}>{enviando ? 'Aprovando…' : 'Aprovar proposta'}</button>
              <a className="btn" href={zap(`Olá! Tenho uma dúvida sobre a proposta nº ${num} – ${assunto}.`)} target="_blank" rel="noopener">Tirar uma dúvida no WhatsApp</a>
            </form>
          )}
        </section>
      </main>

      <footer className="cli-rodape no-print">
        <Logo escuro altura={26} />
        <p>
          <span>www.ligoriotec.com.br</span>
          <span>WhatsApp (41) 93618-6432</span>
        </p>
      </footer>
    </div>
  );
}
