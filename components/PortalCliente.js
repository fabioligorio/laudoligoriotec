import { Logo } from './Marca';
import { brl, fdate } from '@/lib/format';
import { STATUS_VISITA } from '@/lib/visitas';
import { STATUS_PROPOSTA } from '@/lib/propostas';

const WHATSAPP_EMPRESA = '41936186432';
const SIT_REL = {
  rascunho: { rotulo: 'Em andamento', classe: 'rascunho' },
  aguardando: { rotulo: 'Aguardando sua aprovação', classe: 'aguardando' },
  concluido: { rotulo: 'Serviço concluído', classe: 'concluido' },
};

function Cartao({ href, titulo, sub, valor, pill, aviso }) {
  const corpo = (
    <>
      <span className="pt-info">
        <b>{titulo}</b>
        {sub && <small>{sub}</small>}
        {aviso && <small className="pt-aviso">{aviso}</small>}
      </span>
      <span className="pt-lado">
        {valor != null && <b className="pt-valor">R$ {brl(valor)}</b>}
        {pill && <span className={`pill ${pill.classe}`}>{pill.rotulo}</span>}
      </span>
      {href && <span className="pt-seta" aria-hidden="true">→</span>}
    </>
  );
  return href ? <a className="pt-card" href={href}>{corpo}</a> : <div className="pt-card sem-link">{corpo}</div>;
}

export default function PortalCliente({ nome, visitas, relatorios, propostas }) {
  // nome de pessoa: só o primeiro nome; empresa ou nome curto ("H2 Club"): o nome inteiro
  const partes = String(nome || '').trim().split(/\s+/);
  const primeiro = partes.length > 1 && partes[0].length >= 3 && !/\d/.test(partes[0]) && partes.length <= 4 && !/\b(club|clube|condom|ltda|me|eireli|s\.?a|empresa|restaurante|bar)\b/i.test(nome) ? partes[0] : String(nome || '').trim();
  const nada = !visitas.length && !relatorios.length && !propostas.length;
  const pendentes = [
    ...relatorios.filter((r) => r.status === 'aguardando'),
    ...propostas.filter((p) => p.status === 'enviada'),
    ...visitas.filter((v) => v.status === 'agendada' && !v.confirmada && v.link),
  ].length;

  return (
    <div className="cli-pagina">
      <header className="cli-topo">
        <div className="cli-topo-in">
          <Logo escuro altura={32} />
          <span className="cli-assin">Tecnologia que conecta.</span>
        </div>
      </header>

      <main className="cli-main pt-main">
        <section className="cli-hero">
          <span className="marcador">Seus atendimentos</span>
          <h1>Olá{primeiro ? `, ${primeiro}` : ''}!</h1>
          <p className="cli-sub">
            Aqui ficam todas as suas visitas, laudos, orçamentos e propostas com a LigorioTec. Guarde este link: ele está sempre atualizado.
          </p>
          {pendentes > 0 && (
            <p className="pt-pend">{pendentes === 1 ? 'Há 1 item esperando a sua resposta.' : `Há ${pendentes} itens esperando a sua resposta.`}</p>
          )}
        </section>

        {nada && (
          <div className="vazio">
            <strong>Nada por aqui ainda</strong>
            <span>Quando a LigorioTec enviar uma visita, um orçamento ou uma proposta, ela aparece aqui.</span>
          </div>
        )}

        {propostas.length > 0 && (
          <section className="cli-sec pt-sec">
            <h2><span className="mk" />Propostas</h2>
            {propostas.map((p, i) => (
              <Cartao key={i} href={p.link} titulo={p.titulo} valor={p.total}
                sub={`Nº ${p.num} · ${fdate(p.data)}${p.validaAte && p.status === 'enviada' ? ` · válida até ${fdate(p.validaAte)}` : ''}`}
                pill={p.status === 'enviada' ? { rotulo: 'Aguardando sua aprovação', classe: 'aguardando' } : STATUS_PROPOSTA[p.status]} />
            ))}
          </section>
        )}

        {relatorios.length > 0 && (
          <section className="cli-sec pt-sec">
            <h2><span className="mk" />Laudos e orçamentos</h2>
            {relatorios.map((r, i) => (
              <Cartao key={i} href={r.link} titulo={r.titulo} valor={r.total}
                sub={`${r.soOrcamento ? 'Orçamento' : 'Laudo e orçamento'} nº ${r.num} · ${fdate(r.data)}`}
                pill={SIT_REL[r.status] || SIT_REL.rascunho} />
            ))}
          </section>
        )}

        {visitas.length > 0 && (
          <section className="cli-sec pt-sec">
            <h2><span className="mk" />Visitas técnicas</h2>
            {visitas.map((v, i) => (
              <Cartao key={i} href={v.link} titulo={v.titulo || 'Visita técnica'}
                sub={`${v.data ? fdate(v.data) : ''}${v.hora ? ` às ${v.hora}` : ''}`}
                aviso={v.status === 'agendada' && v.link ? (v.confirmada ? '✓ Você confirmou esta visita' : 'Toque para confirmar a visita') : ''}
                pill={STATUS_VISITA[v.status]} />
            ))}
          </section>
        )}

        <a className="btn" href={`https://wa.me/55${WHATSAPP_EMPRESA}?text=${encodeURIComponent(`Olá! Sou ${nome}, cliente da LigorioTec.`)}`} target="_blank" rel="noopener">
          Falar com a LigorioTec no WhatsApp
        </a>
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
