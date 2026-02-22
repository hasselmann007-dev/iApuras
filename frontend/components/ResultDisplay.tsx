
import React, { useState } from 'react';
import { Download, Trash2, Edit3, Check, X, Info, Calculator, Landmark, Save } from 'lucide-react';
import { IncomeVerification, Transaction } from '../types';

interface ResultDisplayProps {
  verification: IncomeVerification;
  onExport: () => void;
  onUpdateTransaction: (monthIdx: number, transId: string, updates: Partial<Transaction>) => void;
  onDelete: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ verification, onExport, onUpdateTransaction, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditValue(t.amount);
  };

  const saveEdit = (mIdx: number, tId: string) => {
    onUpdateTransaction(mIdx, tId, { amount: editValue });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Renda Total</span>
            <div className="p-2 bg-green-50 rounded-lg"><Calculator className="w-4 h-4 text-green-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(verification.totalIncome)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Soma dos meses apurados</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Média Mensal</span>
            <div className="p-2 bg-blue-50 rounded-lg"><Landmark className="w-4 h-4 text-blue-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(verification.averageIncome)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Média aritmética final</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-center">
          <button 
            onClick={onExport}
            className="flex items-center justify-center space-x-2 bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl hover:bg-indigo-50 transition-all transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Planilha</span>
          </button>
          <button 
            onClick={onDelete}
            className="mt-3 text-indigo-100 text-xs hover:text-white transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Excluir esta apuração
          </button>
        </div>
      </div>

      {/* Tabela Estilo Planilha */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Detalhamento da Apuração</h3>
            <p className="text-sm text-gray-500">Ajuste ou remova entradas conforme necessário</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Use o lápis para editar valores</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="spreadsheet-header text-left px-4 py-3 text-[10px] uppercase text-gray-400">Data</th>
                <th className="spreadsheet-header text-left px-4 py-3 text-[10px] uppercase text-gray-400">Descrição</th>
                <th className="spreadsheet-header text-left px-4 py-3 text-[10px] uppercase text-gray-400">Remetente</th>
                <th className="spreadsheet-header text-left px-4 py-3 text-[10px] uppercase text-gray-400">Banco</th>
                <th className="spreadsheet-header text-right px-4 py-3 text-[10px] uppercase text-gray-400">Valor</th>
                <th className="spreadsheet-header text-center px-4 py-3 text-[10px] uppercase text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {verification.monthlyData.map((month, mIdx) => (
                <React.Fragment key={month.month}>
                  <tr className="bg-indigo-50/40">
                    <td colSpan={6} className="px-4 py-2.5 border-y border-indigo-100">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-indigo-800 text-xs uppercase tracking-widest">{month.month}</span>
                        <span className="text-xs font-bold text-indigo-600">
                          Subtotal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(month.total)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  {month.transactions.map((t) => (
                    <tr key={t.id} className={`group hover:bg-gray-50 transition-colors ${!t.isValid ? 'opacity-30 grayscale' : ''}`}>
                      <td className="spreadsheet-cell text-xs text-gray-500">{t.date}</td>
                      <td className="spreadsheet-cell text-xs text-gray-800 font-medium">{t.description}</td>
                      <td className="spreadsheet-cell text-xs text-gray-600">{t.sender}</td>
                      <td className="spreadsheet-cell text-xs text-gray-400">{t.bank}</td>
                      <td className="spreadsheet-cell text-xs text-right font-bold text-gray-800">
                        {editingId === t.id ? (
                          <input 
                            type="number" 
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-24 text-right border border-indigo-300 rounded px-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                            autoFocus
                          />
                        ) : (
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
                        )}
                      </td>
                      <td className="spreadsheet-cell text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {editingId === t.id ? (
                            <button 
                              onClick={() => saveEdit(mIdx, t.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => startEdit(t)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => onUpdateTransaction(mIdx, t.id, { isValid: !t.isValid })}
                            className={`p-1.5 rounded-lg transition-colors ${t.isValid ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          >
                            {t.isValid ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
