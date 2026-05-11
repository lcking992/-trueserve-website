import { AlertTriangle, Mail, MessageCircle, Phone, ShieldCheck, Smartphone, UserRound, WalletCards } from "lucide-react";

export default function DriverHelp() {
    const categories = [
        { Icon: WalletCards, title: 'Pay & Earnings',      desc: 'Missing pay, promotions, cash out issues.' },
        { Icon: Smartphone, title: 'App Issues',           desc: 'Bugs, crashes, login problems.' },
        { Icon: ShieldCheck, title: 'Safety & Incidents',  desc: 'Report an accident or safety concern.' },
        { Icon: UserRound, title: 'Account Info',         desc: 'Update vehicle, documents, phone number.' },
    ];

    const faqs = [
        {
            q: 'How is pay calculated?',
            a: 'Pay is based on base fare + mileage + wait time + 100% of tips. TrueServe shows an estimated pay breakdown before you accept every order.',
        },
        {
            q: 'How do I cancel an order?',
            a: 'Go to Order Details → Help → Cancel Order. Excessive cancellations may affect your acceptance rate and tier standing.',
        },
        {
            q: 'When do I get paid?',
            a: 'Your balance is available for instant cash-out at any time from the Settlements page. There are no holds or delays.',
        },
        {
            q: 'How do tips work?',
            a: 'TrueServe passes 100% of customer tips to you. Unlike some platforms, tips are always shown in full before you accept.',
        },
    ];

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: 720 }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .help-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 6px; }
                .help-title span { color: #f97316; }
                .help-sub { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #444; margin-bottom: 24px; display: block; }

                .help-cta { background: #141a18; border: 1px solid #1e2420; border-radius: 10px; padding: 20px; margin-bottom: 16px; text-align: center; }
                .help-cta h2 { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px; }
                .help-cta p { font-size: 12px; color: #666; margin-bottom: 16px; }
                .help-chat-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 12px; background: #f97316; color: #000; border: none;
                    border-radius: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.12em;
                    text-transform: uppercase; cursor: pointer; font-family: inherit; transition: background 0.15s;
                }
                .help-chat-btn:hover { background: #ea6c10; }

                .help-categories { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
                @media (max-width: 480px) { .help-categories { grid-template-columns: 1fr; } }
                .help-cat-card {
                    background: #141a18; border: 1px solid #1e2420; border-radius: 10px;
                    padding: 14px 16px; cursor: pointer; transition: border-color 0.15s, background 0.15s;
                }
                .help-cat-card:hover { border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.04); }
                .help-cat-icon { color: #f97316; margin-bottom: 8px; }
                .help-cat-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
                .help-cat-desc { font-size: 11px; color: #666; line-height: 1.5; }

                .help-faq-section { background: #141a18; border: 1px solid #1e2420; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
                .help-faq-hd { padding: 14px 16px; border-bottom: 1px solid #1e2420; font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #777; }
                .help-faq-item { border-bottom: 1px solid #1e2420; }
                .help-faq-item:last-child { border-bottom: none; }
                .help-faq-q { padding: 14px 16px; font-size: 13px; font-weight: 700; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px; user-select: none; }
                .help-faq-q:hover { color: #fff; }
                .help-faq-chevron { font-size: 10px; color: #555; flex-shrink: 0; transition: transform 0.15s; }
                .help-faq-chevron.open { transform: rotate(180deg); }
                .help-faq-a { padding: 0 16px 14px; font-size: 12px; color: #666; line-height: 1.6; }

                .help-contact { background: #0f1210; border: 1px solid #1e2420; border-radius: 10px; padding: 16px; }
                .help-contact-hd { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 10px; }
                .help-contact-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #131720; }
                .help-contact-row:last-child { border-bottom: none; }
                .help-contact-icon { color: #f97316; flex-shrink: 0; width: 28px; display: flex; justify-content: center; }
                .help-contact-label { font-size: 12px; font-weight: 700; color: #ccc; }
                .help-contact-sub { font-size: 10px; color: #555; margin-top: 1px; }

                @media (max-width: 640px) {
                    .help-title { font-size: 22px; }
                    .help-sub { margin-bottom: 16px; }
                }
            ` }} />

            <div className="help-title">Help <span>&amp; Support</span></div>
            <span className="help-sub">24/7 assistance for drivers</span>

            {/* CTA */}
            <div className="help-cta">
                <h2>Need immediate help?</h2>
                <p>Our support team is available around the clock for active delivery issues.</p>
                <button className="help-chat-btn"><MessageCircle size={15} aria-hidden="true" /> Chat with Support</button>
            </div>

            {/* Categories */}
            <div className="help-categories">
                {categories.map(cat => (
                    <div key={cat.title} className="help-cat-card">
                        <div className="help-cat-icon"><cat.Icon size={20} aria-hidden="true" /></div>
                        <div className="help-cat-title">{cat.title}</div>
                        <div className="help-cat-desc">{cat.desc}</div>
                    </div>
                ))}
            </div>

            {/* FAQs */}
            <div className="help-faq-section">
                <div className="help-faq-hd">Common Questions</div>
                {faqs.map((faq, i) => (
                    <details key={i} className="help-faq-item">
                        <summary className="help-faq-q">
                            {faq.q}
                            <span className="help-faq-chevron">▼</span>
                        </summary>
                        <div className="help-faq-a">{faq.a}</div>
                    </details>
                ))}
            </div>

            {/* Contact */}
            <div className="help-contact">
                <div className="help-contact-hd">Other Ways to Reach Us</div>
                {[
                    { Icon: Mail, label: 'Email Support', sub: 'drivers@trueserve.com — reply within 4 hours' },
                    { Icon: Phone, label: 'Phone (Active Delivery)', sub: '1-800-TRUESERVE — press 2 for drivers' },
                    { Icon: AlertTriangle, label: 'Emergency Only', sub: 'For safety incidents during an active order' },
                ].map(({ Icon, label, sub }) => (
                    <div key={label} className="help-contact-row">
                        <div className="help-contact-icon"><Icon size={17} aria-hidden="true" /></div>
                        <div>
                            <div className="help-contact-label">{label}</div>
                            <div className="help-contact-sub">{sub}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
