// Cadastro de clientes e o link único do cliente (portal com tudo dele)

// "Júlia  Souza" -> "julia souza"
export const normalizar = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const digitos = (s) => String(s || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');

// O item parece ser deste cliente? (mesmo nome, ou mesmo WhatsApp)
export function parecido(c, nome, zap) {
  const a = normalizar(c.nome);
  const b = normalizar(nome);
  const z1 = digitos(c.whatsapp);
  const z2 = digitos(zap);
  if (z1.length >= 10 && z2.length >= 10 && z1.slice(-8) === z2.slice(-8)) return true;
  if (!a || !b) return false;
  if (a === b) return true;
  // um nome contém o outro inteiro ("H2 Club" e "H2 Club Curitiba")
  const curto = a.length < b.length ? a : b;
  const longo = a.length < b.length ? b : a;
  return curto.length >= 4 && ` ${longo} `.includes(` ${curto} `);
}

const txt = (v, max) => String(v ?? '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max);

export function validarCliente(b) {
  const d = { nome: txt(b?.nome, 120), whatsapp: txt(b?.whatsapp, 30), obs: String(b?.obs ?? '').slice(0, 1000) };
  if (d.nome.length < 2) return { erro: 'Informe o nome do cliente.' };
  const n = digitos(d.whatsapp);
  if (n && (n.length < 10 || n.length > 11)) return { erro: 'WhatsApp incompleto (use o DDD).' };
  return { dados: d };
}

export const TIPOS_ITEM = ['relatorio', 'visita', 'proposta'];

export const novoTokenCliente = () =>
  [...crypto.getRandomValues(new Uint8Array(18))].map((b) => b.toString(16).padStart(2, '0')).join('');
