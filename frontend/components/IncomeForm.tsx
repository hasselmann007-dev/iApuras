
import React, { useState, useRef } from 'react';
import { Send, User, FileText, Loader2, PlusCircle, Upload, X } from 'lucide-react';

interface IncomeFormProps {
  onAnalyze: (data: { text: string, clientName: string, fatherName?: string, motherName?: string }) => void;
  isLoading: boolean;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onAnalyze, isLoading }) => {
  const [clientName, setClientName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !text) return;
    onAnalyze({ text, clientName, fatherName, motherName });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-indigo-600" />
        Nova Apuração
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
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
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nome da Mãe</label>
              <input 
                type="text" 
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Opcional"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Dados do Extrato</label>
          
          <div 
            onClick={() => !fileName && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center mb-3 ${fileName ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".txt,.csv"
            />
            
            {fileName ? (
              <div className="flex items-center justify-between w-full px-2">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-indigo-900 truncate">{fileName}</span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="p-1 hover:bg-indigo-200 rounded-full text-indigo-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-medium">Carregar arquivo local (.txt)</span>
              </>
            )}
          </div>

          <textarea 
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ou cole o texto do extrato aqui..."
            rows={8}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-mono text-xs"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading || !clientName || !text}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analisando...</span>
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
