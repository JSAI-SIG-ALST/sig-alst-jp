// モバイル用メニュートグル。Twenty Twelve の .menu-toggle を機能させる
// （デスクトップでは CSS でナビが常時表示され、ボタンは非表示）。
(function () {
  function init() {
    var btn = document.querySelector('.menu-toggle');
    var nav = document.querySelector('#site-navigation .nav-menu');
    if (!btn || !nav) return;
    btn.setAttribute('aria-controls', 'menu-main');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('toggled-on');
      btn.classList.toggle('toggled-on', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
