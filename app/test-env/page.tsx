
import { getStripe } from "@/lib/stripe";

export default function TestEnvPage() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    return (
        <div style={{
            padding: '4rem',
            background: '#09090b',
            color: '#fafafa',
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 'bold' }}>
                    Diagnostic: <span style={{ color: '#00e676' }}>Stripe Config</span>
                </h1>

                <div style={{
                    background: '#18181b',
                    padding: '2rem',
                    borderRadius: '1rem',
                    border: '1px solid #27272a'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Secret Key (Server)
                        </p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {secretKey ? 'Done Present' : 'Cancelled MISSING'}
                            {secretKey && <span style={{ fontSize: '0.875rem', color: '#71717a', fontWeight: 'normal', display: 'block' }}>Starts with: {secretKey.substring(0, 7)}...</span>}
                        </p>
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Publishable Key (Client)
                        </p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {publishableKey ? 'Done Present' : 'Cancelled MISSING'}
                            {publishableKey && <span style={{ fontSize: '0.875rem', color: '#71717a', fontWeight: 'normal', display: 'block' }}>Starts with: {publishableKey.substring(0, 7)}...</span>}
                        </p>
                    </div>
                </div>

                <p style={{ marginTop: '2rem', color: '#71717a', fontSize: '0.875rem', textAlign: 'center' }}>
                    If both show <strong>Present</strong>, your keys are being read correctly by the server.
                    <br />
                    If you still don't see payments, ensure you are in <strong>Test Mode</strong> in the Stripe Dashboard.
                </p>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <a href="/restaurants" style={{ color: '#00e676', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Back to App</a>
                </div>
            </div>
        </div>
    );
}
