/*
 * Landing: faint thoughts drifting behind the hero, a sample thought you can
 * shuffle through, and the "numbers lead nowhere" illustration.
 */
(function () {
  const W = window.Wall;

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function whispers() {
    const root = document.getElementById("whispers");
    if (!root) return;
    const narrow = window.innerWidth < 680;
    // On phones the hero text fills the middle, so whispers only sit above and below it.
    const tops = narrow ? [1, 74] : [5, 20, 35, 50, 65, 80];
    const texts = shuffle(W.store.all().filter((p) => W.charCount(p.text) < (narrow ? 64 : 90))).slice(0, tops.length * 2);

    root.innerHTML = texts
      .map((p, i) => {
        const left = i % 2 === 0;
        const top = tops[Math.floor(i / 2)] + Math.random() * 3;
        const x = left ? 2 + Math.random() * (narrow ? 6 : 12) : (narrow ? 50 : 66) + Math.random() * 10;
        const style =
          "top:" + top.toFixed(1) + "%;left:" + x.toFixed(1) + "%;" +
          "--o:" + (0.1 + Math.random() * 0.1).toFixed(2) + ";" +
          "--d:" + (26 + Math.random() * 24).toFixed(0) + "s;" +
          "--delay:-" + (Math.random() * 20).toFixed(0) + "s;" +
          "font-size:" + (0.85 + Math.random() * 0.25).toFixed(2) + "rem";
        return '<p class="whisper" style="' + style + '">' + W.escape(p.text) + "</p>";
      })
      .join("");
  }

  function sample() {
    const root = document.getElementById("sample");
    const next = document.getElementById("sample-next");
    if (!root) return;
    let queue = [];
    let current = null;

    function show() {
      if (!queue.length) queue = shuffle(W.store.all().filter((p) => !current || p.id !== current.id));
      current = queue.pop();
      root.innerHTML = W.renderCard(current, { tier: "loud" });
    }

    next.addEventListener("click", show);
    show();
  }

  document.addEventListener("DOMContentLoaded", () => {
    whispers();
    sample();
    document.querySelectorAll("[data-anon]").forEach((el) => {
      el.innerHTML = W.anonLabel(Number(el.dataset.anon), 16);
    });
  });
})();
