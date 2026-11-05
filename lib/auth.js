// Login simples por senha única (variável APP_PASSWORD).
// O cookie guarda um hash da senha; trocar a senha derruba todas as sessões.
export const COOKIE = 'lt_auth';

export async function tokenDaSenha(senha) {
  const dados = new TextEncoder().encode('ligoriotec:' + senha);
  const hash = await crypto.subtle.digest('SHA-256', dados);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
