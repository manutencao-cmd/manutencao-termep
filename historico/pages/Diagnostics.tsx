import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, Equipment, Sector } from '../types';
import { Card } from '../components/Card';
import SearchableSelect from '../components/SearchableSelect';
import Button from '../components/Button';
import { Search, Wrench, CheckCircle, AlertCircle, FileSearch, Filter, Layers, Cpu } from 'lucide-react';

interface DiagnosticsProps {
  records: MaintenanceRecord[];
  equipments: Equipment[];
  sectors: Sector[];
}

const DiagnosticsPage: React.FC<DiagnosticsProps> = ({ records, equipments, sectors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [filterSector, setFilterSector] = useState('');
  
  const [results, setResults] = useState<MaintenanceRecord[]>([]);
  const [searched, setSearched] = useState(false);

  // Helper to display date DD/MM/YYYY
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Prepare Options
  const equipOptions = useMemo(() => equipments.map(e => ({ value: e.id, label: `${e.codigo} - ${e.descricao}` })), [equipments]);
  const sectorOptions = useMemo(() => sectors.map(s => ({ value: s.id, label: s.nome })), [sectors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow search if at least one filter or text is present
    if (!searchTerm.trim() && !filterEquip && !filterSector) return;

    setSearched(true);
    
    const term = searchTerm.toLowerCase().trim();
    
    // Helper para comparação segura de IDs (String vs Number e espaços extras)
    const safeCompare = (recordId: string | number | undefined, filterId: string) => {
      if (!filterId) return true; // Se o filtro está vazio, ignora (retorna true)
      return String(recordId || '').trim() === String(filterId).trim();
    };

    const found = records.filter(r => {
      // 1. Text Match (Se o termo for vazio, retorna TRUE para não filtrar por texto)
      const matchesText = term === '' ? true : (
        (r.causaDiagnostico && r.causaDiagnostico.toLowerCase().includes(term)) ||
        (r.defeitoFalha && r.defeitoFalha.toLowerCase().includes(term)) ||
        (r.solucaoProcedimentos && r.solucaoProcedimentos.toLowerCase().includes(term)) ||
        (r.pecasUtilizadas && r.pecasUtilizadas.toLowerCase().includes(term))
      );

      // 2. Equipment Match
      const matchesEquip = safeCompare(r.equipamentoId, filterEquip);

      // 3. Sector Match
      const matchesSector = safeCompare(r.setorId, filterSector);

      return matchesText && matchesEquip && matchesSector;
    });

    // Sort by most recent
    found.sort((a, b) => new Date(b.dataInicial).getTime() - new Date(a.dataInicial).getTime());
    
    setResults(found);
  };

  const getEquipmentName = (id: string) => {
    const eq = equipments.find(e => String(e.id) === String(id));
    return eq ? `${eq.codigo} - ${eq.descricao}` : 'EQUIPAMENTO NÃO ENCONTRADO';
  };

  const getSectorName = (id: string) => {
    const sec = sectors.find(s => String(s.id) === String(id));
    return sec ? sec.nome : '-';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-b-accent rounded-t-xl rounded-b-lg p-6 shadow-sm transition-colors">
        <div className="flex items-start gap-4">
           <div className="p-3 rounded-lg text-accent bg-accent/10 dark:bg-accent/20">
             <FileSearch size={40} strokeWidth={1.5} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">Consulta ao Histórico de Diagnósticos</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase max-w-3xl">
               Pesquise por sintomas, equipamentos ou setores para encontrar soluções anteriores. O sistema buscará ocorrências semelhantes em toda a base de dados.
             </p>
           </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="border border-accent/20 bg-accent/5 dark:bg-slate-800/50 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase px-1">
          <Filter size={18} />
          <h3>Filtros de Busca</h3>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Sector Filter */}
             <div>
               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">
                 <div className="flex items-center gap-1"><Layers size={12}/> Filtrar por Setor:</div>
               </label>
               <SearchableSelect
                 options={sectorOptions}
                 value={filterSector}
                 onChange={setFilterSector}
                 placeholder="TODOS OS SETORES"
               />
             </div>

             {/* Equipment Filter */}
             <div>
               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">
                 <div className="flex items-center gap-1"><Cpu size={12}/> Filtrar por Equipamento:</div>
               </label>
               <SearchableSelect
                 options={equipOptions}
                 value={filterEquip}
                 onChange={setFilterEquip}
                 placeholder="TODOS OS EQUIPAMENTOS"
               />
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end border-t border-accent/10 dark:border-slate-600 pt-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase ml-1">
                <div className="flex items-center gap-1"><Wrench size={12}/> Digite o defeito, causa ou sintoma:</div>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="DEIXE EM BRANCO PARA VER TODO O HISTÓRICO..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="bg-accent hover:bg-accentHover text-white h-[46px] px-8 w-full md:w-auto shadow-md"
            >
              <Search size={18} />
              BUSCAR
            </Button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {searched && (
        <div className="animate-fade-in space-y-4">
          <h3 className="text-slate-600 dark:text-slate-300 font-bold uppercase ml-2 text-sm flex items-center gap-2">
             Resultados Encontrados: <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs">{results.length}</span>
          </h3>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((result) => (
                <div key={result.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                   <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-3 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{getEquipmentName(result.equipamentoId)}</span>
                        {result.setorId && (
                           <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-500">
                             {getSectorName(result.setorId)}
                           </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>OS: {result.documentacaoOS || 'N/A'}</span>
                        <span>{formatDate(result.dataInicial)}</span>
                      </div>
                   </div>

                   <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                         <h4 className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center gap-1">
                           <AlertCircle size={12}/> Defeito / Falha
                         </h4>
                         <p className="text-slate-700 dark:text-slate-300 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-900/50">
                           {result.defeitoFalha || 'NÃO INFORMADO'}
                         </p>

                         {result.causaDiagnostico && (
                           <div className="mt-3">
                             <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase mb-1">Causa Provável</h4>
                             <p className="text-slate-600 dark:text-slate-400 text-sm pl-2 border-l-2 border-amber-200 dark:border-amber-800">
                               {result.causaDiagnostico}
                             </p>
                           </div>
                         )}
                      </div>

                      <div>
                         <h4 className="text-xs font-bold text-green-600 dark:text-green-500 uppercase mb-1 flex items-center gap-1">
                           <CheckCircle size={12}/> Solução Realizada
                         </h4>
                         <p className="text-slate-700 dark:text-slate-300 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-100 dark:border-green-900/50">
                           {result.solucaoProcedimentos}
                         </p>

                         {result.pecasUtilizadas && (
                          <div className="mt-3">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Peças</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.pecasUtilizadas.split(/[,;]+/).map((peca, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-600">
                                  {peca.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-l-4 border-l-red-400 bg-red-50 dark:bg-red-900/20 dark:border-l-red-500">
               <div className="flex items-center gap-4 text-red-700 dark:text-red-400 py-2">
                 <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                   <AlertCircle size={24} />
                 </div>
                 <div>
                   <h3 className="font-bold">NENHUM DIAGNÓSTICO ENCONTRADO</h3>
                   <p className="text-sm opacity-80 mt-1">Não encontramos registros correspondentes aos filtros selecionados. Tente limpar o texto de busca ou mudar os filtros.</p>
                 </div>
               </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPage;