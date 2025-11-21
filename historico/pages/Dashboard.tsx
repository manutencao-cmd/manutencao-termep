import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, Equipment, Technician, Sector, MaintenanceType } from '../types';
import { Card } from '../components/Card';
import SearchableSelect from '../components/SearchableSelect';
import { Activity, CheckCircle, AlertTriangle, DollarSign, LayoutDashboard, Filter, PieChart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  records: MaintenanceRecord[];
  equipments: Equipment[];
  technicians: Technician[];
  sectors: Sector[];
  maintenanceTypes: MaintenanceType[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  records, 
  equipments,
  technicians,
  sectors,
  maintenanceTypes 
}) => {
  
  // Filter States
  const [visualization, setVisualization] = useState<'TODAS' | 'PREVENTIVAS' | 'CORRETIVAS'>('TODAS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCause, setFilterCause] = useState('');

  // Helper to display date DD/MM/YYYY
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Unique Causes for Dropdown
  const uniqueCauses = useMemo(() => {
    const causes = records.map(r => r.causaDiagnostico).filter(Boolean);
    return [...new Set(causes)].sort();
  }, [records]);

  // Prepare Options for SearchableSelects
  const equipOptions = useMemo(() => equipments.map(e => ({ value: e.id, label: `${e.codigo} - ${e.descricao}` })), [equipments]);
  const techOptions = useMemo(() => technicians.map(t => ({ value: t.id, label: t.nome })), [technicians]);
  const sectorOptions = useMemo(() => sectors.map(s => ({ value: s.id, label: s.nome })), [sectors]);
  const typeOptions = useMemo(() => maintenanceTypes.map(t => ({ value: t.id, label: t.tipo })), [maintenanceTypes]);
  const causeOptions = useMemo(() => uniqueCauses.map(c => ({ value: c, label: c })), [uniqueCauses]);


  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (visualization === 'PREVENTIVAS') {
        const type = maintenanceTypes.find(t => t.id === r.tipoManutencaoId);
        if (!type || !type.tipo.toUpperCase().includes('PREVENTIVA')) return false;
      }
      if (visualization === 'CORRETIVAS') {
        const type = maintenanceTypes.find(t => t.id === r.tipoManutencaoId);
        if (!type || !type.tipo.toUpperCase().includes('CORRETIVA')) return false;
      }
      if (startDate && r.dataInicial < startDate) return false;
      if (endDate && r.dataInicial > endDate) return false;
      if (filterEquip && r.equipamentoId !== filterEquip) return false;
      if (filterTech && r.mecanicoId !== filterTech) return false;
      if (filterSector && r.setorId !== filterSector) return false;
      if (filterType && r.tipoManutencaoId !== filterType) return false;
      if (filterCause && r.causaDiagnostico !== filterCause) return false;
      return true;
    });
  }, [records, visualization, startDate, endDate, filterEquip, filterTech, filterSector, filterType, filterCause, maintenanceTypes]);

  // Stats Calculation
  const stats = {
    total: filteredRecords.length,
    completed: filteredRecords.filter(r => r.dataFinal).length,
    pending: filteredRecords.filter(r => !r.dataFinal).length,
    totalCost: filteredRecords.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)
  };

  // Chart Data
  const chartData = [
    { name: 'CONCLUÍDOS', value: stats.completed, color: '#22c55e' },
    { name: 'ABERTOS', value: stats.pending, color: '#f59e0b' },
  ];

  // Helpers for Display
  const getEquipmentName = (id: string) => equipments.find(e => e.id === id)?.descricao || id;
  const getEquipmentCode = (id: string) => equipments.find(e => e.id === id)?.codigo || '';
  
  return (
    <div className="space-y-6">
      {/* Header Business Style */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-b-accent rounded-t-xl rounded-b-lg p-6 shadow-sm transition-colors">
        <div className="flex items-start gap-4">
           <div className="p-3 rounded-lg text-accent bg-accent/10 dark:bg-accent/20">
             <LayoutDashboard size={40} strokeWidth={1.5} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">Dashboard Gerencial</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase">
               Visão geral dos indicadores de performance, custos e status das manutenções.
             </p>
           </div>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="pb-6 border border-accent/20 bg-accent/5 dark:bg-slate-800/50 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase px-1">
          <Filter size={18} />
          <h3>Filtros do Painel</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Visualization Toggle */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Tipo de Visão</label>
              <div className="flex border border-accent/30 dark:border-slate-600 rounded-md overflow-hidden bg-white dark:bg-slate-700 shadow-sm">
                <button 
                  onClick={() => setVisualization('TODAS')}
                  className={`flex-1 py-2 text-[10px] font-bold transition-colors ${visualization === 'TODAS' ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                >
                  TODAS
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                <button 
                  onClick={() => setVisualization('PREVENTIVAS')}
                  className={`flex-1 py-2 text-[10px] font-bold transition-colors ${visualization === 'PREVENTIVAS' ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                >
                  PREVENTIVAS
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                <button 
                  onClick={() => setVisualization('CORRETIVAS')}
                  className={`flex-1 py-2 text-[10px] font-bold transition-colors ${visualization === 'CORRETIVAS' ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                >
                  CORRETIVAS
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Início</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:border-accent bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Fim</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:border-accent bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Equipment */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Equipamento</label>
              <SearchableSelect
                options={equipOptions}
                value={filterEquip}
                onChange={setFilterEquip}
                placeholder="TODOS OS EQUIPAMENTOS"
              />
            </div>
            
            <div className="lg:col-span-2 hidden lg:block"></div>
          </div>

          {/* Second Row Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Mecânico</label>
              <SearchableSelect
                options={techOptions}
                value={filterTech}
                onChange={setFilterTech}
                placeholder="TODOS OS MECÂNICOS"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Setor</label>
              <SearchableSelect
                options={sectorOptions}
                value={filterSector}
                onChange={setFilterSector}
                placeholder="TODOS OS SETORES"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Tipo Manut.</label>
              <SearchableSelect
                options={typeOptions}
                value={filterType}
                onChange={setFilterType}
                placeholder="TODOS OS TIPOS"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Causa</label>
              <SearchableSelect
                options={causeOptions}
                value={filterCause}
                onChange={setFilterCause}
                placeholder="TODAS AS CAUSAS"
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* KPI Cards - Business Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total */}
        <Card className="bg-white dark:bg-slate-800 p-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lançamentos</p>
              <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
          <div className="h-1 w-full bg-blue-600"></div>
        </Card>

        {/* Completed */}
        <Card className="bg-white dark:bg-slate-800 p-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Concluídos</p>
              <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-1">{stats.completed}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
           <div className="h-1 w-full bg-green-500"></div>
        </Card>

        {/* Pending */}
        <Card className="bg-white dark:bg-slate-800 p-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Aberto</p>
              <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-1">{stats.pending}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>
           <div className="h-1 w-full bg-amber-500"></div>
        </Card>

        {/* Cost */}
        <Card className="bg-white dark:bg-slate-800 p-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custo Total</p>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.totalCost)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
           <div className="h-1 w-full bg-emerald-600"></div>
        </Card>
      </div>

      {/* Charts & List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
             <PieChart size={16} />
             <h3>Status das Ordens</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e293b', 
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-80 flex flex-col">
           <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
             <BarChart3 size={16} />
             <h3>Últimos Registros</h3>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {filteredRecords.slice(0, 10).map(r => (
              <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg text-sm hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all cursor-default group">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent">{r.documentacaoOS || 'S/N'}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 px-1.5 rounded">{getEquipmentCode(r.equipamentoId)}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{formatDate(r.dataInicial)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-slate-600 dark:text-slate-300 truncate flex-1 pr-2 font-medium" title={r.defeitoFalha}>{r.defeitoFalha}</p>
                </div>
                 <p className="text-xs text-slate-400 mt-1 truncate group-hover:text-accent transition-colors">
                    {getEquipmentName(r.equipamentoId)}
                 </p>
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                NENHUM REGISTRO ENCONTRADO COM OS FILTROS ATUAIS.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;