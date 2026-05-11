/**
 * Pennsylvania Department of Agriculture Retail Food Inspection API
 * Uses PA DSHS/Department of Agriculture inspection data
 */

import { BaseStateAPI, InspectionRecord, EstablishmentMatch, Violation } from './baseStateAPI';

export class PennsylvaniaAPI extends BaseStateAPI {
  // Pennsylvania retail food inspection portal
  private baseUrl = 'https://www.pa.gov/api/food-inspections';

  constructor(apiKey?: string) {
    super('PA', apiKey);
  }

  /**
   * Get inspection history for a Pennsylvania establishment
   * Note: PA API access requires contacting Department of Agriculture
   */
  async getInspections(externalId: string): Promise<InspectionRecord[]> {
    try {
      if (!externalId) {
        console.warn('[PA API] Missing externalId');
        return [];
      }

      // PA API integration in progress
      // Contact: Bureau of Food Safety, PA Department of Agriculture
      // Email: foodsafety@pa.gov
      console.warn(
        '[PA API] Pennsylvania API integration pending - contact PA Department of Agriculture'
      );

      // Placeholder: return empty array
      return [];
    } catch (error) {
      this.handleError('getInspections', error);
      return [];
    }
  }

  /**
   * Search for establishments in Pennsylvania
   */
  async searchEstablishments(query: string): Promise<EstablishmentMatch[]> {
    try {
      // For now, return empty - requires PA API documentation
      console.warn(
        '[PA API] Pennsylvania search API pending - contact Department of Agriculture'
      );
      return [];
    } catch (error) {
      this.handleError('searchEstablishments', error);
      return [];
    }
  }

  /**
   * Parse a single inspection record from PA API response
   */
  private parseRecord(record: any): InspectionRecord | null {
    try {
      if (!record.id && !record.inspectionId) {
        return null;
      }

      const inspectionDate = new Date(
        record.inspectionDate || record.date || new Date()
      );

      return {
        externalId: record.id || record.inspectionId || '',
        establishmentName: record.establishmentName || record.name || 'Unknown',
        establishmentAddress: record.address || record.streetAddress || '',
        inspectionDate,
        inspectorName: record.inspectorName || record.inspector || '',
        violations: this.parseViolations(record.violations || record.findings),
        score: this.parseScore(record.score || record.points) ?? 0,
        grade: this.parseGrade(record.grade || record.rating) ?? 'N/A',
        status: this.mapStatus(record.status || record.result),
        externalURL: this.buildExternalURL(record.id || ''),
        notes: record.notes || record.comments || '',
      };
    } catch (error) {
      console.error('[PA API] Failed to parse record:', error);
      return null;
    }
  }

  /**
   * Parse PA-specific violation format
   */
  private parseViolations(rawViolations: any[]): Violation[] {
    if (!Array.isArray(rawViolations)) {
      return [];
    }

    return rawViolations.map((v) => ({
      code: v.code || v.violationCode || v.id || 'UNKNOWN',
      description: v.description || v.detail || v.violation || 'Unknown violation',
      severity: this.mapSeverity(v.severity || v.priority || 'minor'),
    }));
  }

  /**
   * Map PA inspection status to standard format
   */
  private mapStatus(status: string): 'PASS' | 'FAIL' | 'CONDITIONAL' {
    const normalized = String(status).toUpperCase();

    if (
      normalized.includes('FAIL') ||
      normalized.includes('FAILED') ||
      normalized.includes('VIOLATION') ||
      normalized.includes('CLOSE')
    ) {
      return 'FAIL';
    }

    if (
      normalized.includes('CONDITIONAL') ||
      normalized.includes('REPEAT')
    ) {
      return 'CONDITIONAL';
    }

    return 'PASS';
  }

  /**
   * Build external URL to PA inspection portal
   */
  private buildExternalURL(externalId: string): string {
    if (!externalId) return '';
    return `https://www.pa.gov/food-inspection-reports/${encodeURIComponent(
      externalId
    )}`;
  }
}
