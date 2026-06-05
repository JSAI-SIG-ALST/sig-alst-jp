// 旧 WordPress URL → 新 Hugo URL のクライアントサイド・リダイレクトハンドラを生成する。
// map.json ( gen-slugs.js が生成: { p:{id:slug}, page_id:{id:slug} } ) を読み込む。
//   記事 : /sig-alst/?p=ID        → 新URL
//   ページ: /sig-alst/?page_id=ID → 新URL
// Usage: node scripts/gen-redirect-page.js > static/sig-alst/index.html
const fs = require('fs');
const map = JSON.parse(fs.readFileSync('map.json', 'utf8'));

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>リダイレクト中…</title>
<script>
const MAP = ${JSON.stringify(map, null, 2)};
const q = new URLSearchParams(location.search);
const p = q.get("p"), pid = q.get("page_id");
let dest = "/";
if (p && MAP.p[p]) dest = MAP.p[p];
else if (pid && MAP.page_id[pid]) dest = MAP.page_id[pid];
location.replace(dest);
</script>
</head>
<body><p>ページが移動しました。<a href="/">トップへ</a></p></body>
</html>`;

process.stdout.write(html);
