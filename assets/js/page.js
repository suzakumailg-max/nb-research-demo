(function () {
  'use strict';

  // お知らせ一覧:カテゴリで絞り込む
  // WordPress 化の際はカテゴリーアーカイブ(/news/category/○○/)へのリンクに置き換えてもよい
  var tabs = document.querySelectorAll('[data-news-filter]');
  var items = document.querySelectorAll('[data-news-category]');
  var empty = document.querySelector('[data-news-empty]');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = tab.getAttribute('data-news-filter');
      var visible = 0;

      tabs.forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === tab));
      });

      items.forEach(function (item) {
        var show = filter === 'all' || item.getAttribute('data-news-category') === filter;
        item.hidden = !show;
        if (show) visible++;
      });

      if (empty) empty.hidden = visible > 0;
    });
  });

  // お問い合わせ:送信処理(send.php)から戻された時のエラー表示
  var errorBox = document.querySelector('[data-form-error]');
  if (errorBox) {
    var messages = {
      required: '未入力の項目があります。すべての項目をご入力ください。',
      email: 'メールアドレスの形式が正しくありません。',
      send: '送信に失敗しました。お手数ですが、時間をおいて再度お試しください。'
    };
    var code = new URLSearchParams(window.location.search).get('error');
    if (code && messages[code]) {
      errorBox.textContent = messages[code];
      errorBox.hidden = false;
    }
  }
})();
