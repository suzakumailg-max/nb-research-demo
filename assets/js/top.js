(function () {
  'use strict';

  var menu = document.querySelector('[data-menu]');
  var openButton = document.querySelector('[data-menu-open]');
  var closeButton = menu.querySelector('.menu__close');

  function setMenu(isOpen) {
    menu.classList.toggle('is-open', isOpen);
    menu.setAttribute('aria-hidden', String(!isOpen));
    openButton.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('is-menu-open', isOpen);
    (isOpen ? closeButton : openButton).focus({ preventScroll: true });
  }

  openButton.addEventListener('click', function () {
    setMenu(true);
  });

  menu.querySelectorAll('[data-menu-close], [data-menu-link]').forEach(function (element) {
    element.addEventListener('click', function () {
      setMenu(false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
    }
  });

  // 遷移先のページが未作成のリンクは、ページ先頭へ飛ばないよう無効化する
  document.querySelectorAll('[data-pending]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
    });
  });

  // 固定ヘッダー:少しスクロールしたら背景付きの帯に切り替える
  var siteHeader = document.querySelector('.site-header');
  var ticking = false;

  function updateHeader() {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
    ticking = false;
  }

  if (siteHeader) {
    updateHeader();
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------
  // スクロールに合わせたフェードイン・スライドイン
  // 対象要素に data-anim を自動で付け、画面に入ったら is-inview を付ける。
  // 動きを減らす設定の端末や古いブラウザでは何もしない(最初からすべて表示)。
  // 新しく動かしたい要素は、下の ANIMATIONS に「セレクター: 種類」を足すだけでよい。
  // 種類: fade-up(下からふわっと) / fade / slide-left(左から) / slide-right(右から) / reveal(左から幕が開く)
  // ---------------------------------------------------------
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js-anim');

  var ANIMATIONS = [
    // TOP
    ['.heading', 'fade-up'],
    ['.about__lead', 'fade-up'],
    ['.about__card', 'fade-up'],
    ['.about__portrait', 'slide-left'],
    ['.about__body > .btn', 'fade-up'],
    ['.issue-card', 'fade-up'],
    ['.reason-block__image', 'reveal'],
    ['.reason-block__content', 'fade-up'],
    ['.service__green', 'slide-left'],
    ['.service-card', 'fade-up'],
    ['.support-block', 'fade-up'],
    ['.flow__image', 'reveal'],
    ['.flow__box', 'fade-up'],
    ['.flow-step', 'fade-up'],
    ['.seminar-card', 'fade-up'],
    ['.writer-card', 'fade-up'],
    ['.news__list > li', 'fade-up'],
    ['.news__body > .btn', 'fade-up'],
    ['.link-card', 'fade'],
    // 下層ページ
    ['.page-lead', 'fade-up'],
    ['.note-box', 'fade-up'],
    ['.tabs', 'fade-up'],
    ['.seminar-entry', 'fade-up'],
    ['.sub-heading', 'fade-up'],
    ['.archive-list > li', 'fade-up'],
    ['.plain-list > li', 'fade-up'],
    ['.message__photo', 'slide-left'],
    ['.message__quote', 'slide-right'],
    ['.message__text', 'fade-up'],
    ['.message__sign', 'fade-up'],
    ['.career__intro', 'fade-up'],
    ['.timeline > li', 'slide-left'],
    ['.works__head', 'fade-up'],
    ['.works__list > li', 'fade-up'],
    ['.profile-table', 'fade-up'],
    ['.contact-aside__lead', 'fade-up'],
    ['.contact-aside li', 'fade-up'],
    ['.form', 'fade-up'],
    ['.thanks p', 'fade-up'],
    ['.thanks .btn', 'fade-up']
  ];

  var STAGGER = 0.1;   // 同じ並びの兄弟要素は少しずつ遅らせる(秒)
  var MAX_STEPS = 5;   // 遅れの上限(長いリストでも待たされないように)

  ANIMATIONS.forEach(function (item) {
    var selector = item[0];
    document.querySelectorAll(selector).forEach(function (element) {
      if (element.hasAttribute('data-anim')) return;
      element.setAttribute('data-anim', item[1]);

      var index = 0;
      var sibling = element.previousElementSibling;
      while (sibling) {
        if (sibling.matches(selector)) index++;
        sibling = sibling.previousElementSibling;
      }
      if (index) {
        element.style.setProperty('--anim-delay', Math.min(index, MAX_STEPS) * STAGGER + 's');
      }
    });
  });

  function show(target) {
    if (!target.hasAttribute('data-anim') || target.classList.contains('is-inview')) return;
    target.classList.add('is-inview');
    observer.unobserve(target);

    // 表示し終えたら設定を外し、ホバー等の通常の動きに戻す
    var delay = parseFloat(target.style.getPropertyValue('--anim-delay')) || 0;
    window.setTimeout(function () {
      target.removeAttribute('data-anim');
      target.classList.remove('is-inview');
      target.style.removeProperty('--anim-delay');
    }, (delay + 2) * 1000);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);

      // 横スクロールの並び(スマホのセミナー・著書カード)は、画面外の兄弟要素もまとめて表示する
      var parent = entry.target.parentElement;
      if (parent && parent.scrollWidth > parent.clientWidth + 1) {
        Array.prototype.forEach.call(parent.children, show);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  document.querySelectorAll('[data-anim]').forEach(function (element) {
    observer.observe(element);
  });
})();
