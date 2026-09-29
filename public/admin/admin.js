(() => {
  "use strict";

  const state = {
    csrfToken: "",
    settings: null,
    links: [],
    profileImageKey: null,
  };

  const el = {
    loginView: document.querySelector("#login-view"),
    dashboardView: document.querySelector("#dashboard-view"),
    loginForm: document.querySelector("#login-form"),
    loginPassword: document.querySelector("#login-password"),
    loginButton: document.querySelector("#login-button"),
    loginError: document.querySelector("#login-error"),
    logout: document.querySelector("#logout-button"),
    profileForm: document.querySelector("#profile-form"),
    profileName: document.querySelector("#profile-name"),
    profileBio: document.querySelector("#profile-bio"),
    profileImage: document.querySelector("#profile-image"),
    profilePreview: document.querySelector("#profile-preview"),
    bioCounter: document.querySelector("#bio-counter"),
    saveProfile: document.querySelector("#save-profile"),
    addLink: document.querySelector("#add-link-button"),
    links: document.querySelector("#admin-links"),
    empty: document.querySelector("#admin-empty"),
    dialog: document.querySelector("#link-dialog"),
    dialogTitle: document.querySelector("#link-dialog-title"),
    closeDialog: document.querySelector("#close-dialog"),
    cancelDialog: document.querySelector("#cancel-dialog"),
    linkForm: document.querySelector("#link-form"),
    linkId: document.querySelector("#link-id"),
    linkTitle: document.querySelector("#link-title"),
    linkSubtitle: document.querySelector("#link-subtitle"),
    linkUrl: document.querySelector("#link-url"),
    linkImage: document.querySelector("#link-image"),
    linkImageKey: document.querySelector("#link-image-key"),
    linkImagePreview: document.querySelector("#link-image-preview"),
    linkActive: document.querySelector("#link-active"),
    linkError: document.querySelector("#link-error"),
    saveLink: document.querySelector("#save-link"),
    toast: document.querySelector("#toast"),
  };

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("accept", "application/json");
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("content-type", "application/json");
    }
    if (options.method && !["GET", "HEAD"].includes(options.method.toUpperCase())) {
      headers.set("x-csrf-token", state.csrfToken);
    }

    const response = await fetch(path, {
      ...options,
      headers,
      credentials: "same-origin",
    });
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) showLogin();
      throw new Error(data?.error || "Não foi possível concluir a operação.");
    }
    return data;
  }

  function showLogin() {
    state.csrfToken = "";
    el.dashboardView.hidden = true;
    el.loginView.hidden = false;
    el.loginPassword.value = "";
  }

  function showDashboard() {
    el.loginView.hidden = true;
    el.dashboardView.hidden = false;
  }

  function showError(target, message) {
    target.textContent = message;
    target.hidden = false;
  }

  function clearError(target) {
    target.textContent = "";
    target.hidden = true;
  }

  let toastTimer;
  function toast(message, type = "success") {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.toggle("is-error", type === "error");
    el.toast.hidden = false;
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 3500);
  }

  async function initialize() {
    try {
      const session = await api("/api/auth/session");
      if (!session.authenticated) {
        showLogin();
        return;
      }
      state.csrfToken = session.csrfToken;
      showDashboard();
      await loadData();
    } catch {
      showLogin();
    }
  }

  async function loadData() {
    const data = await api("/api/admin/data");
    state.settings = data.settings;
    state.links = data.links;
    state.profileImageKey = data.settings.avatarKey;
    renderProfile();
    renderLinks();
  }

  function renderProfile() {
    el.profileName.value = state.settings.displayName;
    el.profileBio.value = state.settings.bio;
    el.profilePreview.src = state.settings.avatarUrl || "/assets/logo.png";
    el.bioCounter.textContent = String(el.profileBio.value.length);
  }

  function initials(value) {
    return String(value || "CD")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function makeButton(label, action, id, className = "action-button") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.action = action;
    button.dataset.id = id;
    button.textContent = label;
    return button;
  }

  function renderLinks() {
    el.links.replaceChildren();
    el.empty.hidden = state.links.length > 0;

    state.links.forEach((link, index) => {
      const article = document.createElement("article");
      article.className = `admin-link${link.isActive ? "" : " is-inactive"}`;
      article.dataset.id = link.id;

      let image;
      if (link.imageUrl) {
        image = document.createElement("img");
        image.src = link.imageUrl;
        image.alt = "";
        image.loading = "lazy";
      } else {
        image = document.createElement("span");
        image.className = "admin-link-placeholder";
        image.textContent = initials(link.title);
      }

      const copy = document.createElement("div");
      copy.className = "admin-link-copy";
      const title = document.createElement("strong");
      title.textContent = link.title;
      const url = document.createElement("span");
      url.textContent = link.url;
      const meta = document.createElement("span");
      meta.className = "admin-link-meta";
      meta.textContent = `${link.isActive ? "PUBLICADO" : "OCULTO"} · ${link.clicks} CLIQUES`;
      copy.append(title, url, meta);

      const actions = document.createElement("div");
      actions.className = "admin-link-actions";
      if (index > 0) actions.appendChild(makeButton("Subir", "up", link.id));
      if (index < state.links.length - 1) {
        actions.appendChild(makeButton("Descer", "down", link.id));
      }
      actions.appendChild(makeButton("Editar", "edit", link.id));
      actions.appendChild(makeButton("Excluir", "delete", link.id, "danger-button"));

      article.append(image, copy, actions);
      el.links.appendChild(article);
    });
  }

  async function uploadImage(file) {
    if (!file) return null;
    if (file.size > 2 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 2 MB.");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      throw new Error("Use uma imagem PNG, JPG ou WebP.");
    }
    const form = new FormData();
    form.append("image", file);
    return api("/api/admin/upload", { method: "POST", body: form });
  }

  function openLinkDialog(link = null) {
    clearError(el.linkError);
    el.linkForm.reset();
    el.linkId.value = link?.id || "";
    el.linkTitle.value = link?.title || "";
    el.linkSubtitle.value = link?.subtitle || "";
    el.linkUrl.value = link?.url || "";
    el.linkImageKey.value = link?.imageKey || "";
    el.linkImagePreview.src = link?.imageUrl || "/assets/logo.png";
    el.linkActive.checked = link?.isActive ?? true;
    el.dialogTitle.textContent = link ? "Editar link" : "Adicionar link";
    el.dialog.showModal();
    requestAnimationFrame(() => el.linkTitle.focus());
  }

  function closeLinkDialog() {
    el.dialog.close();
    el.linkForm.reset();
    clearError(el.linkError);
  }

  async function moveLink(id, direction) {
    const index = state.links.findIndex((link) => link.id === id);
    const destination = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || destination < 0 || destination >= state.links.length) return;
    const next = [...state.links];
    const [item] = next.splice(index, 1);
    next.splice(destination, 0, item);
    try {
      await api("/api/admin/links/reorder", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((link) => link.id) }),
      });
      state.links = next;
      renderLinks();
      toast("Ordem atualizada.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  el.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(el.loginError);
    el.loginButton.disabled = true;
    el.loginButton.textContent = "Entrando...";
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          password: el.loginPassword.value,
        }),
      });
      state.csrfToken = data.csrfToken;
      el.loginPassword.value = "";
      showDashboard();
      await loadData();
    } catch (error) {
      showError(el.loginError, error.message);
    } finally {
      el.loginButton.disabled = false;
      el.loginButton.textContent = "Entrar com segurança";
    }
  });

  el.logout.addEventListener("click", async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // Mesmo se a sessão já tiver expirado, volte ao login.
    }
    showLogin();
  });

  el.profileBio.addEventListener("input", () => {
    el.bioCounter.textContent = String(el.profileBio.value.length);
  });

  el.profileImage.addEventListener("change", () => {
    const file = el.profileImage.files?.[0];
    if (!file) return;
    el.profilePreview.src = URL.createObjectURL(file);
  });

  el.profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    el.saveProfile.disabled = true;
    el.saveProfile.textContent = "Salvando...";
    try {
      const file = el.profileImage.files?.[0];
      if (file) {
        const uploaded = await uploadImage(file);
        state.profileImageKey = uploaded.key;
      }
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          displayName: el.profileName.value,
          bio: el.profileBio.value,
          avatarKey: state.profileImageKey,
        }),
      });
      el.profileImage.value = "";
      await loadData();
      toast("Perfil atualizado com sucesso.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      el.saveProfile.disabled = false;
      el.saveProfile.textContent = "Salvar perfil";
    }
  });

  el.addLink.addEventListener("click", () => openLinkDialog());
  el.closeDialog.addEventListener("click", closeLinkDialog);
  el.cancelDialog.addEventListener("click", closeLinkDialog);
  el.dialog.addEventListener("click", (event) => {
    if (event.target === el.dialog) closeLinkDialog();
  });

  el.linkImage.addEventListener("change", () => {
    const file = el.linkImage.files?.[0];
    if (!file) return;
    el.linkImagePreview.src = URL.createObjectURL(file);
  });

  el.linkForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(el.linkError);
    el.saveLink.disabled = true;
    el.saveLink.textContent = "Salvando...";
    try {
      let imageKey = el.linkImageKey.value || null;
      const file = el.linkImage.files?.[0];
      if (file) {
        const uploaded = await uploadImage(file);
        imageKey = uploaded.key;
      }
      const body = JSON.stringify({
        title: el.linkTitle.value,
        subtitle: el.linkSubtitle.value,
        url: el.linkUrl.value,
        imageKey,
        isActive: el.linkActive.checked,
      });
      const id = el.linkId.value;
      await api(id ? `/api/admin/links/${encodeURIComponent(id)}` : "/api/admin/links", {
        method: id ? "PUT" : "POST",
        body,
      });
      closeLinkDialog();
      await loadData();
      toast(id ? "Link atualizado." : "Link adicionado.");
    } catch (error) {
      showError(el.linkError, error.message);
    } finally {
      el.saveLink.disabled = false;
      el.saveLink.textContent = "Salvar link";
    }
  });

  el.links.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const link = state.links.find((item) => item.id === button.dataset.id);
    if (!link) return;

    if (button.dataset.action === "edit") openLinkDialog(link);
    if (button.dataset.action === "up" || button.dataset.action === "down") {
      await moveLink(link.id, button.dataset.action);
    }
    if (button.dataset.action === "delete") {
      const confirmed = window.confirm(`Excluir o link “${link.title}”?`);
      if (!confirmed) return;
      try {
        await api(`/api/admin/links/${encodeURIComponent(link.id)}`, { method: "DELETE" });
        await loadData();
        toast("Link excluído.");
      } catch (error) {
        toast(error.message, "error");
      }
    }
  });

  initialize();
})();
