import Propostas from '@/components/Propostas';
import { listarPropostas } from '@/lib/store';
import { resumoProposta } from '@/lib/propostas';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  await exigirLogin();
  return <Propostas inicial={(await listarPropostas()).map(resumoProposta)} />;
}
