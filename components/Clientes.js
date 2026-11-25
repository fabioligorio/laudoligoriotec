'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from './Marca';

function mascara(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function Clientes({ inicial }) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [novo, setNovo] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const q = busca.trim().toLowerCase();
  const lista = [...inicial]
    .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'))
    .filter((c) => !q || [c.nome, c.whatsapp].some((v) => String(v || '').toLowerCase().includes(q)));

  async function criar(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const res = await fetch('/api/clientes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(novo) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível salvar.');
      router.push(`/clientes/${j.id}`);
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Link className="marca-link" href="/" aria-label="LigorioTec, início"><Logo escuro altura={34} /></Link>
          <span className="titulo so-desktop">Sistema interno<b>Clientes</b></span>
          <span className="sp" />
          <Link className="btn ghost" href="/">← Início</Link>
          <button className="btn primary so-desktop" type="button" onClick={() => setNovo({ nome: '', whatsapp: '', obs: '' })}>+ Novo cliente</button>
        </div>
      </header>
      <button className="so-mobile fab" type="button" onClick={() => setNovo({ nome: '', whatsapp: '', obs: '' })} aria-label="Novo cliente">
        <span aria-hidden="true">+</span> Novo
      </button>

      {novo && (
        <div className="modal-fundo" onClick={() => setNovo(null)}>
          <form className="modal vis-form" role="dialog" aria-modal="true" aria-labelledby="titulo-cli" onClick={(e) => e.stopPropagation()} onSubmit={criar} noValidate>
            <div className="modal-topo">
              <h3 id="titulo-cli">Novo cliente</h3>
              <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => setNovo(null)}>×</button>
            </div>
            <label>Nome do cliente ou empresa *
              <input autoFocus value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} maxLength={120} />
            </label>
            <label>WhatsApp com DDD
              <input type="tel" inputMode="tel" placeholder="(41) 99999-9999" value={novo.whatsapp} onChange={(e) => setNovo({ ...novo, whatsapp: mascara(e.target.value) })} />
            </label>
            <label><span>Anotações <span className="opc">(só você vê)</span></span>
              <textarea rows={2} value={novo.obs} onChange={(e) => setNovo({ ...novo, obs: e.target.value })} maxLength={1000} />
            </label>
            <p className="hint">Depois de salvar, o sistema mostra os laudos, visitas e propostas com o mesmo nome ou WhatsApp para você ligar a este cliente.</p>
            {erro && <p className="estado erro" role="alert">{erro}</p>}
            <div className="modal-acoes">
              <button type="button" className="btn" onClick={() => setNovo(null)}>Cancelar</button>
              <button type="submit" className="btn primary" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar cliente'}</button>
            </div>
          </form>
        </div>
      )}

      <main className="lista">
        <div className="lista-titulo">
          <span className="marcador">Cadastro</span>
          <h2>Clientes e <em>link único</em></h2>
        </div>
        <p className="hint cli-expl">Cada cliente tem um link só dele, que reúne as visitas, os laudos, os orçamentos e as propostas. Mande uma vez e ele acompanha tudo por ali.</p>

        {inicial.length === 0 ? (
          <div className="vazio">
            <strong>Nenhum cliente cadastrado</strong>
            <span>Cadastre o cliente e ligue a ele os atendimentos que já existem.</span>
            <button className="btn primary" type="button" onClick={() => setNovo({ nome: '', whatsapp: '', obs: '' })}>+ Novo cliente</button>
          </div>
        ) : (
          <>
            <input type="search" placeholder="Buscar por nome ou WhatsApp" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <div className="cl-lista">
              {lista.map((c) => (
                <Link key={c.id} href={`/clientes/${c.id}`} className="cl-card">
                  <span className="cl-ini" aria-hidden="true">{String(c.nome).trim().charAt(0).toUpperCase()}</span>
                  <span className="cl-info">
                    <b>{c.nome}</b>
                    <small>{[c.whatsapp, `${c.itens} ${c.itens === 1 ? 'atendimento' : 'atendimentos'}`].filter(Boolean).join(' · ')}</small>
                  </span>
                  {!c.linkAtivo && <span className="pill cancelada">Link desativado</span>}
                  <span className="pt-seta" aria-hidden="true">→</span>
                </Link>
              ))}
              {lista.length === 0 && <p className="estado" style={{ padding: 16, textAlign: 'center' }}>Nenhum cliente com essa busca.</p>}
            </div>
          </>
        )}
      </main>
    </>
  );
}
