export interface Transaction {
  id: string;
  user_id: string;
  description?: string;
  descricao?: string;
  amount: number;
  valor?: number;
  type?: 'income' | 'expense';
  tipo?: 'receita' | 'despesa';
  category?: string;
  categoria?: string;
  date: string;
  data?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name?: string;
  nome?: string;
  type?: 'income' | 'expense';
  tipo?: 'receita' | 'despesa';
  color?: string;
  cor?: string;
  icon?: string;
  icone?: string;
  budget?: number;
  orcamento?: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name?: string;
  nome?: string;
  target_amount: number;
  valor_meta?: number;
  valor_alvo?: number;
  current_amount: number;
  valor_atual?: number;
  deadline?: string;
  data_limite?: string;
  prazo?: string;
  color?: string;
  cor?: string;
  icon?: string;
  icone?: string;
  created_at?: string;
}

export interface Lembrete {
  id: string;
  user_id: string;
  titulo?: string;
  title?: string;
  descricao?: string;
  description?: string;
  data: string;
  date?: string;
  hora?: string;
  time?: string;
  tipo?: string;
  type?: string;
  status?: 'pendente' | 'concluido' | 'cancelado';
  recorrente?: boolean;
  recorrencia?: string;
  created_at?: string;
}

export interface Relatorio {
  id: string;
  user_id: string;
  titulo?: string;
  title?: string;
  tipo?: string;
  type?: string;
  periodo_inicio?: string;
  periodo_fim?: string;
  start_date?: string;
  end_date?: string;
  dados?: any;
  data?: any;
  resumo?: string;
  summary?: string;
  created_at?: string;
}

export interface FinancialData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
  recentTransactions: Transaction[];
  goals: Goal[];
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency: string;
  language: string;
  notifications_enabled: boolean;
}
