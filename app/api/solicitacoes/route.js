import { NextResponse } from 'next/server';
import { listarVisitas, gravarVisita, gravarLinkVisita } from '@/lib/store';
import { validarVisita, novoTokenVisita } from '@/lib/visitas';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

export async function GET() {
  const negado = await semLogin();
  if (negado) return negado;
  return NextResponse.json(await listarVisitas());
}

// Solicitação criada por você mesmo no sistema (já com o link do cliente)
export async function POST(req) {
  const negado = await semLogin();
  if (negado) return negado;
  const corpo = await req.json().catch(() => ({}));
  const { dados, erro } = validarVisita(corpo, true);
  if (erro) return NextResponse.json({ erro }, { status: 400 });
  // o link do cliente mostra o dia e a hora para ele confirmar: os dois são obrigatórios
  if (!dados.agendaDia || !dados.agendaHora) {
    return NextResponse.json({ erro: 'Informe o dia e o horário da visita.' }, { status: 400 });
  }
  const agora = new Date().toISOString();
  const v = {
    id: crypto.randomUUID(),
    ...dados,
    origem: 'interno',
    status: dados.agendaDia ? 'agendada' : 'nova',
    obs: String(corpo.obs || '').slice(0, 1000),
    relatorioId: '',
    token: novoTokenVisita(),
    confirmadoEm: null,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  await gravarVisita(v);
  await gravarLinkVisita(v.token, v.id);
  return NextResponse.json(v, { status: 201 });
}
