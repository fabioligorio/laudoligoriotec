import Inicio from '@/components/Inicio';
import { listarRelatorios } from '@/lib/store';

export const dynamic = 'force-dynamic';
// só as telas internas podem ser instaladas como app (a página do cliente abre direto no navegador)
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  const lista = await listarRelatorios();
  const conta = (s) => lista.filter((r) => r.status === s).length;
  return <Inicio aguardando={conta('aguardando')} rascunhos={conta('rascunho')} concluidos={conta('concluido')} />;
}
