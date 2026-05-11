// DEV ONLY — visual preview of the order status timeline in all states
export default function TimelinePreview() {
    const steps = [
        { label: 'Order Confirmed',   sub: '12:34 PM',                    eta: null },
        { label: 'Preparing Your Food', sub: 'Kitchen is cooking',        eta: 'Kitchen starting soon…' },
        { label: 'Ready for Pickup',  sub: 'Food packed and ready',       eta: 'Almost done cooking…' },
        { label: 'Driver En Route',   sub: 'Driver heading to restaurant', eta: 'Driver is on the way…' },
        { label: 'Delivered',         sub: 'Enjoy your meal! ',          eta: 'ETA: 8 min' },
    ];

    return (
        <div style={{ background: '#080a0f', minHeight: '100vh', padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Timeline Preview — <span style={{ color: '#f97316' }}>Dev Only</span>
            </h1>
            <p style={{ color: '#444', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 40 }}>
                Showing all 5 active-step states
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                {[1, 2, 3, 4, 5].map(activeStep => (
                    <div key={activeStep} style={{ background: '#0c0e13', border: '1px solid #1c1f28', padding: 20 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f97316', marginBottom: 16 }}>
                            Step {activeStep} Active
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 9, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                                    Step {activeStep} of 5
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 800, color: activeStep === 5 ? '#3dd68c' : '#f97316' }}>
                                    {Math.round(((activeStep - 1) / 4) * 100)}%
                                </span>
                            </div>
                            <div style={{ height: 5, background: '#1c1f28', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.round(((activeStep - 1) / 4) * 100)}%`,
                                    background: activeStep === 5
                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                        : 'linear-gradient(90deg, #f97316, #fb923c)',
                                    borderRadius: 3,
                                    boxShadow: activeStep === 5
                                        ? '0 0 10px rgba(16,185,129,0.5)'
                                        : '0 0 10px rgba(249,115,22,0.5)',
                                }} />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="tl">
                            {steps.map((step, idx) => {
                                const stepNum = idx + 1;
                                const isDone = activeStep > stepNum;
                                const isLive = activeStep === stepNum;
                                const isWait = activeStep < stepNum;
                                return (
                                    <div key={idx} className={`tl-row${isDone ? ' done' : ''}`}>
                                        <div className={`tl-dot${isDone ? ' done' : isLive ? ' live' : ' wait'}`}>
                                            {isDone ? 'Done' : stepNum}
                                        </div>
                                        <div className="tl-body">
                                            <div className={`tl-lbl${isLive ? ' active' : ''}`}>{step.label}</div>
                                            <div className="tl-sub">{isDone ? step.sub : isLive ? step.sub : '—'}</div>
                                            {isLive && step.eta && <div className="tl-eta">{step.eta}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
