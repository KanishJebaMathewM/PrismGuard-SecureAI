export interface BankAccount {
  accountId: string;
  holder: string;
  accountType: 'Savings' | 'Checking' | 'Loan' | 'Investment';
  balance: number;
  interestRate: number;
  branch: string;
  status: 'Active' | 'Frozen' | 'Closed';
  lastTransaction: string;
}

export const bankingDB: BankAccount[] = [
  { accountId: 'ACC-001', holder: 'Alice Johnson', accountType: 'Savings', balance: 24850.75, interestRate: 4.25, branch: 'Downtown', status: 'Active', lastTransaction: '2026-10-01' },
  { accountId: 'ACC-002', holder: 'Bob Martinez', accountType: 'Checking', balance: 5320.00, interestRate: 0.5, branch: 'Westside', status: 'Active', lastTransaction: '2026-10-03' },
  { accountId: 'ACC-003', holder: 'Carol Smith', accountType: 'Loan', balance: -18000.00, interestRate: 7.8, branch: 'Midtown', status: 'Active', lastTransaction: '2026-09-28' },
  { accountId: 'ACC-004', holder: 'David Chen', accountType: 'Investment', balance: 102400.50, interestRate: 6.1, branch: 'Eastside', status: 'Active', lastTransaction: '2026-09-30' },
  { accountId: 'ACC-005', holder: 'Emma Wilson', accountType: 'Savings', balance: 9870.20, interestRate: 4.25, branch: 'Downtown', status: 'Active', lastTransaction: '2026-10-02' },
  { accountId: 'ACC-006', holder: 'Frank Davis', accountType: 'Checking', balance: 1200.00, interestRate: 0.5, branch: 'Northgate', status: 'Frozen', lastTransaction: '2026-08-15' },
  { accountId: 'ACC-007', holder: 'Grace Lee', accountType: 'Investment', balance: 75000.00, interestRate: 6.1, branch: 'Westside', status: 'Active', lastTransaction: '2026-09-25' },
  { accountId: 'ACC-008', holder: 'Henry Brown', accountType: 'Loan', balance: -42500.00, interestRate: 7.8, branch: 'Midtown', status: 'Active', lastTransaction: '2026-10-01' },
  { accountId: 'ACC-009', holder: 'Iris Taylor', accountType: 'Savings', balance: 320.50, interestRate: 4.25, branch: 'Eastside', status: 'Closed', lastTransaction: '2026-06-10' },
  { accountId: 'ACC-010', holder: 'James White', accountType: 'Checking', balance: 11400.00, interestRate: 0.5, branch: 'Downtown', status: 'Active', lastTransaction: '2026-10-03' },
];

export const bankingRegulations = [
  { id: 'reg-1', title: 'Data Retention Policy', summary: 'All banking records must be retained for a minimum of 7 years per federal regulation.', effectiveDate: '2020-01-01' },
  { id: 'reg-2', title: 'Know Your Customer (KYC)', summary: 'Banks must verify customer identity before opening accounts and monitor transactions for suspicious activity.', effectiveDate: '2018-06-01' },
  { id: 'reg-3', title: 'AML Compliance', summary: 'Anti-Money Laundering controls require reporting of transactions exceeding $10,000 and suspicious activity reports.', effectiveDate: '2019-03-15' },
  { id: 'reg-4', title: 'Consumer Privacy Act', summary: 'Customer financial data must not be shared with third parties without explicit consent.', effectiveDate: '2021-09-01' },
  { id: 'reg-5', title: 'Interest Rate Disclosure', summary: 'All interest rates must be disclosed in APY format to customers before account opening.', effectiveDate: '2017-01-01' },
];

export const interestRates = {
  savings: 4.25,
  checking: 0.5,
  loan: 7.8,
  investment: 6.1,
};
