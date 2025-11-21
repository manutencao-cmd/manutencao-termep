import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, Equipment, Technician, Sector, MaintenanceType } from '../types';
import { Card } from '../components/Card';
import SearchableSelect from '../components/SearchableSelect';
import Button from '../components/Button';
import { Download, Table, Filter, FileBarChart } from 'lucide-react';

interface ReportsProps {
  records: MaintenanceRecord[];
  equipments: Equipment[];
  technicians: Technician[];
  sectors: Sector[];
  maintenanceTypes: MaintenanceType[];
}

const ReportsPage: React.FC<ReportsProps> = ({ records, equipments, technicians, sectors, maintenanceTypes }) => {
  const [filters, setFilters] = useState({
    visualization: 'TODAS' as 'TODAS' | 'PREVENTIVAS' | 'CORRETIVAS',
    equipamentoId: '',
    mecanicoId: '',
    setorId: '',
    tipoManutencaoId: '',
    causa: '',
    startDate: '',
    endDate: ''
  });

  const [generatedData, setGeneratedData] = useState<MaintenanceRecord[] | null>(null);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const uniqueCauses = useMemo(() => {
    const causes = records.map(r => r.causaDiagnostico).filter(Boolean);
    return [...new Set(causes)].sort();
  }, [records]);

  // Prepare Options
  const equipOptions = useMemo(() => equipments.map(e => ({ value: e.id, label: `${e.codigo} - ${e.descricao}` })), [equipments]);
  const techOptions = useMemo(() => technicians.map(t => ({ value: t.id, label: t.nome })), [technicians]);
  const sectorOptions = useMemo(() => sectors.map(s => ({ value: s.id, label: s.nome })), [sectors]);
  const typeOptions = useMemo(() => maintenanceTypes.map(t => ({ value: t.id, label: t.tipo })), [maintenanceTypes]);
  const causeOptions = useMemo(() => uniqueCauses.map(c => ({ value: c, label: c })), [uniqueCauses]);

  const handleInputChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setGeneratedData(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setGeneratedData(null);
  };

  const setVisualization = (val: 'TODAS' | 'PREVENTIVAS' | 'CORRETIVAS') => {
    setFilters(prev => ({ ...prev, visualization: val }));
    setGeneratedData(null);
  };

  const handleGenerate = () => {
    const data = records.filter(r => {
      const compareIds = (recordId: string | undefined, filterId: string) => {
        if (!filterId) return true; 
        return String(recordId || '').trim() === String(filterId).trim();
      };

      if (filters.visualization === 'PREVENTIVAS') {
        const type = maintenanceTypes.find(t => t.id === r.tipoManutencaoId);
        if (!type || !type.tipo.toUpperCase().includes('PREVENTIVA')) return false;
      }
      if (filters.visualization === 'CORRETIVAS') {
        const type = maintenanceTypes.find(t => t.id === r.tipoManutencaoId);
        if (!type || !type.tipo.toUpperCase().includes('CORRETIVA')) return false;
      }

      const matchesEquip = compareIds(r.equipamentoId, filters.equipamentoId);
      const matchesTech = compareIds(r.mecanicoId, filters.mecanicoId);
      const matchesSector = compareIds(r.setorId, filters.setorId);
      const matchesType = compareIds(r.tipoManutencaoId, filters.tipoManutencaoId);
      const matchesCause = filters.causa ? r.causaDiagnostico === filters.causa : true;
      
      let matchesDate = true;
      if (filters.startDate && r.dataInicial < filters.startDate) matchesDate = false;
      if (filters.endDate && r.dataInicial > filters.endDate) matchesDate = false;

      return matchesEquip && matchesTech && matchesSector && matchesType && matchesCause && matchesDate;
    });
    
    data.sort((a, b) => new Date(b.dataInicial).getTime() - new Date(a.dataInicial).getTime());
    setGeneratedData(data);
  };

  const getEquipmentName = (id: string) => equipments.find(e => e.id === id)?.descricao || id;
  const getTechName = (id: string) => technicians.find(t => t.id === id)?.nome || id;

  const handleExportCSV = () => {
    if (!generatedData || generatedData.length === 0) return;

    const headers = [
      "ID", "EQUIPAMENTO", "HORIMETRO/KM", "HORA CHEGADA", "DATA INICIAL", 
      "DATA FINAL", "EMPRESA", "TIPO MANUTENCAO", "SETOR", "OS", 
      "MECANICO", "DEFEITO/FALHA", "CAUSA/DIAGNOSTICO", "DICAS", 
      "PECAS UTILIZADAS", "SOLUCAO", "OUTROS PROBLEMAS", "VALOR"
    ];
    
    const csvRows = [
      headers.join(','),
      ...generatedData.map(row => {
        const clean = (txt: string) => `"${(txt || '').replace(/"/g, '""').toUpperCase()}"`;
        const typeName = maintenanceTypes.find(t => t.id === row.tipoManutencaoId)?.tipo || row.tipoManutencaoId;
        const sectorName = sectors.find(s => s.id === row.setorId)?.nome || row.setorId;
        
        const values = [
          row.id,
          clean(getEquipmentName(row.equipamentoId)),
          row.horimetroKm,
          clean(row.horaChegada),
          formatDate(row.dataInicial),
          formatDate(row.dataFinal),
          clean(row.empresaId), 
          clean(typeName),
          clean(sectorName),
          clean(row.documentacaoOS),
          clean(getTechName(row.mecanicoId)),
          clean(row.defeitoFalha),
          clean(row.causaDiagnostico),
          clean(row.dicasManutencao),
          clean(row.pecasUtilizadas),
          clean(row.solucaoProcedimentos),
          clean(row.outrosProblemas),
          row.valor
        ];
        return values.join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RELATORIO_MANUTENCAO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       {/* Header Business Style */}
       <div className="bg-white dark:bg-slate-800 border-b-4 border-b-accent rounded-t-xl rounded-b-lg p-6 shadow-sm transition-colors">
        <div className="flex items-start gap-4">
           <div className="p-3 rounded-lg text-accent bg-accent/10 dark:bg-accent/20">
             <FileBarChart size={40} strokeWidth={1.5} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">Central de Relatórios</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase">
               Gere listagens personalizadas e exporte dados para análise externa.
             </p>
           </div>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 text-accent font-bold uppercase">
          <Filter size={18} />
          Filtros de Relatório
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Visualização</label>
              <div className="flex border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden bg-white dark:bg-slate-800">
                <button 
                  onClick={() => setVisualization('TODAS')}
                  className={`flex-1 py-2 text-[10px] font-bold transition-colors ${filters.visualization === 'TODAS' ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  TODAS
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                <button 
                  onClick={() => setVisualization('PREVENTIVAS')}
                  className={`flex-1 py-2 text-[10px] font-bold transition-colors ${filters.visualization === 'PREVENTIVAS' ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  PREV.
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                <button 
                  onClick={() => setVisualization('CORRETIVAS')}
                  className={`flex-1 py-2 text-[10px] font-bold transition-colors ${filters.visualization === 'CORRETIVAS' ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  CORR.
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Início</label>
              <input 
                type="date" 
                name="startDate"
                value={filters.startDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:border-accent bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Fim</label>
              <input 
                type="date" 
                name="endDate"
                value={filters.endDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:border-accent bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Equipamento</label>
              <SearchableSelect
                options={equipOptions}
                value={filters.equipamentoId}
                onChange={(val) => handleInputChange('equipamentoId', val)}
                placeholder="TODOS"
              />
            </div>
             <div className="lg:col-span-2 hidden lg:block"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Mecânico</label>
              <SearchableSelect
                options={techOptions}
                value={filters.mecanicoId}
                onChange={(val) => handleInputChange('mecanicoId', val)}
                placeholder="TODOS"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Setor</label>
              <SearchableSelect
                options={sectorOptions}
                value={filters.setorId}
                onChange={(val) => handleInputChange('setorId', val)}
                placeholder="TODOS"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Tipo Manut.</label>
              <SearchableSelect
                options={typeOptions}
                value={filters.tipoManutencaoId}
                onChange={(val) => handleInputChange('tipoManutencaoId', val)}
                placeholder="TODOS"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Causa Comum</label>
              <SearchableSelect
                options={causeOptions}
                value={filters.causa}
                onChange={(val) => handleInputChange('causa', val)}
                placeholder="TODAS"
              />
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={handleGenerate} className="w-full md:w-auto bg-accent hover:bg-accentHover">
              <Table size={18} />
              GERAR RELATÓRIO
            </Button>
          </div>
        </div>
      </Card>

      {generatedData && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase">
              Resultados: <span className="text-accent">{generatedData.length}</span> Registros
            </h3>
            <Button variant="secondary" onClick={handleExportCSV} disabled={generatedData.length === 0} className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30">
              <Download size={18} />
              BAIXAR CSV
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 sticky top-0 text-accent">
                  <tr>
                    <th className="px-6 py-3 font-bold">DATA</th>
                    <th className="px-6 py-3 font-bold">OS</th>
                    <th className="px-6 py-3 font-bold">EQUIPAMENTO</th>
                    <th className="px-6 py-3 font-bold">DEFEITO</th>
                    <th className="px-6 py-3 font-bold">VALOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {generatedData.length > 0 ? (
                    generatedData.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{formatDate(record.dataInicial)}</td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 font-bold">{record.documentacaoOS}</td>
                        <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{getEquipmentName(record.equipamentoId)}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 truncate max-w-xs">{record.defeitoFalha}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.valor || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        NENHUM DADO PARA OS FILTROS SELECIONADOS.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;