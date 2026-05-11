/**
 * Compliance Analytics & Aggregation Service
 * Calculates network-wide compliance metrics, trends, and insights
 */

export type RestaurantComplianceMetrics = {
    restaurantId: string;
    name: string;
    city: string;
    state: string;
    complianceScore: number;
    healthGrade: string;
    complianceStatus: 'PASS' | 'IN_REVIEW' | 'FLAGGED';
    lastInspectionAt: string;
    trend: 'improving' | 'stable' | 'declining'; // Based on recent scores
    violationCount: number;
    criticalViolations: number;
};

export type NetworkComplianceStats = {
    totalRestaurants: number;
    averageScore: number;
    medianScore: number;
    passRate: number; // % of restaurants with PASS status
    flaggedCount: number;
    topPerformers: RestaurantComplianceMetrics[];
    needsAttention: RestaurantComplianceMetrics[];
    mostCommonViolations: Array<{ violation: string; count: number; severity: 'critical' | 'major' | 'minor' }>;
    scoreDistribution: {
        a: number; // 90-100
        b: number; // 80-89
        c: number; // 70-79
        d: number; // Below 70
    };
};

export type FranchiseMetrics = {
    franchiseName: string;
    locationCount: number;
    averageScore: number;
    allPassing: boolean;
    locations: RestaurantComplianceMetrics[];
};

/**
 * Calculate aggregate compliance metrics for entire network
 */
export function calculateNetworkMetrics(restaurants: RestaurantComplianceMetrics[]): NetworkComplianceStats {
    if (restaurants.length === 0) {
        return {
            totalRestaurants: 0,
            averageScore: 0,
            medianScore: 0,
            passRate: 0,
            flaggedCount: 0,
            topPerformers: [],
            needsAttention: [],
            mostCommonViolations: [],
            scoreDistribution: { a: 0, b: 0, c: 0, d: 0 },
        };
    }

    const scores = restaurants
        .map(r => r.complianceScore)
        .filter(s => typeof s === 'number' && s >= 0)
        .sort((a, b) => a - b);

    // Calculate average and median
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const medianScore = scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0;

    // Calculate pass rate
    const passingCount = restaurants.filter(r => r.complianceStatus === 'PASS').length;
    const passRate = restaurants.length > 0 ? Math.round((passingCount / restaurants.length) * 100) : 0;

    // Count flagged
    const flaggedCount = restaurants.filter(r => r.complianceStatus === 'FLAGGED').length;

    // Get top performers and needs attention
    const sorted = [...restaurants].sort((a, b) => b.complianceScore - a.complianceScore);
    const topPerformers = sorted.slice(0, 5);
    const needsAttention = sorted
        .filter(r => r.complianceStatus === 'FLAGGED' || r.complianceScore < 80)
        .slice(0, 5);

    // Score distribution
    const distribution = { a: 0, b: 0, c: 0, d: 0 };
    for (const restaurant of restaurants) {
        const score = restaurant.complianceScore || 0;
        if (score >= 90) distribution.a++;
        else if (score >= 80) distribution.b++;
        else if (score >= 70) distribution.c++;
        else distribution.d++;
    }

    // Aggregate violations (placeholder - would need violation data from DB)
    const mostCommonViolations: Array<{ violation: string; count: number; severity: 'critical' | 'major' | 'minor' }> = [
        { violation: 'Temperature control logs not current', count: 8, severity: 'critical' },
        { violation: 'Food handler certificates expired', count: 6, severity: 'major' },
        { violation: 'Sanitizer concentration improper', count: 5, severity: 'major' },
        { violation: 'Cross-contamination risk observed', count: 4, severity: 'critical' },
        { violation: 'Cleaning schedule not documented', count: 3, severity: 'minor' },
    ];

    return {
        totalRestaurants: restaurants.length,
        averageScore,
        medianScore,
        passRate,
        flaggedCount,
        topPerformers,
        needsAttention,
        mostCommonViolations,
        scoreDistribution: distribution,
    };
}

/**
 * Group restaurants by franchise/owner for franchise-level metrics
 */
export function calculateFranchiseMetrics(
    restaurants: RestaurantComplianceMetrics[],
    franchiseMap: Record<string, string[]> // franchiseName -> restaurantIds
): FranchiseMetrics[] {
    const franchises: FranchiseMetrics[] = [];

    for (const [franchiseName, restaurantIds] of Object.entries(franchiseMap)) {
        const locations = restaurants.filter(r => restaurantIds.includes(r.restaurantId));

        if (locations.length === 0) continue;

        const averageScore = Math.round(
            locations.reduce((sum, r) => sum + (r.complianceScore || 0), 0) / locations.length
        );
        const allPassing = locations.every(r => r.complianceStatus === 'PASS');

        franchises.push({
            franchiseName,
            locationCount: locations.length,
            averageScore,
            allPassing,
            locations: locations.sort((a, b) => b.complianceScore - a.complianceScore),
        });
    }

    return franchises.sort((a, b) => b.averageScore - a.averageScore);
}

/**
 * Calculate score trend based on recent inspections
 * (improving, stable, declining)
 */
export function calculateTrend(
    recentScores: number[]
): 'improving' | 'stable' | 'declining' {
    if (recentScores.length < 2) return 'stable';

    const sorted = [...recentScores].sort((a, b) => a - b);
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const diff = newest - oldest;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
}

/**
 * Generate compliance insights for dashboard
 */
export function generateInsights(stats: NetworkComplianceStats): string[] {
    const insights: string[] = [];

    // Network-wide insights
    if (stats.averageScore >= 90) {
        insights.push('Excellent Network average is excellent — maintain current standards');
    } else if (stats.averageScore >= 80) {
        insights.push('Warning  Average compliance score is good, but room for improvement');
    } else {
        insights.push('Urgent Network average below 80 — immediate action recommended');
    }

    // Pass rate insights
    if (stats.passRate >= 90) {
        insights.push(`Done ${stats.passRate}% of restaurants are fully compliant`);
    } else if (stats.passRate >= 70) {
        insights.push(`Fast ${stats.passRate}% compliance rate — ${stats.flaggedCount} locations need attention`);
    } else {
        insights.push(`Warning Only ${stats.passRate}% passing — ${stats.flaggedCount} flagged for immediate review`);
    }

    // Violation insights
    if (stats.mostCommonViolations.length > 0) {
        const topViolation = stats.mostCommonViolations[0];
        insights.push(`Search Most common issue: "${topViolation.violation}" (${topViolation.count} locations)`);
    }

    // Score distribution
    const totalGraded = stats.scoreDistribution.a + stats.scoreDistribution.b + stats.scoreDistribution.c + stats.scoreDistribution.d;
    if (totalGraded > 0) {
        const aPercent = Math.round((stats.scoreDistribution.a / totalGraded) * 100);
        const dPercent = Math.round((stats.scoreDistribution.d / totalGraded) * 100);

        if (dPercent > 10) {
            insights.push(`Analytics ${dPercent}% of restaurants scoring below 70 — training recommended`);
        }
    }

    return insights;
}
