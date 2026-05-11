'use client';

import { useEffect, useState, useCallback } from 'react';

interface EnvStatus {
  secretMode: 'test' | 'live' | 'missing';
  pubMode: 'test' | 'live' | 'missing';
  webhookSecretPresent: boolean;
  keysMatch: boolean;
  recentEvents: Array<{ id: string; type: string; created: number; livemode: boolean }>;
  eventsError: string | null;
}

interface TriggerResult {
  success?: boolean;
  error?: string;
  message?: string;
  id?: string;
  refundId?: string;
  stripeError?: string;
  [key: string]: any;
}

const TEST_CARDS = [
  { label: 'Done Success', number: '4242 4242 4242 4242', expiry: 'Any future', cvc: 'Any 3 digits', scenario: 'Standard approval' },
  { label: 'Cancelled Generic decline', number: '4000 0000 0000 0002', expiry: 'Any future', cvc: 'Any', scenario: 'card_declined' },
  { label: 'Funds Insufficient funds', number: '4000 0000 0000 9995', expiry: 'Any future', cvc: 'Any', scenario: 'insufficient_funds' },
  { label: 'Secure 3DS required', number: '4000 0025 0000 3155', expiry: 'Any future', cvc: 'Any', scenario: '3DS authentication needed' },
  { label: 'Secure 3DS (mobile banking)', number: '4000 0000 0000 3220', expiry: 'Any future', cvc: 'Any', scenario: '3DS on mobile' },
  { label: 'Date Expired card', number: '4000 0000 0000 0069', expiry: 'Any future', cvc: 'Any', scenario: 'expired_card' },
  { label: 'CVC Incorrect CVC', number: '4000 0000 0000 0127', expiry: 'Any future', cvc: 'Any', scenario: 'incorrect_cvc' },
  { label: 'Blocked Fraud (Radar block)', number: '4100 0000 0000 0019', expiry: 'Any future', cvc: 'Any', scenario: 'fraudulent — blocked by Radar' },
  { label: 'Bank ACH test', number: 'Use routing 110000000', expiry: '—', cvc: '—', scenario: 'Bank account: 000123456789' },
];

const SCENARIOS = [
  { id: 'payment_success', label: 'Done Simulate successful payment', desc: 'Creates a $1.00 PaymentIntent with pm_card_visa and confirms it. Fires payment_intent.succeeded.' },
  { id: 'payment_declined', label: 'Cancelled Simulate declined card', desc: 'Attempts a charge with a declining test card. Fires payment_intent.payment_failed.' },
  { id: 'refund', label: 'Refund Simulate refund', desc: 'Creates a $5.00 charge then immediately refunds it. Fires charge.refunded.' },
  { id: 'insufficient_funds', label: 'Funds Simulate insufficient funds', desc: 'Declines with the insufficient_funds code specifically.' },
];

const EVENT_COLORS: Record<string, string> = {
  'payment_intent.succeeded': '#22c55e',
  'payment_intent.payment_failed': '#ef4444',
  'payment_intent.created': '#60a5fa',
  'charge.refunded': '#f59e0b',
  'account.updated': '#a78bfa',
  'charge.succeeded': '#22c55e',
  'charge.failed': '#ef4444',
};

function Badge({ mode }: { mode: 'test' | 'live' | 'missing' }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    test: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', label: 'TEST MODE' },
    live: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: 'LIVE MODE' },
    missing: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'MISSING' },
  };
  const s = styles[mode];
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
      {s.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      style={{
        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? '#22c55e' : '#999',
        borderRadius: 5,
        padding: '2px 8px',
        fontSize: 11,
        cursor: 'pointer',
        transition: 'all 150ms',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? 'Done Copied' : 'Copy'}
    </button>
  );
}

export default function StripeTestingDashboard() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ scenario: string; result: TriggerResult; ts: number }>>([]);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/stripe-status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
    setStatusLoading(false);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const triggerScenario = async (scenarioId: string) => {
    setTriggering(scenarioId);
    try {
      const res = await fetch('/api/admin/stripe-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioId }),
      });
      const data: TriggerResult = await res.json();
      setResults((prev) => [{ scenario: scenarioId, result: data, ts: Date.now() }, ...prev].slice(0, 20));
      // Refresh events after trigger
      setTimeout(loadStatus, 1500);
    } catch (err: any) {
      setResults((prev) => [{ scenario: scenarioId, result: { error: err.message }, ts: Date.now() }, ...prev]);
    }
    setTriggering(null);
  };

  const isTestMode = status?.secretMode === 'test';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Environment Health ─────────────────────────────────────── */}
      <div className="adm-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="adm-card-title" style={{ margin: 0 }}>Environment Health</div>
          <button
            onClick={loadStatus}
            disabled={statusLoading}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999', borderRadius: 5, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
          >
            {statusLoading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {statusLoading ? (
          <div style={{ color: '#555', fontSize: 13 }}>Loading...</div>
        ) : !status ? (
          <div style={{ color: '#ef4444', fontSize: 13 }}>Failed to load status — check console</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { label: 'Secret Key', value: <Badge mode={status.secretMode} />, ok: status.secretMode !== 'missing' },
              { label: 'Publishable Key', value: <Badge mode={status.pubMode} />, ok: status.pubMode !== 'missing' },
              { label: 'Webhook Secret', value: status.webhookSecretPresent ? <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>Done Present</span> : <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>✗ Missing</span>, ok: status.webhookSecretPresent },
              { label: 'Keys Match', value: status.keysMatch ? <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>Done Both {status.secretMode}</span> : <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>Warning Mismatch</span>, ok: status.keysMatch },
            ].map((item) => (
              <div key={item.label} style={{ background: '#0f1210', border: '1px solid #1e2420', borderRadius: 7, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {status && !status.keysMatch && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 7, fontSize: 12, color: '#f59e0b' }}>
            Warning <strong>Key mismatch:</strong> Your secret key is <strong>{status.secretMode}</strong> but publishable key is <strong>{status.pubMode}</strong>. Update <code>.env.production</code> to use <code>pk_live_...</code> for production.
          </div>
        )}
        {status && !status.webhookSecretPresent && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, fontSize: 12, color: '#ef4444' }}>
            ✗ <strong>STRIPE_WEBHOOK_SECRET is missing.</strong> Webhook signature verification will silently accept any request. Add the secret immediately.
          </div>
        )}
      </div>

      {/* ── Test Cards Reference ───────────────────────────────────── */}
      <div className="adm-card">
        <div className="adm-card-title">Test Cards</div>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 14px' }}>Use any future expiry date and any 3-digit CVC unless noted. These only work with test keys.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2420' }}>
                {['Scenario', 'Card Number', 'Expiry', 'CVC', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEST_CARDS.map((card, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1f1d' }}>
                  <td style={{ padding: '9px 10px', color: '#e0e0e0' }}>{card.label}</td>
                  <td style={{ padding: '9px 10px', fontFamily: 'monospace', color: '#f0f0f0', letterSpacing: '0.05em' }}>{card.number}</td>
                  <td style={{ padding: '9px 10px', color: '#888' }}>{card.expiry}</td>
                  <td style={{ padding: '9px 10px', color: '#888' }}>{card.cvc}</td>
                  <td style={{ padding: '9px 10px' }}><CopyButton text={card.number} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 7, fontSize: 12, color: '#93c5fd' }}>
          Tip <strong>Tip:</strong> For Connect accounts use <code>000000000</code> as routing and <code>000123456789</code> as account number in test mode.
        </div>
      </div>

      {/* ── Webhook Simulator ─────────────────────────────────────── */}
      <div className="adm-card">
        <div className="adm-card-title">Webhook Event Simulator</div>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 16px' }}>
          Triggers real Stripe API calls in test mode and fires the corresponding webhook to <code style={{ color: '#f97316' }}>/api/webhook/stripe</code>.
          {!isTestMode && <strong style={{ color: '#ef4444', marginLeft: 6 }}>⛔ Disabled — only works in test mode.</strong>}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: results.length > 0 ? 20 : 0 }}>
          {SCENARIOS.map((s) => (
            <div key={s.id} style={{ background: '#0f1210', border: '1px solid #1e2420', borderRadius: 7, padding: '14px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>{s.desc}</div>
              <button
                onClick={() => triggerScenario(s.id)}
                disabled={!isTestMode || triggering !== null}
                style={{
                  background: !isTestMode ? 'rgba(255,255,255,0.03)' : triggering === s.id ? 'rgba(249,115,22,0.3)' : 'rgba(249,115,22,0.12)',
                  border: `1px solid ${!isTestMode ? 'rgba(255,255,255,0.08)' : 'rgba(249,115,22,0.25)'}`,
                  color: !isTestMode ? '#444' : triggering === s.id ? '#f97316' : '#fb923c',
                  borderRadius: 5,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: !isTestMode ? 'not-allowed' : 'pointer',
                  width: '100%',
                  transition: 'all 150ms',
                }}
              >
                {triggering === s.id ? 'Running...' : 'Run Scenario →'}
              </button>
            </div>
          ))}
        </div>

        {/* Trigger results log */}
        {results.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 600 }}>RESULTS LOG</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  background: r.result.error ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
                  border: `1px solid ${r.result.error ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}`,
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}>
                  <span style={{ color: '#666', marginRight: 10 }}>{new Date(r.ts).toLocaleTimeString()}</span>
                  <span style={{ color: '#888', marginRight: 10 }}>[{r.scenario}]</span>
                  {r.result.error
                    ? <span style={{ color: '#ef4444' }}>✗ {r.result.error}</span>
                    : <span style={{ color: '#22c55e' }}>Done {r.result.message || JSON.stringify(r.result)}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Stripe Events ───────────────────────────────────── */}
      <div className="adm-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="adm-card-title" style={{ margin: 0 }}>Recent Stripe Events</div>
          <button
            onClick={loadStatus}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999', borderRadius: 5, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
        </div>

        {status?.eventsError ? (
          <div style={{ color: '#ef4444', fontSize: 12 }}>Error: {status.eventsError}</div>
        ) : !status?.recentEvents?.length ? (
          <div style={{ color: '#555', fontSize: 13 }}>No recent events found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {status.recentEvents.map((evt) => {
              const color = EVENT_COLORS[evt.type] || '#888';
              return (
                <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#0f1210', borderRadius: 6, border: '1px solid #1a1f1d', fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ color: '#e0e0e0', fontFamily: 'monospace', flex: 1 }}>{evt.type}</span>
                  <span style={{ color: '#555', fontFamily: 'monospace', fontSize: 11 }}>{evt.id}</span>
                  <span style={{ color: '#555', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(evt.created * 1000).toLocaleString()}</span>
                  <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: evt.livemode ? 'rgba(34,197,94,0.1)' : 'rgba(96,165,250,0.1)', color: evt.livemode ? '#22c55e' : '#60a5fa' }}>
                    {evt.livemode ? 'LIVE' : 'TEST'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Stripe CLI Setup ──────────────────────────────────────── */}
      <div className="adm-card">
        <div className="adm-card-title">Local Webhook Testing (Stripe CLI)</div>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 16px', lineHeight: 1.6 }}>
          The Stripe CLI lets you forward live webhook events to your local dev server. Install it once, then use these commands.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '1. Install CLI (macOS)', cmd: 'brew install stripe/stripe-cli/stripe' },
            { label: '2. Log in', cmd: 'stripe login' },
            { label: '3. Forward webhooks to local dev', cmd: 'stripe listen --forward-to localhost:3000/api/webhook/stripe' },
            { label: '4. Copy the webhook secret shown and add to .env.local', cmd: 'STRIPE_WEBHOOK_SECRET=whsec_...' },
            { label: '5. Trigger a test event manually', cmd: 'stripe trigger payment_intent.succeeded' },
            { label: '6. Trigger account.updated (Connect)', cmd: 'stripe trigger account.updated' },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0a0c09', border: '1px solid #1e2420', borderRadius: 6, padding: '8px 12px' }}>
                <code style={{ flex: 1, fontSize: 12, color: '#f0f0f0', fontFamily: 'monospace' }}>{item.cmd}</code>
                <CopyButton text={item.cmd} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Links ───────────────────────────────────────────── */}
      <div className="adm-card">
        <div className="adm-card-title">Quick Links</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {[
            { label: 'Stripe Dashboard (Test)', href: 'https://dashboard.stripe.com/test/dashboard', desc: 'Test mode overview' },
            { label: 'Stripe Dashboard (Live)', href: 'https://dashboard.stripe.com/dashboard', desc: 'Production overview' },
            { label: 'Test Cards Docs', href: 'https://stripe.com/docs/testing#cards', desc: 'Full test card reference' },
            { label: 'Webhook Events Docs', href: 'https://stripe.com/docs/api/events/types', desc: 'All event types' },
            { label: 'Connect Testing', href: 'https://stripe.com/docs/connect/testing', desc: 'Test Connect onboarding' },
            { label: 'Stripe CLI Docs', href: 'https://stripe.com/docs/stripe-cli', desc: 'Install & usage guide' },
            { label: 'Payment Intents Guide', href: 'https://stripe.com/docs/payments/payment-intents', desc: 'Core payments flow' },
            { label: 'Webhooks Guide', href: 'https://stripe.com/docs/webhooks', desc: 'Signature verification & setup' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#0f1210',
                border: '1px solid #1e2420',
                borderRadius: 7,
                padding: '11px 13px',
                textDecoration: 'none',
                transition: 'border-color 150ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2420')}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f0', marginBottom: 3 }}>{link.label} Open</div>
              <div style={{ fontSize: 11, color: '#555' }}>{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
