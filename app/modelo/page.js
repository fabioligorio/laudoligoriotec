import ModeloEditor from '@/components/ModeloEditor';
import { lerModelo } from '@/lib/store';
import { MODELO_PADRAO } from '@/lib/defaults';

export const dynamic = 'force-dynamic';

export default async function PaginaModelo() {
  const modelo = { ...MODELO_PADRAO, ...((await lerModelo()) || {}) };
  return <ModeloEditor inicial={modelo} />;
}
