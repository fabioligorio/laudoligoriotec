import ModeloEditor from '@/components/ModeloEditor';
import { lerModelo } from '@/lib/store';
import { MODELO_PADRAO } from '@/lib/defaults';

export const dynamic = 'force-dynamic';
// só as telas internas podem ser instaladas como app (a página do cliente abre direto no navegador)
export const metadata = { manifest: '/manifest.webmanifest' };

export default async function PaginaModelo() {
  const modelo = { ...MODELO_PADRAO, ...((await lerModelo()) || {}) };
  return <ModeloEditor inicial={modelo} />;
}
