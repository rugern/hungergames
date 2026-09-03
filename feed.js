/* Language handling + meme feed rendering. No dependencies, no build step. */

const STRINGS = {
  en: {
    tag1: "Seek.",
    tag2: "Sneak.",
    tag3: "Eat.",
    tag4: "Repeat.",
    subtitle: "Internasjonal Gjemsel: 2 Hidden 2 Seek · The Netherlands 2026",
    mission: "We hunt the hiding Hosts. We seek the delicacies of the Netherlands. We are always hungry.",
    anthem: "🎵 Official team anthem: “Found You There”",
    feedTitle: "The Meme Feed",
    feedHint: "Fresh propaganda from the arena, newest first.",
    footer: "Made with hunger by team Hunger Games 🍟",
    feedError: "The memes could not be loaded. The Hosts are suspected of sabotage.",
  },
  nl: {
    tag1: "Zoek.",
    tag2: "Sluip.",
    tag3: "Eet.",
    tag4: "Herhaal.",
    subtitle: "Internasjonal Gjemsel: 2 Hidden 2 Seek · Nederland 2026",
    mission: "Wij jagen op de verstopte Hosts. Wij zoeken de lekkernijen van Nederland. Wij hebben altijd honger.",
    anthem: "🎵 Officieel teamvolkslied: “Found You There”",
    feedTitle: "De Memestroom",
    feedHint: "Verse propaganda uit de arena, nieuwste eerst.",
    footer: "Gemaakt met honger door team Hunger Games 🍟",
    feedError: "De memes konden niet geladen worden. De Hosts worden verdacht van sabotage.",
  },
};

let memes = [];

function currentLang() {
  const stored = localStorage.getItem("lang");
  if (stored === "en" || stored === "nl") return stored;
  return (navigator.language || "").toLowerCase().startsWith("nl") ? "nl" : "en";
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  const t = STRINGS[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll(".lang-picker button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  renderFeed(lang);
}

function formatDate(iso, lang) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderFeed(lang) {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  for (const meme of memes) {
    const card = document.createElement("article");
    card.className = "meme";

    if (meme.type === "youtube") {
      const wrap = document.createElement("div");
      wrap.className = "yt";
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + meme.id;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.title = meme.caption[lang] || "";
      wrap.appendChild(iframe);
      card.appendChild(wrap);
    } else {
      const img = document.createElement("img");
      img.src = meme.src;
      img.loading = "lazy";
      img.alt = meme.caption[lang] || "";
      card.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "meme-body";
    const caption = document.createElement("p");
    caption.className = "meme-caption";
    caption.textContent = meme.caption[lang] || meme.caption.en || "";
    const date = document.createElement("p");
    date.className = "meme-date";
    date.textContent = formatDate(meme.date, lang);
    body.appendChild(caption);
    body.appendChild(date);
    card.appendChild(body);

    feed.appendChild(card);
  }
}

document.querySelectorAll(".lang-picker button").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

fetch("memes.json")
  .then((res) => res.json())
  .then((data) => {
    memes = data.sort((a, b) => b.date.localeCompare(a.date));
    setLang(currentLang());
  })
  .catch(() => {
    document.getElementById("feed").textContent = STRINGS[currentLang()].feedError;
    setLang(currentLang());
  });
