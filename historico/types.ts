export enum Status {
  PENDING = 'Pendente',
  COMPLETED = 'Concluído'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Company {
  id: string;
  codigo: string;
  nome: string;
  cpfCnpj: string;
  cidade: string;
  contato: string;
}

export interface Technician {
  id: string;
  codigo: string;
  nome: string;
  empresaId: string;
}

export interface Sector {
  id: string;
  codigo: string;
  nome: string;
}

export interface MaintenanceType {
  id: string;
  codigo: string;
  tipo: string;
}

export interface Equipment {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  marca: string;
  modelo: string;
  ano: string;
}

export interface MaintenanceRecord {
  id: string;
  equipamentoId: string;
  horimetroKm: number;
  horaChegada: string;
  dataInicial: string; // YYYY-MM-DD
  dataFinal: string | null; // YYYY-MM-DD or empty string
  empresaId: string;
  tipoManutencaoId: string;
  setorId: string;
  documentacaoOS: string;
  mecanicoId: string;
  defeitoFalha: string;
  causaDiagnostico: string;
  dicasManutencao: string;
  pecasUtilizadas: string;
  solucaoProcedimentos: string;
  outrosProblemas: string;
  valor: number;
  
  // Helper for UI logic (derived)
  status?: Status; 
  isLocal?: boolean;
}

export interface DashboardMetrics {
  totalRepairs: number;
  openTickets: number;
  avgResolutionTime: string;
  topDefect: string;
}