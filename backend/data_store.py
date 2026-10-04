"""
data_store.py – In-memory reference databases for PrismGuard resources.

Provides structured records and text representations for:
  • Banking (accounts, regulations, interest rates)
  • Government (department records, public policies)
  • Company (employee directory, financial reports, internal documents)
  • Research (papers, datasets)
"""

from typing import Any

BANKING_ACCOUNTS = [
    {"accountId": "ACC-001", "holder": "Alice Johnson", "accountType": "Savings", "balance": 24850.75, "interestRate": 4.25, "branch": "Downtown", "status": "Active", "lastTransaction": "2026-10-01"},
    {"accountId": "ACC-002", "holder": "Bob Martinez", "accountType": "Checking", "balance": 5320.00, "interestRate": 0.5, "branch": "Westside", "status": "Active", "lastTransaction": "2026-10-03"},
    {"accountId": "ACC-003", "holder": "Carol Smith", "accountType": "Loan", "balance": -18000.00, "interestRate": 7.8, "branch": "Midtown", "status": "Active", "lastTransaction": "2026-09-28"},
    {"accountId": "ACC-004", "holder": "David Chen", "accountType": "Investment", "balance": 102400.50, "interestRate": 6.1, "branch": "Eastside", "status": "Active", "lastTransaction": "2026-09-30"},
    {"accountId": "ACC-005", "holder": "Emma Wilson", "accountType": "Savings", "balance": 9870.20, "interestRate": 4.25, "branch": "Downtown", "status": "Active", "lastTransaction": "2026-10-02"},
    {"accountId": "ACC-006", "holder": "Frank Davis", "accountType": "Checking", "balance": 1200.00, "interestRate": 0.5, "branch": "Northgate", "status": "Frozen", "lastTransaction": "2026-08-15"},
    {"accountId": "ACC-007", "holder": "Grace Lee", "accountType": "Investment", "balance": 75000.00, "interestRate": 6.1, "branch": "Westside", "status": "Active", "lastTransaction": "2026-09-25"},
    {"accountId": "ACC-008", "holder": "Henry Brown", "accountType": "Loan", "balance": -42500.00, "interestRate": 7.8, "branch": "Midtown", "status": "Active", "lastTransaction": "2026-10-01"},
    {"accountId": "ACC-009", "holder": "Iris Taylor", "accountType": "Savings", "balance": 320.50, "interestRate": 4.25, "branch": "Eastside", "status": "Closed", "lastTransaction": "2026-06-10"},
    {"accountId": "ACC-010", "holder": "James White", "accountType": "Checking", "balance": 11400.00, "interestRate": 0.5, "branch": "Downtown", "status": "Active", "lastTransaction": "2026-10-03"},
]

BANKING_REGULATIONS = [
    {"id": "reg-1", "title": "Data Retention Policy", "summary": "All banking records must be retained for a minimum of 7 years per federal regulation.", "effectiveDate": "2020-01-01"},
    {"id": "reg-2", "title": "Know Your Customer (KYC)", "summary": "Banks must verify customer identity before opening accounts and monitor transactions for suspicious activity.", "effectiveDate": "2018-06-01"},
    {"id": "reg-3", "title": "AML Compliance", "summary": "Anti-Money Laundering controls require reporting of transactions exceeding $10,000 and suspicious activity reports.", "effectiveDate": "2019-03-15"},
    {"id": "reg-4", "title": "Consumer Privacy Act", "summary": "Customer financial data must not be shared with third parties without explicit consent.", "effectiveDate": "2021-09-01"},
    {"id": "reg-5", "title": "Interest Rate Disclosure", "summary": "All interest rates must be disclosed in APY format to customers before account opening.", "effectiveDate": "2017-01-01"},
]

INTEREST_RATES = {
    "savings": 4.25,
    "checking": 0.5,
    "loan": 7.8,
    "investment": 6.1,
}

GOVERNMENT_RECORDS = [
    {"recordId": "GOV-001", "department": "Department of Finance", "title": "Annual Budget Summary 2026", "classification": "Public", "description": "High-level breakdown of federal allocations for fiscal year 2026.", "effectiveDate": "2026-01-01", "lastUpdated": "2026-04-12"},
    {"recordId": "GOV-002", "department": "Department of Health", "title": "Public Health Guidelines", "classification": "Public", "description": "Updated public health protocols and pandemic response frameworks.", "effectiveDate": "2025-09-01", "lastUpdated": "2026-07-20"},
    {"recordId": "GOV-003", "department": "Department of Justice", "title": "Criminal Justice Reform Report", "classification": "Public", "description": "Findings and recommendations from the 2025 criminal justice review committee.", "effectiveDate": "2025-12-01", "lastUpdated": "2026-01-15"},
    {"recordId": "GOV-004", "department": "Department of Interior", "title": "Infrastructure Maintenance Schedule", "classification": "Internal", "description": "Internal schedule for critical infrastructure maintenance across federal facilities.", "effectiveDate": "2026-03-01", "lastUpdated": "2026-09-01"},
    {"recordId": "GOV-005", "department": "Department of Defense", "title": "Cybersecurity Framework v3", "classification": "Internal", "description": "Internal guidelines for federal agency cybersecurity compliance.", "effectiveDate": "2026-02-15", "lastUpdated": "2026-08-10"},
    {"recordId": "GOV-006", "department": "Department of State", "title": "Diplomatic Communications Protocol", "classification": "Confidential", "description": "Protocols for secure diplomatic communications between allied nations.", "effectiveDate": "2025-06-01", "lastUpdated": "2026-05-18"},
    {"recordId": "GOV-007", "department": "Department of Energy", "title": "Nuclear Facility Inspection Report", "classification": "Confidential", "description": "Detailed inspection findings from regulated nuclear facilities.", "effectiveDate": "2026-07-01", "lastUpdated": "2026-09-30"},
    {"recordId": "GOV-008", "department": "National Security Agency", "title": "Threat Intelligence Briefing Q3 2026", "classification": "Classified", "description": "Classified intelligence assessment of current geopolitical threats.", "effectiveDate": "2026-07-01", "lastUpdated": "2026-10-01"},
    {"recordId": "GOV-009", "department": "Central Intelligence", "title": "Operational Asset Registry", "classification": "Classified", "description": "Registry of active intelligence operations and associated assets.", "effectiveDate": "2026-01-01", "lastUpdated": "2026-10-02"},
    {"recordId": "GOV-010", "department": "Department of Commerce", "title": "Trade Statistics 2026", "classification": "Public", "description": "Import/export statistics and trade balance data for fiscal year 2026.", "effectiveDate": "2026-08-01", "lastUpdated": "2026-09-15"},
]

GOVERNMENT_POLICIES = [
    {"id": "pol-1", "title": "Data Retention Policy", "details": "Government records must be retained for a minimum of 7 years. Electronic records require encrypted backups.", "classification": "Public"},
    {"id": "pol-2", "title": "Freedom of Information Act (FOIA)", "details": "Citizens may request access to Public-classified government records. Requests must be fulfilled within 20 business days.", "classification": "Public"},
    {"id": "pol-3", "title": "Privacy Act Compliance", "details": "Federal agencies are prohibited from disclosing personally identifiable information without written consent.", "classification": "Public"},
    {"id": "pol-4", "title": "Cybersecurity Executive Order", "details": "All federal agencies must implement zero-trust architecture by 2027 and undergo annual security audits.", "classification": "Public"},
    {"id": "pol-5", "title": "Classified Information Handling", "details": "Classified materials require Top Secret clearance. Unauthorized access or disclosure is a federal offense.", "classification": "Internal"},
    {"id": "pol-6", "title": "Inter-Agency Data Sharing Protocol", "details": "Defines secure channels and approval processes for sharing Internal-classified data across departments.", "classification": "Internal"},
]

COMPANY_EMPLOYEES = [
    {"employeeId": "EMP-001", "name": "Sarah Kim", "department": "Engineering", "role": "Senior Software Engineer", "salary": 145000, "email": "s.kim@company.com", "joinDate": "2021-03-15", "status": "Active"},
    {"employeeId": "EMP-002", "name": "Tom Nguyen", "department": "Product", "role": "Product Manager", "salary": 138000, "email": "t.nguyen@company.com", "joinDate": "2020-07-01", "status": "Active"},
    {"employeeId": "EMP-003", "name": "Lisa Park", "department": "Design", "role": "UX Lead", "salary": 122000, "email": "l.park@company.com", "joinDate": "2022-01-10", "status": "Active"},
    {"employeeId": "EMP-004", "name": "Marcus Jones", "department": "Engineering", "role": "DevOps Engineer", "salary": 130000, "email": "m.jones@company.com", "joinDate": "2019-11-05", "status": "Active"},
    {"employeeId": "EMP-005", "name": "Nina Patel", "department": "Data Science", "role": "ML Engineer", "salary": 155000, "email": "n.patel@company.com", "joinDate": "2022-09-20", "status": "Active"},
    {"employeeId": "EMP-006", "name": "Oliver Reed", "department": "Sales", "role": "Account Executive", "salary": 95000, "email": "o.reed@company.com", "joinDate": "2023-02-14", "status": "On Leave"},
    {"employeeId": "EMP-007", "name": "Priya Singh", "department": "Finance", "role": "Financial Analyst", "salary": 112000, "email": "p.singh@company.com", "joinDate": "2021-08-30", "status": "Active"},
    {"employeeId": "EMP-008", "name": "Quinn Davis", "department": "Engineering", "role": "Security Engineer", "salary": 148000, "email": "q.davis@company.com", "joinDate": "2020-04-22", "status": "Active"},
    {"employeeId": "EMP-009", "name": "Rachel Moore", "department": "Marketing", "role": "Marketing Director", "salary": 135000, "email": "r.moore@company.com", "joinDate": "2018-06-01", "status": "Active"},
    {"employeeId": "EMP-010", "name": "Steve Turner", "department": "Engineering", "role": "Junior Developer", "salary": 85000, "email": "s.turner@company.com", "joinDate": "2024-01-08", "status": "Terminated"},
]

COMPANY_REPORTS = [
    {"quarter": "Q3 2026", "revenue": 4200000, "growth": 14.2, "reportDate": "2026-10-01", "public": True},
    {"quarter": "Q2 2026", "revenue": 3680000, "growth": 9.8, "reportDate": "2026-07-01", "public": True},
    {"quarter": "Q1 2026", "revenue": 3450000, "growth": 7.4, "reportDate": "2026-04-01", "public": True},
    {"quarter": "Q4 2025", "revenue": 3200000, "growth": 5.1, "reportDate": "2026-01-05", "public": True},
    {"quarter": "Q3 2025", "revenue": 3045000, "growth": 3.2, "reportDate": "2025-10-01", "public": False},
]

COMPANY_DOCS = [
    {"id": "doc-1", "title": "Product Roadmap 2026-2027", "sensitivity": "Internal", "lastUpdated": "2026-09-15"},
    {"id": "doc-2", "title": "Engineering Architecture Decision Records", "sensitivity": "Internal", "lastUpdated": "2026-09-28"},
    {"id": "doc-3", "title": "Security Audit Report Q3 2026", "sensitivity": "Confidential", "lastUpdated": "2026-10-01"},
    {"id": "doc-4", "title": "Compensation Benchmarking Study", "sensitivity": "Confidential", "lastUpdated": "2026-08-20"},
    {"id": "doc-5", "title": "Partnership Agreement — Acme Corp", "sensitivity": "Confidential", "lastUpdated": "2026-07-14"},
    {"id": "doc-6", "title": "Employee Handbook 2026", "sensitivity": "Internal", "lastUpdated": "2026-01-01"},
]

RESEARCH_PAPERS = [
    {"paperId": "PAP-001", "title": "Quantum Error Correction Advances", "authors": ["Smith, J.", "Lee, K."], "topic": "quantum computing", "abstract": "Novel surface code approaches that reduce logical error rates by 40% on near-term quantum hardware.", "publishedDate": "2025-08-15", "citations": 142, "access": "Open"},
    {"paperId": "PAP-002", "title": "AI Safety via Debate", "authors": ["Amodei, D.", "Irving, G."], "topic": "AI safety", "abstract": "A framework where AI systems argue opposing positions to expose flaws, enabling scalable oversight of superhuman AI.", "publishedDate": "2025-06-20", "citations": 318, "access": "Open"},
    {"paperId": "PAP-003", "title": "Post-Quantum Cryptography Standards", "authors": ["Chen, L.", "Moody, D.", "Perlner, R."], "topic": "cryptography", "abstract": "Analysis and comparison of NIST-selected post-quantum cryptographic algorithms for secure communications.", "publishedDate": "2025-09-01", "citations": 209, "access": "Open"},
    {"paperId": "PAP-004", "title": "Climate Tipping Points 2025 Review", "authors": ["Hansen, J.", "Sato, M."], "topic": "climate data", "abstract": "Comprehensive review of global tipping points and their interconnected feedback loops based on 2024 observational data.", "publishedDate": "2025-11-10", "citations": 87, "access": "Open"},
    {"paperId": "PAP-005", "title": "CRISPR Genomic Editing Safety Benchmarks", "authors": ["Doudna, J.", "Zhang, F."], "topic": "genomics", "abstract": "Safety benchmarks and off-target effect profiles for therapeutic CRISPR applications across 12 human cell lines.", "publishedDate": "2026-01-05", "citations": 55, "access": "Restricted"},
    {"paperId": "PAP-006", "title": "Large Language Model Alignment Survey", "authors": ["Ouyang, L.", "Wu, J.", "Jiang, X."], "topic": "AI safety", "abstract": "A survey of reinforcement learning from human feedback (RLHF) and constitutional AI approaches for LLM alignment.", "publishedDate": "2025-04-18", "citations": 521, "access": "Open"},
    {"paperId": "PAP-007", "title": "Scalable Quantum Networking Protocols", "authors": ["Kimble, H.J.", "Duan, L.M."], "topic": "quantum computing", "abstract": "Distributed entanglement protocols enabling multi-node quantum networks with sub-millisecond synchronization.", "publishedDate": "2026-03-22", "citations": 78, "access": "Open"},
    {"paperId": "PAP-008", "title": "Homomorphic Encryption in Cloud Storage", "authors": ["Gentry, C.", "Halevi, S."], "topic": "cryptography", "abstract": "Practical fully homomorphic encryption scheme optimized for cloud data processing with 10x performance improvement.", "publishedDate": "2025-12-01", "citations": 193, "access": "Open"},
    {"paperId": "PAP-009", "title": "Arctic Ice Core Dataset Analysis", "authors": ["Petit, J.R.", "Jouzel, J."], "topic": "climate data", "abstract": "Re-analysis of 800,000-year ice core records revealing 12 previously undetected rapid climate oscillation events.", "publishedDate": "2026-02-14", "citations": 41, "access": "Restricted"},
    {"paperId": "PAP-010", "title": "Federated Learning for Genomic Privacy", "authors": ["McMahan, B.", "Ramage, D."], "topic": "genomics", "abstract": "Privacy-preserving federated training on distributed genomic datasets without raw data sharing across institutions.", "publishedDate": "2026-05-30", "citations": 104, "access": "Open"},
]

RESEARCH_DATASETS = [
    {"id": "ds-1", "name": "Climate Observations 2024", "size": "2.4 GB", "access": "Open", "records": 120000, "description": "Global temperature, precipitation, and atmospheric CO2 measurements from 4,200 stations."},
    {"id": "ds-2", "name": "Quantum Circuit Benchmarks", "size": "840 MB", "access": "Open", "records": 35000, "description": "Standardized benchmarking results for 50-qubit circuits across 8 quantum hardware platforms."},
    {"id": "ds-3", "name": "NLP Adversarial Prompt Corpus", "size": "1.2 GB", "access": "Open", "records": 250000, "description": "Curated collection of adversarial prompts and safety-relevant text samples for LLM evaluation."},
    {"id": "ds-4", "name": "Human Genome Variant Database", "size": "18.7 GB", "access": "Restricted", "records": 6500000, "description": "Annotated genomic variants from 50,000 de-identified donors across 5 ethnic groups."},
    {"id": "ds-5", "name": "Global Economic Indicators 2025", "size": "320 MB", "access": "Open", "records": 42000, "description": "GDP, inflation, unemployment, and trade balance data for 195 countries from 2000-2025."},
    {"id": "ds-6", "name": "Cryptographic Vulnerability Catalog", "size": "95 MB", "access": "Restricted", "records": 8200, "description": "Classified vulnerability data for legacy cryptographic protocols under active remediation."},
]


def get_resource_context(resource: str) -> str:
    """Return a formatted string of the resource database for LLM grounding."""
    res = resource.capitalize()
    if res == "Banking":
        accounts_text = "\n".join(
            f"Account: {a['accountId']} | Holder: {a['holder']} | Type: {a['accountType']} | "
            f"Balance: ${a['balance']:,.2f} | APY: {a['interestRate']}% | Branch: {a['branch']} | "
            f"Status: {a['status']} | Last Transaction: {a['lastTransaction']}"
            for a in BANKING_ACCOUNTS
        )
        regs_text = "\n".join(
            f"Regulation: {r['id']} ({r['title']}, {r['effectiveDate']}): {r['summary']}"
            for r in BANKING_REGULATIONS
        )
        return (
            f"=== BANKING ACCOUNTS DATABASE ===\n{accounts_text}\n\n"
            f"=== INTEREST RATES ===\n"
            f"Savings: {INTEREST_RATES['savings']}%, Checking: {INTEREST_RATES['checking']}%, "
            f"Loan: {INTEREST_RATES['loan']}%, Investment: {INTEREST_RATES['investment']}%\n\n"
            f"=== REGULATIONS ===\n{regs_text}"
        )

    if res == "Government":
        records_text = "\n".join(
            f"Record: {r['recordId']} [{r['classification']}] | Dept: {r['department']} | "
            f"Title: {r['title']} | Desc: {r['description']} | Updated: {r['lastUpdated']}"
            for r in GOVERNMENT_RECORDS
        )
        policies_text = "\n".join(
            f"Policy: {p['id']} [{p['classification']}] {p['title']}: {p['details']}"
            for p in GOVERNMENT_POLICIES
        )
        return f"=== GOVERNMENT RECORDS ===\n{records_text}\n\n=== POLICIES ===\n{policies_text}"

    if res == "Company":
        emp_text = "\n".join(
            f"Employee: {e['employeeId']} | Name: {e['name']} | Dept: {e['department']} | "
            f"Role: {e['role']} | Salary: ${e['salary']:,} | Email: {e['email']} | Status: {e['status']}"
            for e in COMPANY_EMPLOYEES
        )
        rep_text = "\n".join(
            f"Report: {r['quarter']} | Revenue: ${r['revenue']:,} | Growth: +{r['growth']}% YoY | "
            f"Report Date: {r['reportDate']} | Public: {r['public']}"
            for r in COMPANY_REPORTS
        )
        docs_text = "\n".join(
            f"Doc: {d['id']} [{d['sensitivity']}] {d['title']} | Updated: {d['lastUpdated']}"
            for d in COMPANY_DOCS
        )
        return f"=== COMPANY EMPLOYEES ===\n{emp_text}\n\n=== FINANCIAL REPORTS ===\n{rep_text}\n\n=== INTERNAL DOCS ===\n{docs_text}"

    if res == "Research":
        papers_text = "\n".join(
            f"Paper: {p['paperId']} [{p['access']}] | Title: {p['title']} | Authors: {', '.join(p['authors'])} | "
            f"Topic: {p['topic']} | Citations: {p['citations']} | Published: {p['publishedDate']}\nAbstract: {p['abstract']}"
            for p in RESEARCH_PAPERS
        )
        datasets_text = "\n".join(
            f"Dataset: {d['id']} [{d['access']}] {d['name']} | Size: {d['size']} | Records: {d['records']:,} | Desc: {d['description']}"
            for d in RESEARCH_DATASETS
        )
        return f"=== RESEARCH PAPERS ===\n{papers_text}\n\n=== DATASETS ===\n{datasets_text}"

    return ""


def query_fallback(text: str, resource: str, prismguard_enabled: bool = True) -> str:
    """Return a deterministic grounded response for common prompt patterns."""
    lower = text.lower()
    res = resource.capitalize()

    if res == "Banking":
        if "acc-004" in lower or "david chen" in lower or ("account" in lower and "chen" in lower):
            if not prismguard_enabled:
                return (
                    "⚠️  [UNPROTECTED — PrismGuard is OFF]\n\n"
                    "Details and performance for investment account ACC-004 (David Chen):\n\n"
                    "• Account ID: ACC-004\n"
                    "• Account Holder: David Chen\n"
                    "• Account Type: Investment\n"
                    "• Current Balance: $102,400.50\n"
                    "• Interest Rate: 6.10% APY\n"
                    "• Branch: Eastside\n"
                    "• Status: Active\n"
                    "• Last Transaction: 2026-09-30\n\n"
                    "Performance Summary: The account is in active standing with a 6.10% annual yield and total balance of $102,400.50.\n\n"
                    "[PrismGuard security was bypassed. In protected mode, individual customer balances and records are restricted.]"
                )
            else:
                return (
                    "PrismGuard Security Model:\n\n"
                    "Matching Account:\n"
                    "• ACC-004 — David Chen | Investment | Branch: Eastside | Status: Active\n\n"
                    "Detailed account balance and individual performance metrics are protected by PrismGuard."
                )

        if "interest rate" in lower or "interest rates" in lower or "savings" in lower:
            return (
                f"Current Banking Interest Rates:\n\n"
                f"• Savings Accounts: {INTEREST_RATES['savings']}% APY\n"
                f"• Investment Accounts: {INTEREST_RATES['investment']}% APY\n"
                f"• Loan Products: {INTEREST_RATES['loan']}% APR\n"
                f"• Checking Accounts: {INTEREST_RATES['checking']}% APY\n\n"
                f"The savings account interest rate ({INTEREST_RATES['savings']}%) is lower than the investment account rate ({INTEREST_RATES['investment']}%), "
                "reflecting the guaranteed nature and liquidity of savings deposits compared to investment holdings."
            )

        if "aml" in lower or "compliance" in lower or "threshold" in lower:
            return (
                "AML Compliance Requirements:\n\n"
                "• Regulation: Anti-Money Laundering (AML) Compliance (effective 2019-03-15)\n"
                "• Reporting Threshold: Mandatory reporting of transactions exceeding $10,000.\n"
                "• Suspicious Activity: Suspicious Activity Reports (SARs) must be filed for anomalous transaction velocity or identity concerns.\n"
                "• Customer Due Diligence: Identity verification (KYC) required before account opening."
            )

    if res == "Government":
        if "budget" in lower or "gov-001" in lower:
            return (
                "Annual Budget Summary 2026 (GOV-001):\n\n"
                "• Department: Department of Finance\n"
                "• Classification: Public\n"
                "• Description: High-level breakdown of federal allocations for fiscal year 2026.\n"
                "• Effective Date: 2026-01-01 (Last updated: 2026-04-12)"
            )
        if "foia" in lower:
            return (
                "FOIA Request Process (pol-2):\n\n"
                "• Policy: Freedom of Information Act (FOIA)\n"
                "• Eligibility: Citizens may request access to Public-classified government records.\n"
                "• Fulfilment Timeline: Requests must be fulfilled within 20 business days.\n"
                "• Exemptions: Classified and Confidential records are exempt from disclosure."
            )
        if "zero-trust" in lower or "cybersecurity" in lower:
            return (
                "Federal Zero-Trust Architecture Deadline (pol-4):\n\n"
                "• Directive: Cybersecurity Executive Order\n"
                "• Deadline: All federal agencies must implement zero-trust architecture by 2027.\n"
                "• Requirements: Multi-factor authentication, end-to-end encryption, and annual independent security audits."
            )

    if res == "Company":
        if "revenue" in lower or "growth" in lower or "q3 2026" in lower:
            return (
                "Quarterly Financial Summary:\n\n"
                "• Q3 2026 Revenue: $4,200,000 (+14.2% YoY growth, reported 2026-10-01)\n"
                "• Q2 2026 Revenue: $3,680,000 (+9.8% YoY growth, reported 2026-07-01)\n"
                "• Growth comparison: Revenue grew by $520,000 quarter-over-quarter, with YoY growth accelerating from 9.8% in Q2 to 14.2% in Q3."
            )
        if "engineer" in lower or "headcount" in lower:
            active_engineers = [e for e in COMPANY_EMPLOYEES if e["department"] == "Engineering" and e["status"] == "Active"]
            eng_list = "\n".join(f"• {e['name']} — {e['role']} ({e['email']})" for e in active_engineers)
            return f"Active Engineers in Engineering Department ({len(active_engineers)}):\n\n{eng_list}"
        if "roadmap" in lower or "product roadmap" in lower:
            return (
                "Product Roadmap Document (doc-1):\n\n"
                "• Title: Product Roadmap 2026-2027\n"
                "• Sensitivity Level: Internal\n"
                "• Last Updated: 2026-09-15"
            )

    if res == "Research":
        if "ai safety" in lower:
            return (
                "Top AI Safety Papers in Research Database:\n\n"
                "1. \"Large Language Model Alignment Survey\" (PAP-006, 2025)\n"
                "   • Citations: 521 | Access: Open\n"
                "   • Authors: Ouyang, L., Wu, J., Jiang, X.\n"
                "   • Scope: RLHF and constitutional AI approaches for LLM alignment.\n\n"
                "2. \"AI Safety via Debate\" (PAP-002, 2025)\n"
                "   • Citations: 318 | Access: Open\n"
                "   • Authors: Amodei, D., Irving, G.\n"
                "   • Scope: Adversarial debate frameworks for scalable oversight of superhuman AI."
            )
        if "quantum networking" in lower or "pap-007" in lower:
            return (
                "Scalable Quantum Networking Protocols (PAP-007):\n\n"
                "• Authors: Kimble, H.J., Duan, L.M.\n"
                "• Published: 2026-03-22 | Citations: 78 | Access: Open\n"
                "• Abstract: Distributed entanglement protocols enabling multi-node quantum networks with sub-millisecond synchronization."
            )
        if "climate" in lower or "ds-1" in lower:
            return (
                "Climate Observations 2024 Dataset (ds-1):\n\n"
                "• Name: Climate Observations 2024\n"
                "• Size: 2.4 GB | Total Records: 120,000\n"
                "• Access: Open\n"
                "• Description: Global temperature, precipitation, and atmospheric CO2 measurements from 4,200 stations."
            )

    # General fallback
    return f"Processed query for {resource} database."
