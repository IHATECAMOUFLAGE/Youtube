"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const API = "/api/search", STREAM = "/api/fetch";
  const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="#272727"/></svg>');
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const state = {
    tab: "home", query: "", results: [], current: null, mode: "youtube",
    liked: store.get("yt_liked"), history: store.get("yt_history"),
    subscriptions: store.get("yt_subs"),
    topics: ["Music", "Gaming", "News", "Live", "Vlogs", "Programming", "Cooking", "Podcasts", "Tech", "Movies"],
    topicIdx: 0, feed: false, loadingMore: false, token: 0, playToken: 0
  };
  const els = {};
  ["searchInput", "autocomplete", "backdrop", "searchButton", "mainSection", "shortsSection", "watchLayout", "resultsGrid",
    "shortsGrid", "shortsStatus", "mainPlayer", "pageTitle", "homeLogo", "toast", "likeBtn", "likeText", "shareBtn", "status",
    "watchTitle", "watchChannelName", "watchChannelAvatar", "watchViews", "watchDescription", "relatedList", "embedYoutube",
    "embedTheta", "subBtn", "downloadBtn", "downloadText", "subList", "sidebar", "menuToggle", "notificationBtn", "accountBtn", "sentinel", "moreLoader", "chipsRow"
  ].forEach((id) => (els[id] = $(id)));
  const chips = document.querySelectorAll(".chip");
  const sidebarItems = document.querySelectorAll(".sidebar-item");

  /* ---------- helpers ---------- */
  const h = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const avatar = (n) => "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=" + encodeURIComponent(n || "YouTube");
  function img(src, cls) {
    const i = new Image();
    i.loading = "lazy"; i.alt = "";
    if (cls) i.className = cls;
    i.onerror = () => { i.onerror = null; i.src = PLACEHOLDER; };
    i.src = src || PLACEHOLDER;
    return i;
  }
  const dedupe = (list, existing = []) => {
    const seen = new Set(existing.map((v) => v.id));
    return list.filter((v) => v && v.id && !seen.has(v.id) && seen.add(v.id));
  };
  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 3000);
  }
  function setStatus(box, icon, msg, retry) {
    box.replaceChildren();
    if (!icon) { box.hidden = true; return; }
    box.append(h("span", "material-symbols-rounded", icon), h("p", null, msg));
    if (retry) { const b = h("button", "pill-btn", "Retry"); b.onclick = retry; box.append(b); }
    box.hidden = false;
  }
  const setTitle = (t) => { els.pageTitle.hidden = !t; els.pageTitle.textContent = t || ""; };

  /* ---------- sidebar ---------- */
  const mobile = () => innerWidth <= 960;
  function applySidebar() {
    const c = document.body.classList;
    c.remove("mobile-sidebar-open");
    if (mobile()) c.remove("sidebar-full", "sidebar-mini");
    else if (innerWidth <= 1200) { c.remove("sidebar-full"); c.add("sidebar-mini"); }
    else if (!c.contains("sidebar-mini")) c.add("sidebar-full");
  }
  applySidebar();
  addEventListener("resize", applySidebar);
  els.menuToggle.onclick = () => {
    const c = document.body.classList;
    if (mobile()) c.toggle("mobile-sidebar-open");
    else { c.toggle("sidebar-full"); c.toggle("sidebar-mini"); }
  };
  els.backdrop.onclick = () => document.body.classList.remove("mobile-sidebar-open");
  els.notificationBtn.onclick = () => toast("You can deploy this site yourself: https://github.com/IHATECAMOUFLAGE/Youtube\n\nJoin https://discord.gg/ujGFjYcuWn for more links and websites like this!");
  els.accountBtn.onclick = () => toast("Account options will be available soon.");

  /* ---------- search + autocomplete ---------- */
  let acTimer, acToken = 0, sel = -1;
  const hideAc = () => { els.autocomplete.style.display = "none"; sel = -1; };
  function pick(text) { els.searchInput.value = text; hideAc(); performSearch(text); }
  async function suggest() {
    const q = els.searchInput.value.trim(), tok = ++acToken;
    sel = -1;
    if (!q) return hideAc();
    let words = [];
    try {
      const r = await fetch("https://api.datamuse.com/sug?s=" + encodeURIComponent(q));
      words = (await r.json()).map((x) => x.word);
    } catch {}
    if (tok !== acToken || !words.length) return hideAc();
    els.autocomplete.replaceChildren(...words.map((w) => {
      const d = h("div", "autocomplete-item");
      d.append(h("span", "material-symbols-rounded", "search"), h("span", null, w));
      d.onmousedown = (e) => { e.preventDefault(); pick(w); };
      return d;
    }));
    els.autocomplete.style.display = "block";
  }
  els.searchInput.addEventListener("input", () => { clearTimeout(acTimer); acTimer = setTimeout(suggest, 200); });
  els.searchInput.addEventListener("keydown", (e) => {
    const items = els.autocomplete.querySelectorAll(".autocomplete-item");
    if (e.key === "Enter") {
      e.preventDefault();
      if (sel >= 0 && items[sel]) pick(items[sel].textContent.replace(/^search/, ""));
      else { hideAc(); performSearch(els.searchInput.value); }
      return;
    }
    if (e.key === "Escape") return hideAc();
    if (!items.length || !["ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((it, i) => it.classList.toggle("active", i === sel));
  });
  els.searchInput.addEventListener("blur", () => setTimeout(hideAc, 100));
  els.searchButton.onclick = () => { hideAc(); performSearch(els.searchInput.value); };
  function performSearch(q) {
    q = (q || "").trim();
    if (q) switchTab("search", q);
  }

  /* ---------- data ---------- */
  const cache = new Map();
  async function search(q) {
    if (cache.has(q)) return cache.get(q);
    const r = await fetch(API + "?query=" + encodeURIComponent(q));
    if (!r.ok) throw new Error(r.status);
    const res = ((await r.json()).results) || [];
    cache.set(q, res);
    return res;
  }
  async function fetchMany(queries) {
    const r = await Promise.allSettled(queries.map(search));
    const ok = r.filter((x) => x.status === "fulfilled").map((x) => x.value);
    if (!ok.length) throw new Error("failed");
    return ok.flat();
  }
  const nextTopics = (n) => Array.from({ length: n }, () => state.topics[state.topicIdx++ % state.topics.length]);

  /* ---------- rendering ---------- */
  function card(v) {
    const c = h("article", "video-card");
    c.tabIndex = 0;
    const t = h("div", "thumbnail");
    t.append(img(v.thumbnail));
    if (v.duration) t.append(h("div", "duration-badge", v.duration));
    const info = h("div", "video-info"), m = h("div", "video-meta");
    const title = h("h3", "video-title", v.title);
    title.title = v.title || "";
    m.append(title, h("p", "video-channel", v.channel), h("p", "video-stats", v.views));
    info.append(img(avatar(v.channel), "video-avatar"), m);
    c.append(t, info);
    c.onclick = () => openWatch(v);
    c.onkeydown = (e) => { if (e.key === "Enter") openWatch(v); };
    return c;
  }
  const renderGrid = (list) => els.resultsGrid.append(...list.map(card));
  function skeleton(n = 12) {
    els.resultsGrid.replaceChildren(...Array.from({ length: n }, () => {
      const c = h("div", "video-card skeleton");
      c.innerHTML = '<div class="thumbnail"></div><div class="video-info"><div class="video-avatar"></div><div class="video-meta"><div class="sk-line"></div><div class="sk-line short"></div></div></div>';
      return c;
    }));
  }
  async function loadFeed(queries, { title = "", infinite = false } = {}) {
    const t = ++state.token;
    state.feed = infinite; state.results = [];
    setTitle(title); setStatus(els.status); skeleton();
    try {
      const items = dedupe(await fetchMany(queries));
      if (t !== state.token) return;
      state.results = items;
      els.resultsGrid.replaceChildren();
      if (!items.length) return setStatus(els.status, "search_off", "No videos found. Try a different search.");
      renderGrid(items);
    } catch {
      if (t !== state.token) return;
      els.resultsGrid.replaceChildren();
      setStatus(els.status, "error", "Couldn't load videos. Check your connection and try again.", () => loadFeed(queries, { title, infinite }));
    }
  }
  async function loadMore() {
    if (state.loadingMore || !state.feed || state.tab !== "home" || !els.watchLayout.hidden) return;
    state.loadingMore = true; els.moreLoader.hidden = false;
    const t = state.token;
    try {
      const items = dedupe(await fetchMany(nextTopics(1)), state.results);
      if (t !== state.token) return;
      state.results.push(...items);
      renderGrid(items);
    } catch {} finally { state.loadingMore = false; els.moreLoader.hidden = true; }
  }
  new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "600px" }).observe(els.sentinel);

  function showList(title, list, emptyMsg) {
    state.token++; state.feed = false;
    state.results = list.slice();
    setTitle(title); setStatus(els.status);
    els.resultsGrid.replaceChildren();
    if (!list.length) return setStatus(els.status, "video_library", emptyMsg);
    renderGrid(state.results);
  }
  const isSub = (name) => state.subscriptions.some((s) => s.toLowerCase() === (name || "").toLowerCase());
  function loadSubscriptions(only = "") {
    if (!state.subscriptions.length) {
      els.subList.hidden = true;
      return showList("Subscriptions", [], "No subscriptions yet. Open a video and press Subscribe to follow its channel.");
    }
    els.subList.replaceChildren(...["All"].concat(state.subscriptions).map((name, i) => {
      const b = h("button", "chip" + ((i === 0 ? !only : only === name) ? " active" : ""), name);
      b.onclick = () => loadSubscriptions(i === 0 ? "" : name);
      return b;
    }));
    els.subList.hidden = false;
    loadFeed(only ? [only] : state.subscriptions, { title: only || "Latest from Subscriptions" });
  }
  async function loadShorts() {
    const t = ++state.token;
    setStatus(els.shortsStatus);
    els.shortsGrid.replaceChildren(...Array.from({ length: 8 }, () => {
      const c = h("div", "shorts-card skeleton");
      c.append(h("div", "thumbnail"));
      return c;
    }));
    let q = state.query || "YouTube";
    if (!/shorts/i.test(q)) q += " shorts";
    try {
      const items = dedupe(await search(q)).slice(0, 20);
      if (t !== state.token) return;
      state.results = items;
      els.shortsGrid.replaceChildren(...items.map((v) => {
        const c = h("div", "shorts-card");
        const th = h("div", "thumbnail");
        th.append(img(v.thumbnail));
        const title = h("h3", "video-title", v.title);
        c.append(th, title);
        c.onclick = () => openWatch(v);
        return c;
      }));
      if (!items.length) setStatus(els.shortsStatus, "movie", "No shorts available.");
    } catch {
      if (t !== state.token) return;
      els.shortsGrid.replaceChildren();
      setStatus(els.shortsStatus, "error", "Couldn't load shorts.", loadShorts);
    }
  }

  /* ---------- navigation ---------- */
  function switchTab(tab, query = "") {
    state.tab = tab;
    stopPlayer();
    els.watchLayout.hidden = true;
    document.title = "YouTube";
    sidebarItems.forEach((i) => i.classList.toggle("active", i.dataset.page === tab));
    els.mainSection.hidden = tab === "shorts";
    els.shortsSection.hidden = tab !== "shorts";
    els.chipsRow.hidden = tab !== "home";
    els.subList.hidden = true;
    if (tab === "home") {
      state.query = query;
      chips.forEach((c) => c.classList.toggle("active", (c.dataset.query || "") === query));
      if (query) loadFeed([query]);
      else { state.topicIdx = 0; loadFeed(nextTopics(3), { infinite: true }); }
    } else if (tab === "search") {
      state.query = query; els.searchInput.value = query;
      loadFeed([query], { title: "Results for \u201C" + query + "\u201D" });
    } else if (tab === "shorts") loadShorts();
    else if (tab === "subscriptions") loadSubscriptions();
    else if (tab === "history") showList("Watch History", state.history, "Videos you watch will show up here.");
    else if (tab === "liked") showList("Liked Videos", state.liked, "Videos you like will show up here.");
    else if (tab === "library") showList("Library", dedupe(state.history.concat(state.liked)), "Your history and liked videos will show up here.");
    scrollTo({ top: 0 });
  }
  els.homeLogo.onclick = () => switchTab("home");
  els.homeLogo.onkeydown = (e) => { if (e.key === "Enter") switchTab("home"); };
  chips.forEach((c) => (c.onclick = () => switchTab("home", c.dataset.query || "")));
  sidebarItems.forEach((i) => (i.onclick = () => {
    if (mobile()) document.body.classList.remove("mobile-sidebar-open");
    switchTab(i.dataset.page);
  }));

  /* ---------- watch page ---------- */
  function openWatch(v) {
    if (els.watchLayout.hidden) history.pushState({ w: 1 }, "");
    state.current = v;
    state.history = state.history.filter((x) => x.id !== v.id);
    state.history.unshift(v);
    state.history.length = Math.min(state.history.length, 50);
    store.set("yt_history", state.history);
    els.watchTitle.textContent = v.title || "";
    els.watchChannelName.textContent = v.channel || "YouTube";
    els.watchChannelAvatar.src = avatar(v.channel);
    els.watchViews.textContent = v.views || "";
    els.watchDescription.textContent = "Playing: " + (v.title || "") + " \u2022 Channel: " + (v.channel || "YouTube");
    els.mainSection.hidden = els.shortsSection.hidden = els.chipsRow.hidden = true;
    els.watchLayout.hidden = false;
    document.title = (v.title || "Watch") + " - YouTube";
    renderRelated();
    updateLike();
    updateSub();
    setMode(state.mode);
    scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeWatch() {
    stopPlayer();
    els.watchLayout.hidden = true;
    (state.tab === "shorts" ? els.shortsSection : els.mainSection).hidden = false;
    els.chipsRow.hidden = state.tab !== "home";
    document.title = "YouTube";
  }
  addEventListener("popstate", () => { if (!els.watchLayout.hidden) closeWatch(); });
  function renderRelated() {
    els.relatedList.replaceChildren(...state.results.filter((v) => v.id !== state.current.id).map((v) => {
      const it = h("div", "related-item");
      it.tabIndex = 0;
      const th = h("div", "related-thumb");
      th.append(img(v.thumbnail));
      const info = h("div", "related-info"), t = h("div", "related-title", v.title);
      t.title = v.title || "";
      info.append(t, h("div", "related-channel", v.channel), h("div", "related-stats", [v.views, v.duration].filter(Boolean).join(" \u2022 ")));
      it.append(th, info);
      it.onclick = () => openWatch(v);
      it.onkeydown = (e) => { if (e.key === "Enter") openWatch(v); };
      return it;
    }));
  }
  function updateLike() {
    const liked = state.liked.some((v) => v.id === state.current.id);
    els.likeBtn.classList.toggle("liked", liked);
    els.likeText.textContent = liked ? "Liked" : "Like";
  }
  els.likeBtn.onclick = () => {
    const v = state.current;
    if (!v) return;
    const i = state.liked.findIndex((x) => x.id === v.id);
    if (i < 0) { state.liked.unshift(v); toast("Added to Liked videos"); }
    else { state.liked.splice(i, 1); toast("Removed from Liked videos"); }
    store.set("yt_liked", state.liked);
    updateLike();
  };
  function updateSub() {
    const on = isSub(state.current.channel);
    els.subBtn.classList.toggle("subscribed", on);
    els.subBtn.textContent = on ? "Subscribed" : "Subscribe";
  }
  els.subBtn.onclick = () => {
    const name = state.current && state.current.channel;
    if (!name) return;
    if (isSub(name)) {
      state.subscriptions = state.subscriptions.filter((s) => s.toLowerCase() !== name.toLowerCase());
      toast("Unsubscribed from " + name);
    } else { state.subscriptions.push(name); toast("Subscribed to " + name); }
    store.set("yt_subs", state.subscriptions);
    updateSub();
  };
  els.shareBtn.onclick = () => {
    if (!state.current) return;
    const url = "https://youtu.be/" + state.current.id;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("Link copied"), () => toast(url));
  };

  /* ---------- player ---------- */
  const P = {
    box: $("cp"), v: $("video"), play: $("cpPlay"), seek: $("cpSeek"), time: $("cpTime"), mute: $("cpMute"),
    vol: $("cpVol"), speed: $("cpSpeed"), pip: $("cpPip"), fs: $("cpFs"), err: $("cpErr"), errMsg: $("cpErrMsg"), errBtn: $("cpErrBtn")
  };
  const V = P.v, RATES = [1, 1.25, 1.5, 2, 0.5];
  const ico = (btn, name) => (btn.firstElementChild.textContent = name);
  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    s = Math.floor(s);
    const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, "0");
    return hh ? hh + ":" + String(mm).padStart(2, "0") + ":" + ss : mm + ":" + ss;
  };
  const toggle = () => (V.paused ? V.play().catch(() => {}) : V.pause());
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : P.box.requestFullscreen && P.box.requestFullscreen());
  const skip = (s) => { V.currentTime = Math.max(0, Math.min(V.duration || 0, V.currentTime + s)); };
  let scrubbing = false, hideTimer, clickTimer;

  function stopPlayer() {
    state.playToken++;
    els.mainPlayer.src = "about:blank";
    V.pause(); V.removeAttribute("src"); V.load();
    P.box.classList.remove("busy");
    P.seek.value = 0; P.seek.style.setProperty("--p", "0%"); P.seek.style.setProperty("--b", "0%");
    P.time.textContent = "0:00 / 0:00";
  }
  function playerError(msg) {
    P.box.classList.remove("busy");
    P.errMsg.textContent = msg;
    P.err.hidden = false;
  }
  const streamCache = new Map();
  async function getStreamUrl(id) {
    if (streamCache.has(id)) return streamCache.get(id);
    const r = await fetch(STREAM + "?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id));
    const d = await r.json();
    if (!d || !d.downloadUrl) throw new Error("no stream");
    streamCache.set(id, d.downloadUrl);
    return d.downloadUrl;
  }
  let downloading = false;
  els.downloadBtn.onclick = async () => {
    const v = state.current;
    if (!v || downloading) return;
    downloading = true; els.downloadBtn.disabled = true; els.downloadText.textContent = "Preparing\u2026";
    const name = ((v.title || "video").replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 100) || "video") + ".mp4";
    const link = (href, newTab) => {
      const a = document.createElement("a");
      a.href = href; a.download = name;
      if (newTab) { a.target = "_blank"; a.rel = "noopener"; }
      document.body.appendChild(a); a.click(); a.remove();
    };
    try {
      const url = await getStreamUrl(v.id);
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(r.status);
        const total = +r.headers.get("content-length") || 0;
        const reader = r.body.getReader(), chunks = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value); got += value.length;
          els.downloadText.textContent = total ? "Downloading " + Math.round((got / total) * 100) + "%" : "Downloading\u2026";
        }
        const blobUrl = URL.createObjectURL(new Blob(chunks, { type: r.headers.get("content-type") || "video/mp4" }));
        link(blobUrl);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch { link(url, true); } // blocked by CORS: let the browser handle the file directly
      toast("Download started");
    } catch { toast("Couldn't get a download link for this video."); }
    finally { downloading = false; els.downloadBtn.disabled = false; els.downloadText.textContent = "Download"; }
  };
  async function setMode(mode) {
    state.mode = mode;
    const v = state.current;
    if (!v) return;
    els.embedYoutube.classList.toggle("active", mode === "youtube");
    els.embedTheta.classList.toggle("active", mode !== "youtube");
    stopPlayer();
    const yt = mode === "youtube";
    els.mainPlayer.hidden = !yt; P.box.hidden = yt;
    if (yt) { els.mainPlayer.src = "https://www.youtube.com/embed/" + encodeURIComponent(v.id) + "?autoplay=1&rel=0"; return; }
    const t = ++state.playToken;
    P.err.hidden = true; P.box.classList.add("busy");
    try {
      const url = await getStreamUrl(v.id);
      if (t !== state.playToken) return;
      V.src = url;
      V.play().catch(() => {});
    } catch {
      if (t === state.playToken) playerError("Couldn't load the ad-less stream for this video.");
    }
  }
  els.embedYoutube.onclick = () => setMode("youtube");
  els.embedTheta.onclick = () => setMode("thetacloud");
  P.errBtn.onclick = () => setMode("youtube");

  V.addEventListener("waiting", () => P.box.classList.add("busy"));
  ["playing", "canplay", "seeked"].forEach((e) => V.addEventListener(e, () => P.box.classList.remove("busy")));
  V.addEventListener("error", () => { if (V.getAttribute("src")) playerError("This video couldn't be played."); });
  V.addEventListener("play", () => { P.box.classList.remove("paused"); ico(P.play, "pause"); });
  V.addEventListener("pause", () => { P.box.classList.add("paused"); ico(P.play, "play_arrow"); });
  V.addEventListener("ended", () => { P.box.classList.add("paused"); ico(P.play, "replay"); });
  function updateProgress() {
    const d = V.duration || 0;
    if (!scrubbing) {
      const pct = d ? (V.currentTime / d) * 100 : 0;
      P.seek.value = d ? (V.currentTime / d) * 1000 : 0;
      P.seek.style.setProperty("--p", pct + "%");
    }
    if (d && V.buffered.length) P.seek.style.setProperty("--b", (V.buffered.end(V.buffered.length - 1) / d) * 100 + "%");
    P.time.textContent = fmt(V.currentTime) + " / " + fmt(d);
  }
  ["timeupdate", "progress", "loadedmetadata", "durationchange"].forEach((e) => V.addEventListener(e, updateProgress));
  P.seek.addEventListener("input", () => {
    scrubbing = true;
    const d = V.duration || 0;
    P.seek.style.setProperty("--p", P.seek.value / 10 + "%");
    if (d) V.currentTime = (P.seek.value / 1000) * d;
  });
  P.seek.addEventListener("change", () => { scrubbing = false; });
  V.addEventListener("volumechange", () => {
    const vol = V.muted ? 0 : V.volume;
    P.vol.value = vol;
    P.vol.style.setProperty("--p", vol * 100 + "%");
    ico(P.mute, vol === 0 ? "volume_off" : vol < 0.5 ? "volume_down" : "volume_up");
  });
  P.vol.oninput = () => { V.muted = false; V.volume = +P.vol.value; };
  P.mute.onclick = () => (V.muted = !V.muted);
  P.play.onclick = toggle;
  P.fs.onclick = fullscreen;
  P.speed.onclick = () => {
    const r = RATES[(RATES.indexOf(V.playbackRate) + 1) % RATES.length];
    V.playbackRate = r; P.speed.textContent = r + "\u00D7";
  };
  if (document.pictureInPictureEnabled) P.pip.onclick = () => (document.pictureInPictureElement ? document.exitPictureInPicture() : V.requestPictureInPicture().catch(() => {}));
  else P.pip.hidden = true;
  document.addEventListener("fullscreenchange", () => ico(P.fs, document.fullscreenElement ? "fullscreen_exit" : "fullscreen"));
  V.onclick = () => { clearTimeout(clickTimer); clickTimer = setTimeout(toggle, 220); };
  V.ondblclick = () => { clearTimeout(clickTimer); fullscreen(); };
  const poke = () => {
    P.box.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => P.box.classList.remove("show"), 2500);
  };
  P.box.addEventListener("mousemove", poke);
  P.box.addEventListener("touchstart", poke, { passive: true });
  P.box.addEventListener("mouseleave", () => P.box.classList.remove("show"));
  document.addEventListener("keydown", (e) => {
    if (els.watchLayout.hidden || P.box.hidden || e.target === els.searchInput || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const active = P.box.matches(":hover") || !!document.fullscreenElement || P.box.contains(document.activeElement);
    const keys = {
      " ": toggle, k: toggle, j: () => skip(-10), l: () => skip(10), arrowleft: () => skip(-5), arrowright: () => skip(5),
      m: () => (V.muted = !V.muted), f: fullscreen,
      arrowup: () => active && (V.muted = false, V.volume = Math.min(1, V.volume + 0.05)),
      arrowdown: () => active && (V.volume = Math.max(0, V.volume - 0.05))
    };
    if (!keys[k] || (k === " " && e.target.tagName === "BUTTON")) return;
    if ((k === "arrowup" || k === "arrowdown") && !active) return;
    e.preventDefault(); keys[k](); poke();
  });

  switchTab("home");
})();