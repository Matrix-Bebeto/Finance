import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronRight,
  MoreHorizontal,
  Target,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Plus,
  Database,
  CheckCircle,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { MatrixLabsLogo } from '@/components/logo/MatrixLabsLogo';
import { AreaChart, PieChart, BarChart } from '@/components/charts';
import { FinancialChat } from '@/components/chat/FinancialChat';
import { LembretesWidget } from '@/components/lembretes/LembretesWidget';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { supabase } from '@/lib/supabase';

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  sectionId: string;
};

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',   sectionId: 'dashboard' },
  { icon: Wallet,          label: 'Transações', sectionId: 'transacoes' },
  { icon: BarChart3,       label: 'Relatórios', sectionId: 'relatorios' },
  { icon: Target,          label: 'Metas',      sectionId: 'metas' },
  { icon: CreditCard,      label: 'Cartões',    sectionId: 'cartoes' },
  { icon: PieChartIcon,    label: 'Orçamento',  sectionId: 'orcamento' },
];

const mockMonthlyData = [
  { name: 'Jan', value: 4500, value2: 3200 },
  { name: 'Fev', value: 5200, value2: 3800 },
  { name: 'Mar', value: 4800, value2: 3500 },
  { name: 'Abr', value: 6100, value2: 4200 },
  { name: 'Mai', value: 5800, value2: 3900 },
  { name: 'Jun', value: 7200, value2: 4500 },
];

const mockWeeklyData = [
  { name: 'Seg', value: 450 },
  { name: 'Ter', value: 320 },
  { name: 'Qua', value: 580 },
  { name: 'Qui', value: 420 },
  { name: 'Sex', value: 750 },
  { name: 'Sáb', value: 920 },
  { name: 'Dom', value: 380 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();

  const {
    transactions,
    goals,
    categories,
    lembretes,
    relatorios,
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
    loading,
    availableTables,
    refresh,
  } = useFinancialData();

  const isDark = theme === 'dark';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTables, setShowTables] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('Dashboard');

  // Estados dos modais
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [txListModalOpen, setTxListModalOpen] = useState(false);
  const [lembreteModalOpen, setLembreteModalOpen] = useState(false);

  const [txForm, setTxForm] = useState({
    valor: '',
    tipo: 'despesa',
    estabelecimento: '',
    detalhes: '',
  });

  const [goalForm, setGoalForm] = useState({
    nome: '',
    valorMeta: '',
  });

  const [reportTitle, setReportTitle] = useState('');

  const [lembreteForm, setLembreteForm] = useState({
    titulo: '',
    descricao: '',
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSidebarClick = (item: SidebarItem) => {
    setActiveItem(item.label);
    const el = document.getElementById(item.sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Abrir modais
  const openTxModal = () => {
    setTxForm({
      valor: '',
      tipo: 'despesa',
      estabelecimento: '',
      detalhes: '',
    });
    setTxModalOpen(true);
  };

  const openGoalModal = () => {
    setGoalForm({ nome: '', valorMeta: '' });
    setGoalModalOpen(true);
  };

  const openReportModal = () => {
    const defaultTitle = `Relatório rápido - ${new Date().toLocaleDateString(
      'pt-BR'
    )}`;
    setReportTitle(defaultTitle);
    setReportModalOpen(true);
  };

  const openLembreteModal = () => {
    setLembreteForm({ titulo: '', descricao: '' });
    setLembreteModalOpen(true);
  };

  // Submeter formulários

  const handleAddTransaction = async () => {
    if (!user) return;

    const valor = Number(txForm.valor.replace(',', '.'));
    if (Number.isNaN(valor) || valor <= 0) {
      alert('Valor inválido.');
      return;
    }

    const tipo =
      txForm.tipo === 'receita' ? 'receita' : 'despesa';

    const defaultCategoryId = (categories as any[])?.[0]?.id;
    if (!defaultCategoryId) {
      alert('Cadastre pelo menos uma categoria antes de adicionar transações.');
      return;
    }

    const { error } = await supabase.from('transacoes').insert({
      valor,
      tipo,
      estabelecimento: txForm.estabelecimento || '',
      detalhes: txForm.detalhes || '',
      userid: user.id,
      category_id: defaultCategoryId,
    });

    if (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação.');
      return;
    }

    setTxModalOpen(false);
    await refresh();
  };

  const handleCreateGoal = async () => {
    if (!user) return;

    if (!goalForm.nome.trim()) {
      alert('Informe um nome para a meta.');
      return;
    }

    const valorMeta = Number(goalForm.valorMeta.replace(',', '.'));
    if (Number.isNaN(valorMeta) || valorMeta <= 0) {
      alert('Valor da meta inválido.');
      return;
    }

    const { error } = await supabase.from('metas').insert({
      user_id: user.id,
      nome: goalForm.nome,
      valor_meta: valorMeta,
      valor_atual: 0,
    });

    if (error) {
      console.error('Erro ao criar meta:', error);
      alert('Erro ao criar meta (verifique se a tabela "metas" existe).');
      return;
    }

    setGoalModalOpen(false);
    await refresh();
  };

  const handleGenerateReport = async () => {
    if (!user) return;

    const payload = {
      totalBalance,
      totalIncome,
      totalExpenses,
      savingsRate,
      generated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('relatorios').insert({
      user_id: user.id,
      titulo: reportTitle || 'Relatório rápido',
      tipo: 'Geral',
      conteudo: payload,
    });

    if (error) {
      console.error('Erro ao gerar relatório:', error);
      alert(
        'Erro ao gerar relatório (confira se a tabela "relatorios" existe).'
      );
      return;
    }

    setReportModalOpen(false);
    await refresh();
  };

  // ATUALIZADO: compatível com a tabela que você mostrou (userid, descricao, status, notificado)
  const handleCreateLembrete = async () => {
    if (!user) return;

    if (!lembreteForm.titulo.trim()) {
      alert('Informe um título para o lembrete.');
      return;
    }

    // Monta um texto único na coluna "descricao"
    const descricao =
      lembreteForm.descricao?.trim()
        ? `${lembreteForm.titulo} - ${lembreteForm.descricao}`
        : lembreteForm.titulo;

    const { error } = await supabase.from('lembretes').insert({
      userid: user.id,    // coluna que existe na sua tabela
      descricao,          // usa a coluna "descricao"
      status: 'pendente',
      notificado: false,  // opcional, pode ser null
      // created_at é preenchido pelo default now()
      // data, hora, valor podem ficar null por enquanto
    });

    if (error) {
      console.error('Erro ao criar lembrete:', error);
      alert('Erro ao criar lembrete (detalhes no console).');
      return;
    }

    setLembreteModalOpen(false);
    await refresh();
  };

  // Dados numéricos
  const displayBalance = loading ? 0 : totalBalance || 0;
  const displayIncome = loading ? 0 : totalIncome || 0;
  const displayExpenses = loading ? 0 : totalExpenses || 0;
  const displaySavingsRate = loading ? 0 : savingsRate || 0;

  // Gráfico mensal
  const monthlyData = useMemo(() => {
    if (!transactions || transactions.length === 0) return mockMonthlyData;

    const months: Record<string, { income: number; expenses: number }> = {};

    transactions.forEach((t: any) => {
      const rawDate = t.data || t.date || t.created_at;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' });

      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0 };
      }

      const amount = Number(t.amount ?? t.valor ?? 0);
      const type = t.type ?? t.tipo;

      if (type === 'income' || type === 'receita') {
        months[monthKey].income += amount;
      } else if (type === 'expense' || type === 'despesa') {
        months[monthKey].expenses += amount;
      }
    });

    const entries = Object.entries(months);
    if (entries.length === 0) return mockMonthlyData;

    return entries.map(([name, data]) => ({
      name,
      value: data.income,
      value2: data.expenses,
    }));
  }, [transactions]);

  // Gráfico por categoria (todas)
  const categoryData = useMemo(() => {
    if ((!categories || categories.length === 0) &&
        (!transactions || transactions.length === 0)) {
      return [
        { name: 'Moradia',     value: 2500, color: '#0ea5e9' },
        { name: 'Alimentação', value: 1800, color: '#10b981' },
        { name: 'Transporte',  value: 900,  color: '#f59e0b' },
        { name: 'Lazer',       value: 600,  color: '#8b5cf6' },
        { name: 'Outros',      value: 400,  color: '#6b7280' },
      ];
    }

    if (categories && categories.length > 0 && (!transactions || transactions.length === 0)) {
      const palette = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];
      return categories.map((cat: any, index: number) => ({
        name: cat.name || cat.nome || `Categoria ${index + 1}`,
        value: Number(cat.budget ?? cat.orcamento ?? 0) || 0,
        color: cat.color || cat.cor || palette[index % palette.length],
      }));
    }

    const totals: Record<string, number> = {};

    transactions
      .filter((t: any) => {
        const type = t.type ?? t.tipo;
        return type === 'expense' || type === 'despesa';
      })
      .forEach((t: any) => {
        const name = t.category || t.categoria || 'Outros';
        const amount = Number(t.amount ?? t.valor ?? 0);
        totals[name] = (totals[name] || 0) + amount;
      });

    const colors = [
      '#0ea5e9',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#6b7280',
      '#ef4444',
      '#ec4899',
    ];

    return Object.entries(totals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [categories, transactions]);

  // Top 5 categorias + "Outras" para o gráfico
  const topCategoryData = useMemo(() => {
    if (!categoryData || categoryData.length <= 6) {
      return categoryData;
    }

    const sorted = [...categoryData].sort(
      (a: any, b: any) => Number(b.value || 0) - Number(a.value || 0)
    );

    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);

    const othersTotal = others.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0
    );

    return [
      ...top5,
      {
        name: 'Outras',
        value: othersTotal,
        color: '#6b7280',
      },
    ];
  }, [categoryData]);

  // Gastos da semana
  const weeklyData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return mockWeeklyData;
    }

    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const totals = [0, 0, 0, 0, 0, 0, 0];

    transactions.forEach((t: any) => {
      const rawDate = t.data || t.date || t.created_at;
      if (!rawDate) return;

      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return;
      if (d < start || d > today) return;

      const type = t.type ?? t.tipo;
      const amount = Number(t.amount ?? t.valor ?? 0);

      if (type === 'expense' || type === 'despesa') {
        const dow = d.getDay();
        totals[dow] += amount;
      }
    });

    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const order = [1, 2, 3, 4, 5, 6, 0];

    return order.map((idx) => ({
      name: labels[idx],
      value: totals[idx],
    }));
  }, [transactions]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const pendingLembretes = (lembretes || []).filter(
    (l: any) => l.status !== 'concluido'
  );

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${
          isDark
            ? 'bg-gray-800 border-r border-gray-700'
            : 'bg-white border-r border-gray-200'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div
            className={`h-16 flex items-center px-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            {sidebarOpen ? (
              <MatrixLabsLogo
                size="md"
                variant={isDark ? 'light' : 'dark'}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
            )}
          </div>

          {/* Navegação */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleSidebarClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'gradient-primary text-white'
                        : isDark
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Ações inferiores */}
          <div
            className={`p-3 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } space-y-1`}
          >
            <button
              onClick={() => setShowTables(!showTables)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isDark
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Database className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">
                  Tabelas{' '}
                  {availableTables && availableTables.length > 0
                    ? `(${availableTables.length})`
                    : ''}
                </span>
              )}
            </button>

            <button
              onClick={refresh}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isDark
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <RefreshCw
                className={`w-5 h-5 flex-shrink-0 ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              {sidebarOpen && (
                <span className="font-medium">Atualizar</span>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isDark
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">Sair</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header
          className={`h-16 sticky top-0 z-30 px-6 flex items-center justify-between border-b backdrop-blur-md ${
            isDark
              ? 'bg-gray-900/80 border-gray-700'
              : 'bg-white/80 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              />
              <Input
                placeholder="Buscar..."
                className={`pl-10 w-64 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refresh}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>

            <button
              className={`p-2 rounded-lg relative transition-colors ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Bell className="w-5 h-5" />
              {pendingLembretes.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.email ?? 'Usuário'}
                />
                <AvatarFallback className="gradient-primary text-white">
                  {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {user?.user_metadata?.full_name ||
                      user?.email?.split('@')[0] ||
                      'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD PRINCIPAL */}
        <div id="dashboard" className="p-6 space-y-6">
          {/* Boas-vindas */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Olá,{' '}
                {user?.user_metadata?.full_name?.split(' ')[0] ||
                  'Bem-vindo'}
                !
              </h1>
              <p
                className={
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }
              >
                Aqui está o resumo das suas finanças
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{todayLabel}</span>
            </div>
          </div>

          {/* Banner de Tabelas */}
          {showTables &&
            availableTables &&
            availableTables.length > 0 && (
              <Card
                className={
                  isDark
                    ? 'bg-emerald-900/20 border-emerald-700'
                    : 'bg-emerald-50 border-emerald-200'
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span
                      className={`font-medium ${
                        isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-700'
                      }`}
                    >
                      Tabelas detectadas no Supabase
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTables.map((table: string) => (
                      <Badge
                        key={table}
                        variant="default"
                        className="bg-emerald-500"
                      >
                        <Database className="w-3 h-3 mr-1" />
                        {table}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Cards principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saldo Total */}
            <Card
              className={`card-hover ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Saldo Total
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-32 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold mt-1 text-emerald-500">
                        R {displayBalance.toLocaleString('pt-BR')}
                      </h3>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-emerald-500 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>12,5%</span>
                      <span
                        className={
                          isDark
                            ? 'text-gray-500'
                            : 'text-gray-400'
                        }
                      >
                        vs mês anterior
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receitas */}
            <Card
              className={`card-hover ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Receitas
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-32 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold mt-1 text-emerald-500">
                        R {displayIncome.toLocaleString('pt-BR')}
                      </h3>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-emerald-500 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>8,2%</span>
                      <span
                        className={
                          isDark
                            ? 'text-gray-500'
                            : 'text-gray-400'
                        }
                      >
                        vs mês anterior
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Despesas */}
            <Card
              className={`card-hover ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Despesas
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-32 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold mt-1 text-red-500">
                        R {displayExpenses.toLocaleString('pt-BR')}
                      </h3>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                      <ArrowDownRight className="w-4 h-4" />
                      <span>5,1%</span>
                      <span
                        className={
                          isDark
                            ? 'text-gray-500'
                            : 'text-gray-400'
                        }
                      >
                        vs mês anterior
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Economia */}
            <Card
              className={`card-hover ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Taxa de Economia
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <h3
                        className={`text-2xl font-bold mt-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {displaySavingsRate.toFixed(1)}%
                      </h3>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-emerald-500 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>2,3%</span>
                      <span
                        className={
                          isDark
                            ? 'text-gray-500'
                            : 'text-gray-400'
                        }
                      >
                        vs mês anterior
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <PiggyBank className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ANÁLISES */}
          <section id="analises" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receitas vs Despesas */}
              <Card
                className={
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className={isDark ? 'text-white' : ''}>
                      Receitas vs Despesas
                    </CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-normal flex items-center"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    23%
                  </Badge>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={monthlyData.length === 0 ? mockMonthlyData : monthlyData}
                    dataKey="value"
                    dataKey2="value2"
                  />
                </CardContent>
              </Card>

              {/* Despesas por Categoria / Orçamento */}
              <Card
                id="orcamento"
                className={
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className={isDark ? 'text-white' : ''}>
                      Despesas por Categoria
                    </CardTitle>
                    <CardDescription>Este mês</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-normal flex items-center"
                  >
                    <Receipt className="w-3 h-3 mr-1" />
                    {categoryData.length} categorias
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <PieChart data={topCategoryData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Semana + Lembretes + Metas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gastos da Semana */}
            <Card
              className={
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className={isDark ? 'text-white' : ''}>
                    Gastos da Semana
                  </CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver detalhes
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <BarChart data={weeklyData} />
              </CardContent>
            </Card>

            {/* Lembretes com botão "Criar lembrete" */}
            <Card
              className={
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className={isDark ? 'text-white' : ''}>
                    Lembretes
                  </CardTitle>
                  <CardDescription>Alertas e tarefas financeiras</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={openLembreteModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar lembrete
                </Button>
              </CardHeader>
              <CardContent>
                <LembretesWidget lembretes={lembretes} loading={loading} />
              </CardContent>
            </Card>

            {/* Metas */}
            <Card
              id="metas"
              className={
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className={isDark ? 'text-white' : ''}>
                    Metas
                  </CardTitle>
                  <CardDescription>Progresso atual</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : goals && goals.length > 0 ? (
                  goals.map((goal: any) => {
                    const current =
                      Number(goal.current_amount ?? goal.valor_atual ?? 0) || 0;
                    const target =
                      Number(goal.target_amount ?? goal.valor_meta ?? 0) || 1;
                    const progress = Math.min(100, (current / target) * 100);
                    const color = goal.color || goal.cor || '#0ea5e9';

                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${color}20` }}
                            >
                              <Target
                                className="w-4 h-4"
                                style={{ color }}
                              />
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {goal.name || goal.nome || 'Meta'}
                              </p>
                              <p className="text-xs text-gray-500">
                                R {current.toLocaleString('pt-BR')} / R{' '}
                                {(
                                  Number(
                                    goal.target_amount ?? goal.valor_meta ?? 0
                                  ) || 0
                                ).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color }}
                          >
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <div
                    className={`text-center py-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">
                      Nenhuma meta definida
                    </p>
                    <p className="text-sm mt-1">
                      Crie suas metas financeiras para acompanhar o progresso.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={openGoalModal}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Meta
                    </Button>
                  </div>
                )}
                {goals && goals.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={openGoalModal}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Meta
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cartões (placeholder) */}
          <section id="cartoes">
            <Card
              className={
                isDark
                  ? 'bg-gray-800 border-gray-700 mt-4'
                  : 'bg-white border-gray-200 mt-4'
              }
            >
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : ''}>
                  Cartões
                </CardTitle>
                <CardDescription>
                  Área de cartões em construção.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          {/* RELATÓRIOS + TRANSAÇÕES */}
          <section id="relatorios" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Relatórios */}
              <div className="lg:col-span-2 space-y-4">
                {relatorios && relatorios.length > 0 ? (
                  <Card
                    className={
                      isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className={isDark ? 'text-white' : ''}>
                            Relatórios
                          </CardTitle>
                          <CardDescription>Relatórios gerados</CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver todos
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relatorios.slice(0, 6).map((relatorio: any) => (
                          <div
                            key={relatorio.id}
                            className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                              isDark
                                ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p
                                  className={`font-medium text-sm truncate ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  {relatorio.titulo ||
                                    relatorio.title ||
                                    'Relatório'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {relatorio.tipo ||
                                    relatorio.type ||
                                    'Geral'}
                                </p>
                                {relatorio.created_at && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(
                                      relatorio.created_at
                                    ).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    className={
                      isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }
                  >
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p
                        className={`text-lg font-medium mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Nenhum relatório disponível
                      </p>
                      <p className="text-sm text-gray-500">
                        Gere um relatório para visualizar análises detalhadas.
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={openReportModal}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Transações Recentes */}
              <Card
                id="transacoes"
                className={
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className={isDark ? 'text-white' : ''}>
                      Transações Recentes
                    </CardTitle>
                    <CardDescription>Últimas atividades</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openTxModal}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTxListModalOpen(true)}
                    >
                      Ver todas
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction: any) => {
                        const type = transaction.type ?? transaction.tipo;
                        const isIncome =
                          type === 'income' || type === 'receita';

                        const amount = Number(
                          transaction.amount ?? transaction.valor ?? 0
                        );

                        const dateStr =
                          transaction.date ||
                          transaction.data ||
                          transaction.created_at ||
                          '';
                        const date = dateStr
                          ? new Date(dateStr).toLocaleDateString('pt-BR')
                          : '';

                        return (
                          <div
                            key={transaction.id}
                            className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                              isDark
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  isIncome
                                    ? 'bg-emerald-500/10'
                                    : 'bg-red-500/10'
                                }`}
                              >
                                {isIncome ? (
                                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${
                                    isDark
                                      ? 'text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {transaction.description ||
                                    transaction.descricao ||
                                    transaction.estabelecimento ||
                                    'Transação'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {transaction.category ||
                                    transaction.categoria ||
                                    transaction.estabelecimento ||
                                    'Geral'}{' '}
                                  • {date}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`font-semibold ${
                                  isIncome
                                    ? 'text-emerald-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {isIncome ? '+ ' : '- '}R{' '}
                                {amount.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className={`text-center py-12 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        Nenhuma transação encontrada
                      </p>
                      <p className="text-sm mt-1">
                        Adicione sua primeira transação para começar.
                      </p>
                      <Button
                        className="mt-4 gradient-primary"
                        onClick={openTxModal}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Transação
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Chat financeiro */}
          <div className="mt-6">
            <FinancialChat
              financialData={{
                totalBalance: displayBalance,
                totalIncome: displayIncome,
                totalExpenses: displayExpenses,
                savingsRate: displaySavingsRate,
              }}
            />
          </div>
        </div>

        {/* MODAL: Nova transação */}
        <Dialog open={txModalOpen} onOpenChange={setTxModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova transação</DialogTitle>
              <DialogDescription>
                Preencha os campos para registrar uma nova receita ou despesa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Valor</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={txForm.valor}
                  onChange={(e) =>
                    setTxForm((prev) => ({
                      ...prev,
                      valor: e.target.value,
                    }))
                  }
                  placeholder="Ex: 150.75"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Tipo
                </label>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant={txForm.tipo === 'receita' ? 'default' : 'outline'}
                    onClick={() =>
                      setTxForm((prev) => ({ ...prev, tipo: 'receita' }))
                    }
                  >
                    Receita
                  </Button>
                  <Button
                    type="button"
                    variant={txForm.tipo === 'despesa' ? 'default' : 'outline'}
                    onClick={() =>
                      setTxForm((prev) => ({ ...prev, tipo: 'despesa' }))
                    }
                  >
                    Despesa
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Estabelecimento / Categoria rápida
                </label>
                <Input
                  value={txForm.estabelecimento}
                  onChange={(e) =>
                    setTxForm((prev) => ({
                      ...prev,
                      estabelecimento: e.target.value,
                    }))
                  }
                  placeholder="Ex: Mercado, Restaurante..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Descrição / Detalhes
                </label>
                <Input
                  value={txForm.detalhes}
                  onChange={(e) =>
                    setTxForm((prev) => ({
                      ...prev,
                      detalhes: e.target.value,
                    }))
                  }
                  placeholder="Ex: Almoço com amigos"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setTxModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleAddTransaction}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: Nova meta */}
        <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova meta</DialogTitle>
              <DialogDescription>
                Defina um objetivo financeiro e um valor alvo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Nome da meta
                </label>
                <Input
                  value={goalForm.nome}
                  onChange={(e) =>
                    setGoalForm((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Ex: Reserva de emergência"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Valor alvo
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={goalForm.valorMeta}
                  onChange={(e) =>
                    setGoalForm((prev) => ({
                      ...prev,
                      valorMeta: e.target.value,
                    }))
                  }
                  placeholder="Ex: 5000"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setGoalModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreateGoal}>
                Salvar meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: Gerar relatório */}
        <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar relatório</DialogTitle>
              <DialogDescription>
                Crie um relatório com o resumo atual das suas finanças.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Título do relatório
                </label>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setReportModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleGenerateReport}>
                Gerar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: Novo lembrete */}
        <Dialog open={lembreteModalOpen} onOpenChange={setLembreteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo lembrete</DialogTitle>
              <DialogDescription>
                Crie um lembrete para não esquecer de uma conta ou tarefa financeira.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={lembreteForm.titulo}
                  onChange={(e) =>
                    setLembreteForm((prev) => ({
                      ...prev,
                      titulo: e.target.value,
                    }))
                  }
                  placeholder="Ex: Pagar cartão de crédito"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Descrição (opcional)
                </label>
                <Input
                  value={lembreteForm.descricao}
                  onChange={(e) =>
                    setLembreteForm((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  placeholder="Ex: Vence dia 10, conferir fatura antes"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setLembreteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreateLembrete}>
                Salvar lembrete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: Todas as transações */}
        <Dialog open={txListModalOpen} onOpenChange={setTxListModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Todas as transações</DialogTitle>
              <DialogDescription>
                Lista completa das suas transações recentes.
              </DialogDescription>
            </DialogHeader>

            {(!transactions || transactions.length === 0) ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Nenhuma transação encontrada.
              </div>
            ) : (
              <ScrollArea className="max-h-[400px] mt-4 pr-2">
                <div className="space-y-3">
                  {transactions.map((transaction: any) => {
                    const type = transaction.type ?? transaction.tipo;
                    const isIncome =
                      type === 'income' || type === 'receita';
                    const amount = Number(
                      transaction.amount ?? transaction.valor ?? 0
                    );
                    const dateStr =
                      transaction.date ||
                      transaction.data ||
                      transaction.created_at ||
                      '';
                    const date = dateStr
                      ? new Date(dateStr).toLocaleDateString('pt-BR')
                      : '';

                    return (
                      <div
                        key={transaction.id}
                        className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                          isDark
                            ? 'bg-gray-800 border border-gray-700'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isIncome
                                ? 'bg-emerald-500/10'
                                : 'bg-red-500/10'
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {transaction.description ||
                                transaction.descricao ||
                                transaction.estabelecimento ||
                                'Transação'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.category ||
                                transaction.categoria ||
                                transaction.estabelecimento ||
                                'Geral'}{' '}
                              • {date}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            isIncome ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {isIncome ? '+ ' : '- '}R{' '}
                          {amount.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTxListModalOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
