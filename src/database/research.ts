export interface ResearchPaper {
  paperId: string;
  title: string;
  authors: string[];
  topic: string;
  abstract: string;
  publishedDate: string;
  citations: number;
  access: 'Open' | 'Restricted';
}

export const researchDB: ResearchPaper[] = [
  { paperId: 'PAP-001', title: 'Quantum Error Correction Advances', authors: ['Smith, J.', 'Lee, K.'], topic: 'quantum computing', abstract: 'Novel surface code approaches that reduce logical error rates by 40% on near-term quantum hardware.', publishedDate: '2025-08-15', citations: 142, access: 'Open' },
  { paperId: 'PAP-002', title: 'AI Safety via Debate', authors: ['Amodei, D.', 'Irving, G.'], topic: 'AI safety', abstract: 'A framework where AI systems argue opposing positions to expose flaws, enabling scalable oversight of superhuman AI.', publishedDate: '2025-06-20', citations: 318, access: 'Open' },
  { paperId: 'PAP-003', title: 'Post-Quantum Cryptography Standards', authors: ['Chen, L.', 'Moody, D.', 'Perlner, R.'], topic: 'cryptography', abstract: 'Analysis and comparison of NIST-selected post-quantum cryptographic algorithms for secure communications.', publishedDate: '2025-09-01', citations: 209, access: 'Open' },
  { paperId: 'PAP-004', title: 'Climate Tipping Points 2025 Review', authors: ['Hansen, J.', 'Sato, M.'], topic: 'climate data', abstract: 'Comprehensive review of global tipping points and their interconnected feedback loops based on 2024 observational data.', publishedDate: '2025-11-10', citations: 87, access: 'Open' },
  { paperId: 'PAP-005', title: 'CRISPR Genomic Editing Safety Benchmarks', authors: ['Doudna, J.', 'Zhang, F.'], topic: 'genomics', abstract: 'Safety benchmarks and off-target effect profiles for therapeutic CRISPR applications across 12 human cell lines.', publishedDate: '2026-01-05', citations: 55, access: 'Restricted' },
  { paperId: 'PAP-006', title: 'Large Language Model Alignment Survey', authors: ['Ouyang, L.', 'Wu, J.', 'Jiang, X.'], topic: 'AI safety', abstract: 'A survey of reinforcement learning from human feedback (RLHF) and constitutional AI approaches for LLM alignment.', publishedDate: '2025-04-18', citations: 521, access: 'Open' },
  { paperId: 'PAP-007', title: 'Scalable Quantum Networking Protocols', authors: ['Kimble, H.J.', 'Duan, L.M.'], topic: 'quantum computing', abstract: 'Distributed entanglement protocols enabling multi-node quantum networks with sub-millisecond synchronization.', publishedDate: '2026-03-22', citations: 78, access: 'Open' },
  { paperId: 'PAP-008', title: 'Homomorphic Encryption in Cloud Storage', authors: ['Gentry, C.', 'Halevi, S.'], topic: 'cryptography', abstract: 'Practical fully homomorphic encryption scheme optimized for cloud data processing with 10x performance improvement.', publishedDate: '2025-12-01', citations: 193, access: 'Open' },
  { paperId: 'PAP-009', title: 'Arctic Ice Core Dataset Analysis', authors: ['Petit, J.R.', 'Jouzel, J.'], topic: 'climate data', abstract: 'Re-analysis of 800,000-year ice core records revealing 12 previously undetected rapid climate oscillation events.', publishedDate: '2026-02-14', citations: 41, access: 'Restricted' },
  { paperId: 'PAP-010', title: 'Federated Learning for Genomic Privacy', authors: ['McMahan, B.', 'Ramage, D.'], topic: 'genomics', abstract: 'Privacy-preserving federated training on distributed genomic datasets without raw data sharing across institutions.', publishedDate: '2026-05-30', citations: 104, access: 'Open' },
];

export const datasets = [
  { id: 'ds-1', name: 'Climate Observations 2024', size: '2.4 GB', access: 'Open', records: 120000, description: 'Global temperature, precipitation, and atmospheric CO2 measurements from 4,200 stations.' },
  { id: 'ds-2', name: 'Quantum Circuit Benchmarks', size: '840 MB', access: 'Open', records: 35000, description: 'Standardized benchmarking results for 50-qubit circuits across 8 quantum hardware platforms.' },
  { id: 'ds-3', name: 'NLP Adversarial Prompt Corpus', size: '1.2 GB', access: 'Open', records: 250000, description: 'Curated collection of adversarial prompts and safety-relevant text samples for LLM evaluation.' },
  { id: 'ds-4', name: 'Human Genome Variant Database', size: '18.7 GB', access: 'Restricted', records: 6500000, description: 'Annotated genomic variants from 50,000 de-identified donors across 5 ethnic groups.' },
  { id: 'ds-5', name: 'Global Economic Indicators 2025', size: '320 MB', access: 'Open', records: 42000, description: 'GDP, inflation, unemployment, and trade balance data for 195 countries from 2000-2025.' },
  { id: 'ds-6', name: 'Cryptographic Vulnerability Catalog', size: '95 MB', access: 'Restricted', records: 8200, description: 'Classified vulnerability data for legacy cryptographic protocols under active remediation.' },
];
