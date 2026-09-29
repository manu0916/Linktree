import assert from "node:assert/strict";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.js";

class D1StatementMock {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async first() {
    return this.database.prepare(this.sql).get(...this.values) || null;
  }

  async all() {
    return { results: this.database.prepare(this.sql).all(...this.values) };
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: result };
  }
}

class D1Mock {
  constructor(database) {
    this.database = database;
  }

  prepare(sql) {
    return new D1StatementMock(this.database, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }
}

class R2Mock {
  constructor() {
    this.objects = new Map();
  }

  async put(key, bytes, options = {}) {
    this.objects.set(key, { bytes: new Uint8Array(bytes), options });
  }

  async get(key) {
    const stored = this.objects.get(key);
    if (!stored) return null;
    return {
      body: stored.bytes,
      httpEtag: `"${key}"`,
      writeHttpMetadata(headers) {
        if (stored.options.httpMetadata?.contentType) {
          headers.set("content-type", stored.options.httpMetadata.contentType);
        }
      },
    };
  }

  async delete(key) {
    this.objects.delete(key);
  }
}

function passwordHash(password) {
  const salt = randomBytes(24);
  const hash = pbkdf2Sync(password, salt, 100_000, 32, "sha256");
  return `pbkdf2$100000$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

async function call(env, path, init = {}) {
  const request = new Request(`https://linktree.test${path}`, init);
  return worker.fetch(request, env, { waitUntil: (promise) => promise });
}

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(await readFile(new URL("../migrations/0001_initial.sql", import.meta.url), "utf8"));

const password = "safe-local-test-password";
const env = {
  DB: new D1Mock(sqlite),
  MEDIA: new R2Mock(),
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  ADMIN_EMAIL: "admin@example.test",
  ADMIN_PASSWORD_HASH: passwordHash(password),
  SESSION_TTL_SECONDS: "28800",
};

const publicBefore = await call(env, "/api/site");
assert.equal(publicBefore.status, 200);
assert.equal((await publicBefore.json()).profile.displayName, "Cog Dev");

const unauthenticated = await call(env, "/api/admin/data");
assert.equal(unauthenticated.status, 401);

const rejectedLogin = await call(env, "/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://linktree.test" },
  body: JSON.stringify({ password: "incorrect-password" }),
});
assert.equal(rejectedLogin.status, 401);

const login = await call(env, "/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://linktree.test" },
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200);
const loginBody = await login.json();
const cookie = login.headers.get("set-cookie").split(";")[0];
assert.ok(loginBody.csrfToken);

const adminHeaders = {
  "content-type": "application/json",
  origin: "https://linktree.test",
  cookie,
  "x-csrf-token": loginBody.csrfToken,
};

const rejectedUrl = await call(env, "/api/admin/links", {
  method: "POST",
  headers: adminHeaders,
  body: JSON.stringify({ title: "Inválido", url: "javascript:alert(1)" }),
});
assert.equal(rejectedUrl.status, 400);

const created = await call(env, "/api/admin/links", {
  method: "POST",
  headers: adminHeaders,
  body: JSON.stringify({
    title: "<img src=x onerror=alert(1)>",
    subtitle: "Conteúdo tratado como texto",
    url: "https://example.com/projeto",
    isActive: true,
  }),
});
assert.equal(created.status, 201);

const publicAfter = await call(env, "/api/site");
const publicData = await publicAfter.json();
assert.equal(publicData.links.length, 1);
assert.equal(publicData.links[0].title, "<img src=x onerror=alert(1)>");

const missingCsrf = await call(env, "/api/admin/settings", {
  method: "PUT",
  headers: {
    "content-type": "application/json",
    origin: "https://linktree.test",
    cookie,
  },
  body: JSON.stringify({ displayName: "Cog Dev", bio: "Teste" }),
});
assert.equal(missingCsrf.status, 403);

const png = new File(
  [Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])],
  "logo.png",
  { type: "image/png" },
);
const form = new FormData();
form.append("image", png);
const uploaded = await call(env, "/api/admin/upload", {
  method: "POST",
  headers: {
    origin: "https://linktree.test",
    cookie,
    "x-csrf-token": loginBody.csrfToken,
  },
  body: form,
});
assert.equal(uploaded.status, 201);
assert.ok((await uploaded.json()).key);

console.log("Smoke tests concluídos: autenticação, CSRF, URL, persistência e upload.");
