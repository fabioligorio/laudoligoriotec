'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Folhas } from './Documento';
import { Texto, Area, Linhas, Foto } from './Campos';
import { OPCOES_DESENHO } from './Icones';
import { autoNum, numero } from '@/lib/format';

async function api(url, opts) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'content-type': 'application/json', ...(opts?.headers || {}) },
  });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Sessão expirada.');
  }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.erro || 'Algo deu errado. Tente de novo.');
  return j;
}

const hora = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

export default function Editor({ inicial }) {
  const router = useRouter();
  const [r, setR] = useState(inicial);
  const [aba, setAba] = useState('t1');
  const [estado, setEstado] = useState({ tipo: 'salvo', msg: '' });
  const [armado, setArmado] = useState('');
  const sujo = useRef(false);
  const timer = useRef(null);
  const rAtual = useRef(r);
  rAtual.current = r;

  const travado = r.status === 'concluido';

  function set(k, v) {
    sujo.current = true;
    setEstado({ tipo: 'pendente', msg: '' });
    setR((p) => ({ ...p, [k]: v }));
  }

  async function salvar(acao = 'salvar') {
    clearTimeout(timer.current);
    sujo.current = false;
    setEstado({ tipo: 'salvando', msg: '' });
    try {
      const j = await api(`/api/relatorios/${r.id}`, {
        method: 'PUT',
        body: JSON.stringify({ acao, relatorio: rAtual.current }),
      });
      if (acao === 'salvar') {
        setR((p) => ({ ...p, atualizadoEm: j.atualizadoEm }));
      } else {
        setR(j);
      }
      setEstado({ tipo: sujo.current ? 'pendente' : 'salvo', msg: '' });
      return true;
    } catch (e) {
      sujo.current = true;
      setEstado({ tipo: 'erro', msg: e.message });
      return false;
    }
  }

  // Salva sozinho 1 segundo depois da última alteração
  useEffect(() => {
    if (!sujo.current || travado) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => salvar('salvar'), 1000);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);

  // Avisa antes de fechar a página com alteração não salva
  useEffect(() => {
    const aviso = (e) => {
      if (sujo.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, []);

  // Botões que pedem um segundo clique para confirmar
  function confirmar(chave, acao) {
    if (armado !== chave) {
      setArmado(chave);
      setTimeout(() => setArmado((a) => (a === chave ? '' : a)), 4000);
      return;
    }
    setArmado('');
    acao();
  }

  async function concluir() {
    if (await salvar('concluir')) setEstado({ tipo: 'salvo', msg: 'Relatório concluído.' });
  }
  async function reabrir() {
    if (await salvar('reabrir')) setEstado({ tipo: 'salvo', msg: 'Relatório reaberto para edição.' });
  }
  async function duplicar() {
    try {
      const j = await api('/api/relatorios', { method: 'POST', body: JSON.stringify({ duplicarDe: r.id }) });
      router.push(`/r/${j.id}`);
    } catch (e) {
      setEstado({ tipo: 'erro', msg: e.message });
    }
  }
  function imprimir(qual) {
    const limpar = () => {
      delete document.body.dataset.imprimir;
      window.removeEventListener('afterprint', limpar);
    };
    document.body.dataset.imprimir = qual;
    window.addEventListener('afterprint', limpar);
    window.print();
  }

  const textoEstado = {
    salvo: estado.msg || (r.atualizadoEm ? `Salvo ${hora(r.atualizadoEm)}` : ''),
    pendente: 'Alterações não salvas…',
    salvando: 'Salvando…',
    erro: estado.msg,
  }[estado.tipo];

  return (
    <>
      <header className="topo no-print">
        <div className="topo-in">
          <Link href="/" className="btn ghost">← Relatórios</Link>
          <strong style={{ fontSize: 15 }}>{numero(r)}{r.cliente ? ` · ${r.cliente}` : ''}</strong>
          <span className={`pill ${r.status}`}>{travado ? 'Concluído' : 'Rascunho'}</span>
          <span className="sp" />
          <span className={'estado' + (estado.tipo === 'erro' ? ' erro' : '')} role="status">{textoEstado}</span>
        </div>
      </header>

      <div className="app">
        <aside className="side no-print">
          {travado ? (
            <p className="aviso">
              Concluído em {hora(r.concluidoEm)}. Para alterar, use <b>Reabrir para edição</b>. Para um atendimento parecido, use <b>Duplicar</b>.
            </p>
          ) : (
            <p className="aviso">As alterações são salvas sozinhas. Quando terminar, clique em <b>Concluir</b>.</p>
          )}
          <div className="tabs" role="tablist">
            {[['t1', 'Atendimento'], ['t2', 'Laudo'], ['t3', 'Orçamento']].map(([k, t]) => (
              <button key={k} id={`tab-${k}`} role="tab" aria-selected={aba === k} onClick={() => setAba(k)}>{t}</button>
            ))}
          </div>
          <div className="form">
            <fieldset className="trava" disabled={travado}>
              <div className="painel" hidden={aba !== 't1'}>
                <fieldset>
                  <legend>Cliente</legend>
                  <Texto id="cliente" rotulo="Nome do cliente" valor={r.cliente} onChange={(v) => set('cliente', v)} />
                  <div className="row">
                    <Texto id="data" tipo="date" rotulo="Data da inspeção" valor={r.data} onChange={(v) => set('data', v)} />
                    <Texto id="num" rotulo="Nº do laudo" dica="vazio = automático" placeholder={autoNum(r)} valor={r.num} onChange={(v) => set('num', v)} />
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Equipamento</legend>
                  <Texto id="equip" rotulo="Equipamento" valor={r.equip} onChange={(v) => set('equip', v)} />
                  <Texto id="comp" rotulo="Componente" valor={r.comp} onChange={(v) => set('comp', v)} />
                  <Texto id="alim" rotulo="Alimentação" valor={r.alim} onChange={(v) => set('alim', v)} />
                  <label htmlFor="icone">Desenho do equipamento
                    <select id="icone" value={r.icone} onChange={(e) => set('icone', e.target.value)}>
                      {OPCOES_DESENHO.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                  </label>
                  {r.icone === 'foto' && (
                    <div className="fotos">
                      <Foto id="eq-foto" src={r.eqPhoto} bloqueado={travado} onChange={(v) => set('eqPhoto', v)} />
                    </div>
                  )}
                </fieldset>
                <fieldset>
                  <legend>Empresa</legend>
                  <Texto id="tecnico" rotulo="Técnico responsável" valor={r.tecnico} onChange={(v) => set('tecnico', v)} />
                  <div className="row">
                    <Texto id="site" rotulo="Site" valor={r.site} onChange={(v) => set('site', v)} />
                    <Texto id="zap" rotulo="WhatsApp" valor={r.zap} onChange={(v) => set('zap', v)} />
                  </div>
                  <p className="hint">Esses dados vêm do modelo. Mudar aqui altera só este relatório.</p>
                </fieldset>
              </div>

              <div className="painel" hidden={aba !== 't2'}>
                <fieldset>
                  <legend>3. Reclamação informada</legend>
                  <Area id="recl" valor={r.recl} onChange={(v) => set('recl', v)} />
                </fieldset>
                <fieldset>
                  <legend>4. Procedimentos executados</legend>
                  <Area id="proc" dica="Um procedimento por linha" valor={r.proc} linhas={5} onChange={(v) => set('proc', v)} />
                </fieldset>
                <fieldset>
                  <legend>5. Resultados obtidos</legend>
                  <Linhas id="res" linhas={r.res} phA="Ensaio / verificação" phB="Resultado" rotuloAdd="+ Adicionar ensaio" onChange={(v) => set('res', v)} />
                </fieldset>
                <fieldset>
                  <legend>6. Diagnóstico técnico</legend>
                  <Area id="diag" valor={r.diag} linhas={5} onChange={(v) => set('diag', v)} />
                </fieldset>
                <fieldset>
                  <legend>7. Conclusão</legend>
                  <Area id="concl" valor={r.concl} onChange={(v) => set('concl', v)} />
                  <div className="seg">
                    <button type="button" className="rep" aria-pressed={r.resultado !== 'APROVADO'} onClick={() => set('resultado', 'REPROVADO')}>Reprovado</button>
                    <button type="button" className="apr" aria-pressed={r.resultado === 'APROVADO'} onClick={() => set('resultado', 'APROVADO')}>Aprovado</button>
                  </div>
                </fieldset>
              </div>

              <div className="painel" hidden={aba !== 't3'}>
                <fieldset>
                  <legend>Fotos da peça com defeito (até 4)</legend>
                  <div className="fotos">
                    {[0, 1, 2, 3].map((i) => (
                      <Foto
                        key={i}
                        id={`def-${i}`}
                        src={(r.defPhotos || [])[i]}
                        bloqueado={travado}
                        onChange={(v) => {
                          const arr = [...(r.defPhotos || [])];
                          arr[i] = v;
                          set('defPhotos', arr);
                        }}
                      />
                    ))}
                  </div>
                  <Texto id="tDef" rotulo="Título das fotos" valor={r.tDef} onChange={(v) => set('tDef', v)} />
                </fieldset>
                <fieldset>
                  <legend>Peça nova</legend>
                  <div className="fotos"><Foto id="nova" src={r.newPhoto} bloqueado={travado} onChange={(v) => set('newPhoto', v)} /></div>
                  <Texto id="tNew" rotulo="Título" valor={r.tNew} onChange={(v) => set('tNew', v)} />
                  <Texto id="peca" rotulo="Nome da peça" dica="vazio = sem bloco de peça" valor={r.peca} onChange={(v) => set('peca', v)} />
                  <Texto id="pecaV" tipo="number" rotulo="Valor da peça (R$)" valor={r.pecaV} onChange={(v) => set('pecaV', v)} />
                  <label className="check" htmlFor="pecaItem">
                    <input id="pecaItem" type="checkbox" checked={!!r.pecaItem} onChange={(e) => set('pecaItem', e.target.checked)} />
                    Incluir a peça como último item do orçamento
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Serviços</legend>
                  <Linhas id="itens" dinheiro linhas={r.itens} phA="Descrição do serviço" phB="Valor" rotuloAdd="+ Adicionar serviço" onChange={(v) => set('itens', v)} />
                </fieldset>
                <fieldset>
                  <legend>Garantia</legend>
                  <Area id="gar" dica="Uma linha por item" valor={r.gar} linhas={2} onChange={(v) => set('gar', v)} />
                  <Texto id="garObs" rotulo="Observação" valor={r.garObs} onChange={(v) => set('garObs', v)} />
                </fieldset>
                <fieldset>
                  <legend>Pagamento e prazo</legend>
                  <Texto id="pag" rotulo="Condições de pagamento" valor={r.pag} onChange={(v) => set('pag', v)} />
                  <Texto id="prazo" rotulo="Prazo de execução" valor={r.prazo} onChange={(v) => set('prazo', v)} />
                </fieldset>
              </div>
            </fieldset>
          </div>
        </aside>

        <main className="main">
          <div className="bar no-print">
            <button className="btn primary" type="button" onClick={() => imprimir('B')}>Salvar PDF / Imprimir</button>
            <button className="btn" type="button" onClick={() => imprimir('L')}>Só laudo</button>
            <button className="btn" type="button" onClick={() => imprimir('O')}>Só orçamento</button>
            <span className="sp" />
            {travado ? (
              <>
                <button className="btn" type="button" onClick={duplicar}>Duplicar</button>
                <button className="btn warn" type="button" onClick={() => confirmar('reabrir', reabrir)}>
                  {armado === 'reabrir' ? 'Clique de novo para reabrir' : 'Reabrir para edição'}
                </button>
              </>
            ) : (
              <>
                <button className="btn" type="button" onClick={() => salvar('salvar')} disabled={estado.tipo === 'salvando'}>Salvar agora</button>
                <button className="btn ok" type="button" onClick={() => confirmar('concluir', concluir)} disabled={estado.tipo === 'salvando'}>
                  {armado === 'concluir' ? 'Confirmar conclusão' : 'Concluir'}
                </button>
              </>
            )}
          </div>
          <Folhas r={r} />
        </main>
      </div>
    </>
  );
}
