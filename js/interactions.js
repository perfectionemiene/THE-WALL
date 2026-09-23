/*
 * Shared post rendering and reaction handling used by every page.
 */
(function () {
  const W = window.Wall;

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  W.anonLabel = function (num, size) {
    return (
      '<span class="anon">' +
      W.sigil(num, size) +
      '<span class="anon__name">Anonymous <b>#' + num + "</b></span></span>"
    );
  };

  W.reactionButton = function (post, r, opts) {
    const active = W.store.hasReacted(post.id, r.key);
    const count = post.reactions[r.key] || 0;
    const cls = "react" + (active ? " is-active" : "") + (opts && opts.large ? " react--lg" : "");
    return (
      '<button type="button" class="' + cls + '" data-post="' + post.id + '" data-react="' + r.key + '"' +
      ' aria-pressed="' + active + '" aria-label="' + r.label + ", " + count + ' reactions">' +
      '<span class="react__emoji" aria-hidden="true">' + r.emoji + "</span>" +
      '<span class="react__count" aria-hidden="true">' + count + "</span></button>"
    );
  };

  /* Feed cards show the three loudest reactions to keep the card quiet. */
  function topReactions(post) {
    const list = W.REACTIONS.filter((r) => post.reactions[r.key] > 0 || W.store.hasReacted(post.id, r.key));
    list.sort((a, b) => post.reactions[b.key] - post.reactions[a.key]);
    return list.length ? list.slice(0, 3) : [W.REACTIONS[0]];
  }

  /*
   * variant: "card" (default) or "featured".
   * tier: "", "loud" — loud cards get larger type because people engaged with them.
   */
  W.renderCard = function (post, opts) {
    opts = opts || {};
    const h = hash(post.id);
    const featured = opts.variant === "featured";
    const classes = ["card"];
    const style = [];

    if (featured) classes.push("card--featured");
    else {
      if (opts.tier) classes.push("card--" + opts.tier);
      if (W.charCount(post.text) < 72) classes.push("card--short");
      if (h % 3 === 0) classes.push("card--tape");
      if (h % 4 === 1) classes.push("card--ghost");
      style.push("--tilt:" + (((h >>> 3) % 5) - 2) * 0.35 + "deg");
    }
    if (post.mine) classes.push("is-mine");
    if (opts.fresh) classes.push("is-fresh");
    if (opts.index != null) style.push("--i:" + Math.min(opts.index, 12));

    const href = "post.html?id=" + encodeURIComponent(post.id);
    const reacts = topReactions(post).map((r) => W.reactionButton(post, r)).join("");
    const n = post.comments.length;

    return (
      '<article class="' + classes.join(" ") + '" style="' + style.join(";") + '" data-id="' + post.id + '">' +
      (opts.kicker ? '<p class="card__kicker">' + W.escape(opts.kicker) + "</p>" : "") +
      '<header class="card__head">' + W.anonLabel(post.num, featured ? 20 : 14) +
      '<span class="card__cat">' + (post.mine ? "Yours · " : "") + W.CATEGORIES[post.cat] + "</span></header>" +
      '<p class="card__text"><a class="card__link" href="' + href + '">' + W.escape(post.text) + "</a></p>" +
      '<footer class="card__foot">' +
      '<div class="reacts" role="group" aria-label="Reactions">' + reacts + "</div>" +
      '<span class="card__meta"><span class="card__comments" aria-label="' + n + (n === 1 ? " comment" : " comments") + '">' +
      '<span aria-hidden="true">💬 ' + n + "</span></span>" +
      '<time data-ts="' + post.createdAt + '" datetime="' + new Date(post.createdAt).toISOString() + '">' +
      W.timeAgo(post.createdAt) + "</time></span>" +
      "</footer></article>"
    );
  };

  /* ---------- reaction clicks (delegated, works for every page) ---------- */

  function burst(btn, emoji) {
    if (W.reducedMotion()) return;
    const el = document.createElement("span");
    el.className = "burst";
    el.textContent = emoji;
    el.setAttribute("aria-hidden", "true");
    btn.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-react]");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.post;
    const key = btn.dataset.react;
    const result = W.store.toggleReaction(id, key);
    if (!result) return;
    const r = W.REACTIONS.find((x) => x.key === key);

    document.querySelectorAll('[data-post="' + id + '"][data-react="' + key + '"]').forEach((b) => {
      b.classList.toggle("is-active", result.active);
      b.setAttribute("aria-pressed", result.active);
      b.setAttribute("aria-label", r.label + ", " + result.count + " reactions");
      b.querySelector(".react__count").textContent = result.count;
      b.classList.remove("is-pop");
      void b.offsetWidth;
      b.classList.add("is-pop");
    });
    if (result.active) burst(btn, r.emoji);
    document.dispatchEvent(new CustomEvent("wall:reacted", { detail: { id } }));
  });
})();
