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
        r[k] = (Array.isArray(v) ? v : []).slice(0, 60).map((x) => ({
          titulo: texto(x?.titulo, 200),
          url: x?.tipo === 'foto' ? fotoSegura(x?.url) : linkSeguro(x?.url),
          tipo: ['arquivo', 'foto'].includes(x?.tipo) ? x.tipo : 'link',
          fase: ['servico', 'sugestao'].includes(x?.fase) ? x.fase : 'diagnostico',
        }));
        break;
      case 'notaFiscal':
        r[k] = v && typeof v === 'object'
          ? { tipo: v.tipo === 'arquivo' ? 'arquivo' : 'link', url: linkSeguro(v.url), nome: texto(v.nome, 200) }
          : null;
        break;
      case 'tipo': r[k] = v === 'orcamento' ? 'orcamento' : 'laudo'; break;
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

// O que vai para a página pública do cliente: o relatório sem os dados internos
// (código do link, ligação com a solicitação de visita, datas de controle, situação).
const INTERNOS = ['id', 'compartilhar', 'visitaId', 'status', 'criadoEm', 'atualizadoEm', 'concluidoEm'];
export function paraCliente(r) {
  const out = { ...r };
  for (const k of INTERNOS) delete out[k];
  return out;
}

// Campos do modelo (usado ao salvar o modelo e ao importar backup)
export function limparModelo(body, padrao) {
  const m = {};
  if (!body || typeof body !== 'object') return m;
  for (const k of Object.keys(padrao)) {
    if (!(k in body)) continue;
    if (k === 'servicos') {
      m[k] = (Array.isArray(body[k]) ? body[k] : []).slice(0, 60).map((p) => [
        String((Array.isArray(p) ? p[0] : '') ?? '').slice(0, 300),
        Number.isFinite(Number(p?.[1])) && p?.[1] !== '' ? Number(p[1]) : '',
      ]);
    } else {
      m[k] = String(body[k] ?? '').slice(0, 5000);
    }
  }
  return m;
}

// Confere pelo conteúdo que o arquivo é mesmo uma foto JPEG, PNG ou WebP
export function ehFoto(bytes) {
  const b = bytes;
  if (b.length < 12) return false;
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const webp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  return jpeg || png || webp;
}
