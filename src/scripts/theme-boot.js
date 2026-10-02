/*
 * Draait inline in <head>, vóór de eerste paint, zodat er geen flits van een verkeerd thema of
 * van de leeftijdscontrole is. Moet zelfstandig werken (geen imports). Instellingen komen uit
 * window.__MANDO_CFG, dat de basislayout vooraf zet vanuit src/config.
 */
(function () {
  var cfg = window.__MANDO_CFG || {};
  var root = document.documentElement;
  var sch = cfg.schedule || { lat: 52.1, lon: 5.3, nightAfterSunsetMin: 45, nightBeforeSunriseMin: 45, morningHours: 3, eveningHours: 2 };
  var keys = cfg.keys || { age: 'mando_age', theme: 'mando-theme' };
  var RAD = Math.PI / 180;
  var THEMES = ['creme', 'mosterd', 'terra', 'nacht'];

  function read(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function write(k, v) {
    try { window.localStorage.setItem(k, v); } catch (e) { /* opslag geblokkeerd */ }
  }

  /** Zonsopkomst en zonsondergang (benadering, NOAA) voor de zonnedag met nummer n. */
  function events(n, lat, lon) {
    var jStar = n - lon / 360;
    var m = (357.5291 + 0.98560028 * jStar) % 360;
    var c = 1.9148 * Math.sin(m * RAD) + 0.02 * Math.sin(2 * m * RAD) + 0.0003 * Math.sin(3 * m * RAD);
    var lambda = (m + c + 180 + 102.9372) % 360;
    var transit = 2451545.0 + jStar + 0.0053 * Math.sin(m * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
    var sinD = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
    var cosD = Math.cos(Math.asin(sinD));
    var cosW = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sinD) / (Math.cos(lat * RAD) * cosD);
    if (cosW < -1 || cosW > 1) return null;
    var w = Math.acos(cosW) / RAD;
    return { rise: toMs(transit - w / 360), set: toMs(transit + w / 360) };
  }
  function toMs(j) { return (j - 2440587.5) * 86400000; }

  function byClock(date) {
    var h = date.getHours() + date.getMinutes() / 60;
    if (h >= 21.5 || h < 6.5) return 'nacht';
    if (h < 9.5) return 'creme';
    if (h >= 18) return 'terra';
    return 'mosterd';
  }

  /** Thema volgens de zon, voor een moment in de tijd. */
  function bySun(date) {
    var now = date.getTime();
    var jNow = now / 86400000 + 2440587.5;
    var base = Math.round(jNow - 2451545.0 + 0.0008);
    var rises = [];
    var sets = [];
    for (var k = -2; k <= 2; k++) {
      var e = events(base + k, sch.lat, sch.lon);
      if (!e) return byClock(date);
      rises.push(e.rise);
      sets.push(e.set);
    }
    var min = 60000;
    var i;
    for (i = 0; i < sets.length; i++) {
      var nextRise = null;
      for (var j = 0; j < rises.length; j++) {
        if (rises[j] > sets[i]) { nextRise = rises[j]; break; }
      }
      if (nextRise !== null && now >= sets[i] + sch.nightAfterSunsetMin * min && now < nextRise - sch.nightBeforeSunriseMin * min) return 'nacht';
    }
    for (i = 0; i < rises.length; i++) {
      if (now >= rises[i] - sch.nightBeforeSunriseMin * min && now < rises[i] + sch.morningHours * 3600000) return 'creme';
    }
    for (i = 0; i < sets.length; i++) {
      if (now >= sets[i] - sch.eveningHours * 3600000 && now < sets[i] + sch.nightAfterSunsetMin * min) return 'terra';
    }
    return 'mosterd';
  }

  function paramTheme() {
    try {
      var t = new URLSearchParams(window.location.search).get('theme');
      return THEMES.indexOf(t) > -1 ? t : null;
    } catch (e) { return null; }
  }

  function getMode() {
    var m = read(keys.theme);
    return m === 'dag' || m === 'nacht' ? m : 'auto';
  }

  function resolveTheme(mode, date) {
    var forced = paramTheme();
    if (forced) return forced;
    mode = mode || getMode();
    if (mode === 'nacht') return 'nacht';
    if (mode === 'dag') return 'mosterd';
    if (cfg.themeAuto === false) return 'mosterd';
    try { return bySun(date || new Date()); } catch (e) { return byClock(date || new Date()); }
  }

  function applyTheme(theme, mode) {
    if (root.getAttribute('data-theme') !== theme) root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-mode', mode || getMode());
  }

  function setMode(mode) {
    write(keys.theme, mode);
    applyTheme(resolveTheme(mode), mode);
    try { window.dispatchEvent(new CustomEvent('mando:theme', { detail: { theme: root.getAttribute('data-theme'), mode: mode } })); } catch (e) { /* oud */ }
  }

  function cookie(name) {
    var parts = document.cookie ? document.cookie.split('; ') : [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].split('=');
      if (p[0] === name) return decodeURIComponent(p[1] || '');
    }
    return '';
  }
  function ageOk() { return cookie(keys.age) === '1'; }

  function exempt(path) {
    var list = cfg.ageGateExempt || [];
    for (var i = 0; i < list.length; i++) {
      if (path === list[i] || path.indexOf(list[i] + '/') === 0) return true;
    }
    return false;
  }

  /* Actiebar: verberg hem vóór de eerste paint als hij gesloten is of buiten zijn datumvenster valt. */
  (function () {
    var bar = cfg.bar;
    if (!bar) return;
    var d = new Date();
    var today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var off = (bar.from && today < bar.from) || (bar.until && today > bar.until) || read((cfg.keys || {}).bar || 'mando-bar') === bar.id;
    if (off) root.setAttribute('data-bar', 'off');
  })();

  window.__mando = { resolveTheme: resolveTheme, applyTheme: applyTheme, getMode: getMode, setMode: setMode, ageOk: ageOk };

  applyTheme(resolveTheme(), getMode());

  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (cfg.ageGate && !ageOk() && !exempt(path)) root.classList.add('age-pending');
})();
