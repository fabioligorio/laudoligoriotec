import { notFound } from 'next/navigation';
import Impressao from '@/components/Impressao';
import { lerRelatorio } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Página só com as folhas: abre a janela de impressão sozinha.
// ?so=L (só laudo) ou ?so=O (só orçamento)
export default async function PaginaImpressao({ params, searchParams }) {
  if (!/^[\w-]{8,64}$/.test(params.id || '')) notFound();
  const r = await lerRelatorio(params.id);
  if (!r) notFound();
  const so = ['L', 'O'].includes(searchParams?.so) ? searchParams.so : 'B';
  return <Impressao r={r} qual={so} />;
}
