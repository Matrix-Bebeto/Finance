import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  TrendingUp,
  Wallet,
  PiggyBank,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/contexts/ThemeContext';
import type { ChatMessage } from '@/types';

interface FinancialChatProps {
  financialData: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
  };
}

const quickQuestions = [
  { icon: TrendingUp, text: 'Como está minha saúde financeira?' },
  { icon: Wallet, text: 'Onde estou gastando mais?' },
  { icon: PiggyBank, text: 'Dicas para economizar' },
  { icon: Target, text: 'Como alcançar minhas metas?' },
];

const generateResponse = (message: string, data: FinancialChatProps['financialData']): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('saúde') || lowerMessage.includes('financeira') || lowerMessage.includes('status')) {
    const health = data.savingsRate > 20 ? 'excelente' : data.savingsRate > 10 ? 'boa' : 'precisa de atenção';
    return `Sua saúde financeira está **${health}**! 💪\n\n📊 **Resumo atual:**\n• Saldo: R$ ${data.totalBalance.toLocaleString('pt-BR')}\n• Taxa de economia: ${data.savingsRate.toFixed(1)}%\n• Receitas: R$ ${data.totalIncome.toLocaleString('pt-BR')}\n• Despesas: R$ ${data.totalExpenses.toLocaleString('pt-BR')}\n\n💡 **Dica:** Tente manter sua taxa de economia acima de 20% para um futuro financeiro mais seguro.`;
  }
  
  if (lowerMessage.includes('gasto') || lowerMessage.includes('despesa') || lowerMessage.includes('onde')) {
    return `Baseado nos seus dados atuais:\n\n💸 **Total em despesas:** R$ ${data.totalExpenses.toLocaleString('pt-BR')}\n\n📋 **Categorias principais:**\n• Moradia (35%)\n• Alimentação (25%)\n• Transporte (15%)\n• Lazer (10%)\n• Outros (15%)\n\n🔍 **Análise:** Suas despesas estão ${data.totalExpenses > data.totalIncome * 0.8 ? 'altas' : 'sob controle'}. Considere revisar gastos em lazer para aumentar sua economia.`;
  }
  
  if (lowerMessage.includes('economizar') || lowerMessage.includes('dica') || lowerMessage.includes('guardar')) {
    return `💰 **Dicas para economizar:**\n\n1. **Regra 50/30/20**\n   • 50% necessidades\n   • 30% desejos\n   • 20% economia\n\n2. **Automatize suas economias**\n   Configure transferências automáticas no dia do pagamento.\n\n3. **Corte gastos invisíveis**\n   Revise assinaturas e serviços que não usa.\n\n4. **Sua taxa atual:** ${data.savingsRate.toFixed(1)}%\n   Meta ideal: 20%+ 🎯`;
  }
  
  if (lowerMessage.includes('meta') || lowerMessage.includes('objetivo') || lowerMessage.includes('alcançar')) {
    return `🎯 **Análise de Metas:**\n\nCom sua taxa de economia atual de **${data.savingsRate.toFixed(1)}%**, você pode:\n\n✅ **Curto prazo (6 meses):**\nEconomizar ~R$ ${(data.totalIncome * (data.savingsRate / 100) * 6).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}\n\n✅ **Médio prazo (1 ano):**\nEconomizar ~R$ ${(data.totalIncome * (data.savingsRate / 100) * 12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}\n\n💡 **Recomendação:** Aumente sua taxa para 25% e alcance suas metas 20% mais rápido!`;
  }
  
  if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('ola') || lowerMessage.includes('hey')) {
    return `Olá! 👋 Sou seu assistente financeiro da MatrixLabs.\n\nPosso te ajudar com:\n• Análise da sua saúde financeira\n• Identificar onde você gasta mais\n• Dicas para economizar\n• Planejamento de metas\n\nComo posso ajudar você hoje?`;
  }
  
  return `Entendi! 🤔\n\nCom base nos seus dados atuais:\n• Saldo: R$ ${data.totalBalance.toLocaleString('pt-BR')}\n• Economia mensal: ${data.savingsRate.toFixed(1)}%\n\nPosso te dar insights mais específicos se você me perguntar sobre:\n- Saúde financeira\n- Gastos por categoria\n- Dicas de economia\n- Metas financeiras\n\nO que gostaria de saber?`;
};

export const FinancialChat: React.FC<FinancialChatProps> = ({ financialData }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente financeiro da MatrixLabs. Como posso ajudar você hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content, financialData);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: boldLine }} />;
      }
      // Headers
      if (line.trim().startsWith('📊') || line.trim().startsWith('💡') || line.trim().startsWith('🎯')) {
        return <p key={i} className="font-semibold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: boldLine }} />;
      }
      return <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1'} dangerouslySetInnerHTML={{ __html: boldLine }} />;
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        } gradient-primary text-white`}
      >
        <MessageCircle className="w-6 h-6" />
        {messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-96 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
        }`}
      >
        <div className={`rounded-2xl shadow-2xl overflow-hidden border ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="gradient-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Assistente Financeiro</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Powered by MatrixLabs AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-80 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary'
                        : isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : isDark 
                          ? 'bg-gray-800 text-gray-200 rounded-bl-md' 
                          : 'bg-gray-100 text-gray-700 rounded-bl-md'
                    }`}
                  >
                    {formatMessage(message.content)}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Bot className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div className={`p-3 rounded-2xl rounded-bl-md ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {messages.length < 3 && (
              <div className="mt-4">
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Perguntas rápidas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q.text)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                        isDark 
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <q.icon className="w-3 h-3" />
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua pergunta..."
                className={`flex-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="gradient-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialChat;
