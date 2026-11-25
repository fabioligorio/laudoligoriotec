'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { brl, fdate } from '@/lib/format';
import { STATUS_PROPOSTA, ORDEM_PROPOSTA } from '@/lib/propostas';
import { Logo } from './Marca';

const hojeISO = () => new Date().toISOString().slice(0, 10);

export default function Propostas({ inicial }) {
  const router = useRouter();
  const [lista, setLista] = useState(inicial);
  const [filtro, setFiltro] = useState('todas');
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [armado, setArmado] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [escolhendo, setEscolhendo] = useState(false);

  useEffect(() => {
    if (!escolhendo) return;
    const esc = (e) => e.key === 'Escape' && setEscolhendo(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [escolhendo]);

  const q = busca.trim().toLowerCase();
  const visiveis = lista.filter((p) =>
    (filtro === 'todas' || p.status === filtro) &&
    (!q || [p.cliente, p.titulo, p.num].some((v) => String(v || '').toLowerCase().includes(q)))
  );
  const conta = (k) => lista.filter((p) => k === 'todas' || p.status === k).length;
  const aprovadas = lista.filter((p) => p.status === 'aprovada');
  const abertas = lista.filter((p) => p.status === 'enviada');

  async function criar(corpo) {
    setOcupado(true);
    setErro('');
    try {
      const res = await fetch('/api/propostas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível criar.');
      router.push(`/propostas/${j.id}`);
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
      setEscolhendo(false);
    }
  }

  async function excluir(id) {
    if (armado !== id) {
      setArmado(id);
      setTimeout(() => setArmado((a) => (a === id ? '' : a)), 4000);
      return;
    }
    const res = await fetch(`/api/propostas/${id}`, { method: 'DELETE' });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setErro(j.erro || 'Não foi possível excluir.'); return; }
    setLista((l) => l.filter((p) => p.id !== id));
  }

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Link className="marca-link" href="/" aria-label="LigorioTec, início"><Logo escuro altura={34} /></Link>
          <span className="titulo so-desktop">Sistema interno<b>Propostas comerciais</b></span>
          <span className="sp" />
          <Link className="btn ghost" href="/">← Início</Link>
          <button className="btn primary so-desktop" type="button" onClick={() => setEscolhendo(true)} disabled={ocupado}>+ Nova proposta</button>
        </div>
      </header>

      <button className="so-mobile fab" type="button" onClick={() => setEscolhendo(true)} disabled={ocupado} aria-label="Nova proposta">
        <span aria-hidden="true">+</span> Nova
      </button>

      {escolhendo && (
        <div className="modal-fundo" onClick={() => setEscolhendo(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-nova" onClick={(e) => e.stopPropagation()}>
            <div className="modal-topo">
              <h3 id="titulo-nova">Nova proposta</h3>
              <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => setEscolhendo(false)}>×</button>
            </div>
            <div className="tipo-opcoes">
              <button type="button" className="tipo-op" onClick={() => criar({})} disabled={ocupado} autoFocus>
                <b>Em branco</b>
                <small>Já vem com as seções sugeridas: situação atual, solução, como funciona, escopo, investimento e condições.</small>
              </button>
              <button type="button" className="tipo-op" onClick={() => criar({ exemplo: true })} disabled={ocupado}>
                <b>A partir do exemplo (controle de acesso)</b>
                <small>Copia a proposta de catracas com reconhecimento facial, com textos, imagens e valores, para você adaptar.</small>
              </button>
            </div>
            <p className="hint">Para reaproveitar outra proposta sua, abra ela e use <b>Duplicar</b>.</p>
          </div>
        </div>
      )}

      <main className="lista">
        <div className="lista-titulo">
          <span className="marcador">Projetos</span>
          <h2>Propostas <em>comerciais</em></h2>
        </div>

        {lista.length > 0 && (
          <section className="fat-grade" aria-label="Resumo">
            <div className="fat-total">
              <span>Aprovadas</span>
              <b>R$ {brl(aprovadas.reduce((a, p) => a + (p.total || 0), 0))}</b>
              <small>{aprovadas.length} {aprovadas.length === 1 ? 'proposta' : 'propostas'}</small>
            </div>
            <div>
              <span>Aguardando o cliente</span>
              <b>R$ {brl(abertas.reduce((a, p) => a + (p.total || 0), 0))}</b>
              <small>{abertas.length} {abertas.length === 1 ? 'enviada' : 'enviadas'}</small>
            </div>
            <div>
              <span>Total de propostas</span>
              <b>{lista.length}</b>
              <small>{conta('rascunho')} em rascunho</small>
            </div>
          </section>
        )}

        {erro && <p className="estado erro" role="alert">{erro}</p>}

        {lista.length === 0 ? (
          <div className="vazio">
            <strong>Nenhuma proposta ainda</strong>
            <span>Crie uma em branco ou a partir do exemplo de controle de acesso.</span>
            <button className="btn primary" type="button" onClick={() => setEscolhendo(true)}>+ Nova proposta</button>
          </div>
        ) : (
          <>
            <div className="filtros">
              <div className="chips" role="group" aria-label="Filtrar por situação">
                {[['todas', 'Todas'], ...ORDEM_PROPOSTA.map((k) => [k, STATUS_PROPOSTA[k].rotulo + 's'])].map(([k, t]) => (
                  <button key={k} type="button" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{t} ({conta(k)})</button>
                ))}
              </div>
              <input type="search" placeholder="Buscar por cliente, projeto ou nº" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="fin-itens">
              <div className="fin-linha prop-linha cab so-desktop" aria-hidden="true">
                <span>Data</span><span>Cliente e projeto</span><span>Validade</span><span className="n">Total</span><span>Situação</span>
              </div>
              {visiveis.map((p) => {
                const st = STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho;
                const venceu = p.validaAte && p.validaAte < hojeISO() && p.status === 'enviada';
                return (
                  <div key={p.id} className="fin-linha prop-linha">
                    <span className="fin-data">{fdate(p.data)}</span>
                    <Link href={`/propostas/${p.id}`} className="fin-cli">
                      <b>{p.cliente || 'Sem cliente'}</b>
                      <small>{[p.titulo, `nº ${p.num}`].filter(Boolean).join(' · ')}</small>
                    </Link>
                    <span className={'prop-val' + (venceu ? ' venc' : '')} data-rotulo="Validade">{p.validaAte ? (venceu ? `venceu ${fdate(p.validaAte)}` : `até ${fdate(p.validaAte)}`) : '—'}</span>
                    <span className="n fin-tot" data-rotulo="Total">R$ {brl(p.total)}</span>
                    <span className="prop-sit">
                      <span className={`pill ${st.classe}`}>{st.rotulo}</span>
                      <span className="acoes">
                        <Link className="btn" href={`/propostas/${p.id}`}>Abrir</Link>
                        {p.status !== 'aprovada' && (
                          <button className="btn warn" type="button" onClick={() => excluir(p.id)}>{armado === p.id ? 'Confirmar' : 'Excluir'}</button>
                        )}
                      </span>
                    </span>
                  </div>
                );
              })}
              {visiveis.length === 0 && <p className="estado" style={{ padding: 16, textAlign: 'center' }}>Nada encontrado com esse filtro.</p>}
            </div>
          </>
        )}
      </main>
    </>
  );
}
