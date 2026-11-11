import { notFound } from 'next/navigation';
import Impressao from '@/components/Impressao';
import { relatorioPorToken } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

// PDF do cliente: mesma página de impressão do sistema, sem os botões internos
export default async function ImpressaoCliente({ params, searchParams }) {
  const r = await relatorioPorToken(params.token);
  if (!r) notFound();
  const so = ['L', 'O'].includes(searchParams?.so) ? searchParams.so : 'B';
  return <Impressao r={r} qual={so} voltar={`/c/${params.token}`} />;
}
