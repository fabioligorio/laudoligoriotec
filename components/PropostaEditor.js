'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PropostaDoc, { FolhasProposta } from './PropostaDoc';
import { Texto, Area, Linhas, Foto } from './Campos';
import { Logo } from './Marca';
import { brl } from '@/lib/format';
import { STATUS_PROPOSTA, numeroProposta, totalProposta, subtotal, vencida } from '@/lib/propostas';
import { zapDoCliente } from '@/lib/visitas';

async function api(url, opts) {
  const res = await fetch(url, { ...opts, headers: { 'content-type': 'application/json', ...(opts?.headers || {}) } });
  if (res.status === 401) { window.location.href = '/login'; throw new Error('Sessão expirada.'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.erro || 'Algo deu errado. Tente de novo.');
  return j;
}
const hora = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
const mover = (lista, i, d) => {
  const j = i + d;
  if (j < 0 || j >= lista.length) return lista;
  const c = [...lista];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
};

const AJUDA = 'Uma linha por parágrafo. "- " faz item de lista, "1. " lista numerada, "## " subtítulo e "Coluna 1 | Coluna 2" tabela (a primeira linha é o cabeçalho). Em itens, o que vem antes de ":" fica em negrito.';

export default function PropostaEditor({ inicial }) {
  const router = useRouter();
  const [p, setP] = useState(inicial);
  const [aba, setAba] = useState('dados');
  const [vista, setVista] = useState('form');
  const [estado, setEstado] = useState({ tipo: 'salvo', msg: '' });
  const [armado, setArmado] = useState('');
  const [origem, setOrigem] = useState('');
  const [copiado, setCopiado] = useState(false);
  const sujo = useRef(false);
  const timer = useRef(null);
  const atual = useRef(p);
  atual.current = p;

  const travada = p.status === 'aprovada';
  const link = p.token ? `${origem}/p/${p.token}` : '';
  useEffect(() => setOrigem(window.location.origin), []);

  function set(k, v) {
    sujo.current = true;
    setEstado({ tipo: 'pendente', msg: '' });
    setP((x) => ({ ...x, [k]: v }));
  }

  async function salvar(msgOk = '') {
    clearTimeout(timer.current);
    sujo.current = false;
    setEstado({ tipo: 'salvando', msg: '' });
    try {
      const j = await api(`/api/propostas/${p.id}`, { method: 'PUT', body: JSON.stringify({ proposta: atual.current }) });
      setP((x) => ({ ...x, atualizadoEm: j.atualizadoEm }));
      setEstado({ tipo: sujo.current ? 'pendente' : 'salvo', msg: msgOk });
      return true;
    } catch (e) {
      sujo.current = true;
      setEstado({ tipo: 'erro', msg: e.message });
      return false;
    }
  }

  useEffect(() => {
    if (!sujo.current || travada) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => salvar(), 1500);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  useEffect(() => {
    const aviso = (e) => { if (sujo.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, []);

  function confirmar(chave, acao) {
    if (armado !== chave) {
      setArmado(chave);
      setTimeout(() => setArmado((a) => (a === chave ? '' : a)), 4000);
      return;
    }
    setArmado('');
    acao();
  }

  async function acaoLink(acao) {
    if (sujo.current && !(await salvar())) return;
    try {
      const j = await api(`/api/propostas/${p.id}/link`, { method: 'POST', body: JSON.stringify({ acao }) });
      setP(j);
      setEstado({ tipo: 'salvo', msg: acao === 'desativar' ? 'Link desativado.' : 'Link pronto.' });
    } catch (e) {
      setEstado({ tipo: 'erro', msg: e.message });
    }
  }

  async function mudarStatus(corpo, msg) {
    if (sujo.current && !travada && !(await salvar())) return;
    try {
      const j = await api(`/api/propostas/${p.id}`, { method: 'PUT', body: JSON.stringify(corpo) });
      setP(j);
      setEstado({ tipo: 'salvo', msg });
    } catch (e) {
      setEstado({ tipo: 'erro', msg: e.message });
    }
  }

  async function duplicar() {
    if (sujo.current && !travada) await salvar();
    try {
      const j = await api('/api/propostas', { method: 'POST', body: JSON.stringify({ duplicarDe: p.id }) });
      router.push(`/propostas/${j.id}`);
    } catch (e) {
      setEstado({ tipo: 'erro', msg: e.message });
    }
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }
    catch { setEstado({ tipo: 'erro', msg: `Não deu para copiar. O link é ${link}` }); }
  }

  // listas
  const secoes = p.secoes || [];
  const setSecao = (i, campo, v) => set('secoes', secoes.map((s, k) => (k === i ? { ...s, [campo]: v } : s)));
  const itens = p.itens || [];
  const setItem = (i, campo, v) => set('itens', itens.map((it, k) => (k === i ? { ...it, [campo]: v } : it)));
  const opcionais = p.opcionais || [];
  const setOpc = (i, campo, v) => set('opcionais', opcionais.map((o, k) => (k === i ? { ...o, [campo]: v } : o)));

  const zapCli = zapDoCliente(p.clienteZap);
  const nome1 = String(p.responsavel || '').split(' ')[0];
  const msgEnvio = `Olá${nome1 ? `, ${nome1}` : ''}! Aqui é o Fábio, da LigorioTec. Segue a proposta${p.titulo ? ` de ${p.titulo}` : ''}${p.cliente ? ` para ${p.cliente}` : ''}. Você pode ler, baixar em PDF e aprovar por este link: ${link}`;

  const textoEstado = {
    salvo: estado.msg || (p.atualizadoEm ? `Salvo ${hora(p.atualizadoEm)}` : ''),
    pendente: 'Alterações não salvas…',
    salvando: 'Salvando…',
    erro: estado.msg,
  }[estado.tipo];
  const st = STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho;

  return (
    <>
      <header className="topo no-print">
        <div className="topo-in">
          <Link href="/propostas" className="marca-link so-desktop" aria-label="Voltar para as propostas"><Logo escuro altura={30} /></Link>
          <Link href="/propostas" className="btn ghost">← Propostas</Link>
          <strong style={{ fontSize: 15 }}>{numeroProposta(p)}{p.cliente ? ` · ${p.cliente}` : ''}</strong>
          <span className={`pill ${st.classe}`}>{st.rotulo}</span>
          <span className="sp" />
          <span className={'estado' + (estado.tipo === 'erro' ? ' erro' : '')} role="status">{textoEstado}</span>
        </div>
      </header>

      <div className="app" data-vista={vista}>
        <aside className="side no-print">
          {travada ? (
            <p className="aviso">
              Aprovada por <b>{p.aprovacao?.nome}</b> em {hora(p.aprovacao?.em)}. O texto fica travado para guardar o que o cliente aprovou. Para mudar, use <b>Reabrir</b> na aba Envio (o cliente precisa aprovar de novo) ou <b>Duplicar</b>.
            </p>
          ) : (
            <p className="aviso">Tudo é salvo sozinho. Quando terminar, gere o link na aba <b>Envio</b> e mande ao cliente pelo WhatsApp.</p>
          )}
          <div className="tabs" role="tablist">
            {[['dados', 'Dados'], ['conteudo', 'Conteúdo'], ['invest', 'Investimento'], ['cond', 'Condições'], ['envio', 'Envio']].map(([k, t]) => (
              <button key={k} role="tab" aria-selected={aba === k} onClick={() => setAba(k)}>{t}</button>
            ))}
          </div>
          <div className="form">
            <fieldset className="trava" disabled={travada}>
              <div className="painel" hidden={aba !== 'dados'}>
                <fieldset>
                  <legend>Proposta</legend>
                  <Texto id="titulo" rotulo="Título do projeto" placeholder="Ex.: Controle de Acesso Facial" valor={p.titulo} onChange={(v) => set('titulo', v)} />
                  <div className="row">
                    <Texto id="data" tipo="date" rotulo="Data" valor={p.data} onChange={(v) => set('data', v)} />
                    <Texto id="num" rotulo="Nº da proposta" valor={p.num} onChange={(v) => set('num', v)} />
                  </div>
                  <Texto id="validade" tipo="number" rotulo="Validade (dias)" dica="0 = sem validade" valor={p.validadeDias} onChange={(v) => set('validadeDias', v)} />
                </fieldset>
                <fieldset>
                  <legend>Cliente</legend>
                  <Texto id="cliente" rotulo="Cliente (empresa ou nome)" valor={p.cliente} onChange={(v) => set('cliente', v)} />
                  <div className="row">
                    <Texto id="resp" rotulo="Aos cuidados de" dica="opcional" valor={p.responsavel} onChange={(v) => set('responsavel', v)} />
                    <Texto id="zap" tipo="tel" rotulo="WhatsApp do cliente" dica="com DDD" valor={p.clienteZap} onChange={(v) => set('clienteZap', v)} />
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Apresentação</legend>
                  <Texto id="objeto" rotulo="Objeto" placeholder="Ex.: Fornecimento e implantação de…" valor={p.objeto} onChange={(v) => set('objeto', v)} />
                  <Area id="resumo" rotulo="Resumo da proposta" dica="o parágrafo de abertura" linhas={4} valor={p.resumo} onChange={(v) => set('resumo', v)} />
                </fieldset>
              </div>

              <div className="painel" hidden={aba !== 'conteudo'}>
                <p className="hint pe-ajuda">{AJUDA}</p>
                {secoes.map((s, i) => (
                  <fieldset key={i} className="pe-secao">
                    <legend>Seção {i + 1}</legend>
                    <div className="pe-sec-acoes">
                      <button type="button" className="icon-btn" aria-label="Subir seção" onClick={() => set('secoes', mover(secoes, i, -1))} disabled={i === 0}>↑</button>
                      <button type="button" className="icon-btn" aria-label="Descer seção" onClick={() => set('secoes', mover(secoes, i, 1))} disabled={i === secoes.length - 1}>↓</button>
                      <button type="button" className="icon-btn" aria-label="Remover seção" onClick={() => confirmar(`sec${i}`, () => set('secoes', secoes.filter((_, k) => k !== i)))}>
                        {armado === `sec${i}` ? '✓?' : '×'}
                      </button>
                    </div>
                    <Texto id={`sec-t-${i}`} rotulo="Título" valor={s.titulo} onChange={(v) => setSecao(i, 'titulo', v)} />
                    <Area id={`sec-x-${i}`} rotulo="Texto" linhas={8} valor={s.texto} onChange={(v) => setSecao(i, 'texto', v)} />
                    <span className="pe-rot">Imagens <small>(fotos de produtos, plantas, layout)</small></span>
                    <div className="pe-imgs">
                      {(s.imagens || []).map((im, j) => (
                        <div key={j} className="pe-img">
                          <Foto id={`sec-i-${i}-${j}`} src={im.url} max={1600} onChange={(url) => setSecao(i, 'imagens', url ? s.imagens.map((x, k) => (k === j ? { ...x, url } : x)) : s.imagens.filter((_, k) => k !== j))} />
                          <input type="text" placeholder="Legenda" aria-label="Legenda da imagem" value={im.legenda || ''} onChange={(e) => setSecao(i, 'imagens', s.imagens.map((x, k) => (k === j ? { ...x, legenda: e.target.value } : x)))} />
                        </div>
                      ))}
                      {(s.imagens || []).length < 6 && (
                        <div className="pe-img">
                          <Foto id={`sec-n-${i}`} src="" max={1600} rotulo="imagem" onChange={(url) => url && setSecao(i, 'imagens', [...(s.imagens || []), { url, legenda: '' }])} />
                        </div>
                      )}
                    </div>
                  </fieldset>
                ))}
                <button type="button" className="add" onClick={() => set('secoes', [...secoes, { titulo: '', texto: '', imagens: [] }])}>+ Adicionar seção</button>
              </div>

              <div className="painel" hidden={aba !== 'invest'}>
                <fieldset>
                  <legend>Itens</legend>
                  <div className="pe-itens">
                    {itens.map((it, i) => (
                      <div key={i} className="pe-item">
                        <textarea rows={2} placeholder="Descrição do item" aria-label="Descrição do item" value={it.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} />
                        <div className="pe-item-nums">
                          <label>Qtd<input type="number" min="0" step="1" value={it.qtd} onChange={(e) => setItem(i, 'qtd', e.target.value === '' ? '' : Number(e.target.value))} /></label>
                          <label>Valor unit. (R$)<input type="number" min="0" step="0.01" value={it.valor} onChange={(e) => setItem(i, 'valor', e.target.value === '' ? '' : Number(e.target.value))} /></label>
                          <span className="pe-sub">R$ {brl(subtotal(it))}</span>
                          <button type="button" className="icon-btn" aria-label="Remover item" onClick={() => set('itens', itens.filter((_, k) => k !== i))}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="add" onClick={() => set('itens', [...itens, { desc: '', qtd: 1, valor: '' }])}>+ Adicionar item</button>
                  <p className="pe-total">Total: <b>R$ {brl(totalProposta(p))}</b></p>
                  <Texto id="txtInv" rotulo="Complemento da frase do total" dica="opcional" placeholder="Ex.: pago uma única vez, e o equipamento passa a ser do clube" valor={p.textoInvestimento} onChange={(v) => set('textoInvestimento', v)} />
                  <Area id="notaInv" rotulo="Observação abaixo da tabela" dica="opcional" linhas={2} placeholder="Ex.: O frete não está incluído." valor={p.notaInvestimento} onChange={(v) => set('notaInvestimento', v)} />
                </fieldset>
                <fieldset>
                  <legend>Opcionais</legend>
                  {opcionais.map((o, i) => (
                    <div key={i} className="pe-opc">
                      <div className="pe-opc-topo">
                        <Texto id={`opc-t-${i}`} rotulo="Título e valor" placeholder="Ex.: Suporte mensal: R$ 350,00/mês" valor={o.titulo} onChange={(v) => setOpc(i, 'titulo', v)} />
                        <button type="button" className="icon-btn" aria-label="Remover opcional" onClick={() => set('opcionais', opcionais.filter((_, k) => k !== i))}>×</button>
                      </div>
                      <Area id={`opc-x-${i}`} rotulo="O que inclui" linhas={3} valor={o.texto} onChange={(v) => setOpc(i, 'texto', v)} />
                    </div>
                  ))}
                  <button type="button" className="add" onClick={() => set('opcionais', [...opcionais, { titulo: '', texto: '- ' }])}>+ Adicionar opcional</button>
                </fieldset>
              </div>

              <div className="painel" hidden={aba !== 'cond'}>
                <fieldset>
                  <legend>Condições comerciais</legend>
                  <Linhas id="cond" linhas={p.condicoes} phA="Ex.: Forma de pagamento" phB="Ex.: 50% na aprovação e 50% na entrega" rotuloAdd="+ Adicionar condição" onChange={(v) => set('condicoes', v)} />
                </fieldset>
                <fieldset>
                  <legend>Fechamento</legend>
                  <Area id="fecho" rotulo="Texto final" linhas={3} valor={p.fechamento} onChange={(v) => set('fechamento', v)} />
                </fieldset>
              </div>
            </fieldset>

            {aba === 'envio' && (
              <div className="painel">
                <fieldset>
                  <legend>Link para o cliente</legend>
                  {!p.token ? (
                    <>
                      <p className="hint">O cliente abre o link no celular, lê a proposta, baixa o PDF e aprova digitando o nome.</p>
                      <button type="button" className="btn primary" onClick={() => acaoLink('gerar')}>Gerar link da proposta</button>
                    </>
                  ) : (
                    <>
                      <code className="pe-link">{link}</code>
                      {!p.linkAtivo && <p className="estado erro">Link desativado: o cliente vê "Link indisponível".</p>}
                      {vencida(p) && <p className="estado erro">A validade terminou: o cliente não consegue aprovar. Aumente a validade ou a data na aba Dados.</p>}
                      <div className="pe-link-acoes">
                        {p.linkAtivo && zapCli && <a className="btn primary" href={`${zapCli}?text=${encodeURIComponent(msgEnvio)}`} target="_blank" rel="noopener">Enviar pelo WhatsApp</a>}
                        {p.linkAtivo && <button type="button" className="btn" onClick={copiar}>{copiado ? 'Copiado ✓' : 'Copiar link'}</button>}
                        {p.linkAtivo && <a className="btn" href={`/p/${p.token}`} target="_blank" rel="noopener">Ver como o cliente</a>}
                      </div>
                      {p.linkAtivo && !zapCli && <p className="hint">Coloque o WhatsApp do cliente na aba Dados para enviar direto.</p>}
                      <div className="pe-link-acoes">
                        {p.linkAtivo
                          ? <button type="button" className="btn ghost" onClick={() => acaoLink('desativar')}>Desativar link</button>
                          : <button type="button" className="btn" onClick={() => acaoLink('ativar')}>Ativar link de novo</button>}
                        <button type="button" className="btn ghost" onClick={() => confirmar('novo', () => acaoLink('novo'))}>{armado === 'novo' ? 'Confirmar: o link antigo para de funcionar' : 'Trocar o link'}</button>
                      </div>
                    </>
                  )}
                </fieldset>
                <fieldset>
                  <legend>Situação</legend>
                  {travada ? (
                    <>
                      <p className="pe-aprov">✓ Aprovada por <b>{p.aprovacao?.nome}</b> em {hora(p.aprovacao?.em)}{p.aprovacao?.ip ? ` (endereço de internet ${p.aprovacao.ip})` : ''}.</p>
                      <button type="button" className="btn warn" onClick={() => confirmar('reabrir', () => mudarStatus({ reabrir: true }, 'Proposta reaberta.'))}>
                        {armado === 'reabrir' ? 'Confirmar: apaga a aprovação do cliente' : 'Reabrir para editar'}
                      </button>
                    </>
                  ) : (
                    <div className="seg">
                      {['rascunho', 'enviada', 'recusada'].map((k) => (
                        <button key={k} type="button" aria-pressed={p.status === k} onClick={() => mudarStatus({ status: k }, `Marcada como ${STATUS_PROPOSTA[k].rotulo.toLowerCase()}.`)}>
                          {STATUS_PROPOSTA[k].rotulo}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="hint">Quando o cliente aprova pelo link, a proposta muda sozinha para Aprovada.</p>
                </fieldset>
              </div>
            )}
          </div>
        </aside>

        <main className="main">
          <div className="bar no-print">
            <button className="btn primary" type="button" onClick={() => window.print()}>Salvar PDF / Imprimir</button>
            <span className="sp" />
            <button className="btn" type="button" onClick={duplicar}>Duplicar</button>
            {!travada && <button className="btn primary" type="button" onClick={() => salvar('Salvo.')} disabled={estado.tipo === 'salvando'}>Salvar</button>}
          </div>
          <div className="prop-previa">
            <FolhasProposta><PropostaDoc p={p} /></FolhasProposta>
          </div>
        </main>
      </div>

      <nav className="so-mobile nav-baixo no-print" aria-label="Alternar entre formulário e proposta">
        <div className="seg-nav">
          <button type="button" aria-pressed={vista === 'form'} onClick={() => { setVista('form'); window.scrollTo(0, 0); }}>Formulário</button>
          <button type="button" aria-pressed={vista === 'folhas'} onClick={() => { setVista('folhas'); window.scrollTo(0, 0); }}>Ver proposta</button>
        </div>
        {!travada ? (
          <button className="btn primary" type="button" onClick={() => salvar('Salvo.')} disabled={estado.tipo === 'salvando'}>{estado.tipo === 'salvando' ? 'Salvando…' : 'Salvar'}</button>
        ) : (
          <button className="btn primary" type="button" onClick={() => window.print()}>PDF</button>
        )}
      </nav>
    </>
  );
}
