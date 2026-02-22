
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  History, 
  FileText, 
  Download, 
  Trash2, 
  Edit3, 
  PlusCircle,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { IncomeVerification, MonthlyData, Transaction } from './types';
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

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('income_verifications');
    if (saved) {
      try {
        setVerifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('income_verifications', JSON.stringify(verifications));
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
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta apuração?")) {
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
      
      // Recalculate totals
      month.total = month.transactions.filter(t => t.isValid).reduce((sum, t) => sum + t.amount, 0);
      newMonthlyData[monthIndex] = month;
      
      const totalIncome = newMonthlyData.reduce((sum, m) => sum + m.total, 0);
      const averageIncome = totalIncome / (newMonthlyData.length || 1);

      const updated = { ...v, monthlyData: newMonthlyData, totalIncome, averageIncome };
      if (currentVerification?.id === v.id) setCurrentVerification(updated);
      return updated;
    }));
  };

  const exportToExcel = (verification: IncomeVerification) => {
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ["Apuração de Renda - " + verification.clientName],
      ["Data da Apuração", new Date(verification.createdAt).toLocaleDateString('pt-BR')],
      [],
      ["Resumo Financeiro"],
      ["Renda Total", verification.totalIncome],
      ["Média Mensal", verification.averageIncome],
      [],
      ["Totais por Mês"]
    ];
    
    verification.monthlyData.forEach(m => {
      summaryData.push([m.month, m.total]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

    // Detailed Transactions Sheet
    const detailedData = [
      ["Data", "Descrição", "Remetente", "Banco", "Valor", "Mês Referência"]
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-lg">
              <LayoutDashboard className="text-indigo-700 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">IncomeAnalyzer <span className="font-light opacity-80">Pro</span></h1>
          </div>
          <nav className="flex space-x-1 bg-indigo-800/50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'new' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-indigo-600/50'}`}
            >
              Nova Apuração
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-indigo-600/50'}`}
            >
              Histórico
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <IncomeForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
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
                <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <FileText className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600">Nenhuma apuração ativa</h3>
                  <p className="max-w-xs mt-2">Preencha os dados ao lado e envie o extrato para iniciar a análise automática.</p>
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2025 IncomeAnalyzer Pro - Sistema de Apuração de Renda Inteligente
        </div>
      </footer>
    </div>
  );
};

export default App;
