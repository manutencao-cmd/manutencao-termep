import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, Equipment, Technician, Status } from '../types';
import { Card } from '../components/Card';
import SearchableSelect from '../components/SearchableSelect';
import { Search, Filter, FileText, Bot, X, Pencil, Trash2, Download, FileOutput, History, Layers } from 'lucide-react';
import Button from '../components/Button';
import { generateHistorySummary } from '../services/geminiService';

interface HistoryProps {
  records: MaintenanceRecord[];
  equipments: Equipment[];
  technicians: Technician[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: string) => void;
}

const HistoryPage: React.FC<HistoryProps> = ({ records, equipments, technicians, onEdit, onDelete }) => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // AI State
  const [selectedEquipForAi, setSelectedEquipForAi] = useState<Equipment | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Format Date helper to avoid TZ issues
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEquip('');
    setFilterTech('');
    setStartDate('');
    setEndDate('');
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("TEM CERTEZA QUE DESEJA EXCLUIR ESTE REGISTRO?")) {
      onDelete(id);
    }
  };

  const filteredRecords = records.filter(r => {
    const desc = r.defeitoFalha || '';
    const sol = r.solucaoProcedimentos || '';
    const os = r.documentacaoOS || '';
    
    const matchesSearch = 
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEquip = filterEquip ? r.equipamentoId === filterEquip : true;
    const matchesTech = filterTech ? r.mecanicoId === filterTech : true;
    
    let matchesDate = true;
    if (startDate && r.dataInicial < startDate) matchesDate = false;
    if (endDate && r.dataInicial > endDate) matchesDate = false;

    return matchesSearch && matchesEquip && matchesTech && matchesDate;
  });

  const getEquipmentName = (id: string) => equipments.find(e => e.id === id)?.descricao || 'N/A';
  const getEquipmentCode = (id: string) => equipments.find(e => e.id === id)?.codigo || '???';
  
  const getTechName = (id: string) => technicians.find(t => t.id === id)?.nome || id;

  // Prepare Options
  const equipOptions = useMemo(() => equipments.map(e => ({ value: e.id, label: `${e.codigo} - ${e.descricao}` })), [equipments]);
  const techOptions = useMemo(() => technicians.map(t => ({ value: t.id, label: t.nome })), [technicians]);

  const handleAiSummary = async () => {
    if (!filterEquip) {
      alert("SELECIONE UM EQUIPAMENTO PRIMEIRO PARA GERAR O RESUMO.");
      return;
    }
    const equip = equipments.find(e => e.id === filterEquip);
    if (!equip) return;

    setAiLoading(true);
    setSelectedEquipForAi(equip);
    const summary = await generateHistorySummary(filteredRecords, equip);
    setAiSummary(summary);
    setAiLoading(false);
  };

  const handleExportAllCSV = () => {
    if (records.length === 0) return;

    const headers = [
      "ID", "DATA", "OS", "COD_EQUIP", "EQUIPAMENTO", "MECANICO", 
      "DEFEITO", "SOLUCAO", "VALOR", "STATUS"
    ];

    const csvRows = [
      headers.join(','),
      ...records.map(r => {
         const clean = (txt: string) => `"${(txt || '').replace(/"/g, '""').toUpperCase()}"`;
         return [
           r.id,
           formatDate(r.dataInicial),
           clean(r.documentacaoOS),
           clean(getEquipmentCode(r.equipamentoId)),
           clean(getEquipmentName(r.equipamentoId)),
           clean(getTechName(r.mecanicoId)),
           clean(r.defeitoFalha),
           clean(r.solucaoProcedimentos),
           r.valor,
           r.dataFinal ? 'CONCLUIDO' : 'PENDENTE'
         ].join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TODOS_LANCAMENTOS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = (record: MaintenanceRecord) => {
     const win = window.open('', '', 'width=800,height=800');
    if (!win) return;

    const content = `
      <html>
        <head>
          <title>HISTÓRICO DE MANUTENÇÃO - OS ${record.documentacaoOS}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-transform: uppercase; color: #333; }
            .header { border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #1e293b; }
            .meta { text-align: right; font-size: 12px; color: #666; }
            .section { margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .section-title { font-size: 14px; font-weight: bold; color: #0284c7; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .field { margin-bottom: 10px; }
            .label { font-size: 10px; color: #64748b; font-weight: bold; display: block; margin-bottom: 2px; }
            .value { font-size: 14px; font-weight: 500; }
            .full { grid-column: 1 / -1; }
            .footer { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">HISTÓRICO DE MANUTENÇÃO</div>
              <div style="margin-top: 5px; font-weight: bold;">Nº ${record.documentacaoOS || 'S/N'}</div>
            </div>
            <div class="meta">
              DATA EMISSÃO: ${new Date().toLocaleDateString()}<br/>
              STATUS: ${record.dataFinal ? 'CONCLUÍDO' : 'ABERTO'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">EQUIPAMENTO E LOCALIZAÇÃO</div>
            <div class="grid">
              <div class="field">
                <span class="label">CÓDIGO</span>
                <span class="value">${getEquipmentCode(record.equipamentoId)}</span>
              </div>
              <div class="field">
                <span class="label">DESCRIÇÃO</span>
                <span class="value">${getEquipmentName(record.equipamentoId)}</span>
              </div>
              <div class="field">
                <span class="label">MECÂNICO RESPONSÁVEL</span>
                <span class="value">${getTechName(record.mecanicoId)}</span>
              </div>
              <div class="field">
                <span class="label">HORÍMETRO/KM</span>
                <span class="value">${record.horimetroKm}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">DETALHES DO SERVIÇO</div>
            <div class="grid">
               <div class="field">
                <span class="label">DATA INICIAL</span>
                <span class="value">${formatDate(record.dataInicial)}</span>
              </div>
              <div class="field">
                <span class="label">DATA FINAL</span>
                <span class="value">${formatDate(record.dataFinal)}</span>
              </div>
              <div class="field full">
                <span class="label">DEFEITO RELATADO</span>
                <span class="value">${record.defeitoFalha}</span>
              </div>
              <div class="field full">
                <span class="label">CAUSA / DIAGNÓSTICO</span>
                <span class="value">${record.causaDiagnostico || '-'}</span>
              </div>
              <div class="field full">
                <span class="label">SOLUÇÃO APLICADA</span>
                <span class="value">${record.solucaoProcedimentos}</span>
              </div>
              <div class="field full">
                <span class="label">PEÇAS UTILIZADAS</span>
                <span class="value">${record.pecasUtilizadas || '-'}</span>
              </div>
            </div>
          </div>

           <div class="section">
            <div class="section-title">CUSTOS E OBSERVAÇÕES</div>
            <div class="grid">
               <div class="field">
                <span class="label">CUSTO TOTAL</span>
                <span class="value">R$ ${record.valor}</span>
              </div>
               <div class="field full">
                <span class="label">OBSERVAÇÕES ADICIONAIS</span>
                <span class="value">${record.outrosProblemas || '-'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>_______________________________________________________</p>
            <p>ASSINATURA DO TÉCNICO</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    win.document.write(content);
    win.document.close();
  };

  return (
    <div className="space-y-6">
       {/* Header Business Style */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-b-accent rounded-t-xl rounded-b-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-4">
           <div className="p-3 rounded-lg text-accent bg-accent/10 dark:bg-accent/20">
             <History size={40} strokeWidth={1.5} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">Histórico de Manutenção</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase">
               Gerencie e consulte todos os registros de intervenções realizadas na frota.
             </p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleExportAllCSV} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
             <Download size={18} />
             CSV
           </Button>
           <Button 
            variant="secondary" 
            onClick={handleAiSummary}
            disabled={!filterEquip}
            className="text-accent border-accent/20 hover:bg-accent/5 dark:bg-slate-700 dark:text-accent shadow-sm"
           >
             <Bot size={18} />
             Análise IA
           </Button>
        </div>
      </div>

      {/* AI Summary Section */}
      {selectedEquipForAi && aiSummary && (
        <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 rounded-xl p-6 shadow-sm animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Bot size={20} />
              RELATÓRIO INTELIGENTE: {selectedEquipForAi.descricao}
            </h3>
            <button onClick={() => setAiSummary(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </div>
          <div className="prose prose-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {aiSummary}
          </div>
        </div>
      )}

      {aiLoading && (
         <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-6 flex items-center justify-center gap-3 text-indigo-700 dark:text-indigo-300">
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
            <span>GERANDO INSIGHTS SOBRE O HISTÓRICO...</span>
         </div>
      )}

      <Card className="border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase px-1">
          <Filter size={18} />
          <h3>Filtros de Pesquisa</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Busca Rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                autoComplete="off"
                placeholder="BUSCAR DEFEITO, OS..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Equipamento</label>
            <SearchableSelect
              options={equipOptions}
              value={filterEquip}
              onChange={setFilterEquip}
              placeholder="TODOS"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Mecânico</label>
            <SearchableSelect
              options={techOptions}
              value={filterTech}
              onChange={setFilterTech}
              placeholder="TODOS"
            />
          </div>

           <div className="flex gap-2 items-end">
             <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Período</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg outline-none text-sm focus:border-accent bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="DATA INICIAL"
                  />
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg outline-none text-sm focus:border-accent bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="DATA FINAL"
                  />
                </div>
             </div>
          </div>

          <div className="flex items-end">
             <button 
               onClick={clearFilters}
               className="text-sm text-slate-500 hover:text-red-500 underline flex items-center gap-1 pb-2 transition-colors"
             >
               <X size={14} /> LIMPAR FILTROS
             </button>
          </div>
        </div>
      </Card>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 text-accent">
              <tr>
                <th className="px-6 py-4 font-bold">DATA</th>
                <th className="px-6 py-4 font-bold">OS</th>
                <th className="px-6 py-4 font-bold">EQUIPAMENTO</th>
                <th className="px-6 py-4 font-bold">DEFEITO / FALHA</th>
                <th className="px-6 py-4 font-bold">SOLUÇÃO</th>
                <th className="px-6 py-4 font-bold">MECÂNICO</th>
                <th className="px-6 py-4 font-bold text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDate(record.dataInicial)}</td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 text-xs font-bold">{record.documentacaoOS || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-accent font-bold text-xs">{getEquipmentCode(record.equipamentoId)}</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{getEquipmentName(record.equipamentoId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={record.defeitoFalha}>{record.defeitoFalha}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={record.solucaoProcedimentos}>{record.solucaoProcedimentos}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{getTechName(record.mecanicoId)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handlePrintPDF(record)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="GERAR PDF"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(record)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="EDITAR"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(record.id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="EXCLUIR"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileOutput size={32} className="opacity-20" />
                      <p>NENHUM REGISTRO ENCONTRADO COM ESTES FILTROS.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;