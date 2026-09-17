// Updates the admin password in the Supabase `admin_users` table.
// Usage:
//   node scripts/set-admin-password.js [username] [newPassword]
// Defaults: username=admin, newPassword=admin770
// Reads Supabase URL + service key from .env.local (or environment).

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

// Minimal .env.local loader (no extra deps).
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function run() {
  loadEnv();
  const username = (process.argv[2] || "admin").trim().toLowerCase();
  const password = process.argv[3] || "admin770";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const password_hash = bcrypt.hashSync(password, 10);

  const { data, error } = await supabase
    .from("admin_users")
    .update({ password_hash })
    .eq("username", username)
    .select("username");

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.error(`No admin user found with username "${username}".`);
    process.exit(1);
  }
  console.log(`Password updated for "${username}".`);
}

run();
