import Financeiro from '@/components/Financeiro';
import { listarRelatorios } from '@/lib/store';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  await exigirLogin();
  const lista = await listarRelatorios();
  return <Financeiro inicial={lista.filter((r) => r.status === 'concluido')} />;
}
