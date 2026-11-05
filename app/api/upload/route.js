import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

// Recebe uma foto já comprimida pelo navegador e devolve o endereço dela.
export async function POST(req) {
  const fd = await req.formData().catch(() => null);
  const foto = fd?.get('foto');
  if (!foto || typeof foto === 'string') {
    return NextResponse.json({ erro: 'Nenhuma foto recebida.' }, { status: 400 });
  }
  if (foto.size > 4 * 1024 * 1024) {
    return NextResponse.json({ erro: 'Foto grande demais (máximo 4 MB).' }, { status: 413 });
  }

  // Sem Blob configurado (uso local): guarda a foto dentro do próprio relatório.
  // Na Vercel, o Blob conectado cria BLOB_STORE_ID (login automático por OIDC);
  // projetos antigos usam BLOB_READ_WRITE_TOKEN.
  const temBlob = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID;
  if (!temBlob) {
    if (process.env.VERCEL) {
      return NextResponse.json(
        { erro: 'Armazenamento de fotos não configurado: conecte o Vercel Blob ao projeto.' },
        { status: 500 }
      );
    }
    const b64 = Buffer.from(await foto.arrayBuffer()).toString('base64');
    return NextResponse.json({ url: `data:image/jpeg;base64,${b64}` });
  }

  try {
    const blob = await put(`fotos/${crypto.randomUUID()}.jpg`, foto, {
      access: 'public',
      contentType: 'image/jpeg',
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('upload', e);
    return NextResponse.json({ erro: 'Blob: ' + (e?.message || 'falha ao gravar a foto.') }, { status: 500 });
  }
}
