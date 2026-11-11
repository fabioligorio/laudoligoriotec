'use client';
import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { numero } from '@/lib/format';

// Aba "Cliente" do editor: link para o cliente, mensagem e vídeos do serviço.
// Funciona também com o relatório concluído.
// Vídeos sem fase (criados antes desta separação) contam como diagnóstico
export const faseDe = (v) => (v.fase === 'servico' ? 'servico' : 'diagnostico');
const FASES = [
  ['diagnostico', 'Vídeos do diagnóstico', 'O defeito encontrado e os testes feitos. Aparecem antes do laudo.'],
  ['servico', 'Vídeos do serviço realizado', 'O equipamento funcionando depois do conserto. Aparecem no fim da página.'],
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
    `${videos.length ? ' e os vídeos' : ''} do seu ${r.equip || 'equipamento'} (nº ${numero(r)}):\n${url}\n\nLigorioTec · Tecnologia que conecta.`;
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

  const mudar = (i, campo, v) => set('videos', videos.map((x, k) => (k === i ? { ...x, [campo]: v } : x)));

  return (
    <div className="painel">
      <fieldset>
        <legend>Link para o cliente</legend>
        {!comp ? (
          <>
            <p className="hint">
              Crie um link para mandar ao cliente. Ele abre o laudo, o orçamento e os vídeos no celular,
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

      {FASES.map(([fase, titulo, dica]) => (
        <fieldset key={fase}>
          <legend>{titulo}</legend>
          <p className="hint">{dica}</p>
          {videos.map((v, i) => (faseDe(v) !== fase ? null : (
            <div className="video-item" key={i}>
              {v.tipo === 'arquivo' ? (
                <video src={v.url} preload="metadata" muted playsInline controls />
              ) : (
                <div className="video-link">Link</div>
              )}
              <div className="campos">
                <label htmlFor={`vid-tit-${i}`}>Título
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
              <button type="button" className="icon-btn" aria-label={`Remover vídeo ${i + 1}`} onClick={() => set('videos', videos.filter((_, k) => k !== i))}>×</button>
            </div>
          )))}
          {progresso?.fase === fase && (
            <div className="progresso" role="status">
              <div style={{ width: `${progresso.pct}%` }} />
              <span>Enviando vídeo… {progresso.pct}%</span>
            </div>
          )}
          <div className="acoes-link">
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
        Vídeos enviados ocupam o armazenamento grátis da Vercel (1 GB no total). Para vídeos longos, prefira
        subir no YouTube como "não listado" e colar o link.
      </p>

      {erro && <p className="estado erro" role="alert">{erro}</p>}
    </div>
  );
}
