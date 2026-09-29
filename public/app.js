(() => {
  "use strict";

  const elements = {
    name: document.querySelector("#profile-name"),
    bio: document.querySelector("#profile-bio"),
    image: document.querySelector("#profile-image"),
    list: document.querySelector("#links-list"),
    count: document.querySelector("#links-count"),
    loading: document.querySelector("#loading-state"),
    empty: document.querySelector("#empty-state"),
    error: document.querySelector("#error-state"),
    retry: document.querySelector("#retry-button"),
    year: document.querySelector("#current-year"),
  };

  function setState(state) {
    elements.loading.hidden = state !== "loading";
    elements.list.hidden = state !== "ready";
    elements.empty.hidden = state !== "empty";
    elements.error.hidden = state !== "error";
  }

  function initials(value) {
    return String(value || "CD")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function createLink(link, index) {
    const anchor = document.createElement("a");
    anchor.className = "link-card";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("aria-label", `Abrir ${link.title} em uma nova aba`);

    const number = document.createElement("span");
    number.className = "link-number";
    number.textContent = String(index + 1).padStart(2, "0");

    let image;
    if (link.imageUrl) {
      image = document.createElement("img");
      image.className = "link-image";
      image.src = link.imageUrl;
      image.alt = "";
      image.loading = "lazy";
    } else {
      image = document.createElement("span");
      image.className = "link-placeholder";
      image.setAttribute("aria-hidden", "true");
      image.textContent = initials(link.title);
    }

    const copy = document.createElement("div");
    copy.className = "link-copy";
    const title = document.createElement("h3");
    title.textContent = link.title;
    const subtitle = document.createElement("p");
    subtitle.textContent = link.subtitle || "Acesse este projeto da Cog Dev.";
    copy.append(title, subtitle);

    const kind = document.createElement("span");
    kind.className = "link-kind";
    kind.textContent = "ABRIR";

    anchor.append(number, image, copy, kind);
    anchor.addEventListener("click", () => {
      fetch(`/api/links/${encodeURIComponent(link.id)}/click`, {
        method: "POST",
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => undefined);
    });
    return anchor;
  }

  async function loadSite() {
    setState("loading");
    try {
      const response = await fetch("/api/site", {
        headers: { accept: "application/json" },
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("request_failed");
      const data = await response.json();

      elements.name.textContent = data.profile.displayName;
      elements.bio.textContent = data.profile.bio;
      elements.image.src = data.profile.avatarUrl || "/assets/logo.png";
      elements.image.alt = `Imagem de ${data.profile.displayName}`;
      document.title = `${data.profile.displayName} | Links oficiais`;

      elements.list.replaceChildren();
      data.links.forEach((link, index) => elements.list.appendChild(createLink(link, index)));
      elements.count.textContent = data.links.length
        ? `${String(data.links.length).padStart(2, "0")} ${
            data.links.length === 1 ? "LINK" : "LINKS"
          }`
        : "EM BREVE";
      setState(data.links.length ? "ready" : "empty");
    } catch {
      setState("error");
    }
  }

  elements.retry.addEventListener("click", loadSite);
  elements.year.textContent = new Date().getFullYear();
  loadSite();
})();
