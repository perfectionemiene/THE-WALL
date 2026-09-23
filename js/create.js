/*
 * Posting: open, type, post, leave. Live preview with the number this
 * thought will get, basic checks, then a short "it's out there" moment.
 */
(function () {
  const W = window.Wall;
  const DRAFT_KEY = "thewall:draft";

  let num = W.newAnonNumber();

  function draft(value) {
    try {
      if (value === undefined) return sessionStorage.getItem(DRAFT_KEY) || "";
      if (value) sessionStorage.setItem(DRAFT_KEY, value);
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      return "";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("say-form");
    const input = document.getElementById("say-input");
    const counter = document.getElementById("say-counter");
    const issues = document.getElementById("say-issues");
    const preview = document.getElementById("preview");
    const reroll = document.getElementById("reroll");
    const compose = document.getElementById("compose");
    const success = document.getElementById("success");

    const category = () => (form.querySelector('input[name="cat"]:checked') || {}).value || "random";

    function renderPreview() {
      const text = input.value.trim();
      preview.innerHTML = W.renderCard({
        id: "preview",
        num,
        cat: category(),
        text: text || "Your thought will show up here.",
        createdAt: Date.now(),
        reactions: {},
        comments: []
      });
      preview.classList.toggle("is-empty", !text);
      reroll.querySelector("b").textContent = "#" + num;
    }

    function showIssues(list) {
      issues.innerHTML = list.map((m) => "<li>" + W.escape(m) + "</li>").join("");
      input.setAttribute("aria-invalid", list.length ? "true" : "false");
    }

    function autosize() {
      input.style.height = "auto";
      input.style.height = input.scrollHeight + "px";
    }

    let checkTimer;
    input.addEventListener("input", () => {
      const len = W.charCount(input.value);
      counter.textContent = len + " / " + W.POST_MAX;
      counter.classList.toggle("is-near", len > W.POST_MAX - 50);
      counter.classList.toggle("is-full", len >= W.POST_MAX);
      autosize();
      renderPreview();
      draft(input.value);
      clearTimeout(checkTimer);
      checkTimer = setTimeout(() => showIssues(W.moderate(input.value)), 350);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) form.requestSubmit();
    });

    form.addEventListener("change", (e) => {
      if (e.target.name === "cat") renderPreview();
    });

    reroll.addEventListener("click", () => {
      num = W.newAnonNumber();
      renderPreview();
      preview.classList.remove("is-shuffled");
      void preview.offsetWidth;
      preview.classList.add("is-shuffled");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {
        showIssues(["Say something first. Even one word counts."]);
        input.focus();
        return;
      }
      if (W.charCount(text) > W.POST_MAX) {
        showIssues(["That's over " + W.POST_MAX + " characters. Trim it down a little."]);
        input.focus();
        return;
      }
      const problems = W.moderate(text);
      if (problems.length) {
        showIssues(problems);
        input.focus();
        return;
      }

      const post = W.store.addPost(text, category(), num);
      draft("");
      reveal(post);
    });

    function reveal(post) {
      const instant = W.reducedMotion();
      compose.classList.add("is-leaving");

      setTimeout(() => {
        compose.hidden = true;
        success.hidden = false;
        document.getElementById("success-card").innerHTML = W.renderCard(post, { fresh: true });
        document.getElementById("success-open").href = "post.html?id=" + encodeURIComponent(post.id);
        document.getElementById("success-feed").href = "feed.html?new=" + encodeURIComponent(post.id);
        const title = document.getElementById("success-title");
        title.focus();
        window.scrollTo(0, 0);
      }, instant ? 0 : 320);
    }

    document.getElementById("say-again").addEventListener("click", () => {
      input.value = "";
      num = W.newAnonNumber();
      counter.textContent = "0 / " + W.POST_MAX;
      counter.classList.remove("is-near", "is-full");
      showIssues([]);
      success.hidden = true;
      compose.hidden = false;
      compose.classList.remove("is-leaving");
      autosize();
      renderPreview();
      input.focus();
    });

    const saved = draft();
    if (saved) {
      input.value = saved;
      input.dispatchEvent(new Event("input"));
    } else {
      renderPreview();
    }
  });
})();
