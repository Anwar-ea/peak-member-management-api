export type QBAccountGroup = 'Income' | 'COGS' | 'GrossProfit' | 'Expenses' | 'NetOperatingIncome' | 'OtherIncome' | 'OtherExpenses' | 'NetOtherIncome' | 'NetIncome';
export type QBColumnType = 'Account' | 'Money' | string;
export type QBRowType = 'Data' | 'Section';

// Generic key-value pair for metadata and options
export interface QBKeyValue {
  Name: string;
  Value: string;
}

// Column data with optional ID
export interface QBColData {
  value: string;
  id?: string;
}

// Generic row structure that can represent both data and section rows
export interface QBRow<T extends QBRowType = QBRowType> {
  type: T;
  group?: QBAccountGroup;
  ColData?: QBColData[]; // For Data rows
  Header?: { ColData: QBColData[] }; // For Section rows
  Rows?: { Row: QBRow[] }; // Nested rows for sections
  Summary?: { ColData: QBColData[] }; // Summary for sections
}

// Specific row types using generics
export type QBDataRow = QBRow<'Data'> & Required<Pick<QBRow, 'ColData'>>;
export type QBSectionRow = QBRow<'Section'>;

// Report structure
export interface QBProfitLossResponse {
  Header: {
    Time: string;
    ReportName: string;
    ReportBasis: string;
    StartPeriod: string;
    EndPeriod: string;
    SummarizeColumnsBy: string;
    Currency: string;
    Option: QBKeyValue[];
  };
  Columns: {
    Column: Array<{
      ColTitle: string;
      ColType: QBColumnType;
      MetaData: QBKeyValue[];
    }>;
  };
  Rows: {
    Row: QBRow[];
  };
}

// Parsed data structures
export interface QBAccount {
  id?: string;
  name: string;
  value: number;
  group?: QBAccountGroup;
  parentSection?: string;
}

export interface QBSection {
  id?: string;
  name: string;
  total: number;
  group?: QBAccountGroup;
  accounts: QBAccount[];
  subsections: QBSection[];
  level: number; // Depth in hierarchy
}

export interface QBFinancialMetrics {
  revenue: {
    total: number;
    breakdown: Record<string, number>;
  };
  costs: {
    cogs: number;
    operatingExpenses: number;
    otherExpenses: number;
    total: number;
  };
  profit: {
    gross: number;
    operating: number;
    net: number;
  };
  margins: {
    gross: number; // %
    operating: number; // %
    net: number; // %
  };
}

export interface QBReportMetadata {
  period: {
    start: string;
    end: string;
    duration?: number; // days
  };
  currency: string;
  basis: string;
  generatedAt: string;
  options: Record<string, string>;
}