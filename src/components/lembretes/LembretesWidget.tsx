import React from 'react';
import { Bell, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/ThemeContext';
import type { Lembrete } from '@/types';

interface LembretesWidgetProps {
  lembretes: Lembrete[];
  loading: boolean;
}

export const LembretesWidget: React.FC<LembretesWidgetProps> = ({ lembretes, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'cancelado':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'concluido':
        return <Badge variant="default" className="bg-emerald-500">Concluído</Badge>;
      case 'cancelado':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pendente</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Sort by date (upcoming first) and status (pending first)
  const sortedLembretes = [...lembretes].sort((a, b) => {
    // Pending first
    if (a.status !== 'concluido' && b.status === 'concluido') return -1;
    if (a.status === 'concluido' && b.status !== 'concluido') return 1;
    // Then by date
    return new Date(a.data || a.date || '').getTime() - new Date(b.data || b.date || '').getTime();
  });

  const pendingCount = lembretes.filter(l => l.status !== 'concluido' && l.status !== 'cancelado').length;

  return (
    <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Bell className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className={`text-lg ${isDark ? 'text-white' : ''}`}>Lembretes</CardTitle>
            <CardDescription>
              {pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : 'Nenhum pendente'}
            </CardDescription>
          </div>
        </div>
        {pendingCount > 0 && (
          <Badge variant="default" className="bg-amber-500">
            {pendingCount}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : sortedLembretes.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {sortedLembretes.slice(0, 10).map((lembrete) => (
                <div
                  key={lembrete.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {getStatusIcon(lembrete.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {lembrete.titulo || lembrete.title || 'Lembrete'}
                    </p>
                    {(lembrete.descricao || lembrete.description) && (
                      <p className="text-xs text-gray-500 truncate">
                        {lembrete.descricao || lembrete.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lembrete.data || lembrete.date)}
                      </div>
                      {(lembrete.hora || lembrete.time) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {lembrete.hora || lembrete.time}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(lembrete.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum lembrete</p>
            <Button variant="outline" size="sm" className="mt-3">
              Criar Lembrete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LembretesWidget;
