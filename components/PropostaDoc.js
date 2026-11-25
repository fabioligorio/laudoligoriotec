import { Logo } from './Marca';
import { brl, fdate } from '@/lib/format';
import {
  blocos, termo, subtotal, totalProposta, validaAte, dataExtenso, numeroProposta, FORNECEDOR, CONTATO,
} from '@/lib/propostas';

function Item({ t }) {
  const [forte, resto] = termo(t);
  return <li>{forte && <b>{forte}</b>}{resto}</li>;
}

// Texto com parágrafos, listas e subtítulos
export function Blocos({ texto }) {
  return blocos(texto).map((b, i) => {
    if (b.tipo === 'h') return <h3 key={i}>{b.texto}</h3>;
    if (b.tipo === 'ul') return <ul key={i}>{b.itens.filter(Boolean).map((t, j) => <Item key={j} t={t} />)}</ul>;
    if (b.tipo === 'ol') return <ol key={i}>{b.itens.filter(Boolean).map((t, j) => <Item key={j} t={t} />)}</ol>;
    const [forte, resto] = termo(b.texto);
    return <p key={i}>{forte && /^[A-ZÀ-Ú]/.test(forte) && forte.split(' ').length <= 4 ? <><b>{forte}</b>{resto}</> : b.texto}</p>;
  });
}

const Titulo = ({ children }) => <h2><span className="mk" aria-hidden="true" />{children}</h2>;

export default function PropostaDoc({ p }) {
  const itens = (p.itens || []).filter((i) => String(i.desc || '').trim());
  const total = totalProposta(p);
  const ate = validaAte(p);
  const condicoes = (p.condicoes || []).filter((c) => c[0] || c[1]);
  const secoes = (p.secoes || []).filter((s) => s.titulo || String(s.texto || '').replace(/[-#\s]/g, '') || s.imagens?.length);

  return (
    <article className="prop-doc">
      <header className="prop-cab">
        <Logo altura={34} />
        <span className="prop-num">Proposta comercial nº {numeroProposta(p)}</span>
      </header>

      <h1>{p.titulo || 'Proposta comercial'}{p.cliente ? <em> · {p.cliente}</em> : null}</h1>
      <p className="prop-meta">
        Curitiba, {dataExtenso(p.data)}
        {ate && <> · válida até {fdate(ate)}</>}
      </p>

      {p.resumo && <p className="prop-lead">{p.resumo}</p>}

      <dl className="prop-info">
        {p.cliente && <div><dt>Cliente</dt><dd>{p.cliente}{p.responsavel ? ` · A/C ${p.responsavel}` : ''}</dd></div>}
        <div><dt>Fornecedor</dt><dd>{FORNECEDOR}</dd></div>
        {p.objeto && <div><dt>Objeto</dt><dd>{p.objeto}</dd></div>}
        <div><dt>Contato</dt><dd>{CONTATO}</dd></div>
      </dl>

      {secoes.map((s, i) => (
        <section key={i} className="prop-sec">
          {s.titulo && <Titulo>{s.titulo}</Titulo>}
          <Blocos texto={s.texto} />
          {s.imagens?.length > 0 && (
            <div className={'prop-imgs n' + Math.min(s.imagens.length, 3)}>
              {s.imagens.map((im, j) => (
                <figure key={j}>
                  <img src={im.url} alt={im.legenda || ''} loading="lazy" />
                  {im.legenda && <figcaption>{im.legenda}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </section>
      ))}

      {itens.length > 0 && (
        <section className="prop-sec prop-invest">
          <Titulo>Investimento</Titulo>
          <p>
            O investimento total é de <b>R$ {brl(total)}</b>{p.textoInvestimento ? `, ${p.textoInvestimento.replace(/\.$/, '')}` : ''}.
          </p>
          <table className="prop-tab">
            <thead>
              <tr><th>Item</th><th className="n">Qtd</th><th className="n">Valor unitário (R$)</th><th className="n">Total (R$)</th></tr>
            </thead>
            <tbody>
              {itens.map((i, k) => (
                <tr key={k}>
                  <td>{i.desc}</td>
                  <td className="n" data-rotulo="Qtd">{i.qtd}</td>
                  <td className="n" data-rotulo="Unitário">{brl(i.valor)}</td>
                  <td className="n" data-rotulo="Total">{brl(subtotal(i))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3}>Total</td><td className="n">R$ {brl(total)}</td></tr>
            </tfoot>
          </table>
          {(p.opcionais || []).filter((o) => o.titulo || o.texto).map((o, k) => (
            <div key={k} className="prop-opc">
              <h3>Opcional – {o.titulo}</h3>
              <Blocos texto={o.texto} />
            </div>
          ))}
        </section>
      )}

      {condicoes.length > 0 && (
        <section className="prop-sec">
          <Titulo>Condições comerciais</Titulo>
          <dl className="prop-info prop-cond">
            {condicoes.map((c, k) => <div key={k}><dt>{c[0]}</dt><dd>{c[1]}</dd></div>)}
          </dl>
        </section>
      )}

      {p.fechamento && <p className="prop-fecho">{p.fechamento}</p>}

      <footer className="prop-aprov">
        {p.aprovacao ? (
          <p className="prop-aprovada">
            <b>✓ Proposta aprovada eletronicamente</b>
            <span>por {p.aprovacao.nome} em {new Date(p.aprovacao.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </p>
        ) : (
          <div className="prop-assin">
            <span className="linha" />
            <span>Aprovação{p.cliente ? ` – ${p.cliente}` : ''} · Nome, assinatura e data</span>
          </div>
        )}
      </footer>
    </article>
  );
}

// Margem em todas as páginas impressas: o cabeçalho e o rodapé da tabela se repetem em cada folha
export function FolhasProposta({ children }) {
  return (
    <table className="prop-folhas">
      <thead><tr><td><div className="prop-margem" /></td></tr></thead>
      <tbody><tr><td>{children}</td></tr></tbody>
      <tfoot><tr><td><div className="prop-margem" /></td></tr></tfoot>
    </table>
  );
}
