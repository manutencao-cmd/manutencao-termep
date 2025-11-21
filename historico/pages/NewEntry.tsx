import React, { useState, useEffect, useMemo } from 'react';
import { Equipment, Technician, MaintenanceRecord, Status, Sector, Company, MaintenanceType } from '../types';
import { Card } from '../components/Card';
import Button from '../components/Button';
import AiAssistant from '../components/AiAssistant';
import SearchableSelect from '../components/SearchableSelect';
import { Save, Clock, Wrench, Briefcase, FileText, XCircle, PenTool } from 'lucide-react';
import { fetchSectors, fetchCompanies, fetchMaintenanceTypes } from '../services/sheetService';

interface NewEntryProps {
  equipments: Equipment[];
  technicians: Technician[];
  onSave: (record: MaintenanceRecord) => void;
  onUpdate?: (record: MaintenanceRecord) => void;
  onCancel: () => void;
  initialData?: MaintenanceRecord | null;
}

const NewEntry: React.FC<NewEntryProps> = ({ equipments, technicians, onSave, onUpdate, onCancel, initialData }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [types, setTypes] = useState<MaintenanceType[]>([]);

  useEffect(() => {
    fetchSectors().then(setSectors);
    fetchCompanies().then(setCompanies);
    fetchMaintenanceTypes().then(setTypes);
  }, []);

  const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultFormState = {
    dataInicial: getTodayLocal(),
    horaChegada: '08:00',
    dataFinal: '',
    horimetroKm: 0,
    valor: 0,
    equipamentoId: '',
    mecanicoId: '',
    empresaId: '',
    tipoManutencaoId: '',
    setorId: '',
    documentacaoOS: '',
    defeitoFalha: '',
    causaDiagnostico: '',
    dicasManutencao: '',
    pecasUtilizadas: '',
    solucaoProcedimentos: '',
    outrosProblemas: ''
  };

  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>(defaultFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dataFinal: initialData.dataFinal || '',
        outrosProblemas: initialData.outrosProblemas || '',
        dicasManutencao: initialData.dicasManutencao || '',
        pecasUtilizadas: initialData.pecasUtilizadas || ''
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [initialData]);

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Prepare Options
  const equipOptions = useMemo(() => equipments.map(e => ({ value: e.id, label: `${e.codigo} - ${e.descricao}` })), [equipments]);
  const techOptions = useMemo(() => technicians.map(t => ({ value: t.id, label: t.nome })), [technicians]);
  const companyOptions = useMemo(() => companies.map(c => ({ value: c.id, label: c.nome })), [companies]);
  const sectorOptions = useMemo(() => sectors.map(s => ({ value: s.id, label: s.nome })), [sectors]);
  const typeOptions = useMemo(() => types.map(t => ({ value: t.id, label: t.tipo })), [types]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const recordPayload: MaintenanceRecord = {
      id: initialData?.id || crypto.randomUUID(),
      equipamentoId: formData.equipamentoId || '',
      horimetroKm: Number(formData.horimetroKm) || 0,
      horaChegada: formData.horaChegada || '',
      dataInicial: formData.dataInicial || '',
      dataFinal: formData.dataFinal || null,
      empresaId: formData.empresaId || '',
      tipoManutencaoId: formData.tipoManutencaoId || '',
      setorId: formData.setorId || '',
      documentacaoOS: formData.documentacaoOS || '',
      mecanicoId: formData.mecanicoId || '',
      defeitoFalha: formData.defeitoFalha || '',
      causaDiagnostico: formData.causaDiagnostico || '',
      dicasManutencao: formData.dicasManutencao || '',
      pecasUtilizadas: formData.pecasUtilizadas || '',
      solucaoProcedimentos: formData.solucaoProcedimentos || '',
      outrosProblemas: formData.outrosProblemas || '',
      valor: Number(formData.valor) || 0,
      status: formData.dataFinal ? Status.COMPLETED : Status.PENDING,
      isLocal: true 
    };

    await new Promise(r => setTimeout(r, 800));
    
    if (initialData && onUpdate) {
      onUpdate(recordPayload);
    } else {
      onSave(recordPayload);
    }
    
    setSaving(false);
    if (!initialData) {
      setFormData(prev => ({ ...defaultFormState, dataInicial: getTodayLocal() }));
    }
  };

  const selectedEquipment = equipments.find(e => e.id === formData.equipamentoId) || null;
  const isEditing = !!initialData;

  // Common input class
  const inputClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400";
  const textAreaClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 p-3 outline-none resize-none focus:border-accent text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1";

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      
      {/* Header Business Style */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-b-accent rounded-t-xl rounded-b-lg p-6 shadow-sm transition-colors">
        <div className="flex items-start gap-4">
           <div className="p-3 rounded-lg text-accent bg-accent/10 dark:bg-accent/20">
             <PenTool size={40} strokeWidth={1.5} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">
                {isEditing ? `Editar Lançamento` : 'Novo Lançamento de Manutenção'}
             </h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase">
               {isEditing ? `Atualizando registro OS: ${formData.documentacaoOS}` : 'Preencha os dados abaixo para registrar uma nova intervenção.'}
             </p>
           </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        
        {/* Section 1 */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 text-accent font-bold uppercase">
            <Briefcase size={18} />
            Identificação da Ordem
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Nº OS (Documentação)</label>
              <input 
                type="text" 
                name="documentacaoOS" 
                value={formData.documentacaoOS} 
                onChange={handleChange}
                placeholder="EX: OS-2024-001"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Empresa</label>
              <SearchableSelect
                options={companyOptions}
                value={formData.empresaId || ''}
                onChange={(val) => handleSelectChange('empresaId', val)}
                placeholder="SELECIONE..."
              />
            </div>
            <div>
              <label className={labelClass}>Setor</label>
              <SearchableSelect
                options={sectorOptions}
                value={formData.setorId || ''}
                onChange={(val) => handleSelectChange('setorId', val)}
                placeholder="SELECIONE..."
              />
            </div>
          </div>
        </Card>

        {/* Section 2 */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 text-accent font-bold uppercase">
            <Wrench size={18} />
            Equipamento e Responsável
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className={labelClass}>Equipamento *</label>
              <SearchableSelect
                options={equipOptions}
                value={formData.equipamentoId || ''}
                onChange={(val) => handleSelectChange('equipamentoId', val)}
                placeholder="BUSQUE PELO CÓDIGO OU NOME..."
                required={true}
              />
            </div>
            <div>
              <label className={labelClass}>Mecânico/Técnico *</label>
              <SearchableSelect
                options={techOptions}
                value={formData.mecanicoId || ''}
                onChange={(val) => handleSelectChange('mecanicoId', val)}
                placeholder="SELECIONE..."
                required={true}
              />
            </div>
            <div>
              <label className={labelClass}>Tipo Manutenção</label>
              <SearchableSelect
                options={typeOptions}
                value={formData.tipoManutencaoId || ''}
                onChange={(val) => handleSelectChange('tipoManutencaoId', val)}
                placeholder="SELECIONE..."
              />
            </div>
          </div>
        </Card>

        {/* Section 3 */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 text-accent font-bold uppercase">
            <Clock size={18} />
            Dados de Tempo e Uso
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className={labelClass}>Data Inicial *</label>
              <input 
                type="date" 
                name="dataInicial" 
                value={formData.dataInicial} 
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Hora Chegada</label>
              <input 
                type="time" 
                name="horaChegada" 
                value={formData.horaChegada} 
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data Final</label>
              <input 
                type="date" 
                name="dataFinal" 
                value={formData.dataFinal || ''} 
                onChange={handleChange}
                className={inputClass}
              />
              <p className="text-[10px] text-slate-400 mt-1">PREENCHER ENCERRA A OS.</p>
            </div>
            <div>
              <label className={labelClass}>Horímetro/Km</label>
              <input 
                type="number" 
                name="horimetroKm" 
                value={formData.horimetroKm} 
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </Card>

        {/* Section 4 */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 text-accent font-bold uppercase">
            <FileText size={18} />
            Diagnóstico e Solução
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Defeito / Falha Relatada *</label>
              <textarea 
                name="defeitoFalha" 
                value={formData.defeitoFalha} 
                onChange={handleChange}
                required
                rows={2}
                className={textAreaClass}
                placeholder="DESCREVA O PROBLEMA..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Causa / Diagnóstico</label>
                <textarea 
                  name="causaDiagnostico" 
                  value={formData.causaDiagnostico} 
                  onChange={handleChange}
                  rows={3}
                  className={textAreaClass}
                  placeholder="DESCREVA O DIAGNÓSTICO TÉCNICO..."
                />
              </div>
              <div>
                <label className={labelClass}>Solução / Procedimentos *</label>
                <textarea 
                  name="solucaoProcedimentos" 
                  value={formData.solucaoProcedimentos} 
                  onChange={handleChange}
                  required
                  rows={3}
                  className={textAreaClass}
                />
              </div>
            </div>

             <AiAssistant 
                equipment={selectedEquipment}
                currentDefect={formData.defeitoFalha || ''}
                currentDiagnosis={formData.causaDiagnostico || ''}
              />

             <div>
                <label className={labelClass}>Peças Utilizadas</label>
                <input
                  type="text"
                  name="pecasUtilizadas" 
                  value={formData.pecasUtilizadas} 
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="EX: FILTRO ÓLEO, PARAFUSO M8..."
                />
              </div>
          </div>
        </Card>

        {/* Section 5 */}
        <Card className="border border-slate-200 dark:border-slate-700">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className={labelClass}>Outros Problemas Observados</label>
               <textarea 
                  name="outrosProblemas" 
                  value={formData.outrosProblemas} 
                  onChange={handleChange}
                  rows={2}
                  className={textAreaClass}
                />
             </div>
             <div>
               <label className={labelClass}>Dicas de Manutenção</label>
               <textarea 
                  name="dicasManutencao" 
                  value={formData.dicasManutencao} 
                  onChange={handleChange}
                  rows={2}
                  className={textAreaClass}
                />
             </div>
           </div>
           <div className="mt-4">
             <label className={labelClass}>Valor Total (R$)</label>
             <input 
                type="number" 
                step="0.01"
                name="valor" 
                value={formData.valor} 
                onChange={handleChange}
                className={`md:w-1/3 font-bold ${inputClass}`}
              />
           </div>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} className="px-6 border-red-200 text-red-600 hover:bg-red-50 dark:bg-slate-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20">
            <XCircle size={20} />
            CANCELAR
          </Button>
          <Button type="submit" isLoading={saving} className="px-8 bg-accent hover:bg-accentHover text-white">
            <Save size={20} />
            {isEditing ? 'ATUALIZAR' : 'SALVAR'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewEntry;