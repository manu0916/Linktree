CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 60),
  bio TEXT NOT NULL DEFAULT '' CHECK (length(bio) <= 180),
  avatar_key TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 80),
  subtitle TEXT NOT NULL DEFAULT '' CHECK (length(subtitle) <= 140),
  url TEXT NOT NULL CHECK (length(url) <= 2048),
  image_key TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size > 0 AND size <= 2097152),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_public_order
ON links(is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_sessions_expiration
ON admin_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset
ON rate_limits(reset_at);

INSERT OR IGNORE INTO settings (
  id,
  display_name,
  bio,
  avatar_key,
  updated_at
) VALUES (
  1,
  'Cog Dev',
  'Softwares, CRMs e sistemas sob medida.',
  NULL,
  unixepoch()
);

PRAGMA optimize;
