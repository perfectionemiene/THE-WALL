/*
 * Single thought: full reactions, comments, and taking back your own words.
 */
(function () {
  const W = window.Wall;

  function commentHTML(c, fresh) {
    const offset = c.num % 3;
    return (
      '<li class="comment' + (W.charCount(c.text) <= 12 ? " comment--shout" : "") + (c.mine ? " is-mine" : "") + (fresh ? " is-fresh" : "") + '" style="--offset:' + offset + '" data-cid="' + c.id + '">' +
      '<p class="comment__who"><span class="comment__anon">Anonymous · ' + c.num + "</span>" +
      (c.mine ? '<span class="comment__you">yours · only you see this tag</span>' : "") +
      '<time data-ts="' + c.createdAt + '" datetime="' + new Date(c.createdAt).toISOString() + '">' + W.timeAgo(c.createdAt) + "</time></p>" +
      '<p class="comment__text">' + W.escape(c.text) + "</p>" +
      (c.mine ? '<button type="button" class="link-btn comment__delete" data-delete-comment="' + c.id + '">Take it back</button>' : "") +
      "</li>"
    );
  }

  function notFound(root) {
    document.title = "Gone — THE WALL.";
    root.innerHTML =
      '<div class="empty empty--page"><h1 class="empty__title">This thought isn’t on the wall anymore.</h1>' +
      "<p>Maybe it was taken back. Maybe it was never here.</p>" +
      '<div class="actions"><a class="btn btn--primary" href="feed.html">Back to the feed</a>' +
      '<button type="button" class="btn btn--ghost" data-random-now>Show me something random</button></div></div>';
    root.querySelector("[data-random-now]").addEventListener("click", () => W.goRandom());
  }

  function render(root, post) {
    const all = W.store.all();
    const idx = all.findIndex((p) => p.id === post.id);
    const next = all[idx + 1] || all[0];
    const n = post.comments.length;

    document.title = "Anonymous #" + post.num + " — THE WALL.";

    root.innerHTML =
      '<article class="thought" aria-labelledby="thought-title">' +
      '<h1 id="thought-title" class="visually-hidden">A thought from Anonymous #' + post.num + "</h1>" +
      '<header class="thought__head">' + W.anonLabel(post.num, 22) +
      '<span class="thought__meta">' + W.CATEGORIES[post.cat] + ' · <time data-ts="' + post.createdAt + '" datetime="' +
      new Date(post.createdAt).toISOString() + '">' + W.timeAgo(post.createdAt) + "</time></span></header>" +
      '<p class="thought__text' + (W.charCount(post.text) > 160 ? " is-long" : "") + '">' + W.escape(post.text) + "</p>" +
      '<div class="reacts reacts--full" role="group" aria-label="React to this thought">' +
      W.REACTIONS.map((r) => W.reactionButton(post, r, { large: true })).join("") + "</div>" +
      '<p class="thought__note">#' + post.num + " exists only on this post. It isn’t an account, and it doesn’t lead anywhere.</p>" +
      (post.mine
        ? '<p class="thought__mine">You posted this. <button type="button" class="link-btn" id="delete-post">Delete it</button></p>'
        : "") +
      "</article>" +
      '<section class="comments" aria-labelledby="comments-title">' +
      '<h2 id="comments-title" class="comments__title">Comments <span id="comment-count">' + n + "</span></h2>" +
      '<ol class="comments__list" id="comment-list">' + post.comments.map((c) => commentHTML(c)).join("") + "</ol>" +
      '<p class="comments__empty" id="comment-empty"' + (n ? " hidden" : "") + ">Nobody’s said anything yet. Be the first voice in the room.</p>" +
      '<form class="comment-form" id="comment-form" novalidate>' +
      '<label class="visually-hidden" for="comment-input">Write a comment</label>' +
      '<textarea id="comment-input" class="field" rows="2" maxlength="' + W.COMMENT_MAX + '" placeholder="Write a comment..." aria-describedby="comment-counter comment-errors"></textarea>' +
      '<div class="comment-form__row"><span class="counter" id="comment-counter">0 / ' + W.COMMENT_MAX + "</span>" +
      '<button type="submit" class="btn btn--primary">Comment anonymously</button></div>' +
      '<ul class="issues" id="comment-errors" aria-live="polite"></ul>' +
      "</form></section>" +
      '<nav class="keep-going" aria-label="Keep reading">' +
      '<p class="keep-going__line">One more?</p>' +
      '<div class="actions"><a class="btn btn--ghost" href="post.html?id=' + encodeURIComponent(next.id) + '">Next thought →</a>' +
      '<button type="button" class="btn btn--ghost" data-random-now>Show me something random</button></div></nav>';

    root.querySelector("[data-random-now]").addEventListener("click", () => W.goRandom(post.id));
    wireComments(root, post);

    const del = root.querySelector("#delete-post");
    if (del) {
      del.addEventListener("click", () => {
        if (!confirm("Delete this post? It disappears from the wall for good.")) return;
        W.store.deletePost(post.id);
        location.href = "feed.html";
      });
    }
  }

  function wireComments(root, post) {
    const form = root.querySelector("#comment-form");
    const input = root.querySelector("#comment-input");
    const counter = root.querySelector("#comment-counter");
    const errors = root.querySelector("#comment-errors");
    const list = root.querySelector("#comment-list");
    const count = root.querySelector("#comment-count");
    const empty = root.querySelector("#comment-empty");

    function updateCount() {
      const n = W.store.get(post.id).comments.length;
      count.textContent = n;
      empty.hidden = n > 0;
    }

    function showErrors(list) {
      errors.innerHTML = list.map((m) => "<li>" + W.escape(m) + "</li>").join("");
      input.setAttribute("aria-invalid", list.length ? "true" : "false");
    }

    input.addEventListener("input", () => {
      const len = W.charCount(input.value);
      counter.textContent = len + " / " + W.COMMENT_MAX;
      counter.classList.toggle("is-near", len > W.COMMENT_MAX - 30);
      if (errors.children.length) showErrors(W.moderate(input.value));
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) form.requestSubmit();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {
        showErrors(["Say something first."]);
        input.focus();
        return;
      }
      if (W.charCount(text) > W.COMMENT_MAX) {
        showErrors(["Keep it under " + W.COMMENT_MAX + " characters."]);
        return;
      }
      const problems = W.moderate(text);
      if (problems.length) {
        showErrors(problems);
        input.focus();
        return;
      }
      const comment = W.store.addComment(post.id, text);
      list.insertAdjacentHTML("beforeend", commentHTML(comment, true));
      input.value = "";
      counter.textContent = "0 / " + W.COMMENT_MAX;
      showErrors([]);
      updateCount();
      W.toast("Said. Nobody knows it was you.");
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-delete-comment]");
      if (!btn) return;
      const li = btn.closest(".comment");
      W.store.deleteComment(post.id, btn.dataset.deleteComment);
      const done = () => {
        li.remove();
        updateCount();
        input.focus();
      };
      if (W.reducedMotion()) done();
      else {
        li.classList.add("is-leaving");
        li.addEventListener("animationend", done, { once: true });
      }
      W.toast("Taken back.");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("thought-root");
    const post = W.store.get(W.param("id"));
    if (!post) notFound(root);
    else render(root, post);
  });
})();
