import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className = "",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Encontra a label da opção selecionada
  const selectedOption = options.find(opt => opt.value === value);

  // Atualiza o termo de busca quando o valor externo muda (ex: resetar formulário)
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Se fechou e não tem valor selecionado válido, reverte o texto para o selecionado ou vazio
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm('');
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (opt: Option) => {
    onChange(opt.value);
    setSearchTerm(opt.label);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        className={`relative w-full border rounded-lg flex items-center transition-colors 
        bg-white dark:bg-slate-800 
        ${isOpen ? 'border-accent ring-1 ring-accent' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'} 
        ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : 'cursor-text'}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <input
          type="text"
          className={`w-full p-2.5 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg ${disabled ? 'cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // Se o usuário apagar tudo, limpa o valor selecionado
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          required={required && !value} // HTML validation trick
        />
        
        <div className="flex items-center pr-2 gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 p-1"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  opt.value === value 
                  ? 'bg-accent/10 text-accent font-bold' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-400 text-center italic">
              Nenhuma opção encontrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;