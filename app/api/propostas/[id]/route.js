import { NextResponse } from 'next/server';
import { lerProposta, gravarProposta, excluirProposta, apagarLinkProposta } from '@/lib/store';
import { limparProposta, STATUS_PROPOSTA } from '@/lib/propostas';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const p = await lerProposta(params.id);
  if (!p) return NextResponse.json({ erro: 'Proposta não encontrada.' }, { status: 404 });
  return NextResponse.json(p);
}

// body: { proposta?: {...}, status?, reabrir?: true }
export async function PUT(req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const p = await lerProposta(params.id);
  if (!p) return NextResponse.json({ erro: 'Proposta não encontrada.' }, { status: 404 });
  const corpo = await req.json().catch(() => ({}));
  const novo = { ...p, atualizadoEm: new Date().toISOString() };

  // reabrir uma proposta aprovada apaga a aprovação (o cliente aprova de novo)
  if (corpo.reabrir) {
    novo.aprovacao = null;
    novo.status = p.token && p.linkAtivo ? 'enviada' : 'rascunho';
  }
  if (corpo.proposta) {
    // o que o cliente aprovou não muda: para editar, reabra
    if (novo.status === 'aprovada') {
      return NextResponse.json({ erro: 'Proposta aprovada pelo cliente. Reabra para editar.' }, { status: 409 });
    }
    Object.assign(novo, limparProposta(corpo.proposta));
  }
  if (corpo.status !== undefined) {
    if (!STATUS_PROPOSTA[corpo.status] || corpo.status === 'aprovada') {
      return NextResponse.json({ erro: 'Situação inválida.' }, { status: 400 });
    }
    if (novo.status !== 'aprovada') novo.status = corpo.status;
  }
  await gravarProposta(novo);
  return NextResponse.json(novo);
}

export async function DELETE(_req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const p = await lerProposta(params.id);
  if (!p) return NextResponse.json({ erro: 'Proposta não encontrada.' }, { status: 404 });
  if (p.status === 'aprovada') return NextResponse.json({ erro: 'Proposta aprovada não pode ser excluída.' }, { status: 409 });
  await apagarLinkProposta(p.token);
  await excluirProposta(p.id);
  return NextResponse.json({ ok: true });
}
