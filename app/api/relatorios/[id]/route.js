import { NextResponse } from 'next/server';
import { lerRelatorio, gravarRelatorio, excluirRelatorio } from '@/lib/store';
import { STATUS } from '@/lib/status';

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

// body: { relatorio?: {...}, status?: 'rascunho' | 'aguardando' | 'concluido' }
// - Sem status: só salva os campos.
// - Com status: salva os campos e muda a situação.
// - Concluído fica travado; para editar, envie status 'rascunho' ou 'aguardando' (reabrir).
export async function PUT(req, { params }) {
  if (!idValido(params.id)) return NextResponse.json({ erro: 'Id inválido.' }, { status: 400 });
  const atual = await lerRelatorio(params.id);
  if (!atual) return NextResponse.json({ erro: 'Relatório não encontrado.' }, { status: 404 });

  const { relatorio = {}, status } = await req.json().catch(() => ({}));
  if (status !== undefined && !STATUS[status]) {
    return NextResponse.json({ erro: 'Situação inválida.' }, { status: 400 });
  }
  const agora = new Date().toISOString();
  const r = { ...atual, atualizadoEm: agora };

  if (atual.status === 'concluido') {
    // Reabrir: muda só a situação, ignora campos enviados
    if (!status || status === 'concluido') {
      return NextResponse.json(
        { erro: 'Este relatório já foi concluído. Reabra para editar.' },
        { status: 409 }
      );
    }
  } else {
    for (const k of EDITAVEIS) if (k in relatorio) r[k] = relatorio[k];
  }

  if (status) {
    if (status !== 'rascunho' && !String(r.cliente || '').trim()) {
      return NextResponse.json(
        { erro: 'Preencha o nome do cliente antes de mudar a situação.' },
        { status: 422 }
      );
    }
    r.status = status;
    r.concluidoEm = status === 'concluido' ? agora : null;
    if (status === 'aguardando' && atual.status !== 'aguardando') r.enviadoEm = agora;
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
