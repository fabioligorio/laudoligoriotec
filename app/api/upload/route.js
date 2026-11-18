import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { ehFoto } from '@/lib/seguranca';
import { semLogin } from '@/lib/sessao';

export const runtime = 'nodejs';

// Recebe uma foto já comprimida pelo navegador e devolve o endereço dela.
export async function POST(req) {
  const negado = await semLogin();
  if (negado) return negado;
  const fd = await req.formData().catch(() => null);
  const foto = fd?.get('foto');
  if (!foto || typeof foto === 'string') {
    return NextResponse.json({ erro: 'Nenhuma foto recebida.' }, { status: 400 });
  }
  if (foto.size > 4 * 1024 * 1024) {
    return NextResponse.json({ erro: 'Foto grande demais (máximo 4 MB).' }, { status: 413 });
  }

  const bytes = new Uint8Array(await foto.arrayBuffer());
  if (!ehFoto(bytes)) {
    return NextResponse.json({ erro: 'O arquivo enviado não é uma foto (JPG, PNG ou WebP).' }, { status: 415 });
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
    const b64 = Buffer.from(bytes).toString('base64');
    return NextResponse.json({ url: `data:image/jpeg;base64,${b64}` });
  }

  try {
    const blob = await put(`fotos/${crypto.randomUUID()}.jpg`, Buffer.from(bytes), {
      access: 'public',
      contentType: 'image/jpeg',
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('upload', e);
    return NextResponse.json({ erro: 'Não foi possível gravar a foto. Tente de novo.' }, { status: 500 });
  }
}
