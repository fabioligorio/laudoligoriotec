'use client';
import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { numero } from '@/lib/format';
import { comprimir } from './Campos';

// Aba "Cliente" do editor: link para o cliente e as fotos e vídeos do serviço.
// As fotos e vídeos ficam no campo `videos`, com tipo 'foto' | 'arquivo' (vídeo enviado) | 'link'.
// Funciona também com o relatório concluído.
// Vídeos sem fase (criados antes desta separação) contam como diagnóstico
export const faseDe = (v) => (v.fase === 'servico' ? 'servico' : 'diagnostico');
const FASES = [
  ['diagnostico', 'Fotos e vídeos do diagnóstico', 'O defeito encontrado e os testes feitos. Aparecem antes do laudo.'],
  ['servico', 'Fotos e vídeos do serviço realizado', 'O equipamento funcionando depois do conserto. Aparecem no fim da página.'],
];

export default function AbaCliente({ r, set, setR }) {
  const [ocupado, setOcupado] = useState('');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [progresso, setProgresso] = useState(null);

  const [origem, setOrigem] = useState('');
  useEffect(() => setOrigem(window.location.origin), []);
  const comp = r.compartilhar;
  const url = comp?.token && origem ? `${origem}/c/${comp.token}` : '';
  const videos = r.videos || [];

  async function link(acao) {
    setErro('');
    setOcupado(acao);
    try {
      const res = await fetch(`/api/relatorios/${r.id}/link`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ acao }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.erro || 'Não foi possível atualizar o link.');
      setR((p) => ({ ...p, compartilhar: j.compartilhar }));
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado('');
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      document.getElementById('cli-link')?.select();
    }
  }

  const texto =
    `Olá${r.cliente ? ', ' + r.cliente : ''}! Aqui estão o laudo técnico, o orçamento` +
    `${videos.length ? ' e as fotos e vídeos' : ''} do seu ${r.equip || 'equipamento'} (nº ${numero(r)}):\n${url}\n\nLigorioTec · Tecnologia que conecta.`;
  const whats = `https://wa.me/?text=${encodeURIComponent(texto)}`;

  async function enviarVideo(e, fase) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro('');
    setProgresso({ fase, pct: 0 });
    try {
      const nome = arquivo.name.replace(/[^\w.-]+/g, '-').slice(-60);
      const blob = await upload(`videos/${r.id}/${nome}`, arquivo, {
        access: 'public',
        handleUploadUrl: '/api/video',
        multipart: arquivo.size > 20 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgresso({ fase, pct: Math.round(percentage) }),
      });
      const titulo = arquivo.name.replace(/\.[^.]+$/, '');
      set('videos', [...videos, { titulo, url: blob.url, tipo: 'arquivo', fase }]);
    } catch (err) {
      setErro(err.message || 'Falha ao enviar o vídeo.');
    } finally {
      setProgresso(null);
    }
  }

  // Várias fotos de uma vez: comprime no aparelho e envia uma por uma
  async function enviarFotos(e, fase) {
    const arquivos = [...(e.target.files || [])].slice(0, 20);
    e.target.value = '';
    if (!arquivos.length) return;
    setErro('');
    const novas = [];
    try {
      for (let n = 0; n < arquivos.length; n++) {
        setProgresso({ fase, pct: Math.round((n / arquivos.length) * 100), foto: true, n: n + 1, total: arquivos.length });
        const fd = new FormData();
        fd.append('foto', await comprimir(arquivos[n]), 'foto.jpg');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.erro || `Falha ao enviar a foto (erro ${res.status}).`);
        novas.push({ titulo: '', url: j.url, tipo: 'foto', fase });
      }
    } catch (err) {
      setErro(err.message || 'Falha ao enviar a foto.');
    } finally {
      if (novas.length) set('videos', [...videos, ...novas]);
      setProgresso(null);
    }
  }

  // Nota fiscal: PDF ou foto enviado direto para o Vercel Blob
  async function enviarNota(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro('');
    setProgresso({ fase: 'nota', pct: 0 });
    try {
      const nome = arquivo.name.replace(/[^\w.-]+/g, '-').slice(-60);
      const blob = await upload(`notas/${r.id}/${nome}`, arquivo, {
        access: 'public',
        handleUploadUrl: '/api/video',
        onUploadProgress: ({ percentage }) => setProgresso({ fase: 'nota', pct: Math.round(percentage) }),
      });
      set('notaFiscal', { tipo: 'arquivo', url: blob.url, nome: arquivo.name.replace(/\.[^.]+$/, '') });
    } catch (err) {
      setErro(err.message || 'Falha ao enviar a nota fiscal.');
    } finally {
      setProgresso(null);
    }
  }
  const nf = r.notaFiscal || null;

  const mudar = (i, campo, v) => set('videos', videos.map((x, k) => (k === i ? { ...x, [campo]: v } : x)));

  return (
    <div className="painel">
      <fieldset>
        <legend>Link para o cliente</legend>
        {!comp ? (
          <>
            <p className="hint">
              Crie um link para mandar ao cliente. Ele abre o laudo, o orçamento, as fotos, os vídeos e a nota fiscal no celular,
              sem precisar de senha, e pode aprovar o orçamento pelo WhatsApp.
            </p>
            <button type="button" className="btn primary" onClick={() => link('gerar')} disabled={!!ocupado}>
              {ocupado ? 'Criando…' : 'Criar link para o cliente'}
            </button>
          </>
        ) : (
          <>
            <div className={'link-cli' + (comp.ativo ? '' : ' off')}>
              <input id="cli-link" type="text" readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Link do cliente" />
              <span className={'pill ' + (comp.ativo ? 'concluido' : 'rascunho')}>{comp.ativo ? 'Ativo' : 'Desativado'}</span>
            </div>
            {comp.ativo ? (
              <div className="acoes-link">
                <button type="button" className="btn" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar link'}</button>
                <a className="btn primary" href={whats} target="_blank" rel="noopener">Enviar pelo WhatsApp</a>
                <a className="btn" href={url} target="_blank" rel="noopener">Ver como o cliente</a>
              </div>
            ) : (
              <p className="hint">O link está desativado: quem tentar abrir verá uma mensagem de link indisponível.</p>
            )}
            <div className="acoes-link">
              {comp.ativo ? (
                <button type="button" className="btn ghost" onClick={() => link('desativar')} disabled={!!ocupado}>Desativar link</button>
              ) : (
                <button type="button" className="btn" onClick={() => link('ativar')} disabled={!!ocupado}>Reativar link</button>
              )}
              <button type="button" className="btn ghost" onClick={() => link('novo')} disabled={!!ocupado} title="O link antigo para de funcionar">
                Trocar por um link novo
              </button>
            </div>
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>Nota fiscal</legend>
        <p className="hint">O cliente baixa pela página dele. Envie o PDF (ou uma foto) ou cole o link do site da prefeitura.</p>
        {nf ? (
          <div className="video-item">
            <div className="video-link">{nf.tipo === 'arquivo' ? 'NF' : 'Link'}</div>
            <div className="campos">
              <label htmlFor="nf-nome">Nome mostrado ao cliente
                <input id="nf-nome" type="text" value={nf.nome || ''} onChange={(e) => set('notaFiscal', { ...nf, nome: e.target.value })} placeholder="Nota fiscal do serviço" />
              </label>
              {nf.tipo === 'link' ? (
                <label htmlFor="nf-url">Endereço da nota
                  <input id="nf-url" type="text" inputMode="url" value={nf.url || ''} onChange={(e) => set('notaFiscal', { ...nf, url: e.target.value.trim() })} placeholder="https://" />
                </label>
              ) : (
                nf.url && <a className="mover" href={nf.url} target="_blank" rel="noopener">Abrir o arquivo enviado</a>
              )}
            </div>
            <button type="button" className="icon-btn" aria-label="Remover nota fiscal" onClick={() => set('notaFiscal', null)}>×</button>
          </div>
        ) : (
          <div className="acoes-link">
            <label className="add" htmlFor="nf-arquivo" aria-disabled={progresso !== null}>
              + Enviar nota fiscal
              <input id="nf-arquivo" type="file" accept="application/pdf,image/*" hidden onChange={enviarNota} disabled={progresso !== null} />
            </label>
            <button type="button" className="add" onClick={() => set('notaFiscal', { tipo: 'link', url: '', nome: '' })}>
              + Colar link da nota
            </button>
          </div>
        )}
        {progresso?.fase === 'nota' && (
          <div className="progresso" role="status">
            <div style={{ width: `${progresso.pct}%` }} />
            <span>Enviando nota fiscal… {progresso.pct}%</span>
          </div>
        )}
      </fieldset>

      {FASES.map(([fase, titulo, dica]) => (
        <fieldset key={fase}>
          <legend>{titulo}</legend>
          <p className="hint">{dica}</p>
          {videos.map((v, i) => (faseDe(v) !== fase ? null : (
            <div className="video-item" key={i}>
              {v.tipo === 'foto' ? (
                <img src={v.url} alt="" />
              ) : v.tipo === 'arquivo' ? (
                <video src={v.url} preload="metadata" muted playsInline controls />
              ) : (
                <div className="video-link">Link</div>
              )}
              <div className="campos">
                <label htmlFor={`vid-tit-${i}`}>{v.tipo === 'foto' ? 'Legenda' : 'Título'} <small>opcional</small>
                  <input id={`vid-tit-${i}`} type="text" value={v.titulo || ''} onChange={(e) => mudar(i, 'titulo', e.target.value)} />
                </label>
                {v.tipo === 'link' && (
                  <label htmlFor={`vid-url-${i}`}>Endereço (YouTube, Google Drive…)
                    <input id={`vid-url-${i}`} type="text" inputMode="url" value={v.url || ''} onChange={(e) => mudar(i, 'url', e.target.value.trim())} placeholder="https://" />
                  </label>
                )}
                <button type="button" className="mover" onClick={() => mudar(i, 'fase', fase === 'diagnostico' ? 'servico' : 'diagnostico')}>
                  {fase === 'diagnostico' ? 'Mover para depois do serviço' : 'Mover para diagnóstico'}
                </button>
              </div>
              <button type="button" className="icon-btn" aria-label={`Remover ${v.tipo === 'foto' ? 'foto' : 'vídeo'} ${i + 1}`} onClick={() => set('videos', videos.filter((_, k) => k !== i))}>×</button>
            </div>
          )))}
          {progresso?.fase === fase && (
            <div className="progresso" role="status">
              <div style={{ width: `${progresso.pct}%` }} />
              <span>{progresso.foto ? `Enviando foto ${progresso.n} de ${progresso.total}…` : `Enviando vídeo… ${progresso.pct}%`}</span>
            </div>
          )}
          <div className="acoes-link">
            <label className="add" htmlFor={`foto-arquivo-${fase}`} aria-disabled={progresso !== null}>
              + Enviar fotos
              <input id={`foto-arquivo-${fase}`} type="file" accept="image/*" multiple hidden onChange={(e) => enviarFotos(e, fase)} disabled={progresso !== null} />
            </label>
            <label className="add" htmlFor={`video-arquivo-${fase}`} aria-disabled={progresso !== null}>
              + Enviar vídeo
              <input id={`video-arquivo-${fase}`} type="file" accept="video/*" hidden onChange={(e) => enviarVideo(e, fase)} disabled={progresso !== null} />
            </label>
            <button type="button" className="add" onClick={() => set('videos', [...videos, { titulo: '', url: '', tipo: 'link', fase }])}>
              + Adicionar link de vídeo
            </button>
          </div>
        </fieldset>
      ))}
      <p className="hint">
        Fotos e vídeos enviados ocupam o armazenamento grátis da Vercel (1 GB no total). As fotos são reduzidas
        automaticamente (cerca de 150 KB cada). Para vídeos longos, prefira
        subir no YouTube como "não listado" e colar o link.
      </p>

      {erro && <p className="estado erro" role="alert">{erro}</p>}
    </div>
  );
}
