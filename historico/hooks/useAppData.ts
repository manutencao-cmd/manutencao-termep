import { useState, useEffect } from 'react';
import { 
  Equipment, 
  Technician, 
  MaintenanceRecord, 
  Sector, 
  Company, 
  MaintenanceType 
} from '../types';
import { 
  fetchEquipment, 
  fetchTechnicians, 
  fetchHistory, 
  fetchSectors, 
  fetchCompanies, 
  fetchMaintenanceTypes,
  saveRecord,
  updateHistoryRecord,
  deleteHistoryRecord
} from '../services/sheetService';

export const useAppData = (isAuthenticated: boolean) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  const refreshHistory = async () => {
    try {
      const updatedHistory = await fetchHistory();
      setHistory(updatedHistory);
    } catch (err) {
      console.error("Failed to refresh history", err);
    }
  };

  const handleSaveRecord = async (record: MaintenanceRecord) => {
    await saveRecord(record);
    await refreshHistory();
  };

  const handleUpdateRecord = async (record: MaintenanceRecord) => {
    await updateHistoryRecord(record);
    await refreshHistory();
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryRecord(id);
    await refreshHistory();
  };

  return {
    // Data
    equipments,
    technicians,
    sectors,
    companies,
    maintenanceTypes,
    history,
    loading,
    
    // Functions
    refreshData,
    handleSaveRecord,
    handleUpdateRecord,
    handleDeleteHistory,
    refreshHistory
  };
};

// Separate hook for handling record operations with navigation
export const useRecordOperations = (refreshHistory: () => Promise<void>, setCurrentPage: (page: string) => void) => {
  const handleSaveRecord = async (record: MaintenanceRecord) => {
    try {
      await saveRecord(record);
      await refreshHistory();
      setCurrentPage('history');
    } catch (error) {
      console.error('Error saving record:', error);
      throw error;
    }
  };

  const handleUpdateRecord = async (record: MaintenanceRecord) => {
    try {
      await updateHistoryRecord(record);
      await refreshHistory();
      setCurrentPage('history');
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  return {
    handleSaveRecord,
    handleUpdateRecord
  };
};