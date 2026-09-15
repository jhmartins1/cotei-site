# Site do Cotei

Landing page responsiva e página de Política de Privacidade, em português, preparadas para publicação na Vercel. Site estático, sem dependências externas, formulários, cookies de aplicação, fontes remotas ou scripts de rastreamento. O aplicativo React Native/Expo continua sendo distribuído separadamente.

## Ver localmente

Requer Node.js 22 ou superior. Não é necessário instalar pacotes.

```sh
npm run dev
```

Abra http://127.0.0.1:3000. Para atualizar a prévia após editar os arquivos, reinicie o comando. `npm run build` gera os arquivos públicos em `dist/`.

Se o comando `npm` do seu computador estiver indisponível, use diretamente `node scripts/serve.mjs` para a prévia e `node scripts/build.mjs` para gerar o site. A geração foi verificada localmente com Node.js 22.18.0; o atalho local do npm apontava para uma instalação ausente.

## Personalizar

- `content/site.json`: apresentação, responsável, e-mail, link oficial do Google Play e endereço definitivo do site.
- `content/privacy.json`: conteúdo e data da política.
- `public/styles.css`: cores e aparência.
- `public/favicon.svg`: ícone da marca.
- `scripts/build.mjs`: estrutura HTML das páginas.

O link de download só aparece quando `playStoreUrl` recebe uma URL real. O contato só aparece após preencher `contactEmail`. Nenhum e-mail ou endereço de loja foi inventado.

## Situação da política

**A política está em rascunho. Ainda não está pronta para ser enviada ao Google Play.** Não há código do app neste projeto para verificar suas práticas de dados. O responsável precisa fornecer:

1. Nome da pessoa ou empresa responsável e e-mail de contato real.
2. Finalidade do app, existência de login e dados acessados/coletados, inclusive por SDKs.
3. Finalidades, permissões, dados locais e dados transmitidos a servidores.
4. Serviços de autenticação, banco de dados, analytics, relatórios de falhas e publicidade.
5. Compartilhamentos, armazenamento, proteção e eventuais transferências internacionais.
6. Prazos ou critérios de retenção, exclusão de dados, eventuais exceções e canal de solicitação.
7. Faixa etária e eventual tratamento de dados de crianças/adolescentes.

Substitua os parágrafos de rascunho por informações confirmadas e atualize `updatedAt` (AAAA-MM-DD). Depois, marque `reviewed` como `true`. O build recusa esse estado se o responsável e e-mail estiverem ausentes ou restarem os textos de rascunho. Essa verificação não certifica a exatidão da política.

Se o app permite criar conta, implemente também o caminho de exclusão dentro do aplicativo e um recurso web funcional para solicitar exclusão. Uma descrição sem canal funcional não cumpre esse requisito. Esta landing page não implementa um sistema de exclusão de contas.

O rascunho tem aviso visível e instruções para buscadores não o indexarem. A política final é HTML e pode ser acessada sem login.

## Publicar na Vercel

1. Coloque este projeto em um repositório Git e importe-o na Vercel em **Add New → Project**.
2. Escolha **Framework Preset: Other**, se necessário. A configuração em `vercel.json` define **Build Command: npm run build** e **Output Directory: dist**.
3. Publique o projeto. A Vercel fornecerá um endereço HTTPS.
4. Depois de finalizar a política, abra `https://SEU-PROJETO.vercel.app/privacidade` em uma janela anônima e confirme que não existe aviso de rascunho nem barreira de login. Esse endereço é ilustrativo; o endereço real será fornecido pela Vercel.
5. Use o endereço real com `/privacidade` no campo Política de Privacidade do Play Console e em um link dentro do app. Mantenha as declarações da seção Segurança dos dados consistentes com a política e com o app.
6. Opcional: preencha `siteUrl` com o endereço definitivo e publique novamente para adicionar os metadados de URL canônica.

Use o domínio de produção e confirme que a proteção de acesso da Vercel não exige autenticação para o visitante. O site ainda não foi publicado por este projeto; executar o build não cria uma URL pública.

## Referências

- [Google Play: Dados do usuário](https://support.google.com/googleplay/android-developer/answer/10144311?hl=pt-BR)
- [Google Play: requisitos de exclusão de contas](https://support.google.com/googleplay/android-developer/answer/13327111?hl=pt-BR)
- [Vercel: configuração do projeto](https://vercel.com/docs/project-configuration)
