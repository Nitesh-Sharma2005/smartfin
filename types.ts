export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum FinancialGoal {
  House = 'Buying a House',
  Car = 'Buying a Car',
  Retirement = 'Retirement',
  Wealth = 'Wealth Creation',
  Education = 'Education',
}

export type UserProfile = {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  riskLevel: RiskLevel;
  financialGoal: FinancialGoal;
};

export enum FinancialField {
  MutualFunds = 'Mutual Funds',
  Stocks = 'Stocks',
  SIP = 'SIP',
  LoansEMI = 'Loans / EMI',
  Taxes = 'Taxes',
  Insurance = 'Insurance',
  EmergencyFund = 'Emergency Fund',
  Retirement = 'Retirement',
  Crypto = 'Crypto',
}

export type SuggestionStatus = 'Good' | 'Warning' | 'Alert';

export type Suggestion = {
  field: FinancialField | string;
  status: SuggestionStatus;
  title: string;
  content: string;
  actionItem: string;
};

export type AnalysisResult = {
  overview: string;
  suggestions: Suggestion[];
};