
import React from 'react';
import { FileText, Calendar, User, ChevronRight, Download, Trash2, Search } from 'lucide-react';
import { IncomeVerification } from '../types';

interface HistoryTabProps {
  verifications: IncomeVerification[];
  onSelect: (v: IncomeVerification) => void;
  onDelete: (id: string) => void;
  onExport: (v: IncomeVerification) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ verifications, onSelect, onDelete, onExport }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = verifications.filter(v => 
    v.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Histórico de Apurações</h2>
          <p className="text-gray-500">Gerencie e visualize análises realizadas anteriormente.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((v) => (
            <div 
              key={v.id}
              className="group bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{v.clientName}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Média: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.averageIncome)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onExport(v)}
                  className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Baixar Planilha"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(v.id)}
                  className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onSelect(v)}
                  className="ml-2 flex items-center space-x-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all"
                >
                  <span>Ver Detalhes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">Nenhum registro encontrado</h3>
          <p className="text-gray-400 mt-1">As apurações que você realizar aparecerão aqui.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
