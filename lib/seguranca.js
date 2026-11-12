// Validação dos dados que chegam do navegador antes de gravar.
// Impede links perigosos (ex.: "javascript:") e textos/listas gigantes.

const MAX_TEXTO = 5000;
const MAX_LISTA = 60;

// Endereço de foto: arquivo do próprio sistema, foto no Vercel Blob (https) ou imagem embutida (uso local)
export function fotoSegura(u) {
  const s = String(u ?? '').trim();
  if (!s) return '';
  if (/^\/exemplo\/[\w.-]+$/.test(s)) return s;
  if (/^https:\/\/[^\s"'<>]+$/i.test(s)) return s;
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s)) return s;
  return '';
}

// Endereço de vídeo ou link: só https
export function linkSeguro(u) {
  const s = String(u ?? '').trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(s) && s.length <= 1000 ? s : '';
}

const texto = (v, max = MAX_TEXTO) => (v == null ? '' : String(v).slice(0, max));
const numero = (v) => (v === '' || v == null ? '' : Number.isFinite(Number(v)) ? Number(v) : '');
const pares = (v, segundoNumero) =>
  (Array.isArray(v) ? v : []).slice(0, MAX_LISTA).map((p) => [
    texto(Array.isArray(p) ? p[0] : '', 300),
    segundoNumero ? numero(Array.isArray(p) ? p[1] : '') : texto(Array.isArray(p) ? p[1] : '', 300),
  ]);

// Limpa os campos editáveis de um relatório (o que não estiver em `campos` é ignorado)
export function limparRelatorio(dados, campos) {
  const r = {};
  for (const k of campos) {
    if (!(k in dados)) continue;
    const v = dados[k];
    switch (k) {
      case 'res': r[k] = pares(v, false); break;
      case 'itens': r[k] = pares(v, true); break;
      case 'defPhotos': r[k] = (Array.isArray(v) ? v : []).slice(0, 4).map(fotoSegura); break;
      case 'eqPhoto':
      case 'newPhoto': r[k] = fotoSegura(v); break;
      case 'pecas':
        r[k] = (Array.isArray(v) ? v : []).slice(0, MAX_LISTA).map((p) => ({
          nome: texto(p?.nome, 300), qtd: numero(p?.qtd), valor: numero(p?.valor), foto: fotoSegura(p?.foto),
        }));
        break;
      case 'videos':
        r[k] = (Array.isArray(v) ? v : []).slice(0, 30).map((x) => ({
          titulo: texto(x?.titulo, 200),
          url: x?.tipo === 'link' && !x?.url ? '' : linkSeguro(x?.url),
          tipo: x?.tipo === 'arquivo' ? 'arquivo' : 'link',
          fase: x?.fase === 'servico' ? 'servico' : 'diagnostico',
        }));
        break;
      case 'pecaItem': r[k] = !!v; break;
      case 'pecaV': r[k] = numero(v); break;
      case 'resultado': r[k] = v === 'APROVADO' ? 'APROVADO' : 'REPROVADO'; break;
      case 'data': r[k] = /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : ''; break;
      case 'icone': r[k] = ['lavadora', 'geladeira', 'micro', 'ar', 'foto'].includes(v) ? v : 'lavadora'; break;
      default: r[k] = texto(v);
    }
  }
  return r;
}
