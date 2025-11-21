import React from 'react';
import { LayoutDashboard, PenTool, History, Settings, Database, FileBarChart, Users, Stethoscope, Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'new-entry', label: 'Novo Lançamento', icon: <PenTool size={20} /> },
    { id: 'diagnostics', label: 'Diagnósticos', icon: <Stethoscope size={20} /> },
    { id: 'history', label: 'Histórico', icon: <History size={20} /> },
    { id: 'reports', label: 'Relatórios', icon: <FileBarChart size={20} /> },
    { id: 'cadastros', label: 'Cadastros', icon: <Users size={20} /> },
    { id: 'database', label: 'Dados (Sheets)', icon: <Database size={20} /> },
  ];

  return (
    <div className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0 z-20 shadow-xl border-r border-slate-700/50">
      <div className="p-6 border-b border-slate-700 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">MANUTENÇÃO PRO</h1>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-yellow-400 transition-colors"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 -mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Conectado ao Google Sheets</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.id 
                ? 'bg-accent text-white shadow-md' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium uppercase text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 bg-slate-800/30">
         {/* User Info */}
         <div className="flex items-center gap-3 mb-4 px-2">
           <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
             <UserIcon size={16} />
           </div>
           <div className="overflow-hidden">
             <p className="text-sm font-bold text-white truncate">{user?.name || 'Usuário'}</p>
             <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
           </div>
         </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-bold uppercase"
        >
          <LogOut size={16} />
          SAIR DO SISTEMA
        </button>

        <div className="mt-4 px-4 text-[10px] text-slate-500 font-bold tracking-wider uppercase opacity-70 border-t border-slate-700/50 pt-4">
          CRIADO POR MÁGNO VIEIRA - 11-2025
        </div>
      </div>
    </div>
  );
};

export default Sidebar;