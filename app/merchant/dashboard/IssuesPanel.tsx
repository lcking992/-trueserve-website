"use client";

import { useState } from "react";

interface IssuesPanelProps {
    pendingCount: number;
}

export default function IssuesPanel({ pendingCount }: IssuesPanelProps) {
    const [visible, setVisible] = useState(pendingCount > 0);

    if (!visible) return null;

    return (
        <>
            <style>{`
                .issues-toast {
                    position: fixed; bottom: 24px; left: 24px;
                    display: flex; align-items: center; gap: 10px;
                    background: #e24b4a; padding: 10px 16px; z-index: 100;
                }
                .issues-n {
                    width: 24px; height: 24px; background: #fff; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; font-weight: 700; color: #e24b4a; flex-shrink: 0;
                }
                .issues-text { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
                .issues-close { font-size: 14px; color: rgba(255,255,255,.6); cursor: pointer; margin-left: 4px; background: none; border: none; }
            `}</style>
            <div className="issues-toast">
                <div className="issues-n">{pendingCount}</div>
                <div className="issues-text">{pendingCount === 1 ? "1 Pending Order" : `${pendingCount} Incoming Orders`}</div>
                <button className="issues-close" onClick={() => setVisible(false)} aria-label="Dismiss">×</button>
            </div>
        </>
    );
}
