'use client';
import { useEffect, useState } from 'react';
import { EQUIPAMENTOS } from '@/lib/visitas';

const VAZIO = {
  nome: '', whatsapp: '', endereco: '', bairro: '', cidade: 'Curitiba',
  equipamento: 'Portão eletrônico', marca: '', problema: '', agendaDia: '', agendaHora: '', taxa: '', obs: '',
};

function mascara(v) {
  const d = v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Janela para criar ou editar uma solicitação de visita (uso interno)
export default function VisitaEditor({ inicial, fechar, salvo }) {
  const editando = !!inicial?.id;
  const [f, setF] = useState(() => ({ ...VAZIO, ...(inicial || {}) }));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: k === 'whatsapp' ? mascara(e.target.value) : e.target.value }));

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [fechar]);

  async function salvar(e) {
    e.preventDefault();
    if (!editando && (!f.agendaDia || !f.agendaHora)) { setErro('Informe o dia e o horário da visita.'); return; }
    setSalvando(true);
    setErro('');
    try {
      const res = await fetch(editando ? `/api/solicitacoes/${inicial.id}` : '/api/solicitacoes', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editando ? { dados: f, obs: f.obs } : f),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível salvar.');
      salvo(j, !editando);
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  return (
    <div className="modal-fundo" onClick={fechar}>
      <form className="modal modal-grande vis-form" role="dialog" aria-modal="true" aria-labelledby="titulo-visita" onClick={(e) => e.stopPropagation()} onSubmit={salvar} noValidate>
        <div className="modal-topo">
          <h3 id="titulo-visita">{editando ? 'Editar solicitação' : 'Nova solicitação de visita'}</h3>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={fechar}>×</button>
        </div>

        <fieldset>
          <legend>Cliente</legend>
          <label>Nome *
            <input autoFocus value={f.nome} onChange={set('nome')} maxLength={120} />
          </label>
          <label>WhatsApp com DDD
            <input type="tel" inputMode="tel" placeholder="(41) 99999-9999" value={f.whatsapp} onChange={set('whatsapp')} />
          </label>
          <label>Rua e número
            <input value={f.endereco} onChange={set('endereco')} maxLength={200} />
          </label>
          <div className="vis-linha">
            <label>Bairro<input value={f.bairro} onChange={set('bairro')} maxLength={80} /></label>
            <label>Cidade<input value={f.cidade} onChange={set('cidade')} maxLength={80} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Equipamento</legend>
          <div className="vis-linha">
            <label>Tipo
              <select value={f.equipamento} onChange={set('equipamento')}>
                {EQUIPAMENTOS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </label>
            <label>Marca e modelo<input value={f.marca} onChange={set('marca')} maxLength={120} /></label>
          </div>
          <label>Problema informado
            <textarea rows={3} value={f.problema} onChange={set('problema')} maxLength={2000} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Dia e horário da visita</legend>
          <p className="hint">O cliente vê o dia e o horário no link e toca em <b>Confirmar visita</b>.</p>
          <div className="vis-linha">
            <label>Dia *<input type="date" required value={f.agendaDia} onChange={set('agendaDia')} /></label>
            <label>Horário *<input type="time" required value={f.agendaHora} onChange={set('agendaHora')} /></label>
          </div>
          <label><span>Valor da visita <span className="opc">(aparece para o cliente)</span></span>
            <input value={f.taxa} onChange={set('taxa')} maxLength={120} placeholder="Ex.: R$ 80,00, descontado se o serviço for aprovado" />
          </label>
          <label><span>Anotações <span className="opc">(só você vê)</span></span>
            <textarea rows={2} value={f.obs} onChange={set('obs')} maxLength={1000} />
          </label>
        </fieldset>

        {erro && <p className="estado erro" role="alert">{erro}</p>}
        <div className="modal-acoes">
          <button type="button" className="btn" onClick={fechar}>Cancelar</button>
          <button type="submit" className="btn primary" disabled={salvando}>
            {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Criar e gerar link'}
          </button>
        </div>
      </form>
    </div>
  );
}
