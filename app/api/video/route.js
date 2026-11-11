// Envio de vídeos direto do navegador para o Vercel Blob (vídeos passam do limite de 4,5 MB
// que a Vercel aceita numa requisição comum). Esta rota só gera a autorização de envio.
import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { COOKIE, tokenDaSenha } from '@/lib/auth';

export const runtime = 'nodejs';

async function logado(req) {
  const senha = process.env.APP_PASSWORD;
  if (!senha) return process.env.NODE_ENV !== 'production';
  return req.cookies.get(COOKIE)?.value === (await tokenDaSenha(senha));
}

export async function POST(req) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { erro: 'Envio de vídeos só funciona na versão online (precisa do Vercel Blob).' },
      { status: 400 }
    );
  }
  const body = await req.json();
  try {
    const resposta = await handleUpload({
      body,
      request: req,
      // chamado quando o navegador pede para enviar: só quem está logado
      onBeforeGenerateToken: async () => {
        if (!(await logado(req))) throw new Error('Sessão expirada. Entre de novo.');
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/3gpp'],
          maximumSizeInBytes: 300 * 1024 * 1024, // 300 MB por vídeo
          addRandomSuffix: true,
        };
      },
      // aviso do Vercel Blob depois do envio (o endereço já volta direto para o navegador)
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(resposta);
  } catch (e) {
    return NextResponse.json({ erro: e.message || 'Falha ao autorizar o envio.' }, { status: 400 });
  }
}
