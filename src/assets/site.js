// Small progressive enhancements shared by every page:
// theme switching, code tabs and copy buttons. The site reads fine without it.

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* private mode */ } },
};

// --- Theme: system → dark/light → system ----------------------------------------
const root = document.documentElement;
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
const toggle = document.querySelector(".theme-toggle");
const labelTheme = () => {
  const current = root.dataset.theme || (systemDark() ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  toggle?.setAttribute("aria-label", `Switch to ${next} theme`);
  toggle?.setAttribute("title", `Switch to ${next} theme`);
};
toggle?.addEventListener("click", () => {
  const current = root.dataset.theme || (systemDark() ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  // Going back to what the system prefers forgets the override.
  if ((next === "dark") === systemDark()) {
    delete root.dataset.theme;
    store.set("bea-theme", null);
  } else {
    root.dataset.theme = next;
    store.set("bea-theme", next);
  }
  labelTheme();
});
labelTheme();

// --- Tabs ----------------------------------------------------------------------
for (const list of document.querySelectorAll('[role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    }
    if (focus) tab.focus();
  };
  list.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) select(tab, false);
  });
  list.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i };
    if (!(e.key in moves)) return;
    e.preventDefault();
    select(tabs[(i + moves[e.key] + tabs.length) % tabs.length], true);
  });
}

// --- Copy buttons ---------------------------------------------------------------
document.addEventListener("click", async (e) => {
  const button = e.target.closest(".copy");
  if (!button) return;
  const box = button.closest(".code, .pg-pane");
  const panel = box.querySelector(".code-panel:not([hidden]) pre, pre.pg-output, pre");
  const text = panel ? panel.innerText.replace(/\n$/, "") : "";
  const label = button.querySelector("span");
  try {
    await navigator.clipboard.writeText(text);
    button.classList.add("done");
    if (label) label.textContent = "Copied";
  } catch {
    if (label) label.textContent = "Select and copy";
  }
  setTimeout(() => {
    button.classList.remove("done");
    if (label) label.textContent = "Copy";
  }, 1600);
});

// --- Tour: the lesson list starts collapsed on small screens --------------------
const lessonList = document.querySelector(".tour-page .tour-nav-details");
if (lessonList && window.matchMedia("(max-width: 900px)").matches) lessonList.open = false;
