/* Language handling + meme feed rendering. No dependencies, no build step. */

const STRINGS = {
  en: {
    tag1: "Seek.",
    tag2: "Sneak.",
    tag3: "Eat.",
    tag4: "Repeat.",
    subtitle: "Internasjonal Gjemsel: 2 Hidden 2 Seek · The Netherlands 2026",
    mission: "We hunt the hiding hosts. We seek the delicacies of the Netherlands. We are always hungry.",
    anthem: "🎵 Official team anthem: “Found You There”",
    feedTitle: "Breaking News",
    feedHint: "Fresh reports from the arena.",
    footer: "Made with hunger by team Hunger Games 🍟",
    feedError: "The news could not be loaded. The hosts are suspected of sabotage.",
    tabMemes: "News",
    tabTour: "Tour",
    tourTitle: "World Tour 2026",
    tourHint: "Catch the sensation live. Snacks are not guaranteed to survive.",
    statusPlayed: "PLAYED",
    statusSoldout: "SOLD OUT",
    statusCancelled: "CANCELLED",
    statusFinale: "THE BIG ONE",
    share: "🔗 Copy link",
    copied: "✅ Copied!",
  },
  nl: {
    tag1: "Zoek.",
    tag2: "Sluip.",
    tag3: "Eet.",
    tag4: "Herhaal.",
    subtitle: "Internasjonal Gjemsel: 2 Hidden 2 Seek · Nederland 2026",
    mission: "Wij jagen op de verstopte hosts. Wij zoeken de lekkernijen van Nederland. Wij hebben altijd honger.",
    anthem: "🎵 Officieel teamvolkslied: “Found You There”",
    feedTitle: "Laatste Nieuws",
    feedHint: "Verse berichten uit de arena.",
    footer: "Gemaakt met honger door team Hunger Games 🍟",
    feedError: "Het nieuws kon niet geladen worden. De hosts worden verdacht van sabotage.",
    tabMemes: "Nieuws",
    tabTour: "Tournee",
    tourTitle: "Wereldtournee 2026",
    tourHint: "Zie de sensatie live. Snacks overleven mogelijk niet.",
    statusPlayed: "GESPEELD",
    statusSoldout: "UITVERKOCHT",
    statusCancelled: "GEANNULEERD",
    statusFinale: "DE GROTE FINALE",
    share: "🔗 Link kopiëren",
    copied: "✅ Gekopieerd!",
  },
};

let memes = [];
let tour = [];

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
  renderTour(lang);
}

function setTab(tab) {
  document.getElementById("view-memes").hidden = tab !== "memes";
  document.getElementById("view-tour").hidden = tab !== "tour";
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  history.replaceState(null, "", tab === "tour" ? "#tour" : "#news");
  window.scrollTo(0, 0);
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
    card.id = "news-" + meme.id;

    if (meme.type === "youtube") {
      const wrap = document.createElement("div");
      wrap.className = "yt";
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + meme.yt;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.title = meme.caption[lang] || "";
      wrap.appendChild(iframe);
      card.appendChild(wrap);
    } else if (meme.type === "video") {
      const video = document.createElement("video");
      video.src = meme.src;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      if (meme.poster) video.poster = meme.poster;
      card.appendChild(video);
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
    const footer = document.createElement("div");
    footer.className = "meme-footer";
    const date = document.createElement("p");
    date.className = "meme-date";
    date.textContent = formatDate(meme.date, lang);
    const shareBtn = document.createElement("button");
    shareBtn.className = "share-btn";
    shareBtn.textContent = STRINGS[lang].share;
    shareBtn.addEventListener("click", () => {
      const url = location.origin + location.pathname + "#news-" + meme.id;
      navigator.clipboard.writeText(url).then(() => {
        shareBtn.textContent = STRINGS[lang].copied;
        setTimeout(() => { shareBtn.textContent = STRINGS[lang].share; }, 1500);
      });
    });
    footer.append(date, shareBtn);
    body.appendChild(caption);
    body.appendChild(footer);
    card.appendChild(body);

    feed.appendChild(card);
  }
}

function renderTour(lang) {
  const list = document.getElementById("tour");
  list.innerHTML = "";
  const today = new Date().toISOString().slice(0, 10);
  for (const stop of tour) {
    const row = document.createElement("article");
    const played = stop.date < today && stop.status !== "finale";
    row.className = "stop" + (played ? " played" : "") + (stop.status === "finale" ? " finale" : "");

    const d = new Date(stop.date + "T12:00:00");
    const dateBox = document.createElement("div");
    dateBox.className = "stop-date";
    dateBox.innerHTML =
      "<span class='stop-day'>" + d.getDate() + "</span><span class='stop-month'>" +
      d.toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", { month: "short" }) + "</span>";

    const info = document.createElement("div");
    info.className = "stop-info";
    const city = document.createElement("p");
    city.className = "stop-city";
    city.textContent = stop.city[lang];
    const venue = document.createElement("p");
    venue.className = "stop-venue";
    venue.textContent = stop.venue[lang];
    const note = document.createElement("p");
    note.className = "stop-note";
    note.textContent = stop.note[lang];
    info.append(city, venue, note);

    row.append(dateBox, info);

    const badgeKey = stop.status
      ? { soldout: "statusSoldout", cancelled: "statusCancelled", finale: "statusFinale" }[stop.status]
      : played ? "statusPlayed" : null;
    if (badgeKey) {
      const badge = document.createElement("span");
      badge.className = "stop-badge " + (stop.status || "played");
      badge.textContent = STRINGS[lang][badgeKey];
      row.appendChild(badge);
    }

    list.appendChild(row);
  }
}

document.querySelectorAll(".lang-picker button").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

const deepLink = location.hash.startsWith("#news-") ? location.hash.slice(1) : null;
setTab(location.hash === "#tour" ? "tour" : "memes");

Promise.all([
  fetch("memes.json").then((res) => res.json()),
  fetch("tour.json").then((res) => res.json()),
])
  .then(([memeData, tourData]) => {
    memes = memeData.sort((a, b) => b.date.localeCompare(a.date));
    tour = tourData.sort((a, b) => b.date.localeCompare(a.date));
    setLang(currentLang());
    if (deepLink) {
      const target = document.getElementById(deepLink);
      if (target) {
        history.replaceState(null, "", "#" + deepLink);
        target.scrollIntoView({ block: "start" });
      }
    }
  })
  .catch(() => {
    document.getElementById("feed").textContent = STRINGS[currentLang()].feedError;
    setLang(currentLang());
  });
