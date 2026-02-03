import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface TableInfo {
  name: string;
  exists: boolean;
  rowCount?: number;
}

interface UseSupabaseTablesReturn {
  tables: Record<string, TableInfo>;
  loading: boolean;
  refresh: () => void;
}

// All possible table names to check (including variations)
const TABLES_TO_CHECK = [
  // User related
  { name: 'profiles', description: 'Perfis de usuários' },
  { name: 'users', description: 'Usuários' },
  
  // Financial transactions
  { name: 'transactions', description: 'Transações financeiras' },
  { name: 'transacoes', description: 'Transações (PT)' },
  { name: 'transacao', description: 'Transação (PT)' },
  { name: 'despesas', description: 'Despesas' },
  { name: 'receitas', description: 'Receitas' },
  { name: 'gastos', description: 'Gastos' },
  
  // Categories
  { name: 'categories', description: 'Categorias' },
  { name: 'categorias', description: 'Categorias (PT)' },
  { name: 'categoria', description: 'Categoria (PT)' },
  
  // Goals
  { name: 'goals', description: 'Metas financeiras' },
  { name: 'metas', description: 'Metas (PT)' },
  { name: 'meta', description: 'Meta (PT)' },
  { name: 'objetivos', description: 'Objetivos' },
  
  // Reminders (user mentioned)
  { name: 'lembrete', description: 'Lembretes' },
  { name: 'lembretes', description: 'Lembretes (PL)' },
  { name: 'reminder', description: 'Reminders' },
  { name: 'reminders', description: 'Reminders (PL)' },
  { name: 'alertas', description: 'Alertas' },
  
  // Reports (user mentioned)
  { name: 'relatorios', description: 'Relatórios' },
  { name: 'relatorio', description: 'Relatório' },
  { name: 'reports', description: 'Reports' },
  { name: 'report', description: 'Report' },
  
  // Accounts and wallets
  { name: 'accounts', description: 'Contas bancárias' },
  { name: 'contas', description: 'Contas (PT)' },
  { name: 'wallets', description: 'Carteiras' },
  { name: 'carteiras', description: 'Carteiras (PT)' },
  
  // Budgets
  { name: 'budgets', description: 'Orçamentos' },
  { name: 'orcamentos', description: 'Orçamentos (PT)' },
  { name: 'orcamento', description: 'Orçamento (PT)' },
  
  // Investments
  { name: 'investments', description: 'Investimentos' },
  { name: 'investimentos', description: 'Investimentos (PT)' },
  
  // Debts
  { name: 'debts', description: 'Dívidas' },
  { name: 'dividas', description: 'Dívidas (PT)' },
];

export const useSupabaseTables = (): UseSupabaseTablesReturn => {
  const [tables, setTables] = useState<Record<string, TableInfo>>({});
  const [loading, setLoading] = useState(true);

  const checkTable = async (tableName: string): Promise<TableInfo> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return { name: tableName, exists: false };
        }
        // Other errors might mean table exists but has issues
        return { name: tableName, exists: true };
      }

      return { name: tableName, exists: true };
    } catch {
      return { name: tableName, exists: false };
    }
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    
    const results: Record<string, TableInfo> = {};
    
    // Check all tables
    for (const table of TABLES_TO_CHECK) {
      const info = await checkTable(table.name);
      results[table.name] = info;
    }
    
    setTables(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tables, loading, refresh };
};

export default useSupabaseTables;
