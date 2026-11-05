import Lista from '@/components/Lista';
import { listarRelatorios } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Inicio() {
  const relatorios = await listarRelatorios();
  return <Lista inicial={relatorios} />;
}
