'use client';
import { useEffect } from 'react';
import { Laudo, Orcamento, Escala, useQR } from './Documento';
import { Logo } from './Marca';
import { ajustarFolhas } from '@/lib/impressao';
import { brl, fdate, numero, totalDoOrcamento } from '@/lib/format';

// Transforma links do YouTube em vídeo incorporado; outros links viram botão
function embedYoutube(url) {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  } catch {
    return '';
  }
}

function Video({ v }) {
  if (v.tipo === 'arquivo') {
    return <video src={v.url} controls playsInline preload="metadata" />;
  }
  const yt = embedYoutube(v.url);
  if (yt) {
    return (
      <iframe
        src={yt}
        title={v.titulo || 'Vídeo do serviço'}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  return (
    <a className="video-externo" href={v.url} target="_blank" rel="noopener noreferrer">
      <span>▶</span> Abrir vídeo
    </a>
  );
}

export default function ClientePagina({ r, token }) {
  const qr = useQR(r.zap, r.site);
  const zap = String(r.zap || '').replace(/\D/g, '');
  const total = totalDoOrcamento(r);
  const videos = (r.videos || []).filter((v) => v.url);
  const num = numero(r);

  const msgAprovar = `Olá! Aprovo o orçamento nº ${num} (${r.equip || 'equipamento'}), no valor de R$ ${brl(total)}.`;
  const msgDuvida = `Olá! Tenho uma dúvida sobre o laudo/orçamento nº ${num}.`;
  const wa = (t) => (zap ? `https://wa.me/55${zap}?text=${encodeURIComponent(t)}` : '');

  useEffect(() => {
    window.addEventListener('beforeprint', ajustarFolhas);
    return () => window.removeEventListener('beforeprint', ajustarFolhas);
  }, []);

  return (
    <div className="cli">
      <header className="cli-topo">
        <div className="cli-topo-in">
          <Logo escuro altura={32} />
          <span className="cli-assin">Tecnologia que conecta.</span>
        </div>
      </header>

      <main className="cli-main">
        <section className="cli-hero">
          <span className="marcador">Laudo e orçamento nº {num}</span>
          <h1>Olá{r.cliente ? `, ${r.cliente}` : ''}!</h1>
          <p className="cli-sub">
            Aqui estão o diagnóstico{videos.length ? ', os vídeos' : ''} e o orçamento do seu <b>{r.equip || 'equipamento'}</b>,
            inspecionado em {fdate(r.data)}.
          </p>
          <div className="cli-acoes">
            {wa(msgAprovar) && (
              <a className="btn primary" href={wa(msgAprovar)} target="_blank" rel="noopener">Aprovar orçamento pelo WhatsApp</a>
            )}
            <a className="btn" href={`/c/${token}/imprimir`} target="_blank" rel="noopener">Baixar PDF</a>
            {wa(msgDuvida) && (
              <a className="btn" href={wa(msgDuvida)} target="_blank" rel="noopener">Tirar uma dúvida</a>
            )}
          </div>

          <nav className="cli-ancoras" aria-label="Ir para">
            {videos.length > 0 && <a href="#videos">Vídeos</a>}
            <a href="#laudo">Laudo técnico</a>
            <a href="#orcamento">Orçamento</a>
          </nav>
        </section>

        {videos.length > 0 && (
          <section id="videos" className="cli-sec">
            <h2><span className="mk" />Vídeos do serviço</h2>
            <div className="cli-videos">
              {videos.map((v, i) => (
                <figure key={i}>
                  <div className="cli-video"><Video v={v} /></div>
                  {v.titulo && <figcaption>{v.titulo}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        <section id="laudo" className="cli-sec folha-L">
          <h2><span className="mk" />Laudo técnico</h2>
          <Escala><Laudo r={r} qr={qr} /></Escala>
        </section>

        <section id="orcamento" className="cli-sec folha-O">
          <h2><span className="mk" />Orçamento</h2>
          <Escala><Orcamento r={r} qr={qr} /></Escala>
          {wa(msgAprovar) && (
            <a className="btn primary cli-aprovar" href={wa(msgAprovar)} target="_blank" rel="noopener">
              Aprovar orçamento de R$ {brl(total)} pelo WhatsApp
            </a>
          )}
        </section>
      </main>

      <footer className="cli-rodape">
        <Logo escuro altura={26} />
        <p>
          {r.site && <span>{r.site}</span>}
          {r.zap && <span>WhatsApp {r.zap}</span>}
        </p>
      </footer>
    </div>
  );
}
