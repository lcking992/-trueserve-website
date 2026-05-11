export type ComplianceTemplateSection = {
    title: string;
    items: string[];
};

export type ComplianceTemplatePreset = {
    key: string;
    label: string;
    description: string;
    icon: string;
    note: string;
    sections: ComplianceTemplateSection[];
};

const COMPLIANCE_PRESETS: ComplianceTemplatePreset[] = [
    {
        key: "daily_hygiene",
        label: "Daily restaurant hygiene checklist",
        description: "Daily restaurant hygiene checklist",
        icon: "Clean",
        note: "Best for opening, shift change, and closing sanitation checks.",
        sections: [
            {
                title: "Prep surfaces",
                items: ["Sanitize counters and prep tables", "Wipe handles, switches, and POS screens", "Restock gloves, towels, and sanitizers"],
            },
            {
                title: "Food safety",
                items: ["Log hot and cold holding temperatures", "Confirm date labels are visible", "Remove expired or damaged product"],
            },
            {
                title: "Closing cleanup",
                items: ["Dispose of trash and grease safely", "Sweep and mop all work areas", "Lock storage and leave notes for the next shift"],
            },
        ],
    },
    {
        key: "emergency_response",
        label: "Emergency response plan template",
        description: "Emergency response plan template",
        icon: "Urgent",
        note: "Ideal for power outages, weather events, equipment failure, or incident response.",
        sections: [
            {
                title: "Incident response",
                items: ["Identify the issue and notify the manager", "Switch to manual service if needed", "Record the time and people involved"],
            },
            {
                title: "Customer safety",
                items: ["Protect guests from hazards", "Move customers away from impacted areas", "Share updates with clear instructions"],
            },
            {
                title: "Recovery steps",
                items: ["Document the event with photos", "Check equipment before reopening", "Review the action plan after the shift"],
            },
        ],
    },
    {
        key: "temperature_control",
        label: "Temperature control audit",
        description: "Temperature control audit",
        icon: "Temp",
        note: "Useful when you want to verify hot-hold, cold-hold, and delivery readiness.",
        sections: [
            {
                title: "Cold holding",
                items: ["Check refrigerators and line coolers", "Record each unit temperature", "Remove products outside safe range"],
            },
            {
                title: "Hot holding",
                items: ["Verify soup, sauce, and prep hot-hold temps", "Reheat or replace items below target", "Document corrective actions"],
            },
            {
                title: "Delivery readiness",
                items: ["Confirm insulated bags are ready", "Verify order staging area temperatures", "Sign off before dispatch"],
            },
        ],
    },
    {
        key: "driver_sanitation",
        label: "Driver bag sanitation checklist",
        description: "Driver bag sanitation checklist",
        icon: "Driver",
        note: "Great for driver onboarding and recurring attestations.",
        sections: [
            {
                title: "Before shift",
                items: ["Inspect delivery bag interior and exterior", "Check hot/cold bag closures and seals", "Confirm sanitizer is available"],
            },
            {
                title: "During shift",
                items: ["Keep bags closed between deliveries", "Separate hot and cold items", "Avoid cross-contamination in the car"],
            },
            {
                title: "End of shift",
                items: ["Wipe down all surfaces", "Remove spills or residue", "Report any damaged equipment"],
            },
        ],
    },
];

const PRESET_KEYWORDS: Record<string, string[]> = {
    daily_hygiene: ["hygiene", "sanitation", "cleaning", "daily", "prep"],
    emergency_response: ["emergency", "fire", "incident", "power", "storm", "evac", "response"],
    temperature_control: ["temperature", "temp", "cold", "hot", "food safety", "audit"],
    driver_sanitation: ["driver", "bag", "delivery", "route", "attestation"],
};

export function getCompliancePresets() {
    return COMPLIANCE_PRESETS;
}

export function buildComplianceTemplateDraft(input: string) {
    const normalized = input.trim();
    const lower = normalized.toLowerCase();
    const preset =
        COMPLIANCE_PRESETS.find((candidate) =>
            PRESET_KEYWORDS[candidate.key]?.some((keyword) => lower.includes(keyword))
        ) || COMPLIANCE_PRESETS[0];

    return {
        preset,
        title: preset.label,
        description: normalized || preset.description,
        sections: preset.sections,
        note: preset.note,
        summary: `${preset.sections.length} sections · ${preset.note}`,
    };
}
