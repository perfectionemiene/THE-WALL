/*
 * Feed: filters, editorial layout (masonry groups broken up by featured
 * thoughts) and keeping the reader's place when they come back from a post.
 */
(function () {
  const W = window.Wall;
  const FILTER_KEY = "thewall:filter";
  const SCROLL_KEY = "thewall:feedScroll";

  const LINES = {
    all: "People are talking.",
    rant: "Things that needed to be yelled.",
    hottake: "Opinions nobody asked for.",
    confession: "Things people don't say out loud.",
    random: "Whatever this is."
  };
  const KICKERS = ["Someone had to say it.", "People felt this one.", "Things people don't say out loud."];

  let filter = "all";
  let columns = 0;

  function session(key, value) {
    try {
      if (value === undefined) return sessionStorage.getItem(key);
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  function columnCount() {
    const w = window.innerWidth;
    return w >= 1100 ? 3 : w >= 680 ? 2 : 1;
  }

  /* Featured = roughly the top 15% of the whole wall, so it doesn't change per filter. */
  function thresholds() {
    const scores = W.store.all().map(W.score).sort((a, b) => b - a);
    const featured = Math.max(100, scores[Math.floor(scores.length * 0.15)] || 0);
    return { featured, loud: featured * 0.5 };
  }

  function render(animate) {
    const stream = document.getElementById("stream");
    const posts = W.store.all().filter((p) => filter === "all" || p.cat === filter);
    const t = thresholds();
    const fresh = W.param("new");
    columns = columnCount();

    stream.innerHTML = "";
    stream.classList.toggle("no-anim", !animate);
    document.getElementById("filter-line").textContent = LINES[filter];

    if (!posts.length) {
      stream.innerHTML =
        '<div class="empty"><p class="empty__title">Nothing here yet.</p>' +
        '<p>Maybe it’s waiting for you.</p><a class="btn btn--primary" href="create.html">Say it</a></div>';
      return;
    }

    let group = null;
    let since = 99;
    let kick = 0;

    posts.forEach((post, i) => {
      const score = W.score(post);
      if (score >= t.featured && since >= 4) {
        stream.insertAdjacentHTML(
          "beforeend",
          W.renderCard(post, { variant: "featured", index: i, kicker: KICKERS[kick++ % KICKERS.length], fresh: post.id === fresh })
        );
        group = null;
        since = 0;
        return;
      }

      if (!group) {
        group = document.createElement("div");
        group.className = "masonry";
        for (let c = 0; c < columns; c++) {
          const col = document.createElement("div");
          col.className = "masonry__col";
          group.appendChild(col);
        }
        stream.appendChild(group);
      }

      const cols = Array.from(group.children);
      const shortest = cols.reduce((a, b) => (b.offsetHeight < a.offsetHeight ? b : a));
      shortest.insertAdjacentHTML(
        "beforeend",
        W.renderCard(post, { index: i, tier: score >= t.loud ? "loud" : "", fresh: post.id === fresh })
      );
      since++;
    });
  }

  function setFilter(next, animate) {
    filter = W.CATEGORIES[next] ? next : "all";
    session(FILTER_KEY, filter);
    document.querySelectorAll("[data-filter]").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.filter === filter);
    });

    const stream = document.getElementById("stream");
    if (!animate || W.reducedMotion()) return render(animate);
    stream.classList.add("is-leaving");
    setTimeout(() => {
      stream.classList.remove("is-leaving");
      render(true);
    }, 180);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const filters = document.querySelectorAll("[data-filter]");
    filters.forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.filter !== filter) setFilter(b.dataset.filter, true);
    }));

    const cameBack = document.referrer.includes("post.html") && !W.param("new");
    setFilter(W.param("new") ? "all" : session(FILTER_KEY) || "all", !cameBack);

    const saved = Number(session(SCROLL_KEY));
    session(SCROLL_KEY, null);
    const fresh = document.querySelector(".is-fresh");
    if (fresh) fresh.scrollIntoView({ block: "center", behavior: W.reducedMotion() ? "auto" : "smooth" });
    else if (cameBack && saved) window.scrollTo(0, saved);

    document.getElementById("stream").addEventListener("click", (e) => {
      if (e.target.closest(".card__link")) session(SCROLL_KEY, String(window.scrollY));
    });

    /* the floating "Say it" steps aside when the end-of-wall invitation is on screen */
    const fab = document.querySelector(".fab");
    const end = document.querySelector(".wall-end");
    if (fab && end && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => fab.classList.toggle("is-hidden", entry.isIntersecting)).observe(end);
    }

    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (columnCount() !== columns) render(false);
      }, 150);
    });
  });
})();
