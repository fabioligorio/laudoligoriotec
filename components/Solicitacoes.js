'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fdate } from '@/lib/format';
import { STATUS_VISITA, ORDEM_VISITA, zapDoCliente, textoAgenda } from '@/lib/visitas';
import VisitaEditor from './VisitaEditor';
import { Logo } from './Marca';
import { EscolherTipo } from './Lista';

const quando = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export default function Solicitacoes({ inicial }) {
  const router = useRouter();
  const [lista, setLista] = useState(inicial);
  const [filtro, setFiltro] = useState('abertas');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [armado, setArmado] = useState('');
  const [criarDe, setCriarDe] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [editando, setEditando] = useState(null); // null = fechado, {} = nova, visita = editar
  const [linkCopiado, setLinkCopiado] = useState('');

  const linkDe = (v) => (v.token ? `${origem}/visita/${v.token}` : '');

  async function copiarLinkCliente(v) {
    try { await navigator.clipboard.writeText(linkDe(v)); setLinkCopiado(v.id); setTimeout(() => setLinkCopiado(''), 2500); }
    catch { setErro(`Não deu para copiar. O link é ${linkDe(v)}`); }
  }

  function msgCliente(v) {
    const ag = textoAgenda(v);
    const nome = v.nome.split(' ')[0];
    return ag
      ? `Olá, ${nome}! Aqui é da LigorioTec. Sua visita técnica está marcada para ${ag}. Confira os dados e confirme por este link: ${linkDe(v)}`
      : `Olá, ${nome}! Aqui é da LigorioTec. Este é o link da sua solicitação de visita técnica: ${linkDe(v)}`;
  }

  function salvo(v, nova) {
    setLista((l) => (nova ? [v, ...l] : l.map((x) => (x.id === v.id ? v : x))));
    setEditando(null);
    if (nova) setFiltro('abertas');
  }

  const [origem, setOrigem] = useState('');
  useEffect(() => setOrigem(window.location.origin), []);
  const linkForm = `${origem}/visita`;
  const abertas = (v) => v.status === 'nova' || v.status === 'agendada';
  const visiveis = lista.filter((v) => (filtro === 'abertas' ? abertas(v) : filtro === 'todas' ? true : v.status === filtro));
  const conta = (k) => lista.filter((v) => (k === 'abertas' ? abertas(v) : k === 'todas' ? true : v.status === k)).length;

  async function copiarLink() {
    try { await navigator.clipboard.writeText(linkForm); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }
    catch { setErro(`Não deu para copiar. O link é ${linkForm}`); }
  }

  async function mudar(id, corpo) {
    setErro('');
    const res = await fetch(`/api/solicitacoes/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setErro(j.erro || 'Não foi possível salvar.'); return; }
    setLista((l) => l.map((v) => (v.id === id ? j : v)));
  }

  async function excluir(id) {
    if (armado !== id) {
      setArmado(id);
      setTimeout(() => setArmado((a) => (a === id ? '' : a)), 4000);
      return;
    }
    const res = await fetch(`/api/solicitacoes/${id}`, { method: 'DELETE' });
    if (!res.ok) { setErro('Não foi possível excluir.'); return; }
    setLista((l) => l.filter((v) => v.id !== id));
  }

  async function criar(tipo) {
    setOcupado(true);
    setErro('');
    try {
      const res = await fetch('/api/relatorios', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tipo, deVisita: criarDe }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || 'Não foi possível criar.');
      router.push(`/r/${j.id}`);
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
      setCriarDe(null);
    }
  }

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Link className="marca-link" href="/" aria-label="LigorioTec, início"><Logo escuro altura={34} /></Link>
          <span className="titulo so-desktop">Sistema interno<b>Solicitações de visita</b></span>
          <span className="sp" />
          <Link className="btn ghost" href="/">← Início</Link>
        </div>
      </header>

      {editando && <VisitaEditor inicial={editando.id ? editando : null} fechar={() => setEditando(null)} salvo={salvo} />}
      <EscolherTipo aberto={!!criarDe} fechar={() => setCriarDe(null)} escolher={criar} ocupado={ocupado} />

      <main className="lista">
        <div className="lista-titulo">
          <span className="marcador">Visitas técnicas</span>
          <h2>Solicitações de <em>visita</em></h2>
        </div>
        <button type="button" className="btn primary vis-nova" onClick={() => setEditando({})}>+ Nova solicitação</button>

        <div className="vis-link">
          <div>
            <b>Link do formulário para os clientes</b>
            <small>Mande pelo WhatsApp, coloque no site ou na bio do Instagram.</small>
            <code>{linkForm}</code>
          </div>
          <div className="vis-link-acoes">
            <button type="button" className="btn primary" onClick={copiarLink}>{copiado ? 'Link copiado ✓' : 'Copiar link'}</button>
            <a className="btn" href="/visita" target="_blank" rel="noopener">Ver formulário</a>
          </div>
        </div>

        {erro && <p className="estado erro" role="alert">{erro}</p>}

        <div className="chips" role="group" aria-label="Filtrar">
          {[['abertas', 'Em aberto'], ...ORDEM_VISITA.map((k) => [k, STATUS_VISITA[k].rotulo]), ['todas', 'Todas']].map(([k, t]) => (
            <button key={k} type="button" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{t} ({conta(k)})</button>
          ))}
        </div>

        {visiveis.length === 0 ? (
          <div className="vazio">
            <strong>{lista.length ? 'Nada com esse filtro' : 'Nenhuma solicitação ainda'}</strong>
            <span>Quando um cliente preencher o formulário, o pedido aparece aqui.</span>
          </div>
        ) : (
          <div className="vis-cards">
            {visiveis.map((v) => {
              const zap = zapDoCliente(v.whatsapp);
              const endereco = [v.endereco, v.bairro, v.cidade].filter(Boolean).join(', ');
              const st = STATUS_VISITA[v.status] || STATUS_VISITA.nova;
              return (
                <article key={v.id} className="vis-card">
                  <div className="vis-card-topo">
                    <span className={`pill ${st.classe}`}>{st.rotulo}</span>
                    <small>Pedido em {quando(v.criadoEm)}</small>
                  </div>
                  <h3>{v.nome}</h3>
                  <p className="vis-equip"><b>{v.equipamento}</b>{v.marca ? ` · ${v.marca}` : ''}</p>
                  <p className="vis-prob">{v.problema}</p>
                  {v.agendaDia && (
                    <p className={'vis-agenda' + (v.confirmadoEm ? ' ok' : '')}>
                      <b>{textoAgenda(v)}</b>
                      <span>{v.confirmadoEm ? `✓ Confirmada pelo cliente em ${quando(v.confirmadoEm)}` : 'Aguardando o cliente confirmar'}</span>
                    </p>
                  )}
                  <dl className="vis-dados">
                    <div><dt>WhatsApp</dt><dd>{v.whatsapp}</dd></div>
                    <div><dt>Endereço</dt><dd>{endereco}</dd></div>
                    {v.origem !== 'interno' && <div><dt>Preferência</dt><dd>{v.dia ? `${fdate(v.dia)}, ` : ''}{String(v.periodo || '').toLowerCase()}</dd></div>}
                    {v.taxa && <div><dt>Valor visita</dt><dd>{v.taxa}</dd></div>}
                  </dl>
                  <label className="vis-obs">Anotações
                    <textarea rows={2} defaultValue={v.obs} placeholder="Ex.: agendado para quinta às 14h" onBlur={(e) => e.target.value !== (v.obs || '') && mudar(v.id, { obs: e.target.value })} />
                  </label>
                  <div className="vis-cli-link">
                    <span>Link para o cliente</span>
                    {v.token ? (
                      <div className="vis-acoes">
                        <button type="button" className="btn" onClick={() => copiarLinkCliente(v)}>{linkCopiado === v.id ? 'Copiado ✓' : 'Copiar link'}</button>
                        {zap && <a className="btn ok" href={`${zap}?text=${encodeURIComponent(msgCliente(v))}`} target="_blank" rel="noopener">Enviar pelo WhatsApp</a>}
                        <a className="btn ghost" href={`/visita/${v.token}`} target="_blank" rel="noopener">Ver</a>
                      </div>
                    ) : v.status === 'realizada' ? (
                      <small className="vis-link-off">Link desativado: a visita já foi feita{v.linkDesativadoEm ? ` (${quando(v.linkDesativadoEm)})` : ''}.</small>
                    ) : (
                      <button type="button" className="btn" onClick={() => mudar(v.id, { gerarLink: true })}>
                        {v.linkDesativadoEm ? 'Gerar link novo' : 'Gerar link'}
                      </button>
                    )}
                  </div>
                  <div className="vis-acoes">
                    <button type="button" className="btn" onClick={() => setEditando(v)}>Editar</button>
                    {zap && <a className="btn" href={`${zap}?text=${encodeURIComponent(`Olá, ${v.nome.split(' ')[0]}! Aqui é da LigorioTec, sobre a visita técnica que você pediu.`)}`} target="_blank" rel="noopener">Conversar</a>}
                    {endereco && <a className="btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`} target="_blank" rel="noopener noreferrer">Mapa</a>}
                    {v.relatorioId ? (
                      <Link className="btn" href={`/r/${v.relatorioId}`}>Abrir atendimento</Link>
                    ) : (
                      <button type="button" className="btn" onClick={() => setCriarDe(v.id)}>Criar laudo/orçamento</button>
                    )}
                  </div>
                  <div className="vis-rodape">
                    <label>Situação
                      <select value={v.status} onChange={(e) => {
                        const st = e.target.value;
                        if (st === 'realizada' && v.token && !window.confirm('Marcar como visita feita? O link do cliente será desativado.')) return;
                        mudar(v.id, { status: st });
                      }}>
                        {ORDEM_VISITA.map((k) => <option key={k} value={k}>{STATUS_VISITA[k].rotulo}</option>)}
                      </select>
                    </label>
                    <button type="button" className="btn warn" onClick={() => excluir(v.id)}>{armado === v.id ? 'Confirmar' : 'Excluir'}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
