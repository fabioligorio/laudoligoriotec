'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Texto, Area, Linhas } from './Campos';
import { OPCOES_DESENHO } from './Icones';

export default function ModeloEditor({ inicial }) {
  const [m, setM] = useState(inicial);
  const [estado, setEstado] = useState({ tipo: '', msg: '' });
  const set = (k, v) => { setM((p) => ({ ...p, [k]: v })); setEstado({ tipo: 'pendente', msg: 'Alterações não salvas' }); };

  async function salvar() {
    setEstado({ tipo: 'salvando', msg: 'Salvando…' });
    const res = await fetch('/api/modelo', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(m),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setEstado({ tipo: 'erro', msg: j.erro || 'Não foi possível salvar.' }); return; }
    setM(j);
    setEstado({ tipo: 'ok', msg: 'Modelo salvo. Vale para os próximos relatórios.' });
  }

  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Link href="/" className="btn ghost">← Relatórios</Link>
          <h1>Modelo</h1>
          <span className="sp" />
          <span className={'estado' + (estado.tipo === 'erro' ? ' erro' : '')} role="status">{estado.msg}</span>
          <button className="btn primary" type="button" onClick={salvar} disabled={estado.tipo === 'salvando'}>Salvar modelo</button>
        </div>
      </header>

      <div className="modelo">
        <p className="hint" style={{ fontSize: 14 }}>
          Técnico, site, WhatsApp, desenho e títulos entram sozinhos em todo relatório novo. Os outros textos só entram quando você clica em Preencher com o modelo dentro do relatório. Relatórios que já existem não mudam.
        </p>

        <section className="bloco">
          <fieldset>
            <legend>Empresa</legend>
            <Texto id="m-tecnico" rotulo="Técnico responsável" valor={m.tecnico} onChange={(v) => set('tecnico', v)} />
            <div className="row">
              <Texto id="m-site" rotulo="Site" valor={m.site} onChange={(v) => set('site', v)} />
              <Texto id="m-zap" rotulo="WhatsApp" valor={m.zap} onChange={(v) => set('zap', v)} />
            </div>
          </fieldset>
        </section>

        <section className="bloco">
          <fieldset>
            <legend>Equipamento mais comum</legend>
            <Texto id="m-equip" rotulo="Equipamento" dica="pode ficar vazio" valor={m.equip} onChange={(v) => set('equip', v)} />
            <Texto id="m-comp" rotulo="Componente" valor={m.comp} onChange={(v) => set('comp', v)} />
            <Texto id="m-alim" rotulo="Alimentação" valor={m.alim} onChange={(v) => set('alim', v)} />
            <label htmlFor="m-icone">Desenho do equipamento
              <select id="m-icone" value={m.icone} onChange={(e) => set('icone', e.target.value)}>
                {OPCOES_DESENHO.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </label>
          </fieldset>
        </section>

        <section className="bloco">
          <fieldset>
            <legend>Laudo</legend>
            <Area id="m-proc" rotulo="Procedimentos executados" dica="um por linha" linhas={5} valor={m.proc} onChange={(v) => set('proc', v)} />
            <Area id="m-ensaios" rotulo="Ensaios da tabela de resultados" dica="um por linha; o resultado é preenchido em cada relatório" linhas={6} valor={m.ensaios} onChange={(v) => set('ensaios', v)} />
          </fieldset>
        </section>

        <section className="bloco">
          <fieldset>
            <legend>Orçamento</legend>
            <div className="row">
              <Texto id="m-tDef" rotulo="Título das fotos da peça com defeito" valor={m.tDef} onChange={(v) => set('tDef', v)} />
              <Texto id="m-tNew" rotulo="Título da peça nova" valor={m.tNew} onChange={(v) => set('tNew', v)} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 12.5 }}>Serviços que já entram no orçamento</span>
            <Linhas id="m-servicos" dinheiro linhas={m.servicos} phA="Descrição do serviço" phB="Valor" rotuloAdd="+ Adicionar serviço" onChange={(v) => set('servicos', v)} />
            <Area id="m-gar" rotulo="Garantia" dica="uma linha por item" linhas={2} valor={m.gar} onChange={(v) => set('gar', v)} />
            <Texto id="m-garObs" rotulo="Observação da garantia" valor={m.garObs} onChange={(v) => set('garObs', v)} />
            <Texto id="m-pag" rotulo="Condições de pagamento" valor={m.pag} onChange={(v) => set('pag', v)} />
            <Texto id="m-prazo" rotulo="Prazo de execução" valor={m.prazo} onChange={(v) => set('prazo', v)} />
          </fieldset>
        </section>
      </div>
    </>
  );
}
