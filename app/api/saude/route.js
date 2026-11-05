// Diagnóstico temporário: diz se o banco e o armazenamento de fotos estão configurados.
// Não mostra nenhuma chave. Remover depois de resolver o envio de fotos.
import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const info = {
    redis: !!((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)),
    blobStoreId: !!process.env.BLOB_STORE_ID,
    blobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    oidc: !!process.env.VERCEL_OIDC_TOKEN,
    senha: !!process.env.APP_PASSWORD,
    teste: '',
  };
  try {
    const b = await put(`diagnostico/${Date.now()}.txt`, 'ok', { access: 'public', contentType: 'text/plain' });
    await del(b.url).catch(() => {});
    info.teste = 'ok';
  } catch (e) {
    info.teste = String(e?.message || e).slice(0, 300);
  }
  return NextResponse.json(info);
}
