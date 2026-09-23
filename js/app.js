/*
 * Shared core: local store, anonymous identifiers, moderation checks and
 * small UI helpers. Everything lives in this browser only (Stage 1 prototype).
 */
(function () {
  const W = (window.Wall = window.Wall || {});
  const KEY = "thewall:v1";

  W.REACTIONS = [
    { key: "heart", emoji: "❤️", label: "Love" },
    { key: "cry", emoji: "😭", label: "Crying" },
    { key: "laugh", emoji: "😂", label: "Laughing" },
    { key: "eyes", emoji: "👀", label: "Eyes" },
    { key: "skull", emoji: "💀", label: "Dead" },
    { key: "hug", emoji: "🫂", label: "Hug" }
  ];

  W.CATEGORIES = {
    rant: "Rant",
    hottake: "Hot take",
    confession: "Confession",
    random: "Random"
  };

  W.POST_MAX = 500;
  W.COMMENT_MAX = 280;

  /* ---------- storage ---------- */

  let state = null;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage blocked: the prototype keeps working in memory */
    }
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function emptyReactions() {
    const r = {};
    W.REACTIONS.forEach((x) => (r[x.key] = 0));
    return r;
  }

  function seed() {
    const now = Date.now();
    const used = new Set(W.SEED.filter((s) => s.num).map((s) => s.num));
    const pick = () => {
      let n;
      do n = 1000 + Math.floor(Math.random() * 9000);
      while (used.has(n));
      used.add(n);
      return n;
    };

    const posts = W.SEED.map((s, i) => {
      const createdAt = now - s.ago * 60000;
      const span = now - createdAt;
      return {
        id: "s" + String(i + 1).padStart(2, "0"),
        num: s.num || pick(),
        cat: s.cat,
        text: s.text,
        createdAt,
        reactions: Object.assign(emptyReactions(), s.r),
        comments: s.c.map((text, j) => ({
          id: "c" + (i + 1) + "-" + j,
          num: pick(),
          text,
          createdAt: createdAt + Math.round((span * (j + 1)) / (s.c.length + 1))
        }))
      };
    });

    return { v: 1, posts, reacted: {} };
  }

  function load() {
    if (state) return state;
    const saved = read();
    state = saved && saved.v === 1 && Array.isArray(saved.posts) ? saved : seed();
    write();
    return state;
  }

  function usedNumbers() {
    const s = load();
    const set = new Set();
    s.posts.forEach((p) => {
      set.add(p.num);
      p.comments.forEach((c) => set.add(c.num));
    });
    return set;
  }

  /* A fresh four-digit number that isn't used anywhere on the wall yet. */
  W.newAnonNumber = function () {
    const used = usedNumbers();
    let n;
    do n = 1000 + Math.floor(Math.random() * 9000);
    while (used.has(n));
    return n;
  };

  W.store = {
    all() {
      return load().posts.slice().sort((a, b) => b.createdAt - a.createdAt);
    },
    get(id) {
      return load().posts.find((p) => p.id === id) || null;
    },
    random(excludeId) {
      const pool = load().posts.filter((p) => p.id !== excludeId);
      return pool[Math.floor(Math.random() * pool.length)] || null;
    },
    addPost(text, cat, num) {
      const post = {
        id: uid("p"),
        num: num || W.newAnonNumber(),
        cat,
        text,
        createdAt: Date.now(),
        reactions: emptyReactions(),
        comments: [],
        mine: true
      };
      load().posts.push(post);
      write();
      return post;
    },
    deletePost(id) {
      const s = load();
      const post = s.posts.find((p) => p.id === id);
      if (!post || !post.mine) return false;
      s.posts = s.posts.filter((p) => p.id !== id);
      delete s.reacted[id];
      write();
      return true;
    },
    hasReacted(id, key) {
      const list = load().reacted[id];
      return !!(list && list.includes(key));
    },
    /* One of each reaction per visitor per post; clicking again takes it back. */
    toggleReaction(id, key) {
      const s = load();
      const post = this.get(id);
      if (!post) return null;
      const list = s.reacted[id] || (s.reacted[id] = []);
      const active = !list.includes(key);
      if (active) list.push(key);
      else list.splice(list.indexOf(key), 1);
      post.reactions[key] = Math.max(0, (post.reactions[key] || 0) + (active ? 1 : -1));
      write();
      return { active, count: post.reactions[key] };
    },
    addComment(id, text) {
      const post = this.get(id);
      if (!post) return null;
      const comment = { id: uid("c"), num: W.newAnonNumber(), text, createdAt: Date.now(), mine: true };
      post.comments.push(comment);
      write();
      return comment;
    },
    deleteComment(postId, commentId) {
      const post = this.get(postId);
      if (!post) return false;
      const before = post.comments.length;
      post.comments = post.comments.filter((c) => !(c.id === commentId && c.mine));
      write();
      return post.comments.length < before;
    },
    reset() {
      state = seed();
      write();
    }
  };

  W.score = function (post) {
    let total = 0;
    for (const k in post.reactions) total += post.reactions[k];
    return total + post.comments.length * 3;
  };

  W.totalReactions = function (post) {
    let total = 0;
    for (const k in post.reactions) total += post.reactions[k];
    return total;
  };

  /* ---------- formatting ---------- */

  W.escape = function (str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  W.timeAgo = function (ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 45) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return Math.max(1, m) + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);
    if (d < 7) return d + "d ago";
    return Math.floor(d / 7) + "w ago";
  };

  W.charCount = function (str) {
    return Array.from(str).length;
  };

  W.param = function (name) {
    return new URLSearchParams(location.search).get(name);
  };

  /* Small symmetric 5x5 mark derived from a post's number. Decorative only. */
  W.sigil = function (num, size) {
    let h = (num * 2654435761) >>> 0;
    let rects = "";
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 3; x++) {
        h = (h * 1103515245 + 12345) >>> 0;
        if ((h >>> 16) & 1) {
          rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
          if (x < 2) rects += '<rect x="' + (4 - x) + '" y="' + y + '" width="1" height="1"/>';
        }
      }
    }
    const s = size || 16;
    return (
      '<svg class="sigil" width="' + s + '" height="' + s + '" viewBox="-0.5 -0.5 6 6" aria-hidden="true" focusable="false">' +
      rects +
      "</svg>"
    );
  };

  /* ---------- moderation (basic, client-side only) ---------- */

  const CHECKS = [
    { re: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i, msg: "That looks like an email address." },
    { re: /(?:\+?\d[\s().-]*){8,}/, msg: "That looks like a phone number." },
    { re: /(^|[\s(])@[a-z0-9_.]{2,}/i, msg: "Social handles (@something) can identify people." },
    { re: /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|net|org|io|co|me|ly|gg|app)\b/i, msg: "Links aren't allowed on the wall." },
    {
      re: /\b(add|follow|dm|text|message|call)\s+me\b|\bmy\s+(snap|snapchat|insta|instagram|ig|tiktok|twitter|discord|whatsapp|telegram|number|address)\b/i,
      msg: "Contact details and invitations to reach you aren't allowed."
    },
    { re: /\bmy (full |real )?name is\b|\bi live (at|on)\b/i, msg: "That sounds like it could identify you." }
  ];

  /* Deliberately short placeholder list; real moderation belongs on a server. */
  const BANNED = [/\bkys\b/i, /\bkill\s+your\s*self\b/i, /\bgo\s+die\b/i, /\bnobody\s+would\s+miss\s+you\b/i];

  W.moderate = function (text) {
    const problems = [];
    CHECKS.forEach((c) => {
      if (c.re.test(text)) problems.push(c.msg);
    });
    if (BANNED.some((re) => re.test(text))) {
      problems.push("That crosses a line. The wall is anonymous, not lawless.");
    }
    return problems;
  };

  /* ---------- UI helpers ---------- */

  W.reducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  W.toast = function (msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove("is-on");
    void el.offsetWidth;
    el.classList.add("is-on");
    clearTimeout(W.toast._t);
    W.toast._t = setTimeout(() => el.classList.remove("is-on"), 2600);
  };

  W.goRandom = function (excludeId) {
    const post = W.store.random(excludeId);
    if (post) location.href = "post.html?id=" + encodeURIComponent(post.id);
  };

  /* Keep every "x ago" on the page fresh without re-rendering. */
  function tickTimes() {
    document.querySelectorAll("time[data-ts]").forEach((el) => {
      el.textContent = W.timeAgo(Number(el.dataset.ts));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    load();
    setInterval(tickTimes, 30000);

    document.querySelectorAll("[data-random]").forEach((btn) => {
      btn.addEventListener("click", () => W.goRandom(btn.dataset.exclude));
    });

    document.querySelectorAll("[data-reset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Reset the prototype? Your posts, comments and reactions in this browser will be cleared.")) {
          W.store.reset();
          location.reload();
        }
      });
    });
  });
})();
