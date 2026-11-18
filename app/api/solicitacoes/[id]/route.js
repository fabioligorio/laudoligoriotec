import { NextResponse } from 'next/server';
import { lerVisita, gravarVisita, excluirVisita } from '@/lib/store';
import { STATUS_VISITA } from '@/lib/visitas';

export const dynamic = 'force-dynamic';

// body: { status?, obs? }
export async function PUT(req, { params }) {
  const v = await lerVisita(params.id);
  if (!v) return NextResponse.json({ erro: 'Solicitação não encontrada.' }, { status: 404 });
  const corpo = await req.json().catch(() => ({}));
  const novo = { ...v, atualizadoEm: new Date().toISOString() };
  if (corpo.status !== undefined) {
    if (!STATUS_VISITA[corpo.status]) return NextResponse.json({ erro: 'Situação inválida.' }, { status: 400 });
    novo.status = corpo.status;
  }
  if (corpo.obs !== undefined) novo.obs = String(corpo.obs).slice(0, 1000);
  await gravarVisita(novo);
  return NextResponse.json(novo);
}

export async function DELETE(_req, { params }) {
  const v = await lerVisita(params.id);
  if (!v) return NextResponse.json({ erro: 'Solicitação não encontrada.' }, { status: 404 });
  await excluirVisita(params.id);
  return NextResponse.json({ ok: true });
}
