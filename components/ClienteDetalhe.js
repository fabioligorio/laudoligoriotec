'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from './Marca';
import { brl, fdate } from '@/lib/format';
import { STATUS } from '@/lib/status';
import { STATUS_VISITA } from '@/lib/visitas';
import { STATUS_PROPOSTA } from '@/lib/propostas';
import { zapDoCliente } from '@/lib/visitas';

const TIPO = { relatorio: 'Laudo / orçamento', visita: 'Visita técnica', proposta: 'Proposta' };
const interno = (i) => (i.tipo === 'relatorio' ? `/r/${i.id}` : i.tipo === 'proposta' ? `/propostas/${i.id}` : '/solicitacoes');
function pill(i) {
  if (i.tipo === 'visita') return STATUS_VISITA[i.status];
  if (i.tipo === 'proposta') return STATUS_PROPOSTA[i.status];
  const s = STATUS[i.status] || STATUS.rascunho;
  return { rotulo: s.curto, classe: i.status };
}
const sub = (i) =>
  [TIPO[i.tipo], i.num && `nº ${i.num}`, i.data && fdate(i.data), i.total ? `R$ ${brl(i.total)}` : ''].filter(Boolean).join(' · ');

function mascara(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function ClienteDetalhe({ inicial }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [busca, setBusca] = useState('');
  const [armado, setArmado] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [origem, setOrigem] = useState('');
  useEffect(() => setOrigem(window.location.origin), []);

  const c = d.cliente;
  const link = `${origem}/cliente/${c.token}`;
  const zap = zapDoCliente(c.whatsapp);
  const nome1 = String(c.nome).split(' ')[0];
  const msg = `Olá, ${nome1}! Aqui é o Fábio, da LigorioTec. Neste link você acompanha todas as suas visitas, laudos, orçamentos e propostas com a gente: ${link}`;

  async function enviar(corpo) {
    setErro('');
    setOcupado(true);
    try {
      const res = await fetch(`/api/clientes/${c.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível salvar.');
      setD(j);
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function ligarTodos() {
    for (const i of d.sugestoes) {
      if (!(await enviar({ vincular: { tipo: i.tipo, id: i.id } }))) break;
    }
  }

  function confirmar(chave, acao) {
    if (armado !== chave) {
      setArmado(chave);
      setTimeout(() => setArmado((a) => (a === chave ? '' : a)), 4000);
      return;
    }
    setArmado('');
    acao();
  }

  async function excluir() {
    const res = await fetch(`/api/clientes/${c.id}`, { method: 'DELETE' });
    if (!res.ok) { setErro('Não foi possível excluir.'); return; }
    router.push('/clientes');
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }
    catch { setErro(`Não deu para copiar. O link é ${link}`); }
  }

  const q = busca.trim().toLowerCase();
  const sugeridos = new Set(d.sugestoes.map((i) => i.tipo + i.id));
  const achados = q.length >= 2
    ? d.soltos.filter((i) => !sugeridos.has(i.tipo + i.id) && [i.cliente, i.titulo, i.num].some((v) => String(v || '').toLowerCase().includes(q))).slice(0, 20)
    : [];
  const noLink = d.itens.filter((i) => i.link || (i.tipo === 'visita' && i.status === 'realizada')).length;

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Link className="marca-link so-desktop" href="/" aria-label="LigorioTec, início"><Logo escuro altura={30} /></Link>
          <Link className="btn ghost" href="/clientes">← Clientes</Link>
          <span className="sp" />
        </div>
      </header>

      <main className="lista">
        <div className="lista-titulo">
          <span className="marcador">Cliente</span>
          <h2>{c.nome}</h2>
        </div>

        {editando ? (
          <form className="cl-ficha vis-form" onSubmit={async (e) => { e.preventDefault(); if (await enviar({ dados: editando })) setEditando(null); }}>
            <label>Nome do cliente ou empresa
              <input value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} maxLength={120} />
            </label>
            <label>WhatsApp com DDD
              <input type="tel" inputMode="tel" value={editando.whatsapp} onChange={(e) => setEditando({ ...editando, whatsapp: mascara(e.target.value) })} />
            </label>
            <label>Anotações
              <textarea rows={2} value={editando.obs} onChange={(e) => setEditando({ ...editando, obs: e.target.value })} maxLength={1000} />
            </label>
            <div className="pe-link-acoes">
              <button type="submit" className="btn primary" disabled={ocupado}>Salvar</button>
              <button type="button" className="btn" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="cl-ficha">
            <dl className="vis-dados">
              <div><dt>WhatsApp</dt><dd>{c.whatsapp || '—'}</dd></div>
              {c.obs && <div><dt>Anotações</dt><dd>{c.obs}</dd></div>}
            </dl>
            <button type="button" className="btn" onClick={() => setEditando({ nome: c.nome, whatsapp: c.whatsapp || '', obs: c.obs || '' })}>Editar dados</button>
          </div>
        )}

        <div className="vis-link">
          <div>
            <b>Link único do cliente</b>
            <small>{c.linkAtivo ? `Mostra ${noLink} de ${d.itens.length} ${d.itens.length === 1 ? 'atendimento' : 'atendimentos'} (só os que já têm link ativo).` : 'Desativado: o cliente vê "Link indisponível".'}</small>
            <code>{link}</code>
          </div>
          <div className="vis-link-acoes">
            {c.linkAtivo && zap && <a className="btn primary" href={`${zap}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener">Enviar pelo WhatsApp</a>}
            {c.linkAtivo && <button type="button" className="btn" onClick={copiar}>{copiado ? 'Copiado ✓' : 'Copiar link'}</button>}
            {c.linkAtivo && <a className="btn" href={`/cliente/${c.token}`} target="_blank" rel="noopener">Ver como o cliente</a>}
            {c.linkAtivo
              ? <button type="button" className="btn" onClick={() => enviar({ link: 'desativar' })} disabled={ocupado}>Desativar</button>
              : <button type="button" className="btn primary" onClick={() => enviar({ link: 'ativar' })} disabled={ocupado}>Ativar link</button>}
            <button type="button" className="btn" onClick={() => confirmar('novo', () => enviar({ link: 'novo' }))} disabled={ocupado}>
              {armado === 'novo' ? 'Confirmar troca' : 'Trocar link'}
            </button>
          </div>
        </div>

        {erro && <p className="estado erro" role="alert">{erro}</p>}

        {d.sugestoes.length > 0 && (
          <section className="cl-bloco cl-sug">
            <div className="cl-bloco-topo">
              <h3>Encontrei {d.sugestoes.length === 1 ? '1 atendimento' : `${d.sugestoes.length} atendimentos`} com o mesmo nome ou WhatsApp</h3>
              {d.sugestoes.length > 1 && <button type="button" className="btn primary" onClick={ligarTodos} disabled={ocupado}>Ligar todos</button>}
            </div>
            {d.sugestoes.map((i) => (
              <div key={i.tipo + i.id} className="cl-item">
                <span className="cl-item-info"><b>{i.titulo}</b><small>{i.cliente} · {sub(i)}</small></span>
                <button type="button" className="btn" onClick={() => enviar({ vincular: { tipo: i.tipo, id: i.id } })} disabled={ocupado}>Ligar</button>
              </div>
            ))}
          </section>
        )}

        <section className="cl-bloco">
          <div className="cl-bloco-topo"><h3>Atendimentos deste cliente ({d.itens.length})</h3></div>
          {d.itens.length === 0 && <p className="hint">Nenhum ainda. Use as sugestões acima ou busque abaixo para ligar.</p>}
          {d.itens.map((i) => {
            const p = pill(i);
            const visivel = !!i.link || (i.tipo === 'visita' && i.status === 'realizada');
            return (
              <div key={i.tipo + i.id} className="cl-item">
                <span className="cl-item-info">
                  <b>{i.titulo}</b>
                  <small>{sub(i)}</small>
                  <small className={visivel ? 'cl-vis ok' : 'cl-vis'}>{visivel ? '● Aparece no link do cliente' : '○ Ainda sem link: não aparece para o cliente'}</small>
                </span>
                <span className="cl-item-acoes">
                  {p && <span className={`pill ${p.classe}`}>{p.rotulo}</span>}
                  <Link className="btn" href={interno(i)}>Abrir</Link>
                  <button type="button" className="btn ghost" onClick={() => confirmar('sol' + i.id, () => enviar({ desvincular: { tipo: i.tipo, id: i.id } }))} disabled={ocupado}>
                    {armado === 'sol' + i.id ? 'Confirmar' : 'Soltar'}
                  </button>
                </span>
              </div>
            );
          })}
        </section>

        <section className="cl-bloco">
          <div className="cl-bloco-topo"><h3>Ligar outro atendimento</h3></div>
          <input type="search" placeholder="Busque pelo nome que está no laudo, na visita ou na proposta" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {q.length >= 2 && achados.length === 0 && <p className="hint">Nada encontrado entre os atendimentos que ainda não têm cliente.</p>}
          {achados.map((i) => (
            <div key={i.tipo + i.id} className="cl-item">
              <span className="cl-item-info"><b>{i.titulo}</b><small>{i.cliente || 'Sem nome'} · {sub(i)}</small></span>
              <button type="button" className="btn" onClick={() => enviar({ vincular: { tipo: i.tipo, id: i.id } })} disabled={ocupado}>Ligar</button>
            </div>
          ))}
        </section>

        <div className="cl-excluir">
          <button type="button" className="btn warn" onClick={() => confirmar('excluir', excluir)}>
            {armado === 'excluir' ? 'Confirmar: excluir o cadastro' : 'Excluir cliente'}
          </button>
          <small>Os laudos, visitas e propostas continuam no sistema; só deixam de estar ligados a este cliente.</small>
        </div>
      </main>
    </>
  );
}
