'use client';
import { useEffect } from 'react';
import { Laudo, Orcamento, Escala, useQR } from './Documento';
import { Logo } from './Marca';
import { ajustarFolhas } from '@/lib/impressao';
import { brl, fdate, numero, totalDoOrcamento } from '@/lib/format';
import { linkSeguro, fotoSegura } from '@/lib/seguranca';

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
  if (v.tipo === 'foto') {
    // toque abre a foto inteira numa aba nova
    return (
      <a className="cli-foto" href={v.url} target="_blank" rel="noopener noreferrer" aria-label={v.titulo || 'Abrir foto'}>
        <img src={v.url} alt={v.titulo || 'Foto do serviço'} loading="lazy" />
      </a>
    );
  }
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

const WHATSAPP_EMPRESA = '41936186432'; // (41) 93618-6432

function Videos({ lista }) {
  return (
    <div className="cli-videos">
      {lista.map((v, i) => (
        <figure key={i}>
          <div className={v.tipo === 'foto' ? 'cli-video foto' : 'cli-video'}><Video v={v} /></div>
          {v.titulo && <figcaption>{v.titulo}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export default function ClientePagina({ r, token }) {
  const qr = useQR(r.zap, r.site);
  // WhatsApp oficial da LigorioTec (brandbook): recebe as aprovações e dúvidas dos clientes
  const zap = WHATSAPP_EMPRESA;
  const total = totalDoOrcamento(r);
  // só links https (o servidor já filtra; aqui é a segunda barreira)
  const videos = (r.videos || [])
    .map((v) => ({ ...v, url: v.tipo === 'foto' ? fotoSegura(v.url) : linkSeguro(v.url) }))
    .filter((v) => v.url);
  // nota fiscal: arquivo no Vercel Blob (força o download) ou link da prefeitura/emissor
  const nfUrl = linkSeguro(r.notaFiscal?.url);
  const nfBaixar = nfUrl && r.notaFiscal?.tipo === 'arquivo' ? `${nfUrl}${nfUrl.includes('?') ? '&' : '?'}download=1` : nfUrl;
  const vDiag = videos.filter((v) => v.fase !== 'servico');
  const vServ = videos.filter((v) => v.fase === 'servico');
  const num = numero(r);

  const msgAprovar = `Olá! Aprovo o orçamento nº ${num} (${r.equip || 'equipamento'}), no valor de R$ ${brl(total)}.`;
  const msgDuvida = `Olá! Tenho uma dúvida sobre o laudo/orçamento nº ${num}.`;
  const wa = (t) => (zap ? `https://wa.me/55${zap}?text=${encodeURIComponent(t)}` : '');

  useEffect(() => {
    window.addEventListener('beforeprint', ajustarFolhas);
    return () => window.removeEventListener('beforeprint', ajustarFolhas);
  }, []);

  return (
    <div className="cli-pagina">
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
            Aqui estão o diagnóstico{videos.length ? ', as fotos e vídeos' : ''}{nfUrl ? ', a nota fiscal' : ''} e o orçamento do seu <b>{r.equip || 'equipamento'}</b>,
            inspecionado em {fdate(r.data)}.
          </p>
          <div className="cli-acoes">
            <a className="btn" href={`/c/${token}/imprimir`} target="_blank" rel="noopener">Baixar PDF</a>
            {nfUrl && (
              <a className="btn" href={nfBaixar} target="_blank" rel="noopener noreferrer">Baixar nota fiscal</a>
            )}
            {wa(msgDuvida) && (
              <a className="btn" href={wa(msgDuvida)} target="_blank" rel="noopener">Tirar uma dúvida</a>
            )}
          </div>

          <nav className="cli-ancoras" aria-label="Ir para">
            {vDiag.length > 0 && <a href="#videos-diagnostico">Fotos e vídeos do diagnóstico</a>}
            <a href="#laudo">Laudo técnico</a>
            <a href="#orcamento">Orçamento</a>
            {vServ.length > 0 && <a href="#videos-servico">Serviço realizado</a>}
            {nfUrl && <a href="#nota-fiscal">Nota fiscal</a>}
          </nav>
        </section>

        {vDiag.length > 0 && (
          <section id="videos-diagnostico" className="cli-sec">
            <h2><span className="mk" />Fotos e vídeos do diagnóstico</h2>
            <Videos lista={vDiag} />
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
              Aprovar orçamento pelo WhatsApp
            </a>
          )}
        </section>
        {vServ.length > 0 && (
          <section id="videos-servico" className="cli-sec">
            <h2><span className="mk" />Fotos e vídeos do serviço realizado</h2>
            <Videos lista={vServ} />
          </section>
        )}
        {nfUrl && (
          <section id="nota-fiscal" className="cli-sec">
            <h2><span className="mk" />Nota fiscal</h2>
            <a className="cli-nf" href={nfBaixar} target="_blank" rel="noopener noreferrer">
              <span className="cli-nf-ic" aria-hidden="true">NF</span>
              <span><b>{r.notaFiscal?.nome || 'Nota fiscal do serviço'}</b><small>Toque para baixar</small></span>
            </a>
          </section>
        )}
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
