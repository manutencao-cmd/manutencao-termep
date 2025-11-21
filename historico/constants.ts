
export const SHEET_ID = '14pmJW0Fwedj-liQzxZAAVGVDPPxK2zOLC1gtu3Mj0-I';

// COLOQUE A URL DO SEU WEB APP DO GOOGLE APPS SCRIPT AQUI
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycz5qncrcYHHzhZ8K3IvUyR26pAj2EZO6j-BEepOMxuGKA8iJ7rMb5Bh0mvdV_lcwC/exec';

export const TAB_NAMES = {
  LANCAMENTOS: 'Lancamentos',
  EQUIPAMENTOS: 'Equipamentos',
  TECNICOS: 'Tecnicos',
  DEFEITOS: 'Defeitos',
  SETORES: 'Setores',
  EMPRESAS: 'Empresas',
  TIPOS: 'Tipos'
};

// --- MOCK DATA FOR FALLBACK (OFFLINE MODE) ---

export const MOCK_USERS = [
  { id: '1', name: 'Administrador', email: 'manutencao@termep.com.br', password: 'termep123', role: 'admin' },
  { id: '2', name: 'Operador', email: 'user@termep.com', password: '123', role: 'user' }
];

export const MOCK_EQUIPMENT = [
  { id: '1', codigo: 'EQ-001', descricao: 'ESCAVADEIRA CAT 320', tipo: 'PESADO', marca: 'CATERPILLAR', modelo: '320', ano: '2022' },
  { id: '2', codigo: 'EQ-002', descricao: 'CAMINHÃO VOLVO VM', tipo: 'CAMINHAO', marca: 'VOLVO', modelo: 'VM 270', ano: '2020' },
  { id: '3', codigo: 'EQ-003', descricao: 'GERADOR 150KVA', tipo: 'GERADOR', marca: 'STEMAC', modelo: 'ST150', ano: '2019' },
  { id: '4', codigo: 'EQ-004', descricao: 'COMPRESSOR ATLAS', tipo: 'COMPRESSOR', marca: 'ATLAS COPCO', modelo: 'XAS', ano: '2021' },
  { id: '5', codigo: 'EQ-005', descricao: 'EMPILHADEIRA HYSTER', tipo: 'EMPILHADEIRA', marca: 'HYSTER', modelo: 'H50', ano: '2018' }
];

export const MOCK_TECHS = [
  { id: '1', codigo: 'TEC-01', nome: 'JOÃO SILVA', empresaId: '1' },
  { id: '2', codigo: 'TEC-02', nome: 'PEDRO SANTOS', empresaId: '1' },
  { id: '3', codigo: 'TEC-03', nome: 'CARLOS OLIVEIRA', empresaId: '1' },
  { id: '4', codigo: 'TEC-04', nome: 'ANA PEREIRA', empresaId: '1' }
];

export const MOCK_SECTORS = [
  { id: '1', codigo: 'SET-01', nome: 'OPERAÇÃO MINA' },
  { id: '2', codigo: 'SET-02', nome: 'TRANSPORTE' },
  { id: '3', codigo: 'SET-03', nome: 'OFICINA CENTRAL' },
  { id: '4', codigo: 'SET-04', nome: 'ADMINISTRATIVO' },
  { id: '5', codigo: 'SET-05', nome: 'AR CONDICIONADO' }
];

export const MOCK_COMPANIES = [
  { id: '1', codigo: 'EMP-01', nome: 'TERMEP ENGENHARIA', cpfCnpj: '00.000.000/0001-00', cidade: 'SÃO PAULO', contato: 'ADMIN' },
  { id: '2', codigo: 'EMP-02', nome: 'TERCEIRIZADA A', cpfCnpj: '11.111.111/0001-11', cidade: 'RIO DE JANEIRO', contato: 'SUPORTE' }
];

export const MOCK_MAINTENANCE_TYPES = [
  { id: '1', codigo: 'TM-01', tipo: 'MANUTENÇÃO PREVENTIVA' },
  { id: '2', codigo: 'TM-02', tipo: 'MANUTENÇÃO CORRETIVA' },
  { id: '3', codigo: 'TM-03', tipo: 'INSPEÇÃO DIÁRIA' },
  { id: '4', codigo: 'TM-04', tipo: 'LUBRIFICAÇÃO' }
];

export const MOCK_HISTORY = [
  {
    id: '101',
    equipamentoId: '1',
    horimetroKm: 5000,
    horaChegada: '08:00',
    dataInicial: '2023-11-15',
    dataFinal: '2023-11-15',
    empresaId: '1',
    tipoManutencaoId: '1',
    setorId: '1',
    documentacaoOS: 'OS-2023-001',
    mecanicoId: '1',
    defeitoFalha: 'TROCA DE ÓLEO PROGRAMADA',
    causaDiagnostico: 'MANUTENÇÃO PREVENTIVA',
    dicasManutencao: 'VERIFICAR FILTROS AR',
    pecasUtilizadas: 'ÓLEO 15W40, FILTRO COMBUSTÍVEL',
    solucaoProcedimentos: 'REALIZADA TROCA DE ÓLEO E FILTROS',
    outrosProblemas: '',
    valor: 1500
  },
  {
    id: '102',
    equipamentoId: '2',
    horimetroKm: 120000,
    horaChegada: '14:00',
    dataInicial: '2023-11-16',
    dataFinal: '',
    empresaId: '1',
    tipoManutencaoId: '2',
    setorId: '2',
    documentacaoOS: 'OS-2023-002',
    mecanicoId: '2',
    defeitoFalha: 'FREIO FAZENDO BARULHO',
    causaDiagnostico: 'PASTILHAS GASTAS',
    dicasManutencao: '',
    pecasUtilizadas: 'PASTILHAS DE FREIO',
    solucaoProcedimentos: 'TROCA DAS PASTILHAS DIANTEIRAS',
    outrosProblemas: 'DISCOS COM DESGASTE LEVE',
    valor: 800
  },
  {
    id: '103',
    equipamentoId: '3',
    horimetroKm: 200,
    horaChegada: '09:00',
    dataInicial: '2023-11-17',
    dataFinal: '2023-11-17',
    empresaId: '1',
    tipoManutencaoId: '2',
    setorId: '5',
    documentacaoOS: 'OS-2023-003',
    mecanicoId: '3',
    defeitoFalha: 'NÃO GELA',
    causaDiagnostico: 'GÁS REFRIGERANTE BAIXO',
    dicasManutencao: 'VERIFICAR VAZAMENTOS',
    pecasUtilizadas: 'GÁS R134A',
    solucaoProcedimentos: 'RECARGA DE GÁS E TESTE DE PRESSÃO',
    outrosProblemas: '',
    valor: 1200
  }
];
