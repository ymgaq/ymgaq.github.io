(function () {
  "use strict";
  var D = window.SITE_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var link = function (text, url) { return url ? '<a href="' + esc(url) + '">' + esc(text) + "</a>" : esc(text); };
  var row = function (date, html) { return '<li><span class="date">' + esc(date) + "</span><span>" + html + "</span></li>"; };
  var fmt = function (d) { return String(d || "").replace(/-/g, ".").slice(0, 7); };
  var fill = function (id, html) { var el = $(id); if (el) el.innerHTML = html; };

  // ===== 言語（?lang=en / ja。選択はブラウザに記憶） =====
  var lang = "ja";
  try {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "ja") localStorage.setItem("lang", q);
    lang = localStorage.getItem("lang") === "en" ? "en" : "ja";
  } catch (e) {
    if (/[?&]lang=en/.test(location.search)) lang = "en";
  }
  var EN = window.SITE_EN || {};
  var L = function (s) { return lang === "en" && EN[s] != null ? EN[s] : s; };
  var quote = function (html) { return lang === "en" ? "“" + html + "”" : "「" + html + "」"; };
  document.documentElement.lang = lang;
  if (lang === "en") {
    Array.prototype.forEach.call(document.querySelectorAll("[data-en]"), function (el) { el.innerHTML = el.getAttribute("data-en"); });
  }

  // 新しい順に並べる
  var key = function (d) { return /^\d/.test(d || "") ? String(d).replace(/\./g, "-") : "0"; };
  ["shogiGo", "kaggle", "talks", "tv", "media", "writing"].forEach(function (k) {
    D[k].sort(function (a, b) { return key(b.date) < key(a.date) ? -1 : key(b.date) > key(a.date) ? 1 : 0; });
  });

  // ===== Header / Footer（全ページ共通） =====
  var PAGES = [
    ["index.html", "Home"], ["research.html", "Research"], ["development.html", "Development"],
    ["writing.html", "Writing"], ["talks.html", "Talks"], ["media.html", "Media"],
  ];
  var current = document.body.dataset.page;
  var langBtn = function (code, label) {
    return code === lang
      ? '<span class="lang-btn is-active" aria-current="true">' + label + "</span>"
      : '<a class="lang-btn" href="?lang=' + code + '" hreflang="' + code + '">' + label + "</a>";
  };
  fill("site-header",
    '<div class="header-top"><a class="site-name" href="index.html">Yu Yamaguchi</a>' +
    '<div class="lang-switch" role="group" aria-label="Language">' + langBtn("ja", "日本語") + langBtn("en", "English") + "</div></div>" +
    '<nav class="nav">' +
    PAGES.map(function (p) {
      return '<a href="' + p[0] + '"' + (p[0] === current ? ' class="active" aria-current="page"' : "") + ">" + p[1] + "</a>";
    }).join("") + "</nav>");
  fill("site-footer", "© Yu Yamaguchi");

  // ===== Home =====
  var ICONS = {
    X: '<path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z"/>',
    GitHub: '<path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/>',
    LinkedIn: '<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
    Kaggle: '<path d="M18.8 23.6c0 .3-.1.4-.4.4h-3c-.2 0-.3-.1-.5-.3l-4.9-6.2-1.4 1.3v4.8c0 .3-.1.4-.4.4H5.9c-.3 0-.4-.1-.4-.4V.4c0-.3.1-.4.4-.4h2.3c.3 0 .4.1.4.4v14.4l6-6.1c.2-.2.4-.3.6-.3h3.1c.2 0 .3.1.3.2s0 .2-.1.3L12.2 15l6.5 8.2.1.4z"/>',
    Zenn: '<path d="M.26 23.77h4.99c.26 0 .5-.15.64-.35L19.61.87c.18-.29-.03-.64-.38-.64h-4.72c-.24 0-.44.12-.56.32L.03 23.36c-.09.18.03.41.23.41zM17.45 23.42l6.48-10.41c.2-.32-.03-.73-.41-.73h-4.69c-.18 0-.35.09-.44.24l-6.66 10.64c-.18.26.03.62.35.62h4.78c.23 0 .47-.12.59-.36z"/>',
  };
  fill("profile-links", D.links.map(function (l) {
    var icon = ICONS[l.name] ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">' + ICONS[l.name] + "</svg>" : "";
    return '<a href="' + esc(l.url) + '">' + icon + "<span>" + esc(l.name) + "</span></a>";
  }).join(""));

  fill("career-list", D.timeline.map(function (t) {
    return row(t.period.replace(/ — /g, "–").replace(/ —$/, "–"), esc(L(t.org)) + ' <span class="sub">' + esc(L(t.role)) + "</span>");
  }).join(""));

  // ===== Research =====
  fill("research-list", D.research.map(function (r) {
    return '<li><span class="date">' + esc(r.period) + '</span><div><div class="r-title">' + link(L(r.title), r.url) + "</div>" +
      '<div class="sub">' + esc(L(r.program)) + (r.role ? " — " + esc(L(r.role)) : "") + "</div>" +
      (r.desc ? '<div class="r-desc">' + esc(L(r.desc)) + "</div>" : "") + "</div></li>";
  }).join(""));

  fill("paper-list", D.papers.map(function (p) {
    var authors = esc(p.authors).replace(/Y\. Yamaguchi/g, "<b>Y. Yamaguchi</b>");
    return '<li><span class="title">' + link(p.title, p.url) + '</span><br><span class="authors">' + authors +
      '. <span class="venue">' + esc(p.venue) + "</span>, " + p.year + ".</span></li>";
  }).join(""));

  // ===== Development =====
  fill("dev-toc", [
    ["repositories", "Repositories"], ["systems", L("システム提供実績")], ["shogi-go", "Computer Shogi / Go"], ["kaggle", "Kaggle"],
  ].map(function (t) { return '<a href="#' + t[0] + '">' + esc(t[1]) + "</a>"; }).join(" / "));
  fill("repo-list", D.repos.map(function (r) {
    return '<li><a class="repo-name" href="' + esc(r.url) + '"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">' + ICONS.GitHub + "</svg>" + esc(r.name.split("/").pop()) + "</a>" +
      ' <span class="sub">' + esc(r.lang) + " · ★ " + r.stars + "</span><br>" + esc(L(r.desc)) + "</li>";
  }).join(""));
  fill("system-list", D.systems.map(function (x) {
    return row(x.period, link(L(x.name), x.url) + '<br><span class="sub">' + esc(L(x.desc)) + "</span>");
  }).join(""));

  // ===== Competitions =====
  fill("shogigo-list", D.shogiGo.map(function (r) {
    return row(r.date, link(L(r.name), r.url) + " — <b>" + esc(L(r.result)) + '</b> <span class="sub">(' + esc(r.entry) + ")</span>");
  }).join(""));
  fill("kaggle-list", D.kaggle.map(function (r) {
    var medal = r.medal === "gold" ? "金メダル" : r.medal === "silver" ? "銀メダル" : r.medal === "award" ? "2位" : "";
    var writeup = r.writeup ? " [" + link(L("解法"), r.writeup) + "]" : "";
    return row(r.date, link(r.name, r.url) + (medal ? " — <b>" + esc(L(medal)) + "</b>" : "") + ' <span class="sub">(' + esc(r.rank) + ", " + esc(r.team) + ")</span>" + writeup);
  }).join(""));

  // ===== Talks / Media / Writing =====
  fill("talk-list", D.talks.map(function (t) {
    var label = t.type === "Upcoming" ? " <b>" + L("[予定]") + "</b>" : t.type === "Keynote" ? " <b>" + L("[基調講演]") + "</b>" : t.type === "Lecture" ? " " + L("[講義]") : t.type === "Panel" ? " " + L("[パネル]") : "";
    var video = t.video && t.video !== t.url ? " [" + link(L("動画"), t.video) + "]" : "";
    return row(fmt(t.date), quote(link(t.title, t.url)) + label + video + '<br><span class="sub">' + esc(L(t.event)) + "</span>");
  }).join(""));
  fill("tv-list", D.tv.map(function (m) {
    return row(fmt(m.date), esc(L(m.outlet)) + " " + quote(link(m.title, m.url)));
  }).join(""));
  fill("media-list", D.media.map(function (m) {
    return row(fmt(m.date), esc(L(m.outlet)) + " " + quote(link(m.title, m.url)));
  }).join(""));
  var GROUPS = [
    ["技術記事", ["Zenn", "Qiita", "Speaker Deck"]], ["note", ["note"]], ["Kaggle Solutions", ["Kaggle"]],
  ];
  fill("writing-list", GROUPS.map(function (g) {
    var items = D.writing.filter(function (w) { return g[1].indexOf(w.site) >= 0; });
    if (!items.length) return "";
    return "<section><h2>" + esc(L(g[0])) + '</h2><ul class="list">' + items.map(function (w) {
      var site = g[1].length > 1 ? ' <span class="sub">(' + esc(w.site) + ")</span>" : "";
      return row(fmt(w.date), link(w.title, w.url) + site);
    }).join("") + "</ul></section>";
  }).join(""));

  // ===== サイト内リンクに言語を引き継ぐ（localStorage が使えない環境でも切り替わるように） =====
  Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (a) {
    var href = a.getAttribute("href");
    if (/^[a-z]+:|^\/\//i.test(href) || href.charAt(0) === "#" || href.charAt(0) === "?") return;
    if (!/\.html(#|$)/.test(href)) return;
    var parts = href.split("#");
    a.setAttribute("href", parts[0] + "?lang=" + lang + (parts[1] ? "#" + parts[1] : ""));
  });
})();
