import { notFound } from 'next/navigation';
import Impressao from '@/components/Impressao';
import { relatorioPorToken } from '@/lib/store';
import { paraCliente } from '@/lib/seguranca';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

// PDF do cliente: mesma página de impressão do sistema, sem os botões internos
export default async function ImpressaoCliente({ params, searchParams }) {
  params = await params;
  searchParams = await searchParams;
  const r = await relatorioPorToken(params.token);
  if (!r) notFound();
  const so = ['L', 'O'].includes(searchParams?.so) ? searchParams.so : 'B';
  return <Impressao r={paraCliente(r)} qual={so} voltar={`/c/${params.token}`} />;
}
