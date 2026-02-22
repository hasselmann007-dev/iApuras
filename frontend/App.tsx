
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Download, 
  Trash2, 
  PlusCircle,
  AlertCircle,
  Loader2,
  History
} from 'lucide-react';
import { IncomeVerification, Transaction } from './types';
import { analyzeIncome } from './services/geminiService';
import * as XLSX from 'xlsx';

// Components
import IncomeForm from './components/IncomeForm';
import ResultDisplay from './components/ResultDisplay';
import HistoryTab from './components/HistoryTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [verifications, setVerifications] = useState<IncomeVerification[]>([]);
  const [currentVerification, setCurrentVerification] = useState<IncomeVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('income_verifications_v2');
    if (saved) {
      try {
        setVerifications(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('income_verifications_v2', JSON.stringify(verifications));
  }, [verifications]);

  const handleAnalyze = async (data: { text: string, clientName: string, fatherName?: string, motherName?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeIncome(data.text, data.clientName, data.fatherName, data.motherName);
      
      const newVerification: IncomeVerification = {
        id: crypto.randomUUID(),
        clientName: data.clientName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        createdAt: new Date().toISOString(),
        periodStart: result.monthlyData?.[0]?.month || '',
        periodEnd: result.monthlyData?.[result.monthlyData.length - 1]?.month || '',
        monthlyData: (result.monthlyData || []).map(m => ({
          ...m,
          transactions: m.transactions.map(t => ({ ...t, id: crypto.randomUUID() }))
        })),
        totalIncome: result.totalIncome || 0,
        averageIncome: result.averageIncome || 0,
        rawInput: data.text
      };

      setCurrentVerification(newVerification);
      setVerifications(prev => [newVerification, ...prev]);
    } catch (err: any) {
      console.error("Erro na análise:", err);
      setError(err.message || "Ocorreu um erro ao processar os dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este registro permanentemente?")) {
      setVerifications(prev => prev.filter(v => v.id !== id));
      if (currentVerification?.id === id) setCurrentVerification(null);
    }
  };

  const handleUpdateTransaction = (verificationId: string, monthIndex: number, transactionId: string, updates: Partial<Transaction>) => {
    setVerifications(prev => prev.map(v => {
      if (v.id !== verificationId) return v;
      
      const newMonthlyData = [...v.monthlyData];
      const month = { ...newMonthlyData[monthIndex] };
      month.transactions = month.transactions.map(t => t.id === transactionId ? { ...t, ...updates } : t);
      
      // Recalcular totais do mês
      month.total = month.transactions.filter(t => t.isValid).reduce((sum, t) => sum + t.amount, 0);
      newMonthlyData[monthIndex] = month;
      
      // Recalcular totais globais
      const totalIncome = newMonthlyData.reduce((sum, m) => sum + m.total, 0);
      const averageIncome = totalIncome / (newMonthlyData.length || 1);

      const updated = { ...v, monthlyData: newMonthlyData, totalIncome, averageIncome };
      if (currentVerification?.id === v.id) setCurrentVerification(updated);
      return updated;
    }));
  };

  const exportToExcel = (verification: IncomeVerification) => {
    const wb = XLSX.utils.book_new();
    
    // Aba de Resumo
    const summaryData = [
      ["APURAÇÃO DE RENDA - " + verification.clientName.toUpperCase()],
      ["Data da Análise", new Date(verification.createdAt).toLocaleString('pt-BR')],
      [],
      ["RESUMO FINANCEIRO"],
      ["Renda Total Acumulada", verification.totalIncome],
      ["Média Mensal Apurada", verification.averageIncome],
      [],
      ["DETALHAMENTO MENSAL"]
    ];
    
    verification.monthlyData.forEach(m => {
      summaryData.push([m.month, m.total]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

    // Aba de Transações
    const detailedData = [
      ["DATA", "DESCRIÇÃO", "REMETENTE", "BANCO", "VALOR", "MÊS REF"]
    ];

    verification.monthlyData.forEach(m => {
      m.transactions.filter(t => t.isValid).forEach(t => {
        detailedData.push([t.date, t.description, t.sender, t.bank, t.amount, m.month]);
      });
    });

    const wsDetails = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, wsDetails, "Transações Válidas");

    XLSX.writeFile(wb, `Apuracao_${verification.clientName.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-inner">
              <LayoutDashboard className="text-indigo-700 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">IncomeAnalyzer</h1>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">Inteligência de Renda</span>
            </div>
          </div>
          <nav className="flex space-x-1 bg-indigo-800/40 p-1 rounded-xl border border-indigo-600/30">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'new' ? 'bg-white text-indigo-700 shadow-md' : 'hover:bg-indigo-600/50 text-indigo-100'}`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Análise</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-md' : 'hover:bg-indigo-600/50 text-indigo-100'}`}
            >
              <History className="w-4 h-4" />
              <span>Histórico</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <IncomeForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Erro na Apuração</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-8">
              {currentVerification ? (
                <ResultDisplay 
                  verification={currentVerification} 
                  onExport={() => exportToExcel(currentVerification)}
                  onUpdateTransaction={(mIdx, tId, updates) => handleUpdateTransaction(currentVerification.id, mIdx, tId, updates)}
                  onDelete={() => handleDelete(currentVerification.id)}
                />
              ) : (
                <div className="h-full min-h-[500px] border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 p-12 text-center bg-white/50">
                  <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-gray-100">
                    <FileText className="w-16 h-16 text-indigo-100" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600">Pronto para analisar</h3>
                  <p className="max-w-sm mt-2 text-sm text-gray-400">
                    Carregue um arquivo de extrato (.txt) ou cole o texto no formulário ao lado para iniciar a apuração automática com IA.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <HistoryTab 
            verifications={verifications} 
            onSelect={(v) => { setCurrentVerification(v); setActiveTab('new'); }}
            onDelete={handleDelete}
            onExport={exportToExcel}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs font-medium">
          <p>&copy; 2025 IncomeAnalyzer Pro - Sistema de Apuração de Renda Inteligente</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Privacidade</span>
            <span>Termos de Uso</span>
            <span>Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
