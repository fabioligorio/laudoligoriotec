import Solicitacoes from '@/components/Solicitacoes';
import { listarVisitas } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  return <Solicitacoes inicial={await listarVisitas()} />;
}
