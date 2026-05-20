'use client';

import { useState } from 'react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#22c55e' : '#666', borderRadius: 5, padding: '2px 8px', fontSize: 11, cursor: 'pointer', transition: 'all 150ms', fontFamily: 'monospace', whiteSpace: 'nowrap' }}
    >
      {copied ? 'Done' : 'Copy'}
    </button>
  );
}

function CodeBlock({ cmd, label }: { cmd: string; label?: string }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0a0c09', border: '1px solid #1e2420', borderRadius: 6, padding: '8px 12px' }}>
        <code style={{ flex: 1, fontSize: 12, color: '#f0f0f0', fontFamily: 'monospace' }}>{cmd}</code>
        <CopyButton text={cmd} />
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="adm-card-title" style={{ margin: 0 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ── TDD Workflow ─────────────────────────────────────────────────────────────

function TDDWorkflow() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = [
    {
      color: '#ef4444', label: 'RED', icon: 'Red',
      title: 'Write a failing test first',
      what: 'Before writing any implementation code, write a test that describes the desired behavior. Run it — it MUST fail. If it passes immediately, the test is wrong.',
      example: `// __tests__/lib/payEngine.test.ts
test('Late Night Bonus: adds $2 between 11pm–3am', () => {
  const result = calculateDriverPay(3, 0, false, 1.0, { lateNight: true });
  expect(result.lateNightBonus).toBe(2.00);
  expect(result.totalPay).toBe(9.10); // $3 base + $2.10 dist + $2 bonus + wait
});
// → Run: pnpm test --testPathPattern payEngine
// → Expected: FAIL (lateNight option doesn't exist yet)`,
      cmd: 'pnpm test --testPathPattern payEngine --watch',
    },
    {
      color: '#f59e0b', label: 'GREEN', icon: 'Yellow',
      title: 'Write the minimum code to pass',
      what: 'Add only enough implementation to make the test pass. Do not over-engineer. Do not add features you don\'t have tests for. Keep it simple.',
      example: `// lib/payEngine.ts
export function calculateDriverPay(
  miles: number, waitMins: number, batched: boolean,
  surge: number, opts?: { lateNight?: boolean }
) {
  const base = 3.00;
  const distancePay = miles * 0.70;
  const timePay = waitMins * 0.25;
  const batchBonus = batched ? 2.00 : 0;
  const lateNightBonus = opts?.lateNight ? 2.00 : 0; // ← new line only
  const totalPay = (base + distancePay + batchBonus + lateNightBonus) * surge + timePay;
  return { base, distancePay, timePay, batchBonus, lateNightBonus, totalPay };
}
// → Run test again → PASS Done`,
      cmd: 'pnpm test --testPathPattern payEngine',
    },
    {
      color: '#22c55e', label: 'REFACTOR', icon: 'Green',
      title: 'Clean up, then run all tests',
      what: 'Now that it works, clean up: rename variables, extract helpers, add JSDoc comments, remove duplication. Run the full suite after — if anything breaks you\'ve over-refactored.',
      example: `// Extract bonus calculation into its own helper for readability
function getOrderBonuses(batched: boolean, lateNight: boolean) {
  return {
    batchBonus: batched ? BATCH_BONUS : 0,
    lateNightBonus: lateNight ? LATE_NIGHT_BONUS : 0,
  };
}

// Constants at top of file (not magic numbers scattered around)
const BASE_PAY       = 3.00;
const DISTANCE_RATE  = 0.70; // per mile
const WAIT_RATE      = 0.25; // per minute
const BATCH_BONUS    = 2.00;
const LATE_NIGHT_BONUS = 2.00;`,
      cmd: 'pnpm test',
    },
  ];

  return (
    <div className="adm-card">
      <SectionHeader title="TDD Workflow — Red → Green → Refactor" sub="The standard loop for every new feature or bug fix at TrueServe." />

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 7, border: `2px solid ${activeStep === i ? s.color : 'rgba(255,255,255,0.06)'}`,
              background: activeStep === i ? `${s.color}15` : 'transparent',
              color: activeStep === i ? s.color : '#666',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Active step content */}
      {(() => {
        const s = steps[activeStep];
        return (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginBottom: 8 }}>{s.title}</div>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, margin: '0 0 14px' }}>{s.what}</p>
            <pre style={{ background: '#0a0c09', border: '1px solid #1e2420', borderRadius: 7, padding: 14, fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6, margin: '0 0 12px' }}>{s.example}</pre>
            <CodeBlock cmd={s.cmd} label="Run this:" />
          </div>
        );
      })()}
    </div>
  );
}

// ── Order State Machine ───────────────────────────────────────────────────────

function StateMachine() {
  const states = [
    { id: 'PENDING', color: '#60a5fa', x: 0 },
    { id: 'ACCEPTED', color: '#a78bfa', x: 1 },
    { id: 'PREPARING', color: '#f59e0b', x: 2 },
    { id: 'READY', color: '#fb923c', x: 3 },
    { id: 'PICKED_UP', color: '#f97316', x: 4 },
    { id: 'DELIVERED', color: '#22c55e', x: 5 },
  ];
  const valid = ['PENDING→ACCEPTED', 'ACCEPTED→PREPARING', 'PREPARING→READY', 'READY→PICKED_UP', 'PICKED_UP→DELIVERED'];
  const cancel = ['PENDING→CANCELLED', 'ACCEPTED→CANCELLED', 'PREPARING→CANCELLED', 'READY→CANCELLED'];
  const invalid = ['PENDING→DELIVERED', 'DELIVERED→PENDING', 'DELIVERED→CANCELLED', 'PICKED_UP→PENDING'];

  return (
    <div className="adm-card">
      <SectionHeader title="Order State Machine" sub="Legal transitions only. Any other path throws an error. Source: lib/orderStatus.ts" />

      {/* Visual flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '16px 0', marginBottom: 20 }}>
        {states.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ background: `${s.color}18`, border: `2px solid ${s.color}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: s.color, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                {s.id}
              </div>
              {s.id === 'DELIVERED' && <div style={{ fontSize: 10, color: '#22c55e' }}>terminal</div>}
            </div>
            {i < states.length - 1 && (
              <div style={{ height: 2, width: 28, background: 'rgba(255,255,255,0.2)', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', right: -4, top: -4, color: '#555', fontSize: 10 }}>▶</div>
              </div>
            )}
          </div>
        ))}
        {/* Cancelled branch */}
        <div style={{ marginLeft: 24, display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px dashed #333', paddingLeft: 16 }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '2px dashed #ef4444', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>
            CANCELLED
          </div>
          <div style={{ fontSize: 10, color: '#ef4444' }}>terminal</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done Valid Transitions</div>
          {valid.map(t => <div key={t} style={{ fontSize: 12, color: '#aaa', padding: '3px 0', fontFamily: 'monospace' }}>{t.replace('→', ' → ')}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Return Cancel Paths</div>
          {cancel.map(t => <div key={t} style={{ fontSize: 12, color: '#aaa', padding: '3px 0', fontFamily: 'monospace' }}>{t.replace('→', ' → ')}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blocked Forbidden (throws)</div>
          {invalid.map(t => <div key={t} style={{ fontSize: 12, color: '#ef4444', padding: '3px 0', fontFamily: 'monospace', textDecoration: 'line-through', opacity: 0.7 }}>{t.replace('→', ' → ')}</div>)}
        </div>
      </div>

      <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 6, fontSize: 12, color: '#93c5fd' }}>
        Tip Test file: <code>__tests__/order_logic.test.ts</code> — Run with <code>pnpm test --testPathPattern order_logic</code>
      </div>
    </div>
  );
}

// ── Core Logic Invariants ────────────────────────────────────────────────────

function CoreInvariants() {
  const invariants = [
    {
      icon: 'Cost', title: 'Payout Golden Ratio', color: '#f97316',
      rule: '4.2 miles / 12 min wait / $6 tip = $14.94 total',
      breakdown: [
        { label: 'Base', value: '$3.00' },
        { label: 'Distance (4.2 × $0.70)', value: '$2.94' },
        { label: 'Wait (12 × $0.25)', value: '$3.00' },
        { label: 'Tip', value: '$6.00' },
        { label: 'Total', value: '$14.94', bold: true },
      ],
      rule2: 'Surge multiplier ONLY applies to (Base + Distance), NEVER to Wait Pay.',
      test: '__tests__/onboarding_tester_examples.test.ts',
    },
    {
      icon: 'Phone', title: 'Phone E.164 Rule', color: '#a78bfa',
      rule: 'All phone numbers stored as E.164: +1XXXXXXXXXX',
      breakdown: [
        { label: '"(803) 555-1234"', value: '+18035551234' },
        { label: '"803-555-1234"', value: '+18035551234' },
        { label: '"8035551234"', value: '+18035551234' },
        { label: '"1-803-555-1234"', value: '+18035551234' },
      ],
      rule2: 'Required for Twilio/Vonage SMS delivery. Non-E.164 numbers silently fail SMS.',
      test: '__tests__/phone_utils.test.ts',
    },
    {
      icon: 'Map', title: 'Haversine Reference', color: '#60a5fa',
      rule: 'Statue of Liberty → Empire State Building = ~5.1 miles',
      breakdown: [
        { label: 'SoL coords', value: '40.6892°N, 74.0445°W' },
        { label: 'ESB coords', value: '40.7484°N, 73.9857°W' },
        { label: 'Expected', value: '~5.1 miles' },
      ],
      rule2: 'If the Haversine formula changes and this test breaks, driver payout distances are wrong.',
      test: '__tests__/onboarding_tester_examples.test.ts',
    },
  ];

  return (
    <div className="adm-card">
      <SectionHeader title="Core Logic Invariants" sub="These values must NEVER change without updating the corresponding tests. They are the business's source of truth." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {invariants.map((inv) => (
          <div key={inv.title} style={{ background: '#0f1210', border: `1px solid ${inv.color}22`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: inv.color, marginBottom: 10 }}>{inv.icon} {inv.title}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>{inv.rule}</div>
            <div style={{ marginBottom: 10 }}>
              {inv.breakdown.map(b => (
                <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #1a1f1d', fontSize: 12 }}>
                  <span style={{ color: '#666', fontFamily: 'monospace' }}>{b.label}</span>
                  <span style={{ color: (b as any).bold ? '#fff' : '#aaa', fontWeight: (b as any).bold ? 700 : 400, fontFamily: 'monospace' }}>{b.value}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5, marginBottom: 8 }}>{inv.rule2}</div>
            <div style={{ fontSize: 11, color: inv.color, fontFamily: 'monospace', opacity: 0.7 }}>{inv.test}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Test File Map ─────────────────────────────────────────────────────────────

function TestFileMap() {
  const [open, setOpen] = useState<string | null>(null);
  const files = [
    { path: '__tests__/order_logic.test.ts', type: 'Unit', badge: '#60a5fa', desc: 'Order state machine — valid/invalid transitions, terminal states, cancellation rules.', cmd: 'pnpm test --testPathPattern order_logic' },
    { path: '__tests__/lib/payEngine.test.ts', type: 'Unit', badge: '#60a5fa', desc: 'Driver pay calculation — base pay, distance rate, wait pay, batch bonus, surge multiplier, late-night bonus.', cmd: 'pnpm test --testPathPattern payEngine' },
    { path: '__tests__/phone_utils.test.ts', type: 'Unit', badge: '#60a5fa', desc: 'Phone normalization — E.164 formatting, international prefixes, malformed input rejection.', cmd: 'pnpm test --testPathPattern phone_utils' },
    { path: '__tests__/onboarding_tester_examples.test.ts', type: 'Integration', badge: '#a78bfa', desc: 'Full driver payout scenarios including the Golden Ratio and Haversine reference point verification.', cmd: 'pnpm test --testPathPattern onboarding_tester' },
    { path: '__tests__/driver-metrics.test.ts', type: 'Unit', badge: '#60a5fa', desc: 'Driver performance metrics, acceptance rate, on-time delivery scoring.', cmd: 'pnpm test --testPathPattern driver-metrics' },
    { path: '__tests__/security/auth.test.ts', type: 'Security', badge: '#ef4444', desc: 'Auth flows — session validation, RBAC enforcement, brute-force protection, token expiry.', cmd: 'pnpm run test:security' },
    { path: '__tests__/integration/order_flow.test.ts', type: 'Integration', badge: '#a78bfa', desc: 'Full order lifecycle against real Supabase (skips if mock env detected).', cmd: 'pnpm test --testPathPattern integration/order_flow' },
    { path: '__tests__/integration/payout.test.ts', type: 'Integration', badge: '#a78bfa', desc: 'Driver payout settlement with Stripe transfer simulation.', cmd: 'pnpm test --testPathPattern integration/payout' },
    { path: '__tests__/actions/orderActions.test.ts', type: 'Unit', badge: '#60a5fa', desc: 'Server action tests — placeOrder, updateOrderAddress, cancelOrder with mock Supabase.', cmd: 'pnpm test --testPathPattern orderActions' },
    { path: '__tests__/components/MobileNav.test.tsx', type: 'Component', badge: '#22c55e', desc: 'Mobile nav rendering, open/close toggle, active link highlighting.', cmd: 'pnpm test --testPathPattern MobileNav' },
    { path: 'tests/stateAPIs.test.ts', type: 'Unit', badge: '#60a5fa', desc: 'State health inspection API config — NC, NY, FL, PA endpoints, data shape validation.', cmd: 'pnpm test --testPathPattern stateAPIs' },
    { path: 'e2e/checkout.spec.ts', type: 'E2E', badge: '#f97316', desc: 'Full checkout flow — restaurant browse, add to cart, Stripe payment, order confirmation.', cmd: 'pnpm run test:e2e --grep checkout' },
    { path: 'e2e/driver_signup.spec.ts', type: 'E2E', badge: '#f97316', desc: 'Driver application — form submission, document upload, admin queue verification.', cmd: 'pnpm run test:e2e --grep driver_signup' },
    { path: 'e2e/stripe-connect.spec.js', type: 'E2E', badge: '#f97316', desc: 'Stripe Connect onboarding for merchants and drivers.', cmd: 'pnpm run test:e2e --grep stripe-connect' },
    { path: 'e2e/mobile_nav.spec.ts', type: 'E2E', badge: '#f97316', desc: 'Mobile navigation — hamburger menu, drawer, bottom nav across Pixel 5 and iPhone 13.', cmd: 'pnpm run test:e2e --grep mobile_nav' },
  ];

  const typeColors: Record<string, string> = { Unit: '#60a5fa', Integration: '#a78bfa', Security: '#ef4444', Component: '#22c55e', E2E: '#f97316' };

  return (
    <div className="adm-card">
      <SectionHeader title="Test File Map" sub="Click any file to see what it covers and how to run it in isolation." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {files.map((f) => (
          <div key={f.path}>
            <div
              onClick={() => setOpen(open === f.path ? null : f.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: open === f.path ? '#0f1210' : '#0a0c09', border: `1px solid ${open === f.path ? '#2a3028' : '#1a1f1d'}`, borderRadius: 6, cursor: 'pointer', transition: 'all 150ms' }}
            >
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${typeColors[f.type]}15`, color: typeColors[f.type], fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{f.type}</span>
              <code style={{ flex: 1, fontSize: 12, color: '#ccc', fontFamily: 'monospace' }}>{f.path}</code>
              <span style={{ color: '#444', fontSize: 12 }}>{open === f.path ? '▲' : '▼'}</span>
            </div>
            {open === f.path && (
              <div style={{ padding: '12px 14px', background: '#0f1210', border: '1px solid #2a3028', borderTop: 'none', borderRadius: '0 0 6px 6px', marginBottom: 2 }}>
                <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 12px', lineHeight: 1.6 }}>{f.desc}</p>
                <CodeBlock cmd={f.cmd} label="Run in isolation:" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Coverage Gaps ─────────────────────────────────────────────────────────────

function CoverageGaps() {
  const gaps = [
    { priority: 'P0', label: 'API Routes', count: '25 routes', coverage: 0, detail: 'No dedicated tests for /api/v1/sync/menu, /api/compliance/*, /api/admin/*. Failures surface only in production.', fix: 'Add route handler tests using next-test-api-route-handler or direct handler invocation.' },
    { priority: 'P0', label: 'Server Actions', count: '17 actions', coverage: 18, detail: '3 of 17 server actions tested. Missing: auth, driver, rewards, merchant, support, team, pricing.', fix: 'Mock Supabase + Stripe at the boundary. Test each action\'s happy path + common error case.' },
    { priority: 'P1', label: 'Webhook Handlers', count: '6 handlers', coverage: 0, detail: 'Stripe + 5 POS webhooks (Revel, Clover, Square, Toast, Lightspeed) have no unit tests. Signature verification untested.', fix: 'Use stripe.webhooks.generateTestHeaderString() to test the full verify → dispatch path.' },
    { priority: 'P1', label: 'React Components', count: '67 components', coverage: 3, detail: '2 of 67 components have tests. High-risk untested: CheckoutForm, DriverMap, ChatBot, WalletUI.', fix: 'Start with CheckoutForm (payment flow) and WalletUI (payment methods). Use @testing-library/react.' },
    { priority: 'P2', label: 'Coverage Reporting', count: '—', coverage: 0, detail: 'No coverage thresholds enforced. No visibility into what % of lines are actually tested.', fix: 'Add --coverage flag to jest config. Set thresholds: branches: 70, functions: 80, lines: 80.' },
    { priority: 'P2', label: 'Error & Edge Cases', count: 'many', coverage: 0, detail: 'No tests for: network timeouts, DB constraint violations, rate limiting, Stripe API errors, invalid JWT.', fix: 'Add a dedicated __tests__/edge-cases/ folder. Mock fetch/supabase to simulate failure states.' },
  ];

  const priorityColor: Record<string, string> = { P0: '#ef4444', P1: '#f59e0b', P2: '#60a5fa' };

  return (
    <div className="adm-card">
      <SectionHeader title="Coverage Gaps" sub="Ranked by risk. Fix P0s before any major release." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {gaps.map((g) => (
          <div key={g.label} style={{ background: '#0f1210', border: '1px solid #1e2420', borderRadius: 7, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${priorityColor[g.priority]}15`, color: priorityColor[g.priority], fontWeight: 800 }}>{g.priority}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0' }}>{g.label}</span>
              <span style={{ fontSize: 11, color: '#555' }}>{g.count}</span>
              {g.coverage > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#f59e0b' }}>{g.coverage}% covered</span>
              )}
              {g.coverage === 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#ef4444' }}>0% covered</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#777', lineHeight: 1.6, marginBottom: 8 }}>{g.detail}</div>
            <div style={{ fontSize: 12, color: '#60a5fa', lineHeight: 1.5 }}>
              <span style={{ color: '#444' }}>Fix: </span>{g.fix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Release QA Checklist ──────────────────────────────────────────────────────

function ReleaseChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const sections = [
    {
      title: 'Review Before Opening a PR', items: [
        { id: 'unit', label: 'All unit tests pass locally (pnpm test)' },
        { id: 'security', label: 'Security tests pass (pnpm run test:security)' },
        { id: 'tsc', label: 'TypeScript compiles cleanly (npx tsc --noEmit)' },
        { id: 'testmode', label: '.env.local is using test-mode Stripe keys (sk_test_...)' },
        { id: 'newtest', label: 'New feature has at least one unit test covering the happy path' },
        { id: 'invariants', label: 'Core invariants still pass (Golden Ratio, E.164, Haversine)' },
      ]
    },
    {
      title: 'Test QA on Preview Branch', items: [
        { id: 'stripe_cli', label: 'Stripe CLI is running and forwarding to /api/webhook/stripe' },
        { id: 'checkout', label: 'Checkout flow tested with 4242 4242 4242 4242 (success)' },
        { id: 'decline', label: 'Checkout flow tested with 4000 0000 0000 0002 (declined — shows error gracefully)' },
        { id: 'merchant_onboard', label: 'Merchant onboarding tested end-to-end (Connect → dashboard)' },
        { id: 'driver_onboard', label: 'Driver signup tested end-to-end (form → document upload → admin queue)' },
        { id: 'mobile', label: 'Mobile layouts verified on Pixel 5 and iPhone 13 screen sizes' },
        { id: 'order_flow', label: 'Order placed → accepted → prepared → delivered (full happy path)' },
      ]
    },
    {
      title: 'Launch Before Merging to Main', items: [
        { id: 'e2e', label: 'E2E tests pass on preview URL (pnpm run test:e2e)' },
        { id: 'no_mock', label: 'No mock data seeded to preview Supabase that will bleed to prod' },
        { id: 'env_vars', label: 'Any new env vars added to Vercel project settings' },
        { id: 'live_keys', label: 'Production env uses pk_live + sk_live keys (no pk_test in .env.production)' },
        { id: 'webhook_secret', label: 'STRIPE_WEBHOOK_SECRET is set in production Vercel env' },
        { id: 'release_note', label: 'Brief release note added to ClickUp describing what changed and what was tested' },
      ]
    },
  ];

  const total = sections.flatMap(s => s.items).length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="adm-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="adm-card-title" style={{ margin: 0 }}>Release QA Checklist</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Track what's been verified before merging. Resets on page reload — use it as a working checklist.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: pct === 100 ? '#22c55e' : pct > 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</div>
          <div style={{ fontSize: 11, color: '#555' }}>{done}/{total} done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#1e2420', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : pct > 50 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'all 300ms' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map(section => (
          <div key={section.title}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.items.map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 6, background: checked[item.id] ? 'rgba(34,197,94,0.05)' : 'transparent', border: `1px solid ${checked[item.id] ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)'}`, transition: 'all 150ms' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked[item.id] ? '#22c55e' : '#333'}`, background: checked[item.id] ? '#22c55e' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', cursor: 'pointer' }}
                    onClick={() => toggle(item.id)}>
                    {checked[item.id] && <span style={{ width: 5, height: 8, borderRight: '2px solid #000', borderBottom: '2px solid #000', transform: 'rotate(45deg)', marginTop: -2 }} />}
                  </div>
                  <span style={{ fontSize: 13, color: checked[item.id] ? '#666' : '#ccc', textDecoration: checked[item.id] ? 'line-through' : 'none', lineHeight: 1.5, transition: 'all 150ms' }}
                    onClick={() => toggle(item.id)}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setChecked({})}
        style={{ marginTop: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#555', borderRadius: 5, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}
      >
        Reset checklist
      </button>
    </div>
  );
}

// ── Test Commands ─────────────────────────────────────────────────────────────

function TestCommands() {
  const commands = [
    { label: 'Run all unit tests', cmd: 'pnpm test' },
    { label: 'Run in watch mode (re-runs on save)', cmd: 'pnpm test --watch' },
    { label: 'Run security tests only', cmd: 'pnpm run test:security' },
    { label: 'Run a single file', cmd: 'pnpm test --testPathPattern payEngine' },
    { label: 'Run a single test by name', cmd: "pnpm test -t 'Golden Ratio'" },
    { label: 'Run with coverage report', cmd: 'pnpm test --coverage' },
    { label: 'Run E2E tests (Playwright)', cmd: 'pnpm run test:e2e' },
    { label: 'Run E2E in headed mode (see the browser)', cmd: 'pnpm run test:e2e --headed' },
    { label: 'Run specific E2E spec', cmd: 'pnpm run test:e2e e2e/checkout.spec.ts' },
    { label: 'Type-check without building', cmd: 'npx tsc --noEmit' },
    { label: 'Open Playwright report after run', cmd: 'npx playwright show-report' },
  ];

  return (
    <div className="adm-card">
      <SectionHeader title="Test Commands" sub="All commands from the project root. Copy and run directly." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {commands.map(c => <CodeBlock key={c.cmd} cmd={c.cmd} label={c.label} />)}
      </div>
    </div>
  );
}

// ── Environment Rules ─────────────────────────────────────────────────────────

function EnvRules() {
  const envs = [
    {
      name: 'Local Dev', file: '.env.local', color: '#60a5fa',
      rules: [
        'Done Use sk_test_ / pk_test_ Stripe keys',
        'Done Use real Supabase project (development schema)',
        'Done Stripe CLI forwards webhooks locally',
        'Done Mock users, mock drivers allowed',
        'Done QA tooling and test seed scripts OK',
        'Blocked Never paste sk_live_ keys here',
      ]
    },
    {
      name: 'Preview (Vercel)', file: 'Vercel env → Preview', color: '#f59e0b',
      rules: [
        'Done Use sk_test_ / pk_test_ Stripe keys',
        'Done Full Stripe Connect flows testable',
        'Done QA testing against branch deployments',
        'Blocked No mock data that will bleed to prod DB',
        'Blocked No real customer data in test flows',
        'Blocked No live Stripe keys',
      ]
    },
    {
      name: 'Production', file: '.env.production + Vercel', color: '#22c55e',
      rules: [
        'Done sk_live_ / pk_live_ Stripe keys only',
        'Done Real customer data, real transactions',
        'Done STRIPE_WEBHOOK_SECRET required',
        'Blocked No mock users or mock drivers',
        'Blocked No QA tooling or seed scripts',
        'Blocked No test cards — all charges are real money',
      ]
    },
  ];

  return (
    <div className="adm-card">
      <SectionHeader title="Environment Rules" sub="What's allowed in each environment. Production is sacred." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
        {envs.map(env => (
          <div key={env.name} style={{ background: '#0f1210', border: `1px solid ${env.color}22`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: env.color, marginBottom: 4 }}>{env.name}</div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12, fontFamily: 'monospace' }}>{env.file}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {env.rules.map(r => (
                <div key={r} style={{ fontSize: 12, color: r.startsWith('Blocked') ? '#ef444488' : '#888', lineHeight: 1.5 }}>{r}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dev Setup Tab ─────────────────────────────────────────────────────────────

function DevSetup() {
  const layers = [
    { name: 'Pages & Layouts', path: 'app/', color: '#f97316', desc: 'Next.js App Router. Each folder = a route. Server components by default.' },
    { name: 'Server Actions', path: 'app/*/actions.ts', color: '#fb923c', desc: 'Async functions with "use server". Called from client components. Handle DB writes, auth, Stripe.' },
    { name: 'API Routes', path: 'app/api/**', color: '#f59e0b', desc: 'REST endpoints — webhooks (Stripe, POS), POS menu sync, admin ops. Use NextResponse.' },
    { name: 'Components', path: 'components/', color: '#60a5fa', desc: 'Reusable UI. /admin for admin portal, /ui for base elements, root for shared app components.' },
    { name: 'Lib / Utilities', path: 'lib/', color: '#a78bfa', desc: 'All business logic: payEngine, stripe, supabase clients, RBAC, email, SMS, orderStatus, stateAPIs.' },
    { name: 'Hooks', path: 'hooks/', color: '#34d399', desc: 'Custom React hooks — useDriverLocation, useOrderStatus, useGoogleMaps, etc.' },
    { name: 'Tests', path: '__tests__/ + e2e/', color: '#22c55e', desc: 'Jest unit/integration in __tests__. Playwright E2E in e2e/. Run pnpm test and pnpm run test:e2e.' },
  ];

  const patterns = [
    {
      title: 'Lazy SDK Initialization', color: '#f97316',
      code: `// Done DO — lazy init, defers until first request
let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

// Cancelled DON'T — module-level init breaks Next.js build
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);`,
      why: 'Module-level SDK calls run at build time when env vars may be empty, crashing the Vercel build. Always defer with a getter.',
    },
    {
      title: 'Auth + RBAC in Pages', color: '#60a5fa',
      code: `// Every admin page follows this pattern
export default async function SomePage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const { isAuth, role } = await getAuthSession();
  const ok = !!adminSession || (isAuth && canAccessAdminSection(role, 'section-name'));
  if (!ok) redirect('/admin/login');
  // ... render
}`,
      why: 'getAuthSession() checks the Supabase session. canAccessAdminSection() checks RBAC role permissions from lib/rbac.ts.',
    },
    {
      title: 'Supabase Admin vs Anon', color: '#a78bfa',
      code: `// Use supabaseAdmin (service role) for server-side writes
import { supabaseAdmin } from '@/lib/supabase-admin';
await supabaseAdmin.from('Restaurant').update({...}).eq('id', id);

// Use supabase (anon key) for client-side or public reads
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('MenuItem').select('*');`,
      why: 'supabaseAdmin bypasses RLS — only use in server actions and API routes. Never import in client components.',
    },
    {
      title: 'Server Actions Pattern', color: '#34d399',
      code: `'use server';
import { getAuthSession } from '@/app/auth/actions';

export async function updateSomething(id: string, data: any) {
  const { isAuth, userId } = await getAuthSession();
  if (!isAuth) return { error: 'Unauthorized' };

  const { error } = await supabaseAdmin
    .from('SomeTable').update(data).eq('id', id);

  if (error) return { error: error.message };
  return { success: true };
}`,
      why: 'Always verify auth at the top of every server action. Return { error } or { success } — never throw to the client.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Local Setup */}
      <div className="adm-card">
        <SectionHeader title="Local Dev Setup" sub="Get the project running from scratch in under 5 minutes." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '1. Clone the repo', cmd: 'git clone https://github.com/your-org/trueserve-website.git && cd trueserve-website' },
            { label: '2. Install dependencies', cmd: 'pnpm install' },
            { label: '3. Copy env file (get values from 1Password / team lead)', cmd: 'cp .env.example .env.local' },
            { label: '4. Start the dev server', cmd: 'pnpm dev' },
            { label: '5. Open the app', cmd: 'open http://localhost:3000' },
            { label: '6. Start Stripe webhook forwarding (new terminal)', cmd: 'stripe listen --forward-to localhost:3000/api/webhook/stripe' },
            { label: '7. Run tests to confirm setup', cmd: 'pnpm test' },
          ].map(item => <CodeBlock key={item.cmd} cmd={item.cmd} label={item.label} />)}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 7, fontSize: 12, color: '#fb923c' }}>
          Warning <strong>Required env vars:</strong> NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY (sk_test_...), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </div>
      </div>

      {/* App Architecture */}
      <div className="adm-card">
        <SectionHeader title="App Architecture" sub="Next.js 16 App Router. Each layer has a clear responsibility." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {layers.map((layer, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: '#0f1210', border: '1px solid #1e2420', borderRadius: 7 }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: layer.color, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0' }}>{layer.name}</span>
                  <code style={{ fontSize: 11, color: layer.color, fontFamily: 'monospace', opacity: 0.8 }}>{layer.path}</code>
                </div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{layer.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Patterns */}
      <div className="adm-card">
        <SectionHeader title="Key Code Patterns" sub="Patterns used throughout the codebase. Follow these consistently." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {patterns.map(p => (
            <div key={p.title} style={{ background: '#0f1210', border: `1px solid ${p.color}22`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 8 }}>{p.title}</div>
              <pre style={{ background: '#0a0c09', border: '1px solid #1e2420', borderRadius: 6, padding: 12, fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6, margin: '0 0 10px' }}>{p.code}</pre>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}><span style={{ color: '#444' }}>Why: </span>{p.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch & PR Workflow */}
      <div className="adm-card">
        <SectionHeader title="Branch & PR Workflow" sub="How work moves from your machine to production." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { step: '1', title: 'Branch off main', color: '#60a5fa', desc: 'Always create feature branches from main, not from other feature branches.', cmd: 'git checkout main && git pull && git checkout -b feature/your-feature' },
            { step: '2', title: 'Write test first', color: '#ef4444', desc: 'RED phase — write the failing test before touching implementation.', cmd: 'pnpm test --watch' },
            { step: '3', title: 'Implement & pass', color: '#f59e0b', desc: 'GREEN phase — minimal code to make the test pass.', cmd: 'pnpm test' },
            { step: '4', title: 'Type check + lint', color: '#a78bfa', desc: 'Run before pushing. Fix any TS errors — do not use // @ts-ignore.', cmd: 'npx tsc --noEmit' },
            { step: '5', title: 'Push & open PR', color: '#22c55e', desc: 'Vercel auto-creates a preview URL for every branch push.', cmd: 'git push origin feature/your-feature' },
            { step: '6', title: 'QA on preview', color: '#f97316', desc: 'Use the Release QA checklist before requesting review.', cmd: 'pnpm run test:e2e' },
          ].map(s => (
            <div key={s.step} style={{ background: '#0f1210', border: `1px solid ${s.color}22`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 800, marginBottom: 4 }}>STEP {s.step}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 10, lineHeight: 1.5 }}>{s.desc}</div>
              <CodeBlock cmd={s.cmd} />
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 7, fontSize: 12, color: '#93c5fd' }}>
          Tip <strong>Branch naming:</strong> <code>feature/</code> for new features · <code>fix/</code> for bug fixes · <code>chore/</code> for maintenance · <code>hotfix/</code> for urgent production fixes
        </div>
      </div>

      {/* Code Conventions */}
      <div className="adm-card">
        <SectionHeader title="Code Conventions" sub="Consistency rules across the codebase." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { title: 'TypeScript', rules: ['No any — use proper types or unknown', 'No // @ts-ignore — fix the type error', 'Use type for unions, interface for objects', 'Explicit return types on server actions'] },
            { title: 'Imports', rules: ['@/ alias for all internal imports', 'Group: React → Next → external → internal', 'No default exports from lib/ files', 'Named exports only in actions.ts files'] },
            { title: 'File Naming', rules: ['Components: PascalCase.tsx', 'Utilities: camelCase.ts', 'API routes: route.ts (Next.js convention)', 'Test files: ComponentName.test.ts(x)'] },
            { title: 'Error Handling', rules: ['Server actions return { error } or { success }', 'Never throw to the client from a server action', 'Log errors to Sentry in API routes', 'Show user-friendly messages, log technical details'] },
            { title: 'Database', rules: ['Use supabaseAdmin for server writes', 'Use supabase (anon) for client reads', 'Always check for error before using data', 'Never store passwords or raw PII in DB'] },
            { title: 'Styling', rules: ['Admin portal: adm-* CSS classes', 'Customer UI: Tailwind utility classes', 'Homepage: food-* classes in globals.css', 'No inline styles in new components (except admin)'] },
          ].map(section => (
            <div key={section.title} style={{ background: '#0f1210', border: '1px solid #1e2420', borderRadius: 7, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0', marginBottom: 10 }}>{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {section.rules.map(r => (
                  <div key={r} style={{ fontSize: 12, color: '#666', lineHeight: 1.5, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#333', flexShrink: 0 }}>·</span>{r}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

function MockData() {
  const [activeSection, setActiveSection] = useState<'seed' | 'factories' | 'supabase' | 'reset'>('seed');

  const seedScripts = [
    { label: 'Seed all mock data (customers, drivers, merchants, orders)', cmd: 'pnpm run seed:all' },
    { label: 'Seed customers only', cmd: 'pnpm run seed:customers' },
    { label: 'Seed drivers only', cmd: 'pnpm run seed:drivers' },
    { label: 'Seed merchants + menu items', cmd: 'pnpm run seed:merchants' },
    { label: 'Seed mock orders (50 across all states)', cmd: 'pnpm run seed:orders' },
    { label: 'Wipe all mock data (local dev only)', cmd: 'pnpm run seed:reset' },
    { label: 'Reseed from scratch', cmd: 'pnpm run seed:reset && pnpm run seed:all' },
  ];

  const factories = [
    {
      title: 'createMockOrder()',
      color: '#60a5fa',
      code: `// __tests__/factories/order.ts
import { createMockOrder } from '@/tests/factories/order';

// Default — creates a PENDING order
const order = createMockOrder();

// Override any field
const deliveredOrder = createMockOrder({
  status: 'DELIVERED',
  total: 29.99,
  driverId: 'driver-uuid-123',
  restaurantId: 'restaurant-uuid-456',
});

// Batch — create 10 orders in different states
const orders = Array.from({ length: 10 }, (_, i) =>
  createMockOrder({ status: ['PENDING','ACCEPTED','PREPARING','DELIVERED'][i % 4] })
);`,
      note: 'Factories always return fully-typed objects. No partial mocks — every required field has a sensible default.',
    },
    {
      title: 'createMockDriver()',
      color: '#a78bfa',
      code: `// __tests__/factories/driver.ts
import { createMockDriver } from '@/tests/factories/driver';

// Approved driver ready to receive orders
const driver = createMockDriver({ status: 'APPROVED' });

// Pending driver waiting for document review
const pendingDriver = createMockDriver({
  status: 'PENDING',
  documents: { license: null, insurance: null },
});

// Driver with location (for map/routing tests)
const driverWithLoc = createMockDriver({
  lat: 35.2271,
  lng: -80.8431, // Charlotte, NC
  isOnline: true,
});`,
      note: 'Use createMockDriver({ isOnline: true }) in DriverMap and routing tests — location fields are required.',
    },
    {
      title: 'createMockMerchant()',
      color: '#f97316',
      code: `// __tests__/factories/merchant.ts
import { createMockMerchant } from '@/tests/factories/merchant';

// Active merchant with a menu
const merchant = createMockMerchant({ status: 'ACTIVE', menuItemCount: 10 });

// Merchant pending onboarding review
const pendingMerchant = createMockMerchant({
  status: 'PENDING',
  stripeConnectId: null,
});

// Merchant with Stripe Connect already complete
const stripeMerchant = createMockMerchant({
  stripeConnectId: 'acct_test_123456',
  payoutsEnabled: true,
});`,
      note: 'Setting menuItemCount auto-generates that many MenuItem rows linked to the restaurant.',
    },
    {
      title: 'createMockCustomer()',
      color: '#22c55e',
      code: `// __tests__/factories/customer.ts
import { createMockCustomer } from '@/tests/factories/customer';

// Basic customer
const customer = createMockCustomer();

// Customer with saved addresses
const customerWithAddresses = createMockCustomer({
  addresses: [
    { label: 'Home', address: '123 Main St, Charlotte NC 28201', isDefault: true },
    { label: 'Work', address: '456 Trade St, Charlotte NC 28202' },
  ],
});

// Customer with wallet balance (for reward testing)
const rewardsCustomer = createMockCustomer({
  walletBalance: 15.00,
  rewardPoints: 420,
});`,
      note: 'createMockCustomer() never creates a real Supabase auth user — it only inserts a Customer row with a mock userId.',
    },
  ];

  const supabasePatterns = [
    {
      title: 'Mock Supabase in Unit Tests',
      color: '#60a5fa',
      code: `// jest.setup.ts — global mock for all unit tests
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
    }),
  },
}));

// Per-test override
it('returns error when order not found', async () => {
  (supabaseAdmin.from as jest.Mock).mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
  });
  const result = await getOrder('fake-id');
  expect(result.error).toBe('Not found');
});`,
      note: 'Unit tests never hit the real DB. Integration tests (integration/ folder) use a real test Supabase project.',
    },
    {
      title: 'Mock Stripe in Tests',
      color: '#a78bfa',
      code: `// Mock the entire Stripe module
jest.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        status: 'requires_payment_method',
      }),
      confirm: jest.fn().mockResolvedValue({ status: 'succeeded' }),
    },
    transfers: {
      create: jest.fn().mockResolvedValue({ id: 'tr_test_456' }),
    },
  }),
}));

// For webhook tests — generate a real Stripe test signature
import Stripe from 'stripe';
const payload = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: mockPI } });
const signature = stripe.webhooks.generateTestHeaderString({
  payload, secret: process.env.STRIPE_WEBHOOK_SECRET!,
});`,
      note: 'Never use real Stripe API calls in unit tests. Use generateTestHeaderString() for webhook handler tests.',
    },
    {
      title: 'Environment Detection in Code',
      color: '#22c55e',
      code: `// lib/env.ts — helpers to detect mock/test context
export const isMockEnv = () =>
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
  process.env.NODE_ENV === 'test';

export const isTestEnv = () => process.env.NODE_ENV === 'test';

// Use in server actions to skip real DB in test runs
export async function placeOrder(data: OrderInput) {
  if (isMockEnv()) {
    return { success: true, orderId: 'mock-order-' + Date.now() };
  }
  // real implementation...
}

// .env.local — turn on mock mode for full UI testing without real DB
NEXT_PUBLIC_MOCK_MODE=true`,
      note: 'NEXT_PUBLIC_MOCK_MODE=true makes the UI fully interactive with fake data — no Supabase or Stripe calls are made.',
    },
  ];

  const resetCommands = [
    { label: 'Wipe and reseed dev DB (local only — never run on prod)', cmd: 'pnpm run seed:reset && pnpm run seed:all' },
    { label: 'Reset only orders (keep users/merchants)', cmd: 'pnpm run seed:reset:orders' },
    { label: 'Check which mock records exist', cmd: 'pnpm run seed:status' },
    { label: 'Clear all mock Stripe test data (Stripe Dashboard → Test Data → Reset)', cmd: 'stripe fixtures reset' },
    { label: 'List active Stripe test customers', cmd: 'stripe customers list --limit 20' },
    { label: 'Trigger a webhook event manually', cmd: 'stripe trigger payment_intent.succeeded' },
    { label: 'Trigger checkout.session.completed', cmd: 'stripe trigger checkout.session.completed' },
  ];

  const sidebarItems = [
    { id: 'seed' as const, label: 'Seed Scripts' },
    { id: 'factories' as const, label: 'Data Factories' },
    { id: 'supabase' as const, label: 'Mocking Patterns' },
    { id: 'reset' as const, label: 'Reset & Inspect' },
  ];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Sidebar */}
      <div style={{ width: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              padding: '9px 12px', borderRadius: 6, textAlign: 'left', cursor: 'pointer', transition: 'all 150ms',
              border: activeSection === item.id ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.05)',
              background: activeSection === item.id ? 'rgba(249,115,22,0.08)' : 'transparent',
              color: activeSection === item.id ? '#f97316' : '#666',
              fontSize: 13, fontWeight: 600,
            }}
          >
            {item.label}
          </button>
        ))}
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 7, fontSize: 11, color: '#4ade80', lineHeight: 1.6 }}>
          Mock data is <strong>only</strong> allowed in Local Dev and Preview envs. Never in Production.
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {activeSection === 'seed' && (
          <div className="adm-card">
            <SectionHeader title="Seed Scripts" sub="Run these from the project root to populate your local or preview DB with realistic test data." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {seedScripts.map(s => <CodeBlock key={s.cmd} cmd={s.cmd} label={s.label} />)}
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 7 }}>
              <div style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.7 }}>
                Tip <strong>How seeds work:</strong> Scripts live in <code>scripts/seed/</code>. They use <code>supabaseAdmin</code> to insert rows directly, bypassing RLS. Each entity is tagged with <code>is_mock: true</code> so they can be bulk-deleted without touching real data.
              </div>
            </div>
          </div>
        )}

        {activeSection === 'factories' && (
          <div className="adm-card">
            <SectionHeader title="Data Factories" sub="Import and call these helpers in any test file to get a fully-typed mock entity in one line." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {factories.map(f => (
                <div key={f.title} style={{ background: '#0f1210', border: `1px solid ${f.color}22`, borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: f.color, marginBottom: 10 }}>{f.title}</div>
                  <pre style={{ background: '#0a0c09', border: '1px solid #1e2420', borderRadius: 6, padding: 12, fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6, margin: '0 0 10px' }}>{f.code}</pre>
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                    <span style={{ color: '#444' }}>Note: </span>{f.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'supabase' && (
          <div className="adm-card">
            <SectionHeader title="Mocking Patterns" sub="How to isolate tests from real Supabase and Stripe — so unit tests are fast and deterministic." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {supabasePatterns.map(p => (
                <div key={p.title} style={{ background: '#0f1210', border: `1px solid ${p.color}22`, borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 10 }}>{p.title}</div>
                  <pre style={{ background: '#0a0c09', border: '1px solid #1e2420', borderRadius: 6, padding: 12, fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6, margin: '0 0 10px' }}>{p.code}</pre>
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                    <span style={{ color: '#444' }}>Note: </span>{p.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'reset' && (
          <div className="adm-card">
            <SectionHeader title="Reset & Inspect" sub="Commands to wipe mock data, check what exists, and trigger Stripe test events." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {resetCommands.map(c => <CodeBlock key={c.cmd} cmd={c.cmd} label={c.label} />)}
            </div>
            <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7 }}>
              <div style={{ fontSize: 12, color: '#f87171', lineHeight: 1.7 }}>
                ⛔ <strong>NEVER run seed:reset against the production database.</strong> Seeds check for <code>NODE_ENV !== 'production'</code> and will throw before executing, but you should still double-check your <code>.env.local</code> Supabase URL before running any destructive command.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Onboarding Hub ────────────────────────────────────────────────────────────

function OnboardingHub() {
  const [activeSection, setActiveSection] = useState<'checklist' | 'troubleshooting' | 'schema'>('checklist');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const days = [
    {
      day: 'Day 1', color: '#60a5fa', items: [
        { id: 'd1_github', label: 'Get added to TrueServe-LLC GitHub org (ask team lead)' },
        { id: 'd1_clone', label: 'Clone the repo: git clone https://github.com/TrueServe-LLC/-trueserve-website.git' },
        { id: 'd1_1pass', label: 'Get 1Password team invite — all env credentials live here' },
        { id: 'd1_env', label: 'Copy .env.example → .env.local and fill in values from 1Password' },
        { id: 'd1_install', label: 'Run: pnpm install && pnpm dev — confirm app loads at localhost:3000' },
        { id: 'd1_tests', label: 'Run: pnpm test — confirm all unit tests pass locally' },
        { id: 'd1_slack', label: 'Join Slack: #dev, #qa, #deployments, #alerts channels' },
      ]
    },
    {
      day: 'Day 2', color: '#a78bfa', items: [
        { id: 'd2_supabase', label: 'Get Supabase project invite (dev schema access only)' },
        { id: 'd2_vercel', label: 'Get added to Vercel team (true-serve-llc org)' },
        { id: 'd2_stripe', label: 'Get Stripe test-mode API keys from 1Password' },
        { id: 'd2_stripe_cli', label: 'Install Stripe CLI + run: stripe listen --forward-to localhost:3000/api/webhook/stripe' },
        { id: 'd2_seed', label: 'Run: pnpm run seed:all — seed local DB with mock data' },
        { id: 'd2_admin', label: 'Log into admin portal at localhost:3000/admin — confirm access' },
        { id: 'd2_devhub', label: 'Read the TDD Guide and Dev Setup tabs in this portal' },
      ]
    },
    {
      day: 'Day 3', color: '#f97316', items: [
        { id: 'd3_schema', label: 'Review the Database Schema section in this portal (Onboarding → Schema Map)' },
        { id: 'd3_branch', label: 'Create your first feature branch: git checkout -b feature/your-name-hello-world' },
        { id: 'd3_test', label: 'Write a small unit test (TDD Red phase) — even a trivial one to confirm the flow works' },
        { id: 'd3_pr', label: 'Open a draft PR — confirm Vercel preview URL generates automatically' },
        { id: 'd3_e2e', label: 'Run E2E tests on the preview URL: pnpm run test:e2e' },
        { id: 'd3_meet', label: 'Sync with team lead: confirm access, raise any blockers, agree on first real ticket' },
      ]
    },
    {
      day: 'QA-Specific', color: '#22c55e', items: [
        { id: 'qa_stripe', label: 'Bookmark the Stripe Testing tab in this portal — all test cards are there' },
        { id: 'qa_mock', label: 'Review the Mock Data tab — use seed scripts before every test run' },
        { id: 'qa_checklist', label: 'Review the Release QA Checklist tab — this is your sign-off checklist before every merge' },
        { id: 'qa_devices', label: 'Set up Chrome DevTools presets: Pixel 5 and iPhone 13 (minimum mobile devices to test)' },
        { id: 'qa_playwright', label: 'Install Playwright browsers: npx playwright install' },
        { id: 'qa_report', label: 'Run E2E + open report: pnpm run test:e2e && npx playwright show-report' },
        { id: 'qa_flags', label: 'Get familiar with Feature Switches in the admin portal — QA uses flags to isolate features' },
      ]
    },
  ];

  const totalItems = days.flatMap(d => d.items).length;
  const doneItems = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneItems / totalItems) * 100);

  const faqs = [
    {
      error: 'Error: supabase is not defined / NEXT_PUBLIC_SUPABASE_URL missing',
      color: '#ef4444',
      cause: '.env.local is missing or the env var name is wrong.',
      fix: 'Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy them from 1Password. Restart the dev server after editing .env.local — Next.js does not hot-reload env files.',
      cmd: 'pnpm dev',
    },
    {
      error: 'Stripe webhook: No signatures found matching the expected signature',
      color: '#ef4444',
      cause: 'STRIPE_WEBHOOK_SECRET in .env.local does not match the secret Stripe CLI printed when you ran stripe listen.',
      fix: 'Re-run stripe listen and copy the "webhook signing secret" it prints (whsec_...) into your .env.local as STRIPE_WEBHOOK_SECRET. Restart the dev server.',
      cmd: 'stripe listen --forward-to localhost:3000/api/webhook/stripe',
    },
    {
      error: 'Supabase RLS: new row violates row-level security policy',
      color: '#f59e0b',
      cause: 'You are using the anon Supabase client (supabase) for a write that requires the service role.',
      fix: 'Switch to supabaseAdmin from @/lib/supabase-admin in your server action or API route. Never use supabaseAdmin in client components.',
      cmd: "import { supabaseAdmin } from '@/lib/supabase-admin';",
    },
    {
      error: 'Vercel build error: Cannot find module or its corresponding type declarations',
      color: '#f59e0b',
      cause: 'A new env var or import is referenced but not available at build time.',
      fix: 'Add the env var to Vercel project settings (Settings → Environment Variables) for the Preview environment. For imports, check the @/ alias resolves correctly in tsconfig.json.',
      cmd: 'npx tsc --noEmit',
    },
    {
      error: 'pnpm test fails: Cannot find module @/lib/...',
      color: '#f59e0b',
      cause: 'Jest moduleNameMapper is not configured for the @/ alias.',
      fix: 'Check jest.config.ts has moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" }. This maps the @/ alias to the project root for test runs.',
      cmd: 'cat jest.config.ts',
    },
    {
      error: 'Google Maps blank / "This page can\'t load Google Maps correctly"',
      color: '#60a5fa',
      cause: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing or the key has no Maps JavaScript API enabled.',
      fix: 'Add the key to .env.local. In Google Cloud Console, confirm "Maps JavaScript API" and "Directions API" are both enabled for the key. Also add localhost:3000 to allowed referrers.',
      cmd: '',
    },
    {
      error: 'Admin portal redirects to /admin/login even with correct credentials',
      color: '#60a5fa',
      cause: 'The admin_session cookie or Supabase session has expired, or the role in the DB does not match an ADMIN_ROLES entry.',
      fix: 'Clear cookies and log in again. If it persists, check the user\'s role field in the Supabase profiles table — it must be one of: ADMIN, PM, OPS, SUPPORT, FINANCE, READONLY, QA_TESTER.',
      cmd: '',
    },
    {
      error: 'pnpm run test:e2e fails: browserType.launch: Executable doesn\'t exist',
      color: '#a78bfa',
      cause: 'Playwright browsers have not been installed on this machine.',
      fix: 'Run the install command below. This downloads Chromium, Firefox, and WebKit — takes ~2 minutes. Only needed once per machine.',
      cmd: 'npx playwright install',
    },
  ];

  const tables = [
    {
      name: 'profiles', color: '#60a5fa', desc: 'One row per authenticated user. Linked to Supabase auth.users via userId.',
      cols: [
        { col: 'id', type: 'uuid', note: 'Primary key' },
        { col: 'userId', type: 'uuid', note: 'FK → auth.users.id' },
        { col: 'role', type: 'AppRole', note: 'ADMIN | PM | OPS | SUPPORT | FINANCE | READONLY | QA_TESTER | MERCHANT | DRIVER | CUSTOMER' },
        { col: 'email', type: 'text', note: 'Mirrors auth.users.email' },
        { col: 'fullName', type: 'text', note: '' },
        { col: 'phone', type: 'text', note: 'E.164 format (+1XXXXXXXXXX)' },
        { col: 'createdAt', type: 'timestamptz', note: '' },
      ]
    },
    {
      name: 'Restaurant', color: '#f97316', desc: 'Merchant/restaurant accounts. Linked to a Stripe Connect account for payouts.',
      cols: [
        { col: 'id', type: 'uuid', note: 'Primary key' },
        { col: 'ownerId', type: 'uuid', note: 'FK → profiles.id' },
        { col: 'name', type: 'text', note: '' },
        { col: 'status', type: 'text', note: 'PENDING | ACTIVE | SUSPENDED' },
        { col: 'stripeConnectId', type: 'text', note: 'acct_... from Stripe Connect onboarding' },
        { col: 'address', type: 'text', note: '' },
        { col: 'lat / lng', type: 'float8', note: 'Used for proximity search and delivery fee calc' },
        { col: 'is_mock', type: 'bool', note: 'True for seeded test data — never in prod' },
      ]
    },
    {
      name: 'MenuItem', color: '#fb923c', desc: 'Menu items belonging to a Restaurant. Synced from POS (Revel, Clover, Square, Toast, Lightspeed) or created manually.',
      cols: [
        { col: 'id', type: 'uuid', note: 'Primary key' },
        { col: 'restaurantId', type: 'uuid', note: 'FK → Restaurant.id' },
        { col: 'name', type: 'text', note: '' },
        { col: 'price', type: 'numeric', note: 'Always stored in dollars (not cents)' },
        { col: 'category', type: 'text', note: 'e.g. Burgers, Sides, Drinks' },
        { col: 'available', type: 'bool', note: 'False hides item from customer app' },
        { col: 'posItemId', type: 'text', note: 'External POS item ID for sync matching' },
      ]
    },
    {
      name: 'Order', color: '#a78bfa', desc: 'Core order record. Status transitions follow the state machine in the TDD Guide tab.',
      cols: [
        { col: 'id', type: 'uuid', note: 'Primary key' },
        { col: 'customerId', type: 'uuid', note: 'FK → profiles.id' },
        { col: 'restaurantId', type: 'uuid', note: 'FK → Restaurant.id' },
        { col: 'driverId', type: 'uuid', note: 'FK → profiles.id (nullable until assigned)' },
        { col: 'status', type: 'text', note: 'PENDING | ACCEPTED | PREPARING | READY | PICKED_UP | DELIVERED | CANCELLED' },
        { col: 'total', type: 'numeric', note: 'Final charge amount in dollars' },
        { col: 'deliveryFee', type: 'numeric', note: 'Calculated by payEngine based on distance' },
        { col: 'stripePaymentIntentId', type: 'text', note: 'pi_... Links to Stripe charge' },
        { col: 'deliveryAddress', type: 'text', note: 'Customer drop-off address' },
        { col: 'deliveryPin', type: 'text', note: '4-digit PIN for contactless handoff confirmation' },
        { col: 'createdAt', type: 'timestamptz', note: '' },
      ]
    },
    {
      name: 'Driver', color: '#34d399', desc: 'Driver profile, approval status, and real-time location. Separate from profiles — linked via userId.',
      cols: [
        { col: 'id', type: 'uuid', note: 'Primary key' },
        { col: 'userId', type: 'uuid', note: 'FK → profiles.id' },
        { col: 'status', type: 'text', note: 'PENDING | APPROVED | REJECTED | SUSPENDED' },
        { col: 'lat / lng', type: 'float8', note: 'Updated in real-time via RAMEN SSE push' },
        { col: 'isOnline', type: 'bool', note: 'True when driver is accepting orders' },
        { col: 'stripeConnectId', type: 'text', note: 'For driver payout transfers' },
        { col: 'licenseUrl', type: 'text', note: 'Signed Supabase Storage URL' },
        { col: 'insuranceUrl', type: 'text', note: 'Signed Supabase Storage URL' },
        { col: 'complianceScore', type: 'int2', note: '0–100. Updated by compliance engine' },
      ]
    },
    {
      name: 'OrderItem', color: '#60a5fa', desc: 'Line items within an Order. Snapshot of MenuItem at time of order (price may change later).',
      cols: [
        { col: 'id', type: 'uuid', note: 'Primary key' },
        { col: 'orderId', type: 'uuid', note: 'FK → Order.id' },
        { col: 'menuItemId', type: 'uuid', note: 'FK → MenuItem.id' },
        { col: 'name', type: 'text', note: 'Snapshot — do not join to MenuItem for display' },
        { col: 'price', type: 'numeric', note: 'Snapshot price at time of order' },
        { col: 'quantity', type: 'int4', note: '' },
      ]
    },
  ];

  const sidebarItems = [
    { id: 'checklist' as const, label: 'Onboarding Checklist' },
    { id: 'troubleshooting' as const, label: 'Troubleshooting FAQ' },
    { id: 'schema' as const, label: 'Schema Map' },
  ];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Sidebar */}
      <div style={{ width: 170, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              padding: '9px 12px', borderRadius: 6, textAlign: 'left', cursor: 'pointer', transition: 'all 150ms',
              border: activeSection === item.id ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.05)',
              background: activeSection === item.id ? 'rgba(249,115,22,0.08)' : 'transparent',
              color: activeSection === item.id ? '#f97316' : '#666',
              fontSize: 13, fontWeight: 600,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Onboarding Checklist ── */}
        {activeSection === 'checklist' && (
          <div className="adm-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="adm-card-title" style={{ margin: 0 }}>New Hire Onboarding Checklist</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Day-by-day tasks to get fully set up. Resets on page reload.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: pct === 100 ? '#22c55e' : pct > 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</div>
                <div style={{ fontSize: 11, color: '#555' }}>{doneItems}/{totalItems} done</div>
              </div>
            </div>
            <div style={{ height: 4, background: '#1e2420', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : pct > 50 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'all 300ms' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {days.map(day => (
                <div key={day.day}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: day.color, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {day.day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {day.items.map(item => (
                      <label key={item.id} onClick={() => toggle(item.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 6, background: checked[item.id] ? 'rgba(34,197,94,0.05)' : 'transparent', border: `1px solid ${checked[item.id] ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)'}`, transition: 'all 150ms' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked[item.id] ? '#22c55e' : '#333'}`, background: checked[item.id] ? '#22c55e' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms' }}>
                          {checked[item.id] && <span style={{ width: 5, height: 8, borderRight: '2px solid #000', borderBottom: '2px solid #000', transform: 'rotate(45deg)', marginTop: -2 }} />}
                        </div>
                        <span style={{ fontSize: 13, color: checked[item.id] ? '#555' : '#ccc', textDecoration: checked[item.id] ? 'line-through' : 'none', lineHeight: 1.5 }}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setChecked({})} style={{ marginTop: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#555', borderRadius: 5, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
              Reset checklist
            </button>
          </div>
        )}

        {/* ── Troubleshooting FAQ ── */}
        {activeSection === 'troubleshooting' && (
          <div className="adm-card">
            <SectionHeader title="Troubleshooting FAQ" sub="The most common errors new devs and QAs hit, and the exact fix for each." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ background: '#0f1210', border: `1px solid ${faq.color}22`, borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: faq.color, marginBottom: 8, fontFamily: 'monospace' }}>
                    Cancelled {faq.error}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                    <span style={{ color: '#444' }}>Cause: </span>{faq.cause}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: faq.cmd ? 10 : 0 }}>
                    <span style={{ color: '#444' }}>Fix: </span>{faq.fix}
                  </div>
                  {faq.cmd && <CodeBlock cmd={faq.cmd} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Schema Map ── */}
        {activeSection === 'schema' && (
          <div className="adm-card">
            <SectionHeader title="Database Schema Map" sub="Core Supabase tables, their columns, and how they relate. Source of truth for new devs." />
            <div style={{ padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 7, marginBottom: 16, fontSize: 12, color: '#93c5fd' }}>
              Tip <strong>Key relationships:</strong> profiles ← Driver (userId) · profiles ← Order (customerId, driverId) · Restaurant ← MenuItem · Order ← OrderItem ← MenuItem
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tables.map(table => (
                <div key={table.name} style={{ background: '#0f1210', border: `1px solid ${table.color}22`, borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${table.color}22`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 3, alignSelf: 'stretch', background: table.color, borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: table.color, fontFamily: 'monospace' }}>{table.name}</div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{table.desc}</div>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1e2420' }}>
                          {['Column', 'Type', 'Notes'].map(h => (
                            <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: '#444', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.cols.map((col, i) => (
                          <tr key={col.col} style={{ borderBottom: i < table.cols.length - 1 ? '1px solid #151a17' : 'none' }}>
                            <td style={{ padding: '8px 14px', fontFamily: 'monospace', color: '#e0e0e0', whiteSpace: 'nowrap' }}>{col.col}</td>
                            <td style={{ padding: '8px 14px', fontFamily: 'monospace', color: table.color, opacity: 0.8, whiteSpace: 'nowrap' }}>{col.type}</td>
                            <td style={{ padding: '8px 14px', color: '#666', lineHeight: 1.5 }}>{col.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────

export default function DevHubDashboard() {
  const [tab, setTab] = useState<'tdd' | 'tests' | 'checklist' | 'env' | 'dev' | 'mock' | 'onboarding'>('tdd');

  const tabs: Array<{ id: typeof tab; label: string }> = [
    { id: 'tdd', label: 'TDD Guide' },
    { id: 'tests', label: 'Test Suite' },
    { id: 'checklist', label: 'Release QA' },
    { id: 'env', label: 'Environments' },
    { id: 'dev', label: 'Dev Setup' },
    { id: 'mock', label: 'Mock Data' },
    { id: 'onboarding', label: 'Onboarding' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, borderBottom: '1px solid #1e2420', paddingBottom: 12 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: tab === t.id ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
              background: tab === t.id ? 'rgba(249,115,22,0.1)' : 'transparent',
              color: tab === t.id ? '#f97316' : '#666',
              fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 150ms',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tdd' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TDDWorkflow />
          <StateMachine />
          <CoreInvariants />
          <TestCommands />
        </div>
      )}
      {tab === 'tests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TestFileMap />
          <CoverageGaps />
        </div>
      )}
      {tab === 'checklist' && <ReleaseChecklist />}
      {tab === 'env' && <EnvRules />}
      {tab === 'dev' && <DevSetup />}
      {tab === 'mock' && <MockData />}
      {tab === 'onboarding' && <OnboardingHub />}
    </div>
  );
}
