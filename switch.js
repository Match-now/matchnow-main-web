/*! matchnow.app - device switcher */
(function () {
  // ========= 설정 =========
  var MOBILE_PATH  = "/m.html";   // 모바일 문서 경로
  var DESKTOP_PATH = "/";         // 데스크탑 문서 경로 (index.html)
  var VIEW_KEY     = "mn_view";   // 사용자 선호 저장 키(localStorage)
  var WIDTH_BREAKPOINT = 768;     // 보조: 화면폭 기준

  // ========= 유틸 =========
  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m && decodeURIComponent(m[1].replace(/\+/g, " ")) || null;
  }
  function isBot() {
    var ua = navigator.userAgent.toLowerCase();
    return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|vkshare|whatsapp/i.test(ua);
  }
  function isPWA() {
    return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  }
  function samePath(target) {
    // normalize to pathname only (ignore query/hash)
    var here = location.pathname.replace(/\/+$/, "") || "/";
    var there = target.replace(/[#?].*$/, "");
    return here === there;
  }
  function keepQueryHash(url) {
    var q = location.search || "";
    var h = location.hash || "";
    return url + q + h;
  }
  function setPref(v) {
    try { localStorage.setItem(VIEW_KEY, v); } catch(e){}
  }
  function getPref() {
    try { return localStorage.getItem(VIEW_KEY); } catch(e){ return null; }
  }

  // ========= 디바이스 판별 =========
  function isMobileUA() {
    var ua = navigator.userAgent || navigator.vendor || window.opera || "";
    ua = ua.toLowerCase();

    // 전형적인 모바일 키워드
    var mobile = /iphone|ipod|android.*mobile|blackberry|windows phone|opera mini|iemobile/.test(ua);

    // 태블릿(iPad/Android tablet 등)은 화면폭으로 보조
    var tablet = /ipad|android(?!.*mobile)|tablet|kindle|silk/.test(ua);

    if (mobile) return true;

    // 태블릿은 1024px 이하면 모바일 사이트로 보는 전략
    if (tablet) return Math.min(window.screen.width, window.screen.height) <= 1024;

    // iPad 데스크탑 모드(크롬/사파리) 보조: 터치 가능 + 큰 해상도 → 폭 기준 보조
    var touch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    if (touch && window.innerWidth <= WIDTH_BREAKPOINT) return true;

    return false;
  }

  // ========= 선호 / 강제 뷰 처리 =========
  var viewParam = (param("view") || "").toLowerCase(); // "mobile" | "desktop"
  if (viewParam === "mobile" || viewParam === "desktop") {
    setPref(viewParam);
  }
  var pref = getPref(); // 사용자가 이전에 강제한 모드

  // ========= 예외: 크롤러/임베드/홈화면 =========
  if (isBot() || isPWA()) return; // 소셜/검색 봇, PWA에선 리다이렉트 안 함

  // ========= 최종 타겟 결정 =========
  var target; // "mobile" | "desktop"
  if (pref === "mobile" || pref === "desktop") {
    target = pref; // 사용자 선호 우선
  } else {
    // 기본: UA → 보조로 화면폭
    target = isMobileUA() || window.innerWidth <= WIDTH_BREAKPOINT ? "mobile" : "desktop";
  }

  // ========= 리다이렉트 실행 =========
  if (target === "mobile") {
    if (!samePath(MOBILE_PATH)) {
      location.replace(keepQueryHash(MOBILE_PATH));
    }
  } else {
    if (!samePath(DESKTOP_PATH)) {
      location.replace(keepQueryHash(DESKTOP_PATH));
    }
  }
})();
