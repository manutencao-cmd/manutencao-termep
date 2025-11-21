
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

// Type definitions for API responses
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Helper to retrieve mock data based on tab name
const getMockData = (params: any): any => {
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

// Generic API Request Handler with better error handling
const apiRequest = async (method: 'GET' | 'POST', params: any): Promise<any> => {
  // Check if URL is configured
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('INSIRA_SUA_URL')) {
    console.warn('Google Script URL not configured, using mock data');
    return getMockData(params);
  }

  try {
    let response: Response;
    
    if (method === 'GET') {
      const url = `${GOOGLE_SCRIPT_URL}?tab=${params.tab}`;
      const fetchOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      // Add timeout support with fallback for older browsers
      if (AbortSignal && (AbortSignal as any).timeout) {
        fetchOptions.signal = AbortSignal.timeout(10000); // 10 second timeout
      }
      
      response = await fetch(url, fetchOptions);
    } else {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      };
      
      // Add timeout support with fallback for older browsers
      if (AbortSignal && (AbortSignal as any).timeout) {
        fetchOptions.signal = AbortSignal.timeout(10000); // 10 second timeout
      }
      
      response = await fetch(GOOGLE_SCRIPT_URL, fetchOptions);
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.message || 'Erro retornado pela API');
    }
    
    return result.data || result; // Return data if present, otherwise return the whole result
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Request timeout:', error);
    } else {
      console.error('API request error:', error);
    }
    
    console.warn(`Erro na conexão com API (${method} ${params.tab || 'action'}). Usando dados de exemplo/mock.`, error.message);
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
  if (!Array.isArray(rawRecords)) {
    console.warn('History data is not an array, returning empty array');
    return [];
  }
  
  return rawRecords.map((r: any) => {
    // Handle potential null/undefined values with defaults
    const horimetroKm = r.horimetroKm !== undefined && r.horimetroKm !== null ? Number(r.horimetroKm) : 0;
    const valor = r.valor !== undefined && r.valor !== null ? Number(r.valor) : 0;
    
    // Ensure dates are properly formatted
    let dataInicial = '';
    let dataFinal: string | null = null;
    
    if (r.dataInicial) {
      // Handle various date formats
      const dateStr = String(r.dataInicial);
      if (dateStr.includes('T')) {
        dataInicial = dateStr.split('T')[0];
      } else {
        dataInicial = dateStr;
      }
    }
    
    if (r.dataFinal) {
      const dateStr = String(r.dataFinal);
      if (dateStr.includes('T')) {
        dataFinal = dateStr.split('T')[0];
      } else {
        dataFinal = dateStr;
      }
    }
    
    return {
      id: r.id || '',
      equipamentoId: r.equipamentoId || '',
      horimetroKm,
      horaChegada: r.horaChegada || '',
      dataInicial,
      dataFinal,
      empresaId: r.empresaId || '',
      tipoManutencaoId: r.tipoManutencaoId || '',
      setorId: r.setorId || '',
      documentacaoOS: r.documentacaoOS || '',
      mecanicoId: r.mecanicoId || '',
      defeitoFalha: r.defeitoFalha || '',
      causaDiagnostico: r.causaDiagnostico || '',
      dicasManutencao: r.dicasManutencao || '',
      pecasUtilizadas: r.pecasUtilizadas || '',
      solucaoProcedimentos: r.solucaoProcedimentos || '',
      outrosProblemas: r.outrosProblemas || '',
      valor,
      status: dataFinal ? Status.COMPLETED : Status.PENDING
    };
  }).sort((a: MaintenanceRecord, b: MaintenanceRecord) => {
    // Handle potential invalid dates in sorting
    const dateA = a.dataInicial ? new Date(a.dataInicial).getTime() : 0;
    const dateB = b.dataInicial ? new Date(b.dataInicial).getTime() : 0;
    return dateB - dateA; // Sort descending (newest first)
  });
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
