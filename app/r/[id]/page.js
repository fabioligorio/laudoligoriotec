import { notFound } from 'next/navigation';
import Editor from '@/components/Editor';
import { lerRelatorio } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function PaginaRelatorio({ params }) {
  if (!/^[\w-]{8,64}$/.test(params.id || '')) notFound();
  const r = await lerRelatorio(params.id);
  if (!r) notFound();
  // key força recarregar o editor ao trocar de relatório (ex.: depois de duplicar)
  return <Editor key={r.id} inicial={r} />;
}
