
import React, { useState } from 'react';
import { Download, Trash2, Edit3, Check, X, Info, Calculator, Landmark } from 'lucide-react';
import { IncomeVerification, Transaction } from '../types';

interface ResultDisplayProps {
  verification: IncomeVerification;
  onExport: () => void;
  onUpdateTransaction: (monthIdx: number, transId: string, updates: Partial<Transaction>) => void;
  onDelete: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ verification, onExport, onUpdateTransaction, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Renda Total</span>
            <div className="p-2 bg-green-50 rounded-lg"><Calculator className="w-4 h-4 text-green-600" /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(verification.totalIncome)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Soma de todos os meses válidos</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Média Mensal</span>
            <div className="p-2 bg-blue-50 rounded-lg"><Landmark className="w-4 h-4 text-blue-600" /></div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(verification.averageIncome)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Média aritmética do período</p>
        </div>

        <div className="bg-indigo-600 p-5 rounded-3xl shadow-lg shadow-indigo-100 flex flex-col justify-center">
          <button 
            onClick={onExport}
            className="flex items-center justify-center space-x-2 bg-white text-indigo-600 font-bold py-2.5 px-4 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Planilha</span>
          </button>
          <button 
            onClick={onDelete}
            className="mt-2 text-indigo-100 text-xs hover:text-white transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Excluir Apuração
          </button>
        </div>
      </div>

      {/* Spreadsheet View */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Detalhamento por Mês</h3>
            <p className="text-sm text-gray-500">Visualização em formato de planilha para conferência</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Info className="w-4 h-4" />
            <span>Clique no lápis para ajustar entradas</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="spreadsheet-header text-left px-4 py-3 text-xs uppercase text-gray-500">Data</th>
                <th className="spreadsheet-header text-left px-4 py-3 text-xs uppercase text-gray-500">Descrição</th>
                <th className="spreadsheet-header text-left px-4 py-3 text-xs uppercase text-gray-500">Remetente</th>
                <th className="spreadsheet-header text-left px-4 py-3 text-xs uppercase text-gray-500">Banco</th>
                <th className="spreadsheet-header text-right px-4 py-3 text-xs uppercase text-gray-500">Valor</th>
                <th className="spreadsheet-header text-center px-4 py-3 text-xs uppercase text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {verification.monthlyData.map((month, mIdx) => (
                <React.Fragment key={month.month}>
                  {/* Month Header Row */}
                  <tr className="bg-gray-50/80">
                    <td colSpan={6} className="px-4 py-2 border-y border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-700 text-sm">{month.month}</span>
                        <span className="text-xs font-semibold text-gray-600">
                          Total do Mês: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(month.total)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Transactions */}
                  {month.transactions.map((t) => (
                    <tr key={t.id} className={`group hover:bg-indigo-50/30 transition-colors ${!t.isValid ? 'opacity-40 grayscale' : ''}`}>
                      <td className="spreadsheet-cell text-sm text-gray-600">{t.date}</td>
                      <td className="spreadsheet-cell text-sm text-gray-800 font-medium">{t.description}</td>
                      <td className="spreadsheet-cell text-sm text-gray-600">{t.sender}</td>
                      <td className="spreadsheet-cell text-sm text-gray-500">{t.bank}</td>
                      <td className="spreadsheet-cell text-sm text-right font-bold text-gray-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                      </td>
                      <td className="spreadsheet-cell text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button 
                            onClick={() => onUpdateTransaction(mIdx, t.id, { isValid: !t.isValid })}
                            className={`p-1.5 rounded-lg transition-colors ${t.isValid ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                            title={t.isValid ? "Desconsiderar" : "Validar"}
                          >
                            {t.isValid ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button 
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {month.transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                        Nenhuma entrada válida identificada para este mês.
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
