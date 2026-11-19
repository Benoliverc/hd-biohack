/**
 * AuthGate / session — after sign-out or /auth/me 401, /login shows the form.
 * Run: npx tsx scripts/assert-auth-gate-signed-out-form.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

const api = read("src/lib/api.ts");
assert.match(api, /export class ApiError extends Error/);
assert.match(api, /this\.status = status/);
assert.match(api, /throw new ApiError\(msg, res\.status\)/);
assert.match(api, /export function isApiError/);

const store = read("src/lib/store.tsx");
assert.match(store, /isApiError/);
assert.match(store, /refreshGenRef/);
assert.match(store, /status === 401 \|\| status === 403/);
assert.match(store, /clearSession\(\)/);
assert.match(store, /refreshGenRef\.current \+= 1/);
assert.doesNotMatch(
  store,
  /await api\.logout\(\)/,
  "sign-out must not await logout before navigating"
);

const gate = read("src/components/AuthGate.tsx");
assert.match(gate, /storedSessionHydrating/);
assert.match(gate, /sessionReady && user/);
assert.match(
  gate,
  /pathname === "\/login" && Boolean\(readSessionToken\(\)\) && !sessionReady/
);
assert.match(gate, /clearSession/);
assert.match(gate, /router\.replace\(natalChart \? "\/transits" : "\/profile"\)/);
assert.match(gate, /if \(natalBindingLoading\) return;/);
// Must not keep Loading forever solely because a token is present after sessionReady.
assert.doesNotMatch(
  gate,
  /const storedSessionOnLogin = pathname === "\/login" && Boolean\(readSessionToken\(\)\);/
);

const pkg = JSON.parse(read("package.json"));
assert.ok(
  pkg.scripts["assert:auth-gate-signed-out-form"],
  "package.json wires assert:auth-gate-signed-out-form"
);

console.log("assert-auth-gate-signed-out-form PASS");
