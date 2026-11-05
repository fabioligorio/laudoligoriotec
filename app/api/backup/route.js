import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { todosRelatorios, lerRelatorio, gravarRelatorio, lerModelo, gravarModelo } from '@/lib/store';
import { hojeISO } from '@/lib/defaults';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// GET: baixa um arquivo com todos os relatórios e o modelo
export async function GET() {
  const dados = {
    sistema: 'ligoriotec-laudos',
    versao: 1,
    geradoEm: new Date().toISOString(),
    modelo: await lerModelo(),
    relatorios: await todosRelatorios(),
  };
  return new NextResponse(JSON.stringify(dados), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="backup-ligoriotec-${hojeISO()}.json"`,
    },
  });
}

/* ---------- importação ---------- */

const temBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// Foto gravada dentro do relatório (uso local) vira arquivo no Vercel Blob
async function subirFoto(src) {
  if (typeof src !== 'string' || !src.startsWith('data:image/') || !temBlob()) return src;
  const m = src.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!m) return src;
  const ext = m[1].includes('png') ? 'png' : 'jpg';
  const blob = await put(`fotos/${crypto.randomUUID()}.${ext}`, Buffer.from(m[2], 'base64'), {
    access: 'public',
    contentType: m[1],
  });
  return blob.url;
}

async function converterFotos(r) {
  const n = { ...r };
  if (Array.isArray(n.defPhotos)) n.defPhotos = await Promise.all(n.defPhotos.map(subirFoto));
  if (n.eqPhoto) n.eqPhoto = await subirFoto(n.eqPhoto);
  if (n.newPhoto) n.newPhoto = await subirFoto(n.newPhoto);
  if (Array.isArray(n.pecas)) {
    n.pecas = await Promise.all(n.pecas.map(async (p) => ({ ...p, foto: await subirFoto(p.foto) })));
  }
  return n;
}

// POST: importa UM item por vez (o navegador manda um relatório de cada vez,
// para não passar do limite de tamanho de envio da Vercel).
// body: { relatorio } ou { modelo, substituirModelo }
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ erro: 'Arquivo inválido.' }, { status: 400 });

  try {
    if (body.modelo) {
      const atual = await lerModelo();
      if (atual && !body.substituirModelo) return NextResponse.json({ resultado: 'modelo-mantido' });
      await gravarModelo(body.modelo);
      return NextResponse.json({ resultado: 'modelo-importado' });
    }

    const r = body.relatorio;
    if (!r || typeof r !== 'object' || !/^[\w-]{8,64}$/.test(r.id || '')) {
      return NextResponse.json({ erro: 'Relatório inválido no arquivo.' }, { status: 400 });
    }
    const existente = await lerRelatorio(r.id);
    if (existente && String(existente.atualizadoEm) >= String(r.atualizadoEm)) {
      return NextResponse.json({ resultado: 'ja-existe' });
    }
    await gravarRelatorio(await converterFotos(r));
    return NextResponse.json({ resultado: existente ? 'atualizado' : 'importado' });
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Falha ao importar.' }, { status: 500 });
  }
}
