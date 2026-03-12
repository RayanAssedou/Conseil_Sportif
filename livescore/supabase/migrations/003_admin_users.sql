-- Admin users for login (username + password)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only service role can read (no public access)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- No public policy - admin_users is only accessed server-side with service key

-- Seed admin user: username=admin, password=admin770
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$tJRqf/ulKIuJr3J1CModW.EAuBGDv7FIACrqqE4uhlTJVKsg4kWfy')
ON CONFLICT (username) DO NOTHING;
