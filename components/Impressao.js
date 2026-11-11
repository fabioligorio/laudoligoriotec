'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folhas } from './Documento';
import { imprimir, esperarCarregar } from '@/lib/impressao';
import { numero } from '@/lib/format';

export default function Impressao({ r, qual, voltar }) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;
    document.title = `${qual === 'O' ? 'Orcamento' : qual === 'L' ? 'Laudo' : 'Laudo e Orcamento'} ${numero(r)} ${r.cliente || ''}`.trim();
    (async () => {
      await esperarCarregar();
      // um instante para o QR code e o layout assentarem
      await new Promise((ok) => setTimeout(ok, 300));
      if (!vivo) return;
      setPronto(true);
      imprimir(qual);
    })();
    return () => { vivo = false; };
  }, [r, qual]);

  return (
    <div className="impressao">
      <div className="bar no-print" style={{ maxWidth: 794, margin: '16px auto' }}>
        {voltar ? (
          <a className="btn ghost" href={voltar}>← Voltar</a>
        ) : (
          <>
            <Link className="btn ghost" href="/">← Relatórios</Link>
            <Link className="btn" href={`/r/${r.id}`}>Abrir no editor</Link>
          </>
        )}
        <span className="sp" />
        <span className="estado">{pronto ? 'Na janela de impressão, escolha "Salvar como PDF".' : 'Preparando…'}</span>
        <button className="btn primary" type="button" onClick={() => imprimir(qual)} disabled={!pronto}>Imprimir de novo</button>
      </div>
      <div className="no-print-pad">
        <Folhas r={r} />
      </div>
    </div>
  );
}
