// Armazenamento dos relatórios.
// Na Vercel: Upstash Redis (um registro JSON por relatório + um índice ordenado).
// No seu computador, sem variáveis configuradas: arquivo .data/db.json.
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';
import { resumo } from './format';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const K_INDEX = 'relatorios';
const kRel = (id) => `relatorio:${id}`;
const K_MODELO = 'modelo';

/* ---------- fallback local ---------- */
const DB_FILE = path.join(process.cwd(), '.data', 'db.json');
async function lerArquivo() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch {
    return { relatorios: {}, modelo: null };
  }
}
async function gravarArquivo(db) {
  if (process.env.VERCEL) {
    throw new Error('Banco não configurado: conecte o Upstash Redis ao projeto na Vercel.');
  }
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

/* ---------- relatórios ---------- */
export async function listarRelatorios() {
  if (redis) {
    const ids = await redis.zrange(K_INDEX, 0, -1, { rev: true });
    if (!ids.length) return [];
    const docs = await redis.mget(...ids.map(kRel));
    return docs.filter(Boolean).map(resumo);
  }
  const db = await lerArquivo();
  return Object.values(db.relatorios)
    .sort((a, b) => String(b.atualizadoEm).localeCompare(String(a.atualizadoEm)))
    .map(resumo);
}

// Todos os relatórios completos (para o backup)
export async function todosRelatorios() {
  if (redis) {
    const ids = await redis.zrange(K_INDEX, 0, -1, { rev: true });
    const out = [];
    // em blocos, para não pedir tudo de uma vez
    for (let i = 0; i < ids.length; i += 50) {
      const docs = await redis.mget(...ids.slice(i, i + 50).map(kRel));
      out.push(...docs.filter(Boolean));
    }
    return out;
  }
  const db = await lerArquivo();
  return Object.values(db.relatorios);
}

export async function lerRelatorio(id) {
  if (redis) return (await redis.get(kRel(id))) || null;
  const db = await lerArquivo();
  return db.relatorios[id] || null;
}

export async function gravarRelatorio(r) {
  if (redis) {
    await redis.set(kRel(r.id), r);
    await redis.zadd(K_INDEX, { score: Date.parse(r.atualizadoEm) || Date.now(), member: r.id });
    return r;
  }
  const db = await lerArquivo();
  db.relatorios[r.id] = r;
  await gravarArquivo(db);
  return r;
}

export async function excluirRelatorio(id) {
  if (redis) {
    await redis.del(kRel(id));
    await redis.zrem(K_INDEX, id);
    return;
  }
  const db = await lerArquivo();
  delete db.relatorios[id];
  await gravarArquivo(db);
}

/* ---------- modelo ---------- */
export async function lerModelo() {
  if (redis) return (await redis.get(K_MODELO)) || null;
  return (await lerArquivo()).modelo || null;
}

export async function gravarModelo(m) {
  if (redis) {
    await redis.set(K_MODELO, m);
    return m;
  }
  const db = await lerArquivo();
  db.modelo = m;
  await gravarArquivo(db);
  return m;
}
