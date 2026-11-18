import { NextResponse } from 'next/server';
import { listarRelatorios, lerRelatorio, gravarRelatorio, lerModelo, lerVisita, gravarVisita } from '@/lib/store';
import { novoRelatorio, relatorioExemplo, hojeISO } from '@/lib/defaults';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

export async function GET() {
  const negado = await semLogin();
  if (negado) return negado;
  return NextResponse.json(await listarRelatorios());
}

// Cria um relatório: em branco (a partir do modelo), duplicado de outro, ou o exemplo.
export async function POST(req) {
  const negado = await semLogin();
  if (negado) return negado;
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
        notaFiscal: null,
      };
    } else {
      r = novoRelatorio(await lerModelo(), body.tipo);
      // a partir de uma solicitação de visita: já traz o cliente, o equipamento e o problema
      if (body.deVisita) {
        const v = await lerVisita(body.deVisita);
        if (v) {
          r.cliente = v.nome || '';
          r.equip = [v.equipamento === 'Outro' ? '' : v.equipamento, v.marca].filter(Boolean).join(' ');
          r.recl = v.problema || '';
          r.visitaId = v.id;
          await gravarRelatorio(r);
          await gravarVisita({ ...v, relatorioId: r.id, status: v.status === 'nova' ? 'agendada' : v.status, atualizadoEm: new Date().toISOString() });
          return NextResponse.json(r, { status: 201 });
        }
      }
    }
    await gravarRelatorio(r);
    return NextResponse.json(r, { status: 201 });
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Não foi possível criar o relatório.' }, { status: 500 });
  }
}
