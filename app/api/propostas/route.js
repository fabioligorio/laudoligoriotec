import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { listarPropostas, lerProposta, gravarProposta } from '@/lib/store';
import { novaProposta, resumoProposta, limparProposta } from '@/lib/propostas';
import { ehFoto } from '@/lib/seguranca';
import { propostaExemplo } from '@/lib/propostaExemplo';
import { semLogin } from '@/lib/sessao';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Imagens que chegam dentro do arquivo importado (data:image/...) vão para o Blob, como as fotos enviadas
async function guardarImagens(p) {
  const temBlob = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID;
  for (const s of p.secoes || []) {
    for (const im of s.imagens || []) {
      const m = String(im.url).match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
      if (!m) continue;
      const bytes = Buffer.from(m[2], 'base64');
      if (bytes.length > 4 * 1024 * 1024 || !ehFoto(new Uint8Array(bytes))) { im.url = ''; continue; }
      if (!temBlob) continue; // uso local: a imagem fica dentro da proposta
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
      const blob = await put(`propostas/${crypto.randomUUID()}.${ext}`, bytes, { access: 'public', contentType: `image/${m[1]}` });
      im.url = blob.url;
    }
    s.imagens = (s.imagens || []).filter((im) => im.url);
  }
}

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
  if (body.importar && typeof body.importar === 'object') {
    // arquivo .json com uma proposta pronta (aceita { proposta: {...} } ou a proposta direto)
    const dados = body.importar.proposta || body.importar;
    p = { ...novaProposta(), ...limparProposta(dados) };
    try {
      await guardarImagens(p);
    } catch (e) {
      console.error('importar imagens', e);
      return NextResponse.json({ erro: 'Não foi possível gravar as imagens da proposta. Tente de novo.' }, { status: 500 });
    }
  } else if (body.exemplo) {
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
