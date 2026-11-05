# LigorioTec · Laudos e orçamentos

Sistema para montar o **laudo técnico de diagnóstico** e o **orçamento** de cada atendimento, no visual da LigorioTec, e salvar tudo para consultar depois.

## O que ele faz

- **Lista de relatórios** com busca e filtro (Rascunhos / Concluídos).
- **Editor** com as folhas A4 ao vivo. Salva sozinho enquanto você digita.
- **Rascunho → Concluído**: enquanto é rascunho, dá para editar e excluir. Depois de concluído, fica travado. Se precisar corrigir, use **Reabrir para edição**. Para um serviço parecido, use **Duplicar**.
- **Modelo editável** (botão *Editar modelo*): técnico, site, WhatsApp, procedimentos, ensaios, serviços com preço, garantia, pagamento e prazo. Todo relatório novo já começa com esses dados.
- **PDF**: o botão *Salvar PDF / Imprimir* abre a janela de impressão do navegador. Escolha **Salvar como PDF** e mande para o cliente. Também dá para gerar só o laudo ou só o orçamento.
- **Fotos** da peça com defeito e da peça nova são comprimidas no celular ou computador antes de enviar.
- **Login por senha** (uma senha só, definida na Vercel).

## Onde os dados ficam

| O quê | Na Vercel | No seu computador |
|---|---|---|
| Relatórios e modelo | Upstash Redis (plano grátis) | arquivo `.data/db.json` |
| Fotos | Vercel Blob (plano grátis) | dentro do próprio relatório |

As fotos no Blob ficam em endereços públicos com nome aleatório. Ninguém acha por busca, mas quem tiver o link consegue abrir a imagem. Os dados do relatório (nome do cliente, valores) só aparecem para quem entra com a senha.

---

## Passo a passo: colocar no ar

### 1. Subir o código para o GitHub

1. Crie um repositório novo e **privado** em https://github.com/new (ex.: `ligoriotec-laudos`). Não marque para criar README.
2. No terminal, dentro desta pasta:

```bash
git remote add origin https://github.com/SEU_USUARIO/ligoriotec-laudos.git
git branch -M main
git push -u origin main
```

(O projeto já vem com o primeiro commit feito.)

### 2. Importar na Vercel

1. Entre em https://vercel.com/new e escolha o repositório.
2. Não precisa mudar nada nas configurações de build. Clique em **Deploy**.
3. O primeiro deploy vai mostrar uma mensagem pedindo a senha. Isso é esperado, siga os próximos passos.

### 3. Conectar o banco e as fotos

No projeto da Vercel, aba **Storage**:

1. **Create Database → Upstash for Redis** (pelo Marketplace) → plano grátis → conecte ao projeto.
2. **Create Database → Blob** → conecte ao projeto.

A Vercel cria sozinha as variáveis `KV_REST_API_URL`, `KV_REST_API_TOKEN` e `BLOB_READ_WRITE_TOKEN`.

### 4. Definir a senha

Aba **Settings → Environment Variables**:

- Nome: `APP_PASSWORD`
- Valor: a senha que você vai usar para entrar

### 5. Fazer um novo deploy

Aba **Deployments** → nos três pontinhos do último deploy → **Redeploy**.

Pronto. Abra o endereço do projeto, entre com a senha e clique em **Abrir exemplo** para ver o atendimento da Júlia, ou em **Novo relatório**.

Daqui em diante, cada `git push` publica uma versão nova automaticamente.

---

## Rodar no seu computador

Precisa do Node.js 18.18 ou mais novo.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem as variáveis configuradas, não pede senha e salva tudo na pasta `.data/`.

Para testar com a senha e o banco de verdade, copie `.env.example` para `.env.local` e preencha.

## Trocar o logo

Substitua `public/logo.jpg` pelo arquivo original do logo (o atual foi recortado do PDF e tem resolução baixa). Mantenha o nome do arquivo.

## Estrutura

```
app/
  page.js               lista de relatórios
  r/[id]/page.js        editor de um relatório
  modelo/page.js        edição do modelo
  login/page.js         tela de senha
  api/                  rotas que salvam e leem os dados
components/
  Documento.js          as duas folhas (laudo e orçamento)
  Editor.js             formulário, salvamento e conclusão
  Lista.js, ModeloEditor.js, Campos.js, Icones.js
lib/
  defaults.js           modelo padrão e exemplo
  store.js              leitura/gravação (Redis ou arquivo local)
  format.js             moeda, data, número do laudo, totais
middleware.js           protege tudo com a senha
```
