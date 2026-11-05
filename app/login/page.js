'use client';
import { useState } from 'react';

export default function Login() {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ senha }),
    });
    if (res.ok) {
      window.location.href = '/';
      return;
    }
    const j = await res.json().catch(() => ({}));
    setErro(j.erro || 'Não foi possível entrar.');
    setEnviando(false);
  }

  return (
    <main className="login">
      <form onSubmit={entrar}>
        <img src="/logo-completo.jpg" alt="LigorioTec" />
        <span className="eyebrow">Laudos e orçamentos</span>
        <label htmlFor="senha">Senha
          <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
        </label>
        {erro && <p className="estado erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
        <button className="btn primary" type="submit" disabled={enviando || !senha} style={{ justifyContent: 'center' }}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
