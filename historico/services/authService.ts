
import { MOCK_USERS } from '../constants';
import { User } from '../types';

// Simula um delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800); // Simula tempo de requisição

    // Simulação de Login (Em produção, isso chamaria o Google Script)
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Credenciais inválidas. Tente manutencao@termep.com.br / termep123');
    }

    // Retorna o usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  logout: async () => {
    await delay(200);
    // Limpezas necessárias se houver backend
  }
};
