'use client';
import { useState } from 'react';
import { Logo } from './Marca';
import { fdate } from '@/lib/format';
import { textoAgenda } from '@/lib/visitas';

const WHATSAPP_EMPRESA = '41936186432'; // (41) 93618-6432

export default function VisitaCliente({ v, token }) {
  const [confirmado, setConfirmado] = useState(v.confirmadoEm);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const primeiro = String(v.nome || '').split(' ')[0];
  const endereco = [v.endereco, v.bairro, v.cidade].filter(Boolean).join(', ');
  const agenda = textoAgenda(v);
  const cancelada = v.status === 'cancelada';
  const feita = v.status === 'realizada';

  const zap = (t) => `https://wa.me/55${WHATSAPP_EMPRESA}?text=${encodeURIComponent(t)}`;
  const msgRemarcar = `Olá! Sou ${v.nome}. Preciso remarcar a visita técnica${agenda ? ` de ${agenda}` : ''}.`;
  const msgDuvida = `Olá! Sou ${v.nome}, tenho uma dúvida sobre a visita técnica${agenda ? ` de ${agenda}` : ''}.`;

  async function confirmar() {
    setEnviando(true);
    setErro('');
    try {
      const res = await fetch('/api/visita/confirmar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível confirmar.');
      setConfirmado(j.confirmadoEm);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cli-pagina">
      <header className="cli-topo">
        <div className="cli-topo-in">
          <Logo escuro altura={32} />
          <span className="cli-assin">Tecnologia que conecta.</span>
        </div>
      </header>

      <main className="cli-main vis">
        <section className="cli-hero">
          <span className="marcador">Visita técnica de avaliação</span>
          <h1>Olá{primeiro ? `, ${primeiro}` : ''}!</h1>
          <p className="cli-sub">
            {cancelada
              ? 'Esta visita foi cancelada. Se quiser marcar outra data, fale com a gente pelo WhatsApp.'
              : feita
              ? 'A visita técnica já foi realizada. Em breve você recebe o diagnóstico e o orçamento.'
              : agenda
              ? 'Sua visita técnica está marcada. Confira os dados abaixo e confirme se está tudo certo.'
              : 'Recebemos o pedido da sua visita técnica. Vamos combinar o dia e o horário com você pelo WhatsApp.'}
          </p>
        </section>

        <section className={'vc-agenda' + (cancelada ? ' cancelada' : '')}>
          <span className="vc-rot">{agenda ? 'Dia e horário' : 'Sua preferência'}</span>
          <b className="vc-quando">
            {agenda || `${v.dia ? `${fdate(v.dia)}, ` : ''}${String(v.periodo || 'a combinar').toLowerCase()}`}
          </b>
          {cancelada && <span className="vc-selo cancel">Cancelada</span>}
          {!cancelada && agenda && confirmado && <span className="vc-selo ok">✓ Visita confirmada</span>}
          {!cancelada && !agenda && <span className="vc-selo">A confirmar pela LigorioTec</span>}
        </section>

        <section className="vc-dados">
          <div><dt>Endereço</dt><dd>{endereco || '—'}</dd></div>
          <div><dt>Equipamento</dt><dd>{[v.equipamento, v.marca].filter(Boolean).join(' · ')}</dd></div>
          {v.problema && <div><dt>Problema informado</dt><dd className="pre">{v.problema}</dd></div>}
          {v.taxa && <div><dt>Visita</dt><dd>{v.taxa}</dd></div>}
        </section>

        {erro && <p className="estado erro" role="alert">{erro}</p>}

        <div className="vc-acoes">
          {!cancelada && !feita && agenda && !confirmado && (
            <button type="button" className="btn primary vis-enviar" onClick={confirmar} disabled={enviando}>
              {enviando ? 'Confirmando…' : 'Confirmar visita'}
            </button>
          )}
          {!cancelada && !feita && agenda && (
            <a className="btn" href={zap(msgRemarcar)} target="_blank" rel="noopener">Preciso remarcar</a>
          )}
          <a className="btn" href={zap(msgDuvida)} target="_blank" rel="noopener">Falar no WhatsApp</a>
          {endereco && (
            <a className="btn ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`} target="_blank" rel="noopener noreferrer">Ver endereço no mapa</a>
          )}
        </div>
      </main>

      <footer className="cli-rodape">
        <Logo escuro altura={26} />
        <p>
          <span>www.ligoriotec.com.br</span>
          <span>WhatsApp (41) 93618-6432</span>
        </p>
      </footer>
    </div>
  );
}
