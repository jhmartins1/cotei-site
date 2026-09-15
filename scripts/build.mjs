import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = JSON.parse(await readFile(path.join(root, 'content/site.json'), 'utf8'));
const privacy = JSON.parse(await readFile(path.join(root, 'content/privacy.json'), 'utf8'));
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
if (!site.name || !site.headline || !site.description) throw new Error('Preencha nome, título e descrição em content/site.json.');
if (site.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail)) throw new Error('E-mail de contato inválido.');
for (const key of ['siteUrl', 'playStoreUrl']) {
  if (site[key] && new URL(site[key]).protocol !== 'https:') throw new Error(`${key} deve usar HTTPS.`);
}
if (site.playStoreUrl && new URL(site.playStoreUrl).hostname !== 'play.google.com') throw new Error('Use um link oficial do Google Play.');
if (!Array.isArray(privacy.sections) || privacy.sections.length === 0) throw new Error('A política precisa ter conteúdo.');
const ids = new Set();
for (const section of privacy.sections) {
  if (!/^[a-z][a-z0-9-]*$/.test(section.id) || ids.has(section.id)) throw new Error('Identificador de seção inválido ou duplicado.');
  if (!section.title || !section.paragraphs?.length || section.paragraphs.some(p => typeof p !== 'string' || !p.trim())) throw new Error('Seção da política incompleta.');
  ids.add(section.id);
}
if (privacy.reviewed && (!site.developerName || !site.contactEmail)) throw new Error('Para finalizar a política, informe responsável e e-mail real em content/site.json.');
if (privacy.reviewed && /rascunho|em revisão|ainda precisam|ainda precisa|serão informados|será informado|versão final/i.test(JSON.stringify(privacy.sections))) throw new Error('Substitua os textos de rascunho antes de marcar a política como revisada.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(privacy.updatedAt)) throw new Error('Use uma data no formato AAAA-MM-DD.');
const update = new Date(`${privacy.updatedAt}T12:00:00Z`);
if (Number.isNaN(update.getTime()) || update.toISOString().slice(0, 10) !== privacy.updatedAt) throw new Error('Data inválida.');
const updatedAt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(update);
const brand = `<a class="brand" href="/" aria-label="${escape(site.name)} — página inicial"><img class="brand-icon" src="/favicon.svg" alt="" width="35" height="35">${escape(site.name.toLowerCase())}</a>`;
const contact = site.contactEmail ? `<a href="mailto:${escape(site.contactEmail)}">Contato</a>` : '';
const header = (active) => `<a class="skip" href="#conteudo">Pular para o conteúdo</a><header class="header container">${brand}<nav class="nav" aria-label="Navegação principal"><a class="about-link" href="/#sobre">O aplicativo</a><a class="nav-pill" href="/privacidade"${active === 'privacy' ? ' aria-current="page"' : ''}>Privacidade</a></nav></header>`;
const footer = `<footer class="footer container">${brand}<span class="footer-meta">© ${new Date().getUTCFullYear()} ${escape(site.name)}. Todos os direitos reservados.</span><nav class="footer-links" aria-label="Links do rodapé"><a href="/privacidade">Política de Privacidade</a>${contact}</nav></footer>`;
const layout = (title, description, route, body, active = '') => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#005b4b">${(!privacy.reviewed && active === 'privacy') || route === '/404' ? '<meta name="robots" content="noindex, nofollow">' : ''}<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="${escape(site.name)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${site.siteUrl ? `<link rel="canonical" href="${escape(new URL(route, site.siteUrl).href)}"><meta property="og:url" content="${escape(new URL(route, site.siteUrl).href)}">` : ''}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"></head><body>${header(active)}${body}${footer}</body></html>`;

const headline = escape(site.headline).replace(escape(site.name), `<span>${escape(site.name)}</span>`);
const download = site.playStoreUrl ? `<a class="button" href="${escape(site.playStoreUrl)}" target="_blank" rel="noopener noreferrer">Baixar no Google Play <span aria-hidden="true">↗</span></a>` : '<a class="button" href="#sobre">Conheça o Cotei <span aria-hidden="true">↘</span></a>';
const home = layout(`${site.name} — Site do aplicativo`, site.description, '/', `<main id="conteudo" class="container">
<section class="hero" aria-labelledby="hero-title"><p class="eyebrow">Prazer, Cotei</p><div class="hero-grid"><div><h1 id="hero-title">${headline}</h1><p class="lead">${escape(site.intro)}</p><div class="actions">${download}<a class="text-link" href="/privacidade">Política de Privacidade</a></div></div><div class="brand-panel" aria-hidden="true"><div class="panel-top"><span>O seu aplicativo</span><span>01 / C</span></div><div class="panel-word">${escape(site.name.toLowerCase())}.</div><div class="panel-bottom"><span>Um novo começo.</span><span class="panel-symbol">✳</span></div></div></div><div class="hero-bottom"><span>${site.playStoreUrl ? 'Disponível no Google Play' : 'Estamos preparando nossa chegada ao Google Play'}</span><span>Informações do aplicativo, em um só lugar.</span></div></section>
<section id="sobre" class="section" aria-labelledby="about-title"><div class="intro-grid"><div><p class="eyebrow">O aplicativo</p><h2 id="about-title">Pode chamar<br>de Cotei.</h2></div><p class="body-copy">${escape(site.about)}</p></div><div class="info-row"><article class="info-card"><span class="card-number">01 — COTEI</span><h3>Um ponto de encontro.</h3><p>A página do Cotei reúne a apresentação do aplicativo e seus links em um lugar fácil de encontrar.</p></article><article class="info-card"><span class="card-number">02 — PRIVACIDADE</span><h3>Informação ao seu alcance.</h3><p>Consulte a página de privacidade diretamente pelo navegador, sem precisar entrar no aplicativo.</p></article></div></section>
<section class="privacy-banner" aria-labelledby="privacy-title"><div><p class="eyebrow">Espaço de privacidade</p><h2 id="privacy-title">Sua privacidade merece atenção.</h2><p>Acesse as informações de privacidade do Cotei.</p></div><a class="button button-dark" href="/privacidade">Ler a política <span aria-hidden="true">↗</span></a></section></main>`);

const policy = layout(`Política de Privacidade | ${site.name}`, `Informações sobre privacidade, tratamento de dados e contato do aplicativo ${site.name}.`, '/privacidade', `<main id="conteudo" class="container"><section class="page-heading" aria-labelledby="privacy-heading"><p class="eyebrow">Cotei / Privacidade</p><h1 id="privacy-heading">Política de Privacidade</h1><p>${privacy.reviewed ? 'Conheça como o Cotei trata seus dados e como entrar em contato com o responsável.' : 'As informações de privacidade do aplicativo Cotei estão sendo preparadas.'}</p><span class="date">${privacy.reviewed ? 'Última atualização' : 'Rascunho atualizado'}: <time datetime="${escape(privacy.updatedAt)}">${escape(updatedAt)}</time></span></section><div class="document-layout"><nav class="toc" aria-label="Índice da política"><p class="toc-title">Nesta página</p><ol>${privacy.sections.map(s => `<li><a href="#${s.id}">${escape(s.title)}</a></li>`).join('')}</ol></nav><article class="document" aria-label="Texto da política">${privacy.reviewed ? '' : '<aside class="notice"><strong>Rascunho — informações em revisão</strong>Esta página ainda não é a política definitiva do Cotei. Os dados de contato e as práticas de tratamento de dados precisam ser confirmados pelo responsável antes do uso no Google Play.</aside>'}${privacy.sections.map((s, index) => `<section id="${s.id}" class="document-section"><h2>${String(index + 1).padStart(2, '0')}. ${escape(s.title)}</h2>${s.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}${s.id === 'responsavel' && site.developerName ? `<p><strong>Responsável:</strong> ${escape(site.developerName)}</p>` : ''}${s.id === 'responsavel' && site.contactEmail ? `<p><strong>Contato:</strong> <a href="mailto:${escape(site.contactEmail)}">${escape(site.contactEmail)}</a></p>` : ''}</section>`).join('')}</article></div></main>`, 'privacy');
const notFound = layout(`Página não encontrada | ${site.name}`, 'A página solicitada não foi encontrada.', '/404', '<main id="conteudo" class="container"><section class="not-found"><p class="eyebrow">Erro 404</p><h1>Este caminho não existe.</h1><p>Volte ao início para encontrar as informações do Cotei.</p><a class="button button-dark" href="/">Voltar ao início <span aria-hidden="true">↗</span></a></section></main>');
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
await Promise.all([
  writeFile(path.join(root, 'dist/index.html'), home),
  writeFile(path.join(root, 'dist/privacidade.html'), policy),
  writeFile(path.join(root, 'dist/404.html'), notFound),
  writeFile(path.join(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\n${!privacy.reviewed ? 'Disallow: /privacidade\nDisallow: /privacidade.html\n' : ''}`),
]);
console.log('Site gerado em dist/. Páginas: / e /privacidade.');
if (!privacy.reviewed) console.warn('ATENÇÃO: política em rascunho. Confirme e edite content/privacy.json antes de informar a URL ao Google Play.');
