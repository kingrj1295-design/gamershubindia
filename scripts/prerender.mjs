// Runs after the normal build. For each test game it writes dist/games/<slug>/index.html
// containing the real page HTML, a unique <title>, meta description and canonical URL.
// It also writes dist/sitemap.xml. It does NOT touch dist/index.html.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { games } from "../src/data/games.js";

const SITE = process.env.SITE_URL || "https://gamershubindia.pages.dev";
const dist = path.resolve("dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf-8");
const { render } = await import(pathToFileURL(path.resolve("dist-ssr/entry-server.js")).href);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

for (const g of games) {
  const route = `/games/${g.slug}`;
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(g.title)} | GamersHubIndia</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(g.description)}" />`)
    .replace("</head>", `<link rel="canonical" href="${SITE}${route}/" />\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);
  const dir = path.join(dist, "games", g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log("prerendered", route);
}

const urls = [
  "/",
  "/about/",
  "/products/",
  "/games/",
  "/community/",
  "/news/",
  "/help/",
  ...games.map((g) => `/games/${g.slug}/`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
console.log("wrote sitemap.xml");
