import Financeiro from '@/components/Financeiro';
import { listarRelatorios } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  const lista = await listarRelatorios();
  return <Financeiro inicial={lista.filter((r) => r.status === 'concluido')} />;
}
