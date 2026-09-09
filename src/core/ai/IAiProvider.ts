// AI Provider Interface & Extensibility Foundation
// FACTORY OS - One Platform for the Shop Floor
// ARCHITECTURAL STATUS: [FOUNDATION ONLY]
// This interface defines the contract for connecting Google Gemini or other LLMs to Factory OS
// without requiring an external API key for standard shop-floor execution.

import { ShiftHandover, KnowledgeCase } from '../../types';

export interface ISmartShiftSummarizer {
  /**
   * Generates natural language shift handover analysis
   */
  generateShiftHandoverSummary(data: {
    lineName: string;
    shiftFrom: string;
    shiftTo: string;
    achievementPct: number;
    actualQty: number;
    targetQty: number;
    downtimes: Array<{ reason: string; duration: number }>;
    defects: Array<{ defect: string; qty: number }>;
    openIssues: Array<{ title: string; pic: string }>;
  }): Promise<{
    summaryText: string;
    keyRiskFactors: string[];
    suggestedMitigations: string[];
    isAiGenerated: boolean;
    providerNote: string;
  }>;
}

export interface IKnowledgeSearchAssistant {
  /**
   * Semantically matches symptoms against previous engineering cases
   */
  findRelevantSolutions(
    symptomQuery: string,
    existingCases: KnowledgeCase[]
  ): Promise<{
    matchedCaseIds: string[];
    synthesizedRecommendation: string;
    confidenceScore: number;
    isAiGenerated: boolean;
    providerNote: string;
  }>;
}

/**
 * Deterministic Fallback Implementation
 * Operates 100% offline and securely on the shop floor without external network or LLM dependency.
 */
export class DeterministicAiFallbackService
  implements ISmartShiftSummarizer, IKnowledgeSearchAssistant
{
  async generateShiftHandoverSummary(data: {
    lineName: string;
    shiftFrom: string;
    shiftTo: string;
    achievementPct: number;
    actualQty: number;
    targetQty: number;
    downtimes: Array<{ reason: string; duration: number }>;
    defects: Array<{ defect: string; qty: number }>;
    openIssues: Array<{ title: string; pic: string }>;
  }) {
    const risks: string[] = [];
    if (data.achievementPct < 90) {
      risks.push(`Production fell short of target (${data.achievementPct}% achievement). Pace lag detected.`);
    }
    if (data.downtimes.length > 2) {
      risks.push(`High frequency of line stops (${data.downtimes.length} events logged).`);
    }
    if (data.defects.length > 0) {
      risks.push(`Active scrap logged across ${data.defects.length} defect categories.`);
    }

    const mitigations = [
      'Conduct 10-minute tooling & feeder verification at shift start.',
      'Check scrap bins and confirm raw material buffer is replenished.',
      'Inspect previous shift workpieces against master limit samples.',
    ];

    const summaryText = `[Deterministic Rule Engine] ${data.lineName} shift handover from ${data.shiftFrom} to ${data.shiftTo}.
Output achievement is ${data.achievementPct}% with ${data.downtimes.length} line interruptions.
Status: ${data.openIssues.length} pending open issue(s).`;

    return {
      summaryText,
      keyRiskFactors: risks.length > 0 ? risks : ['Shift operated within normal operating limits.'],
      suggestedMitigations: mitigations,
      isAiGenerated: false,
      providerNote: 'Generated via Deterministic Shop-Floor Rule Engine (AI Adapter Foundation Ready)',
    };
  }

  async findRelevantSolutions(symptomQuery: string, existingCases: KnowledgeCase[]) {
    const q = symptomQuery.toLowerCase();
    const matches = existingCases.filter(
      (c) =>
        c.symptom.toLowerCase().includes(q) ||
        c.problem.toLowerCase().includes(q) ||
        c.rootCause.toLowerCase().includes(q)
    );

    return {
      matchedCaseIds: matches.map((m) => m.id),
      synthesizedRecommendation:
        matches.length > 0
          ? `Found ${matches.length} matching case(s). Recommended countermeasure: ${matches[0].countermeasure}`
          : 'No historical matches found for this specific symptom pattern. Please document new root cause upon resolution.',
      confidenceScore: matches.length > 0 ? 0.85 : 0.0,
      isAiGenerated: false,
      providerNote: 'Evaluated via Keyword & Symptom Pattern Matcher (LLM Semantic Vector Search Planned)',
    };
  }
}
