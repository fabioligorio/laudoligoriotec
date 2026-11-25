import { notFound } from 'next/navigation';
import PropostaEditor from '@/components/PropostaEditor';
import { lerProposta } from '@/lib/store';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina({ params }) {
  params = await params;
  await exigirLogin();
  const p = await lerProposta(params.id);
  if (!p) notFound();
  return <PropostaEditor inicial={p} />;
}
