import { NextResponse } from 'next/server';
import { listarRelatorios, lerRelatorio, gravarRelatorio, lerModelo } from '@/lib/store';
import { novoRelatorio, relatorioExemplo, hojeISO } from '@/lib/defaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await listarRelatorios());
}

// Cria um relatório: em branco (a partir do modelo), duplicado de outro, ou o exemplo.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  try {
    let r;
    if (body.exemplo) {
      r = relatorioExemplo();
    } else if (body.duplicarDe) {
      const origem = await lerRelatorio(body.duplicarDe);
      if (!origem) return NextResponse.json({ erro: 'Relatório de origem não encontrado.' }, { status: 404 });
      const agora = new Date().toISOString();
      r = {
        ...structuredClone(origem),
        id: crypto.randomUUID(),
        status: 'rascunho',
        num: '',
        data: hojeISO(),
        criadoEm: agora,
        atualizadoEm: agora,
        concluidoEm: null,
        compartilhar: null,
        videos: [],
        msgCliente: '',
      };
    } else {
      r = novoRelatorio(await lerModelo());
    }
    await gravarRelatorio(r);
    return NextResponse.json(r, { status: 201 });
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Não foi possível criar o relatório.' }, { status: 500 });
  }
}
