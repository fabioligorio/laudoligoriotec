import Clientes from '@/components/Clientes';
import { listarClientes } from '@/lib/store';
import { contagens } from '@/lib/portal';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  await exigirLogin();
  const [lista, n] = await Promise.all([listarClientes(), contagens()]);
  return <Clientes inicial={lista.map((c) => ({ ...c, itens: n[c.id] || 0 }))} />;
}
