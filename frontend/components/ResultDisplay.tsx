
import React, { useState } from 'react';
import { Download, Trash2, Edit3, Check, X, Info, Calculator, Landmark, Save, AlertTriangle } from 'lucide-react';
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
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Renda Total</span>
            <div className="p-2 bg-green-50 rounded-xl"><Calculator className="w-4 h-4 text-green-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(verification.totalIncome)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">Soma de todos os meses válidos</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Média Mensal</span>
            <div className="p-2 bg-blue-50 rounded-xl"><Landmark className="w-4 h-4 text-blue-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(verification.averageIncome)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">Média aritmética apurada</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-center">
          <button 
            onClick={onExport}
            className="flex items-center justify-center space-x-2 bg-white text-indigo-600 font-black py-3.5 px-4 rounded-2xl hover:bg-indigo-50 transition-all transform active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Planilha</span>
          </button>
          <button 
            onClick={onDelete}
            className="mt-3 text-indigo-100 text-[10px] font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 mr-1.5" /> Excluir Apuração
          </button>
        </div>
      </div>

      {/* Tabela de Apuração */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
          <div>
            <h3 className="text-xl font-black text-gray-800">Entradas Válidas Identificadas</h3>
            <p className="text-sm text-gray-500 font-medium">Confira e ajuste os valores conforme necessário</p>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            <Info className="w-4 h-4" />
            <span className="uppercase tracking-wider">Use o lápis para editar ou o lixo para excluir</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="spreadsheet-header text-left px-6 py-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Data</th>
                <th className="spreadsheet-header text-left px-6 py-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Descrição</th>
                <th className="spreadsheet-header text-left px-6 py-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Remetente</th>
                <th className="spreadsheet-header text-left px-6 py-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Banco</th>
                <th className="spreadsheet-header text-right px-6 py-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Valor</th>
                <th className="spreadsheet-header text-center px-6 py-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody>
              {verification.monthlyData.map((month, mIdx) => (
                <React.Fragment key={month.month}>
                  <tr className="bg-indigo-50/50">
                    <td colSpan={6} className="px-6 py-3 border-y border-indigo-100">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-indigo-900 text-sm uppercase tracking-widest">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Subtotal:</span>
                          <span className="text-sm font-black text-indigo-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(month.total)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {month.transactions.map((t) => (
                    <tr key={t.id} className={`group hover:bg-gray-50/80 transition-colors ${!t.isValid ? 'bg-red-50/30 opacity-40 grayscale' : ''}`}>
                      <td className="spreadsheet-cell px-6 text-xs text-gray-500 font-medium">{t.date}</td>
                      <td className="spreadsheet-cell px-6 text-xs text-gray-800 font-bold">{t.description}</td>
                      <td className="spreadsheet-cell px-6 text-xs text-gray-600 font-medium">{t.sender}</td>
                      <td className="spreadsheet-cell px-6 text-xs text-gray-400 font-bold">{t.bank}</td>
                      <td className="spreadsheet-cell px-6 text-xs text-right font-black text-gray-800">
                        {editingId === t.id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-indigo-400">R$</span>
                            <input 
                              type="number" 
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              className="w-24 text-right border-2 border-indigo-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none font-black"
                              autoFocus
                            />
                          </div>
                        ) : (
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
                        )}
                      </td>
                      <td className="spreadsheet-cell px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {editingId === t.id ? (
                            <button 
                              onClick={() => saveEdit(mIdx, t.id)}
                              className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl shadow-sm transition-all"
                              title="Salvar Alteração"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => startEdit(t)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Editar Valor"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => onUpdateTransaction(mIdx, t.id, { isValid: !t.isValid })}
                            className={`p-2 rounded-xl transition-all ${t.isValid ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={t.isValid ? "Excluir da Apuração" : "Restaurar Entrada"}
                          >
                            {t.isValid ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {month.transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center text-gray-300">
                          <AlertTriangle className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-xs font-bold uppercase tracking-widest">Nenhuma entrada válida neste mês</span>
                        </div>
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
