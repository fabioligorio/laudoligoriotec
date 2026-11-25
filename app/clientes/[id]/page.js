import { notFound } from 'next/navigation';
import ClienteDetalhe from '@/components/ClienteDetalhe';
import { lerCliente } from '@/lib/store';
import { itensDoCliente } from '@/lib/portal';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina({ params }) {
  params = await params;
  await exigirLogin();
  const c = await lerCliente(params.id);
  if (!c) notFound();
  return <ClienteDetalhe inicial={{ cliente: c, ...(await itensDoCliente(c)) }} />;
}
