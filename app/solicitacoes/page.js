import Solicitacoes from '@/components/Solicitacoes';
import { listarVisitas } from '@/lib/store';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  await exigirLogin();
  return <Solicitacoes inicial={await listarVisitas()} />;
}
