'use client';
import Link from 'next/link';
import { Logo } from './Marca';

async function sair() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login';
}

// Página inicial depois do login: escolhe entre o Financeiro e os Laudos e orçamentos
export default function Inicio({ aguardando = 0, rascunhos = 0, concluidos = 0, visitasNovas = 0, visitasAbertas = 0, propostasEnviadas = 0, propostasAprovadas = 0 }) {
  return (
    <>
      <header className="topo">
        <div className="topo-in">
          <Logo escuro altura={34} />
          <span className="titulo so-desktop">Sistema interno<b>Assistência técnica</b></span>
          <span className="sp" />
          <button className="btn ghost" type="button" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="inicio">
        <div className="lista-titulo">
          <span className="marcador">Início</span>
          <h2>O que você quer <em>abrir?</em></h2>
        </div>

        <div className="inicio-opcoes">
          <Link href="/financeiro" className="inicio-card escuro">
            <span className="inicio-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 6-6" /><path d="M16 8h4v4" /></svg>
            </span>
            <span className="inicio-txt">
              <b>Financeiro</b>
              <small>Total dos serviços concluídos, separado em serviços e produtos, com a lista de cada um.</small>
            </span>
            <span className="inicio-rodape">
              <span>{concluidos} {concluidos === 1 ? 'concluído' : 'concluídos'}</span>
              <span className="seta" aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/laudos" className="inicio-card">
            <span className="inicio-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v3h6V3" /><path d="M9 11h6M9 15h4" /></svg>
            </span>
            <span className="inicio-txt">
              <b>Laudos e orçamentos</b>
              <small>Criar, editar e compartilhar diagnósticos e orçamentos com os clientes.</small>
            </span>
            <span className="inicio-rodape">
              <span>
                {aguardando > 0 ? `${aguardando} aguardando autorização` : rascunhos > 0 ? `${rascunhos} em rascunho` : 'Nenhum pendente'}
              </span>
              <span className="seta" aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/solicitacoes" className="inicio-card">
            <span className="inicio-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              {visitasNovas > 0 && <span className="inicio-badge">{visitasNovas}</span>}
            </span>
            <span className="inicio-txt">
              <b>Solicitações de visita</b>
              <small>Pedidos de visita técnica de avaliação feitos pelos clientes no formulário.</small>
            </span>
            <span className="inicio-rodape">
              <span>
                {visitasNovas > 0 ? `${visitasNovas} ${visitasNovas === 1 ? 'nova' : 'novas'}` : visitasAbertas > 0 ? `${visitasAbertas} em aberto` : 'Nenhuma em aberto'}
              </span>
              <span className="seta" aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/propostas" className="inicio-card">
            <span className="inicio-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></svg>
            </span>
            <span className="inicio-txt">
              <b>Propostas comerciais</b>
              <small>Propostas de projeto com link para o cliente ler, baixar em PDF e aprovar.</small>
            </span>
            <span className="inicio-rodape">
              <span>
                {propostasEnviadas > 0 ? `${propostasEnviadas} aguardando o cliente` : propostasAprovadas > 0 ? `${propostasAprovadas} ${propostasAprovadas === 1 ? 'aprovada' : 'aprovadas'}` : 'Nenhuma pendente'}
              </span>
              <span className="seta" aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </main>
    </>
  );
}
