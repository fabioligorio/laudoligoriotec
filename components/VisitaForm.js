'use client';
import { useState } from 'react';
import { Logo } from './Marca';
import { EQUIPAMENTOS, PERIODOS_VISITA } from '@/lib/visitas';
import { fdate } from '@/lib/format';

const WHATSAPP_EMPRESA = '41936186432'; // (41) 93618-6432

const VAZIO = {
  nome: '', whatsapp: '', endereco: '', bairro: '', cidade: 'Curitiba',
  equipamento: '', marca: '', problema: '', dia: '', periodo: 'Qualquer horário', site: '',
};

// máscara simples: (41) 99999-9999
function mascara(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const amanha = () => {
  const d = new Date(Date.now() + 86400000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function VisitaForm() {
  const [f, setF] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: k === 'whatsapp' ? mascara(e.target.value) : e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (!f.equipamento) { setErro('Escolha o tipo de equipamento.'); return; }
    setEnviando(true);
    try {
      const res = await fetch('/api/visita', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(f),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível enviar.');
      setEnviado(f);
      window.scrollTo(0, 0);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const msgZap = (d) =>
    [
      'Olá! Acabei de pedir uma visita técnica de avaliação pelo site.',
      `Nome: ${d.nome}`,
      `Equipamento: ${d.equipamento}${d.marca ? ` (${d.marca})` : ''}`,
      `Endereço: ${[d.endereco, d.bairro, d.cidade].filter(Boolean).join(', ')}`,
      `Preferência: ${d.dia ? fdate(d.dia) + ', ' : ''}${d.periodo.toLowerCase()}`,
      `Problema: ${d.problema}`,
    ].join('\n');

  return (
    <div className="cli-pagina">
      <header className="cli-topo">
        <div className="cli-topo-in">
          <Logo escuro altura={32} />
          <span className="cli-assin">Tecnologia que conecta.</span>
        </div>
      </header>

      <main className="cli-main vis">
        {enviado ? (
          <section className="cli-hero vis-ok" role="status">
            <span className="vis-ok-ic" aria-hidden="true">✓</span>
            <span className="marcador">Pedido recebido</span>
            <h1>Obrigado, {enviado.nome.split(' ')[0]}!</h1>
            <p className="cli-sub">
              Recebemos o seu pedido de visita técnica. Vamos falar com você pelo WhatsApp <b>{enviado.whatsapp}</b> para combinar o dia e o horário.
            </p>
            <div className="cli-acoes">
              <a className="btn primary" href={`https://wa.me/55${WHATSAPP_EMPRESA}?text=${encodeURIComponent(msgZap(enviado))}`} target="_blank" rel="noopener">
                Avisar pelo WhatsApp
              </a>
              <button type="button" className="btn" onClick={() => { setF(VAZIO); setEnviado(null); }}>Fazer outro pedido</button>
            </div>
          </section>
        ) : (
          <>
            <section className="cli-hero">
              <span className="marcador">Visita técnica de avaliação</span>
              <h1>Solicite uma visita</h1>
              <p className="cli-sub">
                Preencha os dados abaixo. Um técnico da LigorioTec vai até você avaliar o equipamento e depois enviamos o diagnóstico e o orçamento.
              </p>
            </section>

            <form className="vis-form" onSubmit={enviar} noValidate>
              {/* campo escondido contra robôs */}
              <input className="vis-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.site} onChange={set('site')} name="site" />

              <fieldset>
                <legend>Seus dados</legend>
                <label>Nome completo *
                  <input required autoComplete="name" value={f.nome} onChange={set('nome')} maxLength={120} />
                </label>
                <label>WhatsApp com DDD *
                  <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="(41) 99999-9999" value={f.whatsapp} onChange={set('whatsapp')} />
                </label>
              </fieldset>

              <fieldset>
                <legend>Endereço da visita</legend>
                <label>Rua e número *
                  <input required autoComplete="street-address" value={f.endereco} onChange={set('endereco')} maxLength={200} />
                </label>
                <div className="vis-linha">
                  <label>Bairro
                    <input value={f.bairro} onChange={set('bairro')} maxLength={80} />
                  </label>
                  <label>Cidade
                    <input autoComplete="address-level2" value={f.cidade} onChange={set('cidade')} maxLength={80} />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Equipamento</legend>
                <span className="vis-rot">Tipo de equipamento *</span>
                <div className="vis-chips" role="radiogroup" aria-label="Tipo de equipamento">
                  {EQUIPAMENTOS.map((e) => (
                    <button key={e} type="button" role="radio" aria-checked={f.equipamento === e} onClick={() => setF((x) => ({ ...x, equipamento: e }))}>{e}</button>
                  ))}
                </div>
                <label><span>Marca e modelo <span className="opc">(se souber)</span></span>
                  <input value={f.marca} onChange={set('marca')} maxLength={120} placeholder="Ex.: PPA DZ Rio, Electrolux LAC11" />
                </label>
                <label>O que está acontecendo? *
                  <textarea required rows={4} value={f.problema} onChange={set('problema')} maxLength={2000} placeholder="Ex.: o portão abre mas não fecha, faz um barulho e para no meio." />
                </label>
              </fieldset>

              <fieldset>
                <legend>Melhor dia para a visita</legend>
                <div className="vis-linha">
                  <label><span>Dia preferido <span className="opc">(opcional)</span></span>
                    <input type="date" min={amanha()} value={f.dia} onChange={set('dia')} />
                  </label>
                  <div>
                    <span className="vis-rot">Período</span>
                    <div className="seg vis-seg">
                      {PERIODOS_VISITA.map((p) => (
                        <button key={p} type="button" aria-pressed={f.periodo === p} onClick={() => setF((x) => ({ ...x, periodo: p }))}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="hint">Vamos confirmar o dia e o horário com você pelo WhatsApp.</p>
              </fieldset>

              {erro && <p className="estado erro" role="alert">{erro}</p>}
              <button className="btn primary vis-enviar" type="submit" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Solicitar visita'}
              </button>
              <p className="vis-priv">Seus dados são usados só para agendar e fazer o atendimento.</p>
            </form>
          </>
        )}
      </main>

      <footer className="cli-rodape">
        <Logo escuro altura={26} />
        <p>
          <span>www.ligoriotec.com.br</span>
          <span>WhatsApp (41) 93618-6432</span>
        </p>
      </footer>
    </div>
  );
}
