import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Table, 
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

interface TableStatus {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

const REQUIRED_TABLES = [
  { name: 'profiles', description: 'Perfil dos usuários', required: true },
  { name: 'transactions', description: 'Transações financeiras', required: false },
  { name: 'categories', description: 'Categorias de gastos', required: false },
  { name: 'goals', description: 'Metas financeiras', required: false },
];

const OPTIONAL_TABLES = [
  { name: 'despesas', description: 'Despesas (PT)', required: false },
  { name: 'receitas', description: 'Receitas (PT)', required: false },
  { name: 'categorias', description: 'Categorias (PT)', required: false },
  { name: 'metas', description: 'Metas (PT)', required: false },
  { name: 'accounts', description: 'Contas bancárias', required: false },
  { name: 'wallets', description: 'Carteiras', required: false },
  { name: 'budgets', description: 'Orçamentos', required: false },
];

export const TableManager: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [checking, setChecking] = useState(false);

  const checkTable = async (tableName: string): Promise<TableStatus> => {
    try {
      // Try to get count
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return { name: tableName, exists: false, error: 'Tabela não existe' };
        }
        return { name: tableName, exists: true, error: error.message };
      }

      return { name: tableName, exists: true, rowCount: count || 0 };
    } catch (error: any) {
      return { name: tableName, exists: false, error: error.message };
    }
  };

  const refreshTables = async () => {
    setChecking(true);
    const allTables = [...REQUIRED_TABLES, ...OPTIONAL_TABLES];
    
    const statuses: TableStatus[] = [];
    for (const table of allTables) {
      const status = await checkTable(table.name);
      statuses.push(status);
    }
    
    setTableStatuses(statuses);
    setChecking(false);
  };

  useEffect(() => {
    refreshTables();
  }, []);

  const requiredStatuses = tableStatuses.filter(s => 
    REQUIRED_TABLES.some(t => t.name === s.name)
  );
  
  const optionalStatuses = tableStatuses.filter(s => 
    OPTIONAL_TABLES.some(t => t.name === s.name)
  );

  const existingCount = tableStatuses.filter(s => s.exists).length;
  const totalCount = tableStatuses.length;

  return (
    <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Gerenciador de Tabelas</CardTitle>
              <CardDescription>
                Status das tabelas no Supabase
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTables}
            disabled={checking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Tabelas existentes
            </span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {existingCount} / {totalCount}
            </span>
          </div>
          <Progress value={(existingCount / totalCount) * 100} className="h-2 mt-2" />
        </div>

        {/* Required Tables */}
        <div>
          <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tabelas Principais
          </h4>
          <div className="space-y-2">
            {requiredStatuses.map((status) => {
              const tableInfo = REQUIRED_TABLES.find(t => t.name === status.name);
              return (
                <div 
                  key={status.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    status.exists 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status.exists ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {status.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tableInfo?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.exists && status.rowCount !== undefined && (
                      <Badge variant="secondary">
                        {status.rowCount} registros
                      </Badge>
                    )}
                    <Badge variant={status.exists ? 'default' : 'destructive'}>
                      {status.exists ? 'OK' : 'Faltando'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Tables */}
        <div>
          <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tabelas Opcionais
          </h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {optionalStatuses.map((status) => {
                const tableInfo = OPTIONAL_TABLES.find(t => t.name === status.name);
                return (
                  <div 
                    key={status.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      status.exists 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : isDark 
                          ? 'border-gray-700 bg-gray-800/50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {status.exists ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Table className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {status.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tableInfo?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status.exists && status.rowCount !== undefined && (
                        <Badge variant="secondary">
                          {status.rowCount} registros
                        </Badge>
                      )}
                      <Badge variant={status.exists ? 'default' : 'outline'}>
                        {status.exists ? 'OK' : 'Opcional'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Info Alert */}
        <Alert className={isDark ? 'bg-blue-500/10 border-blue-500/30' : ''}>
          <Info className="w-4 h-4" />
          <AlertDescription>
            O sistema detecta automaticamente as tabelas disponíveis. 
            Se uma tabela não existir, os dados serão armazenados localmente até que a tabela seja criada.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

import { Progress } from '@/components/ui/progress';

export default TableManager;
