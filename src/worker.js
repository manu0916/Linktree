const MAX_JSON_BYTES = 16 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const COOKIE_NAME = "cogdev_admin";
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

const encoder = new TextEncoder();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = crypto.randomUUID();

    try {
      const response = await route(request, env, ctx, url);
      return withSecurityHeaders(response, url, requestId);
    } catch (error) {
      if (error instanceof HttpError) {
        return withSecurityHeaders(
          json({ error: error.message }, error.status),
          url,
          requestId,
        );
      }
      console.error("Unhandled request error", {
        requestId,
        path: url.pathname,
        name: error?.name || "Error",
      });
      return withSecurityHeaders(
        json({ error: "Não foi possível concluir a solicitação.", requestId }, 500),
        url,
        requestId,
      );
    }
  },
};

async function route(request, env, ctx, url) {
  const { pathname } = url;
  const method = request.method.toUpperCase();

  if (pathname === "/api/site" && method === "GET") {
    return getPublicSite(env);
  }

  const clickMatch = pathname.match(/^\/api\/links\/([a-zA-Z0-9-]{1,64})\/click$/);
  if (clickMatch && method === "POST") {
    return recordClick(request, env, ctx, clickMatch[1]);
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    return login(request, env);
  }
  if (pathname === "/api/auth/session" && method === "GET") {
    return getSession(request, env);
  }
  if (pathname === "/api/auth/logout" && method === "POST") {
    return logout(request, env);
  }

  if (pathname === "/api/admin/data" && method === "GET") {
    return getAdminData(request, env);
  }
  if (pathname === "/api/admin/settings" && method === "PUT") {
    return updateSettings(request, env);
  }
  if (pathname === "/api/admin/links" && method === "POST") {
    return createLink(request, env);
  }
  if (pathname === "/api/admin/links/reorder" && method === "PUT") {
    return reorderLinks(request, env);
  }

  const linkMatch = pathname.match(/^\/api\/admin\/links\/([a-zA-Z0-9-]{1,64})$/);
  if (linkMatch && method === "PUT") {
    return updateLink(request, env, linkMatch[1]);
  }
  if (linkMatch && method === "DELETE") {
    return deleteLink(request, env, ctx, linkMatch[1]);
  }

  if (pathname === "/api/admin/upload" && method === "POST") {
    return uploadImage(request, env);
  }

  if (pathname.startsWith("/media/") && method === "GET") {
    return serveMedia(env, pathname.slice("/media/".length));
  }

  if (pathname === "/admin") {
    const adminUrl = new URL("/admin/index.html", url);
    return env.ASSETS.fetch(new Request(adminUrl, request));
  }

  if (pathname.startsWith("/api/")) {
    return json({ error: "Rota não encontrada." }, 404);
  }

  return env.ASSETS.fetch(request);
}

async function getPublicSite(env) {
  const settings = await env.DB.prepare(
    "SELECT display_name, bio, avatar_key, updated_at FROM settings WHERE id = 1",
  ).first();
  const links = await env.DB.prepare(
    `SELECT id, title, subtitle, url, image_key, sort_order
     FROM links
     WHERE is_active = 1
     ORDER BY sort_order ASC, created_at ASC`,
  ).all();

  return json(
    {
      profile: {
        displayName: settings?.display_name || "Cog Dev",
        bio: settings?.bio || "Softwares, CRMs e sistemas sob medida.",
        avatarUrl: settings?.avatar_key ? mediaUrl(settings.avatar_key) : "/assets/logo.png",
      },
      links: (links.results || []).map(publicLink),
      updatedAt: settings?.updated_at || null,
    },
    200,
    { "cache-control": "public, max-age=30, stale-while-revalidate=120" },
  );
}

async function recordClick(request, env, ctx, id) {
  const allowed = await applyRateLimit(env.DB, await rateKey(request, "click"), 60, 60);
  if (!allowed) return json({ error: "Muitas solicitações." }, 429);

  ctx.waitUntil(
    env.DB.prepare("UPDATE links SET clicks = clicks + 1 WHERE id = ? AND is_active = 1")
      .bind(id)
      .run()
      .catch(() => undefined),
  );
  return new Response(null, { status: 204 });
}

async function login(request, env) {
  if (!sameOrigin(request)) return json({ error: "Origem não permitida." }, 403);

  const allowed = await applyRateLimit(env.DB, await rateKey(request, "login-password-v1"), 5, 15 * 60);
  if (!allowed) {
    return json({ error: "Muitas tentativas. Aguarde alguns minutos." }, 429);
  }

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
    return json({ error: "O acesso administrativo ainda não foi configurado." }, 503);
  }

  const body = await readJson(request);
  const email = normalizeEmail(env.ADMIN_EMAIL);
  const password = typeof body.password === "string" ? body.password : "";
  const passwordValid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);

  if (!passwordValid) {
    return json({ error: "Senha inválida." }, 401);
  }

  const now = epochSeconds();
  const ttl = clampNumber(Number(env.SESSION_TTL_SECONDS || 28_800), 900, 86_400);
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const csrfToken = randomToken(24);

  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(now),
    env.DB.prepare(
      `INSERT INTO admin_sessions (token_hash, email, csrf_token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(tokenHash, email, csrfToken, now + ttl, now),
  ]);

  return json(
    { authenticated: true, csrfToken },
    200,
    {
      "set-cookie": sessionCookie(token, ttl),
      "cache-control": "no-store",
    },
  );
}

async function getSession(request, env) {
  const session = await readSession(request, env);
  if (!session) {
    return json({ authenticated: false }, 200, { "cache-control": "no-store" });
  }
  return json(
    { authenticated: true, email: session.email, csrfToken: session.csrf_token },
    200,
    { "cache-control": "no-store" },
  );
}

async function logout(request, env) {
  if (!sameOrigin(request)) return json({ error: "Origem não permitida." }, 403);
  const token = getCookie(request, COOKIE_NAME);
  if (token) {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .bind(await sha256(token))
      .run();
  }
  return json(
    { ok: true },
    200,
    {
      "set-cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      "cache-control": "no-store",
    },
  );
}

async function getAdminData(request, env) {
  const auth = await requireAdmin(request, env, false);
  if (auth.response) return auth.response;

  const [settings, links] = await Promise.all([
    env.DB.prepare(
      "SELECT display_name, bio, avatar_key, updated_at FROM settings WHERE id = 1",
    ).first(),
    env.DB.prepare(
      `SELECT id, title, subtitle, url, image_key, is_active, sort_order, clicks, created_at, updated_at
       FROM links ORDER BY sort_order ASC, created_at ASC`,
    ).all(),
  ]);

  return json(
    {
      settings: {
        displayName: settings?.display_name || "Cog Dev",
        bio: settings?.bio || "",
        avatarKey: settings?.avatar_key || null,
        avatarUrl: settings?.avatar_key ? mediaUrl(settings.avatar_key) : "/assets/logo.png",
      },
      links: (links.results || []).map(adminLink),
    },
    200,
    { "cache-control": "no-store" },
  );
}

async function updateSettings(request, env) {
  const auth = await requireAdmin(request, env, true);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const displayName = cleanText(body.displayName, 60);
  const bio = cleanText(body.bio, 180, true);
  const avatarKey = nullableMediaKey(body.avatarKey);

  if (!displayName) return json({ error: "Informe o nome que será exibido." }, 400);
  if (avatarKey && !(await mediaExists(env.DB, avatarKey))) {
    return json({ error: "Imagem inválida." }, 400);
  }

  await env.DB.prepare(
    `UPDATE settings
     SET display_name = ?, bio = ?, avatar_key = ?, updated_at = ?
     WHERE id = 1`,
  )
    .bind(displayName, bio, avatarKey, epochSeconds())
    .run();

  return json({ ok: true });
}

async function createLink(request, env) {
  const auth = await requireAdmin(request, env, true);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const link = await validateLinkInput(body, env.DB);
  if (link.error) return json({ error: link.error }, 400);

  const row = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM links").first();
  const now = epochSeconds();
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO links
      (id, title, subtitle, url, image_key, is_active, sort_order, clicks, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(
      id,
      link.title,
      link.subtitle,
      link.url,
      link.imageKey,
      link.isActive ? 1 : 0,
      Number(row?.max_order || 0) + 1,
      now,
      now,
    )
    .run();

  return json({ ok: true, id }, 201);
}

async function updateLink(request, env, id) {
  const auth = await requireAdmin(request, env, true);
  if (auth.response) return auth.response;
  const existing = await env.DB.prepare("SELECT id FROM links WHERE id = ?").bind(id).first();
  if (!existing) return json({ error: "Link não encontrado." }, 404);

  const body = await readJson(request);
  const link = await validateLinkInput(body, env.DB);
  if (link.error) return json({ error: link.error }, 400);

  await env.DB.prepare(
    `UPDATE links
     SET title = ?, subtitle = ?, url = ?, image_key = ?, is_active = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      link.title,
      link.subtitle,
      link.url,
      link.imageKey,
      link.isActive ? 1 : 0,
      epochSeconds(),
      id,
    )
    .run();

  return json({ ok: true });
}

async function reorderLinks(request, env) {
  const auth = await requireAdmin(request, env, true);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (ids.length === 0 || ids.length > 100 || new Set(ids).size !== ids.length) {
    return json({ error: "Ordem inválida." }, 400);
  }
  if (ids.some((id) => typeof id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(id))) {
    return json({ error: "Ordem inválida." }, 400);
  }

  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM links").first();
  if (Number(count?.total || 0) !== ids.length) {
    return json({ error: "A lista de links está desatualizada." }, 409);
  }

  const now = epochSeconds();
  await env.DB.batch(
    ids.map((id, index) =>
      env.DB.prepare("UPDATE links SET sort_order = ?, updated_at = ? WHERE id = ?").bind(
        index + 1,
        now,
        id,
      ),
    ),
  );
  return json({ ok: true });
}

async function deleteLink(request, env, ctx, id) {
  const auth = await requireAdmin(request, env, true);
  if (auth.response) return auth.response;
  const existing = await env.DB.prepare("SELECT image_key FROM links WHERE id = ?").bind(id).first();
  if (!existing) return json({ error: "Link não encontrado." }, 404);

  await env.DB.prepare("DELETE FROM links WHERE id = ?").bind(id).run();
  if (existing.image_key) ctx.waitUntil(deleteUnusedMedia(env, existing.image_key));
  return json({ ok: true });
}

async function uploadImage(request, env) {
  const auth = await requireAdmin(request, env, true);
  if (auth.response) return auth.response;

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_BYTES + 64 * 1024) {
    return json({ error: "A imagem deve ter no máximo 2 MB." }, 413);
  }

  const allowed = await applyRateLimit(
    env.DB,
    `upload:${auth.session.token_hash.slice(0, 24)}`,
    15,
    10 * 60,
  );
  if (!allowed) return json({ error: "Muitos uploads. Aguarde alguns minutos." }, 429);

  const form = await request.formData();
  const file = form.get("image");
  if (!file || typeof file.arrayBuffer !== "function") {
    return json({ error: "Selecione uma imagem." }, 400);
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return json({ error: "Use uma imagem PNG, JPG ou WebP de até 2 MB." }, 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesImageSignature(bytes, file.type)) {
    return json({ error: "O conteúdo do arquivo não corresponde a uma imagem válida." }, 400);
  }

  const id = crypto.randomUUID();
  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  const date = new Date().toISOString().slice(0, 10);
  const objectKey = `${date}/${id}.${extension}`;

  await env.MEDIA.put(objectKey, bytes, {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });
  await env.DB.prepare(
    "INSERT INTO media (id, object_key, content_type, size, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, objectKey, file.type, bytes.byteLength, epochSeconds())
    .run();

  return json({ key: objectKey, url: mediaUrl(objectKey) }, 201);
}

async function serveMedia(env, encodedKey) {
  let key;
  try {
    key = decodeURIComponent(encodedKey);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!key || key.includes("..") || key.includes("\\") || key.length > 300) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}

async function requireAdmin(request, env, csrfRequired) {
  if (!sameOrigin(request)) {
    return { response: json({ error: "Origem não permitida." }, 403) };
  }
  const session = await readSession(request, env);
  if (!session) return { response: json({ error: "Sessão inválida ou expirada." }, 401) };

  if (csrfRequired) {
    const csrf = request.headers.get("x-csrf-token") || "";
    if (!timingSafeEqual(csrf, session.csrf_token)) {
      return { response: json({ error: "Verificação de segurança inválida." }, 403) };
    }
  }
  return { session };
}

async function readSession(request, env) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token || token.length > 128) return null;
  const tokenHash = await sha256(token);
  const now = epochSeconds();
  const session = await env.DB.prepare(
    `SELECT token_hash, email, csrf_token, expires_at
     FROM admin_sessions
     WHERE token_hash = ? AND expires_at > ?`,
  )
    .bind(tokenHash, now)
    .first();
  if (!session) return null;
  if (!timingSafeEqual(normalizeEmail(session.email), normalizeEmail(env.ADMIN_EMAIL || ""))) {
    return null;
  }
  return session;
}

async function validateLinkInput(body, db) {
  const title = cleanText(body.title, 80);
  const subtitle = cleanText(body.subtitle, 140, true);
  const imageKey = nullableMediaKey(body.imageKey);
  const isActive = body.isActive !== false;

  if (!title) return { error: "Informe o nome do link." };

  let url;
  try {
    const parsed = new URL(String(body.url || ""));
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) {
      return { error: "Use uma URL HTTP ou HTTPS válida." };
    }
    url = parsed.toString();
  } catch {
    return { error: "Use uma URL completa e válida." };
  }
  if (url.length > 2048) return { error: "A URL é muito longa." };
  if (imageKey && !(await mediaExists(db, imageKey))) return { error: "Imagem inválida." };
  return { title, subtitle, url, imageKey, isActive };
}

async function mediaExists(db, key) {
  const row = await db.prepare("SELECT 1 AS found FROM media WHERE object_key = ?").bind(key).first();
  return Boolean(row?.found);
}

async function deleteUnusedMedia(env, key) {
  const usage = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM links WHERE image_key = ?) +
       (SELECT COUNT(*) FROM settings WHERE avatar_key = ?) AS total`,
  )
    .bind(key, key)
    .first();
  if (Number(usage?.total || 0) > 0) return;
  await Promise.all([
    env.MEDIA.delete(key),
    env.DB.prepare("DELETE FROM media WHERE object_key = ?").bind(key).run(),
  ]);
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Envie os dados em formato JSON.");
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_JSON_BYTES) throw new HttpError(413, "Solicitação muito grande.");
  const text = await request.text();
  if (encoder.encode(text).byteLength > MAX_JSON_BYTES) {
    throw new HttpError(413, "Solicitação muito grande.");
  }
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "JSON inválido.");
  }
}

async function applyRateLimit(db, key, limit, windowSeconds) {
  const now = epochSeconds();
  const row = await db.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").bind(key).first();

  if (!row || Number(row.reset_at) <= now) {
    await db.prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`,
    )
      .bind(key, now + windowSeconds)
      .run();
    return true;
  }

  if (Number(row.count) >= limit) return false;
  await db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").bind(key).run();
  return true;
}

async function rateKey(request, action) {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  return `${action}:${(await sha256(ip)).slice(0, 32)}`;
}

async function verifyPassword(password, encoded) {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) return false;
  const parts = String(encoded || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false;

  try {
    const salt = base64UrlToBytes(parts[2]);
    const expected = base64UrlToBytes(parts[3]);
    if (salt.byteLength < 16 || expected.byteLength !== 32) return false;
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
      "deriveBits",
    ]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      key,
      256,
    );
    return timingSafeBytes(new Uint8Array(bits), expected);
  } catch (error) {
    console.warn("Password verification error", {
      name: error?.name || "Error",
      message: error?.message || "Unknown error",
    });
    return false;
  }
}

function publicLink(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    url: row.url,
    imageUrl: row.image_key ? mediaUrl(row.image_key) : null,
  };
}

function adminLink(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    url: row.url,
    imageKey: row.image_key,
    imageUrl: row.image_key ? mediaUrl(row.image_key) : null,
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order,
    clicks: row.clicks,
  };
}

function mediaUrl(key) {
  return `/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function matchesImageSignature(bytes, type) {
  if (type === "image/png") {
    return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  }
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  }
  if (type === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

function withSecurityHeaders(response, url, requestId) {
  const headers = new Headers(response.headers);
  headers.set(
    "content-security-policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  );
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("x-request-id", requestId);
  if (url.protocol === "https:") {
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    headers.set("cache-control", "no-store");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return ["GET", "HEAD"].includes(request.method.toUpperCase());
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

function sessionCookie(token, ttl) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ttl}`;
}

function cleanText(value, maxLength, allowEmpty = false) {
  if (typeof value !== "string") return allowEmpty ? "" : null;
  const clean = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (!clean && !allowEmpty) return null;
  return clean.slice(0, maxLength);
}

function normalizeEmail(value) {
  if (typeof value !== "string" || value.length > 254) return "";
  return value.trim().toLowerCase();
}

function nullableMediaKey(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 300 || value.includes("..") || value.includes("\\")) {
    return null;
  }
  return value;
}

function randomToken(bytes) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return bytesToBase64Url(data);
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(left, right) {
  return timingSafeBytes(encoder.encode(String(left)), encoder.encode(String(right)));
}

function timingSafeBytes(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  let mismatch = 0;
  for (let i = 0; i < left.byteLength; i += 1) mismatch |= left[i] ^ right[i];
  return mismatch === 0;
}

function epochSeconds() {
  return Math.floor(Date.now() / 1000);
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function json(data, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  return new Response(JSON.stringify(data), { status, headers });
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
