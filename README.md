# Cog Dev — Linktree administrável

Link hub oficial da Cog Dev com página pública e painel administrativo protegido.

## Recursos

- Nome e descrição editáveis;
- upload da imagem principal;
- links ilimitados com nome, descrição, URL e imagem;
- ativação, edição, exclusão e reordenação dos links;
- contagem de cliques;
- dados persistentes no Cloudflare D1;
- imagens armazenadas no Cloudflare R2;
- senha protegida por PBKDF2 e armazenada somente como secret;
- sessão `HttpOnly`, `Secure` e `SameSite=Strict`;
- proteção CSRF, rate limit, CSP e validação server-side;
- nenhuma credencial no frontend ou no repositório.

## Estrutura

- `/` — página pública;
- `/admin` — acesso administrativo;
- `src/worker.js` — API e segurança;
- `migrations/` — estrutura do banco D1;
- `public/` — interface pública e administrativa.

## Pré-requisitos

- Node.js 20 ou superior;
- uma conta Cloudflare;
- Wrangler autenticado na sua conta.

## Instalação local

```bash
npm install
```

Crie os recursos da Cloudflare:

```bash
npx wrangler login
npx wrangler d1 create cogdev-linktree
npx wrangler r2 bucket create cogdev-linktree-media
```

Copie o `database_id` retornado pelo primeiro comando e substitua o identificador de zeros em `wrangler.jsonc`.

Crie o banco local:

```bash
npm run db:local
```

## Configurar o administrador com segurança

As credenciais nunca devem ser escritas nos arquivos públicos ou enviadas ao GitHub.

Gere o hash da senha:

```bash
npm run hash-password
```

O terminal solicitará a senha sem mostrá-la. Copie somente o hash gerado.

Para desenvolvimento local, copie `.dev.vars.example` para `.dev.vars` e informe:

```text
ADMIN_EMAIL=seu-email
ADMIN_PASSWORD_HASH=hash-gerado
SESSION_TTL_SECONDS=28800
```

O arquivo `.dev.vars` já está ignorado pelo Git.

Para produção, cadastre os valores diretamente na Cloudflare:

```bash
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD_HASH
```

Não use uma variável `VITE_*`, arquivo JavaScript ou HTML para guardar essas informações.

## Executar

```bash
npm run dev
```

Abra:

- site público: `http://localhost:8787`;
- administração: `http://localhost:8787/admin`.

## Publicar

Primeiro aplique as migrations no banco remoto:

```bash
npm run db:remote
```

Depois publique:

```bash
npm run deploy
```

Também é possível conectar este repositório ao Cloudflare Workers Builds. O comando de deploy deve ser `npm run deploy`.

## Verificações

```bash
npm run check
```

Esse comando valida a sintaxe dos arquivos principais e procura possíveis segredos dentro do bundle público.

## Limites de upload

- formatos: PNG, JPG ou WebP;
- tamanho máximo: 2 MB;
- SVG não é aceito para impedir conteúdo ativo em uploads.

## Observações importantes

- Trocar a senha exige gerar um novo hash e atualizar o secret `ADMIN_PASSWORD_HASH`.
- Excluir um arquivo do branch atual não o remove automaticamente do histórico antigo do Git.
- Se versões anteriores do projeto continham uma senha no código, essa senha deve ser considerada exposta e não deve ser reutilizada.
