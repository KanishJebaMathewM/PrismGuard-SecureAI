export interface Employee {
  employeeId: string;
  name: string;
  department: string;
  role: string;
  salary: number;
  email: string;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export const companyDB: Employee[] = [
  { employeeId: 'EMP-001', name: 'Sarah Kim', department: 'Engineering', role: 'Senior Software Engineer', salary: 145000, email: 's.kim@company.com', joinDate: '2021-03-15', status: 'Active' },
  { employeeId: 'EMP-002', name: 'Tom Nguyen', department: 'Product', role: 'Product Manager', salary: 138000, email: 't.nguyen@company.com', joinDate: '2020-07-01', status: 'Active' },
  { employeeId: 'EMP-003', name: 'Lisa Park', department: 'Design', role: 'UX Lead', salary: 122000, email: 'l.park@company.com', joinDate: '2022-01-10', status: 'Active' },
  { employeeId: 'EMP-004', name: 'Marcus Jones', department: 'Engineering', role: 'DevOps Engineer', salary: 130000, email: 'm.jones@company.com', joinDate: '2019-11-05', status: 'Active' },
  { employeeId: 'EMP-005', name: 'Nina Patel', department: 'Data Science', role: 'ML Engineer', salary: 155000, email: 'n.patel@company.com', joinDate: '2022-09-20', status: 'Active' },
  { employeeId: 'EMP-006', name: 'Oliver Reed', department: 'Sales', role: 'Account Executive', salary: 95000, email: 'o.reed@company.com', joinDate: '2023-02-14', status: 'On Leave' },
  { employeeId: 'EMP-007', name: 'Priya Singh', department: 'Finance', role: 'Financial Analyst', salary: 112000, email: 'p.singh@company.com', joinDate: '2021-08-30', status: 'Active' },
  { employeeId: 'EMP-008', name: 'Quinn Davis', department: 'Engineering', role: 'Security Engineer', salary: 148000, email: 'q.davis@company.com', joinDate: '2020-04-22', status: 'Active' },
  { employeeId: 'EMP-009', name: 'Rachel Moore', department: 'Marketing', role: 'Marketing Director', salary: 135000, email: 'r.moore@company.com', joinDate: '2018-06-01', status: 'Active' },
  { employeeId: 'EMP-010', name: 'Steve Turner', department: 'Engineering', role: 'Junior Developer', salary: 85000, email: 's.turner@company.com', joinDate: '2024-01-08', status: 'Terminated' },
];

export const financialReports = [
  { quarter: 'Q3 2026', revenue: 4200000, growth: 14.2, reportDate: '2026-10-01', public: true },
  { quarter: 'Q2 2026', revenue: 3680000, growth: 9.8, reportDate: '2026-07-01', public: true },
  { quarter: 'Q1 2026', revenue: 3450000, growth: 7.4, reportDate: '2026-04-01', public: true },
  { quarter: 'Q4 2025', revenue: 3200000, growth: 5.1, reportDate: '2026-01-05', public: true },
  { quarter: 'Q3 2025', revenue: 3045000, growth: 3.2, reportDate: '2025-10-01', public: false },
];

export const internalDocs = [
  { id: 'doc-1', title: 'Product Roadmap 2026-2027', sensitivity: 'Internal', lastUpdated: '2026-09-15' },
  { id: 'doc-2', title: 'Engineering Architecture Decision Records', sensitivity: 'Internal', lastUpdated: '2026-09-28' },
  { id: 'doc-3', title: 'Security Audit Report Q3 2026', sensitivity: 'Confidential', lastUpdated: '2026-10-01' },
  { id: 'doc-4', title: 'Compensation Benchmarking Study', sensitivity: 'Confidential', lastUpdated: '2026-08-20' },
  { id: 'doc-5', title: 'Partnership Agreement — Acme Corp', sensitivity: 'Confidential', lastUpdated: '2026-07-14' },
  { id: 'doc-6', title: 'Employee Handbook 2026', sensitivity: 'Internal', lastUpdated: '2026-01-01' },
];
