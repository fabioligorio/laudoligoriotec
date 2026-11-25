import Inicio from '@/components/Inicio';
import { listarRelatorios, listarVisitas, listarPropostas } from '@/lib/store';
import { exigirLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
// só as telas internas podem ser instaladas como app (a página do cliente abre direto no navegador)
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Pagina() {
  await exigirLogin();
  const [lista, visitas, propostas] = await Promise.all([listarRelatorios(), listarVisitas().catch(() => []), listarPropostas().catch(() => [])]);
  const conta = (s) => lista.filter((r) => r.status === s).length;
  return <Inicio aguardando={conta('aguardando')} rascunhos={conta('rascunho')} concluidos={conta('concluido')} visitasNovas={visitas.filter((v) => v.status === 'nova').length} visitasAbertas={visitas.filter((v) => v.status === 'nova' || v.status === 'agendada').length} propostasEnviadas={propostas.filter((p) => p.status === 'enviada').length} propostasAprovadas={propostas.filter((p) => p.status === 'aprovada').length} />;
}
