
import React, { useState, useRef } from 'react';
import { Send, User, FileText, Loader2, PlusCircle, Upload, X, FileWarning } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configuração do worker do PDF.js via ESM
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

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
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File) => {
    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setText(fullText);
      setFileName(file.name);
    } catch (error) {
      console.error("Erro ao extrair PDF:", error);
      alert("Não foi possível ler o PDF. Tente copiar o texto manualmente.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      await extractTextFromPDF(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
        setFileName(file.name);
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, envie um arquivo PDF ou TXT.");
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Anexar Extrato (PDF ou TXT)</label>
          
          <div 
            onClick={() => !fileName && !isExtracting && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center mb-3 ${fileName ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".pdf,.txt"
            />
            
            {isExtracting ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="text-xs font-medium text-indigo-600">Lendo PDF...</span>
              </div>
            ) : fileName ? (
              <div className="flex items-center justify-between w-full px-2">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-indigo-900 truncate">{fileName}</span>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold">Arquivo Carregado</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="p-1.5 hover:bg-indigo-200 rounded-full text-indigo-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-sm text-gray-500 font-bold">Clique para anexar PDF</span>
                <span className="text-[10px] text-gray-400 mt-1">O texto será extraído automaticamente</span>
              </>
            )}
          </div>

          <div className="relative">
            <textarea 
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ou cole o texto do extrato aqui..."
              rows={6}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-mono text-[11px] leading-relaxed"
            />
            {text && !fileName && (
              <button 
                type="button"
                onClick={() => setText('')}
                className="absolute top-2 right-2 p-1 bg-white/80 rounded-md text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading || isExtracting || !clientName || !text}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 transform active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analisando com IA...</span>
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
