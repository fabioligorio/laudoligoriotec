'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { brl, fdate } from '@/lib/format';
import { STATUS } from '@/lib/status';

export default function Lista({ inicial }) {
  const router = useRouter();
  const [itens, setItens] = useState(inicial);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [armado, setArmado] = useState('');

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((r) =>
      (filtro === 'todos' || r.status === filtro) &&
      (!q || [r.cliente, r.equip, r.num].some((v) => String(v || '').toLowerCase().includes(q)))
    );
  }, [itens, filtro, busca]);

  async function criar(corpo = {}) {
    setOcupado(true);
    setErro('');
    try {
      const res = await fetch('/api/relatorios', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || 'Não foi possível criar.');
      router.push(`/r/${j.id}`);
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }

  async function excluir(id) {
    if (armado !== id) {
      setArmado(id);
      setTimeout(() => setArmado((a) => (a === id ? '' : a)), 4000);
      return;
    }
    setArmado('');
    const res = await fetch(`/api/relatorios/${id}`, { method: 'DELETE' });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setErro(j.erro || 'Não foi possível excluir.'); return; }
    setItens((l) => l.filter((r) => r.id !== id));
  }

  async function sair() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const contagem = (s) => itens.filter((r) => s === 'todos' || r.status === s).length;

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <img src="/logo.jpg" alt="LigorioTec" />
          <h1>Laudos e orçamentos</h1>
          <span className="sp" />
          <Link className="btn" href="/modelo">Editar modelo</Link>
          <button className="btn primary" type="button" onClick={() => criar()} disabled={ocupado}>+ Novo relatório</button>
          <button className="btn ghost" type="button" onClick={sair}>Sair</button>
        </div>
      </header>

      <div className="lista">
        {erro && <p className="estado erro" role="alert">{erro}</p>}

        {itens.length === 0 ? (
          <div className="vazio">
            <strong>Nenhum relatório ainda</strong>
            <span>Crie o primeiro a partir do modelo, ou abra o atendimento da Júlia como exemplo.</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn primary" type="button" onClick={() => criar()} disabled={ocupado}>+ Novo relatório</button>
              <button className="btn" type="button" onClick={() => criar({ exemplo: true })} disabled={ocupado}>Abrir exemplo</button>
            </div>
          </div>
        ) : (
          <>
            <div className="filtros">
              <div className="chips" role="group" aria-label="Filtrar por situação">
                {[['todos', 'Todos'], ['rascunho', 'Rascunhos'], ['aguardando', 'Aguardando autorização'], ['concluido', 'Concluídos']].map(([k, t]) => (
                  <button key={k} type="button" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>
                    {t} ({contagem(k)})
                  </button>
                ))}
              </div>
              <input id="busca" type="search" placeholder="Buscar por cliente, equipamento ou nº" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="tabela">
              <table>
                <thead>
                  <tr><th>Nº</th><th>Cliente</th><th>Equipamento</th><th>Data</th><th>Total</th><th>Situação</th><th /></tr>
                </thead>
                <tbody>
                  {visiveis.map((r) => (
                    <tr key={r.id}>
                      <td className="num">{r.num}</td>
                      <td>{r.cliente || <em style={{ color: 'var(--muted)' }}>sem nome</em>}</td>
                      <td>{r.equip}</td>
                      <td className="num">{fdate(r.data)}</td>
                      <td className="num">R$ {brl(r.total)}</td>
                      <td><span className={`pill ${r.status}`}>{(STATUS[r.status] || STATUS.rascunho).curto}</span></td>
                      <td>
                        <div className="acoes">
                          <Link className="btn" href={`/r/${r.id}`}>{r.status === 'concluido' ? 'Abrir' : 'Editar'}</Link>
                          {r.status !== 'concluido' && (
                            <button className="btn warn" type="button" onClick={() => excluir(r.id)}>
                              {armado === r.id ? 'Confirmar' : 'Excluir'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visiveis.length === 0 && (
                    <tr><td colSpan={7} style={{ color: 'var(--muted)', textAlign: 'center' }}>Nada encontrado com esse filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
