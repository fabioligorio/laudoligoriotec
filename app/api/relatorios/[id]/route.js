import { NextResponse } from 'next/server';
import { lerRelatorio, gravarRelatorio, excluirRelatorio } from '@/lib/store';

export const dynamic = 'force-dynamic';

const idValido = (id) => /^[\w-]{8,64}$/.test(id || '');

// Campos que o editor pode alterar (o resto é controlado pelo servidor)
const EDITAVEIS = [
  'cliente', 'data', 'num', 'equip', 'comp', 'alim', 'icone', 'eqPhoto',
  'tecnico', 'site', 'zap', 'recl', 'proc', 'res', 'diag', 'concl', 'resultado',
  'tDef', 'defPhotos', 'tNew', 'pecas', 'pecaItem', 'itens',
  'gar', 'garObs', 'pag', 'prazo',
];

export async function GET(_req, { params }) {
  if (!idValido(params.id)) return NextResponse.json({ erro: 'Id inválido.' }, { status: 400 });
  const r = await lerRelatorio(params.id);
  if (!r) return NextResponse.json({ erro: 'Relatório não encontrado.' }, { status: 404 });
  return NextResponse.json(r);
}

// body: { acao: 'salvar' | 'concluir' | 'reabrir', relatorio?: {...} }
export async function PUT(req, { params }) {
  if (!idValido(params.id)) return NextResponse.json({ erro: 'Id inválido.' }, { status: 400 });
  const atual = await lerRelatorio(params.id);
  if (!atual) return NextResponse.json({ erro: 'Relatório não encontrado.' }, { status: 404 });

  const { acao = 'salvar', relatorio = {} } = await req.json().catch(() => ({}));
  const agora = new Date().toISOString();

  if (acao === 'reabrir') {
    const r = { ...atual, status: 'rascunho', concluidoEm: null, atualizadoEm: agora };
    await gravarRelatorio(r);
    return NextResponse.json(r);
  }

  if (atual.status === 'concluido') {
    return NextResponse.json(
      { erro: 'Este relatório já foi concluído. Reabra para editar.' },
      { status: 409 }
    );
  }

  const r = { ...atual, atualizadoEm: agora };
  for (const k of EDITAVEIS) if (k in relatorio) r[k] = relatorio[k];

  if (acao === 'concluir') {
    if (!String(r.cliente || '').trim()) {
      return NextResponse.json({ erro: 'Preencha o nome do cliente antes de concluir.' }, { status: 422 });
    }
    r.status = 'concluido';
    r.concluidoEm = agora;
  }

  try {
    await gravarRelatorio(r);
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Falha ao salvar.' }, { status: 500 });
  }
  return NextResponse.json(r);
}

export async function DELETE(_req, { params }) {
  if (!idValido(params.id)) return NextResponse.json({ erro: 'Id inválido.' }, { status: 400 });
  const atual = await lerRelatorio(params.id);
  if (!atual) return NextResponse.json({ ok: true });
  if (atual.status === 'concluido') {
    return NextResponse.json({ erro: 'Relatórios concluídos não podem ser excluídos.' }, { status: 409 });
  }
  await excluirRelatorio(params.id);
  return NextResponse.json({ ok: true });
}
