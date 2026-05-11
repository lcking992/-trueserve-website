/**
 * Franchise Analytics - Aggregates compliance metrics across multiple restaurant locations
 * Supports flexible franchise structures (multi-location owners, single-location merchants)
 */

import type { RestaurantComplianceMetrics } from "./complianceAnalytics";

export type FranchiseMetrics = {
    restaurantId?: string;
    franchiseName?: string;
    locationCount: number;
    averageScore: number;
    medianScore: number;
    passRate: number; // % of locations with PASS status
    flaggedCount: number;
    locations: RestaurantComplianceMetrics[];
    aggregateGradeDistribution: {
        a: number;
        b: number;
        c: number;
        d: number;
    };
    lowestScoringLocation?: RestaurantComplianceMetrics;
    highestScoringLocation?: RestaurantComplianceMetrics;
};

/**
 * Calculate franchise-level metrics from multiple restaurant locations
 */
export function calculateFranchiseMetrics(
    locations: RestaurantComplianceMetrics[]
): FranchiseMetrics {
    if (locations.length === 0) {
        return {
            locationCount: 0,
            averageScore: 0,
            medianScore: 0,
            passRate: 0,
            flaggedCount: 0,
            locations: [],
            aggregateGradeDistribution: { a: 0, b: 0, c: 0, d: 0 },
        };
    }

    // Calculate scores
    const scores = locations
        .map((r) => r.complianceScore)
        .filter((s) => typeof s === "number" && s >= 0)
        .sort((a, b) => a - b);

    const averageScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const medianScore =
        scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0;

    // Calculate pass rate
    const passingCount = locations.filter(
        (r) => r.complianceStatus === "PASS"
    ).length;
    const passRate = locations.length > 0 ? Math.round((passingCount / locations.length) * 100) : 0;

    // Count flagged
    const flaggedCount = locations.filter(
        (r) => r.complianceStatus === "FLAGGED"
    ).length;

    // Grade distribution
    const distribution = { a: 0, b: 0, c: 0, d: 0 };
    for (const location of locations) {
        const score = location.complianceScore || 0;
        if (score >= 90) distribution.a++;
        else if (score >= 80) distribution.b++;
        else if (score >= 70) distribution.c++;
        else distribution.d++;
    }

    // Find best and worst performing locations
    const sorted = [...locations].sort((a, b) => b.complianceScore - a.complianceScore);
    const highestScoringLocation = sorted[0];
    const lowestScoringLocation = sorted[sorted.length - 1];

    return {
        locationCount: locations.length,
        averageScore,
        medianScore,
        passRate,
        flaggedCount,
        locations,
        aggregateGradeDistribution: distribution,
        lowestScoringLocation,
        highestScoringLocation,
    };
}

/**
 * Generate franchise-level insights from metrics
 */
export function generateFranchiseInsights(metrics: FranchiseMetrics): string[] {
    const insights: string[] = [];

    // Location count insight
    if (metrics.locationCount === 1) {
        insights.push("Location Single location franchise");
    } else {
        insights.push(`Restaurant ${metrics.locationCount} locations managed`);
    }

    // Average score insight
    if (metrics.averageScore >= 90) {
        insights.push(`Rating Excellent network average: ${metrics.averageScore}/100`);
    } else if (metrics.averageScore >= 80) {
        insights.push(`Done Good network average: ${metrics.averageScore}/100`);
    } else if (metrics.averageScore >= 70) {
        insights.push(`Warning Network average: ${metrics.averageScore}/100 — improvement needed`);
    } else {
        insights.push(`Urgent Critical: Network average is ${metrics.averageScore}/100`);
    }

    // Pass rate insight
    if (metrics.passRate === 100) {
        insights.push("Done All locations passing compliance");
    } else if (metrics.passRate >= 80) {
        insights.push(`Done ${metrics.passRate}% of locations passing`);
    } else if (metrics.passRate >= 50) {
        insights.push(`Warning Only ${metrics.passRate}% passing — ${metrics.flaggedCount} need attention`);
    } else {
        insights.push(`Urgent Majority of locations flagged — immediate action required`);
    }

    // Grade distribution insight
    const total =
        metrics.aggregateGradeDistribution.a +
        metrics.aggregateGradeDistribution.b +
        metrics.aggregateGradeDistribution.c +
        metrics.aggregateGradeDistribution.d;

    if (total > 0) {
        const aPercent = Math.round((metrics.aggregateGradeDistribution.a / total) * 100);
        const dPercent = Math.round((metrics.aggregateGradeDistribution.d / total) * 100);

        if (aPercent >= 50) {
            insights.push(`Green ${aPercent}% of locations with grade A`);
        } else if (dPercent > 20) {
            insights.push(`Red ${dPercent}% of locations below grade C`);
        }
    }

    // Performance outlier insight
    if (metrics.lowestScoringLocation && metrics.highestScoringLocation) {
        const gap = metrics.highestScoringLocation.complianceScore -
            metrics.lowestScoringLocation.complianceScore;

        if (gap > 20) {
            insights.push(
                `Analytics Large performance gap: ${metrics.highestScoringLocation.name} (${metrics.highestScoringLocation.complianceScore}) vs ` +
                    `${metrics.lowestScoringLocation.name} (${metrics.lowestScoringLocation.complianceScore})`
            );
        }
    }

    return insights;
}
