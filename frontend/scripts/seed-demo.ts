#!/usr/bin/env ts-node
/**
 * Demo seed script for StellarInsure frontend.
 *
 * Populates the backend with realistic demo data so the UI can be
 * presented locally without a live Stellar network. Requires the
 * backend to be running (default: http://localhost:8000).
 *
 * Usage:
 *   npx ts-node scripts/seed-demo.ts
 *   BACKEND_URL=http://localhost:8000 npx ts-node scripts/seed-demo.ts
 *   npx ts-node scripts/seed-demo.ts --dry-run
 */

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const DRY_RUN = process.argv.includes("--dry-run");

// ── Demo accounts ──────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    stellar_address: "GDEMO1STELLARINSUREDEMOACCOUNTALPHAXXXXXXXXXXXXXXXXXXXXXXXXXX",
    email: "alice@demo.stellarinsure.local",
    label: "Alice (policyholder)",
  },
  {
    stellar_address: "GDEMO2STELLARINSUREDEMOACCOUNTBETAXXXXXXXXXXXXXXXXXXXXXXXXXX",
    email: "bob@demo.stellarinsure.local",
    label: "Bob (policyholder)",
  },
];

// ── Demo policies (matched to fixture data) ────────────────────────────────

interface DemoPolicy {
  label: string;
  policy_type: string;
  coverage_amount: number;
  premium: number;
  duration_days: number;
  trigger_condition: string;
}

const DEMO_POLICIES: DemoPolicy[] = [
  {
    label: "Northern Plains Weather Guard",
    policy_type: "weather",
    coverage_amount: 5000,
    premium: 125.5,
    duration_days: 90,
    trigger_condition: "precipitation < 10mm over 30 days",
  },
  {
    label: "Flight Orbit Delay Cover",
    policy_type: "flight",
    coverage_amount: 2000,
    premium: 45.0,
    duration_days: 90,
    trigger_condition: "flight_delay > 3h",
  },
  {
    label: "Smart Contract Risk Shield",
    policy_type: "smart_contract",
    coverage_amount: 10000,
    premium: 250.0,
    duration_days: 180,
    trigger_condition: "contract_exploit_detected == true",
  },
  {
    label: "Basic Health Coverage",
    policy_type: "health",
    coverage_amount: 3000,
    premium: 75.0,
    duration_days: 180,
    trigger_condition: "hospitalization == true",
  },
  {
    label: "Coastal Storm Parametric Cover",
    policy_type: "weather",
    coverage_amount: 12000,
    premium: 310.0,
    duration_days: 90,
    trigger_condition: "wind_speed > 120km/h within 50km radius",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`;
  if (DRY_RUN) {
    console.log(`[dry-run] POST ${url}`, JSON.stringify(body, null, 2));
    return {} as T;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${url} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

function log(msg: string): void {
  console.log(`[seed] ${msg}`);
}

function warn(msg: string): void {
  console.warn(`[seed] WARNING: ${msg}`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  log(`Target: ${BASE_URL}${DRY_RUN ? " (dry-run mode)" : ""}`);
  log("─".repeat(60));

  const tokens: Record<string, string> = {};

  for (const user of DEMO_USERS) {
    log(`Registering ${user.label} …`);
    try {
      const auth = await post<{ access_token: string }>("/auth/register", {
        stellar_address: user.stellar_address,
        email: user.email,
      });
      tokens[user.stellar_address] = auth.access_token ?? "";
      log(`  ✓ registered  ${user.stellar_address.slice(0, 12)}…`);
    } catch (err: unknown) {
      warn(`  Could not register ${user.label}: ${String(err)}`);
      // Try login if already registered
      try {
        const auth = await post<{ access_token: string }>("/auth/login", {
          stellar_address: user.stellar_address,
          signature: "demo-signature",
          message: "StellarInsure Demo Login",
        });
        tokens[user.stellar_address] = auth.access_token ?? "";
        log(`  ✓ logged in   ${user.stellar_address.slice(0, 12)}…`);
      } catch {
        warn(`  Skipping ${user.label} — could not authenticate.`);
      }
    }
  }

  const primaryUser = DEMO_USERS[0];
  const token = tokens[primaryUser.stellar_address];

  if (!token && !DRY_RUN) {
    warn("No auth token available — skipping policy creation.");
    warn("Ensure the backend is running and auth is configured.");
    printSummary([]);
    return;
  }

  const createdPolicies: string[] = [];

  for (const policy of DEMO_POLICIES) {
    log(`Creating policy: ${policy.label} …`);
    const now = Math.floor(Date.now() / 1000);
    const duration_seconds = policy.duration_days * 86400;
    try {
      const created = await post<{ id: number }>("/policies/", {
        policy_type: policy.policy_type,
        coverage_amount: policy.coverage_amount,
        premium: policy.premium,
        start_time: now,
        end_time: now + duration_seconds,
        trigger_condition: policy.trigger_condition,
        ...(token ? { _auth: token } : {}),
      });
      if (created.id) {
        createdPolicies.push(`${created.id}`);
        log(`  ✓ policy #${created.id}: ${policy.label}`);
      }
    } catch (err: unknown) {
      warn(`  Could not create policy "${policy.label}": ${String(err)}`);
    }
  }

  printSummary(createdPolicies);
}

function printSummary(policyIds: string[]): void {
  log("─".repeat(60));
  log("Seed complete.");
  if (policyIds.length > 0) {
    log(`Created policies: ${policyIds.join(", ")}`);
  }
  log("");
  log("Demo credentials:");
  for (const u of DEMO_USERS) {
    log(`  ${u.label.padEnd(22)} ${u.stellar_address.slice(0, 20)}…`);
  }
  log("");
  log("Start the frontend with:  cd frontend && npm run dev");
  log("Start the backend with:   cd backend && uvicorn src.main:app --reload");
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
