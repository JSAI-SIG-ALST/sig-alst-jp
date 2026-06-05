/* メールアドレスのスパム対策＋クリックでコピー
   アドレスは <canvas> にビットマップ描画する（DOM上はテキストではないので
   スクレイパが拾えず、選択コピーもできない）。表示は "user [at] domain"、
   クリックすると本物の "user@domain" をクリップボードへコピーする。
   対象: .email-copy（data-user / data-domain）
   （koike-lab-org の実装を移植・クリップボードに fallback を追加） */
(function () {
  function legacyCopy(text) {
    return new Promise(function (resolve) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  var items = [];
  document.querySelectorAll(".email-copy").forEach(function (el) {
    var user = el.dataset.user, domain = el.dataset.domain;
    if (!user || !domain) return;
    var isButton = el.tagName === "BUTTON";
    var label = isButton ? (el.dataset.tooltipDefault || "") : (user + " [at] " + domain);
    var canvas = document.createElement("canvas");
    if (isButton) { el.textContent = ""; }
    el.appendChild(canvas);
    el.style.cursor = "pointer";
    el.title = el.dataset.tooltipDefault || "Click to copy";
    items.push({ el: el, canvas: canvas, ctx: canvas.getContext("2d"),
      label: label, addr: user + "@" + domain });
  });
  if (!items.length) return;

  function renderAll() {
    items.forEach(function (it) {
      var cs = window.getComputedStyle(it.el);
      var font = cs.fontSize + " " + cs.fontFamily;
      var dpr = window.devicePixelRatio || 1;
      it.ctx.font = font;
      var w = Math.ceil(it.ctx.measureText(it.label).width);
      var h = Math.ceil(parseFloat(cs.fontSize) * 1.4);
      it.canvas.width = w * dpr;
      it.canvas.height = h * dpr;
      it.canvas.style.width = w + "px";
      it.canvas.style.height = h + "px";
      it.ctx.scale(dpr, dpr);
      it.ctx.font = font;
      it.ctx.fillStyle = cs.color;
      it.ctx.textBaseline = "middle";
      it.ctx.fillText(it.label, 0, h / 2);
    });
  }
  renderAll();
  // Webフォント読込後に再描画（フォールバックフォントで描かれないように）
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(renderAll);
  }

  items.forEach(function (it) {
    var timer = null, msg = null;
    it.el.addEventListener("click", function () {
      copy(it.addr).then(function () {
        if (timer) { clearTimeout(timer); }
        if (msg && msg.parentNode) { msg.parentNode.removeChild(msg); }
        it.canvas.style.display = "none";
        msg = document.createElement("span");
        msg.className = "email-copied-msg";
        msg.textContent = it.el.dataset.tooltipCopied || "Copied!";
        it.el.insertBefore(msg, it.canvas);
        timer = setTimeout(function () {
          if (msg && msg.parentNode) { msg.parentNode.removeChild(msg); }
          it.canvas.style.display = "";
          timer = null; msg = null;
        }, 1500);
      });
    });
  });
})();
