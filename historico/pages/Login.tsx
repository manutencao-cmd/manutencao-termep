
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Estado para o relógio
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha no login');
    }
  };

  // Formatação de data e hora
  const dateString = currentTime.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = currentTime.toLocaleTimeString('pt-BR');

  return (
    <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="z-10 mt-10">
           {/* Substituição da Logo por Texto e Data/Hora */}
           <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-6 border-l-8 border-accent pl-6">
             HISTÓRICO DE<br/>MANUTENÇÃO<br/>
             <span className="text-accent">TERMEP</span>
           </h1>
           
           <div className="pl-8 animate-fade-in">
             <p className="text-xl text-slate-300 font-medium capitalize">
               {dateString}
             </p>
             <p className="text-5xl font-mono font-bold text-white mt-2 tracking-wide">
               {timeString}
             </p>
           </div>
        </div>

        <div className="z-10 space-y-6 max-w-md pl-8">
          <p className="text-lg text-slate-400 border-t border-slate-700 pt-6">
            Gestão Inteligente de Frota e Equipamentos.<br/>
            Controle total da operação em um só lugar.
          </p>
        </div>

        <div className="z-10 text-xs text-slate-500 uppercase font-bold tracking-widest pl-8">
          Desenvolvido por Mágno Vieira - 2025
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 opacity-90 z-0"></div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse z-0"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Acesso Restrito</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Faça login para acessar o sistema</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-white normal-case"
                  placeholder="manutencao@termep.com.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-white normal-case"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 bg-accent hover:bg-accentHover text-white text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              isLoading={isLoading}
            >
              ENTRAR NO SISTEMA
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Esqueceu a senha? Contate o administrador.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
