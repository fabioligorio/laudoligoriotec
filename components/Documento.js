'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import QRCode from 'qrcode';
import * as I from './Icones';
import { brl, fdate, numero, itensDoOrcamento, totalDoOrcamento, linhas } from '@/lib/format';

/* QR que abre conversa no WhatsApp da empresa */
export function useQR(zap, site) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const digitos = String(zap || '').replace(/\D/g, '');
    const alvo = digitos ? `https://wa.me/55${digitos}` : site ? `https://${site}` : '';
    if (!alvo) { setUrl(''); return; }
    let vivo = true;
    QRCode.toDataURL(alvo, { width: 200, margin: 0, errorCorrectionLevel: 'M' })
      .then((u) => vivo && setUrl(u))
      .catch(() => vivo && setUrl(''));
    return () => { vivo = false; };
  }, [zap, site]);
  return url;
}

function Cabecalho({ r, qr, titulo, umaLinha, rotNum, rotData }) {
  return (
    <>
      <div className="pg-top"><i /><b /></div>
      <div className="hd">
        <img className="logo" src="/logo.jpg" alt="LigorioTec" />
        <div className="vr" />
        <h2 className={umaLinha ? 'one' : ''}>{titulo}</h2>
        <div className="meta">
          {rotNum}<strong>{numero(r)}</strong>
          {rotData}<strong>{fdate(r.data)}</strong>
        </div>
        <div className="qr">
          {qr && <img src={qr} alt="" />}
          Fale conosco<br />no WhatsApp
        </div>
      </div>
    </>
  );
}

function Assinaturas({ r }) {
  return (
    <div className="sig">
      <div>
        <div className="n">{r.tecnico}</div>
        <div className="l">{r.tecnico}<small>Técnico Responsável</small></div>
      </div>
      <div>
        <div className="n" />
        <div className="l">Assinatura do Cliente</div>
      </div>
    </div>
  );
}

function Rodape({ r }) {
  return (
    <>
      <div className="foot">
        <div className="it"><I.Globo /><span>{r.site}</span></div>
        <div className="vs" />
        <div className="it"><I.Telefone /><span>{r.zap}<br /><em>(WhatsApp)</em></span></div>
        <div className="vs" />
        <div className="it"><I.Escudo /><span><em>Assistência técnica especializada</em><br /><b>Compromisso com qualidade e confiança</b></span></div>
      </div>
      <div className="pg-bot"><i /><b /></div>
    </>
  );
}

function Secao({ icone, children }) {
  return <div className="sec">{icone}{children}</div>;
}

export function Laudo({ r, qr }) {
  const aprovado = r.resultado === 'APROVADO';
  const desenho = r.icone === 'foto'
    ? (r.eqPhoto ? <img src={r.eqPhoto} alt="" /> : null)
    : (I.DESENHOS[r.icone] || I.DESENHOS.lavadora);
  return (
    <div className="page">
      <Cabecalho r={r} qr={qr} titulo={<>LAUDO TÉCNICO<br />DE DIAGNÓSTICO</>} rotNum="Nº do laudo" rotData="Data da inspeção" />

      <Secao icone={<I.Pessoa />}>1. Dados do cliente</Secao>
      <div className="kv">
        <div className="r quatro"><span>Cliente:</span><b>{r.cliente}</b><span>Data da Inspeção:</span><b>{fdate(r.data)}</b></div>
        <div className="r"><span>Técnico Responsável:</span><b>{r.tecnico}</b></div>
      </div>

      <Secao icone={<I.Chave />}>2. Dados do equipamento</Secao>
      <div className="eq">
        <div className="kv">
          <div className="r"><span>Equipamento:</span><b>{r.equip}</b></div>
          <div className="r"><span>Componente:</span><b>{r.comp}</b></div>
          <div className="r"><span>Alimentação:</span><b>{r.alim}</b></div>
        </div>
        <div className="pic">{desenho}</div>
      </div>

      <Secao icone={<I.Balao />}>3. Reclamação informada</Secao>
      <div className="box">{r.recl}</div>

      <div className="cols">
        <div>
          <Secao icone={<I.Prancheta />}>4. Procedimentos e testes executados</Secao>
          <ul className="proc">{linhas(r.proc).map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div>
          <Secao icone={<I.Pulso />}>5. Resultados obtidos</Secao>
          <table className="res">
            <thead><tr><th>Ensaio / Verificação</th><th>Resultado</th></tr></thead>
            <tbody>
              {(r.res || []).filter((x) => x[0] || x[1]).map((x, i) => (
                <tr key={i}><td>{x[0]}</td><td>{x[1]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Secao icone={<I.Lupa />}>6. Diagnóstico técnico</Secao>
      <div className="box">{r.diag}</div>

      <Secao icone={<I.Visto />}>7. Conclusão</Secao>
      <div className="concl">
        <div className="box">{r.concl}</div>
        <div className={'stat' + (aprovado ? ' ok' : '')}>
          <div className="t">STATUS</div>
          <div className="v">{aprovado ? <I.Visto cor="#1e7d3a" /> : <I.Xis />}{aprovado ? 'APROVADO' : 'REPROVADO'}</div>
        </div>
      </div>

      <Assinaturas r={r} />
      <Rodape r={r} />
    </div>
  );
}

export function Orcamento({ r, qr }) {
  const itens = itensDoOrcamento(r);
  const fotos = (r.defPhotos || []).filter(Boolean);
  return (
    <div className="page">
      <Cabecalho r={r} qr={qr} titulo="ORÇAMENTO" umaLinha rotNum="Nº do orçamento" rotData="Data do orçamento" />

      <div className="pair">
        <div className="card">
          <div className="ch"><I.Pessoa cor="#fff" />Dados do cliente</div>
          <div className="kv">
            <div className="r"><span>Cliente:</span><b>{r.cliente}</b></div>
            <div className="r"><span>Técnico Responsável:</span><b>{r.tecnico}</b></div>
          </div>
        </div>
        <div className="card">
          <div className="ch"><I.Chave cor="#fff" />Dados do equipamento</div>
          <div className="kv">
            <div className="r"><span>Equipamento:</span><b>{r.equip}</b></div>
            <div className="r"><span>Componente:</span><b>{r.comp}</b></div>
            <div className="r"><span>Alimentação:</span><b>{r.alim}</b></div>
          </div>
        </div>
      </div>

      {fotos.length > 0 && (
        <>
          <Secao icone={<I.Camera />}>Fotos do equipamento</Secao>
          <div className="card" style={{ padding: '10px 12px' }}>
            <div className="lab bad"><I.Alerta />{r.tDef}</div>
            <div className="gal" style={{ gridTemplateColumns: `repeat(${Math.max(fotos.length, 3)}, 1fr)` }}>
              {fotos.map((f, i) => <div key={i}><img src={f} alt="" /></div>)}
            </div>
          </div>
        </>
      )}

      {r.peca && (
        <div className="card" style={{ padding: '10px 12px', marginTop: 12 }}>
          <div className="lab good"><I.Visto cor="#1e7d3a" />{r.tNew}</div>
          <div className="newp">
            <div className="im">{r.newPhoto ? <img src={r.newPhoto} alt="" /> : 'sem foto'}</div>
            <div>
              <p>Peça:</p>
              <p className="pn">{r.peca}</p>
              <p>Valor da Peça:</p>
              <p className="pv">R$ {brl(r.pecaV)}</p>
            </div>
          </div>
        </div>
      )}

      <Secao icone={<I.Prancheta />}>Descrição dos serviços</Secao>
      <table className="it">
        <thead><tr><th>Item</th><th>Descrição</th><th>Valor (R$)</th></tr></thead>
        <tbody>
          {itens.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x[0]}</td><td>{brl(x[1])}</td></tr>)}
        </tbody>
      </table>
      <div className="tot"><div>Total geral</div><div>R$ {brl(totalDoOrcamento(r))}</div></div>

      <div className="pair" style={{ marginTop: 14 }}>
        <div className="card small">
          <div className="gp">
            <div className="t"><I.Escudo />Garantia</div>
            <ul>{linhas(r.gar).map((g, i) => <li key={i}>{g}</li>)}</ul>
            {r.garObs && <div className="note">{r.garObs}</div>}
          </div>
        </div>
        <div className="card small">
          <div className="gp">
            <div className="t"><I.Cartao />Condições de pagamento</div>
            <ul><li>{r.pag}</li></ul>
            <div className="sepl" />
            <div>Prazo de execução: {r.prazo}</div>
          </div>
        </div>
      </div>

      <Assinaturas r={r} />
      <Rodape r={r} />
    </div>
  );
}

/* Mostra a folha A4 reduzida para caber na tela (na impressão, tamanho real) */
export function Escala({ children }) {
  const ref = useRef(null);
  const [s, setS] = useState(1);
  const [h, setH] = useState(1123);
  useIsoLayoutEffect(() => {
    const w = ref.current;
    const p = w.firstElementChild;
    const medir = () => {
      const sc = Math.min(1, w.clientWidth / 794);
      setS(sc);
      setH(p.offsetHeight * sc);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(w);
    ro.observe(p);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="sheet-wrap" ref={ref} style={{ height: h }}>
      <div className="sheet-inner" style={{ transform: `scale(${s})` }}>{children}</div>
    </div>
  );
}

export function Folhas({ r }) {
  const qr = useQR(r.zap, r.site);
  return (
    <div className="pages">
      <div className="folha folha-L" style={{ width: '100%', maxWidth: 794, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p className="cap no-print">Página 1 · Laudo técnico</p>
        <Escala><Laudo r={r} qr={qr} /></Escala>
      </div>
      <div className="folha folha-O" style={{ width: '100%', maxWidth: 794, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p className="cap no-print">Página 2 · Orçamento</p>
        <Escala><Orcamento r={r} qr={qr} /></Escala>
      </div>
    </div>
  );
}
