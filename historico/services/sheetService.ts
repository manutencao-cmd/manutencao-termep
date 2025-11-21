
import { Equipment, MaintenanceRecord, Status, Technician, Sector, Company, MaintenanceType } from '../types';
import { 
  GOOGLE_SCRIPT_URL, 
  TAB_NAMES,
  MOCK_EQUIPMENT, 
  MOCK_TECHS, 
  MOCK_SECTORS, 
  MOCK_COMPANIES, 
  MOCK_MAINTENANCE_TYPES, 
  MOCK_HISTORY
} from '../constants';

// Helper to retrieve mock data based on tab name
const getMockData = (params: any) => {
  console.info(`⚠️ Using Mock Data for ${params.tab || params.action}`);
  if (params.tab === TAB_NAMES.EQUIPAMENTOS) return MOCK_EQUIPMENT;
  if (params.tab === TAB_NAMES.TECNICOS) return MOCK_TECHS;
  if (params.tab === TAB_NAMES.SETORES) return MOCK_SECTORS;
  if (params.tab === TAB_NAMES.EMPRESAS) return MOCK_COMPANIES;
  if (params.tab === TAB_NAMES.TIPOS) return MOCK_MAINTENANCE_TYPES;
  if (params.tab === TAB_NAMES.LANCAMENTOS) return MOCK_HISTORY;
  
  // For actions like create/update/delete in mock mode
  return { status: 'success', message: 'Operação simulada com sucesso (Modo Offline)' };
};

// Generic API Request Handler
const apiRequest = async (method: 'GET' | 'POST', params: any) => {
  // Check if URL is configured
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('INSIRA_SUA_URL')) {
    return getMockData(params);
  }

  try {
    if (method === 'GET') {
      const url = `${GOOGLE_SCRIPT_URL}?tab=${params.tab}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      return await response.json();
    } else {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(params),
        // Avoid CORS preflight issues with simple content type if supported by backend, 
        // otherwise standard fetch. 
      });
      const json = await response.json();
      if (json.status === 'error') throw new Error(json.message);
      return json;
    }
  } catch (error) {
    console.warn(`Erro na conexão com API (${method} ${params.tab || 'action'}). Usando dados de exemplo/mock.`, error);
    return getMockData(params);
  }
};

// --- Fetchers ---

export const fetchEquipment = async (): Promise<Equipment[]> => {
  return apiRequest('GET', { tab: TAB_NAMES.EQUIPAMENTOS });
};

export const fetchTechnicians = async (): Promise<Technician[]> => {
  return apiRequest('GET', { tab: TAB_NAMES.TECNICOS });
};

export const fetchSectors = async (): Promise<Sector[]> => {
  return apiRequest('GET', { tab: TAB_NAMES.SETORES });
};

export const fetchCompanies = async (): Promise<Company[]> => {
  return apiRequest('GET', { tab: TAB_NAMES.EMPRESAS });
};

export const fetchMaintenanceTypes = async (): Promise<MaintenanceType[]> => {
  return apiRequest('GET', { tab: TAB_NAMES.TIPOS });
};

export const fetchHistory = async (): Promise<MaintenanceRecord[]> => {
  const rawRecords = await apiRequest('GET', { tab: TAB_NAMES.LANCAMENTOS });
  
  // Parse and format incoming data to match types
  return Array.isArray(rawRecords) ? rawRecords.map((r: any) => ({
    ...r,
    horimetroKm: Number(r.horimetroKm),
    valor: Number(r.valor),
    // Ensure dates are strings YYYY-MM-DD
    dataInicial: r.dataInicial ? String(r.dataInicial).split('T')[0] : '',
    dataFinal: r.dataFinal ? String(r.dataFinal).split('T')[0] : null,
    status: r.dataFinal ? Status.COMPLETED : Status.PENDING
  })).sort((a: MaintenanceRecord, b: MaintenanceRecord) => {
    const dateA = new Date(a.dataInicial).getTime();
    const dateB = new Date(b.dataInicial).getTime();
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  }) : [];
};

// --- Actions ---

// Helper to map the legacy keys to Tab Names
const mapKeyToTab = (key: string) => {
  if (key.includes('companies')) return TAB_NAMES.EMPRESAS;
  if (key.includes('technicians')) return TAB_NAMES.TECNICOS;
  if (key.includes('sectors')) return TAB_NAMES.SETORES;
  if (key.includes('types')) return TAB_NAMES.TIPOS;
  if (key.includes('equipment')) return TAB_NAMES.EQUIPAMENTOS;
  return key; // Fallback
};

export const createItem = async (tableInfo: string, item: any) => {
  const tabName = mapKeyToTab(tableInfo);
  return apiRequest('POST', { action: 'create', tab: tabName, data: item });
};

export const updateItem = async (tableInfo: string, item: any) => {
  const tabName = mapKeyToTab(tableInfo);
  return apiRequest('POST', { action: 'update', tab: tabName, data: item });
};

export const deleteItem = async (tableInfo: string, id: string) => {
  const tabName = mapKeyToTab(tableInfo);
  return apiRequest('POST', { action: 'delete', tab: tabName, id: id });
};

// --- History Specifics ---

export const saveRecord = async (record: MaintenanceRecord): Promise<void> => {
  await apiRequest('POST', {
    action: 'create',
    tab: TAB_NAMES.LANCAMENTOS,
    data: record
  });
};

export const updateHistoryRecord = async (record: MaintenanceRecord): Promise<void> => {
  await apiRequest('POST', {
    action: 'update',
    tab: TAB_NAMES.LANCAMENTOS,
    data: record
  });
};

export const deleteHistoryRecord = async (id: string): Promise<void> => {
  await apiRequest('POST', {
    action: 'delete',
    tab: TAB_NAMES.LANCAMENTOS,
    id: id
  });
};
