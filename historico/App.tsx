import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import HistoryPage from './pages/History';
import ReportsPage from './pages/Reports';
import CadastrosPage from './pages/Cadastros';
import DiagnosticsPage from './pages/Diagnostics';
import Login from './pages/Login';
import { Equipment, Technician, MaintenanceRecord, Sector, Company, MaintenanceType } from './types';
import { fetchEquipment, fetchTechnicians, fetchHistory, saveRecord, updateHistoryRecord, deleteHistoryRecord, fetchSectors, fetchCompanies, fetchMaintenanceTypes } from './services/sheetService';
import { ExternalLink } from 'lucide-react';
import { SHEET_ID } from './constants';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for editing a record
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  // Load data only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const [eq, tec, his, sec, comp, types] = await Promise.all([
          fetchEquipment(),
          fetchTechnicians(),
          fetchHistory(),
          fetchSectors(),
          fetchCompanies(),
          fetchMaintenanceTypes()
        ]);
        setEquipments(eq);
        setTechnicians(tec);
        setHistory(his);
        setSectors(sec);
        setCompanies(comp);
        setMaintenanceTypes(types);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated]);

  // Function to refresh data when changes occur in Cadastros
  const refreshData = async () => {
    try {
      const [eq, tec, sec, comp, types] = await Promise.all([
        fetchEquipment(),
        fetchTechnicians(),
        fetchSectors(),
        fetchCompanies(),
        fetchMaintenanceTypes()
      ]);
      setEquipments(eq);
      setTechnicians(tec);
      setSectors(sec);
      setCompanies(comp);
      setMaintenanceTypes(types);
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  };

  const handleSaveRecord = async (record: MaintenanceRecord) => {
    await saveRecord(record);
    const updatedHistory = await fetchHistory();
    setHistory(updatedHistory);
    setCurrentPage('history');
  };

  const handleUpdateRecord = async (record: MaintenanceRecord) => {
    await updateHistoryRecord(record);
    const updatedHistory = await fetchHistory();
    setHistory(updatedHistory);
    setEditingRecord(null);
    setCurrentPage('history');
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryRecord(id);
    const updatedHistory = await fetchHistory();
    setHistory(updatedHistory);
  };

  const handleEditHistory = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setCurrentPage('new-entry');
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setCurrentPage('history');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            records={history} 
            equipments={equipments}
            technicians={technicians}
            sectors={sectors}
            maintenanceTypes={maintenanceTypes}
          />
        );
      case 'new-entry':
        return (
          <NewEntry 
            equipments={equipments} 
            technicians={technicians} 
            onSave={handleSaveRecord}
            onUpdate={handleUpdateRecord}
            onCancel={handleCancel}
            initialData={editingRecord}
          />
        );
      case 'diagnostics':
        return (
          <DiagnosticsPage 
            records={history} 
            equipments={equipments} 
            sectors={sectors} 
          />
        );
      case 'history':
        return (
          <HistoryPage 
            records={history} 
            equipments={equipments} 
            technicians={technicians} 
            onEdit={handleEditHistory}
            onDelete={handleDeleteHistory}
          />
        );
      case 'reports':
        return (
          <ReportsPage 
            records={history} 
            equipments={equipments} 
            technicians={technicians} 
            sectors={sectors}
            maintenanceTypes={maintenanceTypes}
          />
        );
      case 'cadastros':
        return (
          <CadastrosPage 
            companies={companies} 
            technicians={technicians} 
            sectors={sectors} 
            types={maintenanceTypes}
            equipments={equipments}
            refreshData={refreshData}
          />
        );
      case 'database':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <ExternalLink size={48} className="text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Banco de Dados Google Sheets</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              O sistema está integrado à planilha ID: <br/>
              <code className="bg-slate-100 dark:bg-slate-800 p-1 rounded text-xs select-all">{SHEET_ID}</code>
            </p>
            <a 
              href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Acessar Planilha
            </a>
          </div>
        );
      default:
        return <Dashboard records={history} equipments={equipments} technicians={technicians} sectors={sectors} maintenanceTypes={maintenanceTypes} />;
    }
  };

  // Se não estiver autenticado, mostra Login
  if (!isAuthenticated) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse text-xl font-medium">Carregando Sistema...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900 font-sans uppercase transition-colors duration-300">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen text-slate-800 dark:text-slate-200">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;