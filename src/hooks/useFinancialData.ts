import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Transaction,
  Goal,
  Category,
  Lembrete,
  Relatorio,
} from '@/types';

interface FinancialData {
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
  lembretes: Lembrete[];
  relatorios: Relatorio[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  loading: boolean;
  error: string | null;
  availableTables: string[];
}

// nomes das tabelas do seu banco
const TRANSACTIONS_TABLE = 'transacoes';   // public.transacoes[cite:0]
const LEMBRETES_TABLE   = 'lembretes';    // public.lembretes[cite:0]
const CATEGORIAS_TABLE  = 'categorias';   // public.categorias[cite:0]
const METAS_TABLE       = 'metas';        // se criar depois
const RELATORIOS_TABLE  = 'relatorios';   // se criar depois

export const useFinancialData = (): FinancialData & { refresh: () => void } => {
  const { user } = useAuth();
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    goals: [],
    categories: [],
    lembretes: [],
    relatorios: [],
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
    loading: true,
    error: null,
    availableTables: [],
  });

  const fetchData = useCallback(async () => {
    if (!user) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    setData((prev) => ({ ...prev, loading: true, error: null }));

    const availableTables: string[] = [];
    const userId = user.id; // mesmo id usado em profiles.id e userid nas tabelas[cite:0]

    try {
      // 1) CATEGORIAS (public.categorias: userid, nome, ...)[cite:0]
      let categories: Category[] = [];
      try {
        const { data: catData, error: catError } = await supabase
          .from(CATEGORIAS_TABLE)
          .select('*')
          .eq('userid', userId);

        if (catError) {
          console.error('Erro ao carregar categorias:', catError);
        } else if (catData) {
          categories = catData as Category[];
          availableTables.push(CATEGORIAS_TABLE);
        }
      } catch (e) {
        console.error('Erro inesperado em categorias:', e);
      }

      // 2) TRANSACOES (public.transacoes)[cite:0]
      // colunas: id, created_at, quando, estabelecimento, valor, detalhes, tipo, userid, category_id[cite:0]
      let transactions: Transaction[] = [];
      try {
        const { data: txData, error: txError } = await supabase
          .from(TRANSACTIONS_TABLE)
          .select('*')
          .eq('userid', userId)
          .order('created_at', { ascending: false })
          .limit(250);

        if (txError) {
          console.error('Erro ao carregar transacoes:', txError);
        } else if (txData) {
          const mapped = (txData as any[]).map((t) => ({
            ...t,
            valor: Number(t.valor ?? 0),
            data: t.data ?? t.created_at,
            descricao: t.detalhes ?? t.descricao ?? t.estabelecimento ?? '',
            categoria: t.categoria ?? t.estabelecimento ?? 'Geral',
          }));

          transactions = mapped as Transaction[];
          availableTables.push(TRANSACTIONS_TABLE);
        }
      } catch (e) {
        console.error('Erro inesperado em transacoes:', e);
      }

      // 3) METAS (opcional, se existir public.metas)
      let goals: Goal[] = [];
      try {
        const { data: metasData, error: metasError } = await supabase
          .from(METAS_TABLE)
          .select('*')
          .or(`user_id.eq.${userId},userid.eq.${userId}`);

        if (!metasError && metasData) {
          goals = metasData as Goal[];
          availableTables.push(METAS_TABLE);
        }
      } catch {
        // tabela pode não existir ainda
      }

      // 4) LEMBRETES (public.lembretes)[cite:0]
      // colunas: id, created_at, userid, descricao, data, valor[cite:0]
      let lembretes: Lembrete[] = [];
      try {
        const { data: lembData, error: lembError } = await supabase
          .from(LEMBRETES_TABLE)
          .select('*')
          .eq('userid', userId)
          .order('data', { ascending: true });

        if (lembError) {
          console.error('Erro ao carregar lembretes:', lembError);
        } else if (lembData) {
          const mapped = (lembData as any[]).map((l) => ({
            ...l,
            data: l.data ?? l.created_at,
            status: l.status ?? 'pendente',
          }));
          lembretes = mapped as Lembrete[];
          availableTables.push(LEMBRETES_TABLE);
        }
      } catch (e) {
        console.error('Erro inesperado em lembretes:', e);
      }

      // 5) RELATORIOS (opcional)
      let relatorios: Relatorio[] = [];
      try {
        const { data: relData, error: relError } = await supabase
          .from(RELATORIOS_TABLE)
          .select('*')
          .or(`user_id.eq.${userId},userid.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!relError && relData) {
          relatorios = relData as Relatorio[];
          availableTables.push(RELATORIOS_TABLE);
        }
      } catch {
        // tabela pode não existir ainda
      }

      // 6) Cálculos agregados com base em transações
      const safeTransactions = transactions || [];

      const totalIncome = safeTransactions
        .filter((t: any) => t.type === 'income' || t.tipo === 'receita')
        .reduce(
          (sum, t: any) => sum + Number(t.amount ?? t.valor ?? 0),
          0
        );

      const totalExpenses = safeTransactions
        .filter((t: any) => t.type === 'expense' || t.tipo === 'despesa')
        .reduce(
          (sum, t: any) => sum + Number(t.amount ?? t.valor ?? 0),
          0
        );

      const totalBalance = totalIncome - totalExpenses;
      const savingsRate =
        totalIncome > 0
          ? ((totalIncome - totalExpenses) / totalIncome) * 100
          : 0;

      setData({
        transactions: safeTransactions,
        goals,
        categories,
        lembretes,
        relatorios,
        totalBalance,
        totalIncome,
        totalExpenses,
        savingsRate,
        loading: false,
        error: null,
        availableTables,
      });
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar dados financeiros',
        availableTables,
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refresh: fetchData };
};

export default useFinancialData;
