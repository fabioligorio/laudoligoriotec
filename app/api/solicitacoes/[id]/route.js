import { NextResponse } from 'next/server';
import { lerVisita, gravarVisita, excluirVisita, gravarLinkVisita } from '@/lib/store';
import { STATUS_VISITA, validarVisita, novoTokenVisita } from '@/lib/visitas';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

// body: { status?, obs?, dados?: {...campos do formulário}, gerarLink?: true }
export async function PUT(req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const v = await lerVisita(params.id);
  if (!v) return NextResponse.json({ erro: 'Solicitação não encontrada.' }, { status: 404 });
  const corpo = await req.json().catch(() => ({}));
  const novo = { ...v, atualizadoEm: new Date().toISOString() };
  if (corpo.dados && typeof corpo.dados === 'object') {
    const { dados, erro } = validarVisita(corpo.dados, true);
    if (erro) return NextResponse.json({ erro }, { status: 400 });
    // mudou o dia ou a hora: o cliente precisa confirmar de novo
    if (dados.agendaDia !== v.agendaDia || dados.agendaHora !== v.agendaHora) novo.confirmadoEm = null;
    Object.assign(novo, dados);
    if (dados.agendaDia && novo.status === 'nova') novo.status = 'agendada';
  }
  if (corpo.status !== undefined) {
    if (!STATUS_VISITA[corpo.status]) return NextResponse.json({ erro: 'Situação inválida.' }, { status: 400 });
    novo.status = corpo.status;
  }
  if (corpo.obs !== undefined) novo.obs = String(corpo.obs).slice(0, 1000);
  if (corpo.gerarLink && !novo.token) {
    novo.token = novoTokenVisita();
    await gravarLinkVisita(novo.token, novo.id);
  }
  await gravarVisita(novo);
  return NextResponse.json(novo);
}

export async function DELETE(_req, { params }) {
  params = await params;
  const negado = await semLogin();
  if (negado) return negado;
  const v = await lerVisita(params.id);
  if (!v) return NextResponse.json({ erro: 'Solicitação não encontrada.' }, { status: 404 });
  await excluirVisita(params.id);
  return NextResponse.json({ ok: true });
}
