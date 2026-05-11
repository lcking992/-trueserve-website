/**
 * State Health Department Inspection Frequency Requirements
 *
 * Defines how often restaurants must be inspected based on state regulations
 * Used to calculate next inspection due dates for predictive compliance alerts
 */

export interface InspectionRequirement {
  state: string;
  frequencyDays: number;  // How often inspection is required (in days)
  inspectionType: 'announced' | 'unannounced' | 'both';
  riskCategories?: {
    high: number;    // High-risk establishments (e.g., daycares, nursing homes)
    medium: number;  // Medium-risk establishments
    low: number;     // Low-risk establishments
  };
  notes: string;
  sourceUrl?: string;
}

/**
 * State inspection requirements based on official health department regulations
 * Default to annual (365 days) for all states, can be customized per state
 */
const stateRequirements: Record<string, InspectionRequirement> = {
  'NC': {
    state: 'NC',
    frequencyDays: 365,  // Annual inspections required
    inspectionType: 'unannounced',
    notes: 'North Carolina requires annual inspections for all food service establishments',
    sourceUrl: 'https://www.dhhs.nc.gov/about/divisions/public-health/food-protection'
  },
  'NY': {
    state: 'NY',
    frequencyDays: 365,  // Annual inspections required
    inspectionType: 'unannounced',
    notes: 'New York requires annual unannounced inspections for food service',
    sourceUrl: 'https://www.health.ny.gov/environmental/food/'
  },
  'FL': {
    state: 'FL',
    frequencyDays: 365,  // Annual inspections required
    inspectionType: 'unannounced',
    notes: 'Florida requires annual inspections of food service establishments',
    sourceUrl: 'https://www.myfloridaeh.com/environmental-health/food-safety/'
  },
  'PA': {
    state: 'PA',
    frequencyDays: 365,  // Annual inspections required
    inspectionType: 'announced',
    notes: 'Pennsylvania requires at least annual inspections of food facilities',
    sourceUrl: 'https://www.dep.pa.gov/Business/Air/Pages/default.aspx'
  },
};

/**
 * Get inspection requirement for a state
 */
export function getInspectionRequirement(state: string): InspectionRequirement | null {
  return stateRequirements[state] || null;
}

/**
 * Calculate the next inspection due date based on last inspection date and state
 * @param lastInspectionDate - The date of the most recent inspection
 * @param state - Two-letter state code (NC, NY, FL, PA)
 * @returns Next inspection due date
 */
export function getNextInspectionDueDate(
  lastInspectionDate: Date,
  state: string
): Date {
  const requirement = getInspectionRequirement(state);

  if (!requirement) {
    console.warn(`[getNextInspectionDueDate] Unknown state: ${state}, using 365 days default`);
    // Fallback to annual inspection requirement if state not found
    const nextDue = new Date(lastInspectionDate);
    nextDue.setDate(nextDue.getDate() + 365);
    return nextDue;
  }

  const nextDue = new Date(lastInspectionDate);
  nextDue.setDate(nextDue.getDate() + requirement.frequencyDays);
  return nextDue;
}

/**
 * Calculate the number of days until inspection is due
 * @param dueDate - The calculated due date
 * @returns Number of days until due (negative if overdue)
 */
export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  const timeDifference = dueDate.getTime() - now.getTime();
  const daysUntil = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return daysUntil;
}

/**
 * Get alert urgency level based on days until due
 * @param daysUntil - Number of days until inspection due
 * @returns Alert level: 'critical' (overdue), 'urgent' (7 days), 'warning' (30 days), 'info' (future)
 */
export function getAlertUrgency(daysUntil: number): 'critical' | 'urgent' | 'warning' | 'info' {
  if (daysUntil <= 0) return 'critical';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'warning';
  return 'info';
}

/**
 * Check if an inspection is overdue
 */
export function isInspectionOverdue(dueDate: Date): boolean {
  return dueDate.getTime() < Date.now();
}

/**
 * Check if an inspection alert should be sent
 * @param daysUntil - Number of days until inspection due
 * @param alertType - Type of alert: '30_days', '7_days', or 'overdue'
 * @param previousAlertSentAt - When the previous alert was sent (null if never)
 * @returns true if alert should be sent
 */
export function shouldSendAlert(
  daysUntil: number,
  alertType: '30_days' | '7_days' | 'overdue',
  previousAlertSentAt: Date | null
): boolean {
  // Never send duplicate alerts on same day
  if (previousAlertSentAt) {
    const daysSinceLastAlert = Math.floor(
      (Date.now() - previousAlertSentAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastAlert < 1) {
      return false;
    }
  }

  switch (alertType) {
    case '30_days':
      // Send when 30-35 days out (allow small range for timing variations)
      return daysUntil > 0 && daysUntil <= 35;
    case '7_days':
      // Send when 0-7 days out
      return daysUntil >= 0 && daysUntil <= 7;
    case 'overdue':
      // Send every day after overdue
      return daysUntil < 0;
    default:
      return false;
  }
}

/**
 * Get human-readable alert message based on days until due
 */
export function getAlertMessage(
  daysUntil: number,
  restaurantName: string,
  dueDate: Date,
  state: string
): string {
  const dateStr = dueDate.toLocaleDateString();
  const stateInfo = getInspectionRequirement(state);
  const deptName = stateInfo?.sourceUrl?.includes('dhhs') ? 'North Carolina DHHS'
    : stateInfo?.sourceUrl?.includes('health.ny') ? 'New York Department of Health'
    : stateInfo?.sourceUrl?.includes('myfloridaeh') ? 'Florida Department of Health'
    : 'Pennsylvania Department of Health';

  if (daysUntil <= 0) {
    return `Urgent URGENT: Your health inspection for ${restaurantName} is OVERDUE (was due ${Math.abs(daysUntil)} days ago). Contact ${deptName} immediately to schedule. Failure to comply may result in penalties.`;
  } else if (daysUntil <= 7) {
    return `Warning IMPORTANT: Your health inspection for ${restaurantName} is due on ${dateStr} (in ${daysUntil} days). If not already scheduled, contact ${deptName} today to arrange your inspection.`;
  } else if (daysUntil <= 30) {
    return `Checklist REMINDER: Your health inspection for ${restaurantName} is due on ${dateStr} (in ${daysUntil} days). Please ensure all documentation and facilities are in order. Contact ${deptName} to schedule.`;
  } else {
    return `Date NOTIFICATION: Your next health inspection for ${restaurantName} is due on ${dateStr}. Begin preparing for inspection and schedule with ${deptName} as needed.`;
  }
}
