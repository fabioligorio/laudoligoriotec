'use client';
import { useState } from 'react';

export function Texto({ id, rotulo, dica, valor, onChange, tipo = 'text', placeholder }) {
  return (
    <label htmlFor={id}>
      <span>{rotulo} {dica && <small>{dica}</small>}</span>
      <input
        id={id}
        type={tipo}
        step={tipo === 'number' ? '0.01' : undefined}
        min={tipo === 'number' ? '0' : undefined}
        value={valor ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(tipo === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      />
    </label>
  );
}

export function Area({ id, rotulo, dica, valor, onChange, linhas = 3 }) {
  return (
    <label htmlFor={id}>
      {(rotulo || dica) && <span>{rotulo} {dica && <small>{dica}</small>}</span>}
      <textarea id={id} rows={linhas} value={valor ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// Lista de pares [texto, texto|valor] com adicionar/remover
export function Linhas({ id, linhas, onChange, dinheiro, phA, phB, rotuloAdd }) {
  const atual = linhas || [];
  const mudar = (i, j, v) => onChange(atual.map((l, k) => (k === i ? (j === 0 ? [v, l[1]] : [l[0], v]) : l)));
  return (
    <>
      <div className="linhas">
        {atual.map((l, i) => (
          <div className={'li' + (dinheiro ? ' money' : '')} key={i}>
            <input id={`${id}-a-${i}`} type="text" aria-label={phA} placeholder={phA} value={l[0] ?? ''} onChange={(e) => mudar(i, 0, e.target.value)} />
            <input
              id={`${id}-b-${i}`}
              type={dinheiro ? 'number' : 'text'}
              step={dinheiro ? '0.01' : undefined}
              min={dinheiro ? '0' : undefined}
              aria-label={phB}
              placeholder={phB}
              value={l[1] ?? ''}
              onChange={(e) => mudar(i, 1, dinheiro ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
            />
            <button type="button" className="icon-btn" aria-label="Remover linha" onClick={() => onChange(atual.filter((_, k) => k !== i))}>×</button>
          </div>
        ))}
      </div>
      <button type="button" className="add" onClick={() => onChange([...atual, ['', '']])}>{rotuloAdd}</button>
    </>
  );
}

// Comprime a foto no navegador e envia para o servidor
async function comprimir(arquivo) {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise((ok, erro) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = erro;
      im.src = url;
    });
    const max = 1000;
    const sc = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * sc);
    c.height = Math.round(img.height * sc);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Foto({ id, src, onChange, bloqueado, rotulo = 'foto' }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  async function escolher(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setErro('');
    setEnviando(true);
    try {
      const blob = await comprimir(f);
      const fd = new FormData();
      fd.append('foto', blob, 'foto.jpg');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || 'Falha no envio.');
      onChange(j.url);
    } catch (err) {
      setErro(err.message || 'Falha no envio.');
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="ph" title={erro || undefined}>
      {src ? <img src={src} alt="" /> : <span>{enviando ? 'Enviando…' : erro ? 'Erro. Tente de novo' : `+ ${rotulo}`}</span>}
      {!bloqueado && <input id={id} type="file" accept="image/*" aria-label={`Escolher ${rotulo}`} onChange={escolher} disabled={enviando} />}
      {src && !bloqueado && (
        <button type="button" className="x" aria-label="Remover foto" onClick={() => onChange('')}>×</button>
      )}
    </div>
  );
}
