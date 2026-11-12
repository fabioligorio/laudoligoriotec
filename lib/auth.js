// Login por senha única (variável APP_PASSWORD).
// O cookie guarda "validade.assinatura": a assinatura é um HMAC-SHA256 da validade,
// feito com a própria senha como chave. Ninguém consegue forjar um cookie sem saber a senha,
// cada sessão expira sozinha, e trocar a senha derruba todas as sessões.
// Usa só a Web Crypto, para funcionar também no middleware (Edge).
export const COOKIE = 'lt_sessao';
export const DURACAO_SESSAO = 60 * 60 * 24 * 30; // 30 dias, em segundos

const enc = new TextEncoder();

async function hmac(senha, msg) {
  const chave = await crypto.subtle.importKey(
    'raw', enc.encode('ligoriotec-sessao:' + senha), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', chave, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// comparação em tempo constante (não revela quantos caracteres batem)
export function iguais(a, b) {
  a = String(a ?? '');
  b = String(b ?? '');
  let dif = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0;
}

export async function criarSessao(senha) {
  const validade = String(Math.floor(Date.now() / 1000) + DURACAO_SESSAO);
  return `${validade}.${await hmac(senha, validade)}`;
}

export async function sessaoValida(valor, senha) {
  if (!valor || !senha) return false;
  const [validade, sig] = String(valor).split('.');
  if (!/^\d{9,12}$/.test(validade || '') || !sig) return false;
  if (Number(validade) < Date.now() / 1000) return false;
  return iguais(sig, await hmac(senha, validade));
}
