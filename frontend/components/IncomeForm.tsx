
import React, { useState } from 'react';
// Added PlusCircle to the imports from lucide-react
import { Send, User, Users, FileText, Loader2, PlusCircle } from 'lucide-react';

interface IncomeFormProps {
  onAnalyze: (data: { text: string, clientName: string, fatherName?: string, motherName?: string }) => void;
  isLoading: boolean;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onAnalyze, isLoading }) => {
  const [clientName, setClientName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !text) return;
    onAnalyze({ text, clientName, fatherName, motherName });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-indigo-600" />
        Nova Análise
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nome do Cliente</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome completo do favorecido"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nome do Pai</label>
            <input 
              type="text" 
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nome da Mãe</label>
            <input 
              type="text" 
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Conteúdo do Extrato</label>
          <div className="relative">
            <textarea 
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui o texto do extrato bancário ou arraste o arquivo..."
              rows={10}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400 italic">
            Dica: Você pode copiar e colar diretamente do PDF ou Internet Banking.
          </p>
        </div>

        <button 
          type="submit"
          disabled={isLoading || !clientName || !text}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analisando Dados...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Iniciar Apuração</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;
