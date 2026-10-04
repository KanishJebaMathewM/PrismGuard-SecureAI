export interface GovernmentRecord {
  recordId: string;
  department: string;
  title: string;
  classification: 'Public' | 'Internal' | 'Confidential' | 'Classified';
  description: string;
  effectiveDate: string;
  lastUpdated: string;
}

export const governmentDB: GovernmentRecord[] = [
  { recordId: 'GOV-001', department: 'Department of Finance', title: 'Annual Budget Summary 2026', classification: 'Public', description: 'High-level breakdown of federal allocations for fiscal year 2026.', effectiveDate: '2026-01-01', lastUpdated: '2026-04-12' },
  { recordId: 'GOV-002', department: 'Department of Health', title: 'Public Health Guidelines', classification: 'Public', description: 'Updated public health protocols and pandemic response frameworks.', effectiveDate: '2025-09-01', lastUpdated: '2026-07-20' },
  { recordId: 'GOV-003', department: 'Department of Justice', title: 'Criminal Justice Reform Report', classification: 'Public', description: 'Findings and recommendations from the 2025 criminal justice review committee.', effectiveDate: '2025-12-01', lastUpdated: '2026-01-15' },
  { recordId: 'GOV-004', department: 'Department of Interior', title: 'Infrastructure Maintenance Schedule', classification: 'Internal', description: 'Internal schedule for critical infrastructure maintenance across federal facilities.', effectiveDate: '2026-03-01', lastUpdated: '2026-09-01' },
  { recordId: 'GOV-005', department: 'Department of Defense', title: 'Cybersecurity Framework v3', classification: 'Internal', description: 'Internal guidelines for federal agency cybersecurity compliance.', effectiveDate: '2026-02-15', lastUpdated: '2026-08-10' },
  { recordId: 'GOV-006', department: 'Department of State', title: 'Diplomatic Communications Protocol', classification: 'Confidential', description: 'Protocols for secure diplomatic communications between allied nations.', effectiveDate: '2025-06-01', lastUpdated: '2026-05-18' },
  { recordId: 'GOV-007', department: 'Department of Energy', title: 'Nuclear Facility Inspection Report', classification: 'Confidential', description: 'Detailed inspection findings from regulated nuclear facilities.', effectiveDate: '2026-07-01', lastUpdated: '2026-09-30' },
  { recordId: 'GOV-008', department: 'National Security Agency', title: 'Threat Intelligence Briefing Q3 2026', classification: 'Classified', description: 'Classified intelligence assessment of current geopolitical threats.', effectiveDate: '2026-07-01', lastUpdated: '2026-10-01' },
  { recordId: 'GOV-009', department: 'Central Intelligence', title: 'Operational Asset Registry', classification: 'Classified', description: 'Registry of active intelligence operations and associated assets.', effectiveDate: '2026-01-01', lastUpdated: '2026-10-02' },
  { recordId: 'GOV-010', department: 'Department of Commerce', title: 'Trade Statistics 2026', classification: 'Public', description: 'Import/export statistics and trade balance data for fiscal year 2026.', effectiveDate: '2026-08-01', lastUpdated: '2026-09-15' },
];

export const governmentPolicies = [
  { id: 'pol-1', title: 'Data Retention Policy', details: 'Government records must be retained for a minimum of 7 years. Electronic records require encrypted backups.', classification: 'Public' },
  { id: 'pol-2', title: 'Freedom of Information Act (FOIA)', details: 'Citizens may request access to Public-classified government records. Requests must be fulfilled within 20 business days.', classification: 'Public' },
  { id: 'pol-3', title: 'Privacy Act Compliance', details: 'Federal agencies are prohibited from disclosing personally identifiable information without written consent.', classification: 'Public' },
  { id: 'pol-4', title: 'Cybersecurity Executive Order', details: 'All federal agencies must implement zero-trust architecture by 2027 and undergo annual security audits.', classification: 'Public' },
  { id: 'pol-5', title: 'Classified Information Handling', details: 'Classified materials require Top Secret clearance. Unauthorized access or disclosure is a federal offense.', classification: 'Internal' },
  { id: 'pol-6', title: 'Inter-Agency Data Sharing Protocol', details: 'Defines secure channels and approval processes for sharing Internal-classified data across departments.', classification: 'Internal' },
];
