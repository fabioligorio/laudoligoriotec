'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { brl, fdate } from '@/lib/format';
import { STATUS } from '@/lib/status';
import { Logo } from './Marca';

export default function Lista({ inicial }) {
  const router = useRouter();
  const [itens, setItens] = useState(inicial);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [armado, setArmado] = useState('');
  const [importando, setImportando] = useState('');

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

  // Lê o arquivo de backup e envia um relatório por vez
  async function importar(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro('');
    let dados;
    try {
      dados = JSON.parse(await arquivo.text());
    } catch {
      setErro('Esse arquivo não é um backup válido.');
      return;
    }
    // aceita tanto o arquivo de backup quanto o .data/db.json do computador
    const lista = Array.isArray(dados.relatorios) ? dados.relatorios : Object.values(dados.relatorios || {});
    if (!lista.length && !dados.modelo) {
      setErro('Nenhum relatório encontrado nesse arquivo.');
      return;
    }
    const enviar = async (corpo) => {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Falha ao importar.');
      return j.resultado;
    };
    const cont = { importado: 0, atualizado: 0, 'ja-existe': 0, falha: 0 };
    try {
      if (dados.modelo) await enviar({ modelo: dados.modelo });
      for (let i = 0; i < lista.length; i++) {
        setImportando(`Importando ${i + 1} de ${lista.length}…`);
        try {
          cont[await enviar({ relatorio: lista[i] })]++;
        } catch {
          cont.falha++;
        }
      }
    } catch (err) {
      setErro(err.message);
    }
    const partes = [
      cont.importado && `${cont.importado} importado(s)`,
      cont.atualizado && `${cont.atualizado} atualizado(s)`,
      cont['ja-existe'] && `${cont['ja-existe']} já existia(m)`,
      cont.falha && `${cont.falha} com falha`,
    ].filter(Boolean);
    setImportando(`Importação concluída: ${partes.join(', ') || 'nada novo'}. Atualizando a lista…`);
    setTimeout(() => window.location.reload(), 1500);
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
          <a className="marca-link" href="/" aria-label="LigorioTec, início"><Logo escuro altura={34} /></a>
          <span className="titulo">Sistema interno<b>Laudos e orçamentos</b></span>
          <span className="sp" />
          <input id="importar" type="file" accept="application/json,.json" onChange={importar} hidden />
          <div className="so-desktop acoes-topo">
            <Link className="btn" href="/modelo">Editar modelo</Link>
            <a className="btn" href="/api/backup" download title="Baixa um arquivo com todos os relatórios">Baixar backup</a>
            <label className="btn" htmlFor="importar" title="Envia relatórios de um arquivo de backup ou do db.json do computador">Importar backup</label>
            <button className="btn primary" type="button" onClick={() => criar()} disabled={ocupado}>+ Novo relatório</button>
            <button className="btn ghost" type="button" onClick={sair}>Sair</button>
          </div>
          {/* celular: as ações secundárias ficam num menu */}
          <details className="so-mobile menu">
            <summary className="btn" aria-label="Mais opções">Menu</summary>
            <div className="menu-itens">
              <Link href="/modelo">Editar modelo</Link>
              <a href="/api/backup" download>Baixar backup</a>
              <label htmlFor="importar">Importar backup</label>
              <button type="button" onClick={sair}>Sair</button>
            </div>
          </details>
        </div>
      </header>

      {/* celular: botão flutuante para criar */}
      <button className="so-mobile fab" type="button" onClick={() => criar()} disabled={ocupado} aria-label="Novo relatório">
        <span aria-hidden="true">+</span> Novo
      </button>

      <div className="lista">
        <div className="lista-titulo">
          <span className="marcador">Atendimentos</span>
          <h2>Diagnósticos e <em>orçamentos</em></h2>
        </div>
        {erro && <p className="estado erro" role="alert">{erro}</p>}
        {importando && <p className="estado" role="status">{importando}</p>}

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
                    <tr key={r.id} className="linha">
                      <td className="num c-num" data-rotulo="Nº">{r.num}</td>
                      <td className="cli c-cli" data-rotulo="Cliente">{r.cliente || <em style={{ color: 'var(--muted)' }}>sem nome</em>}</td>
                      <td className="c-equip" data-rotulo="Equipamento">{r.equip}</td>
                      <td className="num c-data" data-rotulo="Data">{fdate(r.data)}</td>
                      <td className="num c-total" data-rotulo="Total">R$ {brl(r.total)}</td>
                      <td className="c-sit"><span className={`pill ${r.status}`}>{(STATUS[r.status] || STATUS.rascunho).curto}</span></td>
                      <td className="c-acoes">
                        <div className="acoes">
                          <Link className="btn" href={`/r/${r.id}`}>{r.status === 'concluido' ? 'Abrir' : 'Editar'}</Link>
                          <a className="btn" href={`/r/${r.id}/imprimir`} target="_blank" rel="noopener" title="Abre o laudo e o orçamento prontos para salvar em PDF">PDF</a>
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
