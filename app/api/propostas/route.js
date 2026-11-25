import { NextResponse } from 'next/server';
import { listarPropostas, lerProposta, gravarProposta } from '@/lib/store';
import { novaProposta, resumoProposta } from '@/lib/propostas';
import { propostaExemplo } from '@/lib/propostaExemplo';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

export async function GET() {
  const negado = await semLogin();
  if (negado) return negado;
  return NextResponse.json((await listarPropostas()).map(resumoProposta));
}

// Cria: em branco, a partir do exemplo, ou duplicando outra proposta
export async function POST(req) {
  const negado = await semLogin();
  if (negado) return negado;
  const body = await req.json().catch(() => ({}));
  let p;
  if (body.exemplo) {
    p = propostaExemplo();
  } else if (body.duplicarDe) {
    const origem = await lerProposta(body.duplicarDe);
    if (!origem) return NextResponse.json({ erro: 'Proposta de origem não encontrada.' }, { status: 404 });
    const base = novaProposta();
    p = {
      ...structuredClone(origem),
      id: base.id, status: 'rascunho', num: '', data: base.data,
      token: '', linkAtivo: false, aprovacao: null, enviadaEm: null,
      criadoEm: base.criadoEm, atualizadoEm: base.atualizadoEm,
    };
  } else {
    p = novaProposta();
  }
  // número em sequência no dia: P-20261125-1, P-20261125-2…
  if (!p.num) {
    const base = `P-${String(p.data).replace(/-/g, '')}`;
    const usados = new Set((await listarPropostas()).map((x) => x.num));
    let n = 1;
    while (usados.has(`${base}-${n}`)) n++;
    p.num = `${base}-${n}`;
  }
  await gravarProposta(p);
  return NextResponse.json(p, { status: 201 });
}
