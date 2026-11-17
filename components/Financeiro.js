'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { brl, fdate } from '@/lib/format';
import { PERIODOS, noPeriodo, dataDoConcluido } from '@/lib/periodo';
import { Logo } from './Marca';

// Financeiro: total dos atendimentos concluídos, separado em serviços e produtos
export default function Financeiro({ inicial }) {
  const [periodo, setPeriodo] = useState('mes');
  const [busca, setBusca] = useState('');
  const [oculto, setOculto] = useState(false);

  // esconder os totais (lembra a escolha neste aparelho)
  useEffect(() => {
    try { setOculto(localStorage.getItem('lt_ocultar_valores') === '1'); } catch {}
  }, []);
  function alternar() {
    setOculto((o) => {
      try { localStorage.setItem('lt_ocultar_valores', o ? '0' : '1'); } catch {}
      return !o;
    });
  }

  const doPeriodo = useMemo(
    () =>
      inicial
        .map((r) => ({ ...r, dia: dataDoConcluido(r) }))
        .filter((r) => noPeriodo(r.dia, periodo))
        .sort((a, b) => (a.dia < b.dia ? 1 : a.dia > b.dia ? -1 : 0)),
    [inicial, periodo]
  );
  const servicos = doPeriodo.reduce((a, r) => a + (r.servicos || 0), 0);
  const produtos = doPeriodo.reduce((a, r) => a + (r.produtos || 0), 0);
  const total = servicos + produtos;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const v = (n) => (oculto ? 'R$ ••••' : `R$ ${brl(n)}`);

  const q = busca.trim().toLowerCase();
  const visiveis = q
    ? doPeriodo.filter((r) => [r.cliente, r.equip, r.num].some((x) => String(x || '').toLowerCase().includes(q)))
    : doPeriodo;

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Link className="marca-link" href="/" aria-label="LigorioTec, início"><Logo escuro altura={34} /></Link>
          <span className="titulo so-desktop">Sistema interno<b>Financeiro</b></span>
          <span className="sp" />
          <Link className="btn ghost" href="/">← Início</Link>
          <Link className="btn so-desktop" href="/laudos">Laudos e orçamentos</Link>
        </div>
      </header>

      <main className="lista fin">
        <div className="lista-titulo">
          <span className="marcador">Financeiro</span>
          <h2>Serviços <em>concluídos</em></h2>
        </div>

        <div className="fin-controles">
          <div className="chips" role="group" aria-label="Período">
            {PERIODOS.map(([k, t]) => (
              <button key={k} type="button" aria-pressed={periodo === k} onClick={() => setPeriodo(k)}>{t}</button>
            ))}
          </div>
          <button type="button" className="olho" onClick={alternar} aria-pressed={oculto}>
            {oculto ? 'Mostrar totais' : 'Ocultar totais'}
          </button>
        </div>

        <section className="fat-grade" aria-label="Totais do período">
          <div className="fat-total">
            <span>Total</span>
            <b>{v(total)}</b>
            <small>{doPeriodo.length} {doPeriodo.length === 1 ? 'serviço concluído' : 'serviços concluídos'}</small>
            {total > 0 && !oculto && (
              <div className="fin-barra" aria-hidden="true">
                <i style={{ width: `${pct(servicos)}%` }} />
              </div>
            )}
          </div>
          <div>
            <span><i className="pt serv" />Serviços</span>
            <b>{v(servicos)}</b>
            <small>mão de obra{!oculto && total > 0 ? ` · ${pct(servicos)}%` : ''}</small>
          </div>
          <div>
            <span><i className="pt prod" />Produtos</span>
            <b>{v(produtos)}</b>
            <small>peças{!oculto && total > 0 ? ` · ${pct(produtos)}%` : ''}</small>
          </div>
        </section>

        <div className="fin-lista-topo">
          <h3>Atendimentos do período</h3>
          <input type="search" placeholder="Buscar por cliente, equipamento ou nº" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        {visiveis.length === 0 ? (
          <div className="vazio">
            <strong>Nenhum serviço concluído {periodo === 'tudo' ? 'ainda' : 'nesse período'}</strong>
            <span>Quando um laudo for marcado como <b>Concluído</b>, ele aparece aqui.</span>
          </div>
        ) : (
          <div className="fin-itens">
            <div className="fin-linha cab so-desktop" aria-hidden="true">
              <span>Concluído</span><span>Cliente</span><span className="n">Serviços</span><span className="n">Produtos</span><span className="n">Total</span>
            </div>
            {visiveis.map((r) => (
              <Link key={r.id} href={`/r/${r.id}`} className="fin-linha">
                <span className="fin-data">{fdate(r.dia)}</span>
                <span className="fin-cli">
                  <b>{r.cliente || 'Sem nome'}</b>
                  <small>{[r.equip, r.num && `nº ${r.num}`].filter(Boolean).join(' · ')}</small>
                </span>
                <span className="n fin-v" data-rotulo="Serviços">R$ {brl(r.servicos)}</span>
                <span className="n fin-v" data-rotulo="Produtos">R$ {brl(r.produtos)}</span>
                <span className="n fin-tot" data-rotulo="Total">R$ {brl((r.servicos || 0) + (r.produtos || 0))}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
