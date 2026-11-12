import Lista from '@/components/Lista';
import { listarRelatorios } from '@/lib/store';

export const dynamic = 'force-dynamic';
// só as telas internas podem ser instaladas como app (a página do cliente abre direto no navegador)
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function Inicio() {
  const relatorios = await listarRelatorios();
  return <Lista inicial={relatorios} />;
}
