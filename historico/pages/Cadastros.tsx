import React, { useState, useEffect } from 'react';
import { Company, Technician, Sector, MaintenanceType, Equipment } from '../types';
import { Card } from '../components/Card';
import Button from '../components/Button';
import { Plus, Trash2, Pencil, RefreshCw, Users, Database, Settings } from 'lucide-react';
import { createItem, updateItem, deleteItem } from '../services/sheetService';

interface CadastrosProps {
  companies: Company[];
  technicians: Technician[];
  sectors: Sector[];
  types: MaintenanceType[];
  equipments: Equipment[];
  refreshData: () => void;
}

type Tab = 'empresas' | 'mecanicos' | 'setores' | 'tipos' | 'equipamentos';

const CadastrosPage: React.FC<CadastrosProps> = ({ 
  companies, technicians, sectors, types, equipments, refreshData 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('empresas');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAdding(false);
    setFormData({});
  }, [activeTab]);

  const getDbKey = () => {
    switch(activeTab) {
      case 'empresas': return 'db_companies';
      case 'mecanicos': return 'db_technicians';
      case 'setores': return 'db_sectors';
      case 'tipos': return 'db_types';
      case 'equipamentos': return 'db_equipment';
      default: return '';
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("TEM CERTEZA QUE DESEJA EXCLUIR?")) return;
    setLoading(true);
    try {
      await deleteItem(getDbKey(), id);
      await refreshData();
    } catch (error) {
      alert("Erro ao excluir: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const isEdit = !!formData.id;
    const id = formData.id || crypto.randomUUID();
    const itemToSave = { ...formData, id };

    try {
      if (isEdit) {
        await updateItem(getDbKey(), itemToSave);
      } else {
        await createItem(getDbKey(), itemToSave);
      }
      
      await refreshData();
      setIsAdding(false);
      setFormData({});
    } catch (error) {
      alert("Erro ao salvar: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() });
  };

  // Styles
  const inputStyle = "border dark:border-slate-600 bg-white dark:bg-slate-800 p-2 rounded outline-none focus:border-accent text-slate-800 dark:text-slate-200";

  const renderTable = () => {
    let currentData: any[] = [];
    switch(activeTab) {
      case 'empresas': currentData = companies; break;
      case 'mecanicos': currentData = technicians; break;
      case 'setores': currentData = sectors; break;
      case 'tipos': currentData = types; break;
      case 'equipamentos': currentData = equipments; break;
    }

    const commonActionCell = (item: any) => (
      <td className="p-3 text-right whitespace-nowrap">
        <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mr-2" disabled={loading}>
          <Pencil size={16}/>
        </button>
        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300" disabled={loading}>
          <Trash2 size={16}/>
        </button>
      </td>
    );

    const tableHeaderClass = "bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600 text-accent";

    switch (activeTab) {
      case 'empresas':
        return (
          <table className="w-full text-left text-sm">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="p-3 font-bold">CÓDIGO</th>
                <th className="p-3 font-bold">NOME</th>
                <th className="p-3 font-bold">CNPJ/CPF</th>
                <th className="p-3 font-bold">CIDADE</th>
                <th className="p-3 font-bold">CONTATO</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {currentData.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3">{c.codigo}</td>
                  <td className="p-3 font-medium">{c.nome}</td>
                  <td className="p-3">{c.cpfCnpj}</td>
                  <td className="p-3">{c.cidade}</td>
                  <td className="p-3">{c.contato}</td>
                  {commonActionCell(c)}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'mecanicos':
        return (
          <table className="w-full text-left text-sm">
             <thead className={tableHeaderClass}>
              <tr>
                <th className="p-3 font-bold">CÓDIGO</th>
                <th className="p-3 font-bold">NOME</th>
                <th className="p-3 font-bold">EMPRESA</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {currentData.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3">{t.codigo}</td>
                  <td className="p-3 font-medium">{t.nome}</td>
                  <td className="p-3">{companies.find(c => c.id === t.empresaId)?.nome || t.empresaId}</td>
                  {commonActionCell(t)}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'setores':
        return (
          <table className="w-full text-left text-sm">
             <thead className={tableHeaderClass}>
              <tr>
                <th className="p-3 font-bold">CÓDIGO</th>
                <th className="p-3 font-bold">NOME</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {currentData.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3">{s.codigo}</td>
                  <td className="p-3 font-medium">{s.nome}</td>
                  {commonActionCell(s)}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'tipos':
        return (
          <table className="w-full text-left text-sm">
             <thead className={tableHeaderClass}>
              <tr>
                <th className="p-3 font-bold">CÓDIGO</th>
                <th className="p-3 font-bold">TIPO</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {currentData.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3">{t.codigo}</td>
                  <td className="p-3 font-medium">{t.tipo}</td>
                  {commonActionCell(t)}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'equipamentos':
        return (
          <table className="w-full text-left text-sm">
             <thead className={tableHeaderClass}>
              <tr>
                <th className="p-3 font-bold">CÓDIGO</th>
                <th className="p-3 font-bold">DESCRIÇÃO</th>
                <th className="p-3 font-bold">TIPO</th>
                <th className="p-3 font-bold">MARCA</th>
                <th className="p-3 font-bold">MODELO</th>
                <th className="p-3 font-bold">ANO</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {currentData.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 font-bold text-accent">{e.codigo}</td>
                  <td className="p-3 font-medium">{e.descricao}</td>
                  <td className="p-3">{e.tipo}</td>
                  <td className="p-3">{e.marca}</td>
                  <td className="p-3">{e.modelo}</td>
                  <td className="p-3">{e.ano}</td>
                  {commonActionCell(e)}
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" autoComplete="off">
        {activeTab === 'empresas' && (
          <>
            <input name="codigo" value={formData.codigo || ''} placeholder="CÓDIGO" required onChange={handleInputChange} className={inputStyle} />
            <input name="nome" value={formData.nome || ''} placeholder="NOME" required onChange={handleInputChange} className={inputStyle} />
            <input name="cpfCnpj" value={formData.cpfCnpj || ''} placeholder="CPF/CNPJ" onChange={handleInputChange} className={inputStyle} />
            <input name="cidade" value={formData.cidade || ''} placeholder="CIDADE" onChange={handleInputChange} className={inputStyle} />
            <input name="contato" value={formData.contato || ''} placeholder="CONTATO" onChange={handleInputChange} className={inputStyle} />
          </>
        )}
        {activeTab === 'mecanicos' && (
          <>
            <input name="codigo" value={formData.codigo || ''} placeholder="CÓDIGO" required onChange={handleInputChange} className={inputStyle} />
            <input name="nome" value={formData.nome || ''} placeholder="NOME" required onChange={handleInputChange} className={inputStyle} />
            <select name="empresaId" value={formData.empresaId || ''} required onChange={handleInputChange} className={inputStyle}>
              <option value="">SELECIONE EMPRESA</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </>
        )}
        {activeTab === 'setores' && (
          <>
            <input name="codigo" value={formData.codigo || ''} placeholder="CÓDIGO" required onChange={handleInputChange} className={inputStyle} />
            <input name="nome" value={formData.nome || ''} placeholder="NOME" required onChange={handleInputChange} className={inputStyle} />
          </>
        )}
        {activeTab === 'tipos' && (
          <>
            <input name="codigo" value={formData.codigo || ''} placeholder="CÓDIGO" required onChange={handleInputChange} className={inputStyle} />
            <input name="tipo" value={formData.tipo || ''} placeholder="TIPO (DESC)" required onChange={handleInputChange} className={inputStyle} />
          </>
        )}
        {activeTab === 'equipamentos' && (
          <>
            <input name="codigo" value={formData.codigo || ''} placeholder="CÓDIGO" required onChange={handleInputChange} className={inputStyle} />
            <input name="descricao" value={formData.descricao || ''} placeholder="DESCRIÇÃO" required onChange={handleInputChange} className={inputStyle} />
            <input name="tipo" value={formData.tipo || ''} placeholder="TIPO (CATEGORIA)" onChange={handleInputChange} className={inputStyle} />
            <input name="marca" value={formData.marca || ''} placeholder="MARCA" onChange={handleInputChange} className={inputStyle} />
            <input name="modelo" value={formData.modelo || ''} placeholder="MODELO" onChange={handleInputChange} className={inputStyle} />
            <input name="ano" value={formData.ano || ''} placeholder="ANO" onChange={handleInputChange} className={inputStyle} />
          </>
        )}
        
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={() => { setIsAdding(false); setFormData({}); }} disabled={loading} className="dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">CANCELAR</Button>
          <Button type="submit" isLoading={loading} className="bg-accent hover:bg-accentHover">SALVAR</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
       {/* Header Business Style */}
       <div className="bg-white dark:bg-slate-800 border-b-4 border-b-accent rounded-t-xl rounded-b-lg p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg text-accent bg-accent/10 dark:bg-accent/20">
              <Users size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">Cadastros Gerais</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase">
                Gerencie as tabelas auxiliares do sistema.
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={refreshData} disabled={loading} title="Atualizar Dados" className="text-accent bg-accent/5 dark:bg-slate-700/50 hover:bg-accent/10 border border-accent/10 dark:border-slate-600">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             <span className="ml-2">ATUALIZAR</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-1 flex overflow-x-auto transition-colors">
        {(['empresas', 'mecanicos', 'setores', 'tipos', 'equipamentos'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 font-bold text-xs uppercase transition-all whitespace-nowrap rounded-md ${
              activeTab === tab 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'tipos' ? 'TIPOS MANUT.' : tab}
          </button>
        ))}
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
           <h3 className="text-lg font-bold uppercase text-slate-700 dark:text-slate-200 flex items-center gap-2">
             <Database size={18} className="text-accent" />
             {activeTab === 'tipos' ? 'TIPOS DE MANUTENÇÃO' : activeTab}
           </h3>
           {!isAdding && (
             <Button onClick={() => setIsAdding(true)} className="text-xs py-2 px-4 bg-accent hover:bg-accentHover" disabled={loading}>
               <Plus size={16} /> NOVO CADASTRO
             </Button>
           )}
        </div>

        {isAdding ? (
          <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-lg border border-slate-200 dark:border-slate-600 mb-4 animate-fade-in">
             <h4 className="text-sm font-bold text-accent uppercase mb-4 flex items-center gap-2">
               <Settings size={16} />
               {formData.id ? 'EDITAR REGISTRO' : 'NOVO REGISTRO'}
             </h4>
             {renderForm()}
          </div>
        ) : (
           <div className="overflow-x-auto">
             {renderTable()}
           </div>
        )}
      </Card>
    </div>
  );
};

export default CadastrosPage;