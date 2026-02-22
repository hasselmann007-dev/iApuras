
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  bank: string;
  sender: string;
  isValid: boolean;
  exclusionReason?: string;
}

export interface MonthlyData {
  month: string;
  total: number;
  transactions: Transaction[];
}

export interface IncomeVerification {
  id: string;
  clientName: string;
  fatherName?: string;
  motherName?: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  monthlyData: MonthlyData[];
  totalIncome: number;
  averageIncome: number;
  rawInput: string;
}

export interface AppState {
  verifications: IncomeVerification[];
  currentVerification: IncomeVerification | null;
  isLoading: boolean;
  error: string | null;
}
